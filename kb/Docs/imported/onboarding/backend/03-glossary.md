---
type: Document
title: "Business Glossary (Code-Grounded)"
---

# Business Glossary (Code-Grounded)

*Each term is defined by how it appears in domain entities, enums, or handlers. Source file cited for each entry.*

For the prior glossary version, see `caboodle/docs/business/system-business-glossary.md`. This document corrects and extends that file based on code verification.

---

## Platform & tenancy

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **Brand** | The CPG manufacturer/company that owns products and business data in the tenant. Has an owning user (`UserID`), display metadata, and optional partner flag. | `Modules.Brand.Domain/Brand/Brand.cs` |
| **BrandOwner** | User role (`BRANDOWNER`) assigned to the user who owns a brand. Promoted from `UNASSIGNED` when creating a brand. | `CaboodleRoles.cs`, `UpsertBrandRequest.cs` |
| **BrandSubUser** | User role (`BRANDSUBUSER`) for additional team members linked to a brand via `BrandSubUser` entity. | `BrandSubUser.cs`, `CaboodleRoles.cs` |
| **Broker** | User role (`BROKER`) for external sales agency. Linked to brands via `BrandBroker`. | `BrandBroker.cs`, `CaboodleRoles.cs` |
| **BrokerSubUser** (Sub-Broker) | User role (`BROKERSUBUSER`) for staff under a broker. Same default permissions as Broker except cannot view broker list. | `CaboodlePermissions.SubBroker`, `CaboodleRoles.cs` |
| **Admin** | User role (`ADMIN`) with all 53 permission claims. Uses separate admin web app login. | `ApplicationDbSeeder.cs`, `TokenService.cs` |
| **UnAssigned** | Default role (`UNASSIGNED`) for new users before role assignment. No permissions or brand access. | `CaboodleRoles.cs`, `UserService.CreateUpdate.cs` |
| **BrandID header** | HTTP header sent by frontend on brand-scoped API calls. Middleware validates user can access that brand. | `BrandValidationMiddleware.cs` |

---

## Commercial master data (CRM)

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **Retailer** | Parent retail corporation (e.g. corporate account). | `CRM.Domain/Retailer/Retailer.cs` |
| **Banner** | Retail chain or banner operating under a retailer. Has door count. | `CRM.Domain/Banner/Banner.cs` |
| **Store** | Physical retail location linked to region, retailer, and banner. | `CRM.Domain/Store/Store.cs` |
| **Region** | Geographic or commercial subdivision. | `CRM.Domain/Region/Region.cs` |
| **Distributor** | Wholesale partner (e.g. UNFI, KeHE). Can have parent distributor (`ParentID`) for sub-distributor hierarchy. | `CRM.Domain/Distributor/Distributor.cs` |
| **Sub-Distributor** | Distributor with a `ParentID` pointing to another distributor. | `Distributor.ParentID` |
| **Distribution Center (DC)** | Warehouse/fulfillment node. Referenced as `DistributionCenter` or `Warehouse` on `DistributorDc`. | `CRM.Domain/Dc/DistributionCenter.cs`, `DistributorDc.cs` |
| **DistributorMarkup** | Percentage markup applied when a distributor serves a retailer or banner for a brand. Must be ≥ 0. | `DistributorRetailer.cs`, `ConnectRetailerToDistributorRequest.cs` |
| **BannerSKU** | A product's listing status at a specific banner for a brand. Includes active/disco dates, slotting fee, and status. | `CRM.Domain/Banner/BannerSKU.cs` |
| **SkuStatus** | BannerSKU lifecycle status: Active, Pending, NotActive, Declined, Discontinued, Approved, Commit. | `Enums.cs` `SkuStatus` |
| **RetailerPromoRule** | Retailer/banner-level constraints on promotion types (OI, MCB, scan allowances, new item policies). | `CRM.Domain/Banner/RetailerPromoRules.cs` |
| **Pipeline** | Sales deal tracking object with deal stage, plan, retailer, and activities. | `CRM.Domain/Pipeline/Pipeline.cs` |
| **PipelineDealStage** | Configurable stage in a sales pipeline (e.g. prospect, negotiation). Can be brand-specific or global (admin). | `PipelineDealStage.cs` |
| **Contact** | Person record associated with a brand (name, email, phone, title). | `CRM.Domain/Contact/Contact.cs` |
| **BannerActivity** | Logged activity on a banner (type, date, notes, linked contact). | `CRM.Domain/Banner/BannerActivity.cs` |

