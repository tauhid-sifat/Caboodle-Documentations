---
type: Document
title: "Entity Relationship Summary"
---

# Entity Relationship Summary

*Audience: Business Analyst (plain language, no code required). Every relationship below is derived from the actual backend domain classes and the database mapping file, with a `file:line` citation you can hand to an engineer.*

> **Important technical note that shapes this whole document.** In this backend, entities are linked to each other almost entirely by **ID reference fields** (for example, a Banner row carries a `RetailerID` that points at a Retailer row). These are *logical* links enforced by application code, **not** hard database foreign keys. Grepping the entire database mapping file (`MainDbContext.cs`) shows that `HasOne` / `HasMany` / `HasForeignKey` / cascade-delete rules are configured **only** for the newer DataHub and Intelligence tables — **none of the core CRM, Brand, Product, or Trade-Spend entities have any database-level foreign key or cascade rule**. Practically this means: (a) deleting a parent does **not** automatically delete or block its children at the database level; (b) all entities use **soft delete** — a `Deleted` boolean flag plus `DeletedOn` / `DeletedBy`, they are never physically removed (`AuditableEntity.cs:7-15`). So throughout the "delete behavior" column, "Soft-delete; no DB cascade" is the norm, and any cascading is the application's responsibility (undetermined from the schema).

---

## The Core Chain (narrative)

A **Brand** is the tenant anchor — almost every other record carries a `BrandID`. A Brand is worked by one or more **Brokers** (outside sales agencies); that many-to-many link is the **BrandBroker** bridge (`BrandBroker.cs:11-13`). Note: "Broker" is not its own domain table — a broker is a *user* in the Identity schema, referenced by `BrokerID`.

From the Brand, the CRM side fans out into two commercial partners: **Retailers** (the store chains that sell the product) and **Distributors** (the wholesalers that move it). A Retailer owns one or more **Banners** — a Banner is a store brand/fascia (e.g. a specific chain name), holding `RetailerID` (`Banner.cs:11`). Each physical **Store** belongs to a Banner, a Retailer, and a **Region** (`Store.cs:12-14`). A Distributor connects to Retailers, Banners, Brands, and distribution centers through four bridge tables — **DistributorRetailer**, **DistributorBanner**, **DistributorBrand**, and **DistributorDc** — each of which also records the Brand context and (for the first two) a markup percentage.

Products live in the ProductSpec module as **ProductSpecification** records, each tied to a Brand and optionally a **Category**, with **PriceList** rows giving case/unit prices (optionally per Distributor). The bridge between "what a Brand sells" and "where it is carried" is **BannerSKU**: it links a Banner to a Product (`BannerSKU.ProductID`, `BannerSKU.cs:12-13`) — this is a key cross-module link from CRM into ProductSpec, tracking active/disco dates, slotting fees, and status.

Sales-planning sits on top: **Pipeline** plans (grouped under a **PipelinePlan**, staged by **PipelineDealStage**) track deals per Brand and Retailer, with **PipelineActivity** and file attachments. **Contacts** (people at a Brand) are referenced by banner and pipeline activities.

Finally, promotions come in two flavors that mirror each other. **Trade Spend** (live/committed) uses **TradeSpendPromo** → **TradeSpendPromoEvent**, and the *event* is the richest cross-module hub in the system: a single event references a Brand, Retailer, Distributor, Banner, Product, and Category all at once (`TradeSpendPromoEvent.cs:15-20`). The **Sandbox** side (**Promotion** → **PromotionalEvent**) is a what-if planning mirror with the same shape; a sandbox promotion can be promoted to a live one, tracked by `TradeSpendPromo.SandboxPromotionID` and `TradeSpendPromoEvent.SandboxEventID` (`TradeSpendPromo.cs:17`, `TradeSpendPromoEvent.cs:14`).

---

## Entities by Module

### Brand module (schema `Brand`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| Brand | The tenant / manufacturer whose products are sold. Anchor of nearly every record. | `Brand.Brands` | `Brand.cs:5`, `MainDbContext.cs:279-281` |
| BrandSubUser | Links an additional user to a Brand (team access). | `Brand.BrandSubUsers` | `BrandSubUser.cs:6-7`, `MainDbContext.cs:285-287` |
| BrandBroker | Bridge: which Broker (and parent broker) serves a Brand. | `Brand.BrandBrokers` | `BrandBroker.cs:11-13`, `MainDbContext.cs:282-284` |

