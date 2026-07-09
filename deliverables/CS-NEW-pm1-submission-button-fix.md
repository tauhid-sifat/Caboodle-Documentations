# Promotional Management | Fix Submission Button

**PM1** | Bug | Priority: High | Status: New

---

## User Story

**As a** Broker user,  
**I want** the Submission button in Promotional Management to actually submit events,  
**So that** my promo event submissions are reflected in the system.

---

## Description

The Submission button in the broker Promotional Management view does not work. When clicked, it either does nothing, throws an error, or the submission state is not persisted.

The backend endpoint `UpdateSubmissionStatusOfEventsRequest` exists and sets the `IsSubmitted` flag on events matching selected filters (month, retailer, distributor, banner, category, year). When called by a BROKER/BROKERSUBUSER, results are scoped to the broker's assigned brands. This endpoint has a known defect — the distributor filter references a table alias that is never joined, so passing `DistributorIDs` produces failing SQL.

---

## Acceptance Criteria

### Scenario 1: Submission Button Triggers API Call
- **Given** I am on the Promotional Management page
- **When** I select events and click "Submit"
- **Then** a valid API call is made to the submission endpoint
- **And** the selected events have `IsSubmitted` set to true

### Scenario 2: Feedback to User
- **Given** I have submitted events
- **When** the API responds
- **Then** I see a success/failure message
- **And** submitted events are visually marked (e.g., checkmark, badge, or different row color)

### Scenario 3: Unsubmit
- **Given** events are already submitted
- **When** I click "Unsubmit"
- **Then** `IsSubmitted` is set to false for those events

---

## Known Issues to Fix

1. **Distributor filter SQL defect** — `DistributorIDs` filter references an unjoined table alias (`UpdateSubmissionStatusOfEventsRequest.cs:183`). Either fix the join or exclude `distributor` from the submission filter options.

2. **Frontend wiring** — confirm the button calls `POST Brokers/update-submission-status` (or the correct endpoint) with the right payload.

---

## Reference
- **Endpoint:** `UpdateSubmissionStatusOfEventsRequest` (TradeSpend module)
- **Handler:** `UpdateSubmissionStatusOfEventsRequest.cs`
- **Permission:** `BrokerPromotionalManagement.View`