---

## Product master (ProductSpec)

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **ProductSpecification** (Product / SKU) | Brand's sellable item with UPC, name, category, pack size, physical dimensions, and distributor-specific codes. | `ProductSpecs.Domain/ProductSpec/ProductSpec.cs` |
| **UPC** (`UPCNumber`) | Universal Product Code — primary product identity for distributor feed matching. | `ProductSpecification.UPCNumber` |
| **Category** | Product grouping within a brand. | `ProductSpecs.Domain/Category/Category.cs` |
| **PriceList** | Distributor-specific pricing for a product (case price, per-unit price, valid-from date). | `ProductSpecs.Domain/PriceList/PriceList.cs` |
| **MasterPack** | Optional informational field on product spec. Documented in integration guide; does not replace case-pack logic. | `ProductSpec.cs` (field exists); `product-spec-master-pack-fe-integration.md` |
| **KeHECode / UNFICode / UNFIEastCode / UNFIWestCode** | Distributor-specific item codes stored on product for mapping. | `ProductSpecification` properties |

---

## Distributor data & mapping

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **KeHE** | Distributor data provider. Raw rows in `KeHe` table; mapped rows in `KeHeMapped`. | `DataUpload.Domain/KeHe/` |
| **UNFI** | Distributor data provider. Raw rows in `Unfi` table; mapped rows in `UNFIMapped`. | `DataUpload.Domain/UNFI/` |
| **SPINS** | Third-party retail scan data provider. Includes items ranking and stores insight reports. | `DataUpload.Domain/SPINS/` |
| **DistributorSalesRecord** | Unified sales record combining KeHE and UNFI data for cross-provider reporting. | `DistributorSalesRecord.cs` |
| **DataMapping** | Configuration row mapping an external name (from spreadsheet) to an internal entity ID, scoped by file category (banner, etc.). | `DataUpload.Domain/Mapping/DataMapping.cs` |
| **Unmapped Record** | Distributor row where one or more dimensions (retailer, customer/store, UPC) are not yet resolved. | `DataHub.Domain/SyncMechanism/UnmappedRecordBase.cs` |
| **Mapped Record** | Distributor row promoted to reporting tables after resolution. | `KeHeMapped.cs`, `UNFIMapped.cs` |
| **MappingDimensionStatus** | Per-dimension status: Mapped, Unmapped, ManuallyResolved, Ignored, AutoResolved, LocationMissing. | `Enums.cs` |
| **UnmappedRecordStatus** (Overall status) | Row-level rollup: Unmapped, PartiallyResolved, FullyResolved, Ignored, ReviewLater. | `UnmappedRecordBase.ComputeOverallStatus()` |
| **DataSyncRun** | A single automated ingestion job (provider, month, year) with progress tracking. | `DataHub.Domain/SyncMechanism/DataSyncRun.cs` |
| **MappingSuggestion** | System-generated candidate match for an unresolved value, with confidence score. | `DataHub.Domain/SyncMechanism/MappingSuggestion.cs` |
| **UnifiedEntity** | Canonical resolved business entity (retailer, store, product, etc.) with display name, lifecycle status, and aliases. | `DataHub.Domain/EntityResolution/UnifiedEntity.cs` |
| **UnifiedEntityAlias** | Raw-value alias linked to a unified entity, with source provider, confidence, and review status. | `UnifiedEntityAlias.cs` |
| **StoreListEntry** | Admin-managed unified store reference with location, normalized address, and optional link to unified store entity. | `DataHub.Domain/StoreList/StoreListEntry.cs` |
| **DistributorUpcMapping** | UPC resolution record with manual, auto-match, or ignore states. | `DataHub.Domain/UpcMapping/DistributorUpcMapping.cs` |
| **ThirdPartyCredential** | Encrypted login credentials for automated distributor portal scraping. | `DataHub.Domain/CredentialManager/Credential.cs` |
| **Ignore** (mapping action) | Explicit decision to exclude a dimension from resolution. Sets status to `Ignored`; row overall status becomes `Ignored`. | `UnmappedRecordBase.ComputeOverallStatus()` |

---

