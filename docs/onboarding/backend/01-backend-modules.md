# Backend Modules — Deep Dive

*Each section cites domain entities (`*Domain*`), validators/handlers (`*Application*`), and controllers (`Hosts/API/Controllers/`).*

---

## Admin

### Purpose
Provides cross-tenant administrative operations that do not belong to a single brand: pipeline deal stage configuration, user-brand lookups for admin screens, and data cleanup utilities. There is no Admin Domain project — logic lives entirely in Application handlers.

*Source: `caboodle/src/Modules/Admin/Modules.Admin.Application/`*

### Domain entities
None (Application-only module).

### Business rules
| Rule | Source |
|------|--------|
| Pipeline deal stage update requires non-null `ID` and `Name` | `Admin/Modules.Admin.Application/PipeLine/UpdatePipeLineDealStageRequest.cs` |
| Get brands of user requires `UserID` and `RoleName` | `Admin/Modules.Admin.Application/User/GetBrandsOfUserRequest.cs` |
| User-brand lookup dispatches different queries per role name | `GetBrandsOfUserRequest.cs` handler |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Update pipeline deal stage | Updates `PipelineDealStage` record (CRM schema) |
| Get brands for user (admin) | Returns brands visible to a user based on their role |
| Remove unassigned users | Targets users with `UNASSIGNED` role |
| Banner SKU data cleanup | Admin maintenance on duplicate BannerSKU rows |

### Who can access
- `AdminController` endpoints use `MustHavePermission` for pipeline deal stages (`Permissions.PipeLine.PipeLineDealStage.View/Update`) — seeded to **ADMIN** only.
- Some admin endpoints are `[AllowAnonymous]` (e.g. health/login helpers in `AdminController.cs` line 26 area) — verify environment before assuming production exposure.

### Dependencies
- Reads/writes CRM entities (Pipeline, BannerSKU)
- Uses Identity services for user management

---

## Brand

### Purpose
Manages the brand (manufacturer/CPG company) as the primary tenant anchor: identity, ownership, broker assignment, and sub-user membership. Every other brand-scoped module filters data by `BrandID`.

*Source: `caboodle/src/Modules/Brand/`*

### Domain entities

| Entity | Key fields | Business meaning |
|--------|------------|------------------|
| `Brand` | `UserID`, `Name`, `Description`, `LogoURL`, `WebURL`, `Slug`, `Vendor`, `IsPartner` | The CPG company; `UserID` is the BrandOwner |
| `BrandSubUser` | `BrandID`, `UserID` | Additional brand team member linked to a brand |
| `BrandBroker` | `BrokerID`, `BrandID`, `ParentBrokerID?` | Broker assigned to represent a brand; optional parent for sub-broker hierarchy |

*Files: `Modules.Brand.Domain/Brand/Brand.cs`, `BrandSubUser.cs`, `BrandBroker/BrandBroker.cs`*

