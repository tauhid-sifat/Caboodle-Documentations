---
type: Document
title: "Ask Caboodle Charts + Knowledge Base Plan"
---

# Ask Caboodle Charts + Knowledge Base Plan

## Summary (revised)
Chat answers gain auto charts on top of a new LLM-first architecture. A compact in-browser **knowledge base** (schema + dimension values + join keys, ~3KB) lets the OpenCode LLM plan any question into a structured spec; deterministic code executes it against the 5 CSVs and renders tables + charts; the LLM narrates. Regex router stays as offline fallback only.

## Summary
Chat answers gain auto charts: brief KPI cards, promos-by-month bars, reviews-per-month bars, distribution-status donut. Hand-rolled SVG, zero dependencies. Ranges parsed from the question (Q3, last 6 months), defaulting to the current year. Chart type and table-vs-chart placement are intent-aware via the OpenCode proxy; deterministic rules stay as the offline fallback.

## Context & findings
- Answers flow through `askShow()` → `askChatPush()` → `askChatRender()` in `Wireframe/index.html`. Chat message stores `{q, headline, meta, head, rows, html}`; tables render via `askTableHTML()` capped at 10 curated columns (`askCurate()`).
- Data sources: `ASK.promo` (8,680 rows, Start/End Date cols), `ASK.cr` (257 rows, Submission Due Date col), `ASK.mo` (5,875 rows, SKU Status col). Date parsing exists (`askParseDate()`).
- LLM path: `askMistralPolish()` POSTs `{question, headline}` to `/api/ask`; `api/ask.js` calls Zen Go Responses (`muse-spark-1.3-contributor`) and returns `{polished}`. Extend to `{polished, chart}` where chart = `{type, dimension, showTable}`.
- No ticket; POC convention is direct-to-`master` pushes with Vercel auto-deploy.

## Constraints, assumptions, risks, unknowns
- Constraints: read-only; no new dependencies; charts must render offline (deterministic fallback always works); mobile 390px must not sideways-scroll.
- Assumptions: month granularity suffices for bars; donut covers top 6 statuses + Other; LLM chart override arrives async like polish (renders on arrival, never blocks the answer).
- Risks: LLM returns unknown chart type -> whitelist + fallback to deterministic spec; proxy down -> deterministic spec stands; donut with 100+ banners -> cap slices.
- Unknowns: exact range phrases clients use (seed: Q1-Q4, H1/H2, last/next N months, this year, YYYY).

## Workspace setup
- Base `master` (repo has no `develop`); no branch, no worktree, consistent with all POC work so far.

## Phase 1 - SVG charts + deterministic specs + ranges
- Scope: `Wireframe/index.html` only. `askRangeParse(q)` (quarter/half/last-N-months/year -> {start,end,label}); `askSVGBar(labels,values)`, `askSVGDonut(labels,values)`, `askKPICards(metrics)` returning SVG/HTML strings; per-answer spec builders (`askSpecRunning`, `askSpecReviews`, `askSpecDistro`, `askSpecBrief`); render spec above the curated table inside the chat bubble; range label in meta.
- Steps: 1) range parser with seed-phrase checks, 2) three SVG builders, 3) four spec builders wired into existing answer functions, 4) chat render + mobile check.
- Acceptance criteria:
  - [ ] `What promos are running this month?` shows a 12-bar chart of active promos by month for the current year above its table.
  - [ ] `What reviews are due in the next 60 days?` shows reviews-per-month bars for its range.
  - [ ] `Distribution status for Bubbies at Sprouts?` shows a status donut with at most 7 slices.
  - [ ] Morning brief shows 3 KPI cards (reviews due, active promos, pending distribution) with zero tables.
  - [ ] `promos in Q3 2026` charts Jul-Sep only - range parsing proven.
  - [ ] At 390px viewport, chat bubble shows no page-level horizontal scroll (`document.body.scrollWidth <= 390 + 1`).

## Phase 2 - Knowledge base + LLM planning + generic executor (replaces regex router)
- Scope: `Wireframe/index.html` (`askBuildKB()`, `askPlanViaLLM()`, `askExecPlan()`, `askRun()` reorder) + `api/ask.js` (`mode:'plan'` returning `{plan:{intent,dataset,filters,groupBy,metric,chart,showTable,title,reply}}`).
- KB contents per dataset: columns + types, top dimension values (brands/retailers/banners/regions/statuses, capped 50), date min/max, row counts, join keys (UPC across promo/APL/item-status; names across MO/item/promo).
- Steps: 1) KB builder on load (+ lazy item-status note), 2) proxy plan-mode with JSON-only prompt + validation, 3) generic filter/group/count executor with column validation, 4) askRun: local small-talk first, LLM plan second, regex fallback last.
- Acceptance criteria:
  - [ ] `Which GLM promos run in Q3?` (never rule-written) returns correct filtered rows via plan.
  - [ ] Plan with unknown dataset/column falls back to regex router, never errors.
  - [ ] With `/api/ask` unreachable, all 8 demo questions still answer via fallback.
  - [ ] Single LLM call per question (plan includes one-line `reply`); numbers always from code execution.

## Cross-Validation Phase (final)
- All 8 demo questions + `hello` + `how is your mom?` on the Vercel URL: correct chart per answer, tables intact, export full data, library re-run re-renders charts, mobile 390px clean, zero console errors. Single overall review. No secrets committed.

## Out of scope
Spend/revenue charts (needs allowance math validation), line charts over time, pie-to-table drill-down clicks, saved-chart pinning to dashboard, Chart.js or any dependency, backend Intelligence changes.

## Rollback note
Single-file feature: `git revert` the chart commit(s) on `master` and push; Vercel redeploys without charts. Library/export/cache untouched.
