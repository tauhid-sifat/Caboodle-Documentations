# CS-1433 — Distributor Report | Pulling Prior Year instead of Current Year Sales

**Jira Summary:** "Distributor Report | Pulling in Prior Year Sales | It should only pull in Current Year Sales"
**Type:** Bug | **Priority:** High | **Status:** Backlog
**Reporter:** Constance Wolfe | **Assignee:** Md Mashiul Azam Chowdhury Efti
**Created:** July 7, 2026 | **Updated:** July 8, 2026

---

## Jira Description

When the KeHE POD report is pulled into the system, it pulls Prior Year QTY instead of Current Year QTY. This creates errors in reporting.

**Example:** Broker Noble Sales > Brand Ener-Life > Report > KeHE > Product ELECTROLYTE BX LMN LIME:
- Reports 0 sales & 0 cases but shows store counts (confusing)
- Export revealed Prior Year QTY columns populated instead of Current Year QTY

**NOTE:** Same issue in the Distributor Report. Could be a Data Mapping issue — should not pull data with 0 Current Year QTY.

---

## User Story

> **As a** Brand User or Broker viewing the Distributor Report (KeHE)
> **I want** the report to pull and display Current Year QTY only, not Prior Year QTY
> **So that** the numbers I analyze and export reflect actual current performance

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: KeHE POD pulls Current Year QTY only
  Given the system pulls KeHE POD data into the Distributor Report
  When the data sync runs
  Then only Current Year QTY columns are populated
  And Prior Year QTY columns are excluded or set to null

Scenario: Report shows correct sales figures
  Given a product has Current Year sales
  When I view the Distributor Report
  Then it shows the Current Year sales and cases
  And if no current year data exists, it shows $0 or "No Data" consistently

Scenario: Store count does not imply false sales activity
  Given a product has 0 current year sales
  When I view its detail in the report
  Then store count is not shown in a way that implies sales activity

Scenario: Export reflects Current Year QTY only
  Given I export the Distributor Report to CSV
  Then the exported file contains Current Year QTY data only
  And Prior Year QTY columns are not present

Scenario: Data Mapping excludes 0 Current Year QTY records (CS-1435)
  Given the Data Mapping module pulls KeHE FOB report data
  When a record has 0 Current Year QTY
  Then it should not be pulled into the system
```

---

## Notes

- **Linked to CS-1435** (Data Mapping | Pulling in KeHE POD Current Year QTY 0 — It Should Not)
- **Linked to CS-1436** (EDLP reporting — same distributor data pipeline)
- Attachments in CSV: `KeHE_Export_20260707_171910.csv`, 3 screenshots showing the error
- The Data Upload module contains `KeHEController` and `DistributorSalesReportsController` with no permission gating (authenticated-only)
