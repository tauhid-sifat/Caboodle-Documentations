# Frontend Applications

*Sources: `f:\Caboodle New Web`, `f:\Caboddle Admin Web`*

The frontend is split across two Next.js repositories. Neither is inside the backend workspace. Both call the Caboodle REST API with JWT authentication. Brand-scoped requests send a `BrandID` HTTP header, validated server-side by `BrandValidationMiddleware.cs`.

---

## Caboodle New Web (Brand + Broker app)

**Path:** `f:\Caboodle New Web`  
**Framework:** Next.js 14 App Router  
**Package:** `caboodle.web`

### Roles served

| Role | Route group | How routing works |
|------|-------------|-------------------|
| BrandOwner | `(brand)/[brandID]/...` | `HeaderComponent.tsx` treats as brand user; selects brand from assigned list |
| BrandSubUser | `(brand)/[brandID]/...` | Same as BrandOwner |
| Broker | `(broker)/...` | Redirected to broker dashboard; can also access brand routes for assigned brands |
| BrokerSubUser | `(broker)/...` | Same broker menu via `isBrokerOrBrokerSubUser()` in `helper.ts` |

**Frontend role enum** (`src/enums/index.ts`): `BROKER`, `BRANDOWNER`, `BRANDSUBUSER`, `BROKERSUBUSER`.  
**Not present:** `ADMIN`, `UNASSIGNED` — admin uses separate app.

There is **no Next.js middleware.ts** enforcing roles at the route level. Access control is:
1. Client-side menu visibility (`SideBarMenus.tsx`)
2. Backend API authorization

### Auth screens (`(auth)`)

| Route | Purpose |
|-------|---------|
| `/login` | Login |
| `/signup` | Self-registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset completion |
| `/verify-email` | Email verification |

### Broker screens (`(broker)`)

| Route | Purpose | Backend module |
|-------|---------|----------------|
| `/dashboard` | Broker home dashboard | Dashboard, Broker |
| `/category-review` | Category review calendar and milestones | Broker |
| `/distributor-apl` | Distributor APL (warehouse product costs) | Broker |
| `/market-overview` | Market overview data entry | Broker |
| `/market-overview-report` | Market overview reporting | Broker, Report |
| `/promotional-management` | Cross-brand promo event management | Broker, TradeSpendSandbox |
| `/file-repository` | File and folder storage | FileRepository |

### Brand screens (`(brand)/[brandID]/...`)

#### Dashboard & AI
| Route | Purpose |
|-------|---------|
| `/dashboard` | Brand dashboard; hides certain widgets for brokers (`dashboard/page.tsx`) |
| `/dashboard-ai` | AI-enhanced dashboard |
| `/ask-caboodle` | Intelligence chat module |

#### CRM (`(crm)/`)
| Route | Purpose |
|-------|---------|
| `/retailers`, `/retailers/all` | Retailer lists (brand vs shared) |
| `/retailers/.../banners` | Banners under a retailer |
| `/distributors`, `/distributors/[id]` | Distributor management |
| `/distributors/.../banners` | Distributor-banner connections |
| `/regions` | Region management |
| `/contacts` | Contact management |
| `/pipeline`, `/pipeline/[taskID]` | Sales pipeline |

#### Product Specs (`(product-specs)/`)
| Route | Purpose |
|-------|---------|
| `/products` | Product list |
| `/products/add`, `/products/[productID]`, `/products/[productID]/edit` | Product CRUD |
| `/categories` | Category management |
| `/pricing` | Price list management |

#### Trade Spend (`(promo)/(trade-spend)/`)
| Route | Purpose |
|-------|---------|
| `/trade-spend-sandbox` | Sandbox promo list |
| `/trade-spend-sandbox/create`, `/trade-spend-sandbox/[promoID]` | Sandbox promo create/edit |
| `/promo-planning` | Live BAP promo list |
| `/promo-planning/create`, `/promo-planning/[promoID]` | Live promo create/edit |

#### Promotional Calendar (`(promo)/(promotional-calendar)/`)
| Route | Purpose |
|-------|---------|
| `/promotional-calendar` | Calendar view of promos |
| `/promotional-notes` | Monthly promotional notes |

#### Data Upload (`(data upload)/`)
| Route | Purpose |
|-------|---------|
| `/kehe` | KeHE data upload and reports |
| `/unfi` | UNFI data upload and reports |
| `/spins` | SPINS data upload |
| `/spins/item-ranking-report` | SPINS item ranking |
| `/spins/stores-insight-report` | SPINS store insight |
| `/distributor-sales-report` | Unified distributor sales reporting |
| `/category-review.tsx` | Category review (brand view) — note unusual `.tsx` in folder name |

#### Reports (`(report)/`)
| Route | Purpose |
|-------|---------|
| `/report` | General reporting hub |
| `/monthly-report` | Monthly trade spend report |
| `/retail-report` | Retail-level report |
| `/product-report` | Product-level report |
| `/banner-report` | Banner-level report |
| `/sales-tracker` | Sales tracking |
| `/apl-report`, `/apl-activity` | APL reporting |
| `/brand-market-overview-report` | Brand market overview report |
| `/category-review-brand`, `/category-review-calendar-brand` | Brand category review views |

