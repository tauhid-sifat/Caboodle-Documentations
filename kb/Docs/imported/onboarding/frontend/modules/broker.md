---
type: Document
title: "Broker Module"
---

# Broker Module

> Audience: Business Analysts (non-technical). Every claim cites the backend source file and line, relative to the backend root `/d/Projects/caboodle.backend`. Where the code is ambiguous, this is flagged as "Unclear from code."

---

## Purpose

A **Broker** is a sales agency (a person/company) that represents one or more **Brands** to the retail trade. In Caboodle, a Broker is not a separate database table — it is simply a **user account carrying the `BROKER` role** (`caboodle/src/Modules/Broker/Modules.Broker.Application/Broker/GetBrokersRequest.cs:83`, which lists brokers by joining `Identity.Users` to the `BROKER` role). A Broker is linked to the Brands they represent, and can then record in-store observations (Market Overview), manage a category-reset calendar (Category Review), view promotional activity for their brands (Promotional Management), maintain distributor authorized-product lists (APL), and invite/manage their own **Broker Sub-Users**.

The module spans three areas:
- **Broker domain data** — Market Overview, Category Review (+ its calendar), Distributor APL (`caboodle/src/Modules/Broker/Modules.Broker.Domain/`).
- **Broker application logic** — request handlers for all the above plus Promotional Management and Sub-User management (`caboodle/src/Modules/Broker/Modules.Broker.Application/`).
- **The Broker↔Brand assignment**, which physically lives in the **Brand** module (see below), not the Broker module.

---

## Domain Entities

All four entities inherit `AuditableEntity`, so they carry `CreatedBy/On`, `LastModifiedBy/On`, and a `Deleted` soft-delete flag (records are never physically removed; EF queries auto-hide soft-deleted rows, raw SQL/Dapper queries must filter `"Deleted" = FALSE` by hand).

### MarketOverview
`caboodle/src/Modules/Broker/Modules.Broker.Domain/Broker/MarketOverview.cs:5`
A single **in-store observation** a broker rep records for one product (SKU) at one selling location. Fields (lines 12-24): `RegionID`, `RetailerID`, `BannerID`, optional `StoreID`, `DCID` (distribution center), `BrandID`, `SKUID`, `SkuStatus` (an integer status code), `DateTime` (observation date), free-text `Comment`, `Training` flag, `CaseStack` flag, optional `LaunchDate`. It is an `IAggregateRoot` (a top-level record).

### CategoryReview
`caboodle/src/Modules/Broker/Modules.Broker.Domain/Broker/CategoryReview.cs:4`
A **scheduled category-reset / review event** at a retailer. Fields (lines 11-23): optional `BrokerageCompanyID` and `BrandID` (identifying whose review it is), `RegionID`/`Region`, `RetailerID`/`Retailer`, `Category`, `ReviewMonth`, `SubmissionDueDate`, `ReviewDate`, `ResetDate`, `AdditionalNotes`, and `ShouldBeInCalender` (default `false`) which controls whether it appears on the calendar.

### CategoryReviewCalender
`caboodle/src/Modules/Broker/Modules.Broker.Domain/Broker/CategoryReviewCalender.cs:4`
A join record placing a Category Review onto a specific Brand's calendar: just `BrandID` + `CategoryReviewID` (lines 11-12). Records are pushed in / removed via the calendar endpoints.

### DistributorAPL
`caboodle/src/Modules/Broker/Modules.Broker.Domain/APL/DistributorAPL.cs:4`
A **distributor Authorized Product List** line — which UPC a distribution center carries and at what cost. Fields (lines 11-15): `DCID`, `DistributorItemCode`, `UPCNumber`, `WholesaleCaseCost`, `WholesaleUnitCost`.

> Note: There is **no `Broker` entity** in this module. "Broker" and "Sub-Broker" identities are managed through the shared Identity user store and roles.

---

## Broker ↔ Brand Assignment

The link between a Broker and the Brands it represents is the **`Brand.BrandBrokers`** table. This assignment is owned by the **Brand module**, not the Broker module.

