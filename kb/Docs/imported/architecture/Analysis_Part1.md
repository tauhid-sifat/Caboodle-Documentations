---
type: Document
title: "Caboodle — Complete Project Reconstruction"
---

# Caboodle — Complete Project Reconstruction

> **Prepared for:** Incoming Business Analyst  
> **Date:** June 28, 2026  
> **Documents analyzed:** (5) Backend Architecture Review, Frontend Architecture Review, Testing Checklist, Backlog by Module (Excel), TSS QA Checklist  
> **Status:** FACT = directly stated in docs; **ASSUMPTION** = inferred from evidence; **CONTRADICTION** = conflicting signals across docs

---

# Section 1: Executive Summary

## What This Product Is

Caboodle is a **data-driven SaaS platform** built for natural product CPG (Consumer Packaged Goods) brands and brokers. It unifies **sales tracking, trade promotion management (TPM), analytics, large-scale data uploads/exports, and collaboration** into a single workspace. (FACT: *"data-driven SaaS built for natural product CPG brands and brokers"* — Backend Architecture Review §0)

## Who the Users Are

- **Primary:** Brand owners/managers, brokers/sub-brokers, sales teams, business teams — all in the natural/CPG industry.
- **Secondary:** Admin/super-admin users within Caboodle; also potentially retailer partners downstream.
- (FACT: *"Brand owners, brokers/sub-brokers, sales team, business team"* — Backend Architecture Review §0)

## What Business Problem It Solves

CPG brands and brokers rely heavily on **Excel/CSV data from multiple distributors**, leading to manual consolidation and limited analytical flexibility. Core workflows such as promotional planning are spreadsheet-based, static, and difficult to evolve or explore. (FACT: Backend Architecture Review §0)

**Key pain points:**
- No central repository for distributor data
- Manual consolidation from KeHE, UNFI, SPINS, etc.
- Promotional planning in static spreadsheets
- Limited ability to run "what-if" scenarios
- No unified view of trade spend effectiveness

## Core Value Proposition

> **Centralize, analyze, and optimize trade spend and sales data across distributors in one configurable, multi-tenant SaaS platform.**

Caboodle replaces fragmented spreadsheets with a structured system that ingests data from multiple distributors, maps it to product/retailer hierarchies, enables promotional planning and sandboxing, and surfaces reports and dashboards — all within strict per-Brand tenant isolation.

## Major Modules

| Module | Purpose |
|--------|---------|
| **Admin** | Roles, permissions, settings, user management, data mapping, CRM data upload |
| **Brand** | Brand entity management, home page, branding |
| **Broker** | Broker/sub-broker management, broker dashboard |
| **CRM** | Distributors, Retailers, Banners, Regions, Contacts, Pipeline (Task Board) |
| **Dashboard** | Summary KPIs, cross-module reads |
| **DataHub** | Centralized data coordination, shared datasets |
| **DataUpload** | Bulk ingestion, mapping, validation (import wizard) |
| **FileRepository** | Document/file management using S3 |
| **ProductSpecs** | Product specifications (categories, products, pricing) |
| **Report** | 8+ report types: Market Activities, Category Review, Retail Reports, Sales Tracker, Trade Spend Rollup, Monthly Report, SPINS, Distributor Report; plus new Banner-to-DC report |
| **Store** | Store domain elements |
| **TradeSpend** | Core trade promotions and planning |
| **TradeSpendSandbox** | Experimental/training trade promo flows (TSS) |
| **PromotionalCalendar** | Calendar view of promotions |

FACT: Module catalog from Backend Architecture Review §4.1; extended by Backlog spreadsheet module breakdown.

## Current Maturity

**Assessment: Late-stage startup / early scale-up.** The product has paying customers, a live production environment, a structured backlog of 225+ tickets, and systematic QA processes. However, it shows several signs of technical debt consistent with a product that was built quickly to prove market fit:

- .NET 6 (end of support) — framework upgrade deferred
- Single-instance production deployment (no ALB/ASG)
- Caching infrastructure ready but **not activated**
- Secrets stored in config files
- Unit test coverage described as "in an early-stage relationship"
- Limited load/stress testing
- **ASSUMPTION:** The "new-client onboarding" referenced in the backlog suggests the product is about to scale to more tenants.

