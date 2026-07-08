# Caboodle — Repository Map

> Audience: Business Analyst. This is the "where does everything live and what exists" map, grounded in the actual code (not prior docs). Two repositories make up the platform.

## The two repositories

| Repo | Folder | Technology | What it is |
|---|---|---|---|
| **Backend** | `caboodle.backend` | .NET (C#), modular monolith, Clean Architecture + CQRS/MediatR, PostgreSQL, EF Core + Dapper | The API and all business logic |
| **Frontend** | `caboodle.web` | Next.js 14 (App Router), React 18, TypeScript | The web UI for brands and brokers |

(A separate `caboodle.admin` frontend also exists on disk but is out of scope for this set.)

## Backend modules (verified from `caboodle.sln`)

The backend is organized into feature **modules**. Each module normally has a **Domain** project (business entities) and an **Application** project (commands, queries, validators, handlers). Their HTTP endpoints live centrally in the **API host** (`caboodle/src/Hosts/API/Controllers/`). Shared plumbing lives in **BuildingBlocks** (Core: Domain/Application/Shared; plus Infrastructure) and **Database/Migrator**.

| Module | Domain | Application | Controller(s) | BA doc |
|---|---|---|---|---|
| **CRM** | ✅ | ✅ | Distributors, Retailers, Contacts, Regions, DistributionCenter, Stores, Banners, PipeLines | [crm-core](modules/crm-core.md), [crm-banners-pipeline](modules/crm-banners-pipeline.md) |
| **ProductSpecs** | ✅ | ✅ | Categories, ProductSpecs, PriceLists | [product-specs](modules/product-specs.md) |
| **TradeSpend** | ✅ | ✅ | TradeSpends | [trade-spend](modules/trade-spend.md) |
| **TradeSpendSandbox** | ✅ | ✅ | TradeSpendsSandbox | [trade-spend-sandbox](modules/trade-spend-sandbox.md) |
| **DataUpload** | ✅ | ✅ | DataMappings, MasterDataUpload, UNFI, KeHe, SPINS, DistributorSalesReports | [data-upload](modules/data-upload.md) |
| **DataHub** | ✅ | ✅ | DataHub, CredentialManager, EntityResolution, Export | [data-hub](modules/data-hub.md) |
| **Brand** | ✅ | ✅ | Brands | [brand](modules/brand.md) |
| **Broker** | ✅ | ✅ | Brokers, MarketOverviews (+ SubUsers) | [broker](modules/broker.md) |
| **Intelligence** | ✅ | ✅ | IntelligenceChat | [intelligence](modules/intelligence.md) |
| **FileRepository** | ✅ | ✅ | Directory, Files | [file-report-dashboard](modules/file-report-dashboard.md) |
| **Report** | ❌ | ✅ | Reports | [file-report-dashboard](modules/file-report-dashboard.md) |
| **Dashboard** | ❌ | ✅ | Dashboard | [file-report-dashboard](modules/file-report-dashboard.md) |
| **Admin** | ❌ | ✅ | Admin (+ Identity: Auth, Users, Roles; Registration; Profile; SubUsers) | [admin-identity](modules/admin-identity.md) |
| **Store** | ✅ | ❌ | *(none)* | [admin-identity](modules/admin-identity.md) |
| **Shared** | — | Application + Infrastructure | *(cross-cutting services: import jobs, data-hub service, file storage)* | referenced throughout |

### Structural oddities worth a BA's attention

- **`Store` has only a Domain project** — no Application layer and no controller. The Store *entity* is used by CRM (there is a `StoresController` under the CRM folder and Store logic in CRM.Application), but the standalone Store module looks **scaffolded/incomplete**. (Confirmed in [admin-identity](modules/admin-identity.md).)
- **`Admin`, `Dashboard`, `Report` have no Domain project** — they are read/orchestration-only modules built on other modules' data.
- **`Intelligence` exists but is not in most prior documentation's module list** — it is the "Ask Caboodle" AI feature. See [intelligence](modules/intelligence.md) for how much of it is actually built.
- **Duplicate / backup / typo project files** exist and are build-artifact noise, not real modules: `Application - Backup.csproj`, `Domain - Backup.csproj`, `Infrastructure - Backup.csproj`, `API - Backup.csproj`, a mis-typed `Modules.Brands.Application.csproj` (note the extra "s") beside the real `Modules.Brand.Application.csproj`, and a stray `ProductSpec.csproj`.

## Frontend route groups (verified from `src/app/`)

Next.js "route groups" (folders in parentheses) organize screens by audience without changing the URL.

| Route group | Serves | Contains |
|---|---|---|
| `(auth)` | Everyone (pre-login) | login, signup, forgot-password, reset-password, verify-email |
| `(brand)/[brandID]/…` | **Brand owners & brand sub-users** | `(crm)` (banners, contacts, distributors, pipeline, regions, retailers), `(data upload)` (unfi, kehe, spins, distributor-sales-report, cross-tab-explorer), `(product-specs)` (categories, pricing, products), `(promo)` (promotional-calendar, trade-spend, promo-calendar), `(report)` (banner, product, retail, monthly, sales-tracker, apl-report, apl-activity, brand-market-overview, category-review), `dashboard`, `dashboard-ai`, `ask-caboodle` |
| `(brand)/profile` | Brand users | profile |
| `(broker)` | **Brokers & broker sub-users** | dashboard, category-review, distributor-apl, file-repository, market-overview, market-overview-report, promotional-management |
| `api` | System | `auth/[...nextauth]` (NextAuth session), `ai-message` (proxy to the AI backend) |

Details in [brand-frontend](frontend/brand-frontend.md) and [broker-auth-frontend](frontend/broker-auth-frontend.md).

- **Stray file:** `(brand)/[brandID]/(data upload)/category-review.tsx` sits at the route-group level as a loose `.tsx` file rather than inside a route folder — an inconsistency to note.

## Code vs. prior documentation — headline discrepancies

The backend ships two prior docs: `CODEBASE_GUIDE.md` (an engineer-oriented architecture guide) and `docs/ASK Cab.md` (a requirements spec for the AI module).

1. **`docs/ASK Cab.md` is aspirational, not as-built.** It specifies an "Enterprise AI Data Intelligence Module" with prompt guards, query-cost guards (`EXPLAIN`-based), rate limiting, read-only DB roles, semantic caching, and audit logging. How much of that exists in code is assessed in [intelligence](modules/intelligence.md) and summarized in [05-known-gaps](05-known-gaps.md) — treat the SRS as a wish-list until each control is confirmed.
2. **Module count/names drift.** Prior docs describe ~16 modules with slightly different names; the verified list above is authoritative.
3. **Authorization is thinner than the permission catalog implies.** A rich permission catalog exists, but many controllers (all of Trade Spend, the Sandbox, and the UNFI/KeHe/SPINS/Distributor-Sales report endpoints) carry **no permission checks at all**, and there is no global authentication fallback policy in code. See [02-role-permission-matrix](02-role-permission-matrix.md).

## How to read this documentation set

- **Start here** (`00`), then the [Glossary](01-glossary.md) for the vocabulary.
- **`02`–`03`** are the cross-cutting essentials: who-can-do-what and how the data connects.
- **`04`** walks the most important end-to-end workflows; **`05`** is the honest list of gaps and half-built features.
- **`modules/`** and **`frontend/`** hold the per-area deep dives.
