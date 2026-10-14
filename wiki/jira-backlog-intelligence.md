---
type: reference
title: Jira backlog intelligence (live export, 1784 tickets)
module: general
status: current
last_verified: 2026-10-14
---

# JIRA BACKLOG INTELLIGENCE (Live Export — 1,784 tickets)

> **Source:** `jira/tickets/` — full live Jira export (CS-1 … CS-1781 + GTMS-*), generated **2026-10-14** from `caboodleservices.atlassian.net`. This supersedes the legacy `data/Jira (3).csv` (130 issues).  
> **Method:** structured metadata + statistics extracted programmatically across all 1,784 files (AI-readable conversion per BA Step 1); individual tickets were not read raw.  
> **Status model:** CS project, Open = Backlog / On Hold / In Progress / In Staging / In Production / In Review / Reopened / Demo / Ready for Production / Dev Sprints; Closed = Closed / Won't Do. Team migrated to a new Jira workflow on ~2026-10-14: **In Review** appeared (32 tickets, ex-Resolved — Resolved is retired). GTMS uses a separate status scheme (Critical Issues, In Proress Enhanced Features [sic], Strategic Partnerships, Prospects) — counted as Ambiguous below.

- **Total tickets:** 1,784 (1,766 CS + 18 GTMS)
- **Created range:** 2023-09-11 → 2026-10-14 (backlog spans ~3 years; actively maintained through today)
- **Open:** 491 (Backlog 309 + active states, incl. new In Review 32) · **Closed / Won't-Do:** 1,286 · **Ambiguous status:** 7 (all GTMS-scheme, see model)
- **By type:** Task 778 · Bug 506 · Sub-task 371 · Story 119 · Epic 10
- **By priority:** High 685 · Highest 479 · Medium 358 · Low 262 (≈65% High/Highest — backlog skews urgent)
- **Top labels:** Front_end 258 · Backend 230 · Admin_App 42
- **Status distribution (top):** Closed 1,204 · Backlog 309 · Won't Do 82 · On Hold 40 · In Production 37 · In Review 32 · In Staging 26 · Reopened 20 · Ready for Production 8 · In Progress 8 · Demo 8
- **Module concentration (title/label keyword heuristic — directional, not exact):** Admin-dominant, then Brand, TradeSpend, CRM, Market Overview, Category Review, Broker Dashboard, Distributor APL.

**Implications for BA:**
1. The backlog is **bug/task-heavy and priority-skewed** — the active client-facing workstreams are Broker Dashboard, Category Review, Market Overview, and Promo Management (see `client-decisions-open-questions.md`).
2. The curated `specs/` deliverables are a small, **client-reviewed subset (≈40 active tickets, many now posted as CS-1602..1781)** of this 1,784-ticket universe — the prioritized, spec'd slice, not the whole backlog.
3. Admin is the **largest maintenance surface** (label `Admin_App` 42; admin keyword dominant in open backlog).

> How this export was produced and prior sync history: `CONTEXT.md` (Evidence Inventory, This Session).
