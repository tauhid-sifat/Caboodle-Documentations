# Caboodle Glossary

> Audience: Business Analyst. Every term below is defined from how the **code actually uses it**, with a representative source. Where a term's meaning isn't spelled out in code, it says so.

## People & tenancy

- **Brand** — The central tenant. Almost every record in the system carries a `BrandID`. A Brand has a single optional owner plus descriptive fields (logo, web/banner URLs, slug, vendor, an `IsPartner` flag). Source: `Modules.Brand.Domain/.../Brand.cs`.
- **Brand Owner (`BRANDOWNER`)** — The primary user of a brand's workspace. Recorded as the Brand's single `UserID`; only one owner per brand.
- **Brand Sub-User (`BRANDSUBUSER`)** — An additional user under one brand, linked via a `BrandSubUser` record; belongs to only one brand.
- **Broker (`BROKER`)** — A sales agency that represents brands to the retail trade. It is **not a database table** — it's a user account carrying the BROKER role. Source: `Modules.Broker.Application/.../GetBrokersRequest.cs:83`.
- **Broker Sub-User / Sub-Broker (`BROKERSUBUSER`)** — A user under a broker. Created via the generic user-invite with a `ParentUserID`; inherits the broker's brand access and permission set. Distinct role from a Brand Sub-User.
- **Unassigned (`UNASSIGNED`)** — The default role a self-registered user receives before an admin gives them a real role. Source: `UserService.CreateUpdate.cs`.
- **Admin (`ADMIN`)** — Platform administrator; the only role the seeder grants the full permission catalog.
- **BrandBroker** — The link record connecting a Brand to the broker(s) that represent it; brand assignments to a top-level broker cascade to its sub-brokers. Source: `Modules.Brand.Domain/.../BrandBroker.cs`.

## CRM entities

