# CS-1318 — Broker Dashboard | Market Overview Filter Needs more Field Options

**Jira Summary:** "Broker Dashboard | Market Overview Filter Needs more Field Options List Too Limited"
**Type:** Task | **Priority:** High | **Status:** Backlog
**Reporter:** Bijoy Chandra Nath | **Assignee:** —
**Created:** April 2, 2026 | **Updated:** June 28, 2026

---

## Jira Description

The Market Overview filter currently has limited field options. Users need the ability to filter by Region, Retailer, Banner, Store, Brand SKU, Status, DC, and Created by Date — in addition to whatever fields already exist in the filter.

---

## User Story

> **As a** Broker user viewing the Market Overview report
> **I want** to filter by Region, Retailer, Banner, Store, Brand SKU, Status, DC, and Created by Date
> **So that** I can narrow down market data to the specific dimensions I need without exporting and manual filtering

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: All requested filter fields are available
  Given I open the Broker Dashboard Market Overview report
  When I view the filter panel
  Then the following filter options are available:
    - Region
    - Retailer
    - Banner
    - Store
    - Brand SKU
    - Status
    - DC (Distribution Center)
    - Created by Date

Scenario: Existing filters are preserved
  Given the Market Overview filter previously had working filter fields
  When the new filter options are added
  Then all existing filter fields continue to function

Scenario: Filters combine correctly
  Given I select a Region and a Retailer
  When I apply both filters
  Then the report displays only records matching both criteria

Scenario: Date range filter works for Created by Date
  Given I select a date range in the "Created by Date" filter
  When I apply the filter
  Then only records created within that range are shown

Scenario: Active filters are clearly indicated
  Given I have applied one or more filters
  Then the filter panel indicates which filters are active
  And I can clear individual filters or reset all
```

---

## Notes

- Linked to CS-1299 (Broker Dashboard Updates > APL + Add Log Market Overview — UI refresh + auto-mapping of Region/Retailer/Banner hierarchy)
- Linked to CS-1310 (Broker Dashboard Market Overview > Store List Not populating)
- The Market Overview listing endpoint (`GET MarketOverviews`) already supports filtering by: statuses, brand/banner/retailer/SKU/DC/store/region IDs, createdBy, date range, isCaseStack, isTraining
- MarketOverview entity fields: RegionID, RetailerID, BannerID, StoreID, DCID, BrandID, SKUID, SkuStatus, DateTime, Comment