### CRM module (schema `CRM`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| Distributor | Wholesaler that moves product; can have a parent (hierarchy) via `ParentID`. | `CRM.Distributors` | `Distributor.cs:5,14`, `MainDbContext.cs:168-170` |
| Retailer | Store chain / corporate account that sells product. | `CRM.Retailers` | `Retailer.cs:4`, `MainDbContext.cs:182-184` |
| Banner | A retailer's store brand/fascia; belongs to a Retailer and optionally a Region. | `CRM.Banners` | `Banner.cs:11-12`, `MainDbContext.cs:186-188` |
| BannerSKU | A product carried under a Banner (active/disco dates, slotting, status). | `CRM.BannerSKUs` | `BannerSKU.cs:11-17`, `MainDbContext.cs:192-194` |
| BannerActivity | A logged interaction/note against a Banner. | `CRM.BannerActivities` | `BannerActivity.cs:6-11`, `MainDbContext.cs:189-191` |
| BannerActivityType | Lookup of activity types for banner activities. | `CRM.BannerActivityTypes` | `BannerActivityType.cs:6`, `MainDbContext.cs:195-197` |
| RetailerPromoRule | Promo policy rules for a Retailer/Banner/Region combination. | `CRM.RetailerPromoRules` | `RetailerPromoRules.cs:11-13`, `MainDbContext.cs:198-200` |
| Store | A physical store location (Region + Retailer + Banner). | `CRM.Stores` | `Store.cs:12-14`, `MainDbContext.cs:347-349` |
| Contact | A person associated with a Brand (name, email, phone). | `CRM.Contacts` | `Contact.cs:11`, `MainDbContext.cs:201-203` |
| Region | A geographic region (name + address). | `CRM.Regions` | `Region.cs:11`, `MainDbContext.cs:204-206` |
| DistributionCenter | A warehouse/DC (standalone name record). | `CRM.DistributionCenters` | `DistributionCenter.cs:11`, `MainDbContext.cs:230-232` |
| DistributorRetailer | Bridge: Distributor ↔ Retailer (+ markup, Brand). | `CRM.DistributorRetailers` | `DistributorRetailer.cs:12-15`, `MainDbContext.cs:176-178` |
| DistributorBanner | Bridge: Distributor ↔ Banner (+ markup, Brand). | `CRM.DistributorBanners` | `DistributorBanner.cs:11-14`, `MainDbContext.cs:180` |
| DistributorBrand | Bridge: Distributor ↔ Brand (+ optional distributor parent). | `CRM.DistributorBrands` | `DistributorBrand.cs:12-14`, `MainDbContext.cs:172-174` |
| DistributorDc | Bridge: Distributor ↔ Region as a named warehouse. | `CRM.DistributorDcs` | `DistributorDc.cs:11-13`, `MainDbContext.cs:224-226` |
| RetailerRegion | Bridge: Retailer ↔ Region (+ optional Banner). | `CRM.RetailerRegions` | `RetailerRegion.cs:11-13`, `MainDbContext.cs:227-229` |
| PipelinePlan | A named container/plan grouping pipeline deals for a Brand. | `CRM.PipelinePlans` | `PipelinePlan.cs:6-7`, `MainDbContext.cs:216-218` |
| Pipeline | A single deal in the pipeline (Brand, stage, optional Plan & Retailer). | `CRM.Pipelines` | `Pipeline.cs:6-11`, `MainDbContext.cs:207-209` |
| PipelineDealStage | The stage/column a pipeline deal sits in (optionally per Brand). | `CRM.PipelineDealStages` | `PipelineDealStage.cs:6-8`, `MainDbContext.cs:220-222` |
| PipelineActivity | An activity logged on a pipeline deal (optional Contact / BannerActivity). | `CRM.PipelineActivities` | `PipelineActivity.cs:6-9`, `MainDbContext.cs:210-212` |
| PipelineActivityFile | A file attached to a pipeline activity. | `CRM.PipelineActivityFiles` | `PipelineActivityFile.cs:6-10`, `MainDbContext.cs:213-215` |

