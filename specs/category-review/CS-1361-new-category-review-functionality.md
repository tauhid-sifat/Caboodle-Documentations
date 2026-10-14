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

Based on the Lovable prototype, this feature includes **three distinct interactions** on the yearly planning grid:

1. **Global "Send to Contacts"** — toolbar button to email brand contacts about the calendar. NOT linked to any specific cell. Free-form subject + message. Logged in Send Log.
2. **Cell click → Checkmark** — single-click toggles a green checkmark on a cell. Personal "I've reviewed this" tracking. Per-user state, not shared.
3. **Cell double-click → Assign Contacts** — double-click opens a popover to assign contacts to that specific cell (retailer × category × month). Responsibility tracking, not email.

---

## Acceptance Criteria

### Scenario 1: Yearly Planning Grid

- **Given** I am a Broker or Broker Sub-User logged into the Broker Dashboard
- **When** I navigate to the Category Review section
- **Then** I see a scrollable yearly table with **Banner Name** and **Category** as sticky left columns and **12 month columns** (Jan–Dec)
- **And** each cell displays the milestone type (e.g., "Review", "Reset")
- **And** milestone types are color-coded (e.g., green for Reset, blue for Review)

### Scenario 2: Year Navigation

- **Given** I am viewing the Category Review grid
- **When** I click the left/right chevron buttons
- **Then** the grid switches to the previous/next year
- **And** I can click "This Year" to jump back to the current year

### Scenario 3: Filters

- **Given** I am viewing the Category Review grid
- **When** I open the Filters panel
- **Then** I can filter by Category, Banner Name, Month, and Date Type (milestone type)
- **And** a badge shows how many filters are active
- **And** I can clear all filters with one click

### Scenario 4: Cell Click — Checkmark

- **Given** I am viewing the yearly grid
- **When** I single-click a cell that has a milestone
- **Then** a green checkmark appears on the top-right of the cell
- **And** clicking again removes the checkmark
- **And** the checkmark is per-user (my checkmarks are not visible to other users)

### Scenario 5: Cell Double-Click — Assign Contacts

- **Given** I am viewing the yearly grid
- **When** I double-click a cell that has a milestone
- **Then** a popover opens titled "Assign Contacts" showing a list of brand contacts with checkboxes
- **And** I can select one or more contacts to assign to that cell
- **And** assigned contacts are stored per-cell (retailer × category × month)
- **And** this is NOT an email action — it tracks responsibility/follow-up

### Scenario 6: Send to Contacts — Global Email

- **Given** I want to share review information with stakeholders
- **When** I click "Send to Contacts" in the toolbar
- **Then** a contact selection popover opens with:
  - List of contacts grouped by brand, each with a checkbox
  - "Select All" toggle
  - "Compose" button (enabled when ≥ 1 contact selected)
- **When** I click Compose, a dialog opens with:
  - **To:** selected contacts (name, brand)
  - **CC:** optional field
  - **BCC:** optional field
  - **Subject line** input
  - **Message body** with a **text editor** (rich text: bold, bullets, links)
  - **Send** button (disabled until subject and message are filled)
- **And** the email is NOT linked to any specific cell — it's a general message about the calendar
- **And** the sent email does **not** automatically save to the user's Sent mailbox
- **And** sending logs the message in the system and shows a confirmation toast

### Scenario 7: Send Log

- **Given** I have sent messages via the Category Review page
- **When** I click "Send Log"
- **Then** an accordion list shows sent messages grouped by subject + timestamp
- **And** expanding a group shows the message body and recipients (name, brand, email)
- **And** the log persists via API (not localStorage)

### Scenario 8: Promotional Calendar View

- **Given** I am on the Category Review page
- **When** I click "Promotional Calendar"
- **Then** I see the same yearly grid layout populated with promotional event data
- **And** Promotional view uses different milestone labels (e.g., "25% MCB", "$1 Scan $4.99 SRP") with blue coloring
- **And** I can navigate back to Category Review

---

## Data Source (Relation to CS-1296)