### Business rules
| Rule | Source |
|------|--------|
| Brand name is required on upsert | `Brand.Application/Requests/CRUD/UpsertBrandRequest.cs` validator |
| Creating a brand promotes `UNASSIGNED` user to `BRANDOWNER` | `UpsertBrandRequest.cs` handler |
| Only `BROKER` or `BROKERSUBUSER` can assign/remove brands from broker | `AssignBrandToBrokerRequest.cs`, `RemoveBrandFromBrokerRequest.cs` |
| Brand delete requires valid `BrandID` | `DeleteBrandRequest.cs` validator |
| Sub-user toggle requires `UserID`, `Status`, `BrandID` | `ToggleSubUserActiveStatusRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Upsert brand | Creates or updates brand; may promote user role |
| Delete brand | Soft delete (`Deleted = true` pattern via AuditableEntity) |
| Assign brand to broker | Creates `BrandBroker` link |
| Assign brand to user | Creates `BrandSubUser` or updates ownership depending on role |
| Get my assigned brands | SQL branches by role: Broker queries `BrandBrokers`, BrandSubUser queries `BrandSubUsers`, BrandOwner queries `Brands.UserID` |
| Toggle sub-user active status | Enables/disables sub-user access |

### Who can access
| Endpoint type | Access |
|---------------|--------|
| `GET brands/me` | Any authenticated user (no permission claim) |
| View/upsert/delete brands (admin) | `Permissions.Brand.Brands.*` → ADMIN |
| Assign brand to broker | `Permissions.Broker.BrandAssign.Assign` → ADMIN, BROKER, BROKERSUBUSER |
| Brand-scoped operations | Authenticated + valid `BrandID` header per `BrandValidationMiddleware.cs` |

### Dependencies
- Identity (user roles)
- CRM, ProductSpec, TradeSpend (all brand-scoped downstream data)

---

## Broker

### Purpose
Supports broker (sales agency) workflows: market snapshots, category review scheduling, distributor APL (approved product list) pricing, and promotional management views across assigned brands.

*Source: `caboodle/src/Modules/Broker/`*

### Domain entities

| Entity | Key fields | Business meaning |
|--------|------------|------------------|
| `MarketOverview` | Region, Retailer, Banner, Store, DC, Brand, SKU, status, training/case-stack comments, launch date | Point-in-time SKU status at a retail location |
| `CategoryReview` | Brokerage company, brand, region, retailer, category, review month, submission/review/reset dates, notes | Category review milestone tracking |
| `CategoryReviewCalender` | `BrandID`, `CategoryReviewID` | Links category review to calendar |
| `DistributorAPL` | DC, distributor item code, UPC, wholesale case/unit cost | Distributor warehouse product listing and cost |

### Business rules
| Rule | Source |
|------|--------|
| Distributor APL upsert requires DC, item code, UPC, and costs | `APL/UpsertDistributorAPLRequest.cs` |
| Market overview batch create requires non-empty overview list | `MarketOverview/CreateMarketOverviewsRequest.cs` |
| Market overview update requires ID, status, date | `MarketOverview/UpdateMarketOverviewRequest.cs` |
| Category review import requires file | `CategoryRerview/ImportCategoryReviewRequest.cs` |
| Promotional management same-name event lookup requires banner, category, distributor, brand, month, event name | `PromotionalManagement/GetEventsWithSameNameRequest.cs` |
| Remove broker sub-user only works on `BROKERSUBUSER` role | `SubUser/RemoveBrokerSubUserRequest.cs` handler |
| Toggle sub-broker active status only for `BROKERSUBUSER` | `SubUser/ToggleActiveStatusOfSubBrokerReqest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Create/update market overviews | Inserts or updates snapshot rows |
| Import category review | Parses file into `CategoryReview` records |
| Upsert distributor APL | Creates/updates DC-level product cost data |
| Get promotional management events | Cross-brand promo event queries for broker view |
| Manage broker sub-users | List, toggle active, remove sub-brokers |

### Who can access
| Permission | Default roles |
|------------|---------------|
| Broker market overview CRUD | BROKER, BROKERSUBUSER (not `View Brokers`) |
| Category review import/view | BROKER, BROKERSUBUSER |
| Promotional management view | BROKER, BROKERSUBUSER |
| View brokers list | ADMIN only (`Permissions.Broker.Brokers.View` excluded from broker seed) |

### Dependencies
- Brand (`BrandBroker` assignment)
- CRM (retailer, banner, store, DC references)
- ProductSpec (SKU/UPC)
- TradeSpendSandbox (promotional events for management view)

---

## CRM (Commercial Master Data)

### Purpose
Defines the commercial operating model: retail hierarchy (retailer → banner → store), distribution routes (distributor ↔ retailer/banner/DC), product availability at banner level (BannerSKU), sales pipeline, contacts, and retailer promo policy rules.

*Source: `caboodle/src/Modules/CRM/`*

### Domain entities (selected)

| Entity | Key fields | Business meaning |
|--------|------------|------------------|
| `Retailer` | `CorporateName`, `ImageURL` | Parent retail corporation |
| `Banner` | `RetailerID`, `RegionID?`, `BannerName`, `DoorCount` | Retail chain/banner under a retailer |
| `Store` | `RegionID`, `RetailerID`, `BannerID`, `Name` | Physical store location |
| `Region` | `RegionName`, `Address` | Geographic/commercial region |
| `Distributor` | `DistributorName`, `ParentID?` | Wholesaler; `ParentID` enables sub-distributor hierarchy |
| `DistributorBrand` | `BrandID`, `DistributorID` | Brand uses this distributor |
| `DistributorRetailer` | `DistributorID`, `RetailerID`, `DistributorMarkup`, `BrandID` | Distributor serves retailer for a brand with markup |
| `DistributorBanner` | `DistributorID`, `BannerID`, `DistributorMarkup`, `BrandID` | Distributor serves banner for a brand |
| `DistributorDc` | `DistributorID`, `RegionID`, `Warehouse` | Distributor warehouse assignment |
| `DistributionCenter` | `Warehouse` | DC reference master |
| `BannerSKU` | `BrandID`, `BannerID`, `ProductID`, `ActiveDate`, `DiscoDate`, `Slotting`, `Status` | Product listing status at a banner |
| `RetailerPromoRule` | Retailer/banner/region IDs + promo policy flags | Retailer constraints on promo types (OI, MCB, scan, etc.) |
| `Contact` | Brand-scoped contact details | CRM contact person |
| `Pipeline` / `PipelinePlan` / `PipelineDealStage` / `PipelineActivity` | Deal pipeline tracking | Sales pipeline CRM feature |