### ProductSpec module (schema `ProductSpecs`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| ProductSpecification | A product/item with UPC, sizing, codes; belongs to a Brand & optional Category. | `ProductSpecs.ProductSpecifications` | `ProductSpec.cs:5,12-13`, `MainDbContext.cs:240-243` |
| Category | A product category, per Brand. | `ProductSpecs.Categories` | `Category.cs:5,12`, `MainDbContext.cs:235-238` |
| PriceList | Case/unit price for a Product (per Brand, optional Distributor & Category). | `ProductSpecs.PriceList` | `PriceList.cs:11-15`, `MainDbContext.cs:245-247` |

### Broker module (schema `Broker`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| CategoryReview | A scheduled category review (Brokerage, Brand, Region, Retailer). | `Broker.CategoryReviews` | `CategoryReview.cs:11-16`, `MainDbContext.cs:316-318` |
| CategoryReviewCalender | Bridge putting a CategoryReview onto a Brand's calendar. | `Broker.CategoryReviewCalender` | `CategoryReviewCalender.cs:11-12`, `MainDbContext.cs:320-322` |
| MarketOverview | A market-status record spanning Region/Retailer/Banner/Store/DC/Brand/SKU. | `Broker.MarketOverviews` | `MarketOverview.cs:12-19`, `MainDbContext.cs:312-314` |
| DistributorAPL | Distributor authorized-product-list line (DC + UPC + wholesale costs). | `Broker.DistributorAPLs` | `DistributorAPL.cs:11-15`, `MainDbContext.cs:324-326` |

### TradeSpend module — live promotions (schema `TradeSpend`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| TradeSpendPromo | A live promo container for a Brand (+ list of CategoryIDs; optional link to a Sandbox promotion). | `TradeSpend.TradeSpendPromos` | `TradeSpendPromo.cs:13-17`, `MainDbContext.cs:290-292` |
| TradeSpendPromoEvent | A concrete promo event; references Brand, Retailer, Distributor, Banner, Product, Category. | `TradeSpend.TradeSpendPromoEvents` | `TradeSpendPromoEvent.cs:13-20`, `MainDbContext.cs:293-295` |
| TradeSpendPromoNote | Per-Brand, per-year monthly free-text notes. | `TradeSpend.TradeSpendPromoNotes` | `TradeSpendPromoNote.cs:7-9`, `MainDbContext.cs:296-298` |
| BrandApprovedMonthlyReport | Snapshot monthly report; Distributor/Retailer/Banner/Product stored as **text**, not IDs. | `TradeSpend.BrandApprovedMonthlyReport` | `BrandApprovedMonthlyReport.cs:13-19`, `MainDbContext.cs:299-301` |

### TradeSpendSandbox module — what-if planning (schema `TradeSpendSandbox`)
| Entity | Meaning | Table | Cite |
|---|---|---|---|
| Promotion | Sandbox (what-if) promo container for a Brand (+ CategoryIDs). | `TradeSpendSandbox.Promotions` | `Promotion.cs:13-16`, `MainDbContext.cs:352-354` |
| PromotionalEvent | Sandbox promo event mirroring TradeSpendPromoEvent's shape. | `TradeSpendSandbox.PromotionalEvents` | `PromotionalEvent.cs:12-17`, `MainDbContext.cs:356-358` |
| SandboxMonthlyReport | Sandbox monthly report snapshot (text Distributor/Retailer/Banner/Product). | `TradeSpendSandbox.SandboxMonthlyReport` | `SandboxMonthlyReport.cs:13-19`, `MainDbContext.cs:360-362` |

*(A duplicate `Store` class also exists in a standalone `Store` module (`Store.cs:5-15` under `Modules.Stores.Domain`) but the mapped/used table is the CRM `Store` — `MainDbContext.cs:347-349` maps `Caboodle.Modules.CRM.Domain.Store` to `CRM.Stores`.)*

---

## Relationships

*Cardinality is inferred from the ID-reference fields. "Delete behavior" is soft-delete with no DB cascade unless stated (see top note).*

### Brand module
| Entity A | Relationship | Entity B | Cardinality | Delete behavior | Cite |
|---|---|---|---|---|---|
| Brand | is served by (via BrandBroker) | Broker (Identity user) | N:N | Soft-delete; no DB cascade | `BrandBroker.cs:11-12` |
| Brand | has team members (via BrandSubUser) | User (Identity) | 1:N | Soft-delete; no DB cascade | `BrandSubUser.cs:6-7` |
| BrandBroker | may reference a parent broker | Broker (Identity user) | N:1 (optional) | Soft-delete; no DB cascade | `BrandBroker.cs:13` |

