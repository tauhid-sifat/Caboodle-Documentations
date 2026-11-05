---
type: index
title: Client decisions and open questions
module: general
status: current
last_verified: 2026-11-04
---

# Client Decisions & Open Questions (Index)

> Migrated from AGENTS.md §17; raw `meetings/transcripts/` remain source of truth.
> Covers **33 sessions** (Jul 13 – Nov 3, 2026). Each decision links to its note in `meetings/notes/`.
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
| D16 | **Ask Caboodle**: info-type (query builder) vs reporting-type questions; no RAG (deterministic data), multi-agent per module; answer-first UX; permission-gated | [2026-09-03-ask-caboodle](../meetings/notes/2026-09-03-ask-caboodle.md) | APPROVED |
| D17 | **Retail APL pushed live** for Jade Street demo; prod **duplicate-store dedupe run** + admin merge tool | [2026-08-24-ticket-call](../meetings/notes/2026-08-24-ticket-call.md) | APPROVED |
| D18 | Category calendar: **no compose section**, no contact/assignee info (email from list/Brand Report) | [2026-08-24-ticket-call](../meetings/notes/2026-08-24-ticket-call.md) | APPROVED |
| D19 | Notification email: remove "assigned to" row; notes **override** (no history); rejected red / submitted purple | [2026-07-27-ticket-call](../meetings/notes/2026-07-27-ticket-call.md) | APPROVED |
| D20 | **Generic corrupt-data report** for all uploads (not per-section) — CLARIFIED; email resend-for-selected — APPROVED; retail APL export — APPROVED | [2026-07-20-ticket-call](../meetings/notes/2026-07-20-ticket-call.md), [2026-08-17-ticket-call](../meetings/notes/2026-08-17-ticket-call.md) | APPROVED |

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

## Sep–Nov 2026 decisions (new)

| Meeting | Key decisions |
|---|---|
| [2026-09-08-caboodle-ticket-call](../meetings/notes/2026-09-08-caboodle-ticket-call.md) | Hide the "submitted" column; move event-status editing to the promo calendar; push staging changes to production first |
| [2026-09-10-caboodle-weekend-work](../meetings/notes/2026-09-10-caboodle-weekend-work.md) | Simple promo is a two-step page; product/UPC/banner pre-filled; KEHE stays single-provider; PCC renamed "banner of NCG, do not use"; CR email from info@ |
| [2026-09-11-caboodle-roadmap-review](../meetings/notes/2026-09-11-caboodle-roadmap-review.md) | No store-level listing in retailer CRM (KPI cards instead); white space belongs in a static report; market overview time filter is must-have |
| [2026-09-14-caboodle-ticket-call](../meetings/notes/2026-09-14-caboodle-ticket-call.md) | "Remove" action instead of delete from brand approved; actualization creates a new sandbox version; Ask Caboodle runs in four phases, Phase 1 is demoable |
| [2026-09-17-quick-touch-base-before-weekend](../meetings/notes/2026-09-17-quick-touch-base-before-weekend.md) | Jira stays 8 seats; UPC leading zeros dropped; all users/brands migrated with no deletes; org/access ticket raised to highest priority |
| [2026-09-21-caboodle-ticket-call](../meetings/notes/2026-09-21-caboodle-ticket-call.md) | Simple and calculated promos share the calendar with a visual flag; "convert to calculation" button; retailer/banner propagation fix is top priority |
| [2026-09-21-organizational-hierarchy](../meetings/notes/2026-09-21-organizational-hierarchy.md) | Brands control module enablement and per-broker data visibility; multi-broker support required |
| [2026-09-24-caboodle-end-of-wk-catch-up](../meetings/notes/2026-09-24-caboodle-end-of-wk-catch-up.md) | Store identity = name + address + ZIP + lat/long; fix sync then backfill; one signup path; no unassigned role |
| [2026-09-28-caboodle-ticket-call](../meetings/notes/2026-09-28-caboodle-ticket-call.md) | "New Tab" stays; one sandbox version can be set as reporting; version cap stays at 5 |
| [2026-10-05-caboodle-ticket-call](../meetings/notes/2026-10-05-caboodle-ticket-call.md) | IAM split (Bijoy architecture, Arnab implementation); add SKU to approved simple promo is high priority; ~8 weeks to year end |
| [2026-10-06-dc-tracking-data-mapping](../meetings/notes/2026-10-06-dc-tracking-data-mapping.md) | DC Tracking built from distributor upload data with banner-then-store hierarchy; BYOK is the primary Ask Caboodle direction |
| [2026-10-12-a-it-ticket-review](../meetings/notes/2026-10-12-a-it-ticket-review.md) | Simple promo same-month date entry is a hotfix; banner SKU upload is a normal backend build; KPI cards live in their own reports |
| [2026-10-19-caboodle-ticket-call](../meetings/notes/2026-10-19-caboodle-ticket-call.md) | Category list deletion blocked while calendar references it; brand report retains all history; Ask Caboodle stays on a closed frontier model |
| [2026-10-26-caboodle-ticket-call](../meetings/notes/2026-10-26-caboodle-ticket-call.md) | Copy at both levels; version and whole-promotion deletion enabled; promo names may repeat across years; credits $1 = 100 |
| [2026-10-28-ticket-clarification](../meetings/notes/2026-10-28-ticket-clarification.md) | External upload reuses unified distributor sales table with remembered column mapping; pipeline collapses to two tickets; EDLP toggle needs a message |
| [2026-11-02-caboodle-ticket-call](../meetings/notes/2026-11-02-caboodle-ticket-call.md) | Two-month simple promo is one row (TPR counted once); colour threshold configurable per brand; notice board on broker dashboard; four dashboard/pipeline tickets remain |
| [2026-11-03-caboodle-brand-reports-kpis](../meetings/notes/2026-11-03-caboodle-brand-reports-kpis.md) | Promo notes year/search control to far left; button standardisation waits for UX designer; retail report KPI set proposed; PDF export is R&D |

## All notes (33)

Jul 13 promo entry · Jul 15 daily · Jul 16 daily · Jul 20 ticket call · Jul 22 broker dashboard (date approx) · Jul 24 CR tracker · Jul 27 ticket call · Jul 30 CR brand report · Aug 1 dashboard clarification (date approx) · Aug 4 broker questions · Aug 10 ticket call · Aug 17 ticket call · Aug 18 fixed filter · Aug 19 CR brand report · Aug 24 ticket call · Sep 3 Ask Caboodle · Sep 8 ticket call · Sep 10 weekend work · Sep 11 roadmap review · Sep 14 ticket call · Sep 17 quick touch base · Sep 21 ticket call · Sep 21 org hierarchy · Sep 24 end-of-week catch up · Sep 28 ticket call · Oct 5 ticket call · Oct 6 DC tracking · Oct 12 ticket review · Oct 19 ticket call · Oct 26 ticket call · Oct 28 ticket clarification · Nov 2 ticket call · Nov 3 brand reports & KPIs — see `meetings/notes/`.
