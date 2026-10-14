---
type: reference
title: Consolidated client decisions and open questions
module: general
status: validated
last_verified: 2026-10-14
---

# CONSOLIDATED CLIENT DECISIONS & OPEN QUESTIONS

> **Source:** `meetings/` — 14 raw transcripts (Jul 15 – Aug 19, 2026). Raw transcripts remain the **source of truth**; this section is the extracted, provenance-tagged knowledge. Each item carries a **knowledge status** (APPROVED / VALIDATED / CLARIFIED / PROPOSED / UNKNOWN) per the BA status model.

### Validated / Approved Decisions
| # | Decision | Provenance | Status |
|---|----------|-----------|--------|
| D1 | Category Review & Distributor APL use **infinite scroll**, not pagination | Broker Dashboard meeting 2 Clarification | APPROVED |
| D2 | Broker Dashboard = **KPI cards + calendars + task board** (re-scoped from "UI polish") | Broker Dashboard meeting 2 Clarification | APPROVED |
| D3 | Simple task board (To Do / In Progress / Done), **NOT** the CRM Pipeline | Broker Dashboard meeting 2 Clarification | APPROVED |
| D4 | Market Overview status hierarchy: Pending→Approved→Commit→Active→**Discontinued**; Discontinued is **terminal** (broker cannot override); NotActive/Pending flexible | Broker Dashboard meeting 2 Clarification | VALIDATED |
| D5 | UNFI / Infra Independents = grouped mom-and-pop stores, **not real banners**; banner door count (e.g., 700) misleads KPIs | Broker Dashboard meeting 2 Clarification | VALIDATED |
| D6 | Multi-brand log entry via **sheet view** (one retailer → grid of all brands' SKUs → one submit) | Broker Dashboard meeting 2 Clarification | APPROVED |
| D7 | "Send to Contacts" = **broker-composed email** (CC/BCC), NOT auto system notifications | Broker Dashboard meeting 2 Clarification | CLARIFIED |
| D8 | Brand–Broker CR propagation: broker rows editable by brand (local unless pushed); calendar pushes propagate to broker; deletions cascade **except** brand-local rows | Broker Dashboard meeting | VALIDATED |
| D9 | Brand Report redesign: Send-to-Contacts originates from CR list page, auto-populates Brand Report; brand replies via email link; **Calendar becomes view-only** (review/reset only, no submission) | CR Brand Report & Ticket Review (Jul 30) | APPROVED |
| D10 | Notify brand = **brand owners AND sub-users** (corrects earlier owners-only guidance) | CR Brand Report & Ticket Review (Jul 30); Review Broker Questions (Aug 4) | VALIDATED |
| D11 | "Status" = broker's progress getting a meeting (not review outcome); "submitted" is a **result**, not a status | Category Review Tracker (Jul 24) | VALIDATED |
| D12 | **User-based fixed/sticky filters** saved server-side per user per brand (not browser); first 3 modules: Retailers, Promo Planning, Pipeline | User Based Fixed Filter (Aug 18) | APPROVED |
| D13 | **"Simple Entries"** section for non-calculated promos (bypass TSS stepper); upload template = banner+UPC+event+dates; old Yin-Yang bypass disabled | Broker Promo Entry (Jul 13) | APPROVED |
| D14 | Brand Report / Calendar stay in sync; remove from either removes from both; remove from calendar cascades to brand report | Daily Caboodle (Jul 16) | VALIDATED |
| D15 | "Submission due date" terminology → **"review start date"** (60-day advance-notice expectation) | Daily Caboodle (Jul 15) | VALIDATED |

### Open Questions (consolidated)
| Q | Status | Source |
|---|--------|--------|
| Exact Market Overview→CRM `SkuStatus` transition matrix | UNKNOWN — confirm w/ Bijoy | Broker Dashboard meeting |
| Store-count mechanism for UNFI Independents (store picker?) | UNKNOWN | Broker Dashboard meeting 2 Clarification |
| Is "Submitted" a new status enum value or parallel `IsSubmitted` flag? | UNKNOWN / TBD | multiple |
| PM6 scope: read-only multi-month display (A) vs full drag/resize (C)? *(Per CW: only A)* | PROPOSED (A) | PM6 ticket + CW note |
| Email backend for Send to Contacts (SMTP/SendGrid/Resend?) + template storage | UNKNOWN | CR meetings |
| Full module list for user-based fixed filters (all or subset?) | UNKNOWN — Constance to decide | User Based Fixed Filter (Aug 18) |
| MO6 sheet-view mockup — client has one, not yet obtained | UNKNOWN | Review Broker Questions (Aug 4) |
| CS-1362 (Ask Caboodle AI) & CS-1406 (dashboard switching) — no deliverables yet | UNKNOWN | general |
| Analytics (PostHog), Jira attachment-storage cleanup | PROPOSED | Caboodle Ticket Call (Aug 17) |

> Outstanding-questions snapshot and session history: `CONTEXT.md` (Outstanding Issues, This Session).