## Overall Architecture

```
┌─────────────────────────────────────────────┐
│            FRONTEND (Next.js 13.4)          │
│  NextAuth · Zustand · TanStack Query        │
│  Ant Design + PrimeReact · Tailwind CSS      │
├─────────────────────────────────────────────┤
│            HTTPS / JWT (REST API)            │
├─────────────────────────────────────────────┤
│         BACKEND (.NET 6 → .NET 9 target)     │
│  Clean Architecture + CQRS (MediatR)         │
│  Modular Monolith                             │
├─────────────────────────────────────────────┤
│  PostgreSQL (RDS) · S3 · Redis (inactive)   │
│  Hangfire · SES · Serilog → Seq             │
└─────────────────────────────────────────────┘
```

## Current Implementation Status

- **CRM module:** Largely complete (Distributors, Retailers, Banner SKU, Regions, Contacts, Pipeline). Retailers sub-module still in testing gap.
- **Product Specs:** Done — categories, products, pricing CRUD fully tested.
- **Trade Spend Sandbox (TSS):** Core functionality complete; extensive QA done. Multiple known bugs in EDLP events, fee calculations, data retention between steps.
- **Broker Dashboard:** In active development. Market Overview, Promotional Management, Category Review, Distributor APL — many backlog items.
- **Reports:** 8 report types exist or are in progress. Distributor Report has 16 backlog tickets — highest churn area.
- **Admin/Data Mapping:** High activity — 19 tickets. Data Mapping Expansion is a current initiative.
- **User Management:** 17 tickets — invitation flow bugs, role assignment issues.
- **Platform/Cross-Cutting:** 28 tickets — caching, email reliability, DB indexing, monitoring, upgrade.

---

# Section 2: Product Overview

## Business Domain
Consumer Packaged Goods (CPG) — specifically the **natural/organic products** segment. The platform operates at the intersection of **Trade Promotion Management (TPM)** and **Sales Data Analytics**.

## Industry
Natural/Organic CPG manufacturing and brokerage. Key distributor data sources mentioned: **KeHE, UNFI, SPINS** — these are major natural product distributors in North America.

**ASSUMPTION:** The product targets the US market given references to US regions/states, AWS us-west-1 (California), and US-centric distributors.

## Primary Users
| Role | Description |
|------|-------------|
| **Brand Owner** | CPG brand company that manufactures products. Owns product specs, creates promotions in TSS, approves promotions. |
| **Brand Sub-user** | Team members within a brand company; limited permissions relative to Brand Owner. |
| **Broker** | Sales broker representing multiple brands to retailers. Manages broker dashboard, category reviews, APL. |
| **Sub-Broker** | Works under a broker; more limited access. |

## Secondary Users
| Role | Description |
|------|-------------|
| **Admin** | Caboodle system administrator — user management, data uploads, system configuration. |
| **Read-only users** | Limited to viewing data without editing — referenced in TSS QA. |

## User Goals
- **Brand Owner:** Plan trade promotions, forecast spend, analyze ROI, manage product specs, upload distributor data.
- **Broker:** Manage market overview, promotional management, category reviews, distributor APL (Authorized Product List).
- **Admin:** Onboard new brands, manage users, map incoming data, upload CRM data, ensure system health.

## Pain Points Being Solved
1. **Spreadsheet hell:** Distributors send data in different formats → Caboodle provides unified ingestion and mapping.
2. **No "what-if" capability:** Trade spend sandbox allows experimentation before committing budget.
3. **Siloed data:** Brokers and brands operate in the same system with role-appropriate views.
4. **Manual reporting:** 8+ built-in reports replace manual Excel report building.
5. **Distributor fragmentation:** KeHE, UNFI, SPINS data normalized into one system.
6. **Promotional calendar blindness:** Calendar view across brands, retailers, and time periods.

---

# Section 3: System Architecture

