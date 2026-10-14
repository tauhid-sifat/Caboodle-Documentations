# Category Review | Email Notification

**New Requirement** | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user managing Category Reviews,  
**I want** to select contacts and send email notifications about category reviews directly from the Category Review page,  
**So that** I can share review updates, milestones, and schedules with brand stakeholders without leaving the platform.

---

## Description

The Category Review module needs built-in email notification capability. The prototype (`prototypes/Daily Delight Calendar/`) demonstrates the pattern: a "Send to Contacts" button that opens a contact selection popover, followed by a compose dialog, with a send log for audit trail.

---

## Acceptance Criteria

### Scenario 1: Contact Selection
- **Given** I am on the Category Review page
- **When** I click "Send to Contacts"
- **Then** a popover opens listing available contacts grouped by brand
- **And** each contact shows their name and brand
- **And** I can check individual contacts or use "Select All"
- **And** the Compose button is disabled until at least one contact is selected

### Scenario 2: Compose & Send Email
- **Given** I have selected one or more contacts
- **When** I click Compose
- **Then** a compose dialog opens with:
  - **To:** showing selected contact names and brands (read-only)
  - **Subject line** input
  - **Message body** textarea
  - **Send** button (disabled until both subject and message are filled)
- **And** clicking Send delivers the email to each selected contact
- **And** a toast confirms the number of recipients
- **And** the sent email does **not** save to the user's Sent mailbox (CC themselves if they want a copy)

### Scenario 3: Send Log
- **Given** I have sent emails from the Category Review page
- **When** I click "Send Log"
- **Then** a dialog shows all sent messages grouped by subject and timestamp
- **And** expanding a group shows the message body and recipient list (name, brand, email)
- **And** the log persists via API (prototype uses localStorage as placeholder)

### Scenario 4: Contact Management
- **Given** I am a Broker or Admin
- **When** contacts are managed in the system
- **Then** the contact list available for email notifications reflects the broker's assigned brand stakeholders
- **And** contacts include brand owners, brand sub-users, and other relevant stakeholders

---

## Design Reference
- **Prototype code:** `prototypes/Daily Delight Calendar/src/components/SendToContacts.tsx` — full implementation pattern (contact selection popover, compose dialog, send log)
- **Proto integration:** `prototypes/Daily Delight Calendar/src/pages/Index.tsx:89` — placed in the page header alongside filters

---

## Out of Scope
- Rich text editor for email body (prototype uses plain textarea — use same unless specified otherwise)
- CC/BCC fields (not in prototype — raise separately if needed)
- Automated/triggered notifications (manual send only)
- Email template management

---

## Related Tickets
- **CS-1361** — New Category Review Functionality (yearly planning grid; shares the SendToContacts component pattern)
- **CS-1427/CS-1428/CS-1429** — Admin email log and sent emails screen (for admin-level audit)

---

## Notes
- Reuse the `SendToContacts` component pattern from CS-1361's prototype. The component can be shared across both the yearly planning grid and the category review list views.
- Production implementation should replace localStorage persistence with an API-backed send log.
- The existing `IMailService` infrastructure can be used for email delivery.
- Contact list should be populated from the broker's assigned brand contacts (not hardcoded as in the prototype).
