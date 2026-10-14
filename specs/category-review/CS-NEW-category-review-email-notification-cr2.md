---
module: category-review
jira: [CR2]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/category-review.md
---

# Category Review | Email Notification (Send to Contacts)

**CR2** | New Requirement | User Story | Priority: High | Status: New

---

## User Story

**As a** Broker user,  
**I want** to send Category Review summaries to brand contacts via email with a text editor, CC/BCC, and a send log,  
**So that** I can share review milestones with stakeholders and keep an audit trail.

---

## Description

Based on the Lovable prototype (SendToContacts component), brokers need to email Category Review calendars/summaries to brand contacts. The prototype implements:

1. **Contact selection** via a popover with checkboxes
2. **Compose dialog** with subject line and message body
3. **Send log** stored in localStorage (to be replaced with backend persistence)
4. **Toast notifications** on successful send

This story replaces the prototype's localStorage simulation with a real backend email service and integrates it with the Category Review yearly planning grid.

---

## Acceptance Criteria

### Scenario 1: Contact Selection
- **Given** I am viewing the Category Review yearly grid
- **When** I click "Send to Contacts"
- **Then** a contact selector popover opens listing brand contacts (name, brand, email)
- **And** I can select multiple contacts with checkboxes, including a "Select All" toggle
- **And** I can search/filter contacts by name or brand
- **And** CC/BCC fields are available in the compose dialog

### Scenario 2: Compose Email
- **Given** I have selected contacts
- **When** I click "Compose"
- **Then** a dialog opens with:
  - "To:" line showing selected contacts
  - **Subject** input
  - **Rich text editor** for the message body (bold, italic, bullet lists)
  - **CC** and **BCC** fields
  - "Send" button (disabled if subject or body is empty)

### Scenario 3: Send & Audit Log
- **Given** I have composed the email
- **When** I click "Send"
- **Then** the email is sent via the backend email service
- **And** a send log entry is created recording: recipients, subject, message, sent timestamp
- **And** I see a success toast notification
- **And** the email is **not** auto-saved to the broker's Sent folder (matches CS-1361 requirement)

### Scenario 4: Send Log View
- **Given** I have sent emails
- **When** I open the "Send Log"
- **Then** I see past emails grouped by subject + timestamp
- **And** each group shows recipients, message body, and sent time
- **And** I can expand/collapse groups via accordion

---

## Design Reference

### Prototype Implementation (`src/components/SendToContacts.tsx`)
- Contact selection: `Popover` with checkboxes + "Select All"
- Compose: `Dialog` with `<Input>` (subject) + `<Textarea>` (message)
- Send log: `Dialog` with `<Accordion>` grouping by subject + timestamp
- Persistence: `localStorage` (replace with backend)

### Backend Changes Needed
- Replace `localStorage` with a `SendLog` API endpoint
- Integrate with `IMailService` for actual email delivery (reuse from BannerActivity @-mentions)
- Store CC/BCC recipients
- Rich text editor needs HTML email support

---

## Notes
- The Lovable link provided by client: `https://lovable.dev/projects/932320d2-ce2b-4b52-ad38-ba5a2a214dc1`
- Existing `IMailService` infrastructure can be reused
- Rich text editor recommendation: TipTap or Quill (whichever the codebase already uses)
- The Category Review yearly grid is the trigger context, but the send feature could also be accessible from the list view