- The yearly grid reads from the `CategoryReview` table
- CS-1296 (Calendar Rollup) provides the CSV import that populates this table
- Each row in the upload becomes a milestone in the grid: Region → row grouping, Retailer → Banner Name, Category → Category, Review Month → month column
- See CS-1296 for upload/replace/bulk delete flow

---

## Design Reference

- **Email is NOT linked to a cell** — it's a toolbar-level action
- **Cell checkmark is per-user** — personal tracking, not shared
- **Cell double-click assigns contacts** — responsibility tracking, not email

---

## Functional Requirements

### FR1: Yearly Planning Grid

- **FR1.1** Grid displays a table with sticky left columns (Banner Name, Category) and 12 month columns (Jan–Dec), horizontally scrollable
- **FR1.2** Each cell displays the milestone type as a colored badge (e.g., "Review" in blue, "Reset" in green)
- **FR1.3** Row grouping: Retailer name as primary row, Category as sub-row (indented or tagged)
- **FR1.5** Year navigation: left/right chevron buttons change year; "This Year" button resets to current year

### FR2: Filters

- **FR2.1** Filter panel is toggled by a "Filters" button; shows active filter count as a badge
- **FR2.2** Filter by **Category** (dropdown of unique categories from loaded data)
- **FR2.3** Filter by **Banner Name / Retailer** (dropdown of unique retailers)
- **FR2.4** Filter by **Month** (dropdown: Jan–Dec)
- **FR2.5** Filter by **Date Type** (dropdown: "All", "Review", "Reset", or milestone-specific values)
- **FR2.6** "Clear filters" button resets all filters when any are active
- **FR2.7** Filters re-query the grid data (or filter client-side)

### FR3: Cell Click → Checkmark (Per-User)

- **FR3.1** Single-click on a cell with content toggles a green checkmark badge on the top-right of the cell
- **FR3.2** Checkmarks are per-user — User A's checkmarks are invisible to User B
- **FR3.3** Checkmark icon: green circle with white checkmark

### FR4: Cell Double-Click → Assign Contacts

- **FR4.1** Double-click on a cell opens a `Popover` positioned at the cell
- **FR4.2** Popover title: "Assign Contacts"
- **FR4.3** Shows a list of brand contacts with checkboxes
- **FR4.5** Assigned contacts are visible to all users in the brokerage (shared state)
- **FR4.6** This is NOT an email action — it only assigns/removes contact references

### FR5: Send to Contacts — Global Email

- **FR5.1** Toolbar button "Send to Contacts" opens a `Popover` with contact list
- **FR5.2** Contacts grouped by brand, each with a checkbox + "Select All" toggle
- **FR5.3** When ≥ 1 contact selected, "Compose" button appears
- **FR5.4** Clicking "Compose" opens a `Dialog` (Compose Message) with:
  - **To:** read-only summary of selected contacts
  - **CC:** optional text input (comma-separated emails)
  - **BCC:** optional text input (comma-separated emails)
  - **Subject:** text input (required)
  - **Message:** rich text editor (bold, bullets, links) (required)
  - **Send:** button, disabled until subject + message are filled
- **FR5.6** Clicking Send
- **FR5.7** Email is sent via existing infrastructure
- **FR5.8** Email is NOT linked to any specific cell — it's a general calendar message
- **FR5.9** Email does NOT save to user's Sent mailbox
- **FR5.10** On success: toast "Message sent to N contact(s)", dialog closes, state resets

### FR6: Send Log

- **FR6.1** Toolbar button "Send Log" opens a `Dialog` with scrollable list
- **FR6.2** Entries grouped by subject + sent timestamp using `Accordion`
- **FR6.3** Each group shows: subject, timestamp, message body, recipients (name, brand, email)
- **FR6.5** Log persisted in DB (table: `CategoryReviewEmailLog`)
- **FR6.6** Recipients stored in separate table/junction

### FR7: Promotional Calendar Toggle

- **FR7.1** "Promotional Calendar" button in toolbar navigates to `/promotional` route
- **FR7.2** Same grid component, different data source
- **FR7.3** Milestone labels: "25% MCB", "$1 Scan $4.99 SRP" (blue color)
- **FR7.4** Same filters, checkmark, contact assignment, and email features apply
- **FR7.5** "Category Review" button navigates back to `/` route

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
