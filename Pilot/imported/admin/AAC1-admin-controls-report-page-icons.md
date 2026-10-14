---
type: Document
module: admin
jira: [CS-1588]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Admin | Admin Controls | Control Icons on Report Page Buttons (e.g., Monthly Report)

**CS-1588** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As an** Admin user,
**I want** to control the icons displayed on the buttons of the Reports pages (e.g., Monthly Report),
**So that** report-page buttons show the correct/approved iconography and can be managed centrally.

---

## Description

Admins should have an **Admin Control** to manage the **icons on buttons** across Reports pages (starting with the Monthly Report). This implies a configurable mapping of button -> icon, editable by Admin rather than hard-coded.

---

## Acceptance Criteria

### Scenario 1: Admin Can Change an Icon
- **Given** an Admin with the appropriate permission
- **When** they open the Admin Control for report-page button icons
- **Then** they can select/change the icon for a given Reports-page button
- **And** the change applies on the relevant Reports page (e.g., Monthly Report)

### Scenario 2: Change Persists
- **Given** an icon is changed
- **When** the Reports page reloads
- **Then** the new icon is displayed (persisted, not reverted)

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for 'admin control of report button icons.'
- Context (Reports-page UI): **CS-1282** (Monthly Report column hierarchy), **CS-1335** (Monthly Report calculations/refresh), **CS-1336** (Monthly Report layout/filtering) - the Reports pages this control would affect.

---

## Clarification — Not Related to User-Based Fixed Filters (per Constance review 2026-09-07)

> **Constance question:** Is this the user-based fixed filters ticket?

**Answer: No — CS-1588 is entirely distinct and has no overlap.**

| Aspect | CS-1588 (this ticket) | User-Based Fixed Filters |
|--------|----------------------|--------------------------|
| **What** | Admin Controls for **button iconography** on Reports pages (Monthly Report etc.) — configurable `button -> icon` mapping | **User-specific sticky/saved filters** persisted **server-side per user per brand** and auto-applied on login |
| **Who configures** | **Admin only** (central Admin Controls) | **Each end-user** (Brand Owner / Sub-User / Broker) saves their own defaults |
| **Scope** | Presentation layer — which icon renders on which Reports-page button | Data-filtering layer — which retailers/brands/regions are pre-filtered on load |
| **Modules** | Reports pages (Monthly Report first, then all Reports) | Approved starter set: **Retailers, Promo Planning (Sandbox + Approved), Pipeline** — whether to extend to all modules is deferred to Constance post-roadmap (see D12, Aug 18 meeting) |
| **Storage** | Icon/button config entity (to be added/confirmed — see Notes) | User-preference entity (server-side, scoped `userId + brandId`, explicitly NOT browser/localStorage per Bijoy) |

There is no dependency, no shared UI, and no shared data model. Closing this clarifying question in-ticket so it does not recur.

---

## Related
- **CS-1589** - Admin control of dropdown options (same Admin Controls area).
- **User-Based Fixed Filters** — D12 / Aug 18 "User Based Fixed Filter" meeting (Retailers, Promo Planning, Pipeline) — **separate workstream, not a duplicate or subtask of this ticket**.

---

## Notes
- Clarify storage: is there an icon/button config entity, or add one?
- Determine scope: all Reports pages or Monthly Report first.
