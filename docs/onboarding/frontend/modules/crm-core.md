# CRM Module — Distributors, Retailers, Contacts, Regions, Stores

> Scope: the "CRM core" of the Caboodle backend — Distributors (and their Delivery Methods / Distribution Centers), Retailers, Contacts, Regions, Distribution Centers, Stores, and Retailer Promo Rules. **Banners and Pipeline are documented separately and excluded here.**
> Every claim below cites the backend file and line it comes from. Backend root: `/d/Projects/caboodle.backend`.

---

## Purpose

This module is the customer/partner address book of the platform. It lets a Brand record the **companies it sells through** (Distributors and their delivery arms), the **stores/retail chains** it sells to (Retailers), the **geographic markets** it operates in (Regions), the **warehouses** goods ship from (Distribution Centers), and the **people** it deals with (Contacts). It also stores the **promotion rules** a retailer imposes (Retailer Promo Rules).

A key organizing idea: most records are **shared/global master data** (a Distributor, Retailer, Region or DC exists once for the whole platform), and each Brand then **connects** the master records it cares about to itself through "join" tables. Data is filtered per-Brand using the Brand ID the caller sends in a request header (`[BrandIDHeader]`).

---

## Domain Entities

All entities inherit `AuditableEntity`, so each carries created/modified/deleted stamps and is **soft-deleted** (a `Deleted` flag) unless raw SQL says otherwise. (Cross-cutting fact.)

### Core records

- **Distributor** — a distribution company. Fields: `DistributorName`, optional `ImageURL`, and an optional `ParentID`. `Modules/CRM/Modules.CRM.Domain/Distributor/Distributor.cs:12-14`.
  - **Self-referencing hierarchy:** a Distributor with `ParentID = null` is a top-level ("parent") Distributor; a Distributor whose `ParentID` points at another Distributor is a **"Delivery Method"** / sub-distributor. The UI term "Delivery Method" and the data term "sub-distributor" are the same thing (`UpsertSubDistributorRequest.cs:64,85`).

- **Retailer** — a retail chain / corporate account. Fields: `CorporateName`, optional `ImageURL`. `Modules/CRM/Modules.CRM.Domain/Retailer/Retailer.cs:11-12`. (Note the API/UI calls this field "Name" but it maps to `CorporateName` — `UpsertRetailerRequest.cs:75`.)

- **Contact** — a person. Belongs to exactly one Brand (`BrandID`). Fields: `FirstName`, `LastName`, `Email`, `PhoneNumber`, `BusinessName`, `ContactNotes`, `Title`. `Modules/CRM/Modules.CRM.Domain/Contact/Contact.cs:11-18`.

- **Region** — a geographic market. Fields: `RegionName`, optional `Address`. `Modules/CRM/Modules.CRM.Domain/Region/Region.cs:11-12`.

- **DistributionCenter (Dc)** — a standalone warehouse master record. Single field: `Warehouse` (name). `Modules/CRM/Modules.CRM.Domain/Dc/DistributionCenter.cs:11`.

- **Store** — a physical store location. Fields: `Name`, plus links to a `RetailerID`, `BannerID`, and `RegionID`. `Modules/CRM/Modules.CRM.Domain/Store/Store.cs:12-15`.
  - **Duplicate definition:** an identical `Store` class also exists at `Modules/Store/Modules.Store.Domain/Store/Store.cs:12-15`. Two Store entities exist in the codebase (see Gaps).

- **RetailerPromoRule** — the promotion policy a given retailer applies for a given banner in a given region. Links `RetailerID` + `BannerID` + `RegionID`, plus free-text policy fields (`NewItemPolicies`, `AddTPRFees`, `PromoLength`, `MinimumAllowance`, `OffShelfRequirements`, `Notes`) and three yes/no flags (`OI`, `MCB`, `Scan`). `Modules/CRM/Modules.CRM.Domain/Banner/RetailerPromoRules.cs:11-22`.

### Join entities (which many-to-many each represents)

These tables connect the shared master records to a specific Brand or to each other:

