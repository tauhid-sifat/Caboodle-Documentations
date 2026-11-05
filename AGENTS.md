# Caboodle Project — Agent Router

> **Last synced with live evidence:** 2026-10-29
> Detail lives in `wiki/` (17 pages, one per former AGENTS.md section). Code-verified module/feature inventory: `docs/feature-context.md` (source of truth for modules 2.1-2.15, paths, APIs, data models, gotchas). This file is the index: read a wiki page only when its branch fires.

## Rules

- **Terminology:** brands are *assigned to* brokers; a broker *represents* brands. Never write "broker assigned to/under a brand" (`wiki/broker-brand-terminology.md`).
- **Evidence hierarchy:** `jira/tickets/` (1,784 live tickets) beats `data/Jira (3).csv` (legacy, superseded). `meetings/` transcripts are raw truth; `wiki/client-decisions-open-questions.md` is the tagged extract.
- **`specs/` are deliverables:** curated, client-reviewed subset (~40 tickets). Never treat them as the whole backlog.
- **Statuses:** Discontinued is terminal; Market Overview cannot overwrite it. "Submitted" is a parallel `IsSubmitted` flag question, still open.
- **Scope:** `Store` module is unimplemented (code-verified in `docs/feature-context.md` §2.4.8, 2.14.9). "ASK Cab" / Intelligence module status is contradicted by code: `docs/feature-context.md` §2.12 documents it as Active (LLM-planned SQL chat over brand data), while older notes treat it as placeholder. Recorded as open question OQ-FC-1; do not assume either way without confirmation.

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
| Ask Caboodle scope, constraints (no RAG, multi-agent), client version | `wiki/ask-caboodle-scope.md` + `wiki/ask-caboodle-scope-client.md` + `wiki/ask-caboodle-presentation.md` |
| SKU/UPC/Banner/APL/EDLP/TPR and 15 more terms | `wiki/glossary.md` |
| Live backlog stats (1,784 tickets), priority skew | `wiki/jira-backlog-intelligence.md` + `CONTEXT.md` |
| Client decisions D1–D15, consolidated open questions | `wiki/client-decisions-open-questions.md` |
| IAM coverage: which tickets IAM closes, which stay open | `wiki/iam-impact-report.md` |
| Code-verified module/feature inventory (paths, APIs, data models, rules, gotchas) | `wiki/modules/` (2.1-2.15) + `wiki/modules/cross-cutting.md` + `wiki/modules/dependencies-and-recipes.md` + `wiki/traceability-matrix.md` |

## Root docs (stay at root, linked from wiki)

- `CONTEXT.md` — session snapshot: evidence inventory, completed work, auth, open items.

## Evidence sources (read-only, never rewrite)

- `jira/tickets/` — authoritative live backlog (CS-1…CS-1781 + GTMS-*).
- `meetings/` - 26 transcripts + 7 meeting-notes files (Jul 13 - Nov 3, 2026).
- `design/prototypes/Daily Delight Calendar/` — Lovable Category Review prototype.
- `design/wireframes/index.html` — live at https://caboodle-broker-dashboard.vercel.app
- `data/Jira (3).csv` — legacy; superseded by `jira/tickets/`.
- `docs/feature-context.md` — code-verified module/feature inventory (source of truth for modules 2.1-2.15, paths, APIs, data models, flows, gotchas).
- `wiki/modules/` — self-sufficient code-verified module references for all 15 modules (2.1-2.15) plus cross-cutting (§3), dependencies (§4), recipes (§5) and `traceability-matrix.md` (source→KB mapping). Complete.

## Section checklist (router resolves all 17)

§1 project-overview · §2 tech-stack · §3 architecture · §4 module-catalog · §5 user-roles-permissions · §6 key-business-flows · §7 broker-brand-terminology · §8 broker-dashboard · §9 category-review · §10 promo-management-status · §11 meeting-outcomes · §12 jira-description-gaps · §13 technical-debt-risks · §14 deliverables-index · §15 glossary · §16 jira-backlog-intelligence · §17 client-decisions-open-questions — content preserved verbatim, restructuring only.
