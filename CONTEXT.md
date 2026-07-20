# Project Context — Caboodle BA Deliverables

**Last Updated:** Jul 20, 2026  
**Session:** Wireframe implementation & deployment

---

## Current Objective
Write user stories and requirements deliverables (Markdown files in `deliverables/`) for Caboodle's Broker Dashboard features based on:
- Jira export (`Jira (3).csv` — ~130 CS-* issues)
- Lovable prototype (`Daily Delight Calendar/`) — Category Review yearly grid, SendToContacts, infinite scroll patterns
- Two client meeting transcripts clarifying scope
- **Current focus:** Wireframe implementation in `Wireframe/index.html` and deployment to Vercel

---

## Completed Work (This Session — Jul 20, 2026)

### Wireframe Updates (Wireframe/index.html)
**Deployed at:** https://caboodle-broker-dashboard.vercel.app  
**GitHub:** https://github.com/tauhid-sifat/Caboodle-Documentations (Wireframe/ directory)

| # | Change | Description |
|---|--------|-------------|
| 1 | **Initial deploy** | Wireframe pushed to Vercel via `vercel --prod` CLI |
| 2 | **Send Email fix** | Bug: `openAssignSendEmail` used `contacts` (undefined) instead of `CONTACTS`. Fixed. Enhanced the assign compose modal to match the main compose modal (CC, BCC, formatting toolbar, send button validation, localStorage logging) |
| 3 | **Timeline filters** | Added Cat Review / Promo / Tasks toggle pills in the Timeline panel header. Clicking a pill shows/hides matching `tl-item` entries |
| 4 | **Task click → Tasks view** | Timeline task items now navigate to a full-page Tasks Kanban board (To Do / In Progress / Done) with a Dashboard back button |
| 5 | **Milestone Detail modal** | Single-click on Review/Reset badge opens a detail modal showing dates (Review Start/End, Submission Due, or Reset Date), contacts, notes, "Mark as reviewed" checkbox, Assign Contacts, and Send Email buttons |
| 6 | **Git → Vercel integration** | Connected GitHub repo to Vercel project. Created `vercel.json` config. Push to `master` auto-deploys |
| 7 | **GitHub PAT** | Stored in Windows Credential Manager for future pushes |

### Wireframe Architecture
- Static HTML/CSS/JS single page (`index.html`)
- View switcher: `dashboard`, `catreview`, `promocal`, `tasks`
- Modals: Send to Contacts, Compose Email, Assign Contacts, Assign Compose, Send Log, Add Task, Milestone Detail
- Data: Hardcoded `CONTACTS` (4), `CR_DATA` (10 rows), `PC_DATA` (7 rows)
- Persistence: `localStorage` for send log only; everything else in-memory

### Ticket Updates (deliverables/)

| File | What Changed |
|------|-------------|
| `CS-1361-new-category-review-functionality.md` | Rewritten to match wireframe: side-by-side sticky columns, Grid/List toggle, Milestone Detail modal (FR3), list view toolbar (FR7), Promo Calendar differences (FR8), Wireframe Notes table with prototype vs production gaps |
| `CS-1296-category-review-calendar-rollup.md` | Updated: list view columns, toolbar buttons (FR5) with placeholder/disabled status, Upload button as placeholder, Wireframe Implementation Status table |

---

## Previous Sessions (Jul 12, 2026 — Deliverables Creation)

### Deliverables Created (Markdown files in `deliverables/`)

**Category Review / Broker Dashboard**
- `CS-1316-category-review-infinite-scroll.md` — Replace pagination with infinite scroll (per meeting)
- `CS-1305-broker-dashboard-kpi-cards.md` — Rich KPI dashboard with cards, calendars, pipeline (re-scoped from UI polish)
- `CS-NEW-category-review-email-notification-cr2.md` — Email notification based on Lovable SendToContacts prototype

**Market Overview (MO1-MO9)**
- `CS-NEW-market-overview-edit-dc.md` (MO1) — Allow editing DC in log
- `CS-NEW-market-overview-text-search.md` (MO2) — Free-text search on list
- `CS-NEW-market-overview-crm-status-hierarchy.md` (MO3) — Confirmed hierarchy: Discontinued is terminal; flow Pending→Approved→Commit→Active; dead-ends Declined/NotActive
- `CS-NEW-market-overview-store-count-fix.md` (MO4) — Fix UNFI Independents door count (700 banner vs actual 1-2 stores)
- `CS-NEW-market-overview-multiple-stores.md` (MO5) — Multiple stores per log entry
- `CS-NEW-market-overview-multiple-brands.md` (MO6) — Sheet-based multi-brand entry
- `CS-NEW-market-overview-require-dc.md` (MO7) — Make DC required on create
- `CS-NEW-market-overview-comment-append.md` (MO8) — Comments append, don't overwrite
- `CS-NEW-market-overview-email-notifications.md` (MO9) — Push updates to brands via email with details link

**Distributor APL**
- `CS-NEW-distributor-apl-wholesale-cost-validation.md` — Wholesale Case Cost required on edit but not upload
- `CS-NEW-distributor-apl-infinite-scroll.md` — Infinite scroll replacing pagination

**Promotional Management (PM1-PM7)**
- `CS-NEW-pm1-submission-button-fix.md` — Fix broken Submit button (IsSubmitted flag)
- `CS-NEW-pm2-export-formatted-report.md` — Formatted report export (styled Excel)
- `CS-NEW-pm3-promo-status-submission.md` — Status dropdown in Submission button
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
- `CS-1361-new-category-review-functionality.md` — Yearly grid + email + send log (pre-existing — updated Jul 20)

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

## Authentication
- **Git remote:** `https://github.com/tauhid-sifat/Caboodle-Documentations.git`
- **Auth:** PAT stored in Windows Credential Manager (git credential helper: `manager`)
- **Token scope:** `repo` (full control)

---

## Reference Files (Not Modified)

- `ba-onboarding/` — All backend/frontend/module documentation
- `Daily Delight Calendar/` — Lovable prototype (SendToContacts, YearlyPlanningTable, infinite scroll CSS)
- `Jira (3).csv` — Full issue export
- `Broker Dashboard meeting.txt` / `Broker Dashboard meeting 2 Clarification.txt` — Client meeting transcripts