### CRM module
| Entity A | Relationship | Entity B | Cardinality | Delete behavior | Cite |
|---|---|---|---|---|---|
| Retailer | owns | Banner | 1:N | Soft-delete; no DB cascade | `Banner.cs:11` |
| Banner | located in (optional) | Region | N:1 | Soft-delete; no DB cascade | `Banner.cs:12` |
| Banner | carries (via BannerSKU) | Product | 1:N SKUs | Soft-delete; no DB cascade | `BannerSKU.cs:12-13` |
| Banner | has | BannerActivity | 1:N | Soft-delete; no DB cascade | `BannerActivity.cs:6` |
| BannerActivityType | classifies | BannerActivity | 1:N (optional) | Soft-delete; no DB cascade | `BannerActivity.cs:9` |
| Contact | referenced by (optional) | BannerActivity | 1:N | Soft-delete; no DB cascade | `BannerActivity.cs:8` |
| Store | belongs to | Banner / Retailer / Region | N:1 each | Soft-delete; no DB cascade | `Store.cs:12-14` |
| RetailerPromoRule | applies to | Retailer / Banner / Region | N:1 each | Soft-delete; no DB cascade | `RetailerPromoRules.cs:11-13` |
| Distributor | has parent (optional, self-ref) | Distributor | N:1 | Soft-delete; no DB cascade | `Distributor.cs:14` |
| Distributor | linked to (via DistributorRetailer) | Retailer | N:N (+markup, Brand) | Soft-delete; no DB cascade | `DistributorRetailer.cs:12-15` |
| Distributor | linked to (via DistributorBanner) | Banner | N:N (+markup, Brand) | Soft-delete; no DB cascade | `DistributorBanner.cs:11-14` |
| Distributor | linked to (via DistributorBrand) | Brand | N:N | Soft-delete; no DB cascade | `DistributorBrand.cs:12-14` |
| Distributor | has warehouses (via DistributorDc) | Region | N:N (+Warehouse) | Soft-delete; no DB cascade | `DistributorDc.cs:11-13` |
| Retailer | linked to (via RetailerRegion) | Region | N:N (+optional Banner) | Soft-delete; no DB cascade | `RetailerRegion.cs:11-13` |
| Contact | belongs to | Brand | N:1 | Soft-delete; no DB cascade | `Contact.cs:11` |
| PipelinePlan | groups (via Pipeline.PlanID, optional) | Pipeline | 1:N | Soft-delete; no DB cascade | `Pipeline.cs:7` |
| PipelineDealStage | stages | Pipeline | 1:N | Soft-delete; no DB cascade | `Pipeline.cs:9` |
| Pipeline | for | Brand | N:1 | Soft-delete; no DB cascade | `Pipeline.cs:8` |
| Pipeline | targets (optional) | Retailer | N:1 | Soft-delete; no DB cascade | `Pipeline.cs:10` |
| Pipeline | has | PipelineActivity | 1:N | Soft-delete; no DB cascade | `PipelineActivity.cs:6` |
| PipelineActivity | references (optional) | Contact | N:1 | Soft-delete; no DB cascade | `PipelineActivity.cs:8` |
| PipelineActivity | references (optional) | BannerActivity | N:1 | Soft-delete; no DB cascade | `PipelineActivity.cs:7` |
| PipelineActivity | has attachments | PipelineActivityFile | 1:N | Soft-delete; no DB cascade | `PipelineActivityFile.cs:6` |
| PipelineDealStage | scoped to (optional) | Brand | N:1 | Soft-delete; no DB cascade | `PipelineDealStage.cs:6` |
| PipelinePlan | belongs to | Brand | N:1 | Soft-delete; no DB cascade | `PipelinePlan.cs:6` |

### ProductSpec module
| Entity A | Relationship | Entity B | Cardinality | Delete behavior | Cite |
|---|---|---|---|---|---|
| Brand | owns | ProductSpecification | 1:N | Soft-delete; no DB cascade | `ProductSpec.cs:13` |
| Category | groups (optional) | ProductSpecification | 1:N | Soft-delete; no DB cascade | `ProductSpec.cs:12` |
| Brand | owns | Category | 1:N | Soft-delete; no DB cascade | `Category.cs:12` |
| Product | priced by | PriceList | 1:N | Soft-delete; no DB cascade | `PriceList.cs:12` |
| Brand | owns | PriceList | 1:N | Soft-delete; no DB cascade | `PriceList.cs:11` |
| Distributor | referenced by (optional) | PriceList | 1:N | Soft-delete; no DB cascade | `PriceList.cs:14` |
| Category | referenced by (optional) | PriceList | 1:N | Soft-delete; no DB cascade | `PriceList.cs:15` |