- **Endpoint:** `PATCH .../Brands/assign-brand-to-broker` (`caboodle/src/Hosts/API/Controllers/Modules/Brand/BrandsController.cs:222`), permission **"Assign Brands to Broker"** (`CaboodleModule.Broker`).
- **Handler:** `AssignBrandsToBrokerRequest` (`caboodle/src/Modules/Brand/Modules.Brand.Application/Requests/BrokerBrand/AssignBrandToBrokerRequest.cs:17`). Business rules:
  - The target user must exist and hold role `BROKER` **or** `BROKERSUBUSER`, else validation/404 errors (lines 145-156).
  - At least one Brand must be selected (lines 140-143); every requested Brand must exist or the request fails (lines 68-71).
  - New `BrandBroker` rows are inserted only for brands not already linked (lines 76-92).
  - **Cascade:** if the target is a top-level Broker (not a sub-user), the same brands are **also assigned to all of that Broker's Sub-Brokers** (lines 94-122), with `ParentBrokerID` set to the parent broker. If the target *is* a sub-broker, the new links carry `ParentBrokerID = the current (parent) user` (lines 82-84).
- **Related endpoints (same permission, all `CaboodleModule.Broker`):**
  - `POST .../Brands/assign-brands-to-sub-brokers` (`BrandsController.cs:233`)
  - `DELETE .../Brands/remove-brand-from-broker` (`BrandsController.cs:244`)
  - `DELETE .../Brands/remove-brands-from-broker` (`BrandsController.cs:255`)

**What a broker can then do:** Once brands are assigned, the broker's other actions are scoped to those brands. For example, creating Market Overviews first fetches the broker's assigned brand IDs and rejects any overview for a non-assigned brand (`caboodle/src/Modules/Broker/Modules.Broker.Application/MarketOverview/CreateMarketOverviewsRequest.cs:64-82`, `122-135`). Listing brokers returns each broker with their assigned brands aggregated as JSON (`GetBrokersRequest.cs:76`, `87-93`).

---

## Market Overview

**What the artifact is:** a log of in-store SKU observations captured by broker field reps (status of a product at a banner/retailer/region/store/DC on a date, with training and case-stack flags). See the entity above and the read model `BrokerMarketOverviewDTO` (`caboodle/src/Modules/Broker/Modules.Broker.Application/DTOs/BrokerDTOs.cs:81`), which enriches each record with brand/retailer/banner/region/store/DC/SKU names, `NumberOfStores`, and `CreatedBy`.

Controller: `MarketOverviewsController.cs` (`caboodle/src/Hosts/API/Controllers/Modules/Broker/MarketOverviewsController.cs`). Key operations:
- **List** `GET .../MarketOverviews` (line 13) — heavily filterable (statuses, brand/banner/retailer/SKU/DC/store/region IDs, createdBy, date range, isCaseStack, isTraining).
- **Create** `POST .../MarketOverviews` (line 270) — bulk insert, scoped to the broker's brands, then `PushMarketOverviewChangesIntoCRM` syncs the data into the CRM module (`CreateMarketOverviewsRequest.cs:113`).
- **Update** `PUT` (line 281), **Delete** `DELETE` (line 292).
- **Report** views: parent/child props (`report/parent-props` line 60, `report/child-props` line 94, both brand-scoped via `[BrandIDHeader]`), `GET report` (line 150), plus exports (`report/export` line 193, `report/export/for-brand` line 236). Filters via `GET filters` (line 128) and `filters/for-brand` (line 139).

---

## Category Review & Promotional Management

Both features are **served from the Broker module** but their **handlers and controller live in `BrokersController.cs`**, not in `MarketOverviewsController.cs`.

### Category Review
Endpoints on `BrokersController.cs`:
- Get lists: `POST category-reviews/all` (line 137), `.../brand` (line 169, brand-scoped), `.../broker` (line 202). Distinct handlers `GetCategoryReviewsRequest`, `GetCategoryReviewsForBrandRequest`, `GetCategoryReviewForBrokerRequest` (in `.../Application/CategoryRerview/`).
- Calendar: `POST category-reviews/calender` (line 255) reads the calendar; `PATCH category-reviews/calender/push` (line 234) and `.../remove` (line 245) add/remove reviews from a brand's calendar (the `CategoryReviewCalender` join).
- Filter properties: `GET category-reviews/filter` (line 286).
- Create/update: `POST category-reviews` (line 529, `UpsertCategoryReviewRequest`).
- Import: `POST category-reviews/import` (line 540) — accepts an uploaded file and an optional `brokerageCompanyID`; the same endpoint serves both broker-side and brand-side import (line 542 note).
- Exports: `.../export` (296), `.../export/broker` (331), `.../export/brand` (363).
- Delete: `DELETE category-reviews` (line 827).

