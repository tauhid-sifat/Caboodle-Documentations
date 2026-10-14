---
type: Document
title: "Key End-to-End Workflows"
---

# Key End-to-End Workflows

*Step-by-step business narratives grounded in handler code. Includes validation failures and edge cases.*

---

## Workflow 1: Trade Spend Sandbox → Live BAP

**Who:** BrandOwner, BrandSubUser, Broker, or BrokerSubUser with access to the brand.  
**Frontend:** `/{brandID}/trade-spend-sandbox` → push action on promo detail.  
**Backend:** `TradeSpendsSandboxController` → `PushPromotionToTradeSpendRequest`.

### Steps

1. **User creates a sandbox promotion**
   - Enters promo name and selects one or more product categories.
   - Adds one or more promotional events (retailer, banner, distributor, product, dates, allowances, lift).
   - System creates `Promotion` and `PromotionalEvent` rows in the `TradeSpendSandbox` schema.
   - Default event status is **Active**.
   - *Source: `UpsertPromotionRequest.cs`*

2. **User optionally adds promotion fees**
   - Fee types include lump sum, coupon, and prime — each has type-specific required fields.
   - *Source: `InsertPromotionFeeRequest.cs`*

3. **User edits and refines the scenario**
   - Can update promo metadata, individual events, duplicate the entire promo, or create EDLP-only promos.
   - System rejects duplicate promo names within the brand.
   - System rejects events where `NumberOfStores` exceeds the banner's `DoorCount`.
   - *Source: `UpsertPromotionRequest.cs` handler*

4. **User updates event statuses (governance)**
   - Changes event status to reflect retail approval progress (e.g. **RetailerApproved**, **Completed**, **Declined**, **DidnotRun**).
   - Events also carry an `IsSubmitted` flag set during create/update.
   - *Source: `UpdateEventsStatusRequest.cs`*

5. **User pushes promotion to live BAP**
   - Triggers `POST {promotionID}/push-to-tradespend`.
   - System validates:
     - Promotion exists, is not deleted, belongs to current brand.
     - Promotion has at least one event.
   - System creates or updates `TradeSpendPromo` linked via `SandboxPromotionID`.
   - System **deletes and re-inserts** all live events and fees (not a merge).
   - Returns: "Promotion pushed into BAP successfully."
   - *Source: `PushPromotionToTradeSpendRequest.cs`*

6. **User manages live promo submission (optional)**
   - On live side, broker roles can toggle `IsSubmitted` on events.
   - *Source: `UpdateSubmissionStatusOfEventsRequest.cs`*

### Validation failures

| Step | Failure | User sees |
|------|---------|-----------|
| Create | Empty promo name, no categories, no events | Validator error |
| Create | Duplicate promo name | Handler error |
| Create | NumberOfStores > banner door count | Handler error |
| Push | No events on promotion | "No promotional events found..." |
| Push | Promotion not found or wrong brand | 404 |
| Status update | No matching events for IDs | 404 |

### Edge cases

- **Re-push overwrites live data.** Pushing the same sandbox promo again replaces all live events and fees.
- **No promotion-level status.** Sandbox promos do not have a single "Approved" status — governance is per-event via `PromotionEventStatus`.
- **Reverse sync exists.** Live promos can be pushed back to sandbox via `PushPromotionToSandboxRequest`.
- **BannerSKU delete blocked.** Cannot delete a BannerSKU if its product+banner appears in sandbox events.

---

## Workflow 2: Automated Distributor Data Sync & Mapping

**Who:** Admin triggers sync; Admin stewards unmapped data. Brand users consume reports.  
**Frontend (admin):** `/data-sync`, `/unmapped-data`, `/mapped-data`, `/entity-resolution`.  
**Backend:** `DataHubController`, `EntityResolutionController`.

### Steps

1. **Admin configures distributor credentials**
   - Stores encrypted username/password per brand and provider (UNFI, KeHE).
   - *Source: `CredentialManagerController`, `ThirdPartyCredential`*

2. **Admin or system triggers data sync**
   - Specifies brand, provider, month, year.
   - System creates `DataSyncRun` with status `SourceAuthenticated`.
   - Background job (`DataSyncJobService`) executes:
     - Loads credentials — **fails immediately if missing**.
     - Crawls distributor portal and downloads CSV.
     - Deletes prior sync data for same brand/month/year/provider.
     - Parses rows and evaluates each against entity resolution.
   - *Source: `DataSyncJobService.cs`, `ExecuteDataSyncRequest`*

3. **System classifies each row**
   - For each row, independently evaluates retailer, customer/store, and UPC dimensions.
   - Assigns `MappingDimensionStatus` per dimension.
   - Computes `OverallStatus` from all three:
     - Any dimension ignored → row is **Ignored**.
     - All resolved → **FullyResolved**.
     - Mix → **PartiallyResolved**.
     - None → **Unmapped**.
   - *Source: `UnmappedRecordBase.ComputeOverallStatus()`*