**Duplicate entity note:** `Modules.Store.Domain/Store/Store.cs` mirrors CRM `Store` with identical fields. CRM Application owns store CRUD; Store module has Domain only.

### Business rules
| Rule | Source |
|------|--------|
| Banner upsert requires retailer, name, door count | `Banners/UpsertBannerRequest.cs` |
| Store upsert requires name, retailer, region, banner | `Store/UpsertStoreRequest.cs` |
| Distributor markup must be ≥ 0 | `Distributors/ConnectRetailerToDistributorRequest.cs`, `UpdateMarkupRequest.cs` |
| BannerSKU create skips duplicates (same brand/banner/product) | `SKUs/CreateBannerSKURequest.cs` handler |
| BannerSKU: `ActiveDate` only set when status is Active; `DiscoDate` only when Discontinued | `CreateBannerSKURequest.cs`, `UpdateBannerSKURequest.cs` handlers |
| BannerSKU delete is soft delete; **blocked** if product+banner referenced in sandbox promotional events | `SKUs/DeleteBannerSKURequest.cs` handler |
| Pipeline upsert requires deal stage and title | `PipeLines/PipeLine/UpsertPipeLineRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Upsert retailer/distributor/banner/store | Create or update master record |
| Connect retailer/banner to distributor | Creates link with markup |
| Create BannerSKU | Links product to banner with status and dates |
| Delete BannerSKU | Soft delete unless referenced in TradeSpendSandbox |
| Import retailer promo rules | Bulk file import |
| Pipeline CRUD | Manage deal stages, plans, activities |

### Who can access
| Operation | Access |
|-----------|--------|
| Brand-scoped CRM CRUD | Authenticated + `BrandID` header (BrandOwner, BrandSubUser, assigned Broker/BrokerSubUser, Admin) |
| Admin cross-brand lists (`for-admin` endpoints) | `MustHavePermission(View, ...)` → ADMIN for retailers, distributors, banners, contacts, banner SKUs |
| Upsert/delete retailer | `Permissions.Retailer.Retailers.Upsert/Delete` → ADMIN |
| Upsert/delete distributor | `Permissions.Distributor.Distributors.Upsert/Delete` → ADMIN |
| Create store (legacy admin endpoint) | `Permissions.Store.Stores.Create` → ADMIN |

### Dependencies
- Brand (all records are brand-scoped or admin-managed)
- ProductSpec (`ProductID` on BannerSKU)
- TradeSpendSandbox (blocks BannerSKU delete)
- DataUpload/DataHub (stores/retailers used in mapping)

---

## ProductSpec

### Purpose
Maintains product (SKU) master data for a brand: categories, product specifications (UPC-centered), and distributor-specific price lists.

*Source: `caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.*`*

### Domain entities

| Entity | Key fields | Business meaning |
|--------|------------|------------------|
| `ProductSpecification` | `BrandID`, `CategoryID`, `Name`, `UPCNumber`, `CaseUPC`, pack/size dimensions, `KeHECode`, `UNFICode`, `UNFIEastCode`, `UNFIWestCode`, `MasterPack` | Sellable SKU master |
| `Category` | `BrandID`, `Name` | Product category within a brand |
| `PriceList` | `BrandID`, `ProductID`, `DistributorID`, prices, `ValidFrom` | Distributor-specific product pricing |

### Business rules
| Rule | Source |
|------|--------|
| Product upsert requires name, case pack, category, UPC | `ProductSpecifications/UpsertProductSpecRequest.cs` |
| Brand import requires UPC, description, category name, case pack > 0 | `ExportImport/ImportProductsRequest.cs` handler |
| Category name must exist for brand on import | `ImportProductsRequest.cs` handler |
| Price list create requires distributor and product IDs | `PriceList/CreatePriceListRequest.cs` |
| Force delete cascades including sandbox promotional events referencing product | `ForceDeleteProductSpecRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Upsert product | Create/update by UPC (normalized) |
| Import/export products (brand) | CSV with category name resolution |
| Import/export (admin master wizard) | CSV with BrandID + CategoryID GUIDs |
| Force delete | Hard cascade delete with dependency checks |

