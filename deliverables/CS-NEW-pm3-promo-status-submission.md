# Promotional Management | Implement Promo Status Options in Submission Button

**PM3** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** promo status options (Active, Cancelled, Pending, Did Not Run, Declined, Retailer Approved, Completed, Submitted) available in the Submission button,  
**So that** I can update event statuses without switching to the Trade Spend Sandbox.

---

## Description

Currently, the broker Promotional Management view is read-only. The status lifecycle (Active → RetailerApproved → Completed, etc.) is only manageable in the Trade Spend Sandbox (TSS). Brokers cannot update event statuses from the Promotional Management page.

Additionally, submission (`IsSubmitted` flag) is separate from status. This story brings both status management and submission into the broker Promotional Management view, with each status change tagged by the user's login for audit trail.

---

## Acceptance Criteria

### Scenario 1: Status Dropdown on Events
- **Given** I am viewing promotional events
- **Then** each event row shows its current status (Active, Cancelled, Pending, Did Not Run, Declined, Retailer Approved, Completed, Submitted)
- **And** I can change the status via a dropdown or context menu

### Scenario 2: Bulk Status Update
- **Given** I have selected multiple events
- **When** I click "Update Status"
- **Then** I can choose a new status to apply to all selected events
- **And** the status change is persisted immediately

### Scenario 3: Submission Button Integration
- **Given** I select events and click "Submit"
- **Then** the events' `IsSubmitted` flag is set to true
- **And** the status field is updated to "Submitted" for audit clarity
- **Or** "Submitted" is tracked as a separate flag alongside the existing status

### Scenario 4: Audit Trail by User Login
- **Given** a status change occurs
- **Then** the system records which user made the change (via `AuditableEntity.LastModifiedBy`)
- **And** the change is visible in an activity log or history

---

## Status Definitions

| Status | Description |
|--------|-------------|
| Active | Event is planned and active |
| Cancelled | Event was cancelled before running |
| Pending | Awaiting approval |
| Did Not Run | Event was scheduled but did not occur |
| Declined | Event was declined by retailer |
| Retailer Approved | Retailer has approved the event |
| Completed | Event has run and concluded |
| Submitted | Event has been submitted by broker for review (new status or flag) |

---

## Design Notes

### Backend
- Reuse existing `PromotionEventStatus` enum from TradeSpend
- The live module currently **never writes status** — need to add a new handler or modify `UpdateSubmissionStatusOfEventsRequest` to also set status
- Audit trail via `AuditableEntity` base class (tracks `LastModifiedBy/On`)

### Reference
- Sandbox status update: `TradeSpendsSandboxController.UpdateEventStatusAsync` / `UpdateEventsStatusAsync`
- Submission: `UpdateSubmissionStatusOfEventsRequest` (live module, role-aware for brokers)

---

## Notes
- "Submitted" may be a new status value or a flag — confirm with business
- The `IsSubmitted` flag already exists on events; consider whether "Submitted" should be a distinct status or parallel to the existing status
- Tagged by user login: use the existing JWT identity context (`currentUser.GetUserID()`)