- **Retailer** — A retail chain/customer. A Retailer owns Banners and maps to one Distributor per brand. Source: `Modules.CRM.Domain/Retailer/Retailer.cs`.
- **Distributor** — A wholesaler that delivers product to retailers. **Self-referencing:** a top-level distributor has no parent; a child distributor is a **"Delivery Method"** (a.k.a. sub-distributor). Source: `Modules.CRM.Domain/Distributor/Distributor.cs`.
- **Delivery Method** — A sub-distributor (a Distributor with a `ParentID`); the terms are used interchangeably in code.
- **Distribution Center (DC)** — A distributor warehouse/region node. Note there are **two DC concepts** in code (`DistributionCenter` and the `DistributorDc` link) — see [Known Gaps](05-known-gaps.md).
- **Banner** — A retail store brand/fascia under a Retailer (e.g. a chain's specific store format). Carries a **door count** (number of stores). Source: `Modules.CRM.Domain/Banner/Banner.cs`.
- **BannerSKU** — The link that says "this Banner carries this Product." Bridges a Banner to a `ProductSpecification`. Has an untyped integer `Status`. Source: `Modules.CRM.Domain/Banner/BannerSKU.cs`.
- **Store** — A single physical store location, rolling up to a Banner + Retailer + Region. Source: `Modules.CRM.Domain/Store/Store.cs` (a second, unfinished Store entity also exists in the Store module).
- **Region** — A geographic grouping used to organize retailers/distributors. Linked to retailers via `RetailerRegion`.
- **Contact** — A person record (name, email, phone) attached to a brand; must be unique by email/phone within a brand. Source: `Modules.CRM.Application/Contacts/UpsertContactRequest.cs:92`.
- **Distributor Markup** — A percentage carried on the `DistributorRetailer` / `DistributorBanner` link records, used in pricing math.
- **Join/bridge records** — `DistributorRetailer`, `DistributorBanner`, `DistributorBrand`, `DistributorDc`, `RetailerRegion`, `BrandBroker`, `BannerSKU` — each connects two entities (usually per-brand). See [Entity Relationships](03-entity-relationships.md).

## Products & pricing

- **Category** — A product grouping; can be hierarchical (leaf categories matter for price generation). A Product belongs to one Category via `CategoryID`.
- **Product / Product Specification / SKU** — A sellable product, keyed by **UPC**. Required fields: name, case pack, category, UPC. Carries case/master pack, size, dimensions, weights, and distributor codes (KeHe/UNFI). Source: `Modules.ProductSpecs.Domain/.../ProductSpec.cs`.
- **UPC** — Universal Product Code; the product's unique identifier (must be unique per brand). Stored stripped of some punctuation.
- **Case Pack / Master Pack** — Units per case / cases per master carton.
- **Price List** — A price for a Product from a Distributor, effective from a date. Modeled as **product × distributor × ValidFrom**, with **no end date** — price history is a series of dated rows. Source: `Modules.ProductSpecs.Domain/.../PriceList.cs:18`.
- **ValidFrom** — The effective date of a price-list row. Editing it creates a *new* price row rather than updating in place.

## Sales pipeline

- **Plan** — A pipeline board. Source: `Modules.CRM.Domain/Pipeline/PipelinePlan.cs`.
- **Pipeline (card / "Task")** — A single deal that sits in exactly one Deal Stage column, with an ordered `DisplayOrder`.
- **Deal Stage** — A column on the board (data-driven, not hard-coded); can be global (`BrandID` null) or brand-specific. A card moves between stages via a dedicated operation. Source: `Modules.CRM.Domain/Pipeline/PipelineDealStage.cs`.
- **Pipeline Activity** — A dated note/attachment on a deal card.

## Trade spend & promotions

- **Trade Spend** — The discipline of planning and funding retail promotions; the "live" module. Source: `Modules.TradeSpend.*`.
- **Promo / Promotion** — A planned promotional campaign header (name, brand, categories). Live promos are `TradeSpendPromo`; sandbox promos are `Promotion`.
- **Promo Event** — One promotional activity under a promo, for a specific period, retailer, banner, and product. Holds the financial inputs. Live: `TradeSpendPromoEvent`; sandbox: `PromotionalEvent`.
- **TPR (Temporary Price Reduction)** — A time-limited promoted price; the default promotion type ("Regular").
- **EDLP (Every Day Low Price)** — A promotion type whose events span a full calendar year rather than a single month. Source: `PromotionType` enum, `Enums.cs:143`.
- **Allowance** — Promotional funding per unit/case. Variants in code: **Everyday Allowance**, **Promoted Unit Scan Allowance**, **Promoted Case Allowance (OI)** (off-invoice), **Promoted Case Allowance (MCB)** (manufacturer charge-back).
- **Lump Sum Proposed / TPR Fee** — A flat promotional fee for an event; summed into "TPR Fees" and shown as add-fee filter options.
- **Lift** — The expected sales uplift % during the promotion (`EventLift`); `ActualLift` is the realized value.
- **ACV (Banner ACV)** — All-Commodity Volume, a measure of a banner's market coverage weight.
- **Scan %** — The share of units expected to scan at the promoted price.
- **Average Weekly Sales / Velocity** — Baseline units sold per store per week; drives case projections.
- **Number of Stores / Door Count** — Stores participating in an event; may not exceed the banner's door count.
- **Points of Distribution (POD)** — Max number of stores × number of distinct SKUs (a coverage metric). Source: `TradeSpendDTOBuilder.cs:331`.
- **Non-Promo Cases** — Baseline (non-promoted) case volume, computed from stores × weeks-not-on-promo × velocity ÷ case pack.
- **Submission / `IsSubmitted`** — A flag marking promo events as submitted (e.g. by a broker) for a planning year; set in bulk by the submission-status operation. Distinct from `SubmissionNo` (a free-text reference).
- **Promo Event Status** — `Active, Cancelled, Pending, DidNotRun, Declined, RetailerApproved, Completed` (`Enums.cs:191`). Note: the live module reads this but **never sets it** — see [Known Gaps](05-known-gaps.md).
- **Monthly Report** — A monthly roll-up of promotional spend/actuals, with export and an "actuals import." Snapshot entity: `BrandApprovedMonthlyReport` (live) / `SandboxMonthlyReport`.

## Sandbox vs live

- **Sandbox** — A what-if promotional-planning area, mirroring live Trade Spend with parallel entities (`Promotion`/`PromotionalEvent`). Source: `Modules.TradeSpendSandbox.*`.
- **Push to Sandbox / Push to Trade Spend** — Operations that copy a promotion between the live and sandbox modules (bidirectional).
- **SandboxEventID / SandboxPromotionID** — Link fields on live events/promos pointing back to their sandbox origin.

## Data ingestion & resolution

- **UNFI / KeHe** — Natural-products distributors whose sales files are imported. Source: `Modules.DataUpload.*`.
- **SPINS** — A syndicated retail-data provider; two file types: **Items Ranking** and **Stores Insight**.
- **Distributor Sales** — Ingested distributor sales data, exposed through read-only sales reports.
- **Master Data Upload** — Bulk import of a brand's own reference data (distributors, retailers, banners, products, price lists, etc.).
- **Data Mapping** — Rules that translate an external source's identifiers (customer codes, UPCs) into Caboodle's canonical entities. Source: `DataMappingsController`.
- **Mapped vs Unmapped** — On import, rows whose external identifiers match canonical entities become "mapped" (`UNFIMapped`/`KeHeMapped`); those that don't are kept as "unmapped" for later resolution. Only background UNFI/KeHe imports produce mapped rows.
- **Entity Resolution** — The process of matching an unmapped raw value to a canonical **UnifiedEntity** via a fuzzy-matching engine (≥ 0.65 confidence). Source: `Modules.DataHub.*/EntityResolutionMatcher.cs`.
- **UnifiedEntity / Alias** — A canonical master record and the raw-value → normalized-value aliases attached to it. An alias is created as `Suggested`, then Approved/Rejected by a reviewer.
- **DataHub** — The module that hosts Entity Resolution, mapping-health dashboards, encrypted distributor credentials (Credential Manager), and CSV extract jobs (Export).
- **Credential Manager** — Stores encrypted external distributor-portal logins used to fetch data.

## Broker artifacts

- **Market Overview** — A broker-authored record of in-store SKU observations across regions/retailers/banners/stores. Source: `Modules.Broker.Domain/.../MarketOverview.cs`.
- **Category Review** — Broker management of category-reset schedules (imported/reviewed).
- **APL (Distributor APL)** — A distributor's product list, typically an **Authorized/Approved Product List** (the products a distributor carries). *The code does not spell out the acronym; this is the standard CPG meaning — confirm with the business.* Surfaced via `distributor-apl`, `apl-report`, `apl-activity`.
- **Promotional Management** — A broker view of promotional activity for its assigned brands, sourced from the Trade Spend module.

## AI

- **Ask Caboodle / Intelligence** — The natural-language querying feature. A user's question is classified, an LLM produces a structured **QueryPlan** (never raw SQL), and the backend compiles a read-only SQL query. Source: `Modules.Intelligence.*`.
- **QueryPlan** — The structured JSON description of a query (module, entity, filters, aggregations) the LLM emits and the backend compiles.

## Technical terms a BA will hear

- **Soft Delete** — "Deleting" usually just sets a `Deleted` flag (records stay in the database); the app hides them. A few operations do hard deletes — flagged where they occur.
- **AuditableEntity** — The shared base giving every record created/modified by-and-when fields plus the `Deleted` flag.
- **CQRS / Command / Query** — The backend pattern where each user action is a "command" (write) or "query" (read) with its own handler.
- **Validator (FluentValidation)** — Rule classes that check a request before it runs; failures return an input error.
- **Permission (`MustHavePermission`)** — A named `Module.Resource.Action` right required to call certain endpoints. See [Role & Permission Matrix](02-role-permission-matrix.md).
- **Hangfire** — The background-job engine used for large/chunked imports and exports.
- **Chunked Import / ImportJob** — Large files are uploaded in pieces to object storage, then processed by a background `ImportJob` the UI polls for status.