> **Note:** Although permissions **"Get Category Review"** and **"Import Broker Category Review"** are defined (`caboodle/src/BuildingBlocks/Core/Shared/Authorization/CaboodlePermissions.cs:106-107`), **none of the category-review endpoints carry a `[MustHavePermission]` attribute** — see Gaps below.

### Promotional Management
This is a **read-only view of promotional events** for the broker's brands, sourced from the **TradeSpend** module's promo data (the handler returns `PromoGroupDTO` built from TradeSpend types, and the controller imports `Caboodle.Modules.TradeSpend.Application` — `BrokersController.cs:11-13`). Endpoints (all require **"View Broker Promotional Management"**):
- `GET promotional-management-events` (line 64) — events grouped by month.
- `GET events-with-same-name` (line 97), `GET promotional-management-filters` (line 126).
- Exports: `GET export-events` (line 440), `GET export-promotional-management-events` (line 465), and export-time estimate `GET promotional-management-events-export-time` (line 498).

The handler `GetPromotionalManagementEventsRequest` (`.../PromotionalManagement/GetPromotionalManagementEventsRequest.cs:49`) scopes results to the current broker's ID and has a special code path for a hard-coded "Caboodle production test broker" email (lines 56-58) — flagged in Gaps.

> **Broker Dashboard:** A permission **"View Broker DashBoard"** exists (`CaboodlePermissions.cs:101`) but is **not applied to any controller endpoint** in the reviewed hosts. The dashboard is served elsewhere / Unclear from code — no endpoint in the Broker controllers uses it.

---

## Sub-User Management

Controller: `SubUsersController.cs` (`caboodle/src/Hosts/API/Controllers/Modules/SubUsers/SubUsersController.cs`). This one controller serves **both** Brand Sub-Users and Broker Sub-Users.

### Creating / inviting a Broker Sub-User
There is **no dedicated broker-sub-user invite endpoint**. Broker sub-users are invited through the **generic invite** endpoint `POST .../Users/invite` (`caboodle/src/Hosts/API/Controllers/Identity/UsersController.cs:106`) with `UserType = BrokerSubUser` and a `ParentUserID` (the parent broker). The invite handler enforces that a Broker Sub-User invitation **must name a parent broker** (`caboodle/src/BuildingBlocks/Infrastructure/Identity/UserService.CreateUpdate.cs:154-157`) and emails an invitation link (lines 185-195). On acceptance the user is given the `BROKERSUBUSER` role (`UserService.CreateUpdate.cs:823`) and a user-hierarchy record is created (line 325).

### Listing
- Broker's own sub-users: `GET .../SubUsers/broker` (`SubUsersController.cs:167`), returns `SubBrokerDTO` (active flag, invited-on date, assigned brands — `BrokerDTOs.cs:36`).
- Broker's pending invitations: `GET .../SubUsers/broker/invited-users` (line 193).
- Admin views: `GET .../SubUsers/brokers/for-admin` (line 134, returns `SubBrokerExtendedDTO` which adds `ParentBrokerID` + `InvitedBy`), and admin invited-users list `GET .../SubUsers/admin/invited-users` (line 227).

### Toggle active status
`PUT .../SubUsers/brokers/change-user-active-status` (`SubUsersController.cs:119`). Handler `ToggleActiveStatusOfSubBrokerReqest` (`.../SubUser/ToggleActiveStatusOfSubBrokerReqest.cs:44`): verifies the user holds `BROKERSUBUSER` (lines 71-72), sets `IsActive`, and **emails the user** an activation/deactivation notice (lines 74-80).

### Remove
`DELETE .../SubUsers/broker/remove/{id}` (`SubUsersController.cs:213`, permission **"Remove Broker Sub User"**). Handler `RemoveBrokerSubUserRequest` (`.../SubUser/RemoveBrokerSubUserRequest.cs:54`): verifies `BROKERSUBUSER` role, **deletes the `BrandBrokers` rows** linking that sub-broker to the parent broker (lines 68-98), sets the user inactive, and detaches it from the user hierarchy (nulls `ParentUserID`, lines 100-114). Note the delete is a raw SQL `DELETE` (physical row removal), not a soft delete.

