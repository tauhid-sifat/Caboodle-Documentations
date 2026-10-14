# Brand Modules | TSS | Actualize Promotions - Best Method and Plan-to-Actual Reports

**CS-1628** | New Requirement | User Story | Priority: TBD | Status: New
**Reporter:** Constance Wolfe

---

## User Story

**As a** Brand user,
**I want** a reliable, ideally automated way to actualize promotions (compare planned vs. actual),
**So that** I do not have to manually copy actuals from an external source and can trust plan-to-actual reporting.

---

## Description

Actualization updates promo projections with real sales data after a promotion has run.

**Current state:** Users are advised to make a copy of the original promotion and enter the actuals manually from an external data source. However, the data source (distributor/syndicated data) already exists **in the system**, so manual re-entry is redundant and error-prone.

**Open questions to resolve:**
1. What is the best method to actualize promotions? Can it be automated by pulling actuals from the in-system data source (e.g., distributor reports) rather than manual entry?
2. Should we provide **plan-to-actual reports** so users can compare projected vs. actual performance?

This ticket supersedes/extends the prior placeholder `CS-NEW-brand-tss-actualize-promotions.md`.

---

## Acceptance Criteria

### Scenario 1: Automated Actuals (if feasible)
- **Given** actuals exist in the system data source
- **When** a user actualizes a promotion
- **Then** the system can pull actuals automatically (or semi-automatically) instead of manual re-entry
- **And** the source and mapping are shown for transparency

### Scenario 2: Manual Actuals Fallback
- **Given** automation is not available for a data set
- **When** the user enters actuals manually
- **Then** the entry is captured against the promotion and persists across refreshes

### Scenario 3: Plan-to-Actual Reporting
- **Given** a promotion has both plan and actual values
- **When** the user views reports
- **Then** plan vs. actual (cases, revenue) is available, e.g., in the Trade Spend Roll Up / Monthly Report context

---

## Jira Reference (data/jira-tickets)
- **CS-1280** - Monthly Report Discussion: Actuals Auto Updated from Distributor Reports (directly supports automation).
- **CS-1283** - Monthly Report: Importing Actuals (Manually and Automated).
- **CS-1335** - Fix Monthly Report: auto-sync actuals from distributor data.
- **CS-1431** - Monthly Report Import Actuals: failed records errors.
- **CS-1439** - Imported Actual Data does not remain when Refresh is selected.
- **CS-1447** - Discrepancy for Promo Rev. on TSS Approved, TSS Sandbox & Monthly Report (plan/actual consistency).
- **CS-1102 / CS-1110** - second Trade Spend Roll Up Report for Brand Approved Promotions (plan vs. actual context).

---

## Related
- **CS-1630** - EDLP rendering in reports (downstream of correct actualization).
- **CS-1284 / CS-1282** - Monthly Report navigation/hierarchy (report presentation).

---

## Notes
- Confirm the in-system actuals source (Distributor Reports / SPINS) and mapping to promotions.
- Reconcile with the existing placeholder's open 'client walkthrough' item.