4. **Auto-resolved rows stay in unmapped queue**
   - Rows where retailer or store was auto-matched are **intentionally not promoted** during sync.
   - Requires explicit user confirmation before promotion.
   - *Source: `UnmappedRecordBase.CanPromoteToMappedDuringSync()`*

5. **Admin reviews unmapped data**
   - Views unmapped/partially resolved rows with raw values preserved.
   - Reviews mapping suggestions with confidence scores.
   - *Source: `GetUnmappedRecordsRequest`, entity resolution queries*

6. **Admin resolves dimensions**
   - Bulk resolve by raw value (retailer, store, or UPC).
   - Can set status to Mapped, ManuallyResolved, or Ignored.
   - Cannot manually set AutoResolved or LocationMissing.
   - ManuallyResolved/Mapped requires entity ID.
   - *Source: `UnmappedDimensionStatusByValueUpdater`, `UnmappedDimensionStatusRules`*

7. **Admin promotes fully resolved rows**
   - Rows reaching **FullyResolved** move to `KeHeMapped` or `UNFIMapped`.
   - Partial failures recorded in resolution audit.
   - *Source: `ResolveUnmappedRecordsCommandHandler`*

8. **System rebuilds downstream reporting**
   - Sync product names/categories on mapped rows.
   - Rebuild `DistributorSalesRecord` unified table from mapped data.
   - *Source: `SyncMappedProductNameAndCategoryRequest`, `SyncDistributorSalesRecordsRequest`*

9. **Brand users run reports**
   - Velocity, sales-by-store, DC reports query mapped/unified data.
   - *Source: `DistributorSalesReportsController`, various report request handlers*

### Validation failures

| Step | Failure | Result |
|------|---------|--------|
| Sync | No credential for brand/provider | Sync fails immediately |
| Sync | Scrape/download failure | `DataSyncRun` status Failed |
| Sync | Unmapped rows remain | Status PartiallySucceeded |
| Resolve | Empty raw value | Validator error |
| Resolve | Missing entity ID for manual resolve | Validator error |
| Promote | Row not FullyResolved | Skipped |

### Edge cases

- **Re-sync deletes prior data** for same brand/month/year/provider before re-importing.
- **Provider-specific handling** remains even after mapping (KeHE vs UNFI field semantics differ).
- **Remapping propagated rows** — changing resolution on already-promoted records triggers `PromotedRecordPropagationService`.
- **Some DataHub endpoints are `[AllowAnonymous]`** — verify production security configuration.

---

## Workflow 3: Master Data Upload Wizard (Admin)

**Who:** Admin only (requires `MasterDataUpload.Import/Export` permissions).  
**Frontend (admin):** `/(crm)/` pages and `/upload-data-map`.  
**Backend:** `MasterDataUploadController` → `MasterDataUploadService`.

### Steps

1. **Admin downloads sample file**
   - Selects file category (distributors, retailers, banners, bannerskus, categories, products, price-list, stores, regions, etc.).
   - *Source: `ExportSampleFileRequest`*

2. **Admin prepares CSV following sample format**
   - Each entity type has specific required columns.
   - BannerSKU imports use banner **names** (not IDs) resolved via `DataMapping`.

3. **Admin uploads file**
   - POST to entity-specific endpoint (e.g. `POST /bannerskus`).
   - System validates each row:
     - Required fields present.
     - GUIDs valid where expected.
     - Foreign keys exist (brand, category, etc.).
     - UPC normalized (leading zeros, dashes stripped).
     - Markup ≥ 0 for distributor connections.
     - Dates and decimals parse correctly.
   - *Source: `MasterDataUploadService` per-entity methods*

4. **System processes rows**
   - Valid rows: inserted or upserted.
   - Invalid rows: collected into error CSV.
   - Unrecognized external names (e.g. unknown banner name): creates stub `DataMapping` row for later resolution.
   - *Source: `BannerSkusImport` and similar methods*

5. **Admin reviews result**
   - If any rows failed: `Success = false` with downloadable error CSV.
   - If all succeeded: `Success = true`.
   - Partial success is treated as failure with error file.

6. **Admin resolves data mappings (if stubs created)**
   - Uses `/upload-data-map` to link external names to system entity IDs.
   - Re-imports or manually maps.

7. **Admin exports current data (optional)**
   - Mirror GET export endpoints return current state as CSV.

### Validation failures (BannerSKU example)

