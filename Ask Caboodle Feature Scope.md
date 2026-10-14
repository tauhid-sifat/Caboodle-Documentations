# Ask Caboodle Feature Scope

> **Goal:** An AI-powered query/chat feature built into Caboodle that lets users ask natural-language questions and get answers pulled directly from their own Caboodle data — an AI assistant layered on top of the existing reports and dashboards.
> **Prepared by peer review:** Requirements Analyst · Caboodle Analyst · Critic · Product Analyst
> **Evidence base:** Sep 3 2026 "Ask Caboodle" call; Constance's Sep 4 notes; `docs/Ask Example.md`; `ba-onboarding/` (backend, frontend, and all module analyses); `data/jira-tickets/` (1,654 tickets, CS-1…CS-1651 + GTMS-*); `index.md`.
> **Status:** Feature ideation for client review.

---

## Feature Overview

Ask Caboodle puts a conversational AI assistant on top of Caboodle's existing reports and dashboards. A user types a question — *"What promos are running today?"*, *"Which stores in the Chino DC aren't buying us?"* — and gets an answer computed from their own Caboodle data, with a link to the source records.

**Three decisions govern everything:**

1. **Platform data only.** Answers come from Caboodle. No outside-world information, no general-chatbot answers.
2. **Module-subscription gating.** A brand can only query the modules it pays for.
3. **Replacement, not add-on.** Ask Caboodle is scoped to absorb some existing built reports and dashboards; a small set stay built-in (the tracker, the trade-spend roll-up).

**What exists today (a narrow baseline, not a blank slate).** The backend **Intelligence module** already runs the safe core — an LLM produces a JSON QueryPlan, and deterministic code compiles a read-only, parameterized `SELECT` against an allow-list. It is reachable only through **two data domains**:

- **Distributor Report** (KeHE/UNFI mapped sales), and
- **Internal Data** (CRM, ProductSpecs, TradeSpend + TradeSpendSandbox).

Its hard limits: 100-character prompt cap, 20-message session cap, 100-row default / 1,000-row max result, 30-second timeout, no cost guard or rate limits, partial tenant filtering, and no permission gating. The Broker, Brand, DataHub, FileRepository, and SPINS datasets are **not** reachable. The frontend Ask bar is a placeholder stub.

**The ideation principle.** Ask Caboodle does not need new data screens — the reports and grids already exist. It needs three things: **(a) coverage** of the modules that already hold data, **(b) a joined semantic model** so cross-module questions are correct, and **(c) the save / pin / gating layers** so users can build and keep their own views. The capability catalogue below is organised as the layer itself: for each existing report or dashboard, what a user can now simply *ask*.

**Interaction model.** Ask → concise answer (with "as of" time and source link) → refine naturally → drill into records → save or pin → act (export, update, or draft).

| Question type | What the user wants | Example |
|---|---|---|
| **Lookup** | A fact or list | "Which banners carry this SKU?" |
| **Monitor** | What is happening now | "What promos are running today?" |
| **Compare / diff** | What changed or differs | "Items active on the distributor side but not in item status" |
| **Analyse / trend** | How it moved | "Cases sold by month this year" |
| **Explain / drill** | Why and where | "Why did this promo go over budget?" |
| **Act / plan** | Create or back-solve | "Build a promo at $3.99 and 40% margin" |

---

## Core Capabilities

### 1. Promotions & Trade Spend
*Existing surfaces: Promo Planning (Brand-Approved), Trade Spend Sandbox, Promotional Calendar, Broker Promotional Management, Promotional Notes, Trade Spend Roll-up.*
*Backing data: `TradeSpend.TradeSpendPromos` / `TradeSpendPromoEvents` (retailer, banner, distributor, product, dates, per-unit price, lift, velocity, allowances OI/MCB, scan %, TPR fee, stores, `Status`, `IsSubmitted`); sandbox equivalents; monthly snapshots.*

- What promotions are running today / this month?
- Which promotions haven't been submitted yet? Who haven't I submitted for?
- Total trade spend by brand, retailer, banner, region, or period.
- Which promotions went over budget? Planned vs. actual cases for a promotion.
- What's the TPR spend versus the ad/display fees?
- Show the lowest-lift promotions; how many stores are on promo for this SKU in July?
- Which SKUs are on promotion across all my accounts?

