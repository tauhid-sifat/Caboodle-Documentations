---
module: market-overview
jira: [CS-1318]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Filter Needs More Field Options (List Too Limited)

**CS-1318** | User Story | Priority: High | Status: Backlog

---

## User Story

**As a** Broker user viewing the Market Overview report,  
**I want** to filter by Region, Retailer, Banner, Store, Brand SKU, Status, DC, and Created by Date,  
**So that** I can narrow down market data to the specific dimensions I need without exporting and manual filtering.

---

## Acceptance Criteria

### Scenario: Expanded Filter Options

- **Given** I open the Broker Dashboard Market Overview report
- **When** I view the filter panel
- **Then** the following filter options are available:
  - Region
  - Retailer
  - Banner
  - Store
  - Brand SKU
  - Status
  - DC (Distribution Center)
  - Created by Date

### Scenario: Preserve Existing Filters

- **Given** the Market Overview filter previously had working filter fields
- **When** the new filter options are added
- **Then** all existing filter fields continue to function as before
- **And** no existing filter is removed

### Scenario: Combined Filters

- **Given** I select a Region and a Retailer
- **When** I apply both filters
- **Then** the report displays only records matching both criteria

### Scenario: Created by Date Range

- **Given** I select a date range in the "Created by Date" filter
- **When** I apply the filter
- **Then** only records created within that date range are shown

### Scenario: Active Filter Indication

- **Given** I have applied one or more filters
- **Then** the filter panel clearly indicates which filters are active
- **And** I can clear individual filters or reset all filters

---

## Notes

- The Market Overview report currently supports filtering via IDs and flags (see `GET .../MarketOverviews`); this story expands the available filter dimensions.
- "Created by Date" is a new date-range filter — confirm whether it applies to `CreatedOn` on the MarketOverview entity.
