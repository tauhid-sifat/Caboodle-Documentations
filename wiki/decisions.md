---
type: index
title: Client decisions and open questions
module: general
status: current
last_verified: 2026-10-14
---

# Client Decisions & Open Questions (Index)

> Migrated from AGENTS.md §17; raw `meetings/transcripts/` remain source of truth.
> Covers **16 sessions** (Jul 13 – Sep 3, 2026). Each decision links to its note in `meetings/notes/`.
> Statuses: APPROVED / VALIDATED / CLARIFIED / PROPOSED / UNKNOWN.

## Validated / Approved Decisions

| # | Decision | Note | Status |
|---|----------|------|--------|
| D1 | Category Review & Distributor APL use **infinite scroll**, not pagination | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | APPROVED |
| D2 | Broker Dashboard = **KPI cards + calendars + task board** (re-scoped from "UI polish") | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | APPROVED |
| D3 | Simple task board (To Do / In Progress / Done), **NOT** the CRM Pipeline | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | APPROVED |
| D4 | Market Overview status hierarchy: Pending→Approved→Commit→Active→**Discontinued**; Discontinued is **terminal** | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | VALIDATED |
| D5 | UNFI / Independents = grouped mom-and-pop stores, **not real banners**; door count misleads KPIs | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | VALIDATED |
| D6 | Multi-brand log entry via **sheet view** (one retailer → grid of all brands' SKUs → one submit) | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | APPROVED |
| D7 | "Send to Contacts" = **broker-composed email** (CC/BCC), NOT auto notifications | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) | CLARIFIED |
| D8 | Brand–Broker CR propagation: broker rows editable by brand (local unless pushed); deletions cascade **except** brand-local rows | [2026-07-22-broker-dashboard](../meetings/notes/2026-07-22-broker-dashboard.md) | VALIDATED |
| D9 | Brand Report redesign: Send-to-Contacts from CR list page; brand replies via email link; **Calendar view-only** | [2026-07-30-cr-brand-report-ticket-review](../meetings/notes/2026-07-30-cr-brand-report-ticket-review.md), [2026-08-10-ticket-call](../meetings/notes/2026-08-10-ticket-call.md) | APPROVED |
| D10 | Notify brand = **brand owners AND sub-users** | [2026-07-30-cr-brand-report-ticket-review](../meetings/notes/2026-07-30-cr-brand-report-ticket-review.md), [2026-08-19-category-review-brand-report](../meetings/notes/2026-08-19-category-review-brand-report.md) | VALIDATED |
| D11 | "Status" = broker's progress getting a meeting; **"submitted" is a result**, not a status | [2026-07-24-category-review-tracker](../meetings/notes/2026-07-24-category-review-tracker.md) | VALIDATED |
| D12 | **User-based fixed/sticky filters** server-side per user per brand; first 3 modules: Retailers, Promo Planning, Pipeline | [2026-08-18-user-based-fixed-filter](../meetings/notes/2026-08-18-user-based-fixed-filter.md), [2026-08-04-review-broker-questions](../meetings/notes/2026-08-04-review-broker-questions.md) | APPROVED |
| D13 | **"Simple Entries"** for non-calculated promos (bypass TSS stepper); template = banner+UPC+event+dates | [2026-07-13-broker-promo-entry](../meetings/notes/2026-07-13-broker-promo-entry.md) | APPROVED |
| D14 | Brand Report / Calendar stay in sync; remove from either removes from both | [2026-07-16-caboodle-daily](../meetings/notes/2026-07-16-caboodle-daily.md) | VALIDATED |
| D15 | "Submission due date" → **"review start date"** (60-day notice) | [2026-07-15-daily-caboodle](../meetings/notes/2026-07-15-daily-caboodle.md) | VALIDATED |
| D16 | **Ask Caboodle**: info-type (query builder) vs reporting-type questions; no RAG, multi-agent; answer-first UX; permission-gated | [2026-09-03-ask-caboodle](../meetings/notes/2026-09-03-ask-caboodle.md) | APPROVED |
| D17 | **Retail APL pushed live** for Jade Street demo; prod **duplicate-store dedupe run** + admin merge tool | [2026-08-24-ticket-call](../meetings/notes/2026-08-24-ticket-call.md) | APPROVED |
| D18 | Category calendar: **no compose section**, no contact/assignee info (email from list/Brand Report) | [2026-08-24-ticket-call](../meetings/notes/2026-08-24-ticket-call.md) | APPROVED |
| D19 | Notification email: remove "assigned to" row; notes **override** (no history); rejected red / submitted purple | [2026-07-27-ticket-call](../meetings/notes/2026-07-27-ticket-call.md) | APPROVED |
| D20 | **Generic corrupt-data report** for all uploads (not per-section); email resend-for-selected; retail APL export | [2026-07-20-ticket-call](../meetings/notes/2026-07-20-ticket-call.md), [2026-08-17-ticket-call](../meetings/notes/2026-08-17-ticket-call.md) | APPROVED |