*Disposition:* **Augment** the report; keep the Trade Spend Roll-up built-in (client decision). *Key constraint:* the live module never advances promo `Status`, so status answers reflect what was entered, not an enforced lifecycle.

### 2. Distributor Sales (KeHE / UNFI)
*Existing surfaces: Distributor Reports (Sales by Product / Chain / Store / City / State, Velocity, DC/Warehouse, Void, Retail Sales), Distributor Sales Report.*
*Backing data: raw `KeHe`/`Unfi`, mapped `KeHeMapped`/`UNFIMapped`, unified `DistributorSalesRecord`.*

- Cases and dollars by month, retailer, banner, product, or DC.
- Top SKUs by volume or revenue; year-over-year sales change.
- Which retailers buy this item? Which items are shipping but absent from item status?
- Which stores have stopped ordering?

*Disposition:* **Replace the view layer** (one question, any distributor — consolidates the KeHE/UNFI split). *Key constraint:* several calculation defects must be fixed first (see Gaps).

### 3. Category Review & Brand Report
*Existing surfaces: Category Review (list, yearly grid, calendar), Brand Report (tracker), Broker Dashboard "Reviews Due".*
*Backing data: `Broker.CategoryReviews`, `Broker.CategoryReviewCalender`, Brand Report status columns (Brand Response, Submission/Meeting status, Next Action, Waiting On, Review Result).*

- Which brands have a review coming up? What reviews are due in the next 60 days?
- Who haven't I submitted for? What's the status of each review?
- What's the review / reset month for this retailer? Which reviews await a brand response?

*Disposition:* **Augment** — keep the workflow, email, and tracker; expose the queries. *Key constraint:* the `Broker` schema is not in the AI allow-list today.

### 4. Market Overview & Distribution
*Existing surfaces: Broker Market Overview (log + report), Brand Market Overview report, Sales Tracker.*
*Backing data: `Broker.MarketOverviews`, `CRM.BannerSKUs.Status`; read-only Market Overview tables.*

- What stores are active in distribution? How many stores is this product in?
- Which banners carry this SKU? Distribution status by region (active/pending/committed/discontinued).
- Which SKUs are discontinued at a retailer?
- Show market-overview observations for a brand, banner, or region.

*Disposition:* **Replace** the redundant Market Overview report tab; **keep** the entry grid. *Key constraints:* `MarketOverview.SKUID` is ambiguous (BannerSKU vs ProductSpecification), `BannerSKU.Status` is an untyped integer, and store counts depend on the store-count fix.

### 5. Distributor APL
*Existing surface: Distributor APL (broker) and APL report/activity.*
*Backing data: `Broker.DistributorAPLs` (`DCID`, `DistributorItemCode`, `UPCNumber`, `WholesaleCaseCost`, `WholesaleUnitCost`).*

- What's the wholesale case / unit cost for this item at KeHE or UNFI?
- Which items have no cost? Where has cost changed?

*Disposition:* **Augment**. *Key constraints:* APL links to product by UPC value only (no `ProductID`); DC is ambiguous; the `Broker` schema is not yet allow-listed; data freshness depends on the APL sync.

### 6. Retail Assortment & Item Status (Banner SKU)
*Existing surfaces: Retail Report, Banner / Retailer / Banner-SKU admin, Sales Tracker.*
*Backing data: `CRM.BannerSKUs` (`BrandID`, `BannerID`, `ProductID`, `ActiveDate`, `DiscoDate`, `Slotting`, `Status`).*

- Which banners carry this product? What's the assortment for a retailer or banner?
- Which items were added or discontinued this quarter? Which SKUs are Active vs Discontinued vs NotActive?
- Which banners in a region don't carry our SKU? (white space)

*Disposition:* **Replace** the Retail / APL-status report grid. *Key constraint:* `Status` has no defined value set.

### 7. Stores
*Existing surfaces: Store List (DataHub), Store Report Management, Broker Dashboard "Stores In".*
*Backing data: `DataHub.StoreListEntry`; `CRM.Stores`.*