#### Other
| Route | Purpose |
|-------|---------|
| `/file-upload` | File upload utility |
| `/profile` | User profile |

### Client-side business logic (representative)

| Logic | Location | Description |
|-------|----------|-------------|
| Broker menu vs brand menu | `SideBarMenus.tsx` | Shows broker or brand navigation based on `userRole` |
| Broker widget hiding | `dashboard/page.tsx` | Certain dashboard cards hidden for brokers |
| SKU status display mapping | `enums/index.ts` `getSkuStatusEnum` | Maps numeric `SkuStatus` to labels matching backend enum |
| Promotion event status mapping | `helper.ts`, `enums/index.ts` | Maps `PromotionEventStatus` values |
| Sort direction toggle | `SortDirectionToggle.tsx` | UI-only sort control |

### Frontend/backend mismatches (risks)

| Risk | Detail |
|------|--------|
| No route-level auth middleware | Any authenticated user could manually navigate to URLs; backend must reject unauthorized API calls |
| `masterPack` field not in frontend | Backend `ProductSpecification.MasterPack` documented in `product-spec-master-pack-fe-integration.md` but not found in frontend forms |
| Frontend `UserRole` enum missing `ADMIN` | Expected — admin uses separate app |
| Broker can hit brand routes | Backend `BrandValidationMiddleware` enforces brand assignment; frontend does not block URL access |
| Commented-out broker redirect logic | `HeaderComponent.tsx` has commented code that previously restricted navigation — behavior may be in flux |

---

## Caboddle Admin Web

**Path:** `f:\Caboddle Admin Web`  
**Framework:** Next.js 13 App Router  
**Package:** `caboodle.admin`

### Role served

**Admin only.** Login uses `TokenService.GetAdminTokenAsync` which requires `ADMIN` role on backend.

No `middleware.ts` found. Admin access relies on admin-specific login endpoint.

### Screens (`(mainApp)`)

#### User & tenant management
| Route | Purpose |
|-------|---------|
| `/dashboard` | Admin home |
| `/users`, `/all-users` | User lists with role assignment |
| `/users-unassigned` | Users with no role assigned |
| `/disable-users` | Disabled user management |
| `/invite-user`, `/invited-users` | User invitation flow |
| `/brands`, `/brand-owners` | Brand management |
| `/brand-subusers` | Brand sub-user management |
| `/brokers`, `/broker-subusers` | Broker management |

#### CRM master data (`(crm)/`)
| Route | Purpose |
|-------|---------|
| `/retailers` | Cross-brand retailer admin |
| `/banners` | Banner admin |
| `/banner-skus` | Banner SKU admin |
| `/distributors`, `/sub-distributors` | Distributor hierarchy |
| `/dcs`, `/distributor-dc` | Distribution centers |
| `/regions`, `/regions-retailer` | Regions and retailer-region links |
| `/stores` | Store list (DataHub store list integration) |
| `/contacts` | Contact admin |
| `/category` | Category admin |
| `/product-spec` | Product spec admin |
| `/price-lists` | Price list admin |
| `/upload-data-map` | Data mapping import |

#### DataHub
| Route | Purpose |
|-------|---------|
| `/data-hub` | DataHub hub |
| `/data-sync` | Trigger and monitor sync runs |
| `/entity-resolution`, `/entity-resolution/[entityId]` | Unified entity management |
| `/credential-manager` | Distributor portal credentials |
| `/unmapped-data`, `/unmapped-data-dashboard` | Unmapped record stewardship |
| `/mapped-data`, `/mapped-data-dashboard` | Mapped record review |
| `/brand-data-cleanup` | Brand data cleanup jobs |

#### Configuration
| Route | Purpose |
|-------|---------|
| `/pipeline-config` | Pipeline deal stage configuration |

### Client-side business logic (representative)

| Logic | Location | Description |
|-------|----------|-------------|
| Role assignment UI | `AddRoleToUser.tsx` | Assigns roles via `/api/v1/users/.../assign-role` |
| Store empty-banner filter | `StoreFilter.tsx`, `StoresTable.tsx` | Sends `emptyBannerOnly=true` per integration doc |
| Mapped records tabs | `mapped-data/page.tsx` | KeHE and UNFI mapped record tabs |
| Backfill job polling | `hooks/dataHub.ts` | Polls export job status for backfill operations |

### Frontend/backend mismatches (risks)

| Risk | Detail |
|------|--------|
| Credential manager uses View permission for all CRUD | Backend `CredentialManagerController` uses `View` permission on POST/PUT/DELETE — frontend may not reflect write vs read distinction |
| Missing integration docs | Frontend implements entity resolution and brand cleanup, but referenced docs (`entity-resolution-fe-integration.md`, `brand-data-cleanup-fe-integration.md`) are absent from repo |
| Admin CRM upserts vs brand CRM | Admin uses `for-admin` endpoints with permission claims; brand app uses brand-scoped endpoints without claims — different API surfaces for same entities |