- **DistributorBrand** — connects a **Distributor to a Brand** ("this Brand works with this Distributor"). Holds `BrandID`, `DistributorID`, and optional `DistributorParentID`. When `DistributorParentID` is set, the row represents a **Delivery Method linked under a parent Distributor for that Brand**. `Modules/CRM/Modules.CRM.Domain/Distributor/DistributorBrand.cs:12-14`.

- **DistributorRetailer** — connects a **Distributor to a Retailer, scoped to a Brand**, and stores the `DistributorMarkup` (a price uplift %) for that pairing. Fields: `DistributorID`, `RetailerID`, `DistributorMarkup`, `BrandID`. `Modules/CRM/Modules.CRM.Domain/Distributor/DistributorRetailer.cs:12-15`.

- **DistributorBanner** — connects a **Distributor to a Banner, scoped to a Brand**, again with a `DistributorMarkup`. Fields: `DistributorID`, `BannerID`, `DistributorMarkup`, `BrandID`. `Modules/CRM/Modules.CRM.Domain/Distributor/DistributorBanner.cs:11-14`.

- **DistributorDc** — connects a **Distributor to a Region with a named Warehouse** (i.e. "this distributor ships to this region out of this warehouse"). Fields: `DistributorID`, `RegionID`, `Warehouse`. `Modules/CRM/Modules.CRM.Domain/Distributor/DistributorDc.cs:11-13`.

- **RetailerRegion** — connects a **Retailer to a Region** (optionally to a Banner). Fields: `RetailerID`, `RegionID`, optional `BannerID`. `Modules/CRM/Modules.CRM.Domain/Retailer/RetailerRegion.cs:11-13`.

---

## Business Rules & Validation

Validators (`AbstractValidator`/`CustomValidator`) run automatically before the handler; a failure returns HTTP 400. (Cross-cutting fact.)

**Required-field rules (create/update):**
- Distributor: `DistributorName` required (not null/empty). `UpsertDistributorRequest.cs:26-31`.
- Delivery Method (sub-distributor): `ParentID` and `Name` required. `UpsertSubDistributorRequest.cs:27-35`.
- Retailer: `Name` required. `UpsertRetailerRequest.cs:27-30`.
- Region: `Name` required. `UpsertRegionRequest.cs:33-36`.
- Distribution Center: `Warehouse` required. `UpsertDcRequest.cs:25-28`.
- Distributor DC link: `DistributorID`, `Warehouse`, `RegionID` all required. `UpsertDistributorDCRequest.cs:28-42`.
- Store: `Name`, `RetailerID`, `RegionID`, `BannerID` all required. `UpsertStoreRequest.cs:31-49`.
- Retailer Promo Rule: `RetailerID`, `BannerID`, `RegionID` all required. `UpsertRetailerPromoRuleRequest.cs:36-52`.
- Contact upsert has **no validator class** — no required-field checks beyond the duplicate check below. `UpsertContactRequest.cs` (no validator present).
- Markup values (`DistributorMarkup`) must be **≥ 0** on connect-retailer, connect-banner, and update-markup. `ConnectRetailerToDistributorRequest.cs:38-42`, `ConnectDistributorWithBannerRequest.cs:41-45`, `UpdateMarkupRequest.cs:39-43`.

**Existence checks in handlers (return 404 if missing/deleted):** most upserts and links re-load referenced records and reject if not found or soft-deleted — e.g. Store checks Retailer, Banner and Region all exist (`UpsertStoreRequest.cs:116-126`); Distributor DC checks Distributor and Region exist (`UpsertDistributorDCRequest.cs:104-110`); connect-banner checks both Distributor and Banner exist (`ConnectDistributorWithBannerRequest.cs:79-89`).

**Uniqueness / "already connected" rules:**
- A Contact cannot duplicate an existing contact's **Email** or **Phone Number** within the same Brand (case-insensitive email). `UpsertContactRequest.cs:92-110`.
- Connecting Distributors to a Brand silently skips ones already connected; if **all** selected are already connected it errors "already connected with this Brand". `ConnectDistributorsToCurrentBrandRequest.cs:85-99`.
- Connecting Delivery Methods to a parent skips those already linked; errors if all are already linked. `ConnectSubDistributorToDistributorRequest.cs:63-72`.
- A Retailer can only be linked to **one** distributor per Brand — connecting a retailer already associated with a distributor for this Brand is rejected. `ConnectRetailerToDistributorRequest.cs:84-91`.
- A Banner can be connected to **only one** Distributor — rejected if already connected. `ConnectDistributorWithBannerRequest.cs:91-95`.

