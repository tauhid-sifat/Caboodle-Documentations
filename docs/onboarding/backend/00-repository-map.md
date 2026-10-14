# Step 1 — Repository Map

*Sources: `caboodle.sln`, `caboodle/src/Modules/`, `caboodle/src/Hosts/API/Controllers/`, `f:\Caboodle New Web\src\app\`, `f:\Caboddle Admin Web\src\app\`*

## Backend solution structure

The solution file `caboodle.sln` organizes code into **BuildingBlocks**, **Hosts**, **Modules**, and **Database**.

### Backend modules (verified in solution)

| Module folder | Domain project | Application project | In prior glossary? |
|---------------|----------------|---------------------|-------------------|
| **Admin** | No | Yes | Not listed as separate module in user prompt; exists in code |
| **Brand** | Yes | Yes | Yes |
| **Broker** | Yes | Yes | Yes |
| **CRM** | Yes | Yes | Yes |
| **Dashboard** | No | Yes | Yes |
| **DataHub** | Yes | Yes | Yes |
| **DataUpload** | Yes | Yes | Yes |
| **FileRepository** | Yes | Yes | Yes |
| **Intelligence** | Yes | Yes | Yes (as "Intelligence") |
| **ProductSpec** | Yes (`Modules.ProductSpecs.*`) | Yes | Yes (as "ProductSpecs") |
| **Report** | No | Yes | Yes |
| **Shared** | No | Yes (Application + Infrastructure) | Yes |
| **Store** | Yes | **No** | Mentioned in user prompt; only Domain exists |
| **TradeSpend** | Yes | Yes | Yes |
| **TradeSpendSandbox** | Yes | Yes | Yes |

### Modules mentioned in the user prompt but NOT in the solution

- None of the named modules are missing. The solution also includes **Intelligence** and **Dashboard**, which were not in the user's example list.

### API controllers by module

Controllers live under `caboodle/src/Hosts/API/Controllers/`:

| Controller | Module |
|------------|--------|
| `Admin/AdminController.cs` | Admin |
| `Modules/Brand/BrandsController.cs` | Brand |
| `Modules/Broker/BrokersController.cs`, `MarketOverviewsController.cs` | Broker |
| `Modules/CRM/*` (Banners, Contacts, Distributors, DistributionCenter, PipeLines, Regions, Retailers, Stores) | CRM |
| `Modules/Dashboard/DashboardController.cs` | Dashboard |
| `Modules/DataHub/DataHubController.cs`, `EntityResolutionController.cs`, `ExportController.cs`, `CredentialManagerController.cs` | DataHub |
| `Modules/DataUpload/*` (DataMappings, DistributorSalesReports, KeHe, MasterDataUpload, SPINS, UNFI) | DataUpload |
| `Modules/FileRepository/FilesController.cs`, `DirectoryController.cs` | FileRepository |
| `Modules/Intelligence/IntelligenceChatController.cs` | Intelligence |
| `Modules/ProductSpecs/*` (Categories, PriceLists, ProductSpecs) | ProductSpec |
| `Modules/Report/ReportsController.cs` | Report |
| `Modules/SubUsers/SubUsersController.cs` | Cross-cutting (brand/broker sub-users) |
| `Modules/TradeSpend/TradeSpendsController.cs` | TradeSpend |
| `Modules/TradeSpendSandbox/TradeSpendsSandboxController.cs` | TradeSpendSandbox |
| `Identity/*`, `Profile/ProfileController.cs`, `Registration/RegistrationController.cs` | Identity / cross-cutting |

### Building blocks (shared infrastructure)

Not business modules, but govern all modules:

- **Authorization**: `caboodle/src/BuildingBlocks/Core/Shared/Authorization/CaboodlePermissions.cs`, `CaboodleRoles.cs`
- **Brand scoping middleware**: `caboodle/src/BuildingBlocks/Infrastructure/Middleware/BrandValidationMiddleware.cs`
- **Database**: PostgreSQL via EF Core + Dapper (`ApplicationDbContext`)

---

## Frontend applications

### Caboodle New Web (`f:\Caboodle New Web`)

Package name: `caboodle.web`. Next.js 14 App Router.

#### Route groups and intended roles

| Route group | URL pattern | Intended role(s) | Evidence |
|-------------|-------------|------------------|----------|
| `(auth)` | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Unauthenticated → any registered role | Route files under `src/app/(auth)/` |
| `(brand)` | `/[brandID]/...` | BrandOwner, BrandSubUser; also Broker/BrokerSubUser when accessing assigned brands | `HeaderComponent.tsx` redirects brokers to broker dashboard; brand routes require `BrandID` header |
| `(broker)` | `/dashboard`, `/category-review`, `/distributor-apl`, `/file-repository`, `/market-overview`, `/market-overview-report`, `/promotional-management` | Broker, BrokerSubUser | `SideBarMenus.tsx` shows broker menu when `isBrokerOrBrokerSubUser(userRole)` |

**Frontend role enum** (`f:\Caboodle New Web\src\enums\index.ts`): `BROKER`, `BRANDOWNER`, `BRANDSUBUSER`, `BROKERSUBUSER`. There is no `ADMIN` role in this app.

**Role routing logic** (`f:\Caboodle New Web\src\components\header\HeaderComponent.tsx`):
- On login, role is stored in `roleStore`.
- Brokers are directed to broker routes; brand owners/sub-users use brand-scoped routes under `[brandID]`.

#### Brand-scoped feature areas (under `[brandID]`)

| Route area | Screens | Business purpose |
|------------|---------|------------------|
| `dashboard`, `dashboard-ai`, `ask-caboodle` | Home dashboards, AI chat | Brand overview and Intelligence module |
| `(crm)/` | retailers, distributors, regions, contacts, pipeline | Commercial master data and deal pipeline |
| `(product-specs)/` | products, categories, pricing | Product master and price lists |
| `(promo)/(trade-spend)/` | trade-spend-sandbox, promo-planning | Sandbox planning and live BAP promos |
| `(promo)/(promotional-calendar)/` | promotional-calendar, promotional-notes | Promo calendar and monthly notes |
| `(data upload)/` | kehe, unfi, spins, distributor-sales-report | Provider data upload and reports |
| `(report)/` | monthly-report, retail-report, product-report, banner-report, sales-tracker, apl-report, category-review-brand, etc. | Analytics and reporting |
| `(file-upload)/` | file-upload | File upload (distinct from File Repository) |
| `profile` | User profile | Account settings |

### Caboddle Admin Web (`f:\Caboddle Admin Web`)

Package name: `caboodle.admin`. Next.js 13 App Router.

#### Route groups

| Route group | URL pattern | Intended role |
|-------------|-------------|---------------|
| `(auth)` | `/login` | Unauthenticated |
| `(mainApp)` | All admin screens | Admin (backend `ADMIN` role; admin login uses role check in `TokenService.GetAdminTokenAsync`) |

**Note:** Admin app uses `(mainApp)`, not `(admin)` as a route group name.

#### Admin screens (`(mainApp)`)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Admin home |
| `/users`, `/all-users`, `/users-unassigned`, `/disable-users`, `/invite-user`, `/invited-users` | User management |
| `/brands`, `/brand-owners`, `/brand-subusers`, `/brokers`, `/broker-subusers` | Tenant and partner management |
| `/pipeline-config` | Pipeline deal stage configuration |
| `/(crm)/retailers`, `/banners`, `/banner-skus`, `/distributors`, `/sub-distributors`, `/dcs`, `/distributor-dc`, `/regions`, `/regions-retailer`, `/stores`, `/contacts`, `/category`, `/product-spec`, `/price-lists` | Cross-brand CRM master data |
| `/upload-data-map` | Data mapping import |
| `/data-hub`, `/data-sync`, `/entity-resolution`, `/credential-manager` | DataHub operations |
| `/unmapped-data`, `/unmapped-data-dashboard`, `/mapped-data`, `/mapped-data-dashboard` | Mapping stewardship |
| `/brand-data-cleanup` | Brand data cleanup jobs |

---

## Items in code but not in prior business docs

| Item | Location | Notes |
|------|----------|-------|
| **Intelligence module** | `Modules.Intelligence.*` | AI chat ("Ask Caboodle"); partially documented in `ASK Cab.md` |
| **Dashboard module** | `Modules.Dashboard.Application` | Product status summary; no Domain project |
| **Store module (orphan Domain)** | `Modules.Store.Domain` only | Duplicate of CRM `Store` entity; CRM owns the Application layer |
| **DistributorSalesRecord** unified reporting | `Modules.DataUpload.Domain` | Cross-provider sales table; not emphasized in older glossary |
| **ThirdPartyCredential** | `Modules.DataHub.Domain` | Distributor login credentials for automated sync |
| **BrandDataCleanupJob** | `Modules.DataHub.Domain` | Admin cleanup operations |
| **Pipeline / PipelinePlan / PipelineDealStage** | `Modules.CRM.Domain` | Deal pipeline CRM feature |
| **File Repository** | `Modules.FileRepository.*` | Broker file storage with privacy types |
| **Registration flow** | `RegistrationController.cs` | Self-service signup separate from admin invite |

## Items in prior docs but missing or different in code

| Prior doc claim | Code reality |
|-----------------|--------------|
| `system-business-glossary.md` lists modules 3.1–3.9 only | Code also has Admin, Dashboard, Report, FileRepository, Store (orphan) |
| `product-spec-master-pack-fe-integration.md` describes `masterPack` field | Field exists in backend `ProductSpecification`; **not found** in either frontend repo (grep, Jul 2026) |
| Several `*-fe-integration.md` files reference missing sibling docs | `entity-resolution-fe-integration.md`, `unmapped-distinct-values-fe-integration.md`, `brand-data-cleanup-fe-integration.md` do not exist in `caboodle/docs/business/` |
| Prior docs imply frontend is part of same repo | Frontend is in separate sibling directories on `F:\` |