### Who can access
| Operation | Access |
|-----------|--------|
| Brand-scoped CRUD/import/export | Authenticated + `BrandID` header |
| Admin cross-brand product list | `Permissions.ProductSpec.ProductsSpec.View` → ADMIN |
| Master data wizard import/export | `Permissions.DataUpload.MasterDataUpload.Import/Export` → ADMIN |

### Dependencies
- Brand
- CRM BannerSKU, DataHub UPC mapping, TradeSpend events (all reference products)

---

## DataUpload

### Purpose
Stores imported distributor and SPINS data (raw and mapped), provides brand-scoped reporting queries, and supports legacy data mapping configuration for master-data imports.

*Source: `caboodle/src/Modules/DataUpload/`*

### Domain entities

| Entity | Business meaning |
|--------|------------------|
| `KeHe` / `Unfi` | Raw distributor sales rows as imported |
| `KeHeMapped` / `UNFIMapped` | Rows promoted after entity resolution |
| `DistributorSalesRecord` | Unified cross-provider sales for reporting |
| `Spins` / `SPINSItemsRanking` / `SPINSStoresInsight` | SPINS scan data and derived reports |
| `DataMapping` | Maps external spreadsheet names to internal entity IDs (used during master import) |

### Business rules
| Rule | Source |
|------|--------|
| Distributor sales import: year 1900–2100; provider must be KeHE or UNFI | `DistributorSalesRecords/ImportExport/StartDistributorReportFileImportRequest.cs` |
| Data mapping upsert requires entity name and valid file category | `Mapping/CRUD/UpsertDataMappingRequest.cs` |
| Duplicate mapping names rejected | `UpsertDataMappingRequest.cs` handler |
| Some report export types throw `NotImplementedException` | `ExportKeHEReportByTypeRequest.cs`, `ExportUNFIReportByTypeRequest.cs`, `ExportDistributorSalesReportByTypeRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Import KeHE/UNFI/SPINS (brand) | Parse CSV → insert raw rows; return error CSV for failed rows |
| Chunked import | Large files uploaded in chunks with job tracking |
| Data mapping CRUD | Maintain alias table for master imports |
| Distributor sales reports | Query velocity, DC, sales-by-store, etc. from mapped/unified tables |

### Who can access
| Operation | Access |
|-----------|--------|
| Brand-scoped import/report endpoints | Authenticated + `BrandID` header (no permission claim) |
| Data mapping CRUD/import | `Permissions.DataUpload.DataUpload.Create` → ADMIN |
| Master data upload wizard | `Permissions.DataUpload.MasterDataUpload.Import/Export` → ADMIN |

### Dependencies
- DataHub (primary modern path promotes mapped data)
- CRM + ProductSpec (resolution targets)
- Shared `MasterDataUploadService` for wizard imports

---

## DataHub

### Purpose
Data quality control tower: automated distributor sync, unmapped record queues, entity resolution (unified entities and aliases), store list management, UPC mapping, export/import jobs, and brand data cleanup.

*Source: `caboodle/src/Modules/DataHub/`*

### Domain entities (selected)

| Entity | Business meaning |
|--------|------------------|
| `DataSyncRun` | One ingestion/resolution run (provider, month, year, progress) |
| `UnmappedRecordBase` (+ KeHE/UNFI variants) | Unresolved distributor row with per-dimension status |
| `MappingSuggestion` | Scored candidate mapping for human review |
| `UnifiedEntity` / `UnifiedEntityAlias` | Canonical resolved entity with raw-value aliases |
| `StoreListEntry` | Unified store reference with geo/normalized address |
| `DistributorUpcMapping` | UPC resolution with manual/auto/ignore states |
| `ImportJob` / `ExportJob` | Async job tracking |
| `ThirdPartyCredential` | Encrypted distributor login for automated crawl |
| `BrandDataCleanupJob` | Admin brand data wipe job |

### Business rules (critical)

| Rule | Source |
|------|--------|
| Overall unmapped status: any ignored dimension → `Ignored`; all resolved → `FullyResolved`; mixed → `PartiallyResolved`; none → `Unmapped` | `UnmappedRecordBase.ComputeOverallStatus()` in `UnmappedRecordBase.cs` |
| Auto-resolved retailer or store rows **cannot** auto-promote to mapped during sync | `UnmappedRecordBase.CanPromoteToMappedDuringSync()` |
| Promotion during sync requires: retailer not auto-resolved, customer not auto-resolved, retailer eligible for store creation, customer resolved, catalog product resolved, product ID present | Same method |
| Merge unified entities: target and source IDs required and must differ | `EntityResolution/Commands/MergeUnifiedEntitiesCommand.cs` |
| Store list filter: `EmptyBannerOnly` cannot combine with `BannerId` | `StoreList/Requests/GetStoreListRequest.cs` |
| Brand data cleanup requires `Confirm == true` and non-empty brand/module list | `BrandDataCleanup/Validators/ClearBrandDataRequestValidator.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Execute data sync | Crawl distributor portal → download CSV → parse → split mapped/unmapped |
| Bulk resolve unmapped dimensions | Update retailer/store/UPC status by raw value |
| Promote fully resolved rows | Move to `KeHeMapped`/`UNFIMapped` |
| Entity resolution CRUD | Manage unified entities, aliases, merge |
| Store list CRUD/import/export | Admin store master with backfill support |
| Brand data cleanup | Async wipe of selected modules per brand |

