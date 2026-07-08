# CS-1431 — Monthly Report | Import Actuals > Failed Records Reason

**Jira Summary:** "Monthly Report | Import Actuals > Failed Records Reason seem invalid"
**Type:** Bug | **Priority:** Highest | **Status:** Backlog
**Reporter:** Constance Wolfe | **Assignee:** Bijoy Chandra Nath
**Created:** July 7, 2026 | **Updated:** July 7, 2026

---

## Jira Description

User tried to import Actuals in the Monthly Report for Bubbies (Staging). Downloaded the template, entered values for Whole Foods (`monthly-report-actual-import-template (14).csv`), uploaded, and received error logs (`MonthlyReportActual_Import_Errors_20260706_191612.csv`) where the "Failed Records Reason" column contained invalid/unhelpful messages that don't explain what went wrong.

---

## User Story

> **As a** Brand User importing actuals into the Monthly Report
> **I want** the failed records error messages to clearly explain what field failed validation and why
> **So that** I can fix my CSV and re-upload without contacting support

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Failed record reason identifies the field and value
  Given I upload a CSV to Monthly Report Import Actuals
  When a record fails validation
  Then the error reason clearly identifies which column/field caused the failure
  And the error includes the rejected value
  And the error explains why it was rejected

Scenario: Row number is included in failure output
  Given I view the failed records list after an import
  Then each failed record shows the original CSV row number

Scenario: Multiple errors per row are all reported
  Given a single row has multiple validation errors
  Then all errors for that row are listed, not just the first

Scenario: Successful records are clearly marked
  Given I import a file with mixed success and failure
  Then successfully imported records show a distinct success status
  And they are excluded from the failed records section
```

---

## Notes

- Attachments in CSV: `MonthlyReportActual_Import_Errors_20260706_191612.csv`, multiple template CSVs, screenshots of error logs
- Root cause suspected: error-reason mapping in the import pipeline returns generic/invalid reasons instead of specific validation failures