**"Cannot delete if referenced" rules:**
- **Delete Distributors** (soft): a Distributor that is linked to any Brand (`DistributorBrands`) cannot be deleted; only unlinked ones are removed. Partial success returns "Unable to delete some Distributor(s)…". `DeleteDistributorsRequest.cs:42-77`.
- **Remove Distributor from Brand** (hard-deletes the join row): blocked if the distributor still has a Price List entry (`CheckPriceList`), still has connected Retailers (`CheckRetailers`), or still has child Delivery Methods (`CheckChildExists`) for this Brand. `RemoveDistributorFromBrandRequest.cs:60-62,79-187`.
- **Remove Delivery Method from Brand:** blocked if it still has connected Retailers or a referencing Price List entry. `RemoveSubDistributorFromBrandRequest.cs:89-99`.
- **Delete Retailers** (soft): a Retailer that has any active Banner cannot be deleted. `DeleteRetailersRequest.cs:72-91`.
- **Delete Contacts** (soft): a Contact referenced by a Banner Activity or Pipeline Activity cannot be deleted. `DeleteContactsRequest.cs:59-83`.
- **Remove Banners from Distributor** (hard-deletes join rows): a Banner referenced by a Trade Spend Promo Event cannot be removed. `RemoveBannersFromDistributorRequest.cs:85-113`.

**Soft vs hard delete:** `DapperQueryBuilder.Delete` is a **soft** delete — it runs `UPDATE … SET Deleted = TRUE` (`BuildingBlocks/Infrastructure/Persistence/Repository/DapperQueryBuilder.cs:64-72`). So Delete Distributors / Retailers / Contacts are soft. In contrast, Remove-from-Brand, Remove-Banners, and Delete Promo Rules run raw `DELETE FROM` (or `TRUNCATE`) and are **hard** deletes (`RemoveDistributorFromBrandRequest.cs:64`, `RemoveBannersFromDistributorRequest.cs:118-123`, `DeleteRetailerPromoRulesRequest.cs:26,34`).

---

## Key Operations (what the user does + what actually happens)