### Broker module
| Entity A | Relationship | Entity B | Cardinality | Delete behavior | Cite |
|---|---|---|---|---|---|
| CategoryReview | for (optional) | Brand / Region / Retailer | N:1 each | Soft-delete; no DB cascade | `CategoryReview.cs:12-15` |
| CategoryReview | belongs to Brokerage (optional) | Broker (Identity user) | N:1 | Soft-delete; no DB cascade | `CategoryReview.cs:11` |
| CategoryReviewCalender | places on calendar | CategoryReview (+ Brand) | N:1 | Soft-delete; no DB cascade | `CategoryReviewCalender.cs:11-12` |
| DistributorAPL | keyed by | DistributionCenter (DCID) | N:1 | Soft-delete; no DB cascade | `DistributorAPL.cs:11` |

### Cross-module links
| Entity A (module) | Relationship | Entity B (module) | Cardinality | Delete behavior | Cite |
|---|---|---|---|---|---|
| BannerSKU (CRM) | is the product carried | ProductSpecification (ProductSpec) | N:1 | Soft-delete; no DB cascade | `BannerSKU.cs:13` |
| BannerSKU (CRM) | scoped to | Brand (Brand) | N:1 | Soft-delete; no DB cascade | `BannerSKU.cs:11` |
| TradeSpendPromoEvent (TradeSpend) | references | Retailer, Distributor, Banner (CRM) | N:1 each | Soft-delete; no DB cascade | `TradeSpendPromoEvent.cs:16-18` |
| TradeSpendPromoEvent (TradeSpend) | references | Product, Category (ProductSpec) | N:1 each | Soft-delete; no DB cascade | `TradeSpendPromoEvent.cs:19-20` |
| TradeSpendPromoEvent (TradeSpend) | belongs to | TradeSpendPromo (TradeSpend) | N:1 | Soft-delete; no DB cascade | `TradeSpendPromoEvent.cs:13` |
| TradeSpendPromoEvent (TradeSpend) | promoted from (optional) | PromotionalEvent (Sandbox) | N:1 | Soft-delete; no DB cascade | `TradeSpendPromoEvent.cs:14` |
| TradeSpendPromo (TradeSpend) | promoted from (optional) | Promotion (Sandbox) | N:1 | Soft-delete; no DB cascade | `TradeSpendPromo.cs:17` |
| TradeSpendPromo (TradeSpend) | tags (jsonb list) | Category (ProductSpec) | N:N (embedded IDs) | Soft-delete; no DB cascade | `TradeSpendPromo.cs:15-16` |
| PromotionalEvent (Sandbox) | references | Retailer, Banner (CRM) | N:1 each | Soft-delete; no DB cascade | `PromotionalEvent.cs:14-15` |
| PromotionalEvent (Sandbox) | references | Product, Category (ProductSpec) | N:1 each | Soft-delete; no DB cascade | `PromotionalEvent.cs:16-17` |
| PromotionalEvent (Sandbox) | belongs to | Promotion (Sandbox) | N:1 | Soft-delete; no DB cascade | `PromotionalEvent.cs:12` |
| Promotion (Sandbox) | tags (jsonb list) | Category (ProductSpec) | N:N (embedded IDs) | Soft-delete; no DB cascade | `Promotion.cs:15-16` |
| MarketOverview (Broker) | references | Region, Retailer, Banner, Store, DC, Brand (CRM/Brand) | N:1 each | Soft-delete; no DB cascade | `MarketOverview.cs:12-17` |
| MarketOverview (Broker) | references | SKUID (see Unclear) | N:1 | Soft-delete; no DB cascade | `MarketOverview.cs:18` |
| Pipeline / Contact / Category / etc. | scoped to | Brand (Brand) | N:1 | Soft-delete; no DB cascade | multiple `BrandID` props |

---

## Join / Link (Bridge) Entities

