# Caboodle Project — Permanent Knowledge Base

> **Generated:** 2026-07-10
> **Purpose:** Foundational memory for LLM agents working on this project.
> **Source docs:** All files in `D:\My Code\Caboodle-Documentations\` (excluding `deliverables/`)

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

### Deployment
| Environment | Region | Details |
|-------------|--------|---------|
| Production | AWS us-west-1 | EC2 Docker (8060→5060), RDS, S3, SES (ap-southeast-1), Seq |
| Staging | AWS ap-northeast-1 | EC2 Docker, RDS |
| Local | docker-compose | PostgreSQL, Redis (ready), pgAdmin, Seq |

**CI/CD:** Bitbucket Pipelines → Docker → ECR → SSH deploy to EC2 (branch-based: staging/master).
**Single-instance production** — no ALB/ASG, no high availability.

### External Integrations
- KeHE (distributor data)
- UNFI (distributor data, crawler service)
- SPINS (retail measurement)
- AWS SES (email)
- AWS S3 (files)
- Seq (logging)
- Discord (critical alerts)
- Pulsetic (uptime monitoring)
- **Planned:** Google login, Grafana/Prometheus, AWS Secrets Manager

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
| **Broker** | Broker/sub-broker management, broker dashboard (Market Overview, Promo Management, Category Review, Distributor APL) | Active dev — 33 tickets |
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
- Step 4: Configure metrics (ad fees, TPR, everyday allowance) — fees distributed equally per product within banner
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

---

## 7. KNOWN TECHNICAL DEBT & RISKS

### High Priority
1. **.NET 6 EOL** — no security patches, upgrade to .NET 9 deferred
2. **TypeScript `strict: false`** — bypasses null checks, implicit any
3. **Caching inactive** — Redis infra ready but off, unnecessary DB load
4. **Secrets in config** — not using AWS Secrets Manager (planned)
5. **Single-instance production** — no HA, EC2 failure = downtime
6. **Image domain wildcard** `"*"` in `next.config.js` — security risk
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
- **Frontend `Caboddle Admin Web`:** Separate Next.js app for admin — verify sync before dual changes
- Several features throw `NotImplementedException` (e.g., product copy, export, some report features)

---

## 8. TWO FRONTEND APPLICATIONS

1. **Caboodle New Web** — main brand/broker app
2. **Caboddle Admin Web** — admin-only app (separate Next.js project)

**Critical:** Changes to API contracts, auth, or shared logic must verify both apps are updated. The two apps share a backend API surface.

---

## 9. KEY FILES & LOCATIONS

| File/Path | Purpose |
|-----------|---------|
| `BUSINESS.md` | CPG industry overview, business flows, glossary |
| `Caboodle Architecture Review [Backend].md` | Full backend analysis (modules, stack, risks) |
| `Frontend Architectural Review Summary (Caboodle).docx.md` | Frontend audit (tech debt, performance, security) |
| `Caboodle_Product_Reconstruction_Handover.md` | BA handover — comprehensive product guide |
| `Analysis_Part1.md` | Detailed module breakdown, backlog analysis, user journeys |
| `Caboodle Testing Checklist.md` | Manual QA testing status by module/sub-module |
| `Caboodle_Backlog_by_Module.xlsx` | 225+ Jira tickets by module |
| `TSS Feature – QA Test Checklist.md` | Detailed TSS test cases (517 lines) |
| `Jira (3).csv` | Jira export |
| `deliverables/` | Deliverable CS tickets (Broker dashboard, reports, etc.) |

---

## 10. KEY PEOPLE / TEAM DYNAMICS (from meeting transcripts)

- **CW (Christina?):** Product owner/business stakeholder — drives requirements, tests features, reports bugs
- **Tahi:** Developer working on broker dashboard features
- **Ifty/Ify:** Developer/architect — created initial status hierarchy
- **Bejoy:** Developer — implemented status hierarchy rules
- **KA:** Team member involved in store list discussions
- **Fifty:** Team member mentioned in ticket context

---

## 11. GLOSSARY

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
| **Actualization** | Updating promo projections with real sales data (lift, velocity, store count) |
