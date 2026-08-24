# Caboodle Project — Permanent Knowledge Base

> **Generated:** 2026-07-14 · **Last synced with live evidence:** 2026-08-20  
> **Purpose:** Foundational memory for LLM agents working on this project.  
> **Source docs:** `ba-onboarding/`, `prototypes/Daily Delight Calendar/`, `data/jira-tickets/` (live Jira export — 1,567 tickets, **authoritative**), `meetings/` (14 raw transcripts — **raw evidence**), Lovable prototype prompts.  
> **Note:** `data/Jira (3).csv` is **legacy** (130-issue export from kickoff) and superseded by `data/jira-tickets/`. Do not treat the CSV as source of truth.

---

## 1. WHAT THIS PROJECT IS

Caboodle is a **multi-tenant SaaS platform for CPG (Consumer Packaged Goods) brands and brokers** that unifies sales tracking, trade promotion management, analytics, data ingestion, document management, and collaboration.

**Business problem:** CPG brands/brokers rely on fragmented Excel/CSV data from multiple distributors (KeHE, UNFI, SPINS). Promotional planning is spreadsheet-based, static, and hard to analyze. Caboodle centralizes data ingestion, mapping, planning, and analytics into one system.

**Target users:** Brand owners, brand sub-users, brokers, sub-brokers, internal admins — all in natural/organic CPG.

---

## 2. TECH STACK

### Frontend (`caboodle-new-web/`)
| Tech | Version | Notes |
|------|---------|-------|
| Next.js | 13.4.12 | App Router, route groups `(auth)`, `(brand)`, `(broker)` |
| TypeScript | 5.1.6 | **`strict: false`** — significant weakness |
| React | 19.1.0 | |
| Zustand | 4.4.1 | Global state (brand, role) with localStorage persist |
| TanStack React Query | 4.33.0 | Server state, caching, invalidation |
| NextAuth | 4.23.0 | JWT with refresh tokens, 10-min pre-expiry refresh |
| Ant Design | 5.23.2 | Primary UI library |
| PrimeReact | 10.9.2 | Secondary UI — causes bundle bloat/style conflicts |
| Tailwind CSS | 3.3.3 | Styling |
| Axios | 1.4.0 | HTTP client (two instances: `httpClient` + `axiosInstanceFromClient`) |
| AG Grid | (yes) | Data grids |
| ECharts | (yes) | Charts |
| CKEditor | (yes) | Rich text |
| Mapbox | (yes) | Maps |

### Backend (`Caboodle/`)
| Tech | Version | Notes |
|------|---------|-------|
| .NET | 6 (targeting 9) | EOL — upgrade deferred |
| Architecture | Clean Architecture + CQRS | Modular Monolith |
| Pattern | MediatR | Commands/Queries/Handlers |
| ORM | EF Core (writes), Dapper (reads) | |
| Validation | FluentValidation | |
| Mapping | AutoMapper | |
| Background jobs | Hangfire | PostgreSQL-backed |
| API | REST, Swagger/OpenAPI | |
| Logging | Serilog → Seq | |

### Database & Storage
| Component | Tech | Notes |
|-----------|------|-------|
| Primary DB | PostgreSQL (RDS) | Single logical DB, tenant isolation per Brand |
| Caching | Redis | **Infra ready but NOT activated** |
| File storage | S3 | Private buckets |
| Email | SES | Under upgrade (target Jan 15, 2026 update — still in progress) |
| Migrations | EF Core | In `caboodle/src/Database/Migrator` |

### Prototype Tools
| Tool | Use |
|------|-----|
| Lovable.dev | Rapid prototyping — Category Review yearly grid prototype created here |
| shadcn/ui + Tailwind | Prototype design system (Daily Delight Calendar) |
| Framer Motion | Prototype animations |

---

## 3. ARCHITECTURE