- **Create / edit a Distributor.** User submits a name (+ optional image). *What happens:* if an ID is supplied it updates the existing master record (404 if not found), otherwise it creates a new global Distributor. `UpsertDistributorRequest.cs:47-85`.
- **Create / edit a Delivery Method.** User picks a parent Distributor and a name. *What happens:* validates the parent is a real top-level distributor (`ParentID == null`), then creates/updates a sub-distributor whose `ParentID` is that parent. `UpsertSubDistributorRequest.cs:52-87`.
- **Add Distributors to my Brand.** User selects one or more global Distributors. *What happens:* creates `DistributorBrand` rows for the current Brand, skipping any already connected. `ConnectDistributorsToCurrentBrandRequest.cs:56-83`.
- **Attach Delivery Methods to a Distributor (for my Brand).** *What happens:* verifies the parent is connected to the Brand, then bulk-inserts `DistributorBrand` rows carrying `DistributorParentID`. `ConnectSubDistributorToDistributorRequest.cs:52-100`.
- **Connect a Retailer to a Distributor** (with a markup). *What happens:* validates retailer + distributor-for-brand exist, enforces the one-distributor-per-retailer rule, then creates a `DistributorRetailer`. `ConnectRetailerToDistributorRequest.cs:66-111`.
- **Connect Banner(s) to a Distributor** (with a markup). *What happens:* validates both exist and banner isn't already linked, then creates `DistributorBanner`. `ConnectDistributorWithBannerRequest.cs:75-114`.
- **Update markup** for a Distributor+Banner pairing. *What happens:* finds the existing `DistributorBanner` for the Brand (404 if the pairing isn't connected) and updates its markup. `UpdateMarkupRequest.cs:59-81`.
- **Remove a Distributor / Delivery Method / Banner from my Brand.** *What happens:* runs the reference checks above, then hard-deletes the relevant join rows. `RemoveDistributorFromBrandRequest.cs:50-77`, `RemoveSubDistributorFromBrandRequest.cs:62-105`, `RemoveBannersFromDistributorRequest.cs:52-72`.
- **Create / edit a Retailer.** *What happens:* upserts the master Retailer; on a rename it enqueues a background job to propagate the new name across DataHub. `UpsertRetailerRequest.cs:52-96`.
- **Create / edit Contact, Region, Distribution Center, Distributor-DC link, Store, Retailer Promo Rule.** Standard upsert-with-validation patterns as cited above.
- **Delete Retailer Promo Rules.** User deletes selected rows or "delete all". *What happens:* hard `DELETE` by IDs, or **`TRUNCATE TABLE` the entire RetailerPromoRules table** when `DeleteAll = true` — the truncate is **not scoped to a Brand** (see Gaps). `DeleteRetailerPromoRulesRequest.cs:24-42`.
- **List / export / get-by-id** operations exist for Distributors, Retailers, Contacts, Regions, DCs (read-only, paginated, filterable).

---

## Who Can Access

Endpoints are gated by `[MustHavePermission(action, resource, module)]`. **The base controller has no `[Authorize]` fallback, so any endpoint without a permission attribute is effectively ungated at the controller level** (authentication may still apply via middleware, but no *permission* is enforced). Flagged below.

| Operation | Endpoint | Permission | Notes |
|---|---|---|---|
| Create/update Distributor | `POST distributors` | `Upsert · Distributors · Distributor` | `DistributorsController.cs:236-237` |
| Create/update Delivery Method | `POST distributors/sub-distributors` | `Upsert · Distributors · Distributor` | `:247-248` |
| **Delete Distributors** | `DELETE distributors` | `Delete · Retailers · Retailer` | ⚠ Uses the **Retailer** delete permission, not a Distributor one — likely a bug. `:358-360` |
| Add Distributors to Brand | `POST distributors/connect-brand` | — | **No permission attribute** (BrandIDHeader only). `:258-261` |
| Attach Delivery Methods | `POST distributors/sub-distributors/connect` | — | **No permission attribute.** `:269-272` |
| Connect Retailer to Distributor | `POST distributors/connect-retailer` | — | **No permission attribute.** `:280-283` |
| Connect Banner(s) to Distributor | `POST distributors/connect-banner(s)` | — | **No permission attribute.** `:291-306` |
| Update markup | `PATCH distributors/update-markup` | — | **No permission attribute.** `:313-316` |
| Remove Banners from Distributor | `DELETE distributors/banners/remove` | — | **No permission attribute.** `:324-327` |
| Remove Distributor from Brand | `DELETE distributors/brand-distributor-connection/{ID}` | — | **No permission attribute.** `:335-338` |
| Remove Delivery Method | `DELETE distributors/sub-distributors/remove` | — | **No permission attribute.** `:346-351` |
| All Distributor GET/list/leaf/sub/global/retailers/dcs | various `GET/POST` reads | — | **No permission attribute** on any Distributor read endpoint. `:12-234` |
| Create/update Retailer | `POST retailers` | `Upsert · Retailers · Retailer` | `RetailersController.cs:142-144` |
| Delete Retailers | `DELETE retailers` | `Delete · Retailers · Retailer` | `:153-155` |
| Retailer reads / exports / for-promo | `GET retailers…`, `POST retailers/for-promo` | — | **No permission attribute.** `:11-140` |
| Create/update Contact | `POST contacts` | — | **No permission attribute.** `ContactsController.cs:11-14` |
| Delete Contacts | `DELETE contacts` | — | **No permission attribute.** `:22-25` |
| Get Contacts (brand) / export | `GET contacts`, `GET contacts/export` | — | **No permission attribute.** `:33-77` |
| Get Contacts for Admin | `GET contacts/for-admin` | `View · Contacts · Contact` | Only permission-gated Contact endpoint. `:79-80` |
| Region list / retailer-regions / upsert | `GET/POST regions…` | — | **No permission attribute** on any Region endpoint. `RegionsController.cs:9-61` |
| DC list / distributor-DC list / upsert DC / upsert Distributor-DC | `GET/POST …/dcs` | — | **No permission attribute** on any DC endpoint. `DistributionCenterController.cs:9-73` |
| CRM Store get/list/upsert | (n/a) | — | **All CRM Store endpoints are commented out** in `StoresController.cs:11-60`; the live controller serves DataHub "store-list" (out of this module's scope), none of which carry permission attributes. |
| Retailer Promo Rules (upsert/delete/import/export/get) | (not in these controllers) | see notes | Exposed via **`BannersController`** (Banners module, out of scope here). Handlers live in `Modules.CRM.Application/RetailerPromoRules/`. |

Role reminder (cross-cutting): ADMIN has all permissions; BROKER/BROKERSUBUSER only hold Broker-module permissions; BRANDOWNER/BRANDSUBUSER permissions are seeded elsewhere. Where a permission is listed, the caller's role must hold it.

---

## Dependencies

- **Brand context:** most write/read operations are scoped by the Brand ID header (`[BrandIDHeader]`) and `ICurrentUser.GetBrandID()`.
- **Banners:** Distributor↔Banner links, Store, and Retailer Promo Rules all reference Banners (documented separately).
- **ProductSpecs (Price List):** delete/remove checks query `ProductSpecs.PriceList` to block removals. `RemoveDistributorFromBrandRequest.cs:106-131`, `RemoveSubDistributorFromBrandRequest.cs:117-139`.
- **Trade Spend:** removing banners from a distributor checks `TradeSpend.TradeSpendPromoEvents`. `RemoveBannersFromDistributorRequest.cs:87-96`.
- **Pipeline & Banner Activities:** contact-delete checks these tables. `DeleteContactsRequest.cs:66-73`.
- **DataHub:** renaming a Retailer enqueues `ISharedDataHubService.PropagateRetailerNameChangeAsync`. `UpsertRetailerRequest.cs:83-86`.
- **Postgres multi-schema:** raw SQL references `"CRM"`, `"ProductSpecs"`, `"TradeSpend"` schemas explicitly.

---

## Gaps, TODOs & Inconsistencies

1. **Delete Distributors requires the wrong permission.** `DELETE distributors` is gated by `Delete · Retailers · Retailer` instead of a Distributor permission — almost certainly a copy-paste bug. `DistributorsController.cs:358-360`.
2. **Most CRM write endpoints have no permission attribute.** All Distributor connect/remove/markup operations, all Contact operations (except for-admin read), and all Region and DC operations carry **no `[MustHavePermission]`** and the base controller sets no authorize fallback — meaning permission is not enforced on them. See table.
3. **"Delete all" promo rules uses `TRUNCATE TABLE` with no Brand scoping.** `DeleteRetailerPromoRulesRequest.cs:32-35` truncates the entire `RetailerPromoRules` table for *all* Brands when `DeleteAll = true`. This looks unsafe in a multi-tenant system — confirm intended.
4. **Duplicate Store entity.** Two identical `Store` classes exist: `Modules/CRM/Modules.CRM.Domain/Store/Store.cs` and `Modules/Store/Modules.Store.Domain/Store/Store.cs`. Unclear from code — which one is the live table and why both exist.
5. **CRM Store endpoints are dead code.** The whole CRM Store region in `StoresController.cs:11-60` is commented out; the controller now serves DataHub store-list. So there is currently **no live API to manage CRM `Store` records** despite the entity, DTO, and handlers (`UpsertStoreRequest`, `GetStoreRequest`, `GetStoresRequest`) still existing.
6. **Contact upsert has no field validator.** Unlike other upserts, `UpsertContactRequest` has no `CustomValidator`; a Contact can be created with all name/email fields blank (only the duplicate email/phone check runs). `UpsertContactRequest.cs`.
7. **Commented-out reference checks.** `CheckMarketOverView` is commented out in both `RemoveDistributorFromBrandRequest.cs:133-160` and `RemoveSubDistributorFromBrandRequest.cs:158-184` — Market Overview references no longer block distributor removal. Confirm whether intentional.
8. **Retailer Promo Rules live under the Banners controller,** not a CRM controller, despite the handlers residing in the CRM application project — a structural inconsistency to be aware of when tracing permissions.
9. **Recurring typo** in user-facing error text: "referenced with othem item(s)" appears in several delete handlers (e.g. `RemoveDistributorFromBrandRequest.cs:102`).
