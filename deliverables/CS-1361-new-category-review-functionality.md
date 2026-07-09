# Broker Dashboard | New Category Review Functionality

**CS-1361** | User Story | Priority: High | Status: Backlog  
**Assignee:** Bijoy Chandra Nath | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** a redesigned Category Review experience with a yearly planning grid, in-app email with text editor and CC/BCC, and a send log,  
**So that** I can visualize review milestones across banners, share updates with stakeholders, and keep an audit trail.

---

## Acceptance Criteria

### Scenario 1: Yearly Planning Grid
- **Given** I am a Broker or Broker Sub-User logged into the Broker Dashboard
- **When** I navigate to the Category Review section
- **Then** I see a scrollable yearly table with **Banner Name** and **Category** as sticky left columns and **12 month columns** (Jan–Dec)
- **And** each cell displays the milestone type for that month (e.g., "Review", "Reset")
- **And** milestone types are color-coded (e.g., green for Reset, blue for promotional events)
- **And** I can click a cell to mark it with a checkmark for follow-up tracking
- **And** I can double-click a cell to assign specific contacts to that milestone

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

### Scenario 4: Send to Contacts (with Text Editor & CC/BCC)
- **Given** I want to share review information with stakeholders
- **When** I click "Send to Contacts"
- **Then** a contact selection popover opens with:
  - List of contacts grouped by brand, each with a checkbox
  - "Select All" toggle
  - "Compose" button (enabled when ≥ 1 contact selected)
- **When** I click Compose, a dialog opens with:
  - **To:** selected contacts (name, brand)
  - **CC:** optional field for additional recipients
  - **BCC:** optional field for blind copy
  - **Subject line** input
  - **Message body** with a **text editor** (rich text: bold, bullets, links)
  - **Send** button (disabled until subject and message are filled)
- **And** the sent email does **not** automatically save to the user's Sent mailbox (the user should CC themselves if they want a copy)
- **And** sending logs the message in the system and shows a confirmation toast

### Scenario 5: Send Log
- **Given** I have sent messages via the Category Review page
- **When** I click "Send Log"
- **Then** an accordion list shows sent messages grouped by subject
- **And** expanding a group shows the message body and recipients (name, brand, email)
- **And** the log persists (localStorage in prototype; API-backed in production)

### Scenario 6: Promotional Calendar View
- **Given** I am on the Category Review page
- **When** I click "Promotional Calendar"
- **Then** I see the same yearly grid layout populated with promotional event data
- **And** I can navigate back to Category Review

---

## Out of Scope
- Create/edit individual category review forms (existing upsert flow unchanged)
- Bulk CSV upload (covered by CS-1417 / CS-1329)
- Propagation control (covered by CS-1423)
- Drag-and-drop calendar push/remove (covered by CS-1423)
- Auto-save to user's email Sent folder (user must CC themselves)

---

## Design Reference
- **Prototype code:** `Daily Delight Calendar/` (React + Vite + shadcn/ui + Tailwind)
- **Lovable project:** https://lovable.dev/projects/932320d2-ce2b-4b52-ad38-ba5a2a214dc1
- **Note:** The prototype uses a plain textarea for the message body and lacks CC/BCC — the Jira requirements specify upgrading this to a rich text editor with CC/BCC fields.

---

## Related Tickets
- **CS-1149** — Category Review Uploads & Data Pushes Issues
- **CS-1329** — Fix Category Review Data Isolation and Upload Issues
- **CS-1417** — Category Review Filter & Upload Issues
- **CS-1423** — Category Review Propagation
- **CS-1427/CS-1428/CS-1429** — Email log & admin sent emails screen

---

## Notes
- Prototype send-log uses localStorage; production should persist via API.
- The yearly grid component is shared between Category Review and Promotional Calendar — build generically.
- Permission attributes should be enforced on all new endpoints.
