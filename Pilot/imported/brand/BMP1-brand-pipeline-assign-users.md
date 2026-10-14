---
type: Document
module: brand
jira: [CS-1594]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Brand Modules | Pipeline | Allow User to Assign to Users

**CS-1594** | Bug / Enhancement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand user managing the Pipeline,  
**I want** to actually assign users to a pipeline task (not just add them as email recipients),  
**So that** assignment ownership is tracked and visible, not just used for notifications.

---

## Description

In the Brand Module **Pipeline**, the current UI lets a user add other users, but it only registers them as **email recipients** — it does **not** create a real **assignment** on the task. As a result, there is no assignee relationship/field persisted; the added users simply receive emails.

The expected behavior: adding a user should create an **assignment** (the user is linked to the task as an assignee/owner), with email notification as a side effect of that assignment — not the other way around.

---

## Acceptance Criteria

### Scenario 1: Assign Creates a Real Assignment
- **Given** I add a user to a pipeline task
- **When** the action completes
- **Then** the user is recorded as an **assignee** on the task (persisted assignment record)
- **And** the assignment is visible wherever assignees are shown (task detail, assignee list)

### Scenario 2: Assignment Is Distinct from Email Recipients
- **Given** a task has assignees
- **When** I inspect the task
- **Then** assignees and email-recipient lists are clearly separate concepts
- **And** removing an assignment does not require also removing email access (and vice versa), per the intended design

### Scenario 3: Email Still Sent on Assignment
- **Given** a user is assigned
- **When** the assignment is saved
- **Then** the assigned user receives a notification email (consistent with current behavior)
- **But** the underlying data model now reflects a true assignment, not just a recipient entry

---

## Design Reference
- Brand Module Pipeline (CRM Pipeline task board) — assignment/notification behavior
- Related email behavior: `CS-1595-brand-pipeline-email-on-update.md`

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for "assign users to Pipeline." Related Pipeline tickets for context: **CS-530** (add email option to Pipeline), **CS-1535** (Pipeline plan search not functioning), **CS-540** (Pipeline activity URL sharing).

---

## Related
- **CS-1595** — controlling when emails are sent for pipeline updates (assignment notifications should respect that control).

---

## Notes
- Confirm the data model: is there an `Assignment`/`Assignee` entity, or only an email-recipient list today? The fix likely requires introducing/strengthening an assignment record.
- Define what "assignment" means for permissions/visibility (does an assignee gain special access, or is it informational?).
