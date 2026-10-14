---
type: Document
module: category-review
jira: [CS-1296, CS-1361]
status: draft
last_verified: 2026-10-14
related_wiki: ../../wiki/category-review.md
---

# Analysis: CS-1296 vs CS-1361 — Calendar & Email Ambiguity

## Current State

| Aspect | CS-1361 (New Category Review) | CS-1296 (Calendar Rollup) |
|--------|------------------------------|---------------------------|
| **Data source** | `SAMPLE_PLANNING_ROWS` (hardcoded prototype data) | Compiled CSV upload (Region, Retailer, Category, Review Month, dates, notes) |
| **View type** | Yearly planning grid — Banner × Category rows × 12 month columns | List/table view with CSV column headers |
| **Rows** | Banner Name + Category (sticky left) | Region + Retailer + Category (table rows) |
| **Columns** | Jan–Dec (month columns) | Review Month, Submission Due Date, Review Dates, Reset Date (tabular) |
| **Filters** | Category, Banner, Month, Date Type | Region, Retailer, Category, Review Month |
| **Email** | "Send to Contacts" — contact selector, compose dialog (rich text, CC/BCC), send log | Not mentioned |
| **Upload** | Out of scope (see CS-1417/CS-1329) | Core feature — CSV import with bulk replace |

---

## Key Ambiguities

### 1. Two Separate Views or One Merged View?

**CS-1361** describes a **yearly grid** (Banner/Category rows × 12 months).  
**CS-1296** describes a **list/table** (rows of individual review records).

These are **complementary views**, not replacements:

| View | What it shows | When to use |
|------|--------------|-------------|
| **Yearly Grid** (CS-1361) | "Which retailers have reviews in which months?" — one cell per retailer×month | Strategic overview, planning ahead |
| **List/Table** (CS-1296) | "What are the exact dates and notes for this review?" — one row per review | Operational detail, data entry, finding specific dates |

**Recommendation:** Both views should exist. The yearly grid is the primary visual; clicking a cell drills into the list/table filtered to that retailer+month.

### 2. What Goes in the Grid Cells?

CS-1296's CSV has `Review Month` (e.g., "January"). In the yearly grid:

- A review with `Review Month = "January"` appears as a milestone in the **January column** of the grid
- The cell shows `Category` name as the milestone label
- If multiple categories have reviews in the same month at the same retailer, the cell shows a stacked list or "+N more" overflow

### 3. Retailer vs Banner — Column Mapping

CS-1361 uses **Banner Name** as the row grouping. CS-1296 uses **Region + Retailer**.

Since the CSV has no Banner column, the mapping is:
- **CS-1296 import** → creates `CategoryReview` records with `Retailer` and `Region`
- **CS-1361 grid** → groups by Retailer (displayed as the row label). If needed, a future enhancement could add Banner mapping from CRM

The CSV column `Region` becomes an additional filter, not a grid row.

### 4. Email Flow — Where & How

CS-1361 describes "Send to Contacts." This should live on the **Yearly Grid page** as a toolbar button (matching the Lovable prototype).

**Flow:**

```
User clicks "Send to Contacts"
  → Popover opens with contact list (grouped by brand, checkboxes)
  → User selects recipients, clicks "Compose"
  → Dialog opens:
      To: selected contacts (read-only summary)
      CC: optional free-text email input
      BCC: optional free-text email input
      Subject: text input
      Message: rich text editor (bold, bullets, links)
      Send button (disabled until subject + message filled)
  → User clicks Send
  → System sends email via IMailService
  → Entry saved to Send Log (DB, not localStorage)
  → Toast: "Message sent to N contact(s)"
  → Dialog closes, state resets
```

**Contacts data source:** Brand contacts from the CRM module (same as `Contact` entity used in BannerActivity @-mentions).

### 5. Data Flow — How CS-1296 Feeds CS-1361

```
CS-1296: Upload CSV
  → POST /category-reviews/import
  → Creates CategoryReview records in DB
  → Each record has: Region, Retailer, Category, ReviewMonth, SubmissionDueDate, ReviewDate, ResetDate, AdditionalNotes

CS-1361: Yearly Grid loads
  → GET /category-reviews/calendar?year=2026
  → Returns records grouped by Retailer → Category → Month
  → Grid renders: Retailer as row, Category as sub-row, months as columns
  → Each cell shows milestones for that month

User pushes record to calendar
  → PATCH /category-reviews/calender/push
  → Creates CategoryReviewCalender join record (BrandID + CategoryReviewID)
  → Record now appears in brand calendars
```

