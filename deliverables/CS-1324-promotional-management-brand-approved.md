# CS-1324 — Broker Dashboard | Promotional Management Only push Brand Approved Promotions to Promo Management

**Jira Summary:** "Broker Dashboard | Promotional Management Only push Brand Approved Promotions to Promo Management"
**Type:** Task | **Priority:** High | **Status:** Backlog
**Reporter:** Bijoy Chandra Nath | **Assignee:** —
**Created:** April 3, 2026 | **Updated:** June 28, 2026

---

## Jira Description

(CSV export contains no description for this ticket.)

---

## System Context (from code review)

**What exists today:**

- **Promotional Management** is a read-only view in the Broker Dashboard that surfaces promotional events for a broker's assigned brands. It sources data from the live **TradeSpend (BAP)** module. Endpoints require the `View Broker Promotional Management` permission. *(Source: `BrokersController.cs`, `GetPromotionalManagementEventsRequest`)*

- **BAP = Brand Approved Planning** — the live/committed trade spend environment. Promotions reach BAP by being pushed from the **Sandbox** via `PushPromotionToTradeSpendRequest`. *(Source: `03-glossary.md`)*

- **Sandbox promotions** have per-event status management (`UpdateEventsStatusRequest` supports: `RetailerApproved`, `Completed`, `Declined`, `DidnotRun`). Default status is `Active`. *(Source: `06-end-to-end-workflows.md`, `PushPromotionToTradeSpendRequest`)*

- **Live (BAP) promotions** have a `PromotionEventStatus` field that is **never set by any live TradeSpend handler** — the approval lifecycle is not implemented on the live side. *(Source: `07-known-gaps-and-risks.md`, `01-backend-modules.md` — TradeSpend section)*

- **No promotion-level approval status exists.** Governance in sandbox is per-event only. `IsSubmitted` is a boolean submission flag on events, not an approval indicator. *(Source: `03-glossary.md`, `07-known-gaps-and-risks.md`)*

**What this means for CS-1324:**

The ticket asks that only "Brand Approved" promotions appear in Promo Management. Since:
- No brand-level approval mechanism exists for promotions
- Live event status is never set
- The only approval-like statuses exist in the sandbox (`RetailerApproved`, etc.)

This ticket requires building the concept of "Brand Approved" for promotions and gating Promotional Management visibility on it.

---

## User Story

> **As a** Broker viewing Promotional Management
> **I want** only promotions that are Brand Approved to appear in the Promotional Management view
> **So that** I see finalized, committed promotions from BAP rather than unapproved or in-progress entries

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Promotion pushed from sandbox with approved events appears in Promo Management
  Given a sandbox promotion has events with status "RetailerApproved"
  When the promotion is pushed to BAP (live TradeSpend)
  Then the promotion appears in the Broker Promotional Management view

Scenario: Live promotion without approval indicator is excluded
  Given a live (BAP) promotion exists without any brand approval indicator
  When the Broker views Promotional Management
  Then that promotion is not visible

Scenario: Approval indicator persists across re-push
  Given a sandbox promotion was previously pushed to BAP and approved
  When the sandbox promotion is pushed again (replacing live events)
  Then the approval indicator is preserved on the re-pushed promotion

Scenario: Broker sees only their assigned brands' approved promos
  Given a Broker is assigned to Brand A and Brand B
  When the Broker views Promotional Management
  Then only Brand A and Brand B's approved promotions are shown
  And no cross-brand data appears
```

---

## Notes

- **Linked to CS-1328** (Improve Broker Promotional Management Export and Approval Flow — epic)
- **Linked to CS-1289** (Export Button Doesn't export & label is confusing)
- **Requires architectural decision:** define what "Brand Approved" means at the data level — new flag on `TradeSpendPromo`? New `PromotionEventStatus` value? Gate on sandbox linkage (`SandboxPromotionID != null`)? Gate on event status after push?
- **Known gap:** live TradeSpend never sets `PromotionEventStatus` — this may need to be implemented as a prerequisite or as part of this ticket
- Default promotion event status in sandbox is `Active`; `RetailerApproved`, `Completed`, `Declined`, `DidnotRun` are available via `UpdateEventsStatusRequest`
- Promotional Management endpoints: `GET Brokers/promotional-management-events`, `GET Brokers/events-with-same-name`, `GET Brokers/promotional-management-filters`, export endpoints
