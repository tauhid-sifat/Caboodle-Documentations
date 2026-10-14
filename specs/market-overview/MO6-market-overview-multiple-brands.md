---
module: market-overview
jira: [CS-1613]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Allow One Retailer with Multiple Brands Per Log Entry

**CS-1613** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user logging a Market Overview observation,  
**I want** to associate multiple brands with a single log entry at one retailer,  
**So that** I can record an in-store observation covering multiple brands I represent at the same retailer without duplicate entries.

---

## Description

Currently, each Market Overview record carries a single `BrandID` and `RetailerID`. A broker rep visiting a retailer (e.g., Costco) may represent 10+ brands. Today they must repeat the "Add Log" process 10 separate times â€” once per brand.

Per the client meeting, the desired solution is a **sheet-based multi-brand log entry**:

1. User selects the retailer/banner at the top (e.g., Costco)
2. A sheet/table appears below with all brands listed, each showing their SKUs
3. User clicks through each brand's SKUs to mark status (click, click, click)
4. One submit saves all observations across all brands in a single action

The client has a mockup of this flow â€” request it from Constance.

---

## Acceptance Criteria

### Scenario 1: Sheet-Based Multi-Brand Log Entry
- **Given** I am creating a new Market Overview observation
- **When** I select a Retailer/Banner (e.g., Costco) at the top
- **Then** a sheet/table appears listing all my assigned brands and their SKUs
- **And** I can click each SKU to set its status (Active, Pending, etc.) inline
- **And** one submit saves all observations across all brands at once
- **And** each brand's observations are stored as separate records internally

### Scenario 2: Per-Brand SkuStatus (Optional)
- **Given** I have selected multiple brands
- **When** the SKU status may differ per brand
- **Then** I can optionally set the `SkuStatus` per brand rather than one status for all
- **Or** a single status applies to all selected brands (simpler MVP)

### Scenario 3: Display in List/Report
- **Given** a Market Overview record has multiple brands
- **When** viewing the list or report
- **Then** brands are displayed as a comma-separated list or count badge
- **And** filtering by brand returns the record if any of its brands match

### Scenario 4: Edit Behavior
- **Given** I am editing an existing Market Overview record
- **When** I add or remove brands
- **Then** the changes are persisted

---

## Design Notes

### Proposed UI Flow (from client mockup)
1. Select Retailer/Banner at the top of the page
2. Sheet view loads with rows grouped by brand, each brand showing its SKUs
3. Inline status clickers per SKU
4. Single "Submit" button saves all

### Current Entity
- `MarketOverview.cs` has a single `BrandID` (FK to Brand)
- Each brand's observations are stored as individual `MarketOverview` records internally, but created in bulk

### API Changes
- **POST MarketOverviews** â€” accept a bulk payload: `{ retailerID, bannerID, storeIDs?, date, observations: [{ brandID, skuID, status, comment? }, ...] }`
- Each observation creates a separate `MarketOverview` record server-side
- **GET MarketOverviews** â€” support filtering by multiple brand IDs

### Scope & Relationship Impact
- This change connects to the multi-store story (`CS-NEW-market-overview-multiple-stores.md`)
- If both are implemented, a single log entry = 1 retailer Ã— N brands Ã— N stores Ã— N SKUs

---

## Notes
- Client has a mockup â€” request from Constance to confirm UI layout
- The per-brand SkuStatus is essential here since different brands have different SKUs with different statuses
- The "sheet" approach eliminates the need to repeat "Add Log" per brand (current complaint)