## Open Questions

| Question | Status | Note |
|----------|--------|------|
| Exact MO→CRM `SkuStatus` transition matrix (confirm w/ Bijoy) | UNKNOWN | [2026-07-22-broker-dashboard](../meetings/notes/2026-07-22-broker-dashboard.md) |
| Store-count mechanism for UNFI Independents (store picker?) | UNKNOWN | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) |
| "Submitted": new status enum vs parallel `IsSubmitted` flag? | UNKNOWN / TBD | [2026-08-01-broker-dashboard-clarification](../meetings/notes/2026-08-01-broker-dashboard-clarification.md) |
| PM6 scope: read-only multi-month display (A) vs full drag/resize (C)? | PROPOSED (A) | PM6 ticket + CW note (no transcript) |
| Email backend for Send to Contacts (SMTP/SendGrid/Resend?) + template storage | UNKNOWN | [2026-08-10-ticket-call](../meetings/notes/2026-08-10-ticket-call.md), [2026-08-19-category-review-brand-report](../meetings/notes/2026-08-19-category-review-brand-report.md) |
| Full module list for fixed filters (all or subset?) — Constance to decide | UNKNOWN | [2026-08-18-user-based-fixed-filter](../meetings/notes/2026-08-18-user-based-fixed-filter.md) |
| MO6 sheet-view mockup — client has one, not yet obtained | UNKNOWN | [2026-08-04-review-broker-questions](../meetings/notes/2026-08-04-review-broker-questions.md), [2026-07-15-daily-caboodle](../meetings/notes/2026-07-15-daily-caboodle.md) |
| CS-1362 (Ask Caboodle AI) & CS-1406 (dashboard switching) — first scoping done for 1362 | PROPOSED | [2026-09-03-ask-caboodle](../meetings/notes/2026-09-03-ask-caboodle.md) |
| Analytics (PostHog), Jira attachment-storage cleanup | PROPOSED | [2026-08-17-ticket-call](../meetings/notes/2026-08-17-ticket-call.md) |
| Optimity/Bubbies table write-access check + data scope | UNKNOWN | [2026-08-19-category-review-brand-report](../meetings/notes/2026-08-19-category-review-brand-report.md) |
| Module on/off per brand — requirements email pending | PROPOSED | [2026-07-27-ticket-call](../meetings/notes/2026-07-27-ticket-call.md) |
| Zupan retailer data-mapping failure (backend?) | UNKNOWN | [2026-07-20-ticket-call](../meetings/notes/2026-07-20-ticket-call.md) |
| Distributor-data full export location (brands excluded) | UNKNOWN | [2026-09-03-ask-caboodle](../meetings/notes/2026-09-03-ask-caboodle.md) |

## All notes (16)

Jul 13 promo entry · Jul 15 daily · Jul 16 daily · Jul 20 ticket call · Jul 22 broker dashboard (date approx) · Jul 24 CR tracker · Jul 27 ticket call · Jul 30 CR brand report · Aug 1 dashboard clarification (date approx) · Aug 4 broker questions · Aug 10 ticket call · Aug 17 ticket call · Aug 18 fixed filter · Aug 19 CR brand report · Aug 24 ticket call · Sep 3 Ask Caboodle — see `meetings/notes/`.
