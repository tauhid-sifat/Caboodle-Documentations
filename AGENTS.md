# Caboodle Project — Agent Router

> **Last synced with live evidence:** 2026-10-14
> Detail lives in `wiki/` (17 pages, one per former AGENTS.md section). This file is the index: read a wiki page only when its branch fires.

## Rules

- **Terminology:** brands are *assigned to* brokers; a broker *represents* brands. Never write "broker assigned to/under a brand" (`wiki/broker-brand-terminology.md`).
- **Evidence hierarchy:** `jira/tickets/` (1,780 live tickets) beats `data/Jira (3).csv` (legacy, superseded). `meetings/` transcripts are raw truth; `wiki/client-decisions-open-questions.md` is the tagged extract.
- **`specs/` are deliverables:** curated, client-reviewed subset (~40 tickets). Never treat them as the whole backlog.
- **Statuses:** Discontinued is terminal; Market Overview cannot overwrite it. "Submitted" is a parallel `IsSubmitted` flag question, still open.
- **Scope:** `Store` module is unimplemented; "ASK Cab" AI is placeholder-only. Do not spec against them as live systems.

## Read-one-table

| When the task touches… | Read |
|---|---|
| What Caboodle is, who uses it | `wiki/project-overview.md` + `wiki/business.md` |
| Frontend/backend versions, infra | `wiki/tech-stack.md` |
| Module layout, CQRS, tenancy | `wiki/architecture.md` |
| Module purposes and maturity | `wiki/module-catalog.md` |
| Roles, RBAC gaps, cross-tenant risk | `wiki/user-roles-permissions.md` |
| Promo lifecycle, ingestion, propagation, MO→CRM sync | `wiki/key-business-flows.md` |
| Broker-brand wording, endpoints, KPI labels | `wiki/broker-brand-terminology.md` |
| Broker dashboard layout, wireframe decisions | `wiki/broker-dashboard.md` |
| Category Review interactions, CS-1361 vs CS-1296, CSV format | `wiki/category-review.md` |
| PromotionEventStatus enum, submission flag, SkuStatus | `wiki/promo-management-status.md` |
| Broker Dashboard meeting decisions, early open questions | `wiki/meeting-outcomes.md` |
| Tickets missing descriptions (legacy CSV gap list) | `wiki/jira-description-gaps.md` |
| Tech debt, security risks, EOL items | `wiki/technical-debt-risks.md` |
| Spec-file inventory, wireframe links | `wiki/deliverables-index.md` |
| SKU/UPC/Banner/APL/EDLP/TPR and 15 more terms | `wiki/glossary.md` |
| Live backlog stats (1,780 tickets), priority skew | `wiki/jira-backlog-intelligence.md` + `CONTEXT.md` |
| Client decisions D1–D15, consolidated open questions | `wiki/client-decisions-open-questions.md` |

## Root docs (stay at root, linked from wiki)

- `CONTEXT.md` — session snapshot: evidence inventory, completed work, auth, open items.

## Evidence sources (read-only, never rewrite)

- `jira/tickets/` — authoritative live backlog (CS-1…CS-1777 + GTMS-*).
- `meetings/` — 16 raw transcripts (Jul 13 – Sep 3, 2026).
- `design/prototypes/Daily Delight Calendar/` — Lovable Category Review prototype.
- `design/wireframes/index.html` — live at https://caboodle-broker-dashboard.vercel.app
- `data/Jira (3).csv` — legacy; superseded by `jira/tickets/`.

## Section checklist (router resolves all 17)

§1 project-overview · §2 tech-stack · §3 architecture · §4 module-catalog · §5 user-roles-permissions · §6 key-business-flows · §7 broker-brand-terminology · §8 broker-dashboard · §9 category-review · §10 promo-management-status · §11 meeting-outcomes · §12 jira-description-gaps · §13 technical-debt-risks · §14 deliverables-index · §15 glossary · §16 jira-backlog-intelligence · §17 client-decisions-open-questions — content preserved verbatim, restructuring only.