### Cancel invitation
`DELETE .../SubUsers/cancel-invitation` (line 258) — shared by brand and broker flows.

### BROKERSUBUSER vs BRANDSUBUSER — does the code distinguish them?
Yes. They are **separate roles** (`caboodle/src/BuildingBlocks/Core/Shared/Authorization/CaboodleRoles.cs:12-13`) with separate handling:
- A **BrandSubUser** belongs to a **Brand** — invited via `POST .../Users/invite/brand-sub-user` (`UsersController.cs:126`), managed under the `SubUsers/brand*` endpoints (`SubUsersController.cs:15-70`), and its invitation requires a `BrandID`.
- A **BrokerSubUser** belongs to a **parent Broker** — invited via the generic invite with a `ParentUserID`, managed under `SubUsers/broker*` endpoints, and its brand access is inherited from the parent broker via `BrandBrokers.ParentBrokerID`. A BrokerSubUser receives the **same Broker-module permission set as a Broker** (see Who Can Access).

---

## Business Rules & Validation

FluentValidation validators run automatically before each handler; a failure returns HTTP 400.
- **Assign brands:** broker ID required (`AssignBrandToBrokerRequest.cs:29-32`); at least one brand and all brands must exist (lines 140-143, 68-71).
- **Create Market Overview:** overviews list must be non-empty (`CreateMarketOverviewsRequest.cs:33-35`); each overview's brand must be one of the broker's assigned brands or the whole request fails (lines 72-82).
- **Toggle sub-broker status:** `SubBrokerID` and `Status` required (`ToggleActiveStatusOfSubBrokerReqest.cs:30-38`); target must actually be a `BROKERSUBUSER` (lines 71-72).
- **Remove sub-broker:** `SubBrokerID` required (`RemoveBrokerSubUserRequest.cs:27-30`); target must be a `BROKERSUBUSER` (lines 63-65).
- **Invite broker sub-user:** parent broker required (`UserService.CreateUpdate.cs:154-157`).
- **Brand scoping:** endpoints marked `[BrandIDHeader]` require a Brand context header (e.g. all `category-reviews/*` brand variants, MO report brand variants).

---

## Key Operations

| Area | Operation | Endpoint | Handler |
|---|---|---|---|
| Assignment | Assign brands to broker (cascades to sub-brokers) | `PATCH Brands/assign-brand-to-broker` | `AssignBrandsToBrokerRequest` |
| Assignment | Remove brand(s) from broker | `DELETE Brands/remove-brand(s)-from-broker` | `RemoveBrandFromBrokerRequest` |
| Brokers | List brokers + their brands | `GET Brokers` | `GetBrokersRequest` |
| Market Overview | List / create / update / delete | `GET/POST/PUT/DELETE MarketOverviews` | `Get/Create/Update/DeleteMarketOverviewsRequest` |
| Market Overview | Report + export | `GET MarketOverviews/report`, `/report/export` | `GetMarketOverviewsReportRequest`, `ExportMarketOverviewRequest` |
| Category Review | Upsert / import / list / delete | `POST Brokers/category-reviews`, `/import`, `/all\|/brand\|/broker`, `DELETE Brokers/category-reviews` | `UpsertCategoryReviewRequest`, `ImportCategoryReviewRequest`, etc. |
| Category Review | Calendar push/remove | `PATCH Brokers/category-reviews/calender/push\|/remove` | `Push/RemoveCategoryReviewRecords...Request` |
| Promotional Mgmt | View events + export | `GET Brokers/promotional-management-events`, `/export-*` | `GetPromotionalManagementEventsRequest` |
| Distributor APL | Import / list / upsert / delete / export | `POST\|GET\|DELETE Brokers/apl*` | `Import/Get/Upsert/DeleteDistributorAPLRequest` |
| Sub-Users | Invite (via generic invite) | `POST Users/invite` (UserType=BrokerSubUser) | `InviteAsync` |
| Sub-Users | List / toggle active / remove | `GET SubUsers/broker`, `PUT SubUsers/brokers/change-user-active-status`, `DELETE SubUsers/broker/remove/{id}` | `GetBrokerSubUsersRequest`, `ToggleActiveStatusOfSubBrokerReqest`, `RemoveBrokerSubUserRequest` |