## Frontend

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 13.4.12 | App Router, route groups for roles: `(auth)`, `(brand)`, `(broker)` |
| TypeScript | 5.1.6 | Strict mode **disabled** — significant weakness |
| React | 19.1.0 | |
| Zustand | 4.4.1 | Global state (brand, role) with persistence |
| TanStack React Query | 4.33.0 | Server state, caching, invalidation |
| NextAuth | 4.23.0 | JWT with refresh tokens |
| Ant Design | 5.23.2 | UI library |
| PrimeReact | 10.9.2 | Second UI library — causes conflicts |
| Tailwind CSS | 3.3.3 | Styling |
| Axios | 1.4.0 | HTTP client |

**Architecture Pattern:** Feature-based routing with Next.js App Router using route groups.

**Application Flow (from Frontend Architecture Review §9.1):**
```
RootLayout → Providers → AppContainer → Sidebar/Header → Page Content
```

**State Management:**
```
Zustand (persisted) → global brand, role
TanStack Query → server/cache state
```

**Key Weaknesses** (CONTRADICTION: docs call architecture strengths good but then identify major issues):
- TypeScript strict mode disabled — null checks, implicit any bypassed
- Duplicate Axios instances (`httpClient` and `axiosInstanceFromClient`)
- Mixed UI libraries (Ant Design + PrimeReact) — inconsistency, bundle bloat
- Large monolithic components: `FileExplorer.tsx` ~870 lines, `TradeSpendDetails.tsx` ~1001 lines
- No error boundary (global)
- Token stored in localStorage via Zustand persist — XSS risk
- Image domains set to `"*"` in `next.config.js`
- Console logs in production code
- No E2E tests, only 1 test file (`WorkspaceContainer.test.tsx`)
- No lazy loading for AG Grid, CKEditor, ECharts, Mapbox
- **Maintainability Score: 6.5/10** (from review §8.3)

## Backend

| Technology | Version | Notes |
|------------|---------|-------|
| .NET | 6 (targeting 9) | End of support — upgrade deferred |
| Architecture | Clean Architecture + CQRS | Modular monolith |
| Pattern | MediatR | Commands/Queries/Handlers |
| ORM | EF Core (writes), Dapper (reads) | |
| Validation | FluentValidation | |
| Mapping | AutoMapper | |
| Background jobs | Hangfire | PostgreSQL storage |
| API | REST, Swagger/OpenAPI | |
| Logging | Serilog → Seq | |

**Layer Dependency Flow:**
```
Domain ← Application ← Infrastructure ← API
```

**Module Pattern (per module):**
```
Commands/Queries → Handlers → DTOs → Specifications → Validation → Domain Entities/Value Objects → Infrastructure Implementations
```

**Pipeline Behaviors (MediatR):**
```
Request → Validation Behavior → Logging Behavior → Transaction Behavior → Handler → Response
Exception Middleware → Consistent API Errors
```

**Data Access Strategy:**
- EF Core for transactional writes and CRUD
- Dapper for complex/high-volume reads
- Repository + Specification pattern to encapsulate queries

## Database

- **Engine:** PostgreSQL (AWS RDS)
- **Tenancy:** Single logical DB with strict data isolation per Brand (tenant)
- **Migrations:** EF Core migrations in `caboodle/src/Database/Migrator`
- **Backups:** Automated (RDS)
- **Scaling plan:** Extend indexing/partitioning, read replicas, connection pooling

**Key tables** (from references to DB diagram): BannerSKU, Promotional Planning, Market Overview, Stores, Products, Pricing, Trade Spend, Events, etc.

## API Communication

```
Browser → HTTPS → AWS EC2 (port 8060→5060) → ASP.NET Core → MediatR Pipeline → EF Core/Dapper → PostgreSQL
                                                                     → S3 (files)
                                                                     → SES (email)
```

## Authentication & Authorization
- **AuthN:** JWT-based with refresh tokens (NextAuth frontend, ASP.NET backend)
- **AuthZ:** RBAC roles — Admin, Broker, Sub-Broker, Brand Owner, Brand Sub-user
- **Tenant isolation:** Data scoped by Brand (DB-level)
- **Planned:** Google login