- How many stores does this retailer or banner have?
- List stores by region or retailer; which are new; which have dropped?
- Stores that pull from a DC but don't buy (white space).

*Disposition:* **Replace** the new/dropped-store manual work. *Key constraint:* duplicate-store cleanup is a prerequisite; store counts depend on the store-count fix.

### 8. Product Specs & Pricing
*Existing surfaces: Products, Categories, Price Lists.*
*Backing data: `ProductSpecs.ProductSpecifications`, `Categories`, `PriceList`.*

- What's the case cost or list price for this SKU? Which products have no pricing set?
- What's my margin if the retail price is $3.99? What scan hits a 40% margin?

*Disposition:* **Augment**; the margin/scan back-solve is the flagship Act use case.

### 9. Dashboards (Brand & Broker KPI cards)
*Existing surfaces: Brand Dashboard (Banner Count for Item Status, Trade Spend Roll-up); Broker Dashboard (tile grid → KPI cards per CS-1305).*

- Stores in distribution, reviews due, active promos, brands represented.
- YTD spend versus budget.
- *"What needs my attention today?"* — one brief across reviews, promos, and tasks.

*Disposition:* **Augment / potentially replace** — the meeting called the KPI cards "very logical questions to ask Caboodle."

### 10. Reports, Exports & Saved Views
*Existing surfaces: Reports hub; export buttons across modules.*
*Backing infrastructure: background export jobs; per-user preference store.*

- "Save this report / question" → personal report library.
- "Pin this to my dashboard" → personal dashboard composition.
- "Export this answer" → CSV/XLSX to feed existing uploads.

*Disposition:* **New capability** (building blocks exist — see Dependencies).

### 11. SPINS & Syndicated Data *(future — depends on data readiness)*
*Existing surfaces: SPINS Item Ranking, Store Insights, Void report, Market Insights.*
- Unit/dollar sales change, distribution, and velocity by retailer or region.

*Disposition:* **Future replace** — the client expects SPINS reporting to move to Ask Caboodle, but SPINS mapping is incomplete today.

### Summary table

| Capability | Example User Query | Current Caboodle Context | Notes |
|---|---|---|---|
| Promotion monitoring | "What promos are running today?" | Promo events with dates, status, and submission flag; only pushed-from-TSS promos reach broker view | Live status is not advanced by the system |
| Trade-spend analysis | "Total trade spend by region this quarter" | Read-side spend calculations; Roll-up report; net-dollar basis | Figures recalculated on read, not stored |
| Distributor sales | "Cases sold by month for this retailer" | Distributor Report; Products and Monthly reports | Known calculation defects must be fixed first |
| Category Review lookup | "Which brands have a review coming up?" | Category Review and Brand Report | Broker schema not yet in the query allow-list |
| Distribution status | "What stores are active in distribution?" | Market Overview; Banner SKU status; Store List | Ambiguous SKU link; store counts need the store-count fix |
| Assortment lookup | "Which banners carry this SKU?" | Banner SKU (product × banner) | Item status has no defined value set |
| Report comparison / diff | "Active on distributor but not in item status" | Banner SKU vs. Distributor Report | The two datasets are not joined today |
| New / dropped stores | "Stores not shipped since May 2026" | Distributor Report ship history × Store List | Overlaps backlog auto-flagging |
| White-space target list | "Stores at the Chino DC that don't buy us" | Distributor Report × DC/Store mappings | Maps to the unbuilt Banner-to-DC report |
| Cross-module questions | "Planned cases in New Jersey" | Promotions have no region; region lives in CRM | The core join challenge |
| Save to a library | "Save this monthly report" | Session/message history exists; no saved reports | Save the query, not the results |
| Pin to a dashboard | "Pin this KPI" | Dashboards are static today | Needs a dynamic dashboard layer |
| Margin / promo back-solve | "What scan hits a 40% margin?" | TSS computes margin forward; Margin Calculator is backlog | The flagship Act capability |
| Module gating | — | Per-brand/broker module on/off exists | Each question domain must map to a module |
| Export a result | "Export this list" | Background export jobs exist | Lets answers feed existing uploads, e.g. Banner SKU upload |