```
┌────────────────────────────────────────────────┐
│            FRONTEND (Next.js 13 App Router)    │
│  (auth) │ (brand) │ (broker) route groups      │
│  Zustand (client state) · TanStack Query       │
│  Ant Design + PrimeReact · Tailwind             │
├────────────────────────────────────────────────┤
│            HTTPS / REST API / JWT               │
├────────────────────────────────────────────────┤
│        BACKEND (.NET 6 Modules)                 │
│  Admin | Brand | Broker | CRM | Dashboard       │
│  DataHub | DataUpload | FileRepository          │
│  ProductSpecs | Report | Store | TradeSpend     │
│  TradeSpendSandbox                              │
│  Clean Architecture + CQRS (MediatR)            │
│  EF Core (writes) · Dapper (reads)              │
│  Hangfire (background jobs)                     │
├────────────────────────────────────────────────┤
│  PostgreSQL (RDS) · S3 · Redis (inactive)      │
│  SES · Serilog → Seq                            │
└────────────────────────────────────────────────┘
```

**Module pattern (per module):** Commands/Queries → Handlers → DTOs → Specifications → Validation → Domain Entities/Value Objects → Infrastructure.

**Pipeline behaviors:** Request → Validation → Logging → Transaction → Handler → Response. Exception middleware for consistent API errors.

**Tenancy:** Strict data isolation per Brand — global EF Core query filter appends `AND brand_id = @TenantBrandId`.

**Data access:** EF Core for transactional writes; Dapper for high-volume reads/complex queries. Repository + Specification pattern.

---

## 4. MODULE CATALOG

| Module | Purpose | Status |
|--------|---------|--------|
| **Admin** | Roles, permissions, settings, user management, data mapping, CRM data upload | 67 backlog tickets — highest volume |
| **Brand** | Brand entity management, home page, branding | Stable |
| **Broker** | Broker/sub-broker management, broker dashboard (Market Overview, Promo Management, Category Review, Distributor APL) | Active dev — 33+ tickets |
| **CRM** | Distributors, Retailers, Banners, Regions, Contacts, Pipeline (Task Board) | Mostly stable, Retailers untested |
| **Dashboard** | Summary KPIs, cross-module reads | Stable, low detail |
| **DataHub** | Centralized data coordination, shared datasets | Internal |
| **DataUpload** | Bulk ingestion, mapping, validation (Import Wizard) | Active refactoring — 1GB+ handling |
| **FileRepository** | Document/file management via S3 | Buggy (download errors) |
| **ProductSpecs** | Categories, Products, Pricing | **Done & fully tested** |
| **Report** | 8+ reports (Market Activities, Category Review, Retail, Sales Tracker, Trade Spend Rollup, Monthly, SPINS, Distributor, Banner-to-DC) | Mixed — Distributor Report has 16 tickets |
| **Store** | Store domain elements (orphan — domain only, no controller/service layer) | **Not implemented** |
| **TradeSpend** | Core trade promotions and planning | Stable |
| **TradeSpendSandbox** | TSS — draft promos, what-if scenarios, 4-step wizard | Functional, ongoing QA — 37 tickets |
| **PromotionalCalendar** | Calendar view of promotions | Partial, untested |

> **Backlog counts:** figures above are from legacy notes. See **§16** for live, evidence-based counts from the 1,567-ticket Jira export.

---

## 5. USER ROLES & PERMISSIONS

| Role | Permissions | Restrictions |
|------|------------|-------------|
| **Admin** | Full system access, user management, data upload, data mapping, settings | None |
| **Brand Owner** | Full access to own brand — Product Specs, TSS (create/edit/push), Reports, CRM, Pipeline | Cannot access other brands |
| **Brand Sub-User** | Limited subset of Brand Owner | Exact boundaries undocumented |
| **Broker** | Broker Dashboard, Market Overview, Promo Management, Category Review, APL, Files | Cannot create promos, only manage approved ones |
| **Sub-Broker** | Limited subset of Broker | More limited than Broker |
| **Read-Only** | View data only | All edit/delete/create hidden |

**Known gap:** The permission system exists (RBAC roles) but **many controllers lack explicit `[Authorize]` checks**. Brand roles technically get no permissions assigned in code — several calls return empty permission arrays. Cross-tenant access via Brand-ID header is trust-based at the controller level.

---

## 6. KEY BUSINESS FLOWS

### Flow 1: Promotion Lifecycle
```
Brand → Product Specs → TSS (Step 1-4 wizard) → Push to Approved → Promotional Calendar → Broker Promo Management
```
- Step 1: Select retailers & banners
- Step 2: Select SKUs, set velocity & store count
- Step 3: Create events (Normal = specific months, EDLP = Jan-Dec)
- Step 4: Configure metrics — fees distributed equally per product within banner
- Push: System validates pricing exists → status changes to Approved → appears in Promotional Calendar

