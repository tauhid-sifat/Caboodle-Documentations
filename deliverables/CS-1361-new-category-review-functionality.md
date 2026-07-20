# Broker Dashboard | New Category Review Functionality

**CS-1361** | User Story | Priority: High | Status: Backlog  
**Assignee:** Bijoy Chandra Nath | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** a yearly planning grid with per-cell contact assignment, personal checkmark tracking, and an email tool to share the calendar,  
**So that** I can visualize review milestones across retailers, assign responsibility, and notify stakeholders.

---

## Description

Based on the Lovable prototype (prompts 1-17), the wireframe implements a yearly planning grid with:

1. **Grid & List views** — toggle between a monthly matrix grid and a flat table listing all milestones
2. **Global "Send to Contacts" (Prompt 10)** — toolbar button to email brand contacts about the calendar. NOT linked to any specific cell. Free-form subject + message. Logged in localStorage.
3. **Cell double-click → Checkmark (Prompt 11)** — single-click toggles a green checkmark on a cell. Per-user tracking, in-memory only (lost on refresh in prototype).
4. **Cell Click → Assign Contacts (Prompt 17)** — double-click opens a modal to assign contacts to that specific cell (retailer × month). Includes a "Send Email" button to email those assigned contacts.
5. **Promotional Calendar toggle** — switches to a similar grid populated with promo event data (separate view, no Send to Contacts/Send Log).

---

## Acceptance Criteria

### Scenario 1: Yearly Planning Grid
- **Given** I am a Broker or Broker Sub-User logged into the Broker Dashboard
- **When** I navigate to the Category Review section
- **Then** I see a scrollable yearly table with **Banner Name** and **Category** as sticky left columns and **12 month columns** (Jan–Dec)
- **And** each milestone cell displays the type as a colored badge (e.g., "Review" in blue, "Reset" in green)
- **And** I can toggle between **Grid** and **List** views

### Scenario 2: Year Navigation
- **Given** I am viewing the Category Review grid
- **When** I click the left/right chevron buttons
- **Then** the grid switches to the previous/next year
- **And** I can click "This Year" to jump back to the current year

### Scenario 3: Filters
- **Given** I am viewing the Category Review grid
- **When** I open the Filters panel
- **Then** I can filter by **Category**, **Banner Name**, **Month**, and **Date Type** (milestone type)
- **And** a badge shows how many filters are active
- **And** I can clear all filters with one click

### Scenario 4: Grid/List View Toggle
- **Given** I am viewing the Category Review grid
- **When** I click "List"
- **Then** I see a flat table with columns: Region, Retailer, Category, Review Month, Submission Due Date, Review Date, Reset Date, Additional Notes, Action
- **And** I can toggle back to "Grid"

### Scenario 5: Cell Click — Milestone Detail Modal
- **Given** I am viewing the yearly grid
- **When** I single-click a cell that has a milestone (Review or Reset)
- **Then** a detail modal opens showing:
  - **Header:** Banner Name — Category
  - **Sub-header:** Month Year
  - **Type:** colored badge (Review in blue, Reset in green)
  - **Region**
  - **Review Start Date** and **Review End Date** (if type is Review)
  - **Reset Date** (if type is Reset)
  - **Submission Due Date** (if type is Review)
  - **Assigned Contacts** (shows contact names if any assigned, "None" otherwise)
  - **Additional Notes**
  - **"Mark as reviewed"** checkbox (toggles the green checkmark badge on the cell)
- **And** the modal has footer buttons:
  - **Assign Contacts** — opens the Assign Contacts modal for this cell
  - **Send Email** — opens the Compose Email modal pre-populated with contacts assigned to this cell (or opens Assign Contacts if none assigned)

### Scenario 6: Cell Double-Click — Assign Contacts (Prompt 17)
- **Given** I am viewing the yearly grid
- **When** I double-click a cell that has a milestone
- **Then** a modal opens titled "Assign Contacts" showing a list of brand contacts with checkboxes
- **And** I can select one or more contacts to assign to that cell
- **And** there is a "Send Email" button to compose an email to the selected contacts
- **And** "Done" saves the assignment and closes the modal