## Caching
- **Redis:** Infrastructure ready, **not activated**
- **In-memory:** Available but unused
- **Plan:** Activate with TTLs, invalidate on CUD operations
- **Frontend caching:** React Query's built-in cache active

## Storage
- **S3:** Documents, files, uploads (private buckets)
- **Local FS:** Development only
- **Lifecycle policies:** Recommended but not confirmed implemented

## Deployment

**CONTRADICTION:** The roadmap shows a "Jan 15, 2025" date (Backend Architecture Review §19) but other dates suggest this is likely "Jan 15, 2026" given the email service target date and the fact tickets reference June 2026. I believe the 2025 was a typo.

| Environment | Region | Components |
|-------------|--------|------------|
| Production | AWS us-west-1 | EC2 Docker (port 8060→5060), RDS PostgreSQL, S3, SES (ap-southeast-1), Seq |
| Staging | AWS ap-northeast-1 | EC2 Docker, RDS PostgreSQL |
| Local | docker-compose | Postgres, Redis, pgAdmin, Seq |

**CI/CD:** Bitbucket Pipelines → Docker images → ECR → SSH deploy to EC2; branch-based (staging/master).

## External Integrations

| Integration | Status | Purpose |
|-------------|--------|---------|
| KeHE | Active (in reports) | Distributor data source |
| UNFI | Active (crawler service) | Distributor data source |
| SPINS | Active | Retail measurement data |
| SES | Active | Email (being upgraded) |
| S3 | Active | File storage |
| Seq | Active | Structured logging |
| Discord | Active | Critical alerts |
| Pulsetic | Active | Uptime monitoring |
| Tableau | **Not Doing** (CS-1221) | Was considered, rejected |
| Crisp | In progress (CS-1214) | Data scraping integration |
| Google Login | Planned | Social auth |
| Grafana/Prometheus | Planned | Metrics/monitoring |

---

# Section 4: Module Breakdown

## 4.1 Admin

- **Purpose:** System administration, configuration, user management, data management.
- **Business Objective:** Enable Caboodle admins to configure the platform, manage users, upload CRM data, and map incoming data from distributors.
- **Features:** Roles/permissions, user management (invite/edit/roles), CRM data upload (Stores, Banners, SKUs), data mapping (unmapped records, resolution), settings, activity log.
- **Sub-modules:** CRM Data Upload, Data Mapping, User Management, Admin General.
- **Status:** 67 tickets — highest volume area. Data Mapping Expansion is a current initiative. CRM Data Upload has known bugs (store name editing, duplicate removal, error messaging). User Management has invite flow problems (role labels, resend, brand assignment).
- **Missing Functionality:** Module on/off (CS-146/147 — in backlog), admin ability to access all environments without login credentials (CS-1368).

## 4.2 Brand

- **Purpose:** Brand entity and home page management.
- **Features:** Brand CRUD, brand home page, brand logo/branding.
- **Known Issues:** Brand name uniqueness not enforced (CS-1045), description truncation (CS-1046), export not working (CS-1050).
- **Tickets:** Mostly Admin-related crossover tickets.

## 4.3 Broker

- **Purpose:** Broker/sub-broker management and broker-facing dashboard.
- **Business Objective:** Enable brokers to manage their brand portfolio, view market overview, run promotional management, category reviews, and distributor APL.
- **Sub-modules:** Market Overview, Promotional Management, Category Review, Distributor APL, Files, Broker Dashboard General.
- **Status:** 33 tickets. Dashboard UI redesign needed (CS-1305, CS-1327). Landing page needs Broker logo (CS-1072). Market Overview filter too limited (CS-1318). Promotional Management export/approval flow needs improvement (CS-1328). Category Review has 11 tickets — heavy active development.
- **Missing Functionality:** Ask Caboodle AI feature (CS-1362), pipeline/task board in broker view (CS-1425).

## 4.4 CRM