### Who can access
| Operation | Access |
|-----------|--------|
| Entity resolution view/upsert/approve | `Permissions.DataHub.EntityResolution.View/Upsert/Update` → ADMIN |
| Many sync/unmapped query endpoints | Authenticated only (no explicit permission) |
| Some endpoints `[AllowAnonymous]` | `DataHubController.cs` — security risk if exposed in production |
| Credential manager | Uses `View` permission even for POST/PUT/DELETE |

### Dependencies
- DataUpload (mapped output tables)
- CRM (retailer, banner, store IDs)
- ProductSpec (UPC/product resolution)
- Shared `DataSyncJobService`

---

## TradeSpend (Live / BAP)

### Purpose
Records approved promotional planning and outcomes: promo containers, event-level investments, promotion fees, monthly notes, and brand-approved monthly reports.

*Source: `caboodle/src/Modules/TradeSpend/`*

### Domain entities

| Entity | Business meaning |
|--------|------------------|
| `TradeSpendPromo` | Live promo container; may link to sandbox via `SandboxPromotionID` |
| `TradeSpendPromoEvent` | Event-level promo (retailer, banner, product, dates, allowances, lift, `Status`, `IsSubmitted`) |
| `BrandApprovedPromotionFee` | Approved fee structures (lump sum, coupon, prime types) |
| `TradeSpendPromoNote` | Monthly narrative notes grid |
| `BrandApprovedMonthlyReport` | Month-by-month approved performance metrics |

