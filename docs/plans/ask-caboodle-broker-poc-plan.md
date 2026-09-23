# Ask Caboodle Broker POC Plan

## Summary
Broker-side demo POC that shows look, feel, and working behavior of Ask Caboodle on Vercel. Extends `Wireframe/index.html` with a global Ask bar, deterministic answers computed in-browser from the 5 exported Broker CSVs, then a Vercel `/api/ask` Mistral proxy for natural-language polish. Read-only, demo-safe, no Jira tracking. Goal is a client-usable Vercel URL where the demo questions answer from real dummy data with source links.

## Context & findings
- `Wireframe/index.html:1-3057` (219KB single file): header `426-427`, router `showView():1562-1570`, views `dashboard:444, catreview:486, promocal:595, tasks:629`, modals `.modal-overlay/.show:349-350`, localStorage `caboodleSendLog:1756-1757`. Ask bar inserts after `</header>`, answer panel clones `#milestoneDetailModal:804`, library adds `view-ask` + 1-line router case.
- `vercel.json:1-5` root + `Wireframe/vercel.json:1-9`: static today (`framework:null`), no `api/` dir. Adding `Wireframe/api/ask.js` creates a serverless proxy; browser calls same-origin `/api/ask`, key stays in `MISTRAL_API_KEY` env.
- Data (`Ask Caboodle Data/Broker/`): Item Status 136,888 rows / 16.6MB / 7 cols (`Brand Name,Retailer Name,Banner Name,Product Name,UPC Number,Category Name,Status`); Market Overview 5,875 / 1.2MB / 15 cols; Promos 8,680 / 2.5MB / 35 cols; APL 391; Category Review 257. Quoted CRLF inside Comment/Notes means no naive `split('\n')`; use PapaParse `worker:true, chunk`.
- Reuse: Phase 1 contract from `Ask Caboodle Feature Scope.md:29,279-284` (short answer + as-of + source link + save query not results + CSV export + explicit can't-answer); seed reconciliation from `docs/Ask Example.md:1-7`.
- Backend Intelligence (`ba-onboarding/frontend/modules/intelligence.md`) not called by POC; POC mirrors its QueryPlan-to-deterministic-query shape client-side.

## Demo question set (derived from real columns)
1. What promos are running this month? (Promos Start/End Date + Event Status)
2. Which promos are Active but Discontinued at SKU level? (Promos SKU Status vs Event Status)
3. Which items are Active on distributor side but NotActive/Pending in Brand Retail Item Status? (flagship reconciliation)
4. Which stores have stopped ordering / new vs dropped? (MO Date + SKU Status, Item Status Status)
5. What reviews are due in next 60 days? (Category Review Review Month + Submission Due Date)
6. Distribution status for SKU X by retailer/banner? (MO SKU Status)
7. Wholesale case/unit cost for UPC X at DC Y? (APL DC + UPC + costs)
8. What needs my attention today? (morning brief: due reviews + running promos + pending MO)

## Constraints, assumptions, risks, unknowns
- Constraints: read-only POC; no backend DB; Vercel Hobby limits (10s function timeout, 4.5MB payload); no key in client JS; 100-row table cap / 1000 max.
- Assumptions: CSV headers stable as sampled; brand names shown as-is; Mistral key stays valid; modern browser (Worker + IndexedDB).
- Risks: 16.6MB CSV OOM on mobile -> worker + IndexedDB + pre-aggregates + cap; key leak -> proxy-only + env + rate limit; answer trust (calc defects, duplicate stores) -> as-of + source refs + can't-answer path.
- Unknowns: exact Mistral model name; Vercel plan (Hobby vs Pro); personal vs shared library (POC: personal localStorage).

## Workspace setup
- Base branch: `develop` (repo has only `master`, so branched off `master`). Plain branch in working directory (no worktree): `poc/ask-caboodle-broker`. No commits to `develop`/`main`.
- Implementation stayed purely additive: ~370 insertions, 0 deletions in `Wireframe/index.html`, plus new `Wireframe/api/ask.js` and `Wireframe/data/broker/` (5 CSVs).

## Phase 1 - Ask shell + deterministic data layer
- Scope: `Wireframe/index.html` (Ask bar after header, `#askPanel` answer + table, `#view-ask` library view, `showView` case); PapaParse via CDN; `Ask Caboodle Data/Broker/*.csv` staged under `Wireframe/data/broker/`; worker-chunked parse + IndexedDB + pre-aggregates for 136k file.
- Steps: 1) Add Ask bar + panel + library view + router case. 2) Wire CSV loading with progress + error path. 3) Implement 8 deterministic answer functions + as-of + source row refs. 4) 100-row cap + paging + can't-answer fallback. Skill: none required beyond static JS.
- Acceptance criteria:
  - [ ] Q1 with November 2026 data shows table capped at 100 rows with as-of timestamp and source file + row link.
  - [ ] Q3 returns UPCs present in APL/Promos but Item Status NotActive/Pending, verified on 3 sample UPCs.
  - [ ] Loading 136k file never blocks UI over 2s and never renders over 100 rows at once.
  - [ ] Unknown question shows explicit can't-answer text, no invented data.
  - [ ] All Phase 1 works with network disabled except CDN/static (no key needed).

