# Project Context — Caboodle BA Deliverables

**Last Updated:** Jul 12, 2026  
**Session:** Broker Dashboard / Category Review / Market Overview / Promotional Management deliverables

---

## Current Objective
Write user stories and requirements deliverables (Markdown files in `deliverables/`) for Caboodle's Broker Dashboard features based on:
- Jira export (`Jira (3).csv` — ~130 CS-* issues)
- Lovable prototype (`Daily Delight Calendar/`) — Category Review yearly grid, SendToContacts, infinite scroll patterns
- Two client meeting transcripts clarifying scope

---

## Completed Work (This Session)

### Deliverables Created (Markdown files in `deliverables/`)

**Category Review / Broker Dashboard**
- `CS-1316-category-review-infinite-scroll.md` — Replace pagination with infinite scroll (per meeting)
- `CS-1305-broker-dashboard-kpi-cards.md` — Rich KPI dashboard with cards, calendars, pipeline (re-scoped from UI polish)
- `CS-NEW-category-review-email-notification-cr2.md` — Email notification based on Lovable SendToContacts prototype

**Market Overview (MO1-MO9)**
- `CS-NEW-market-overview-edit-dc.md` (MO1) — Allow editing DC in log
- `CS-NEW-market-overview-text-search.md` (MO2) — Free-text search on list
- `CS-NEW-market-overview-crm-status-hierarchy.md` (MO3) — **Updated** with confirmed hierarchy: Discontinued is terminal; flow Pending→Approved→Commit→Active; dead-ends Declined/NotActive
- `CS-NEW-market-overview-store-count-fix.md` (MO4) — **New** — Fix UNFI Independents door count (700 banner vs actual 1-2 stores)
- `CS-NEW-market-overview-multiple-stores.md` (MO5) — Multiple stores per log entry
- `CS-NEW-market-overview-multiple-brands.md` (MO6) — **Updated** — Sheet-based multi-brand entry (client mockup: select retailer → grid of all brands/SKUs → click-click → one submit)
- `CS-NEW-market-overview-require-dc.md` (MO7) — Make DC required on create
- `CS-NEW-market-overview-comment-append.md` (MO8) — Comments append, don't overwrite
- `CS-NEW-market-overview-email-notifications.md` (MO9) — Push updates to brands via email with details link

**Distributor APL**
- `CS-NEW-distributor-apl-wholesale-cost-validation.md` — Wholesale Case Cost required on edit but not upload
- `CS-NEW-distributor-apl-infinite-scroll.md` — Infinite scroll replacing pagination

**Promotional Management (PM1-PM7)**
- `CS-NEW-pm1-submission-button-fix.md` — Fix broken Submit button (IsSubmitted flag)
- `CS-NEW-pm2-export-formatted-report.md` — Formatted report export (styled Excel)
- `CS-NEW-pm3-promo-status-submission.md` — Status dropdown in Submission button (Active/Cancelled/Pending/Did Not Run/Declined/Retailer Approved/Completed/Submitted)
- `CS-NEW-pm4-pin-filter-options.md` — Pin/freeze filters (persist year selection)
- `CS-NEW-pm5-uniform-grid-format.md` — Equal month column widths
- `CS-NEW-pm6-event-move-across-months.md` — Multi-month events span columns + drag/resize
- `CS-NEW-pm7-broker-dashboard-logo-button.md` — Broker logo on dashboard nav button

**Broker Dashboard / Pipeline**
- `CS-NEW-broker-dashboard-task-board.md` — Simple Kanban (To Do / In Progress / Done) as tile
- `CS-NEW-broker-dashboard-pipeline.md` — **Superseded** — merged into CS-1305 dashboard scope

**Other**
- `CS-NEW-bulk-delete-category-reviews.md` — Bulk delete across pages
- `CS-NEW-category-review-page-size.md` — Page size selector (10/25/50/100)
- `CS-1072-broker-dashboard-landing-page.md` — Broker logo/branding on landing page (pre-existing)
- `CS-1424-data-sync-broker-distributor-apl.md` — Automated APL data sync (pre-existing)
- `CS-1403-apl-upload-unfi-upc-adjustment.md` — UNFI UPC truncation fix (pre-existing)
- `CS-1361-new-category-review-functionality.md` — Yearly grid + email + send log (pre-existing)

