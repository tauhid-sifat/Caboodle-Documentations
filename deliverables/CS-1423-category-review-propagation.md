# CS-1423 — Broker Dashboard | Category Review Propagation

**Jira Summary:** "Broker Dashboard | Category Review Propagation"
**Type:** — | **Priority:** Highest | **Status:** —
**Reporter:** Constance Wolfe | **Assignee:** —
**Created:** June 20, 2026 | **Updated:** June 21, 2026

---

## Jira Description

Implement backend propagation and visibility logic for the Category Review List based on who performs the upload or addition. Ensure proper data distribution from Brokers down to Brands, while keeping Brand-specific uploads isolated — unless explicitly committed to a shared calendar.

**Core behaviors:**
- **Broker uploads (Top-Down):** Auto-propagate to all associated Brand environments
- **Brand uploads (Isolated):** Remain private to that Brand — no propagation to Broker or sister brands
- **Brand Calendar Event (Bottom-Up):** When a Brand assigns a list item to their Category Review Calendar, that specific event pushes up to the Broker Master Calendar pipeline

**UX Notes:**
- Broker view: visual indicator showing "Propagated to All Brands"
- Brand view: differentiate Broker-pushed items (read-only/editable per permissions) vs locally-added items

---

## User Stories

> **As a** Broker,
> **I want** my uploaded Category Review list to automatically propagate to all Brand environments associated with my account,
> **So that** I don't have to manually duplicate the data.

> **As a** Brand,
> **I want** my uploaded Category Review list to remain private to my environment,
> **So that** it does not clutter the Broker's dashboard or other brands' views.

> **As a** Brand,
> **I want** items I assign from my review list to my Category Review Calendar to push up to the Broker Master Category Review Calendar,
> **So that** the Broker can see scheduled reviews without seeing all my private list items.

---

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Broker upload propagates to all brands
  Given a Broker is logged into the Broker Dashboard
  When the Broker uploads a new Category Review list
  Then the list is visible to the Broker
  And the list is immediately propagated and visible in all associated Brand environments

Scenario: Brand upload stays isolated
  Given a Brand user is logged into their dashboard
  When the Brand user uploads a new Category Review list
  Then the list is only visible within that specific Brand's environment
  And the list is NOT visible on the Broker Dashboard or any other Brand dashboards

Scenario: Brand calendar item pushes up to Broker pipeline
  Given a Brand has a localized Category Review list
  When the Brand maps a list item to their Category Review Calendar
  Then that calendar entry is flagged for sync with the Broker Master Category Review Calendar pipeline

Scenario: Broker sees propagation indicator
  Given a Broker has uploaded a Category Review list
  When the Broker views the list
  Then each propagated item shows a "Propagated to All Brands" visual indicator

Scenario: Brand sees origin indicator
  Given a Brand user views their Category Review list containing both Broker-pushed and local items
  Then Broker-pushed items are visually differentiated from locally-added items
```

---

## Notes

- This ticket is **not present** in the CSV export — description obtained from Jira directly
- Linked to CS-1149 (Uploads & Data Pushes Issues) and CS-1291 (Reviews uploaded in Brand Environment pushing to all Brands)
- Domain entities: `CategoryReview` (Broker module), `CategoryReviewCalender` (join: BrandID + CategoryReviewID, with `ShouldBeInCalender` flag)
- The `CategoryReviewCalender` entity already has push/remove calendar endpoints (`PATCH Brokers/category-reviews/calender/push` and `/remove`)
- Known gap E.1: status lifecycle not implemented — verify whether propagation logic needs a status check