### Scenario 7: Send to Contacts (Prompt 10) — Global Email
- **Given** I want to share review information with stakeholders
- **When** I click "Send to Contacts" in the toolbar
- **Then** a contact selection modal opens with:
  - List of contacts grouped by brand, each with a checkbox
  - "Select All" toggle
  - "Compose" button (enabled when ≥ 1 contact selected)
- **When** I click Compose, a dialog opens with:
  - **To:** selected contacts (name, brand)
  - **CC:** optional field
  - **BCC:** optional field
  - **Subject line** input
  - **Message body** textarea with decorative formatting toolbar (bold, bullets, links)
  - **Send** button (disabled until subject and message are filled)

### Scenario 8: Send Log
- **Given** I have sent messages via the Category Review page
- **When** I click "Send Log"
- **Then** an accordion list shows sent messages grouped by subject + timestamp
- **And** expanding a group shows the message body and recipients (name, brand, email)
- **And** the log persists via localStorage (prototype) — production should use API/DB

### Scenario 9: Promotional Calendar View
- **Given** I am on the Category Review page
- **When** I click "Promotional Calendar"
- **Then** I see the same yearly grid layout populated with promotional event data
- **And** Promotional view uses different milestone labels (e.g., "25% MCB", "$1 Scan $4.99 SRP") with green/blue coloring
- **And** I can navigate back to Category Review
- **And** Promotional Calendar has no Send to Contacts, Send Log, or cell click interactions

---

## Data Source (Relation to CS-1296)

- The yearly grid reads from the `CategoryReview` table
- CS-1296 (Calendar Rollup) provides the CSV import that populates this table
- **Wireframe note:** Grid data is hardcoded (`CR_DATA` array) — production must read from `GET /api/category-reviews/calendar?year={year}`

---

## Design Reference

- **Wireframe:** `Wireframe/index.html` — deployed at https://caboodle-broker-dashboard.vercel.app
- **Lovable prompts:** 1-17 (documented in `CS-1296-vs-CS-1361-analysis.md`)
- **Sticky columns:** Banner Name (left: 0), Category (left: 180px) — side-by-side, not hierarchical rows
- **Grid/List toggle** is a pill group in the toolbar
- **Assign Contacts "Send Email"** opens a separate Compose modal (identical to global Send to Contacts)
- **Formatting toolbar** in compose modals is decorative only in prototype

---

## Functional Requirements

### FR1: Yearly Planning Grid
- **FR1.1** Grid displays a table with sticky left columns (Banner Name, Category) and 12 month columns (Jan–Dec), horizontally scrollable
  - Banner Name sticky at `left: 0`, Category sticky at `left: 180px`
- **FR1.2** Each milestone cell displays the type as a colored badge: "Review" in blue, "Reset" in green
- **FR1.3** Data source: `GET /api/category-reviews/calendar?year={year}` returns records grouped by retailer → category → month
- **FR1.4** Row layout: Banner Name + Category are side-by-side columns per row (not hierarchical grouping)
- **FR1.5** Year navigation: left/right chevron buttons change year; "This Year" button resets to current year
- **FR1.6** Grid/List view toggle pill group in toolbar

### FR2: Filters
- **FR2.1** Filter panel is toggled by a "Filters" button; shows active filter count as a badge
- **FR2.2** Filter by **Category** (dropdown of unique categories from loaded data)
- **FR2.3** Filter by **Banner Name / Retailer** (dropdown of unique retailers)
- **FR2.4** Filter by **Month** (dropdown: Jan–Dec) — **wireframe note:** month filter is stored but not applied to render logic; production must fully implement
- **FR2.5** Filter by **Date Type** (dropdown: "All", "Review", "Reset", or milestone-specific values) — applied in grid view only
- **FR2.6** "Clear filters" button resets all filters when any are active

### FR3: Cell Click → Milestone Detail Modal
- **FR3.1** Single-click on a cell with content opens the **Milestone Detail** modal instead of directly toggling a checkmark
- **FR3.2** The milestone detail modal displays:
  - Banner Name and Category in the header
  - Month and Year in the sub-header
  - Milestone type as a colored badge (Review = blue, Reset = green)
  - Region text
  - **Review Start Date** and **Review End Date** rows (visible only for Review type)
  - **Submission Due Date** row (visible only for Review type)
  - **Reset Date** row (visible only for Reset type)
  - **Assigned Contacts** row — shows names of contacts assigned to this cell, or "None"
  - **Notes** row — shows additional notes
