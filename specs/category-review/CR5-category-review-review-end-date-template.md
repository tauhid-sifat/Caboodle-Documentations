---
module: category-review
jira: [CS-1607]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/category-review.md
---

# Category Review | Review End Date Added to List — Do We Need to Change the Upload Template?

**CS-1607** | Question | Priority: TBD | Status: New

---

## User Story

**As a** Broker user (and the implementation team),  
**I want** to confirm whether the Category Review **upload template** must be updated now that the Category Review list shows a **Review End Date**,  
**So that** uploaded data correctly populates (or intentionally omits) the new field.

---

## Description

The Category Review **list** now displays a **Review End Date** column/field. The current upload template (from CS-1296) does **not** include a Review End Date column. Its columns are:

`Region, Retailer, Category, Review Month, Submission Due Date (MM/DD/YY), Review Dates (MM/DD/YY), Reset Date (MM/DD/YY), Additional Notes`

**Confirmed grid columns (from the 2026 Category Review screenshot):** `Region | Retailer | Category | Review Month | Review Start Date | Review End Date | Reset Date | Additional Notes | ACTION`. The **Review Start Date** and **Review End Date** columns are already present in the UI alongside **Review Month** and **Reset Date** — so `Review End Date` is already rendered; the question is purely whether the **upload template** must be extended to populate it.

Open question: does the new Review End Date require a **change to the upload template** (add a `Review End Date (MM/DD/YY)` column), or is it derived/optional and should remain absent from uploads?

- If added: uploads would populate Review End Date directly; the CS-1296 import mapping and validation must be extended.
- If not added: confirm Review End Date is either system-derived, optional, or only relevant to manually created (non-uploaded) reviews — and document that behavior.

---

## Acceptance Criteria

### Scenario 1: Decision Recorded
- **Given** the list now shows Review End Date
- **When** the team decides on template impact
- **Then** the decision (add column vs. leave template unchanged) is documented here
- **And** the chosen path is reflected in the CS-1296 import spec

### Scenario 2a: Template Updated (if decided)
- **Given** Review End Date is added to the template
- **When** a file is uploaded with the new `Review End Date (MM/DD/YY)` column
- **Then** the import parses and stores Review End Date per row
- **And** existing required columns (`Retailer`, `Category`, `Review Month`) remain required

### Scenario 2b: Template Unchanged (if decided)
- **Given** Review End Date stays out of the upload template
- **When** a file is uploaded
- **Then** Review End Date is left empty/default for uploaded rows
- **And** the list still shows the column (populated only for manually created reviews or via another mechanism)

---

## Design Reference
- Upload template & columns: `CS-1296-category-review-calendar-rollup.md`
- Category Review list/infinite scroll: `CS-1316-category-review-infinite-scroll.md`

---

## Jira Reference (data/jira-tickets)
- **CS-1361** — Category Review spec already defines *Review Start Date* and *Review End Date* rows (visible only for Review type). Confirms the field is not entirely new; assess whether the list "Review End Date" derives from this.
- **CS-1499** — notes the calendar shows *Review Month and Reset Month only (no submission date, no review-end auto-population)*. Context on current gaps around review-end data.

---

## Related
- **CS-1296** — owns the upload format; this question gates a potential template change to that ticket.
- **CS-1606** — sorting/grouping of the calendar (related data presentation question).

---

## Notes
- Reupload in CS-1296 **replaces all data** (no merge) — any template change must be communicated to users before they next reupload.
- Confirm the date format expectation (MM/DD/YY) matches the other date columns if a column is added.
- Check whether Review End Date already exists as a field on the `CategoryReview` entity or is net-new.