### Report & dashboard disposition (replace / augment / keep)

| Existing report or dashboard | Disposition | Evidence |
|---|---|---|
| Distributor Report (KeHE/UNFI) | Replace view layer | Highest-churn report; unify per CS-1262, CS-1222 |
| SPINS reports / Market Insights | Future replace | CS-1294, CS-1293, CS-1620 |
| Market Overview report tab | Replace (redundant) | CS-1323 |
| Retail / APL-status report | Replace / augment | CS-289, CS-45, CS-734 |
| Products report (Promoted Case Sales) | Replace | CS-442 (hidden) |
| Void Report | Augment / replace | CS-1034, CS-449 |
| Monthly Report | Keep, augment | CS-1336, CS-1352 |
| Sales Tracker | Keep (drill-through) | CS-744, CS-993 |
| Trade Spend Roll-up | Keep built-in (client) | Client decision; CS-1339 |
| Category Review / Brand Report | Keep workflow; expose queries | CS-1499, CS-1508, CS-1549 |
| Distributor APL report | Augment | CS-1523, CS-1424 |
| Banner-to-DC report (unbuilt) | Replace with Ask | CS-1295 |
| Sales Tracking for Prospects (unbuilt) | Replace with Ask | CS-1306 |
| Retail Portal Data Upload (unbuilt) | Keep ingestion; query the result | CS-1297 |

---

## Key Use Cases

**1. Prompt-based promotion creation (reverse-engineering).**
*"Build the 2027 Whole Foods plan — I want to be at $3.99 at a 40% margin. What scan do I need?"* The system back-solves the mutable promo parameters (scan/TPR), holding fixed constraints (OI, MCB, list price), and produces a **draft** promotion. Constance calls it a game-changer; the mechanics are the existing forward equations run in reverse. Tracks against **CS-1341 (Margin Calculator)** and the Trade Spend Sandbox / Simple Entries.

**2. Report comparison / discrepancy detection.**
Compare **Brand Retail Item Status** (`BannerSKU`) with the latest **Distributor Report** to surface items shipping on the distributor side but absent or not-active in item status, then update SKU data in the CRM. Replaces the client's manual export-and-prompt-Claude workflow. Tracks against **CS-1279** (auto-update item status) and the Banner SKU upload. The two datasets are currently on separate query paths — a core join to build.

**3. New and dropped store flagging.**
*"Flag new stores and stores that haven't shipped since May 2026."* Derived from Distributor Report ship history against the Store List. Tracks against **CS-1281** (auto-flags for new/disco items and retailers) and SPINS "Flag > New stores" (CS-1294).

**4. White-space target list.**
*"Which stores pull from the Chino DC but don't buy from us?"* The client's long-standing "white space prospect report," to be delivered as a query rather than a fixed report. Tracks against **CS-1295 (Banner-to-DC report)** and **CS-1306 (Sales Tracking for Prospects)**.

**5. The broker/brand morning brief.**
*"What needs my attention today?"* Reviews due, unsubmitted promos, and tasks across represented brands — one answer instead of four screens. Tracks against the **CS-1305** KPI set and **CS-1591** flag alerts.

**6. Self-service reporting (build, save, refresh).**
A user iterates a question until it's right, saves it, and it keeps refreshing — "Claude Projects" for reports. Explicitly requested in **CS-1294**: *"Users should be able to utilize Ask Caboodle to build and save the reports they want… Think Claude Projects."* Persistence layer already proposed in **CS-1616** (generic `UserPreference`).

**7. Build your own dashboard.**
Pin saved answers as cards and arrange a personal dashboard, rather than requesting a fixed one. Tracks against the dashboard work (CS-1305, CS-1598–CS-1604).

**8. Assortment, item-status, and pricing lookups.**
Which banners carry a SKU, what the current status is, what pricing is missing, what the margin is at a given retail price — the daily CRM/Product Specs questions.

---

## Current System Dependencies