---

## Who Can Access

Permission names follow `Permissions.{Module}.{Resource}.{Action}` (`CaboodlePermissions.cs:155`). **Roles:** `ADMIN` gets every permission (`CaboodlePermissions.cs:144`); `BROKER` and `BROKERSUBUSER` get the **identical** Broker-module set — every Broker-module permission **except** the `Brokers` resource, i.e. "View Brokers" is admin-only (`CaboodlePermissions.cs:145-149`). `BRANDOWNER`/`BRANDSUBUSER` are seeded elsewhere (Brand module).

Endpoints **without** a `[MustHavePermission]` attribute are flagged ⚠️ — the base controller (`BaseApiController.cs:6`, `VersionedApiController.cs:4`) carries **no `[Authorize]`**, so these endpoints have no explicit permission gate (authorization fallback is null).

| Endpoint | Permission required | Notes |
|---|---|---|
| `GET Brokers` | View Brokers (Broker) | Admin-only in practice (excluded from Broker/SubBroker sets) |
| `GET Brokers/banner` | View Banners (Broker) | |
| `GET Brokers/promotional-management-events` | View BrokerPromotionalManagement | |
| `GET Brokers/events-with-same-name` | View BrokerPromotionalManagement | |
| `GET Brokers/promotional-management-filters` | View BrokerPromotionalManagement | |
| `GET Brokers/export-events` | View BrokerPromotionalManagement | |
| `GET Brokers/export-promotional-management-events` | View BrokerPromotionalManagement | |
| `GET Brokers/promotional-management-events-export-time` | View BrokerPromotionalManagement | |
| `GET Brokers/{regionID}/get-retailers` | Create BrokerMarketOverview | |
| `GET Brokers/{retailerID}/regions/{regionID}/banners` | View BrokerMarketOverview | |
| `POST Brokers/category-reviews/all` | ⚠️ none | |
| `POST Brokers/category-reviews/brand` | ⚠️ none | brand-scoped header |
| `POST Brokers/category-reviews/broker` | ⚠️ none | |
| `POST/DELETE Brokers/category-reviews` (upsert/delete) | ⚠️ none | |
| `POST Brokers/category-reviews/import` | ⚠️ none | "Import Broker Category Review" perm exists but unused |
| `PATCH Brokers/category-reviews/calender/push`,`/remove` | ⚠️ none | |
| `POST Brokers/category-reviews/calender` | ⚠️ none | |
| `GET Brokers/category-reviews/filter` | ⚠️ none | |
| `POST Brokers/category-reviews/export*` (all 3) | ⚠️ none | |
| `GET Brokers/promos-at-a-glance/notes`,`/export` | ⚠️ none | |
| `POST/GET/DELETE Brokers/apl*` (all APL endpoints) | ⚠️ none | |
| `GET MarketOverviews` | View BrokerMarketOverview | |
| `GET MarketOverviews/filters` | View BrokerMarketOverview | |
| `GET MarketOverviews/report`,`/report/export` | View BrokerMarketOverview | |
| `POST MarketOverviews` (create) | Create BrokerMarketOverview | |
| `PUT MarketOverviews` (update) | Update BrokerMarketOverview | |
| `DELETE MarketOverviews` | Delete BrokerMarketOverview | |
| `POST MarketOverviews/report/parent-props`,`/child-props` | ⚠️ none | brand-scoped header |
| `GET MarketOverviews/filters/for-brand` | ⚠️ none | |
| `POST MarketOverviews/report/export/for-brand` | ⚠️ none | |
| `PATCH Brands/assign-brand-to-broker` | Assign Brands to Broker (Broker) | |
| `POST Brands/assign-brands-to-sub-brokers` | Assign Brands to Broker (Broker) | |
| `DELETE Brands/remove-brand(s)-from-broker` | Assign Brands to Broker (Broker) | |
| `GET SubUsers/broker`,`/broker/invited-users` | ⚠️ none | broker's own sub-users |
| `DELETE SubUsers/broker/remove/{id}` | Remove Broker Sub User (Broker, Delete SubUsers) | |
| `PUT SubUsers/brokers/change-user-active-status` | Update Users (User module) | Note: uses **User** module perm, not the "Toggle User Active Status" Broker perm |
| `GET SubUsers/brokers/for-admin` | View Sub Users (SubUser module) | |
| `GET SubUsers/admin/invited-users` | View Sub Users (SubUser module) | |
| `GET SubUsers/brand*`, `DELETE SubUsers/brand/remove/{id}` | ⚠️ none | brand-scoped |
| `PUT SubUsers/brands/change-user-active-status` | Update Users (User module) | |
| `DELETE SubUsers/cancel-invitation` | ⚠️ none | shared brand/broker |
| `POST Users/invite` (broker sub-user invite) | ⚠️ none | |