| Bridge | Connects | Extra fields it carries | Cite |
|---|---|---|---|
| **BrandBroker** | Brand ↔ Broker (user) | `ParentBrokerID` (optional parent broker) | `BrandBroker.cs:11-13` |
| **BrandSubUser** | Brand ↔ User | (none) | `BrandSubUser.cs:6-7` |
| **DistributorRetailer** | Distributor ↔ Retailer | `DistributorMarkup`, `BrandID` (Brand context) | `DistributorRetailer.cs:12-15` |
| **DistributorBanner** | Distributor ↔ Banner | `DistributorMarkup`, `BrandID` | `DistributorBanner.cs:11-14` |
| **DistributorBrand** | Distributor ↔ Brand | `DistributorParentID` (optional) | `DistributorBrand.cs:12-14` |
| **DistributorDc** | Distributor ↔ Region | `Warehouse` (name of the DC) | `DistributorDc.cs:11-13` |
| **RetailerRegion** | Retailer ↔ Region | `BannerID` (optional banner in that region) | `RetailerRegion.cs:11-13` |
| **BannerSKU** | Banner ↔ Product | `BrandID`, `ActiveDate`, `DiscoDate`, `Slotting`, `Status` | `BannerSKU.cs:11-17` |
| **CategoryReviewCalender** | Brand ↔ CategoryReview | (join only) | `CategoryReviewCalender.cs:11-12` |
| **PipelinePlan / Pipeline** | (not a bridge, but PipelinePlan groups Pipeline deals via `Pipeline.PlanID`) | see Pipeline fields | `Pipeline.cs:7` |

*Note: DistributorDc doubles as the effective "distribution center" concept and carries a free-text `Warehouse`. There is also a separate standalone `DistributionCenter` table (`CRM.DistributionCenters`) referenced by `DistributorAPL.DCID` and `MarketOverview.DCID` — these two "DC" notions are not linked by any FK in code (see Unclear).*

---

## Unclear / Undetermined Relationships

- **No database-enforced foreign keys or cascade rules on core entities.** Confirmed by grepping `HasOne`/`HasMany`/`HasForeignKey` across all core modules — zero matches; only DataHub/Intelligence tables define them (`MainDbContext.cs:447-451, 843-851`). So *what happens to children when a parent is deleted* is **application logic, not determinable from the schema.** Everything is soft-deleted (`Deleted` flag, `AuditableEntity.cs:15`).
- **"Broker" is not a domain entity.** `BrokerID`, `ParentBrokerID` (`BrandBroker.cs:11-13`) and `BrokerageCompanyID` (`CategoryReview.cs:11`) point at users in the Identity schema, not a Broker table. The exact identity table/type is Unclear from code — needs confirmation against the Identity module.
- **`MarketOverview.SKUID`** (`MarketOverview.cs:18`): named "SKU" but it is ambiguous whether it points at a `BannerSKU` (CRM) or a `ProductSpecification` (ProductSpec). No FK to confirm. Unclear from code — which table SKUID references.
- **Two "distribution center" concepts.** `DistributionCenter` (`CRM.DistributionCenters`) vs. `DistributorDc` (Distributor↔Region + warehouse name). `DistributorAPL.DCID` and `MarketOverview.DCID` reference a "DC" by Guid but there is no FK; whether they target `DistributionCenter` or `DistributorDc` is Unclear from code.
- **Monthly-report entities store partners as text, not IDs.** `BrandApprovedMonthlyReport` and `SandboxMonthlyReport` keep `Distributor`, `Retailer`, `Banner`, `Product` as **strings** (`BrandApprovedMonthlyReport.cs:14-17`), so they are denormalized snapshots with **no relational link** back to the CRM/ProductSpec rows.
- **`DistributorAPL.UPCNumber`** (`DistributorAPL.cs:13`) presumably matches `ProductSpecification.UPCNumber`, but this is a value match, not a modeled relationship — no `ProductID`. Unclear from code whether/how it is joined.
- **`Pipeline.PlanID` is optional** (`Pipeline.cs:7`), so some pipeline deals may exist without a PipelinePlan; the exact business rule is undetermined.
- **`TradeSpendPromo`/`Promotion` `CategoryIDs`** are stored as a `jsonb` list of Guids (`TradeSpendPromo.cs:15-16`), not a join table — a soft/embedded N:N to Category with no referential integrity.