### Flow 2: Distributor Data Ingestion
```
Distributor (KeHE/UNFI/SPINS) → CSV/Excel upload → DataHub → Unmapped records → Manual resolution → Mapped → Reports
```

### Flow 3: Brand-Broker Data Propagation
- Broker creates category review rows → propagated to brand (editable)
- Brand edits → stays local (doesn't push back) unless pushed to calendar
- Calendar pushes propagate to broker
- Deletions at broker level propagate to brands — except items the brand added locally
- Status hierarchy: Pending → Approved → Committed → Active → Discontinued (certain transitions restricted)

### Flow 4: Market Overview → CRM Status Sync
- `PushMarketOverviewChangesIntoCRM` fires on Market Overview **create only** (not update/delete)
- Sync target: `BannerSKU.Status` (untyped integer — known gap)
- Status hierarchy: **Discontinued is terminal** — Market Overview cannot overwrite it
- Lower statuses (NotActive/Pending) can be changed to any status
- Flow: Pending → Approved → Commit → Active → Discontinued
- Dead-ends: Pending → Declined (never placed), Pending → NotActive (never activated)
- `MarketOverview.SKUID` ambiguous — unclear if it targets `BannerSKU` or `ProductSpecification`

---

## 7. CRITICAL TERMINOLOGY (Broker-Brand Relationship)

**Correct language (from ba-onboarding docs):**
- **Brands are assigned to brokers** (endpoint: `PATCH /Brands/assign-brand-to-broker`)
- **Broker represents brands** — not "broker assigned under brand"
- **Admin assigns brands to a broker**, not the broker adding themselves
- The link is `Brand.BrandBrokers` table (owned by Brand module)
- KPI label: **"Brands Represented"** (not "Brands Assigned")

**Incorrect (do not use):**
- ❌ "Broker assigned to a brand"
- ❌ "Broker assigned under brand"
- ❌ "Brands assigned under broker"

---

## 8. BROKER DASHBOARD — WIREFRAME & FEATURES

A live wireframe is deployed at **https://caboodle-broker-dashboard.vercel.app**

### Layout (top to bottom)
1. **Header** — Caboodle logo, nav (Dashboard, Management ▾, Strategy ▾, Files icon), brand selector
2. **Quick Actions** — 5 tiles: Market Overview, Category Review, Distributor APL, Promotional Management, File
3. **KPI Row** — 4 compact horizontal cards: Stores In (1,247), Reviews Due (3), Active Promos (8), Brands Represented (15)
4. **Timeline + Task Board** — 55/45 split: 14-day unified feed + 3-column Kanban

### Key Design Decisions
- KPI cards are horizontal (icon + value/label + trend + View link on one row) — compact
- Timeline merges Category Review deadlines, Promo events, and Tasks
- Task Board is simple (To Do / In Progress / Done) — NOT the CRM Pipeline
- Quick Actions are **under the header** (above KPI row)
- Dark mode toggle removed from final wireframe

---

## 9. CATEGORY REVIEW — THREE DISTINCT FEATURES (CS-1361 vs CS-1296)

From the Lovable prototype (prompts 1-17), the Category Review has **three separate interactions**:

| Feature | Trigger | Linked to cell? | Purpose | Lovable Prompt |
|---------|---------|----------------|---------|----------------|
| **Send to Contacts** | Toolbar button | ❌ No — global email | Send free-form email about the calendar | Prompt 10 |
| **Cell Click → Checkmark** | Single-click cell | ✅ Yes | Personal "I've reviewed this" tracking (per-user) | Prompt 11 |
| **Cell Double-Click → Assign Contacts** | Double-click cell | ✅ Yes | Assign responsibility for that specific review | Prompt 17 |

### CS-1361: Yearly Planning Grid
- Row grouping: **Retailer** (not Banner — CSV has no Banner column)
- Columns: 12 months (Jan-Dec)
- Cell badges: color-coded milestone types
- Filter: Category, Banner/Retailer, Month, Date Type
- Year navigation with chevrons + "This Year" button
- Promotional Calendar toggle (same grid, different data source)

### CS-1296: Calendar Rollup (CSV Upload)
- Upload format: `Region,Retailer,Category,Review Month,Submission Due Date(MM/DD/YY),Review Dates(MM/DD/YY),Reset Date(MM/DD/YY),Additional Notes`
- Required columns: `Retailer`, `Category`, `Review Month`
- Date format: MM/DD/YY
- Reupload replaces all data (no merge)
- Entity fields: `Region`, `Retailer`, `Category`, `ReviewMonth`, `SubmissionDueDate`, `ReviewDate`, `ResetDate`, `AdditionalNotes`
- `BrandID` and `BrokerageCompanyID` set server-side
- `ShouldBeInCalender` defaults to `false`

### Data Flow
```
CS-1296: Upload CSV → POST /category-reviews/import → CategoryReview table
CS-1361: Grid loads → GET /api/category-reviews/calendar?year=YYYY → reads from CategoryReview table
```

---

## 10. PROMOTIONAL MANAGEMENT — STATUS LIFE

### PromotionEventStatus Enum
| Code | Label | Notes |
|------|-------|-------|
| 1 | Active | Planned/active |
| 2 | Cancelled | Cancelled before running |
| 3 | Pending | Awaiting approval |
| 4 | DidNotRun | Scheduled but didn't occur |
| 5 | Declined | Declined by retailer |
| 6 | RetailerApproved | Approved by retailer |
| 7 | Completed | Ran and concluded |

**Gap:** Live TradeSpend module **never writes status** — only reads it for financial calculations. Status transitions happen only in Sandbox (`UpdateEventStatusAsync`).

### Submission (IsSubmitted flag)
- Separate from status — parallel flag on events
- Managed by `UpdateSubmissionStatusOfEventsRequest`
- Role-aware: BROKER/BROKERSUBUSER restricted to assigned brands

### Market Overview SkuStatus (separate enum)
Active, Pending, NotActive, Declined, Discontinued, Approved, Commit

---

## 11. MEETING OUTCOMES (Client Clarifications)

### Key Decisions (from Broker Dashboard meetings)
1. **Category Review scrolling** → Infinite scroll, not pagination (CS-1316)
2. **CS-1305 re-scoped** → Broker Dashboard with KPI cards, not just UI polish
3. **Pipeline ≠ CRM Pipeline** → Simple task board (To Do / In Progress / Done) — lightweight, no deal stages
4. **Status hierarchy** → Discontinued is terminal; Market Overview cannot override it
5. **UNFI Independents** → Door count (700) is misleading — actual per-store count needed for accurate KPIs
6. **Multi-brand log entry** → Sheet view: select retailer → grid of all brands' SKUs → click-click → one submit
7. **Broker adds/represents brands** — not "assigned under brand"

### Open Questions
| Question | Status |
|----------|--------|
| Status transition matrix for SkuStatus | Need to confirm with Bijoy |
| Store count for UNFI Independents | Need store picker implementation |
| MO6 sheet mockup | Client has one — need to obtain |
| Email backend for Send to Contacts | SMTP/SendGrid/Resend? |
| Is "Submitted" a new status value or parallel flag? | TBD |
| PM6 scope (multi-month events) | Option A (read-only display) vs C (full drag) |

> **Consolidated, provenance-tagged decisions & open questions** are in **§17** (synthesized from all 14 `meetings/` transcripts).

---

## 12. JIRA ISSUES — DESCRIPTION GAPS

> **Legacy:** the gap list below was computed against `data/Jira (3).csv` (130 issues) at kickoff. It should be **re-derived from `data/jira-tickets/`** (1,567 live tickets) — the CSV is superseded.

19 issues in `data/Jira (3).csv` lack proper descriptions (under 50 chars or only image):

CS-478, CS-617, CS-725, CS-1090, CS-1092, CS-1150, CS-1177, CS-1178, CS-1185, CS-1186, CS-1197, CS-1202, CS-1209, CS-1211, CS-1236, CS-1258, CS-1259, CS-1307, CS-1354

40 other issues in the listing have proper descriptions.

---

## 13. KNOWN TECHNICAL DEBT & RISKS

### High Priority
1. **.NET 6 EOL** — no security patches, upgrade to .NET 9 deferred
2. **TypeScript `strict: false`** — bypasses null checks, implicit any
3. **Caching inactive** — Redis infra ready but off, unnecessary DB load
4. **Secrets in config** — not using AWS Secrets Manager (planned)
5. **Single-instance production** — no HA, EC2 failure = downtime
6. **Image domain wildcard `"*"`** in `next.config.js` — security risk
7. **Token in localStorage** (Zustand persist) — XSS risk
8. **No global error boundary** on frontend
9. **Duplicate Axios instances** — inconsistent headers
10. **Console logs in production code**

### Medium Priority
- No E2E tests, minimal unit tests (1 test file found)
- Mixed UI libraries (Ant Design + PrimeReact) — bundle bloat, style conflicts
- Large monolithic components (1000+ line files)
- No lazy loading for AG Grid, CKEditor, ECharts, Mapbox
- Database indexes added reactively — need consolidation
- No CSP headers
- No load/stress testing
- No Grafana/Prometheus
- Documentation gaps (deployment runbook, ERD, sequence diagrams)

### Architecture Risks
- **Cross-tenant data leak risk:** Brand-ID header trust-based, no server-side enforcement in many endpoints
- **Authorization thin:** Many controllers lack `[Authorize]`; brand roles get empty permissions from server
- **Store module is orphan:** Domain entities exist but no controller, service, or application layer
- **Intelligence module is aspirational:** "ASK Cab" AI feature referenced but placeholder-only

---

## 14. DELIVERABLES CREATED

All ticket-spec files in `tickets/`, grouped by module (broker-dashboard/, category-review/, market-overview/, promo-management/, trade-spend/, brand/, talking-points/):

| File | Description |
|------|-------------|
| `CS-1361-new-category-review-functionality.md` | Yearly planning grid, Send to Contacts, checkmark, cell contact assignment, Promotional Calendar toggle. Updated with FR1-FR8 sections. |
| `CS-1296-category-review-calendar-rollup.md` | CSV upload/replace, bulk delete, grid data API, list/table view. Updated with FR1-FR6 sections. |
| `CS-1296-vs-CS-1361-analysis.md` | Analysis resolving ambiguities between the two tickets |
| `CS-1305-broker-dashboard-kpi-cards.md` | Broker Dashboard with KPI cards |
| `CS-1305-broker-dashboard-full-spec.md` | Complete dashboard specification |
| `CS-1072-broker-dashboard-landing-page.md` | Broker logo/branding on landing page |
| `CS-1316-category-review-infinite-scroll.md` | Infinite scroll for Category Review |
| `CS-NEW-broker-dashboard-task-board.md` | **REMOVED** — was Simple 3-column Kanban; contradicted wireframe (no Kanban). Superseded by **BD4** (`BD4-broker-dashboard-pipeline-task-board.md`). |
| `CS-NEW-category-review-email-notification-cr2.md` | Email notification based on Lovable SendToContacts |
| `CS-NEW-category-review-email-notification.md` | Category Review email notifications |
| `CR1-bulk-delete-category-reviews.md` | Bulk delete across pages (renamed from CS-NEW-bulk-delete) |
| `CS-NEW-category-review-page-size.md` | Page size selector (superseded by CS-1316 infinite scroll) |
| `DA1-distributor-apl-infinite-scroll.md` | Infinite scroll for Distributor APL (renamed from CS-NEW) |
| `DA2-distributor-apl-wholesale-cost-validation.md` | Wholesale Case Cost validation mismatch (renamed from CS-NEW) |
| `MO1`-`MO6`-market-overview-*.md (renamed) + `CS-NEW-market-overview-*.md` (MO7-MO9) | Market Overview MO1-MO9: DC edit, search, status hierarchy, store count, multiple stores, multiple brands, require DC, comment append, email notifications |
| `CS-NEW-pm1-submission-button-fix.md` + `PM2`-`PM7`-*.md (renamed) | PM1-PM7: Submission button, export, promo status, pin filters, grid format, multi-month events, dashboard logo |
| `BD1`-`BD4`-broker-dashboard-*.md | Broker Dashboard: BD1 dashboard shell (wireframe), BD2 assign time/person, BD3 filter my tasks/contact, BD4 Pipeline/Task view (Fellow-style, replaces old Kanban) |
| `CS-NEW-broker-dashboard-pipeline.md` | Pipeline integration concept |
| `CS-1424-data-sync-broker-distributor-apl.md` | APL data sync |
| `CS-1403-apl-upload-unfi-upc-adjustment.md` | UNFI UPC truncation fix |

### Wireframe
- `Wireframe/index.html` — Deployed at https://caboodle-broker-dashboard.vercel.app
- `prototypes/Daily Delight Calendar/` — Lovable prototype (SendToContacts, YearlyPlanningTable, infinite scroll)

---

## 15. GLOSSARY

| Term | Meaning |
|------|---------|
| **SKU** | Stock Keeping Unit — unique product variant code |
| **UPC** | Universal Product Code (barcode) |
| **Banner** | A retail brand under a parent retailer (e.g., "Walmart Supercenter") |
| **DC/Distribution Center** | Warehouse where distributor stores products |
| **APL** | Authorized Price List — official distributor prices |
| **EDLP** | Every Day Low Price — permanent price reduction |
| **TPR** | Temporary Price Reduction |
| **Lift** | Extra sales volume from a promotion vs. normal |
| **Planogram** | Shelf arrangement diagram |
| **Slotting Fee** | One-time fee to get product on shelf |
| **Banner SKU** | Product authorized at a specific banner |
| **Unmapped Record** | Raw data that couldn't be auto-matched to known entity |
| **KeHE / UNFI / SPINS** | Three major natural product distributors |
| **Roll-Up** | Aggregating data from lower to higher levels |
| **TSS** | Trade Spend Sandbox |
| **UNFI Independents** | Grouped mom-and-pop stores under a single banner for simplicity |
| **Actualization** | Updating promo projections with real sales data |
| **NotActive** | SkuStatus value — one word, not "Not Active" |
| **IsSubmitted** | Boolean flag on promo events for broker submission |
| **Brokerage** | The broker's organization — scope for data visibility |

---

## 16. JIRA BACKLOG INTELLIGENCE (Live Export — 1,567 tickets)

> **Source:** `data/jira-tickets/` — full live Jira export (CS-1 … CS-1567 + GTMS-*), generated **2026-08-20** from `caboodleservices.atlassian.net`. This supersedes the legacy `data/Jira (3).csv` (130 issues).  
> **Method:** structured metadata + statistics extracted programmatically across all 1,567 files (AI-readable conversion per BA Step 1); individual tickets were not read raw.  
> **Status model:** Open = Backlog / On Hold / In Progress / In Staging / In Production / Reopened / Demo / Ready for Production / Dev Sprints. Closed = Closed / Won't Do / Resolved.

- **Total tickets:** 1,567
- **Created range:** 2023-09-11 → 2026-08-20 (backlog spans ~3 years; actively maintained through today)
- **Open:** ~295 (Backlog 242 + active states) · **Closed / Won't-Do:** 1,208 · **Ambiguous status:** 64
- **By type:** Task 761 · Bug 444 · Sub-task 280 · Story 72 · Epic 10
- **By priority:** High 626 · Highest 440 · Medium 268 · Low 233 (≈68% High/Highest — backlog skews urgent)
- **Top labels:** Front_end 249 · Backend 215 · Admin_App 42
- **Status distribution (top):** Closed 1,111 · Backlog 242 · Won't Do 75 · On Hold 40 · Resolved 22 · In Staging 19 · In Progress 13 · In Production 12 · Reopened 11 · Demo 8
- **Module concentration (title/label keyword heuristic — directional, not exact):** Admin-dominant, then Brand, TradeSpend, CRM, Market Overview, Category Review, Broker Dashboard, Distributor APL.

**Implications for BA:**
1. The backlog is **bug/task-heavy and priority-skewed** — the active client-facing workstreams are Broker Dashboard, Category Review, Market Overview, and Promo Management (see §17).
2. The curated `tickets/` deliverables are a small, **client-reviewed subset (≈23 active tickets)** of this 1,567-ticket universe — the prioritized, spec'd slice, not the whole backlog.
3. Admin is the **largest maintenance surface** (label `Admin_App` 42; admin keyword dominant in open backlog).

---

## 17. CONSOLIDATED CLIENT DECISIONS & OPEN QUESTIONS

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
