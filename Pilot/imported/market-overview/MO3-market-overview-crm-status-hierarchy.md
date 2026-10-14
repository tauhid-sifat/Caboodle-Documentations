---
type: Document
title: "Market Overview | Document and Define Status Update Hierarchy to Brand CRM"
---

﻿---
module: market-overview
jira: [CS-1610]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Document and Define Status Update Hierarchy to Brand CRM

**CS-1610** | New Requirement | User Story | Priority: High | Status: New

---

## User Story

**As a** Platform Administrator / Developer,  
**I want** the Market Overview-to-CRM status sync hierarchy clearly defined and documented,  
**So that** broker-in-store observations are correctly reflected on the Brand's BannerSKU records without unintended overwrites.

---

## Description

When a Market Overview record is created, `PushMarketOverviewChangesIntoCRM` syncs the observation data (including `SkuStatus`) into the CRM module's `BannerSKU.Status`. However, there is currently:

1. **Undocumented hierarchy** â€” certain SkuStatus values cannot be overridden by Market Overview. Specifically:
   - If Brand CRM status is **Discontinued**, Market Overview **cannot** change it
   - If Brand CRM status is **Active** or lower (**Commit, Approved, Pending, NotActive**), Market Overview **can** update it
2. **Unclear target** â€” `MarketOverview.SKUID` is ambiguous: does it reference `BannerSKU` or `ProductSpecification`?
3. **Unsynced on edit/delete** â€” The sync only fires on create. Edits to Market Overview status or deletion of records are not reflected in CRM.

This story requires confirming the implemented hierarchy rules with engineering (Bijoy) and documenting them.

### Confirmed Status Hierarchy (from client meeting)
```
Pending â†’ Approved â†’ Commit â†’ Active â†’ Discontinued
Pending â†’ Declined (dead-end, never placed)
Pending â†’ NotActive (dead-end, never activated)
```

**Rules:**
- **Discontinued** is terminal â€” Market Overview cannot overwrite it
- **NotActive/Pending** â€” any status can change it (lowest priority)
- **Active/Commit/Approved** â€” Market Overview can update to a higher or equal status, but cannot downgrade to Discontinued if brand set it

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

## Hierarchy Rules (Confirmed during client meeting)

| Current CRM Status | Can Market Overview Override? | Notes |
|--------------------|------------------------------|-------|
| Discontinued | âŒ No | Terminal â€” broker observation cannot change |
| Active | âœ… Yes | Can be changed to higher or equal status |
| Commit | âœ… Yes | |
| Approved | âœ… Yes | |
| Pending | âœ… Yes | |
| NotActive | âœ… Yes | Can be changed to any status |
| Declined | âŒ No (assumed) | Dead-end â€” confirm with engineering |

**Status flow confirmed:** Pending â†’ Approved â†’ Commit â†’ Active â†’ Discontinued

**Next step:** Review with Bijoy what is currently implemented in the backend to ensure it matches these rules. Per the client, Bijoy has the hierarchy documented somewhere â€” verify alignment.

## Business Rules Questions (to resolve with stakeholders)

1. Should a Market Overview observation **always** update the BannerSKU status, or only for certain statuses?
2. If the BannerSKU is "Active" and a Market Overview reports "Discontinued", does the Brand want the status to change?
3. Can a Market Overview observation **re-activate** a previously discontinued SKU (set it to "Active")?
4. Should status changes from Market Overview be subject to approval before reflecting in CRM?

---

## Reference
- **Trigger:** `CreateMarketOverviewsRequest.cs:113` â€” `ISharedDataService.PushMarketOverviewChangesIntoCRM`
- **Source entity:** `MarketOverview.cs` â€” fields include `SKUID`, `SkuStatus` (int)
- **Target entity:** `BannerSKU.cs` â€” fields include `Status` (untyped int), `ActiveDate`, `DiscoDate`
- **SkuStatus values:** Active (1), Pending, NotActive (3), Declined, Discontinued (5), Approved, Commit
