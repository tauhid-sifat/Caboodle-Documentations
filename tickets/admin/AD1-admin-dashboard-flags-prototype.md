# Admin | Dashboard | Prototype with Flags Alerting Upcoming Tasks, Promo Submissions, Category Review Deadlines

**AD1** | New Requirement | Prototype | Priority: TBD | Status: New

---

## User Story

**As an** Admin (and potentially Broker/Brand) user,
**I want** a dashboard prototype that uses flags to alert me of upcoming items - Tasks, Promotional Submissions, and Category Review Deadlines,
**So that** I can act on time-sensitive items before they lapse.

---

## Description

Build/prototype an **Admin Dashboard** that surfaces upcoming deadlines via visual **flags/alerts**:
- **Tasks** (from the Pipeline/Task view)
- **Promotional Submissions** (promo events due for submission)
- **Category Review Deadlines** (review start/due dates)

This mirrors the timeline concept used on the Broker Dashboard (BD1), extended as a prototype with alert flags. It is an Admin-level dashboard (distinct from the Broker Dashboard).

---

## Acceptance Criteria

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

---

## Jira Reference (data/jira-tickets)
- **CS-1281** - Auto Flag New Retailers / Auto Flag Review or Discontinued SKUs (existing flag-concept work, different domain but same 'flag' pattern).
- Context: **BD1** (Broker Dashboard timeline already groups Tasks / Promo / Category Review) - reuse the item-type model.

---

## Related
- **BD1** - Broker Dashboard shell (timeline with the same three item types).
- **CR** deadlines - Category Review deadline data feeds the flag.

---

## Notes
- Clarify whether this is Admin-only or also for Broker/Brand dashboards.
- Define flag thresholds (e.g., due in 7/14 days).
- Distinguish from the broker dashboard timeline (this is an Admin prototype).
