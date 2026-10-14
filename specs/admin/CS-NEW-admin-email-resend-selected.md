---
type: spec
title: Admin email resend for selected
module: admin
status: draft
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
jira: []
---

# Admin | Sent Emails | Resend for Selected

**CS-NEW** | New Requirement | Priority: TBD | Status: Draft

---

## User Story

**As an** Admin user managing outbound emails,
**I want** to resend emails for selected items,
**So that** missed or failed recipient emails can be re-sent without rebuilding them from scratch.

---

## Description

Approved on the 2026-08-17 ticket call (D-0817-2, APPROVED): email UX gets "resend emails for selected items; select-and-email brands from the list."

Qualifying emails: TBD — the notes do not say which emails qualify (only Sent Emails screen entries? only failed sends? any sent email?). The "brands from the list" phrasing suggests selection from a list, but which list (Sent Emails vs brand list) is ambiguous. Marked OPEN below.

Selection UX: user selects one or more rows via checkboxes (or equivalent multi-select) and triggers a single resend action. Exact control placement and confirmation behavior are TBD.

Idempotency / guardrails: the notes are silent. No duplicate-storm protection, retry limits, or audit behavior was decided — captured as explicit AC placeholders plus OPEN questions rather than invented rules.

Relation to ASGE1: the sender-address work (ASGE1 / CS-1710, standardizing system-email From to info@caboodleservices.com) is a sibling concern. Resent emails should use whatever sender ASGE1 settles on; this ticket does not change the sender itself. Also note D-0727-1 (APPROVED 2026-07-27): the "assigned to" brand row was removed from the notification email body — resends use the current template, not the old body.

---

## Acceptance Criteria

### Scenario 1: Resend selected emails
- **Given** a list of sent emails with multi-select
- **When** the user selects one or more entries and triggers resend
- **Then** each selected email is re-sent to its original recipient(s) with the current template content

### Scenario 2: No duplicate sends from a single action (guardrail placeholder)
- **Given** a resend action in progress or just completed
- **When** the user repeats the trigger (double-click, refresh, re-submit)
- **Then** no duplicate emails are sent — exact mechanism TBD (notes silent; see OPEN questions)

### Scenario 3: Resent email uses current sender and template
- **Given** a resent email
- **When** it is delivered
- **Then** it uses the sender resolved by ASGE1 work and the current template body (without the removed "assigned to" row per D-0727-1)

---

## Open Questions (notes are silent — TBD, do not assume)
- Which emails qualify: any sent email, only failed/undelivered sends, or only specific types (invites vs notifications)?
- Which list hosts the action: the Admin Sent Emails screen, a brand list ("select-and-email brands"), or both?
- Guardrails: confirmation step? resend rate/limits? audit entry recording who resent what and when?
- Does resend create a new Sent Emails row, update the original, or link to it?

---

## Jira Reference
- No Jira key mentioned in the 2026-08-17 ticket-call notes. Workstream: Admin (email resend).
- Related: **ASGE1 (CS-1710)** — system-generated email sender address (Sends From standardization; resends inherit it). **CS-1427 / CS-1428 / CS-1429** — Admin Sent Emails screen (likely host list, unconfirmed).
