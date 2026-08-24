# Brand Modules | Retailer CRM | Add Store-Level Listing from Banner Page

**BMTRC1** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand user in Retailer CRM,
**I want** a store-level listing accessible from the Banner Page (e.g., as a link to a new page within Caboodle),
**So that** I can drill into store-level detail for a banner without leaving the Retailer CRM context.

---

## Description

From the **Banner Page** in Retailer CRM, add a **store-level listing** of the banner's stores. This could be exposed as a **link to a new page within Caboodle** — referenced as the **STORE REPORT MGMT Tab**. The goal is to give users store-level visibility (individual stores under a banner) that today is not readily reachable from the Banner Page.

This relates to the broader **Store** domain, which per AGENTS.md is currently an *orphan module* (domain entities exist but no controller/service layer). BMTRC1 may be the entry point that surfaces store data via the Retailer CRM UI.

---

## Acceptance Criteria

### Scenario 1: Link on Banner Page
- **Given** I am on a Banner Page in Retailer CRM
- **When** I view the page
- **Then** a control/link is present to open the store-level listing for that banner
- **And** the link is clearly associated with the current banner context

### Scenario 2: Store-Level Listing Page
- **Given** I open the store listing (STORE REPORT MGMT Tab / new page)
- **When** the page renders
- **Then** it lists the stores belonging to the selected banner at the store level
- **And** it is a distinct Caboodle page (navigable, with a way back to the Banner Page)

### Scenario 3: Scoping
- **Given** a banner with multiple stores
- **When** the listing renders
- **Then** only stores for that banner are shown (correctly scoped, not a global store list)

---

## Jira Reference (data/jira-tickets)
- **CS-1010** - CRM > Retailers: clicking regions 2+ takes user to the Banner Page (existing Banner Page navigation behavior to build on).
- **CS-814** - Retail Banner needs back button from Banner Page to retail page.
- **CS-815** - Banner Page: Sort by doesn't need Retailer.
- **CS-1056 / CS-993** - Reports > Sales Tracker: navigating to / from the Retailer Banner Page (back-button / linking patterns).
- **CS-346** - Market Overview Sku Status pushes to Retailer CRM Banner when a Store is selected (store-to-banner linkage context).
- **CS-468** - Market Overview Entries not pushing to Retailer CRM if Retailer not linked to Distributor (Retailer CRM data flow).
- **CS-1254 / CS-1279** - Retailer CRM item status / add-discontinue dates (related Retailer CRM data).

---

## Related
- **AGENTS.md — Store module** - Orphan domain (entities only, no controller/service). BMTRC1 may depend on or motivate building store data access.

---

## Notes
- Confirm whether the "STORE REPORT MGMT Tab" already exists in the app (the user references it as existing) — if so, BMTRC1 is primarily about linking to it from the Banner Page.
- Clarify store-level data source (Store domain entities vs. distributor/banner mappings).
- Ensure the new page has proper navigation/back behavior (several Banner Page navigation gaps exist per CS-814/CS-1056).
