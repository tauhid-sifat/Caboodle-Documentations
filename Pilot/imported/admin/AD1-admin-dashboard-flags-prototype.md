---
type: Document
module: admin
jira: [CS-1591]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Broker | Dashboard | Prototype with Flags Alerting Upcoming Tasks, Promo Submissions, Category Review Deadlines

**CS-1591** | New Requirement | Prototype | Priority: TBD | Status: New | https://caboodleservices.atlassian.net/browse/CS-1591

> **Synced 2026-09-07 12:48 UTC from live Jira:** Summary changed **Admin → Broker** per your update. Live Jira `summary` is now *"Broker | Dashboard | Prototype …"*. This file synced to match live `jira/tickets/CS-1591.md`. Previous local clarification retained below.
> **Original scope clarification (Constance):** *"This is more for Broker & Brands Admin would be secondary"* — now reflected in live Jira summary.

---

## User Story (live Jira)

**As an** Broker user,
**I want** a dashboard prototype that uses flags to alert me of upcoming items - Tasks, Promotional Submissions, and Category Review Deadlines,
**So that** I can act on time-sensitive items before they lapse.

> **Local refinement (retained from 2026-09-07 directory edit):** Treat as **Broker & Brand primary, Admin secondary** — live Jira now says "Broker" (singular), but Constance's note included Brand as well. Consider updating Jira User Story to `Broker / Brand user (Admin secondary)` to capture full audience.

---

## Description (live Jira)

Build/prototype an Admin Dashboard that surfaces upcoming deadlines via visual flags/alerts:
- **Tasks** (from the Pipeline/Task view)
- **Promotional Submissions** (promo events due for submission)
- **Category Review Deadlines** (review start/due dates)

This mirrors the timeline concept used on the Broker Dashboard (BD1), extended as a prototype with alert flags. It is an Admin-level dashboard (distinct from the Broker Dashboard).

> **Local note:** Description still says "Admin Dashboard / Admin-level" in live Jira — inconsistent with the new **Broker** summary/Story. Recommended follow-up: update live Description to *"Broker (& Brand) Dashboard"* and change AC1 from *"When the Admin dashboard renders"* → *"When the Broker/Brand dashboard renders (Admin secondary)"* — we had staged this as AC4 `Audience Priority` locally; now waiting on your live edit.

---

## Acceptance Criteria (live Jira)

### Scenario 1: Flagged Upcoming Items
- **Given** there are upcoming Tasks, Promo Submissions, or Category Review Deadlines
- **When** the Admin dashboard renders
- **Then** each is shown with a flag/alert indicating it is approaching
- **And** items are distinguishable by type (Task / Promo Submission / Category Review)

### Scenario 2: Prototype Fidelity
- **Given** the prototype
- **When** reviewed
- **Then** it demonstrates the flag/alert behavior and the three item categories
- **And** it can be validated with stakeholders before build

### Scenario 3: Link Through
- **Given** a flagged item
- **When** the user clicks it
- **Then** they navigate to the relevant source (Pipeline, Promo Management, Category Review)

> **Staged local addition (not yet in live Jira):** **Scenario 4: Audience Priority** — flag component is designed/validated for **Broker & Brand first, Admin second — not Admin-only**. Push to Jira when you update Description/AC1.

---

## Jira Reference (data/jira-tickets)
- **CS-1281** - Auto Flag New Retailers / Auto Flag Review or Discontinued SKUs (existing flag-concept work, different domain but same 'flag' pattern).
- Context: **CS-1598** (Broker Dashboard timeline already groups Tasks / Promo / Category Review) - reuse the item-type model.
- **Live sync:** `jira/tickets/CS-1591.md` now exactly mirrors live Jira as of 2026-09-07T12:48:15.717+0600.

---

## Related
- **CS-1598** - Broker Dashboard shell (timeline with the same three item types).
- **CR** deadlines - Category Review deadline data feeds the flag.

---

## Notes
- **2026-09-07 12:48 UTC — Synced from live Jira via `scripts/.env` (JIRA_API_TOKEN).** Summary `Admin → Broker` confirmed. Directory file updated to match live; retained refinement notes as callouts for next live edit.
- **Resolved earlier:** Audience is **Broker & Brand primary, Admin secondary** (per Constance). Live Jira partially reflects this (Story = Broker); Description/AC still says Admin — needs one more live edit to be fully consistent.
- Define flag thresholds (e.g., due in 7/14 days).
- Reuses the Broker Dashboard timeline pattern (BD1) — not a separate Admin-only pattern.
- **Location note:** File remains at `tickets/admin/AD1-admin-dashboard-flags-prototype.md` for history; effectively a **Broker Dashboard** ticket now — consider moving to `tickets/broker-dashboard/` on next housekeeping.