## Trade spend

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **Trade Spend** | Promotional investment tracking — allowances, fees, and events spent to drive retail movement. | `TradeSpend.Domain/` |
| **BAP** (Brand Approved Planning) | Live/approved trade spend environment. Push from sandbox returns message "pushed into BAP successfully." | `PushPromotionToTradeSpendRequestHandler` |
| **Sandbox** | Planning environment (`TradeSpendSandbox` schema) for scenario modeling before BAP commit. | `TradeSpendSandbox.Domain/` |
| **Promotion** (Sandbox) | Sandbox promo container with name, brand, and category scope. No promotion-level status enum. | `TradeSpendSandbox.Domain/Promotion/Promotion.cs` |
| **TradeSpendPromo** (Live) | Live promo container; may link to sandbox via `SandboxPromotionID`. | `TradeSpend.Domain/TradeSpend/TradeSpendPromo.cs` |
| **PromotionalEvent** / **TradeSpendPromoEvent** | Single promotional investment instance: retailer, banner, distributor, product, dates, allowances, lift assumptions, status, submission flag. | Sandbox and live domain entities |
| **PromotionEventStatus** | Event lifecycle: Active, Cancelled, Pending, DidnotRun, Declined, RetailerApproved, Completed. | `Enums.cs` |
| **IsSubmitted** | Boolean governance flag on events indicating submission for review. | `TradeSpendPromoEvent.IsSubmitted` |
| **PromotionFee** / **BrandApprovedPromotionFee** | Fee structure attached to promo (types: lump sum, coupon, prime) targeting banners/products/events. | Sandbox and live fee entities |
| **TradeSpendPromoNote** | Monthly narrative notes grid (January–December columns) with submission state. | `TradeSpendPromoNote.cs` |
| **BrandApprovedMonthlyReport** | Month-by-month approved performance metrics by distributor/retailer/banner/product. | `BrandApprovedMonthlyReport.cs` |
| **SandboxMonthlyReport** | Sandbox equivalent of monthly report. | `SandboxMonthlyReport.cs` |
| **Push to TradeSpend** | Operation copying sandbox promo, events, and fees to live BAP. Replaces all live child records. | `PushPromotionToTradeSpendRequest.cs` |

---

## Broker operations

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **Market Overview** | Point-in-time snapshot of SKU status at a retail location (region, retailer, banner, store, DC) with training/case-stack comments and launch date. | `Broker.Domain/Broker/MarketOverview.cs` |
| **Category Review** | Scheduled category review milestone with submission due date, review date, reset date, and notes. | `Broker.Domain/Broker/CategoryReview.cs` |
| **APL** (DistributorAPL) | Approved Product List — distributor warehouse item with UPC, item code, and wholesale case/unit costs. | `Broker.Domain/APL/DistributorAPL.cs` |
| **Promotional Management** | Broker view across assigned brands' promotional events. | `BrokersController`, `BrokerPromotionalManagement` permission |

---

## File & job infrastructure

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **File Repository** | Brand-scoped file and folder storage with privacy types. | `FileRepository.Domain/` |
| **PrivacyType** | Controls file visibility (private files require BrandOwner). | File upload handlers |
| **ImportJob** | Tracked async import operation with upload/progress/complete/fail states. | `DataHub.Domain/Import/ImportJob.cs` |
| **ExportJob** | Tracked async export operation. | `DataHub.Domain/Export/ExportJob.cs` |
| **BrandDataCleanupJob** | Admin job to wipe selected module data for specified brands. | `DataHub.Domain/BrandDataCleanup/` |

---

## Intelligence (AI)

| Term | Plain-English definition | Source |
|------|--------------------------|--------|
| **Ask Caboodle** | Natural-language query interface over governed business data. | `IntelligenceChatController`, frontend `ask-caboodle` page |
| **ChatSession** | Conversation session scoped to user and brand with optional year/module constraints. | `Intelligence.Domain/Chat/ChatSession.cs` |
| **QueryAuditLog** | Immutable audit of AI query: prompt, intent, plan, SQL hash, tokens, cost, outcome. | `Intelligence.Domain/Audit/QueryAuditLog.cs` |
| **MasterEntity** | Intelligence-side name-to-entity resolution cache. | `Intelligence.Domain/EntityResolution/MasterEntity.cs` |

---

## Terms used in distributor feeds

| Term | Meaning in Caboodle |
|------|---------------------|
| **Customer** (in feeds) | Store or customer account in distributor data — maps to `ResolvedCustomerId` / store entity |
| **RawRetailerValue** | Unprocessed retailer string from distributor file |
| **RawCustomerValue** | Unprocessed store/customer string from distributor file |
| **RawUpcValue** | Unprocessed UPC string from distributor file |

*Source: `UnmappedRecordBase.cs` properties*
