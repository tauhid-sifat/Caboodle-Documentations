# Entity Relationship Summary

*Derived from EF Core domain models in `caboodle/src/Modules/*/Modules.*.Domain/` and `ApplicationDbContext`. Plain-language descriptions only — not a database diagram.*

---

## Ownership anchor

**Brand** is the root tenant entity. Nearly all operational data is scoped to a `BrandID`. Users access brands through role-based links:

```
User ──(owns)──> Brand                    [Brand.UserID]           BrandOwner
User ──(member)──> BrandSubUser ──> Brand                         BrandSubUser
User ──(represents)──> BrandBroker ──> Brand                      Broker / BrokerSubUser
```

*Sources: `Brand.cs`, `BrandSubUser.cs`, `BrandBroker.cs`, `BrandValidationMiddleware.cs`*

---

## Product hierarchy

```
Brand ──has many──> Category
Brand ──has many──> ProductSpecification (SKU)
Category ──groups──> ProductSpecification
ProductSpecification ──has many──> PriceList (per distributor)
Distributor ──priced in──> PriceList
```

A product is identified primarily by **UPC** and belongs to exactly one brand. Price lists add distributor-specific pricing on top of the product master.

*Sources: `ProductSpecification.cs`, `Category.cs`, `PriceList.cs`*

---

## Retail hierarchy

```
Retailer ──has many──> Banner ──has many──> Store
Region ──scopes──> Banner, Store, DistributorDc
Retailer ──linked via──> RetailerRegion ──> Region (optional Banner specialization)
```

Retail structure is largely **shared across brands** (admin-managed), while brand-specific availability is expressed through BannerSKU.

*Sources: `Retailer.cs`, `Banner.cs`, `Store.cs`, `Region.cs`, `RetailerRegion.cs`*

---

## Distribution route-to-market

```
Brand ──many-to-many──> Distributor           [DistributorBrand]
Distributor ──serves──> Retailer (per brand)  [DistributorRetailer + DistributorMarkup]
Distributor ──serves──> Banner (per brand)    [DistributorBanner + DistributorMarkup]
Distributor ──fulfills via──> DC              [DistributorDc ──> DistributionCenter]
Distributor ──may have parent──> Distributor  [Distributor.ParentID = sub-distributor]
```

Markup can differ by retailer or banner within the same brand-distributor relationship.

*Sources: `DistributorBrand.cs`, `DistributorRetailer.cs`, `DistributorBanner.cs`, `DistributorDc.cs`*

---

## Product availability at retail

```
Brand + Banner + ProductSpecification ──> BannerSKU
```

BannerSKU carries listing status (Active, Pending, Discontinued, etc.), active/disco dates, and slotting. It is the bridge between product master and retail execution.

**Guard:** BannerSKU cannot be deleted if the product+banner pair is referenced in a sandbox promotional event.

*Sources: `BannerSKU.cs`, `DeleteBannerSKURequest.cs`*

---

## Distributor data flow

```
ThirdPartyCredential (brand + provider)
        │
        v
DataSyncRun (brand + provider + month + year)
        │
        ├──> Raw rows (KeHe / Unfi)                    [DataUpload schema]
        │
        ├──> Unmapped rows (UnmappedKeHeRecord / UnmappedUNFIRecord)
        │         │
        │         ├── per-dimension status: Retailer, Customer, UPC
        │         └── MappingSuggestion (candidate matches)
        │
        └──> Mapped rows (KeHeMapped / UNFIMapped)     [after resolution]
                    │
                    └──> DistributorSalesRecord         [unified cross-provider]
```

Each unmapped row tracks three independent mapping dimensions. Overall status is computed from all three.

*Sources: `UnmappedRecordBase.cs`, `DataSyncRun.cs`, `DistributorSalesRecord.cs`*

---

## Entity resolution (canonical naming)

```
UnifiedEntity (canonical name, type, lifecycle)
        │
        ├── has many ──> UnifiedEntityAlias (raw value, provider, confidence, status)
        │
        └── audited by ──> UnifiedEntityAliasAudit

AliasMatchAttempt (matching algorithm audit trail)
StoreListEntry ──may link to──> UnifiedStoreEntityId
DistributorUpcMapping ──resolves──> ProductSpecification
```

