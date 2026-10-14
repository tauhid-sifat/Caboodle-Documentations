---
type: Document
module: admin
jira: [CS-1710]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Admin | System Generated Emails | Sender Address

**CS-1710** | Task | Priority: Medium | Status: Backlog (Needs Discussion)
**Internal code:** ASGE1
**Reporter:** Constance Wolfe

---

## User Story

**As** the platform,
**I want** system-generated emails to be sent from info@caboodleservices.com,
**So that** recipients see a consistent, trusted sender and replies reach a monitored inbox.

---

## Description

System-generated emails do not currently come from info@caboodleservices.com. The client wants the sender standardized to that address across all system emails.

This needs discussion before build. The items to settle are the display name, the reply-to behavior, and whether the sender should differ by email type, for example invites versus notifications.

Email reliability work and the SES upgrade are in progress elsewhere, so this ticket should align with that effort.

---

## Acceptance Criteria

### Scenario 1: Consistent sender
- **Given** any system-generated email
- **When** it is delivered
- **Then** the From address is info@caboodleservices.com

### Scenario 2: Display name
- **Given** a system email is opened
- **Then** the sender shows a defined display name, to be confirmed

### Scenario 3: Reply behavior
- **Given** a recipient replies to a system email
- **Then** the reply goes to the configured address, either info@ or a no-reply policy, to be confirmed

### Scenario 4: All email types covered
- **Given** the set of system emails, including user invites, category review, brand report, market overview notifications, and exports
- **Then** all of them use the new sender

### Scenario 5: Visible in Sent Emails
- **Given** the Admin Sent Emails screen
- **Then** the From address is shown for each email

---

## Design Notes
- Depends on domain verification for caboodleservices.com in SES, including SPF and DKIM.
- Align with the ongoing SES upgrade and the email reliability work (RISK-075).
- Consider a single centralized sender configuration rather than per-template values.

---

## Open Questions (Needs Discussion)
- Display name for the sender?
- Reply-to: monitored inbox or no-reply?
- Does this apply to Admin app invites as well as brand and broker emails?
- Is caboodleservices.com already verified in SES, and is info@ a real monitored mailbox?
- Should any emails keep a different sender, for example per-brand branding?
- How does this relate to the in-progress SES upgrade timeline?

---

## Jira Reference
- **CS-1427 / CS-1428 / CS-1429** - Admin Sent Emails screen
- **CS-1430** - SNS webhook for SES delivery events
- **CS-1166** - SES signup confirmation deliverability
- **RISK-075** - email reliability
