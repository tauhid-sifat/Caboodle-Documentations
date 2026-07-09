# Promotional Management | Implement Promo Status Options in Submission Button

**PM3** | New Requirement | User Story | Priority: High | Status: New

---

## User Story

**As a** Broker or Brand Owner user,  
**I want** to update promo event statuses from the Promotional Management page, respecting role-based transition rules,  
**So that** I can manage the event lifecycle without switching to the Trade Spend Sandbox.

---

## Description

Currently, the broker Promotional Management view is read-only for status. The status lifecycle is only manageable in TSS. Brokers need to submit events to brands; brands need to approve, decline, or complete them.

The `IsSubmitted` flag already exists on events. When a broker submits events, this flag flips to `true`. **This story does NOT add "Submitted" as a status enum value** — the flag is sufficient. The status enum values are: `Pending`, `Approved`, `Committed`, `Active`, `Discontinued`, `Declined`.

**Important constraint:** Status transitions follow a strict hierarchy (implemented by Bejoy). Certain transitions are restricted per role and per current state. A flat dropdown that allows any status is incorrect.

**Dependency:** The existing submission button is documented as non-functional (STORY 1328). This story depends on that fix.

---

## Status Hierarchy & Transition Rules

```
Non-Active ──→ Pending ──→ Approved ──→ Committed ──→ Active ──→ Discontinued
                  │            │                            │
                  ├──→ Declined├──→ Declined                │
                  │            │                     [Terminal — no exit]
                  │            └──→ Cancelled               │
                  └──→ Cancelled                    Only Brand can set
```

### Allowed Transitions (by role)

| Current Status | Allowed Next Status | Allowed By | Notes |
|----------------|---------------------|------------|-------|
| Pending | Approved | Brand Owner | |
| Pending | Declined | Brand Owner | Terminal |
| Pending | Cancelled | Broker, Brand | |
| Approved | Committed | Brand Owner | |
| Approved | Declined | Brand Owner | Terminal |
| Committed | Active | Brand Owner | |
| Active | Discontinued | **Brand Owner only** | Terminal — broker cannot override |
| Discontinued | *(none)* | Neither | Absorbing state — no exit |
| Pending | Submitted (flag) | Broker | Flips `IsSubmitted=true`, status unchanged |

**Rejected transitions return a 422 with message:** `"Cannot transition from {current} to {requested}"`.

---

## Acceptance Criteria

### Scenario 1: Status Change via Dropdown (per-event)
- **Given** I am viewing promotional events
- **When** I open the status dropdown on an event row
- **Then** only legally allowed transitions for my role and the current status are shown
- **And** disallowed options are hidden (not greyed out — hidden to avoid confusion)
- **And** a confirmation dialog is shown before applying the change

### Scenario 2: Bulk Status Update (with per-row validation)
- **Given** I have selected multiple events
- **When** I click "Update Status" and choose a target status
- **Then** the system validates each event individually against the transition rules
- **And** if some events allow the transition and others don't:
  - Events that pass validation are updated
  - Events that fail are skipped
  - A results summary is shown: "Updated 5 of 8 events. 3 events could not transition from their current status."
- **And** no partial writes occur if the entire batch fails validation

### Scenario 3: Submission Button (sets flag, not status)
- **Given** I am a Broker user with events in Pending status
- **When** I select events and click "Submit"
- **Then** the `IsSubmitted` flag is set to `true` for each event
- **And** the `PromotionEventStatus` value remains unchanged
- **And** the brand user can see `IsSubmitted = true` to review the submission

### Scenario 4: Brand Override (Discontinued locks row)
- **Given** a Brand Owner sets an event to "Discontinued"
- **Then** the event is locked for all Broker users
- **And** the status dropdown shows only a read-only label with "Discontinued (brand-locked)"
- **And** no further status changes are allowed from the broker side

### Scenario 5: Audit Trail by User Login
- **Given** a status change occurs
- **Then** the system records which user made the change (via `AuditableEntity.LastModifiedBy`)
- **And** the change, timestamp, user, old status, and new status are persisted in an audit log (separate table or serialized metadata)
- **And** a "View History" link is available on each event

### Scenario 6: Conflict Detection
- **Given** two users attempt to change the same event's status concurrently
- **Then** the second write returns a 409 Conflict
- **And** the second user sees: "Status was already changed by [user] at [time]. Refresh and try again."

---

## Status Definitions (canonical enum)

| Status | Description | Set By | Terminal? |
|--------|-------------|--------|-----------|
| Pending | Awaiting review | System (initial) | No |
| Approved | Brand has approved | Brand Owner | No |
| Committed | Brand has committed budget | Brand Owner | No |
| Active | Event is running | Brand Owner | No |
| Discontinued | Event stopped, no further changes | **Brand Owner only** | **Yes** |
| Declined | Event rejected by brand | Brand Owner | **Yes** |
| Cancelled | Event cancelled before running | Broker, Brand | No |

Note: "Retailer Approved", "Did Not Run", and "Submitted" are not status enum values. Retailer approval is tracked via a separate field; "Did Not Run" is captured as a note; "Submitted" is the `IsSubmitted` flag.

---

## Design Notes

### Backend
- Reuse existing `PromotionEventStatus` enum from TradeSpend. **Do not add "Submitted" to it.** The `IsSubmitted` boolean flag is sufficient.
- The live module currently **never writes status** — need a new handler (`UpdatePromotionEventStatusCommand`) with transition validation
- Transition rules should be a single source of truth (a `TransitionRule[]` or state machine) — not scattered across controllers
- Audit trail: extend `AuditableEntity` to log old/new status + acting user in a dedicated `EventStatusAuditLog` table
- Conflict detection: use `ConcurrencyCheck` attribute or `rowversion` on the events table

### Reference
- Existing status enum: `PromotionEventStatus` (TradeSpend module)
- Sandbox status update: `TradeSpendsSandboxController.UpdateEventStatusAsync` / `UpdateEventsStatusAsync`
- Submission flag: `UpdateSubmissionStatusOfEventsRequest` (live module, role-aware)
- Status hierarchy implemented by Bejoy — verify current `TransitionRule[]` in the backend before implementing

### Required Enum Verification
Before development: confirm that the existing `PromotionEventStatus` enum in the backend includes:
- Pending, Approved, Committed, Active, Discontinued, Declined, Cancelled

If any are missing, add them before implementing this story.

---

## Dependencies
- **Blocked by:** STORY 1328 / CS-1367 area — submission button must be functional first
- **Related:** TSS sandbox status update handler (reuse validation logic)
- **Related:** Bejoy's existing `TransitionRule` implementation — audit and reuse