### Business rules
| Rule | Source |
|------|--------|
| Promo upsert requires name, categories, events | `TradeSpend/UpsertTradeSpendPromoRequest.cs` |
| Event update requires name, start/end dates, month | `TradeSpend/UpdateTradeSpendPromoEventRequest.cs` |
| Submission status update filters broker roles to assigned brands | `TradeSpend/UpdateSubmissionStatusOfEventsRequest.cs` |
| Duplicate promo requires promo ID and year | `TradeSpend/DuplicateTradeSpendRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Upsert live promo | Create/update BAP promo and events |
| Update event submission status | Toggles `IsSubmitted` on events |
| Receive sandbox push | Creates/updates promo from sandbox; replaces all events and fees |
| Push to sandbox (reverse) | `PushPromotionToSandboxRequest` copies live → sandbox |
| Monthly report queries | Multi-year and single-year with complex sort validation |

### Who can access
- `TradeSpendsController` has **no** `MustHavePermission` attributes.
- Access gated by authentication + `BrandID` header.
- Broker submission updates additionally filtered in handler SQL.

### Dependencies
- TradeSpendSandbox (push source)
- CRM + ProductSpec (event dimensions)
- Report module (monthly report calculations)

---

## TradeSpendSandbox

### Purpose
Safe planning environment for promotional scenarios before committing to live Brand Approved Planning (BAP). Structures mirror TradeSpend but live in separate schema.

*Source: `caboodle/src/Modules/TradeSpendSandbox/`*

### Domain entities
`Promotion`, `PromotionalEvent`, `PromotionFee`, `SandboxMonthlyReport` — mirror live TradeSpend entities.

### Business rules
| Rule | Source |
|------|--------|
| Upsert requires promo name, categories, events | `Requests/UpsertPromotionRequest.cs` |
| `NumberOfStores` cannot exceed `Banner.DoorCount` | `UpsertPromotionRequest.cs` handler |
| Duplicate promo name rejected | Same handler |
| Push to TradeSpend requires promotion with at least one event | `PushPromotionToTradeSpendRequest.cs` handler |
| Push re-inserts all live events and fees (not merge) | `PushPromotionToTradeSpendRequest.cs` handler |
| Promotion fee validation is type-specific (lump sum amount, coupon fields, prime fields) | `InsertPromotionFeeRequest.cs` |
| Event status update requires promotion ID, event IDs, valid enum status | `UpdateEventsStatusRequest.cs` |

### Key operations
| Operation | What happens |
|-----------|--------------|
| Create/edit sandbox promo | Draft planning with events and fees |
| Update event status | e.g. to `RetailerApproved` |
| Push to TradeSpend | Copies to live BAP; links via `SandboxPromotionID` / `SandboxEventID` |
| Duplicate sandbox promo | Clone scenario |

### Who can access
- No permission claims on `TradeSpendsSandboxController`.
- Authenticated + brand access via `BrandID` header.

### Dependencies
- TradeSpend (push target)
- CRM BannerSKU (delete guard)
- ProductSpec, CRM entities for event dimensions

---

## Report

### Purpose
Read-model reporting queries that aggregate CRM, product, and activity data. No Domain project.

*Source: `caboodle/src/Modules/Report/Modules.Report.Application/`*

### Business rules
| Rule | Source |
|------|--------|
| Retail report activities and products require `BannerID` | `Report/GetActivitiessOfRetailReportRequest.cs`, `GetProductsOfRetailReportRequest.cs` |

### Who can access
- `ReportsController` — authenticated + brand header; no permission claims.

---

## Dashboard

### Purpose
Provides product status summary reporting for dashboard widgets. Application-only; no Domain project.

*Source: `caboodle/src/Modules/Dashboard/Modules.Dashboard.Application/Requests/ProductStatusSummaryReportRequest.cs`*

### Who can access
- `DashboardController` — authenticated; no permission claims.

---

## FileRepository

### Purpose
Brand-scoped file and folder storage for brokers and brand users, with privacy types controlling visibility.

*Source: `caboodle/src/Modules/FileRepository/`*

### Domain entities
- `UserFile`: file metadata (name, size, URL, privacy type, brand, directory)
- `FileDirectory`: folder hierarchy with privacy type

### Business rules (handler-level role branching)
| Rule | Source |
|------|--------|
| Broker/sub-broker can access files for assigned brands | Multiple handlers in `FileRepository.Application/` |
| Sub-broker requires explicit `BrandID` | Upload/update handlers |
| `BRANDOWNER` required for private files | Upload handlers |

### Who can access
- No `MustHavePermission` on controllers; role + brand logic in handlers.

---

## Intelligence ("Ask Caboodle")

### Purpose
Natural-language analytics over governed business data with full audit trail. Read-only query posture with session-based chat.

*Source: `caboodle/src/Modules/Intelligence/`*

### Domain entities
| Entity | Business meaning |
|--------|------------------|
| `ChatSession` | User chat session with brand scope and optional constraints |
| `ChatMessage` | Message with intent, query plan, SQL hash, token/cost metrics |
| `QueryAuditLog` | Full audit of prompt, plan, execution, failures |
| `MasterEntity` | Name-to-entity bridge for resolution |
| `CatalogSnapshot` / `LlmModelPricing` | Schema catalog and model pricing |

### Who can access
- `IntelligenceChatController` — authenticated; no permission claims.
- Frontend: `ask-caboodle` and `dashboard-ai` pages in Caboodle New Web.

---

## Shared

### Purpose
Cross-cutting application services and infrastructure used by all modules: bulk repositories, trade spend calculations, master data upload, data sync jobs, import/export job executors.

*Source: `caboodle/src/Modules/Shared/`*

Not a user-facing module. Key services:
- `MasterDataUploadService` — wizard import/export for all master entity types
- `DataSyncJobService` — automated distributor sync orchestration
- `SKULifecycleCalculationHelper` — SKU status calculations for reporting

---

## Store (orphan module)

### Purpose
**Unclear from code.** Contains only a `Store` domain entity identical to CRM `Store`. All store CRUD is handled by CRM Application (`Modules.CRM.Application/Store/`).

*Source: `caboodle/src/Modules/Store/Modules.Store.Domain/Store/Store.cs`*

**Recommendation for BAs:** Treat Store as part of CRM. The standalone Store module appears to be unused scaffolding.
