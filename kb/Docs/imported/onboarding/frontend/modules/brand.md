---
type: Document
title: "Brand Module"
---

# Brand Module

> Backend root: `/d/Projects/caboodle.backend`. Every claim below cites `path.cs:line` relative to that root. Where the code does not make something clear, this document says so explicitly rather than guessing.

## Purpose

A **Brand** is the central tenant of the Caboodle platform — the top-level entity that a Brand Owner (and their sub-users) or a Broker works "inside of." Almost all other data (CRM records, products, reports, promotions, trade-spend) is scoped to a Brand. This module defines what a Brand is, who is linked to it (owners, sub-users, brokers), and how Brands are created, updated, deleted, and assigned to people.

The Brand entity is marked `IAggregateRoot`, i.e. it is a top-level record other data hangs off of (`caboodle/src/Modules/Brand/Modules.Brand.Domain/Brand/Brand.cs:5`).

## Domain Entities

### Brand (`caboodle/src/Modules/Brand/Modules.Brand.Domain/Brand/Brand.cs`)
The Brand record. Key fields (lines 12-20):
- `UserID` (optional) — the Brand **Owner**'s user id; nullable, so a Brand can exist with no owner (line 12).
- `Name` (required) — the brand name (line 13).
- `Description`, `LogoURL`, `WebURL`, `BannerURL`, `Slug`, `Vendor` — all optional descriptive/branding fields (lines 14-19).
- `IsPartner` — a yes/no flag marking the brand as a partner (line 20).
- Inherits `AuditableEntity`, so it carries created/modified/deleted audit fields and a soft-delete `Deleted` flag (line 5).

### BrandSubUser (`caboodle/src/Modules/Brand/Modules.Brand.Domain/Brand/BrandSubUser.cs`)
A link record joining a **sub-user** to a Brand. Holds only `BrandID` and `UserID` (lines 6-7). Also `AuditableEntity` (soft-deletable) (line 4).

### BrandBroker (`caboodle/src/Modules/Brand/Modules.Brand.Domain/BrandBroker/BrandBroker.cs`)
A link record joining a **Broker** to a Brand. Holds `BrokerID`, `BrandID`, and an optional `ParentBrokerID` (lines 11-13). `ParentBrokerID` is used to model sub-brokers reporting to a parent broker. Also `AuditableEntity` (line 4).

There is no separate "brand-owner link" table — ownership is stored directly on `Brand.UserID`.

## Brand Assignment

Assignment behaves differently depending on the target user's **role**. The main entry point is `AssignBrandToUserRequest` (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/Brands/AssignBrandToUserRequest.cs`), reached via `PUT /assign-user-to-brand` (`caboodle/src/Hosts/API/Controllers/Modules/Brand/BrandsController.cs:211`).

Before assigning, the handler validates that the brand exists and is not deleted (lines 96-102), and that the user exists, is active, and has a confirmed email (lines 104-122). It then branches on the user's first role (lines 124-150):

- **Brand Owner** (`BRANDOWNER`): sets `Brand.UserID` to that user. Fails if the brand already has an owner ("Brand already has Brand Owner") (lines 164-176). So a Brand has at most one owner, stored on the Brand row itself.
- **Brand Sub-User** (`BRANDSUBUSER`): creates a `BrandSubUser` link row and updates the user's hierarchy so their parent is the brand (lines 178-192, 252-266). Fails if the user is already a sub-user of any brand — a sub-user can belong to only one brand (lines 194-204).
- **Broker** (`BROKER`): creates a `BrandBroker` link row with no parent broker (lines 206-221). Fails if that broker is already linked to that brand (lines 223-233).
- **Any other role (treated as broker sub-user)**: creates a `BrandBroker` link row carrying the supplied `ParentBrokerID` (lines 235-250). Note this is the `else` fallback — it runs for any role not matched above, not just an explicit "broker sub-user" role (line 146).

### Owner assignment can also happen at Upsert time
When creating/updating a Brand via `UpsertBrandRequest`, if a `UserID` is supplied the handler validates that user and, if the user is currently `UNASSIGNED`, removes that role and promotes them to `BRANDOWNER` (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/CRUD/UpsertBrandRequest.cs:129-134`). It blocks assigning a user who is already a Brand Owner of another brand, or who is a Broker (lines 75-88).

### Brand ↔ Broker (bulk)
`AssignBrandsToBrokerRequest` links **many brands to one broker** at once (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/BrokerBrand/AssignBrandToBrokerRequest.cs`), reached via `PATCH /assign-brand-to-broker` (`BrandsController.cs:222`). It validates the target is a Broker or Broker Sub-User (lines 152-156), inserts `BrandBroker` rows for brands not already linked (lines 76-92), and — if the target is a top-level broker — also cascades the same brands down to that broker's **sub-brokers** (lines 94-122). Uses raw SQL (Dapper) against the `Brand.Brands` and `Brand.BrandBrokers` tables and a bulk insert (lines 60-135). Related endpoints assign to sub-brokers and remove brand↔broker links (`BrandsController.cs:233,244,255`).