---

## Summary of Architecture Decision

| Decision | Answer |
|----------|--------|
| **How many views?** | Two: Yearly Grid (CS-1361) + List/Table (CS-1296) |
| **What goes in grid cells?** | Category name as milestone, colored by type (Review/Reset/etc.) |
| **Row grouping?** | Retailer (not Banner, since CSV has no Banner column) |
| **Email location?** | Toolbar button on the Yearly Grid page |
| **Email backend?** | `IMailService` + new `SendLog` DB table |
| **CS-1296 data → CS-1361** | Import populates CategoryReview table → Grid reads from same table |
| **Do we build both?** | Yes — start with List/Table (CS-1296), then overlay the Yearly Grid (CS-1361) using the same data |

---

## Resolving the Prototype Confusion (from prototypes/Daily Delight Calendar)

The Lovable prompts reveal exactly what the client intended. There are **three separate features** that serve different purposes:

### Feature 1: Global "Send to Contacts" (Prompt 10)
```
Toolbar button → selects contacts → composes message → sends → logged in Send Log
```
- **What it does:** Sends a free-form email to brand contacts about the **calendar as a whole**
- **Linked to a specific review?** ❌ No — it's a general message about the Category Review schedule
- **Subject & body:** Free text typed by the user (they can mention specific reviews in the message)
- **Use case:** "Here's the Q3 category review schedule, please review"
- **Log:** Grouped by subject + timestamp, shows recipients and message body

### Feature 2: Cell Single-Click → Checkmark (Prompt 11, 12)
```
Click once → green checkmark appears on cell
Click again → checkmark removed
```
- **What it does:** Personal "I've reviewed this" tracking
- **Linked to a specific review?** ✅ Yes — per-cell personal indicator
- **NOT shared:** Per-user local state (should be per-user in production)
- **Use case:** "I've already followed up on this one, don't need to revisit"

### Feature 3: Cell Double-Click → Assign Contacts (Prompt 17)
```
Double-click cell → popover with contact checkboxes → assign contacts to that cell
```
- **What it does:** Assigns contacts to a **specific review milestone** (specific Banner × Category × Month)
- **Linked to a specific review?** ✅ Yes — directly linked to that one cell
- **Purpose:** Track who is responsible for or should be notified about that specific review
- **NOT an email action:** This is responsibility tracking, not sending

### Summary

| Aspect | "Send to Contacts" (Prompt 10) | Cell Click (Prompt 11) | Cell Double-Click (Prompt 17) |
|--------|-------------------------------|----------------------|------------------------------|
| **Trigger** | Toolbar button | Single-click cell | Double-click cell |
| **Linked to a review?** | No (general message) | Yes (personal tracking) | Yes (responsibility) |
| **What it does** | Sends email to contacts | Toggles checkmark | Assigns contacts to cell |
| **Persistence** | Send Log (DB) | Per-user state | Cell contacts (DB) |
| **When added** | Prompt 10 | Prompt 11 | Prompt 17 (late addition) |

---

### Summary Table

| Aspect | Global "Send to Contacts" | Cell Assign Contacts | Cell Checkmark |
|--------|--------------------------|---------------------|----------------|
| **Trigger** | Click toolbar button | Double-click a cell | Single-click a cell |
| **Linked to a review?** | No (general message) | Yes (specific cell) | Yes (specific cell) |
| **What it does** | Sends email | Tracks responsibility | Marks as reviewed |
| **Persistence** | Send Log (DB) | Cell contacts (DB) | Per-user state |
| **UI** | Popover → Compose Dialog | Popover with checkboxes | Green checkmark badge |

### Recommended Cleanup for CS-1361

1. **Rename the toolbar button** — "Send to Contacts" → **"Email Contacts"** to distinguish it from cell-level contact assignment
2. **Add a tooltip on cell checkmark** — "Mark as reviewed" (or "Followed up") to clarify the action
3. **Cell double-click label** — Change "Assign Contacts" popover title to **"Assign Follow-Up Contacts"** to clarify this is responsibility tracking, not email
4. **Optional email trigger** — When a contact is assigned to a cell, optionally show a prompt: "Send notification to assigned contact?"