---

## Dependencies

- **Brand module** — owns the `Brand.BrandBrokers` assignment table and all assign/remove endpoints (`caboodle/src/Modules/Brand/...`, `BrandsController.cs:222-264`).
- **Identity / BuildingBlocks** — user accounts, roles (`CaboodleRoles.cs`), the invite/create flow and user hierarchy (`UserService.CreateUpdate.cs`), and permission definitions (`CaboodlePermissions.cs`). Toggle/remove handlers use `UserManager<ApplicationUser>`.
- **TradeSpend module** — supplies the promotional-management event data consumed by the Broker Promotional Management endpoints (`BrokersController.cs:11-13`; `GetPromotionalManagementEventsRequest.cs`).
- **CRM module** — Market Overview creation pushes changes into CRM via `ISharedDataService.PushMarketOverviewChangesIntoCRM` (`CreateMarketOverviewsRequest.cs:113`); the controller also uses CRM `BannerDTO`/`GetAllBannersRequest`.
- **Shared module** — `IDapperRepository` (raw SQL) is used heavily; `IRepository<T>` (EF) for user-hierarchy; `IBulkRepository` for bulk inserts. `IMailService` sends invite / status emails.
- **Postgres multi-schema** — queries reference schemas `"Identity"` (Users/Roles/UserRoles) and `"Brand"` (Brands/BrandBrokers) explicitly (`GetBrokersRequest.cs:79-92`).

---

## Gaps, TODOs & Inconsistencies

1. **Category Review and several APL / promo-note endpoints have no `[MustHavePermission]`** despite matching permissions being defined ("Get Category Review", "Import Broker Category Review" — `CaboodlePermissions.cs:106-107`). With no `[Authorize]` on the base controller, these endpoints appear to have no explicit authorization gate. Confirm whether a global auth filter covers them — Unclear from code.
2. **"View Broker DashBoard" permission is defined but never applied** to any endpoint in the reviewed controllers (`CaboodlePermissions.cs:101`). Where the Broker Dashboard is served is Unclear from code.
3. **"Toggle User Active Status" Broker permission (`CaboodlePermissions.cs:130`) appears unused** — the actual toggle endpoints use the **User** module's "Update Users" permission instead (`SubUsersController.cs:104`, `:120`).
4. **Hard-coded broker email** drives a special query path in Promotional Management (`Constants.CABOODLEPRODUCTIONTESTBROKEREMAIL`, `GetPromotionalManagementEventsRequest.cs:56-58`) — test/environment-specific logic left in production code.
5. **Controller class name mismatch:** the file is `MarketOverviewsController.cs` but the class is `MarketOverviews` (`MarketOverviewsController.cs:10`), so the route is `/MarketOverviews`. Cosmetic but easy to misread.
6. **Removing a Broker Sub-User is a physical SQL `DELETE`** of `BrandBrokers` rows (`RemoveBrokerSubUserRequest.cs:91-98`), bypassing the soft-delete (`Deleted`) convention used elsewhere; the user account itself is only deactivated, not deleted.
7. **`BROKER` and `BROKERSUBUSER` have identical permission sets** (`CaboodlePermissions.cs:145-149`) — the two roles are not differentiated at the permission layer; any distinction is enforced only in handler logic (parent-broker checks). Confirm this is intended.
8. **Category Review import is one endpoint for two audiences** (broker vs brand, switched by presence of `brokerageCompanyID`/`BrandID`) — see the caveat in the OpenAPI note (`BrokersController.cs:542`). Worth validating the branching is well-covered.
9. Typo in domain/type names carried through the codebase (`Calender` for Calendar, `BrandJosnString` for JSON) — cosmetic, but note for anyone searching.