- **FR3.3** A "Mark as reviewed" checkbox at the bottom of the modal toggles the green checkmark badge on the grid cell
  - Checkmark state is per-user (User A's checkmarks invisible to User B)
  - Checkmark icon: green circle with white checkmark, positioned `absolute; top: -4px; right: -4px`
- **FR3.4** Footer buttons:
  - **Assign Contacts** — opens the Assign Contacts modal for this cell (same as double-click behavior)
  - **Send Email** — opens the Compose Email modal pre-populated with contacts already assigned to this cell. If no contacts are assigned, opens Assign Contacts modal first
- **FR3.5** **Wireframe:** checkmark and assignment state are in-memory — production must persist via API (`GET/PUT /api/users/category-review-checkmarks` and `POST/PUT /api/category-reviews/cell-contacts`)

### FR4: Cell Double-Click → Assign Contacts
- **FR4.1** Double-click on a cell opens a modal titled "Assign Contacts"
- **FR4.2** Shows a list of brand contacts with checkboxes (data source: `GET /api/contacts?brandIds={brokerBrandIds}`)
- **FR4.3** **Wireframe:** contacts are hardcoded (`CONTACTS` array of 4) and assignments stored in-memory (`assignContacts`) — production must persist via `POST/PUT /api/category-reviews/cell-contacts`
- **FR4.4** Assigned contacts are visible to all users in the brokerage (shared state)
- **FR4.5** This is NOT an email action — it only assigns/removes contact references
- **FR4.6** "Send Email" button in the modal opens a compose dialog identical to FR5 (targeting the selected contacts)

### FR5: Send to Contacts — Global Email (Prompt 10)
- **FR5.1** Toolbar button "Send to Contacts" opens a modal with contact list
- **FR5.2** Contacts listed with checkboxes + "Select All" toggle
- **FR5.3** Data source: `GET /api/contacts?brandIds={brokerBrandIds}` (same as FR4)
- **FR5.4** When ≥ 1 contact selected, "Compose" button is enabled
- **FR5.5** Clicking "Compose" opens a compose dialog with:
  - **To:** read-only summary of selected contacts (name + brand)
  - **CC:** optional text input (comma-separated emails)
  - **BCC:** optional text input (comma-separated emails)
  - **Subject:** text input (required)
  - **Message:** textarea with decorative formatting toolbar (Bold, Italic, Bullets, Link icons — no functionality)
  - **Send:** button, disabled until subject + message are filled
- **FR5.6** Clicking Send: **Wireframe** logs to in-memory `sendLog` array + localStorage. Production must call `POST /api/category-reviews/send-email`
- **FR5.7** Email is NOT linked to any specific cell — it's a general calendar message
- **FR5.8** Email does NOT save to user's Sent mailbox
- **FR5.9** On success: alert "Message sent to N contact(s)", dialog closes, state resets

### FR6: Send Log
- **FR6.1** Toolbar button "Send Log" opens a modal with scrollable list
- **FR6.2** Entries grouped by subject + sent timestamp using collapsible accordion cards
- **FR6.3** Each group shows: subject, timestamp, message body, recipients (name, brand, email)
- **FR6.4** **Wireframe:** data source is `localStorage` (key: `caboodleSendLog`). Production must use `GET /api/category-reviews/send-log`
- **FR6.5** Log persisted in DB (table: `CategoryReviewEmailLog` with columns: `id, brokerId, subject, message, sentAt`)
- **FR6.6** Recipients stored in separate table/junction: `CategoryReviewEmailRecipients (emailLogId, contactId, contactName, brand, email)`

### FR7: List View (Grid alternative)
- **FR7.1** List view shows a flat table with columns: Region, Retailer, Category, Review Month, Submission Due Date, Review Date, Reset Date, Additional Notes, Action
- **FR7.2** Toolbar buttons in list view:
  - **Add To Calendar** — **DISABLED** (placeholder)
  - **Export** — **DISABLED** (placeholder)
  - **Add Log** — enabled but no handler (placeholder)
  - **Upload Category Review** — enabled but no handler (placeholder)
  - **Remove Log** — **DISABLED** (placeholder)
  - **Delete All Matching** — **DISABLED** (placeholder)
  - **Filter** — toggles the same filter bar as grid view
- **FR7.3** Each row has an **Edit** button (placeholder — shows alert)
- **FR7.4** Row click is a placeholder (`alert('Navigate to detail...')`)

### FR8: Promotional Calendar Toggle
- **FR8.1** "Promotional Calendar" button in toolbar switches to the promo calendar view
- **FR8.2** Same grid layout, different data source: `GET /api/promotional-events/calendar?year={year}`
- **FR8.3** Milestone labels: promo types like "25% MCB" (green badge) or "$1 Scan $4.99 SRP" (blue badge)
- **FR8.4** Grid/List toggle available (same as Category Review)
- **FR8.5** Filters: Category, Retailer, Month only (no Date Type)
- **FR8.6** **Wireframe differences vs Category Review:**
  - NO Send to Contacts button
  - NO Send Log button
  - NO cell click interactions (no checkmark, no double-click assignment)
  - List view has different columns: Brand Name, Distributor Name, Banner Name, Category Name, then 12 month columns
  - List view shows static pagination (1 / 2 / next/prev) — non-functional placeholder
  - Each banner row is followed by an EDLP row with "5% EDLP" in every month

### FR9: Yearly Grid Data Shape
```json
GET /api/category-reviews/calendar?year=2026
→ {
  "year": 2026,
  "rows": [
    {
      "retailerId": "uuid",
      "retailerName": "Sprouts",
      "categories": [
        {
          "category": "Frozen Desserts",
          "months": {
            "Jan": { "type": "Review", "submissionDueDate": "01/15/26", "reviewDates": "01/20/26", "resetDate": null, "notes": null },
            "Feb": { "type": "Reset", "submissionDueDate": null, "reviewDates": "02/10/26", "resetDate": "02/28/26", "notes": "Q1 reset" }
          }
        }
      ]
    }
  ]
}
```

---

## Wireframe Notes for Development

### Grid Structure
- Styling: Banner Name `position:sticky; left:0`, Category `position:sticky; left:180px`
- Month cells are 85px wide, centered
- Cells with milestones render `<span class="cat-badge blue/green">` with the milestone label
- Hover applies a background to entire row including sticky cells
- Empty cells are empty `<td>` tags

### Data/Storage Status (Prototype vs Production)

| Feature | Wireframe (Prototype) | Production |
|---------|----------------------|------------|
| Grid data | Hardcoded `CR_DATA` array | `GET /api/category-reviews/calendar?year={year}` |
| Checkmark state | In-memory `crChecked` object | `GET/PUT /api/users/category-review-checkmarks` |
| Contact assignments | In-memory `assignContacts` object | `POST/PUT /api/category-reviews/cell-contacts` |
| Contacts list | Hardcoded `CONTACTS` array (4) | `GET /api/contacts?brandIds={brokerBrandIds}` |
| Send log | `localStorage` (`caboodleSendLog`) | `GET /api/category-reviews/send-log` + DB |
| Email sending | `alert()` only | `POST /api/category-reviews/send-email` + `IMailService` |
| Promo Calendar data | Hardcoded `PC_DATA` array | `GET /api/promotional-events/calendar?year={year}` |
| Month filter | Stored but NOT applied | Must implement actual filtering |
| Date Type filter (list view) | NOT applied | Must implement for consistency |

### Placeholder Features (not functional in wireframe)
- List view: Add To Calendar, Export, Add Log, Upload Category Review, Remove Log, Delete All Matching
- List view: Edit button per row, row click navigation
- Promo Calendar list: pagination, Submission button, Export All button
- Formatting toolbar in compose modals (B/I/Bullets/Link icons are decorative)

---

## Related Tickets
- **CS-1296** — Category Review Calendar Rollup (CSV upload → data source for this grid)
- **CS-NEW-bulk-delete-category-reviews.md** — Bulk delete
- **CS-1427/CS-1428/CS-1429** — Email log & admin sent emails screen

---

## Notes
- The yearly grid component is shared between Category Review and Promotional Calendar — build generically
- Permission attributes should be enforced on all new endpoints
- Prototype send-log uses localStorage; production should persist via API
- Month filter (`crMonFilter`) and Date Type filter in list view are placeholders — must be fully implemented
- Contact assignments are not indicated visually on grid cells in the wireframe (no badge/count shown on cell after assignment)
