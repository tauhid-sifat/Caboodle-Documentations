# CS-1417 — Broker Dashboard | Category Review Filter & Upload Issues

**Jira Summary:** "Broker Dashboard | Category Review Filter & Upload Issues"
**Type:** Bug | **Priority:** Highest | **Status:** Backlog
**Reporter:** Constance Wolfe | **Assignee:** Bijoy Chandra Nath
**Created:** May 30, 2026 | **Updated:** June 4, 2026

---

## Jira Description

User uploaded the "FRESH ORIGINS REVISED FINAL CATEGORY REVIEW UPLOAD" sheet into 2 broker environments. Five distinct issues identified:

1. **Duplicate Listings** — Regions & Retailers filters show duplicates; top entry is often blank, bottom one has data
2. **Open Reviews Not Listing** — Reviews with "Open" in column D (Review Month) don't appear
3. **Empty Retailers** — Retailers with no associated data still appear in filter
4. **Partial Upload** — Only ~400 of 7,000+ rows uploaded; subsequent uploads show "Success" but data doesn't appear
5. **No Remove All** — Need a function to clear and replace all data

---

## User Story

> **As a** Broker using Category Review
> **I want** filters to show accurate, deduplicated results and uploads to process all rows without silent failures
> **So that** I can trust the data I'm reviewing and submitting to brands

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Filters show no duplicate entries
  Given I open the Category Review page
  When I view the Regions or Retailers filter dropdown
  Then each region or retailer appears exactly once
  And no blank entries appear

Scenario: Open reviews appear in the list
  Given there are reviews with "Open" in Review Month column
  When I view the category review list
  Then all Open reviews are visible

Scenario: Retailers with no data are excluded from filter
  Given some retailers have no associated category review data
  When I view the retailer filter
  Then those retailers do not appear in the dropdown

Scenario: Full upload processes all rows
  Given I upload a CSV with 7,000+ valid rows
  When the upload completes
  Then all rows are processed
  And a clear count shows "X of Y records imported successfully"

Scenario: Remove All function clears data for fresh upload
  Given I have existing category review data
  When I want to upload a replacement file
  Then a "Remove All" button is available
  And clicking it clears all existing category review data

Scenario: No false success messages on failed uploads
  Given an upload fails to save data
  Then no "Success" message is shown
  And a clear error message explains what went wrong
```

---

## Notes

- Linked to CS-1149 (Uploads & Data Pushes Issues) and CS-1291 (cross-brand data leakage)
- Attachments in CSV: `FO Export Category Review (17).csv`, `FRESH ORIGINS REVISED FINAL CATEGORY REVIEW UPLOAD Cleaned_Category_Review_2026 5-29-26.csv`
- The Category Review import endpoint is `POST Brokers/category-reviews/import` (serves both broker and brand import)
- CategoryReview entity fields: RegionID, RetailerID, Category, ReviewMonth, SubmissionDueDate, ReviewDate, ResetDate, ShouldBeInCalender
