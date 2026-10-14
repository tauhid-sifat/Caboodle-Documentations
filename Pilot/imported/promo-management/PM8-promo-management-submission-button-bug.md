---
type: Document
module: promo-management
jira: [PM8]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/promo-management-status.md
---

# Promo Management | Submission Button Does Not Work

**PM8** | Bug | Priority: TBD | Status: New

---

## User Story

**As a** Broker or Brand user in Promotional Management,  
**I want** the submission button to function correctly,  
**So that** I can submit promo events without the action failing or doing nothing.

---

## Description

The **Submission** button in Promotional Management does not work — clicking it produces no successful submission (button is unresponsive, errors, or the submission is not persisted). This is a defect report distinct from the related enhancement tickets (see Related).

Reported symptom: "Submission Button Does not work." Needs investigation to determine whether the failure is:
- Frontend (button handler / API call not firing),
- Backend (submission endpoint error or permission/role check failing), or
- Data/state related (e.g., required fields missing, event in a state that blocks submission).

---

## Acceptance Criteria

### Scenario 1: Reproduce
- **Given** I am on the Promotional Management view with one or more promo events
- **When** I click the Submission button
- **Then** I can confirm the failing behavior (error, no-op, or unexpected result) and capture console/network evidence

### Scenario 2: Fix — Successful Submission
- **Given** the defect is fixed
- **When** I click the Submission button for valid, submittable events
- **Then** the submission succeeds and the event's submission state (`IsSubmitted` / status) is updated
- **And** the user receives clear feedback (success confirmation or error if invalid)

### Scenario 3: Role-Aware Behavior
- **Given** role restrictions apply (BROKER / BROKERSUBUSER limited to assigned brands)
- **When** a user clicks submit
- **Then** the backend enforces the same role/brand scope as the existing submission flow

---

## Design Reference
- Existing submission flow: `UpdateSubmissionStatusOfEventsRequest` (role-aware submission flag)
- Promo status options in submission: `CS-1615-promo-status-submission.md`

---

## Related
- **PM1** — `CS-NEW-pm1-submission-button-fix.md` — prior "Submission Button Fix" ticket; confirm whether PM8 is the same defect resurfaced or a different root cause.
- **CS-1615** — `CS-1615-promo-status-submission.md` — implements promo status options in the submission button (enhancement, not the bug itself).
- **CS-1604** — `CS-1604-broker-dashboard-logo-button.md` — unrelated (broker logo button); PM8 was chosen to avoid colliding with CS-1604.

---

## Jira Reference (data/jira-tickets)
- **CS-1530** — "On submission failure, raw backend error messages are shown as-is, with no meaningful translation for the end user." Related submission error-handling context (likely same/adjacent defect area).
- Not duplicates: CS-231 / CS-241 / CS-242 / CS-234 are **date submission** flows; CS-895 / CS-984 are **file-upload submission** flows — different from the Promo Management submission button.

---

## Notes
- Determine whether "submission" here refers to the **IsSubmitted** flag or the **PromotionEventStatus** transition (the two are separate in the domain — see AGENTS.md §10).
- Verify against the live TradeSpend submission endpoint and any frontend permission attributes; several controllers historically lack explicit `[Authorize]`/`[MustHavePermission]` checks (known tech-debt risk).
- Recommend reconciling PM8 with PM1 before development to avoid duplicate fixes.