Unified entities provide canonical names for noisy distributor raw values.

*Sources: `UnifiedEntity.cs`, `UnifiedEntityAlias.cs`, `StoreListEntry.cs`, `DistributorUpcMapping.cs`*

---

## Trade spend structure

```
Sandbox:
  Promotion ──has many──> PromotionalEvent
  Promotion ──has many──> PromotionFee
  Promotion ──has many──> SandboxMonthlyReport

Live (BAP):
  TradeSpendPromo ──has many──> TradeSpendPromoEvent
  TradeSpendPromo ──has many──> BrandApprovedPromotionFee
  TradeSpendPromo ──has many──> TradeSpendPromoNote
  Brand ──has many──> BrandApprovedMonthlyReport

Cross-link:
  Promotion.SandboxPromotionID <──> TradeSpendPromo.SandboxPromotionID
  PromotionalEvent.SandboxEventID <──> TradeSpendPromoEvent.SandboxEventID
```

Sandbox and live structures mirror each other. Push copies sandbox → live and establishes ID cross-references.

*Sources: TradeSpend and TradeSpendSandbox domain entities, `PushPromotionToTradeSpendRequest.cs`*

---

## Trade spend event dimensions

Each promotional event (sandbox or live) references:

```
PromotionalEvent / TradeSpendPromoEvent
        ├── Brand (implicit via promotion)
        ├── RetailerID
        ├── BannerID
        ├── DistributorID
        ├── ProductID (ProductSpecification)
        ├── CategoryID
        ├── dates (StartDate, EndDate, Month)
        ├── financial fields (allowances, lift, per-unit price, etc.)
        ├── PromotionEventStatus
        └── IsSubmitted
```

*Sources: `PromotionalEvent.cs`, `TradeSpendPromoEvent.cs`*

---

## Broker artifacts

```
MarketOverview ──references──> Region, Retailer, Banner, Store, DC, Brand, SKU
CategoryReview ──references──> Brand, Region, Retailer
CategoryReviewCalender ──links──> CategoryReview
DistributorAPL ──references──> DC, UPC (product), costs
```

Broker records are planning/execution artifacts anchored to CRM and product master IDs.

*Sources: Broker domain entities*

---

## CRM pipeline

```
PipelinePlan ──has many──> Pipeline ──has many──> PipelineActivity
Pipeline ──references──> PipelineDealStage, Retailer, Brand
PipelineActivity ──may link──> BannerActivity, Contact
PipelineActivity ──has many──> PipelineActivityFile
```

*Sources: CRM Pipeline domain entities*

---

## File repository

```
FileDirectory (tree, brand, privacy type)
        └── has many ──> UserFile
```

*Sources: `FileDirectory.cs`, `UserFile.cs`*

---

## Intelligence

```
ChatSession (user, brand) ──has many──> ChatMessage
ChatSession ──audited via──> QueryAuditLog
MasterEntity ──bridges──> actual CRM/Data entity by ID and type
```

*Sources: Intelligence domain entities*

---

## Legacy data mapping (master import)

```
DataMapping ──maps──> external name + FileCategory ──> EntityID (Banner, etc.)
```

Used during master data upload when spreadsheet names don't match system names. Unrecognized names create stub mappings for later resolution.

*Sources: `DataMapping.cs`, `MasterDataUploadService.BannerSkusImport`*

---

## Key cardinalities (business rules)

| Relationship | Cardinality | Notes |
|--------------|-------------|-------|
| Brand → Product | 1 : many | Product belongs to one brand |
| Brand → BannerSKU | 1 : many | Via brand + banner + product triple |
| Retailer → Banner | 1 : many | Banner belongs to one retailer |
| Banner → Store | 1 : many | Store belongs to one banner |
| Brand ↔ Distributor | many : many | Via DistributorBrand |
| Promotion → Events | 1 : many | Push requires ≥ 1 event |
| UnifiedEntity → Aliases | 1 : many | One primary alias |
| Unmapped row → Dimensions | 1 : 3 | Retailer, customer, UPC independently tracked |
