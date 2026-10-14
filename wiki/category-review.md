---
type: reference
title: Category review three distinct features (CS-1361 vs CS-1296)
module: category-review
status: current
last_verified: 2026-10-14
---

# CATEGORY REVIEW — THREE DISTINCT FEATURES (CS-1361 vs CS-1296)

From the Lovable prototype (prompts 1-17), the Category Review has **three separate interactions**:

| Feature | Trigger | Linked to cell? | Purpose | Lovable Prompt |
|---------|---------|----------------|---------|----------------|
| **Send to Contacts** | Toolbar button | ❌ No — global email | Send free-form email about the calendar | Prompt 10 |
| **Cell Click → Checkmark** | Single-click cell | ✅ Yes | Personal "I've reviewed this" tracking (per-user) | Prompt 11 |
| **Cell Double-Click → Assign Contacts** | Double-click cell | ✅ Yes | Assign responsibility for that specific review | Prompt 17 |

### CS-1361: Yearly Planning Grid
- Row grouping: **Retailer** (not Banner — CSV has no Banner column)
- Columns: 12 months (Jan-Dec)
- Cell badges: color-coded milestone types
- Filter: Category, Banner/Retailer, Month, Date Type
- Year navigation with chevrons + "This Year" button
- Promotional Calendar toggle (same grid, different data source)

### CS-1296: Calendar Rollup (CSV Upload)
- Upload format: `Region,Retailer,Category,Review Month,Submission Due Date(MM/DD/YY),Review Dates(MM/DD/YY),Reset Date(MM/DD/YY),Additional Notes`
- Required columns: `Retailer`, `Category`, `Review Month`
- Date format: MM/DD/YY
- Reupload replaces all data (no merge)
- Entity fields: `Region`, `Retailer`, `Category`, `ReviewMonth`, `SubmissionDueDate`, `ReviewDate`, `ResetDate`, `AdditionalNotes`
- `BrandID` and `BrokerageCompanyID` set server-side
- `ShouldBeInCalender` defaults to `false`

### Data Flow
```
CS-1296: Upload CSV → POST /category-reviews/import → CategoryReview table
CS-1361: Grid loads → GET /api/category-reviews/calendar?year=YYYY → reads from CategoryReview table
```