---

## Architecture Decisions

1. **Category Review uses infinite scroll** (CS-1316) — matches Distributor APL pattern, not pagination
2. **Market Overview status hierarchy** — Discontinued is terminal; Market Overview cannot override it
3. **UNFI Independents** — Door count is banner-level (700); actual stores need per-store tracking for accurate KPIs
4. **Multi-brand log entry** — Sheet view (not modal): retailer picker at top → grid of all brands' SKUs below
5. **SendToContacts pattern** — Reuse Lovable component structure (Popover contacts → Dialog compose → localStorage log → toast) with real email API
6. **Broker Dashboard** — KPI cards + calendar summaries + task board + branded header + tile navigation

---

## Outstanding Issues / Open Questions

| Item | Question |
|------|----------|
| MO3 | Confirm exact status transition matrix with Bijoy (Pending→Approved→Commit→Active→Discontinued; dead-ends Declined/NotActive) |
| MO4 | How to track actual store count for UNFI Independents? Add store picker? |
| MO6 | Client has mockup for sheet view — need to obtain it |
| CR2 | Email backend: SMTP/SendGrid/Resend? Template storage? |
| PM3 | Is "Submitted" a new status enum value or parallel IsSubmitted flag? |
| PM6 | Start with read-only multi-month display (Option A) or full drag/resize (Option C)? |
| CS-1305 | KPI card definitions — store count (fixed per MO4), reviews due, promos active, brands assigned — confirm formulas |
| General | CS-1362 (Ask Caboodle AI) and CS-1406 (dashboard switching) have no deliverables yet |

---

## Files Changed This Session

**Created (21 new deliverables):**
```
deliverables/CS-1316-category-review-infinite-scroll.md
deliverables/CS-1305-broker-dashboard-kpi-cards.md
deliverables/CS-NEW-category-review-email-notification-cr2.md
deliverables/CS-NEW-market-overview-edit-dc.md
deliverables/CS-NEW-market-overview-text-search.md
deliverables/CS-NEW-market-overview-crm-status-hierarchy.md
deliverables/CS-NEW-market-overview-store-count-fix.md
deliverables/CS-NEW-market-overview-multiple-stores.md
deliverables/CS-NEW-market-overview-multiple-brands.md
deliverables/CS-NEW-market-overview-require-dc.md
deliverables/CS-NEW-market-overview-comment-append.md
deliverables/CS-NEW-market-overview-email-notifications.md
deliverables/CS-NEW-distributor-apl-wholesale-cost-validation.md
deliverables/CS-NEW-distributor-apl-infinite-scroll.md
deliverables/CS-NEW-pm1-submission-button-fix.md
deliverables/CS-NEW-pm2-export-formatted-report.md
deliverables/CS-NEW-pm3-promo-status-submission.md
deliverables/CS-NEW-pm4-pin-filter-options.md
deliverables/CS-NEW-pm5-uniform-grid-format.md
deliverables/CS-NEW-pm6-event-move-across-months.md
deliverables/CS-NEW-pm7-broker-dashboard-logo-button.md
deliverables/CS-NEW-broker-dashboard-task-board.md
deliverables/CS-NEW-broker-dashboard-pipeline.md
deliverables/CS-NEW-bulk-delete-category-reviews.md
deliverables/CS-NEW-category-review-page-size.md
```

---

## Next Steps

1. **Obtain client mockup** for MO6 multi-brand sheet view
2. **Confirm MO3 status matrix** with Bijoy / engineering
3. **Define PM6 scope** (Option A/B/C) with client
4. **Create CS-1362** (Ask Caboodle on broker dashboard) and **CS-1406** (dashboard switching bug) if needed
5. **Review all PM1-PM7** with client for prioritization
6. **Consolidate CS-1305 + CS-1072 + task board** into unified dashboard spec

---

## Reference Files (Not Modified)

- `ba-onboarding/` — All backend/frontend/module documentation
- `Daily Delight Calendar/` — Lovable prototype (SendToContacts, YearlyPlanningTable, infinite scroll CSS)
- `Jira (3).csv` — Full issue export
- `Broker Dashboard meeting.txt` / `Broker Dashboard meeting 2 Clarification.txt` — Client meeting transcripts