### Removing a user from a brand
`RemoveUserFromBrandRequest` (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/Brands/RemoveUserFromBrandRequest.cs`), via `DELETE /remove-owner-from-brand` (`BrandsController.cs:266`): for a Brand Owner it clears `Brand.UserID` (lines 121-133); for a Brand Sub-User it deletes the `BrandSubUser` link (a hard delete of the link row) and clears the user's hierarchy parent (lines 135-140, 156-170).

## Business Rules & Validation

Validators run automatically before the handler; a failure returns HTTP 400.

- **Upsert:** Brand `Name` is required and non-empty ("Brand name can not be null") (`UpsertBrandRequest.cs:36-41`). On update, the brand must exist and not be soft-deleted, else 404 (lines 94-102). Name is trimmed on save (line 110).
- **Assign user:** `UserID` and `BrandID` both required (`AssignBrandToUserRequest.cs:30-40`). Plus the role-specific rules above (single owner per brand; sub-user in only one brand; no duplicate broker link).
- **Assign brands to broker:** `BrokerID` required (`AssignBrandToBrokerRequest.cs:29-31`); at least one brand must be selected (lines 140-143); every requested brand id must exist or the whole request fails (lines 68-71).
- **Delete:** `BrandID` required (`DeleteBrandRequest.cs:25-28`).

## Key Operations

| Operation | Request | Behavior |
|---|---|---|
| Create / update brand | `UpsertBrandRequest` | Insert or update a Brand; optionally assigns/promotes an owner (`UpsertBrandRequest.cs:62-137`). |
| Assign user to brand | `AssignBrandToUserRequest` | Role-based linking (owner / sub-user / broker / broker-sub-user), see above. |
| Assign brands to broker | `AssignBrandsToBrokerRequest` | Bulk link brands to a broker and cascade to sub-brokers. |
| Remove owner/sub-user | `RemoveUserFromBrandRequest` | Clears owner or deletes sub-user link. |
| Delete brand | `DeleteBrandRequest` | Soft delete — see below. |

### Delete behavior and cascade
`DeleteBrandRequest` (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/CRUD/DeleteBrandRequest.cs`):
- Loads the brand; 404 if already deleted (lines 51-53).
- **Blocks deletion if the brand has any active (non-deleted) Trade Spend promo events** — returns the message "You can not delete this brand. Because it have multiple active promo events" without deleting (lines 55-61). This is the only cascade/guard checked.
- Otherwise performs a **soft delete**: sets `Deleted = true`, `DeletedBy`, `DeletedOn` (lines 63-65).
- **No cascade to CRM records, products, sub-user links, or broker links** is performed here — only the Brand row's `Deleted` flag is set (and the trade-spend guard above). Related data is not soft-deleted or reassigned by this handler.

Two caveats worth flagging to engineering (see Gaps):
1. The handler sets `Deleted = true` but does **not** call any `UpdateAsync`/save on the repository after doing so (contrast the Upsert handler, which explicitly calls `UpdateAsync`, `UpsertBrandRequest.cs:122`). Whether the change is persisted depends on ambient EF change-tracking/`SaveChanges` behavior — **Unclear from code whether the soft delete is actually saved.**
2. `DeleteBrandRequest` is **not wired to any controller endpoint** — there is no delete-brand route in `BrandsController.cs`. So this delete logic appears to be unreachable via the Brand API as written.

## Who Can Access

Permissions come from `[MustHavePermission(action, resource, module)]` → `Permissions.{Module}.{Resource}.{Action}`. The base controller (`VersionedApiController`) carries no `[Authorize]`, so endpoints with no attribute have **no permission gate recorded here** (authentication may still apply elsewhere — not visible in this controller).