- **Purpose:** Core business entity management — Distributors, Retailers, Banners, Regions, Contacts, Pipeline (Task Board).
- **Business Objective:** Centralized management of the retail/distribution hierarchy.
- **Entities:** Distributor → Delivery Methods → Banners → Banner SKUs → Banner Activities → Banner Rules. Retailer → Banners. Regions (with map integration). Contacts. Pipeline (Kanban board).
- **Testing Status:** Distributors tested (Done). Retailers **not tested** (empty status). Regions tested. Contacts tested. Pipeline tested.
- **Known Issues:** Banner unlink restriction tied to promotions (CS-1225), retailer search returning irrelevant results (CS-992), pipeline formatting (CS-1348), missing delete options in sub-modules (CS-1059).

## 4.5 Product Specs

- **Purpose:** Product specification management — categories, products, and pricing.
- **Business Objective:** Single source of truth for product data fed into trade spend and reports.
- **Sub-modules:** Categories, Products, Pricing.
- **Testing Status:** All Done (tested).
- **Features:** CRUD, upload, export, UPC uniqueness, list/grid view, sort/filter, pagination, pricing by distributor with date ranges.
- **Backlog:** Tab reorganization (CS-1386), UPC code error (CS-1400), price change not flowing to trade spend (CS-478).
- **Missing Functionality:** Shelf life text field (CS-280 — Don't Do), Manufacturer Discontinued checkbox (CS-376 — Complete?).

## 4.6 Trade Spend Sandbox (TSS)

- **Purpose:** Experimental/training trade promotion planning. "Sandbox" implies safe iteration before committing real budget.
- **Business Objective:** Allow brand users to model promotional scenarios, calculate trade spend, and push approved promotions to the live Promotional Calendar.
- **Features:** 4-step promo creation wizard: Step 1 (Retailers & Banners) → Step 2 (Products) → Step 3 (Events) → Step 4 (Metrics). Promo listing, search, filters, pagination, copy, delete (single/batch), push to approved, promo details page with charts, fee distribution logic.
- **Event Types:** Normal (specific date range), EDLP (Jan-Dec, Everyday Low Price).
- **Metrics:** Ad fees, TPR fees, everyday allowance, fee distribution (equally per product within a banner).
- **Testing Status:** Extensive QA checklist exists (517-line document). 37 tickets in backlog — highest per-module count.
- **Known Bugs:** EDLP creation errors, everyday allowance data retention, fee calculation issues, stores field accepting negatives, multiple events fee splitting, promo filter issues.
- **Missing Functionality:** Coupon option (CS-1196), add SKU to existing event across multiple events (CS-1197), budget threshold configurability (CS-1351), actual lift calculation (CS-1354 — placeholder).

## 4.7 Promotional Calendar

- **Purpose:** Calendar view of approved/sandbox promotions across brands, retailers, and months.
- **Features:** Promo at-a-glance, export, submission, filters, notes.
- **Known Issues:** EDLP events only show in January (should span all months), pagination.
- **Testing Status:** Not tested (empty status in testing checklist).

## 4.8 Reports

- **Purpose:** Reporting and analytics — 8+ report types covering market activities, category review, retail, sales tracking, trade spend, monthly, SPINS, distributor.
- **Business Objective:** Replace manual Excel reporting with automated, filterable, exportable reports.
- **Report Types (from backlog):**

| Report | Tickets | Status Notes |
|--------|---------|-------------|
| Broker Market Activities | 1 | Throws error (CS-1203) |
| Category Review Report | 2 | Data isolation issues across brands (CS-1291) |
| Retail Reports | 4 | Filter not working (CS-1204), store insight (CS-1162) |
| Sales Tracker | 1 | For prospects (CS-1306) |
| Trade Spend Rollup | 5 | Column additions, hyperlinks, gross unit calc |
| Monthly Report | 7 | Calculations, layout, YOY, category filter, import actuals |
| SPINS | 3 | Legacy data removal, accept all measures |
| Distributor Report | 16 | **Highest churn** — velocity calculations, KEHE/UNFI pricing, new filter, crawler service, auto flags |
| Banner-to-DC (New) | 1 | Brand new report |

## 4.9 Dashboard

- **Purpose:** Summary KPIs, cross-module data aggregation.
- **Status:** Not much detail in docs. Referenced as "Dashboard" module and "Home Page" in backlog notes.

## 4.10 File Repository

- **Purpose:** Document and file management using S3.
- **Known Issues:** Download errors (CS-1159, CS-1179), file tree display issues (CS-658).

---

# Section 5: User Roles

## 5.1 Admin (Super Admin)

- **Permissions:** Full system access. User management (invite, roles, brand assignment). CRM data upload. Data mapping configuration. Settings. Module on/off. Access all brand environments.
- **Responsibilities:** System configuration, tenant onboarding, data integrity, monitoring.
- **Restrictions:** None documented.
- **Workflow:** Login → Admin panel → User management / Data upload / Data Mapping / Settings.

## 5.2 Brand Owner

- **Permissions:** Full access to own brand's data. Product Specs management. Trade Spend Sandbox (create/edit/push). Reports (brand-scoped). CRM (brand-scoped). Pipeline.
- **Responsibilities:** Product data management, promotional planning, trade spend budget management, report analysis.
- **Restrictions:** Cannot access other brands' data. Tenant isolation enforced at DB level.
- **Workflow:** Login → Brand Dashboard → Product Specs / TSS / Reports / CRM.

## 5.3 Brand Sub-User

- **Permissions:** Limited subset of Brand Owner permissions. Exact boundaries not documented.
- **Restrictions:** May be read-only or limited to specific modules (ASSUMPTION based on "Sub-user" naming).
- **Workflow:** Same as Brand Owner but with feature restrictions.

## 5.4 Broker

- **Permissions:** Access to Broker Dashboard. Market Overview. Promotional Management (brand-approved promos). Category Review. Distributor APL. Files.
- **Responsibilities:** Market analysis, managing promotions on behalf of brands, category reviews, distributor price lists.
- **Restrictions:** Cannot create promotions (only manage approved ones). Only sees assigned retailers.
- **Workflow:** Login → Broker Dashboard → Market Overview / Promotional Management / Category Review / APL / Files.

## 5.5 Sub-Broker

- **Permissions:** Limited subset of Broker permissions. Exact boundaries not documented but implied by naming.
- **Restrictions:** More limited than Broker.

## 5.6 Read-Only User

- **Permissions:** View data only.
- **Restrictions:** All edit/delete/create actions hidden (TSS QA TC-L4).
- **Workflow:** Login → View reports, dashboards, promotions (no action buttons).

---

# Section 6: End-to-End User Journeys

## 6.1 Trade Spend Sandbox — Create Promotion

```
User (Brand Owner) → Product Specs → TSS → Step 1-4 → Push to Approved → Promotional Calendar

┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. User navigates to TSS → clicks "Add New Promotion"                          │
│ 2. System: Opens promo creation wizard → validates title input                  │
│ 3. User enters promo title → clicks Next                                       │
│ 4. System: Step 1 loads → queries user's assigned retailers                     │
│ 5. User: Selects retailer(s) → selects banner(s)                               │
│ 6. System: Step 2 loads → queries products for selected banners                 │
│ 7. User: Sets average unit velocity, stores per product → bulk edit or individual│
│ 8. System: Validates store max per banner → Step 3 loads                       │
│ 9. User: Creates Normal or EDLP events                                          │
│ 10. System: Auto-sets end date to last day of month for Normal events          │
│ 11. User: Step 4 → configures metrics (ad fees, TPR fees, everyday allowance) │
│ 12. System: Distributes fees equally per product within each banner            │
│ 13. User: Submits promo → system saves as Draft                                │
│ 14. User: Returns to list → selects promo → "Push to Approved"                │
│ 15. System: Updates status → pushes to Broker Promotional Management          │
│ 16. Broker: Views in Promotional Calendar + Promotional Management            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Error Handling:**
- Title validation (required, max length, invalid characters)
- Step-level validation (must select banners, must configure products)
- Store max exceeded → blocked with message
- API failure → error message shown, promo not created
- Duplicate prevention during multi-click (button disabled)

**Edge Cases:**
- Empty retailer list → "no retailers" message
- Product status changes between draft and resume
- Category deletion after draft → removed categories not shown
- Internet drop during draft → error shown, no silent data loss
- Multi-tab editing → latest save wins (no corruption guarantee)

## 6.2 Broker — Promotional Management

```
Broker → Broker Dashboard → Promotional Management

1. Broker logs in → Broker Dashboard loads (role-based)
2. User navigates to Promotional Management
3. System: Queries brand-approved promotions for broker's brands
4. User: Filters by year, brand, status, retailer
5. User: Reviews promotions, updates status (Active/Cancelled/Pending/etc.)
6. User: Exports filtered data (currently buggy — CS-1367)
7. User: Submits promotions to brand for approval
```

**Known Issues:**
- Export data doesn't match filter data (CS-1367 — "Does not work at all")
- Submission button non-functional (STORY 1328 notes)

## 6.3 Data Mapping — Upload Flow

```
Admin/User → Admin → Data Upload → Mapping

1. User: Uploads CSV/Excel file via CRM Data Upload
2. System: Validates file format → parses → identifies unmapped records
3. System: Shows mapping screen → user matches incoming fields to system fields
4. User: Maps fields → resolves conflicts
5. System: Validates → ingests → updates CRM entities
6. User: Reviews failed records → re-resolves
```

**Known Issues:**
- Error when updating store from Stores section (CS-1364)
- Banner SKU upload failed records not matching banners (CS-1384)
- No error message when uploading blank file (CS-1037)
- Store field list missing State (CS-1418)

## 6.4 Admin — User Invitation Flow

```
Admin → Admin Panel → User Management → Invite User

1. Admin clicks "Invite User"
2. System: Shows role selection modal (Broker, Sub-Broker, Brand Owner, etc.)
3. Admin: Selects role → assigns brand(s) → enters email
4. System: Sends invitation email via SES
5. User: Receives email → clicks link → registers (sets password)
6. System: Validates token → activates user → assigns role/permissions
```

**Known Bugs:**
- Email says "Sub-Broker" instead of "Broker" (CS-1290)
- Resend invitation button non-functional (CS-1377)
- Registration link redirects to login instead of signup (CS-1379)
- "Unknown" user type in invited users list (CS-1393)
- Phone number field accepts invalid input (CS-1395)

---

# Section 7: Feature Inventory

| Feature | Description | Business Value | Priority | Status | Dependencies | Testing Status | Module |
|---------|-------------|---------------|----------|--------|-------------|----------------|--------|
| Login/Auth | JWT-based auth with refresh | Critical | High | Done | NextAuth, JWT | Not marked done | Auth |
| Product CRUD | Categories, Products, Pricing | High | High | Done | None | Done | Product Specs |
| Product Upload/Export | Bulk upload and export | High | High | Done | Validators | Done | Product Specs |
| Distributor CRUD | Add/edit/delete distributors | High | High | Done | None | Done | CRM |
| Retailer CRUD | Retailer management | High | High | Done | None | **Empty** | CRM |
| Banner SKU | Banner-product linkage | High | High | Done | Products | Done | CRM |
| Contacts CRUD | Contact management | Medium | Medium | Done | None | Done | CRM |
| Pipeline (Task Board) | Kanban-style task board | Medium | Medium | Done | CRM | Done | CRM |
| TSS Promo Wizard | 4-step promo creation | Critical | High | Done | Products, CRM | Extensive | TSS |
| TSS Approve/Push | Push sandbox→approved | Critical | High | Done | TSS | Partial | TSS |
| TSS Copy Promo | Duplicate existing promo | Medium | Medium | Done | TSS | Tested | TSS |
| Promotional Calendar | Calendar promo view | High | High | Partial | TSS | **Not tested** | PromoCalendar |
| Market Overview | Broker dashboard view | High | High | In Dev | CRM | Not tested | Broker |
| Category Review | Broker category analysis | High | High | In Dev | Products | Not tested | Broker |
| Distributor APL | Authorized product lists | Medium | Medium | In Dev | Products | Not tested | Broker |
| Promo Management | Broker promo approval flow | High | High | Buggy | TSS | Not tested | Broker |
| Reports (8+ types) | Analytics reporting | Critical | High | Mixed | CRM, Products | Not tested | Reports |
| Data Upload | CRM data ingestion | Critical | High | In Dev | Data Mapping | Not tested | Admin |
| Data Mapping | Map incoming data to system | Critical | High | In Dev | - | Not tested | Admin |
| User Management | Invite/roles/brands | Critical | High | Buggy | Auth | Not tested | Admin |
| File Repository | Document management | Medium | Medium | Buggy | S3 | Not tested | Files |
| Dashboard | Summary KPIs | Medium | Medium | Unknown | All modules | None visible | Dashboard |
| Ask Caboodle (AI) | ML/AI assistant | Future | Low | Not started | ML/AI | None | Broker/Platform |
| Margin Calculator | POP-out calculator | Low | Low | Not started | - | None | Platform |
| Tableau Integration | External BI | N/A | N/A | **Not Doing** | Tableau | None | Platform |

---

# Section 8: Backlog Analysis

## Summary Statistics (from Excel)
- **Total tickets:** 225 open (Backlog / In Progress / In Staging / Ready for Production / Reopened)
- **Per area:** Admin (67), Brand (56), Reports (41), Broker Dashboard (33), Platform/Cross-Cutting (28)

## Completed Features
- Product Specs (Categories, Products, Pricing) — fully tested Done
- CRM (Distributors, Contacts, Pipeline, Regions) — tested Done
- TSS core promo creation wizard — tested Done
- Basic auth/login flow

## In Progress
- **Data Mapping Expansion** — major initiative
- **Upload/Download Wizard** — 1GB+ handling, unified import/export
- **Email Service Upgrade** — target Jan 15, 2026
- Category Review enhancements (11 tickets)
- Distributor Report fixes (16 tickets)
- TSS bug fixes (ongoing)

## Blocked / High-Risk
- CS-1368: Admin needs cross-environment access — security implications
- CS-1221: Tableau integration — marked "Not Doing"
- CS-1214: Crisp integration — data scraping, legal/data risks
- CS-478: Price changes not flowing from Product Specs to TSS — could corrupt trade spend calculations

## Not Started
- Ask Caboodle (AI/ML) — placeholder tickets only
- Margin Calculator
- Banner-to-DC Reporting (new report)
- Framework upgrade (.NET 6 → 9) — deferred past current initiatives
- Caching activation
- Secrets Manager migration
- Load/stress testing
- Grafana/Prometheus deployment

## Technical Debt
1. .NET 6 end of support — security risk
2. Caching inactive — unnecessary DB load
3. Secrets in config — security risk
4. Unit test coverage "in an early-stage relationship"
5. TypeScript strict mode disabled
6. Duplicate Axios instances
7. Image domain wildcard (CSP violation)
8. Token in localStorage (XSS risk)
9. Large monolithic components (1000+ lines)
10. No error boundary
11. Console logs in production
12. Database indexes added reactively — need consolidation
13. Mixed UI libraries (Ant Design + PrimeReact)

## Poorly Written Stories / Missing Clarity
- CS-1354: "Discussion for providing Actual Lift (Placeholder Ticket)" — not actionable
- CS-1192: "bugs relates to EDLP" — vague, no specific description
- CS-1236: "TSS- New bugs" — generic, multiple bugs in one ticket
- CS-1240: "Trade Spend Calculations" — no specific requirement
- Many tickets have missing descriptions or use "See description" referencing external context

## Acceptance Criteria Quality
- **TSS QA document (517 lines) is EXCELLENT quality** — detailed test cases, edge cases, validation focus
- **Jira tickets are MIXED** — some have clear requirements, others are vague placeholders
- **No standardized AC format** observed across backlog

## Priority Conflicts
- Highest/High priority items with "Provide Update" or "Discuss" status indicate stalled decision-making
- CS-1368 (Admin cross-environment access) is High but has significant security implications that need product owner input
- Email service upgrade is listed as target Jan 15, 2026 but still "In Progress" in June 2026 — possible delay

## Dependency Conflicts
- CS-1090/1092: "Editing and Pushing from TSS will update corresponding Promo Planning" — touches TSS, Promotional Calendar, and Broker Dashboard. Cross-module dependency needs careful coordination.
- Data Mapping Expansion blocks CRM Data Upload improvements
- TSS bug fixes depend on Product Specs price data integrity
