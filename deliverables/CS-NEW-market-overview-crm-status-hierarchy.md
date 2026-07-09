# Market Overview | Document and Define Status Update Hierarchy to Brand CRM

**New Requirement** | User Story | Priority: High | Status: New

---

## User Story

**As a** Platform Administrator / Developer,  
**I want** the Market Overview-to-CRM status sync hierarchy clearly defined and documented,  
**So that** broker-in-store observations are correctly reflected on the Brand's BannerSKU records without unintended overwrites.

---

## Description

When a Market Overview record is created, `PushMarketOverviewChangesIntoCRM` syncs the observation data (including `SkuStatus`) into the CRM module's `BannerSKU.Status`. However, there is currently:

1. **No documented hierarchy** — it is unclear whether the Market Overview status always overwrites BannerSKU.Status, or if certain statuses take priority (e.g., CRM "Active" should never be overwritten by a Market Overview "Pending").
2. **Unclear target** — `MarketOverview.SKUID` is ambiguous: does it reference `BannerSKU` or `ProductSpecification`?
3. **Unsynced on edit/delete** — The sync only fires on create. Edits to Market Overview status or deletion of records are not reflected in CRM.

This story requires defining (and optionally implementing) the business rules for how and when Market Overview statuses propagate to BannerSKU.Status.

---

## Acceptance Criteria

### Scenario 1: Define the Status Hierarchy
- **Given** the current undocumented sync behavior
- **When** a Market Overview is created with a given `SkuStatus`
- **Then** the hierarchy of which status "wins" must be defined (e.g., does a broker observation of "Discontinued" override CRM's "Active"?)
- **And** the rules are documented in the codebase (README or inline)

### Scenario 2: Resolve SKUID Ambiguity
- **Given** `MarketOverview.SKUID` has an ambiguous target
- **When** the sync runs
- **Then** confirm whether `SKUID` references `BannerSKU` or `ProductSpecification`
- **And** add a FK / foreign-key annotation to make the relationship explicit

### Scenario 3: Sync on Edit and Delete (Optional, scope-dependent)
- **Given** a Market Overview record is updated (status changed) or deleted
- **When** the update/delete is saved
- **Then** the corresponding BannerSKU.Status is updated (or reverted) accordingly
- **Or** document why create-only sync is intentional

---

## Business Rules Questions (to resolve with stakeholders)

1. Should a Market Overview observation **always** update the BannerSKU status, or only for certain statuses?
2. If the BannerSKU is "Active" and a Market Overview reports "Discontinued", does the Brand want the status to change?
3. Can a Market Overview observation **re-activate** a previously discontinued SKU (set it to "Active")?
4. Should status changes from Market Overview be subject to approval before reflecting in CRM?

---

## Reference
- **Trigger:** `CreateMarketOverviewsRequest.cs:113` — `ISharedDataService.PushMarketOverviewChangesIntoCRM`
- **Source entity:** `MarketOverview.cs` — fields include `SKUID`, `SkuStatus` (int)
- **Target entity:** `BannerSKU.cs` — fields include `Status` (untyped int), `ActiveDate`, `DiscoDate`
- **SkuStatus values:** Active (1), Pending, NotActive (3), Declined, Discontinued (5), Approved, Commit