| Condition | Result |
|-----------|--------|
| Missing banner name | Row fails |
| Banner name not mapped | Stub mapping created; row may fail |
| UPC missing | Row fails |
| UPC not found or ambiguous | Row fails |
| Invalid status string | Row fails |
| Invalid date format | Row fails |

### Edge cases

- **Admin import uses GUIDs** for BrandID/CategoryID; brand-side import uses category **names**.
- **Duplicate BannerSKU** (same brand+banner+product) is skipped on create, not errored.
- **Master data upload is ADMIN-only** by default — brand users cannot access wizard endpoints.

---

## Workflow 4: Product Spec Import (Brand)

**Who:** BrandOwner, BrandSubUser (brand-scoped).  
**Frontend:** `/{brandID}/products` import action.  
**Backend:** `ProductSpecsController` → `ImportProductsRequest`.

### Steps

1. **User exports current products or downloads sample** (optional).

2. **User uploads CSV** with columns including UPC, Description, CategoryName, CasePack, and optional distributor codes.

3. **System validates each row**
   - UPC, Description, CategoryName required.
   - CasePack must be > 0.
   - CategoryName must match an existing category for the brand.
   - Property validation (dimensions, weights, etc.) via `ProductSpecPropertyValidation`.

4. **System upserts by UPC**
   - Normalizes UPC (leading zeros, dashes).
   - Duplicate UPC in same file: last row wins.

5. **System optionally creates default price list entries** for brand distributors.

6. **Failed rows returned as downloadable CSV.**

### Edge cases

- **Force delete** removes product and cascades to sandbox promotional events referencing it.
- **MasterPack field** exists in backend but is not exposed in frontend forms (as of code review).

---

## Workflow 5: BannerSKU Lifecycle

**Who:** Brand users create/edit; Admin manages via master wizard and admin list.  
**Frontend:** Brand CRM banner pages; admin `/banner-skus`.  
**Backend:** CRM `BannersController` SKUs endpoints; `MasterDataUploadService.BannerSkusImport`.

### Steps

1. **Create via UI**
   - User selects banner and one or more products.
   - Sets status, active date, disco date, slotting.
   - System skips products already linked to same banner.
   - ActiveDate set only if status = Active; DiscoDate only if status = Discontinued.
   - *Source: `CreateBannerSKURequest.cs`*

2. **Create via master import (admin)**
   - CSV with banner name (resolved via DataMapping), UPC, status, dates, slotting.
   - Unmapped banner names create stub mappings.
   - *Source: `MasterDataUploadService.BannerSkusImport`*

3. **Update**
   - User modifies status, dates, slotting.
   - Same date rules as create.
   - *Source: `UpdateBannerSKURequest.cs`*

4. **Use in trade spend**
   - BannerSKUs appear in promo event product/banner pickers.
   - Referenced sandbox events block deletion.

5. **Delete**
   - Soft delete (`Deleted = true`).
   - Blocked if product+banner pair exists in `TradeSpendSandbox.PromotionalEvents`.
   - Supports partial delete (some SKUs blocked, others deleted).
   - *Source: `DeleteBannerSKURequest.cs`*

6. **Admin maintenance**
   - `DeleteBannerSKUDuplicatesRequest` removes duplicate rows.

### SkuStatus values

Active, Pending, NotActive, Declined, Discontinued, Approved, Commit — *Source: `Enums.cs`*

### Validation failures

| Action | Failure |
|--------|---------|
| Create | All products already linked → validator exception |
| Create | Invalid product IDs for brand → validator exception |
| Update | SKU not found or wrong brand/banner → 404 |
| Delete | All SKUs referenced in sandbox events → blocked with message |

---

## Workflow 6: User Onboarding & Role Assignment

**Who:** Admin, self-registration, brand owner inviting sub-users.  
**Backend:** `RegistrationController`, `UsersController`, `UserService`.

### Steps

1. **Self-registration** → user created with `UNASSIGNED` role.
2. **Admin invites user** → assigns role (BrandOwner, BrandSubUser, Broker, BrokerSubUser).
3. **User creates brand** → `UNASSIGNED` promoted to `BRANDOWNER`.
4. **BrandOwner invites sub-users** → creates `BrandSubUser` links.
5. **Broker assigns brands** → `BrandBroker` records (broker must have BROKER or BROKERSUBUSER role).
6. **User logs in** → JWT issued (no permissions in token); permissions resolved from DB per request.
7. **Frontend selects brand** → sends `BrandID` header; middleware validates access.

### Edge cases

- Removing a user's role re-adds `UNASSIGNED`.
- Admin role has special assignment guards.
- Default admin user seeded: `admin@caboodle.com` / `123456` — *verify this is changed in production*.

*Source: `ApplicationDbSeeder.cs`, `UserService.CreateUpdate.cs`, `UserService.Roles.cs`*