**Platform data and query engine**
- **Intelligence module** (as-built): LLM → JSON QueryPlan → deterministic SELECT-only compiler, allow-list, `Deleted=false` injection, result cap, timeout, pluggable LLM.
- **Two reachable domains:** Distributor Report (KeHE/UNFI) and Internal Data (CRM, ProductSpecs, TradeSpend + Sandbox). **Not reachable:** Broker schema (Market Overview, Category Review, Distributor APL), Brand, DataHub, FileRepository, SPINS.

**Entitlement and access**
- **Module configuration & assignment** — admin catalog + per-brand/broker toggles (CS-146 backend In Staging, CS-147 frontend). This is the subscription-gating mechanism decision #2 requires.
- **Subscription tier** — promotion-count limit model under discussion (CS-1592).
- **Organization access** — org-based brand access rolling across modules; CS-1472 explicitly includes **intelligence** among the areas to enforce.
- **Permission & tenancy** — `[MustHavePermission]` and the brand-isolation middleware; the AI endpoint is currently ungated and partial-filtered.

**Supporting infrastructure**
- **Per-user preference store** — proposed generic key/value `UserPreference` (CS-1616); needed for saved questions and pins.
- **Background export pipeline** — async CSV/XLSX with status polling (CS-1163, CS-1614).
- **Entity resolution / master entities** — `MasterEntity` + the DataHub ER service (CS-1415); needed to resolve names to IDs across modules.
- **Read-only market-overview tables** — precomputed read model (CS-688) — the pattern needed for fast, repeatable answers.
- **Upstream data-quality fixes** — the distributor-report calculation defects (CS-1333, CS-1421, CS-1422, CS-1438, CS-1426, CS-1433, CS-1515/1516), sync failures (CS-1387), and store dedupe (CS-1593, CS-1502).

**Data architecture gaps to close (the "database architecture" discussion)**
- A **joined semantic model** across Distributor Sales, Assortment (`BannerSKU`), Stores, and CRM geography.
- **Precomputed promotion/trade-spend results** — currently calculated on read.
- A **promotion-to-region** link (promotions have no region today).
- **Persisted query/plan storage** for saved questions and pins.
- **Join fixes** for the known ambiguities (below).

---

## Gaps / Limitations

**Structural**
1. **Cross-module joins are not possible today.** Distributor Report and Internal Data are separate query paths; the flagship comparison (Use Case 2) depends on joining them.
2. **No database foreign keys on core entities.** All links are logical ID references enforced by application code, so AI joins can hit orphans and dangling IDs; every join must be expressed defensively.
3. **Ambiguous / missing joins:** `MarketOverview.SKUID` (BannerSKU vs ProductSpecification); `DistributorAPL.UPCNumber` (value match only, no product ID); two competing DC concepts (`DistributionCenter` vs `DistributorDc`); monthly reports store distributor/retailer/banner/product as **text** (a join dead-end); promo `CategoryIDs` is an embedded `jsonb` list.
4. **No joined semantic model** across the modules, and no promotion-to-region path.
5. **Promotion/trade-spend figures are computed on read**, so fast repeatable answers need precomputation.

**Answer integrity**
6. Live TradeSpend **never writes promo event `Status`**; `BannerSKU.Status` is an **untyped integer**; the Market Overview → CRM sync fires on **create only**; soft-deleted rows are invisible; date terminology has churned. A confident wrong answer is worse than "I can't answer."
7. **Upstream defects** (distributor calculations, sync failures, duplicate stores, incomplete SPINS mapping) surface faster and more plausibly through natural language.
8. **Partial tenant filtering** — CRM master tables (`Distributors`, `Retailers`, `Banners`, `Stores`) have no `BrandID` column and currently receive no filter; there is no row-level security.

**Controls**
9. **No cost guard, rate limiting, or read-only DB role**; the AI endpoint has no permission gating; audit writes the SQL/QueryPlan as null (not immutable).
10. **NL-hostile limits** — 100-character prompt cap and 20-message session cap.
11. **Usage/cost model unresolved** (CS-1288 "Character Requirements > Billing").
12. **No AI/Intelligence epic exists** — the only dedicated tickets are stubs (CS-1362 "add the bar", CS-1288 architecture/billing); everything else is inferred or in the BA deliverables.

