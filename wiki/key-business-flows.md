---
type: reference
title: Key business flows
module: general
status: current
last_verified: 2026-10-14
---

# KEY BUSINESS FLOWS

### Flow 1: Promotion Lifecycle
```
Brand → Product Specs → TSS (Step 1-4 wizard) → Push to Approved → Promotional Calendar → Broker Promo Management
```
- Step 1: Select retailers & banners
- Step 2: Select SKUs, set velocity & store count
- Step 3: Create events (Normal = specific months, EDLP = Jan-Dec)
- Step 4: Configure metrics — fees distributed equally per product within banner
- Push: System validates pricing exists → status changes to Approved → appears in Promotional Calendar

### Flow 2: Distributor Data Ingestion
```
Distributor (KeHE/UNFI/SPINS) → CSV/Excel upload → DataHub → Unmapped records → Manual resolution → Mapped → Reports
```

### Flow 3: Brand-Broker Data Propagation
- Broker creates category review rows → propagated to brand (editable)
- Brand edits → stays local (doesn't push back) unless pushed to calendar
- Calendar pushes propagate to broker
- Deletions at broker level propagate to brands — except items the brand added locally
- Status hierarchy: Pending → Approved → Committed → Active → Discontinued (certain transitions restricted)

### Flow 4: Market Overview → CRM Status Sync
- `PushMarketOverviewChangesIntoCRM` fires on Market Overview **create only** (not update/delete)
- Sync target: `BannerSKU.Status` (untyped integer — known gap)
- Status hierarchy: **Discontinued is terminal** — Market Overview cannot overwrite it
- Lower statuses (NotActive/Pending) can be changed to any status
- Flow: Pending → Approved → Commit → Active → Discontinued
- Dead-ends: Pending → Declined (never placed), Pending → NotActive (never activated)
- `MarketOverview.SKUID` ambiguous — unclear if it targets `BannerSKU` or `ProductSpecification`

> End-to-end narrative versions of these flows: `BUSINESS.md` ("Key Business Flows (End to End)").
