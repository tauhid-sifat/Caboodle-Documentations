# Broker Dashboard | Category Review Calendar Rollup

**CS-1296** | User Story | Priority: High | Status: New

---

## User Story

**As a** Broker user,  
**I want** a unified Category Review calendar that aggregates review dates across all retailers,  
**So that** I can manage category review deadlines in one place without juggling separate spreadsheets per retailer.

---

## Description

Each retailer has a "buyer" or "Category Manager" responsible for adding or delisting products. There is no standard for categorizing — every retailer has their own naming conventions. Brokers obtain spreadsheets from each retailer, determine which brands' items fall into which categories, and compile them onto a single sheet.

The client created a compiled spreadsheet and uploaded it via the Category Review import, but found errors with no way to clear all records, fix problems, and reupload.

---

## CSV Upload Format

The upload file must follow this exact header format:

```csv
Region,Retailer,Category,Review Month,Submission Due Date(MM/DD/YY),Review Dates(MM/DD/YY),Reset Date(MM/DD/YY),Additional Notes
```

| # | Column | Format | Required | Maps To |
|---|--------|--------|----------|---------|
| 1 | Region | Text | No | `Region` |
| 2 | Retailer | Text | Yes | `Retailer` |
| 3 | Category | Text | Yes | `Category` |
| 4 | Review Month | Text (e.g., "January") | Yes | `ReviewMonth` |
| 5 | Submission Due Date(MM/DD/YY) | Date (MM/DD/YY) | No | `SubmissionDueDate` |
| 6 | Review Dates(MM/DD/YY) | Date (MM/DD/YY) | No | `ReviewDate` |
| 7 | Reset Date(MM/DD/YY) | Date (MM/DD/YY) | No | `ResetDate` |
| 8 | Additional Notes | Text | No | `AdditionalNotes` |

**Notes:**
- Column headers must match exactly (including parenthetical date format hints)
- `BrandID` and `BrokerageCompanyID` are set server-side from the uploading broker's context
- `ShouldBeInCalender` defaults to `false` — users push to calendar via existing calendar endpoints

---

## Acceptance Criteria

### Scenario 1: Unified Category Review Calendar
- **Given** I am a Broker user
- **When** I navigate to the Category Review Calendar
- **Then** I see all imported category reviews in a single view with columns matching the CSV:
  - Region, Retailer, Category, Review Month, Submission Due Date, Review Dates, Reset Date, Additional Notes
- **And** the data comes from the uploaded CSV

### Scenario 2: Upload / Replace / Bulk Delete
- **Given** I have uploaded a Category Review CSV
- **When** I find errors or need to update
- **Then** I can **bulk delete** all existing records, fix the CSV, and **reupload**
- **And** the reupload replaces all old data (no merge)
- **And** the import uses the existing `POST category-reviews/import` endpoint

### Scenario 3: Filtering
- **Given** I am viewing the Category Review Calendar
- **Then** I can filter by: **Region**, **Retailer**, **Category**, **Review Month**
- **And** the Category filter lists all unique categories from the uploaded data

### Scenario 4: Drill-Down
- **Given** I am viewing the calendar
- **When** I click a review row
- **Then** I navigate to the Category Review detail page for that review (notes, contacts, etc.)

### Scenario 5: Permissions
- **Given** I am logged in as a Broker
- **When** I view the Category Review Calendar
- **Then** I see all reviews uploaded by my brokerage (not scoped to brands I represent)
- **And** brand filtering is an optional filter, not a visibility gate

---

## Design Notes

### Bulk Delete
- Endpoint: `DELETE Brokers/category-reviews/clear` (or extend `DELETE Brokers/category-reviews`)
- Removes all category review records for the uploading broker's org
- Called before re-upload to ensure a clean slate

### Reusing Existing Import
- `POST category-reviews/import` already accepts file uploads
- The CSV columns map directly to the `CategoryReview` entity fields
- Date parsing must accept MM/DD/YY format

### Calendar Integration
- The yearly planning grid (CS-1361) should display these as review milestones
- Group by Retailer row, with months as columns

---

## Dependencies
- **CS-1361** — Yearly planning grid (feeds data into grid)
- **CS-NEW-bulk-delete-category-reviews.md** — Bulk delete
- `POST category-reviews/import` (existing endpoint)
- `DELETE Brokers/category-reviews` (existing endpoint or extend)
