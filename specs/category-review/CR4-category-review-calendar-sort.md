# Category Review | Calendar Sort by Banner or Category?

**CS-1606** | Question | Priority: TBD | Status: New

---

## User Story

**As a** Broker user working in the Category Review calendar,  
**I want** to understand and confirm how the calendar should be sorted/grouped (by Banner or by Category),  
**So that** the view presents reviews in the most useful order for planning.

---

## Description

Open question about the Category Review **calendar** view: should entries be sorted (and/or grouped) by **Banner** or by **Category**?

- The current yearly planning grid (CS-1361) groups rows by **Retailer** (not Banner), with columns = months.
- The calendar rollup (CS-1296) data carries `Retailer`, `Category`, and `Region`, but no explicit Banner column in the upload template.
- The list/infinite-scroll view (CS-1316) is a flat list that could be sorted by either field.

This ticket captures the open decision: confirm the intended primary sort/group key for the calendar (Banner vs. Category) before/while implementing sorting. It may resolve to "both, with a toggle" or a single default.

---

## Acceptance Criteria

### Scenario 1: Decision Recorded
- **Given** the sorting question is raised
- **When** the client/product owner decides
- **Then** the chosen sort/group key (Banner, Category, or both via toggle) is documented here
- **And** the implementation ticket references this decision

### Scenario 2: Sort Behavior (once decided)
- **Given** the decision is made
- **When** a user views the Category Review calendar
- **Then** entries are ordered/grouped per the agreed key
- **And** if a toggle is chosen, the user can switch between Banner and Category views

---

## Design Reference
- Yearly planning grid grouping: `CS-1361-new-category-review-functionality.md`
- Calendar rollup data/columns: `CS-1296-category-review-calendar-rollup.md`
- List/infinite-scroll view: `CS-1316-category-review-infinite-scroll.md`

---

## Related
- **CS-1361** — defines current Retailer-based row grouping.
- **CS-1607** — relates to the upload template fields that feed these views.

---

## Jira Reference (data/jira-tickets)
- **CS-1540** — Brand-Retailer: remove redundant Sort By (single option); default sort by **Banner Name**. Establishes a "sort by Banner" precedent relevant to this decision.
- **CS-772** — Sort By offers to sort by Banner or Retailer, but Retailer names are not listed. Existing Banner/Retailer sort behavior to reconcile with.

---

## Notes
- Clarify whether "Banner" means the parent Banner entity or the Retailer-as-Banner grouping already used in CS-1361 (CSV has no Banner column).
- If both Banner and Category sorting are needed, prefer a user-toggle over a hard-coded default.

---

## Confirmed Grid Columns (from the 2026 Category Review screenshot)

The Category Review grid (list view) exposes these sortable/groupable columns: `Region | Retailer | Category | Review Month | Review Start Date | Review End Date | Reset Date | Additional Notes | ACTION`. Notably there is **no dedicated Banner column** — grouping is by **Retailer** (Region + Retailer), while **Category** is a per-row field. This reinforces the core question in CS-1606: whether to sort/group by **Retailer (as today)** or by **Category** (the available independent field), and whether a Banner dimension needs to be introduced.