| Endpoint | Method | Permission | Notes |
|---|---|---|---|
| `/me` | GET | **none** | No attribute — flagged |
| `/` (all brands) | GET | View Brands (`Brand`/`Brands`/`View`) | `BrandsController.cs:23` |
| `/owners` | GET | View Brands | `:44` |
| `/apl` | POST | **none** | Uses `[BrandIDHeader]`; `:68-71` |
| `/apl/filter-options` | POST | **none** | `:96` |
| `/apl-total-count` | GET | **none** | `:107` |
| `/apl/export` | POST | **none** | `:118` |
| `/apl-activities` | GET | **none** | `:146` |
| `/apl-activities/export` | GET | **none** | `:173` |
| `/` (upsert) | POST | Upsert Brand | `:202` |
| `/assign-user-to-brand` | PUT | Assign BrandAssign (module **Brand**) | `:211-212` |
| `/assign-brand-to-broker` | PATCH | Assign BrandAssign (module **Broker**) | `:222-223` |
| `/assign-brands-to-sub-brokers` | POST | Assign BrandAssign (module **Broker**) | `:233-234` |
| `/remove-brand-from-broker` | DELETE | Assign BrandAssign (module **Broker**) | `:244-245` |
| `/remove-brands-from-broker` | DELETE | Assign BrandAssign (module **Broker**) | `:255-256` |
| `/remove-owner-from-brand` | DELETE | Assign BrandAssign (module **Brand**) | `:266-267` |
| `/import` | POST | Import MasterDataUpload (module DataUpload) | `:277-279` |
| `/export` | GET | Export MasterDataUpload (module DataUpload) | `:288-289` |

Roles: `ADMIN` holds all permissions; `BRANDOWNER` / `BRANDSUBUSER` are seeded elsewhere (outside this module). Several read-only APL/activity endpoints have **no permission attribute** — flagged above.

## Dependencies

- **Identity / Users:** `UserManager<ApplicationUser>` for role checks and role promotion (`UpsertBrandRequest.cs:49`, `AssignBrandToUserRequest.cs:52`); `ICurrentUser` for audit stamping.
- **Trade Spend module:** delete guard reads `TradeSpendPromo` (`DeleteBrandRequest.cs:36`, project reference in `Modules.Brand.Application.csproj`).
- **User Hierarchy:** `IRepository<UserHierarchy>` updated when assigning/removing sub-users (`AssignBrandToUserRequest.cs:51`).
- **Data access:** EF via `IRepository<T>` (Upsert, Assign-user, Remove-user); raw SQL via `IDapperRepository` plus `IBulkRepository` for bulk broker assignment (`AssignBrandToBrokerRequest.cs:41-42`).
- **Postgres multi-schema:** brand tables live in the `Brand` schema — e.g. `"Brand"."Brands"`, `"Brand"."BrandBrokers"` (`AssignBrandToBrokerRequest.cs:175,177`).
- **DataUpload module:** import/export of brands from the admin side (`BrandsController.cs:5-6,277,288`).

## Gaps, TODOs & Inconsistencies

1. **Delete endpoint missing.** `DeleteBrandRequest` and its handler exist but no controller route sends it — the delete flow is not reachable via the Brand API. (`DeleteBrandRequest.cs`; no match in `BrandsController.cs`.)
2. **Delete may not persist.** The delete handler sets `Deleted = true` but never calls `UpdateAsync`/save — Unclear from code whether the soft delete is actually written to the database (`DeleteBrandRequest.cs:63-67`).
3. **No cascade on delete.** Deleting a brand does not soft-delete or reassign CRM, product, sub-user, or broker-link records; only the brand row is flagged, and only trade-spend promos are checked as a blocker (`DeleteBrandRequest.cs:55-65`).
4. **Duplicate/typo project file.** Alongside `Modules.Brand.Application.csproj` there is a stray `Modules.Brands.Application.csproj` (note the extra "s"). It references a non-existent `Modules.Brands.Domain.csproj` (the real file is `Modules.Brand.Domain.csproj`), so this duplicate project is broken and appears unused — likely a leftover to remove. (`Modules.Brand/Modules.Brand.Application/Modules.Brands.Application.csproj`.)
5. **Namespace vs. folder mismatch.** Folders/projects are singular "Brand" but the C# namespace is `Caboodle.Modules.Brands` (plural) throughout (e.g. `Brand.cs:3`). Cosmetic, but a source of confusion.
6. **Role branching fallback is broad.** In `AssignBrandToUserRequest`, any role that is not owner/sub-user/broker falls into the "broker sub-user" branch rather than being rejected (`AssignBrandToUserRequest.cs:146-149`). Unclear from code whether an unexpected role should be allowed to receive a broker link.
7. **Assign-user permission gates by resource, not row.** `assign-user-to-brand` requires the `BrandAssign` permission but the handler does not further restrict which brand an owner/broker may be assigned to beyond existence/role checks — Unclear from code whether row-level tenant scoping is enforced upstream.
