# Broker Dashboard | Category Review Calendar Rollup

**CS-1296** | User Story | Priority: High | Status: New

---

## User Story

**As a** Broker user,  
**I want** to upload a compiled CSV of category review dates and have them populate the yearly planning grid,  
**So that** I can manage all retailer review deadlines in one place without juggling separate spreadsheets.

---

## Description

Each retailer has a "buyer" or "Category Manager" responsible for adding or delisting products. There is no standard for categorizing — every retailer has their own naming conventions. Brokers obtain spreadsheets from each retailer, compile them into a single CSV, and upload it.

The client created a compiled spreadsheet and uploaded it via the Category Review import, but found errors with no way to clear all records, fix problems, and reupload.

**Data flow:** CSV upload → `CategoryReview` table → CS-1361 yearly planning grid reads from this table → grid displays milestones

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

## How the Grid Works (Relation to CS-1361)

The uploaded data feeds the CS-1361 yearly planning grid:

| CSV Column | Grid Element |
|------------|-------------|
| Region | Optional grouping row |
| Retailer | Row label (replaces "Banner Name" in the grid) |
| Category | Sub-row label |
| Review Month | Which month column the milestone appears in |
| Submission Due Date | Shown in cell or detail popover |
| Review Dates | Shown in cell or detail popover |
| Reset Date | Shown in cell or detail popover |
| Additional Notes | Shown in detail popover |

**Example:** A row with Retailer="Sprouts", Category="Frozen Desserts", Review Month="January" creates a milestone in the Sprouts → Frozen Desserts row, January column with label "Review" or "Reset" depending on the date type.

---

## Acceptance Criteria

### Scenario 1: Upload CSV
- **Given** I am a Broker user
- **When** I upload a CSV matching the required format
- **Then** the data is parsed and `CategoryReview` records are created
- **And** the CS-1361 yearly grid now displays the uploaded milestones
- **And** validation errors (missing required columns, bad dates) are reported per-row

### Scenario 2: Replace / Reupload
- **Given** I have previously uploaded a CSV
- **When** I upload a new CSV
- **Then** all existing records for my brokerage are replaced (not merged)
- **And** the grid updates to show the new data

### Scenario 3: Bulk Delete
- **Given** I have uploaded records
- **When** I click "Clear All" or "Delete All"
- **Then** all category review records for my brokerage are deleted
- **And** the grid shows empty state

### Scenario 4: Grid Display
- **Given** records exist from a CSV upload
- **When** I navigate to the Category Review page (CS-1361 yearly grid)
- **Then** I see milestones populated from the uploaded data
- **And** I can interact with them (checkmark, assign contacts, filter)

### Scenario 5: Filtering
- **Given** I am viewing the list/table view of uploaded records
- **Then** I can filter by: **Region**, **Retailer**, **Category**, **Review Month**

### Scenario 6: Permissions
- **Given** I am logged in as a Broker
- **Then** I see all reviews uploaded by my brokerage (not scoped to brands I represent)
- **And** filtering by brand is optional

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

### Grid Integration
- The CS-1361 yearly grid reads from the same `CategoryReview` table
- No separate data source needed — upload once, grid reflects immediately
- The grid groups records by Retailer → Category → Month

---

## Functional Requirements

### FR1: CSV Upload
- **FR1.1** Endpoint: `POST /api/category-reviews/import` (reuse existing or extend)
- **FR1.2** Accepts `.csv` files. Column headers must match exactly: `Region,Retailer,Category,Review Month,Submission Due Date(MM/DD/YY),Review Dates(MM/DD/YY),Reset Date(MM/DD/YY),Additional Notes`
- **FR1.3** Required columns: `Retailer`, `Category`, `Review Month`. All others optional.
- **FR1.4** Date columns parsed as MM/DD/YY. Invalid dates → per-row error, row skipped
- **FR1.5** `BrandID` and `BrokerageCompanyID` set server-side from the uploading broker's context (not from CSV)
- **FR1.6** `ShouldBeInCalender` defaults to `false`
- **FR1.7** Response returns: count of rows imported, count of errors, error details per row
- **FR1.8** On re-upload: **delete all existing records for this brokerage** before inserting new rows (replace, not merge)

### FR2: Bulk Delete
- **FR2.1** Endpoint: `DELETE /api/category-reviews/clear`
- **FR2.2** Deletes all `CategoryReview` records where `BrokerageCompanyID` matches the current broker's org
- **FR2.3** Requires confirmation dialog before executing
- **FR2.4** Returns count of deleted records

### FR3: Grid Data API
- **FR3.1** Endpoint: `GET /api/category-reviews/calendar?year={year}`
- **FR3.2** Returns records grouped by Retailer → Category → Month (see CS-1361 FR8 for response shape)
- **FR3.3** The `Review Month` CSV column determines which grid column the milestone appears in
- **FR3.4** Each row becomes a milestone cell in the grid with type "Review" or "Reset" (derived from whether a Reset Date is present)

### FR4: List/Table View
- **FR4.1** A separate list/table view of all uploaded records with columns matching the CSV
- **FR4.2** Endpoint: `GET /api/category-reviews/list?region=&retailer=&category=&reviewMonth=`
- **FR4.3** Supports filtering by Region, Retailer, Category, Review Month
- **FR4.4** Supports sorting by any column
- **FR4.5** Each row is clickable → navigates to the Category Review detail page

### FR5: Permissions
- **FR5.1** All brokers in a brokerage see all uploaded reviews (not scoped to brands they represent)
- **FR5.2** Brand filtering is optional (client-side or query parameter)
- **FR5.3** Import and delete actions restricted to BROKER and BROKERSUBUSER roles

### FR6: Data Model — CategoryReview Entity
```
CategoryReview
├── Id (Guid, PK)
├── BrokerageCompanyId (Guid, FK → BrokerageCompany)
├── BrandId (Guid, FK → Brand, nullable — set server-side)
├── Region (string, optional)
├── Retailer (string, required)
├── Category (string, required)
├── ReviewMonth (string, required — e.g., "January")
├── SubmissionDueDate (date, nullable)
├── ReviewDate (date, nullable)
├── ResetDate (date, nullable)
├── AdditionalNotes (text, nullable)
├── ShouldBeInCalender (bool, default false)
├── CreatedBy/On, LastModifiedBy/On (AuditableEntity)
└── Deleted (bool, soft delete)
```

---

## Dependencies
- **CS-1361** — Yearly planning grid (consumes data from this feature)
- **CS-NEW-bulk-delete-category-reviews.md** — Bulk delete
- `POST category-reviews/import` (existing endpoint)
- `DELETE Brokers/category-reviews` (existing endpoint or extend)