**Product**
13. **Saved reports and pins have no storage** and no runtime.
14. **"Report" is overloaded** — a generated answer, a saved question, and a built-in report must be named distinctly (CS-1294 mixes all three).
15. **Module-to-domain mapping is undefined**, including how a question that joins a paid and an unpaid module should behave.

---

## MVP Scope

**Phase 1 — "Ask": the assistant over existing reports and dashboards.**
- Natural-language Q&A across promotions, distributor sales, trade spend, category review, distribution, assortment, stores, pricing, and dashboard KPIs — platform data only, filtered by brand and module subscription.
- Answer-first responses with a source link and "as of" time; follow-up refinement, tables, and charts; an explicit "I can't answer that" for anything out of scope.
- The two read-only flagship comparisons: **item-status reconciliation (Use Case 2)** and **new/dropped stores (Use Case 3)**.
- **Save a question to a personal library** (the query is saved; the answer refreshes), plus CSV export.
- Module-subscription gating and practical question-length/session limits.

**Enabling prerequisites (must be agreed as Phase-1 scope):**
- Extend the AI allow-list to the **Broker, Brand, and DataHub** schemas needed above, and resolve the ambiguous joins.
- Stand up the **joined semantic model** for the comparison use cases.
- Wire gating to **CS-146/147**, and persistence to **CS-1616 (UserPreference)**.
- Land the **must-fix distributor-report calculations** so answers are trustworthy.

**Phase 2 — "Act": create and compose.**
- **Prompt-based promotion creation / margin back-solve** (CS-1341; Trade Spend Sandbox / Simple Entries draft output).
- **Pin saved answers to a personal, arrangeable dashboard.**
- Scheduled refresh and email digests.
- Expand to SPINS (once mapping is ready), Distributor APL, Trade Spend Roll-up detail, and Monthly Report.

**Phase 3 — "Extend".**
- Predictive and assistive planning.
- Shared and org-level libraries and templates.
- Retire more replaceable built reports in favour of saved questions (CS-1295, CS-1306, CS-1297 concepts).

---

## Future Scope

- Broaden coverage to every reporting module as data readiness allows, including SPINS slice-and-dice.
- Prompt capture and versioning (the internal **Prompt Vault** project), with reusable parameterised questions.
- Anomaly alerts (new/dropped stores, status drift, spend overruns) pushed to the dashboard and email.
- Shared libraries, role-based dashboards, and org templates.
- Deeper natural-language authoring beyond simple promotions.

---

## Open Questions

**Evidence & scope**
- Where is the "10–12 questions" list Bijoy demonstrated on Sep 3? It is not captured in any ticket or transcript and should be recovered — it likely defines Phase-1 launch requirements.
- Which reports and dashboards are formally targeted for replacement, and which stay built-in?
- Should CS-1294's save-report requirement be split out of SPINS and made an Ask Caboodle epic?

**Module gating & access**
- What is the authoritative question-domain → module mapping, and how are cross-module questions gated (a paid + unpaid join)?
- Should the Ask Caboodle endpoint be folded into the Organization-access enforcement (CS-1472)?

**Flagship capabilities**
- For promo creation: which parameters are fixed (OI, MCB, list price) and which are solved, and is the output a draft in the Sandbox or a Simple Entry? Does it live here or in the Margin Calculator (CS-1341)?
- For report comparison: which source is authoritative for item status, and should Ask only report discrepancies or also apply the CRM update (CS-1279)?
- What defines "new" and "dropped" stores, and who sets the thresholds?

**Data architecture**
- Is the joined semantic model (and precomputed promo results) an agreed Phase-1 prerequisite, and who owns its definition?
- How are the ambiguous joins (`MarketOverview.SKUID`, APL↔product, DC, text monthly reports) resolved canonically?

**Save / library / pin**
- Personal only or shared? Do saved questions and pins re-check module subscription and brand access on refresh?
- What happens to a saved report when its module is later disabled?

**Commercials**
- What are the usage limits, pricing, and billing model (CS-1288)? Who pays — per query, per seat, per tier?
