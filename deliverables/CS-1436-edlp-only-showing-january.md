# CS-1436 — TSS | EDLP Promotional Reporting only Populating the Month of January

**Jira Summary:** "TSS | EDLP Promotional Reporting only Populating the Month of January"
**Type:** Bug | **Priority:** Highest | **Status:** Backlog
**Reporter:** Constance Wolfe | **Assignee:** Md Mashiul Azam Chowdhury Efti
**Created:** July 8, 2026 | **Updated:** July 8, 2026

---

## Jira Description

EDLP shows in Brand Promotional Calendar only in January despite dates being Jan 1 – Dec 31, 2026. Planned cases for an EDLP should be split across all months. Works correctly in Broker Promotional Management but **not** in Brand Promo Calendar or Monthly Report. Suspected root cause: "It might be because it's still pulling from the TSS not Approved?"

**Business impact:** Causing issues for Bubbies — 338,502 planned cases showing only in January for 1 account (Adams Hometown Market). Bubbies cannot review financial records accurately.

---

## User Story

> **As a** Brand Owner viewing the Promotional Calendar or Monthly Report
> **I want** my EDLP promotions to display planned cases across all 12 months as configured
> **So that** my planned cases and spend are accurately distributed for financial review

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: EDLP appears across all months in Brand Promotional Calendar
  Given an EDLP promotion exists with dates Jan 1 – Dec 31, 2026
  When I view the Brand Promotional Calendar
  Then the EDLP promotion displays spanning January through December
  And each month reflects its proportional share of planned cases

Scenario: EDLP appears across all months in Monthly Report
  Given the same EDLP promotion
  When I open the Monthly Report
  Then the promotion's planned cases are distributed across all 12 months

Scenario: Mid-year EDLP spans correctly
  Given an EDLP with start date July 1, 2026
  When I view calendar or report
  Then it appears July through December only

Scenario: Broker Promotional Management matches brand view post-fix
  Given EDLP already works correctly in Broker Promotional Management
  When the fix is deployed
  Then Brand Promo Calendar and Monthly Report match the Broker view

Scenario: Root cause addressed (TSS vs Approved data source)
  Given the issue is pulling from TSS (sandbox) instead of Approved promotions
  When the fix is deployed
  Then the system pulls EDLP data from the correct (Approved) source
```

---

## Notes

- Linked to CS-1433 (same distributor data pipeline involved)
- 6 screenshots attached in CSV showing: Bubbies Promo Calendar, Adams Hometown Market EDLP, Broker PM view, Monthly Report, TSS setup
- EDLP = "Every Day Low Price" (glossary: a promotion type whose events span a full calendar year)
