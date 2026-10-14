---
type: Document
title: "Market Overview | Allow Editing DC in Edit Log"
---

﻿---
module: market-overview
jira: [CS-1608]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Allow Editing DC in Edit Log

**CS-1608** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user editing a Market Overview record,  
**I want** the DC (Distribution Center) field to be editable in the edit form,  
**So that** I can correct or update the distribution center associated with an observation without creating a new record.

---

## Description

The Market Overview record has a `DCID` field (distribution center), but the current edit flow does not allow changing it. When a broker rep records an observation with the wrong DC, they cannot correct it through the edit log â€” they would need to delete and recreate the record.

The update endpoint (`PUT MarketOverviews`) and its handler (`UpdateMarketOverviewRequest`) should allow the DC field to be modified alongside the other editable fields (status, date, comment, training, case stack, launch date).

---

## Acceptance Criteria

### Scenario 1: Edit DC Field
- **Given** I am editing an existing Market Overview record
- **When** I open the edit form
- **Then** the DC field is available and editable
- **And** I can select a different distribution center from the available options
- **And** saving the update persists the new DC value

### Scenario 2: Validation
- **Given** I am editing the DC field
- **When** I select a valid distribution center
- **Then** the update succeeds
- **And** the DC must belong to the same distributor/banner context as the existing record, if applicable

---

## Design Reference
- **Entity:** `MarketOverview` â€” includes `DCID` field
- **Endpoint:** `PUT MarketOverviews` (`MarketOverviewsController.cs:281`)
- **Handler:** `UpdateMarketOverviewRequest`

---

## Notes
- Ensure the DC dropdown/picker shows only distribution centers relevant to the record's distributor/banner context.
- The `DCID` field on `MarketOverview` references a distribution center entity â€” confirm which DC table it targets (`DistributionCenter` vs `DistributorDc`).
