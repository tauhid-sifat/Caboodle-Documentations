# Market Overview | Allow One Retailer with Multiple Brands Per Log Entry

**New Requirement** | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user logging a Market Overview observation,  
**I want** to associate multiple brands with a single log entry at one retailer,  
**So that** I can record an in-store observation covering multiple brands I represent at the same retailer without duplicate entries.

---

## Description

Currently, each Market Overview record carries a single `BrandID` and `RetailerID`. A broker rep visiting a retailer may observe shelf conditions for several of their assigned brands in one trip. Today this requires creating separate records per brand even though the retailer, banner, date, and store are identical.

This story allows a single Market Overview log entry to cover multiple brands under the same retailer/banner/store context, reducing data entry overhead.

---

## Acceptance Criteria

### Scenario 1: Multiple Brand Selection
- **Given** I am creating a new Market Overview record
- **When** I select a Retailer/Banner
- **Then** I can select one or more Brands associated with my broker account
- **And** each selected brand is linked to the same observation context (retailer, banner, store, date, status)

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

### Current Entity
- `MarketOverview.cs` has a single `BrandID` (FK to Brand)
- Proposal: add a join table (e.g., `MarketOverviewBrand`) with `MarketOverviewID` + `BrandID`

### API Changes
- **POST/PUT MarketOverviews** — accept an array of `BrandIDs` instead of a single `BrandID`
- **GET MarketOverviews** — include all brand names in the DTO
- Scoping: broker can only select brands assigned to them (enforced by existing brand-assignment check)

### Scope & Relationship Impact
- This change also connects to the multi-store story (`CS-NEW-market-overview-multiple-stores.md`) — both add many-to-many relationships to the Market Overview entity
- If both are implemented, a single log entry = 1 retailer × N brands × N stores

---

## Notes
- The per-brand SkuStatus variant adds significant complexity — recommend a single shared status for MVP
- Confirm with business: should brands be mandatory (at least one required) or still allow single-brand records?
- If broker reps typically observe the same status across their brands, a single status field is sufficient