## Phase 2 - Mistral /api/ask on Vercel
- Scope: new `Wireframe/api/ask.js` (thin proxy: question + pre-aggregated slice -> Mistral -> headline + refined text); Ask panel POSTs same-origin `/api/ask`; Vercel env `MISTRAL_API_KEY` dashboard-set, never committed; fallback to Phase 1 text on failure.
- Steps: 1) Create proxy with row-cap + 25s timeout + per-IP rate limit. 2) Wire frontend to POST slice and render refined answer with deterministic table preserved. 3) Set env on Vercel + redeploy. 4) Verify on live Vercel URL.
- Acceptance criteria:
  - [ ] On Vercel, Q8 returns Mistral-polished brief plus identical deterministic counts as offline mode.
  - [ ] `MISTRAL_API_KEY` absent from all client JS/bundles (grep proves it).
  - [ ] Proxy failure (bad key) still shows deterministic answer with warning banner.
  - [ ] Response under 10s on Hobby, payload under 4MB.

## Phase 3 - Save library + drill + export
- Scope: `view-ask` library (save query not results, re-run on open); source drill-through; CSV export; localStorage `caboodleAskLib`.
- Steps: 1) Save/rename/delete saved questions. 2) Re-run saved query live. 3) Export answer CSV. 4) Deep-link answers to dashboard views.
- Acceptance criteria:
  - [ ] Saved Q3 re-runs after CSV reload and refreshes counts (query stored, not snapshot).
  - [ ] Each answer row links to source file + row id.
  - [ ] Export downloads CSV matching on-screen 100 rows.
  - [ ] Library persists across reload via localStorage.

## Phase 4 - Chat page + robustness fixes (added post-approval per user request)
- Scope: `view-askchat` (ChatGPT-style: center conversation, bottom input, left sidebar with THIS CHAT history + SAVED, + New chat); per-message Save/Export CSV; greeting/small-talk intent (`hi`, `hello`, `help`, `thanks`, `bye`); `file://` fallback file-picker (`Load data files` button when fetch fails); silent-failure fix (state init `{head:[],rows:[]}`, data-missing guidance instead of dead click); stopword + no-match routing fixes.
- Verified locally: two-question conversation, sidebar counts, new-chat clear, greeting/help/thanks replies, `file://` picker appears, http path shows no picker, empty dashboard intact, zero console errors.
- Acceptance criteria:
  - [x] Asking navigates to `view-askchat` with user + assistant bubbles and working bottom input.
  - [x] Sidebar history click scrolls to answer; saved click re-runs live.
  - [x] `hello` greets with example questions; gibberish gives honest no-match.
  - [x] Data unload + Ask shows guidance panel, never a dead click.

## Cross-Validation Phase (final)
- Run full flow on Vercel: all 8 questions, library save/re-run, export, proxy-failure fallback, mobile-width render. Reconcile every acceptance above against original requirements. Single overall code review. Verify no secret committed and no prod backend touched.

## Out of scope
Brand-side Ask, SPINS, write actions (promo draft/apply), shared/org libraries, scheduled digests, billing/rate plans, production Intelligence allow-list or DB changes, anonymization.

## Rollback note
Plain branch: delete branch `poc/ask-caboodle-broker` and remove `Wireframe/api/ask.js` + `Wireframe/data/broker/` to abandon; Vercel redeploys from `develop`. Remove/rotate `MISTRAL_API_KEY` env if needed. Never commit the API key to git.
