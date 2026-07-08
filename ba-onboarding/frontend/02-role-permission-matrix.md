# Role & Permission Matrix

> Authoritative reference for the Caboodle **backend** authorization model, written for a Business Analyst.
> Every claim cites the source file and line (`path.cs:line`) under the backend root `/d/Projects/caboodle.backend`.
> Where the code does not make something clear, the text says **"Unclear from code"** rather than guessing.

Backend paths below are shortened; the real prefix is:
`caboodle/src/...` inside `/d/Projects/caboodle.backend`.

---

## The 6 Roles

The system defines exactly six built-in ("default") roles. They are declared as constants and seeded into the database on startup.

| Role code | Display name | Source |
|---|---|---|
| `ADMIN` | Admin | `BuildingBlocks/Core/Shared/Authorization/CaboodleRoles.cs:8`, `:19` |
| `UNASSIGNED` | UnAssigned | `CaboodleRoles.cs:9`, `:25` |
| `BRANDOWNER` | BrandOwner | `CaboodleRoles.cs:10`, `:29` |
| `BROKER` | Broker | `CaboodleRoles.cs:11`, `:34` |
| `BRANDSUBUSER` | BrandSubUser | `CaboodleRoles.cs:12`, `:39` |
| `BROKERSUBUSER` | BrokerSubUser | `CaboodleRoles.cs:13`, `:44` |

These six are also the "default roles" list (`CaboodleRoles.cs:15-47`). Default roles cannot be renamed or deleted through the API (`BuildingBlocks/Infrastructure/Identity/RoleService.cs:128-131`, `:197-199`). Admins **can** create additional custom roles (`RoleService.cs:98-120`) and attach permissions to any role (`RoleService.cs:150-189`).

In plain terms:
- **ADMIN** — Caboodle platform staff / superuser. Gets every permission.
- **BRANDOWNER** — a brand's primary account holder.
- **BRANDSUBUSER** — an additional user under a brand owner.
- **BROKER** — a brokerage account holder (sells on behalf of brands).
- **BROKERSUBUSER** — an additional user under a broker.
- **UNASSIGNED** — a freshly registered user who has not yet been given a real role.

---

## How Users Are Authenticated (Job 1)

**Definitive answer: an endpoint with no authorization attribute is NOT anonymous. It still requires a logged-in user (a valid JWT). It simply is not restricted by any *permission* beyond "be authenticated".**

Why:

1. Every controller route is registered with a blanket authorization requirement:
   `builder.MapControllers().RequireAuthorization();` — `BuildingBlocks/Infrastructure/Startup.cs:98`.
   `RequireAuthorization()` with no arguments attaches ASP.NET Core's **default policy**, which is "require an authenticated user."
2. The authentication + authorization middleware is wired into the request pipeline:
   `.UseAuthentication()` (`Startup.cs:85`), `.UseAuthorization()` (`Startup.cs:87`), with a custom `.UseCurrentUser()` in between (`Startup.cs:86`).
3. Authentication is **JWT bearer token** validation: `AddJwtBearer(...)` with signing-key validation and lifetime validation (`BuildingBlocks/Infrastructure/Auth/Jwt/Startup.cs:27-40`). A missing/invalid token triggers a 401 (`Jwt/Startup.cs:43-52`).
4. The `PermissionPolicyProvider.GetFallbackPolicyAsync()` returning `null` (`BuildingBlocks/Infrastructure/Auth/Permissions/PermissionPolicyProvider.cs:30`) is **not** the thing protecting endpoints — the explicit `RequireAuthorization()` on `MapControllers` is. The null fallback would only matter if there were no other requirement in play.

So the two layers are:
- **Layer 1 (global): must be authenticated.** Applies to every controller endpoint via `RequireAuthorization()`.
- **Layer 2 (per-endpoint): must hold a specific permission.** Applies only where a `[MustHavePermission(...)]` attribute is present.

**To be truly public**, an endpoint must be explicitly marked `[AllowAnonymous]` (login, signup, password reset, email verification, and a handful of DataHub callbacks — see the Risks section).

The base controllers themselves carry no attribute: `BaseApiController` only has `[ApiController]` (`Hosts/API/Controllers/BaseApiController.cs:5-6`) and `VersionedApiController` only has the route template (`VersionedApiController.cs:3-4`). Protection comes entirely from the global `RequireAuthorization()`.

---

## How Permissions Are Granted per Role (Job 2)

### The one mechanism that matters: **role claims in the database**

A user's effective permissions are computed **only** from the permission claims attached to the **roles** that user belongs to. There is no per-user permission grant.

- `UserService.GetPermissionsAsync` loads the user's roles, then reads `RoleClaims` of type `permission` for those roles and returns the distinct list (`BuildingBlocks/Infrastructure/Identity/UserService.Permissions.cs:12-33`).
- `HasPermissionAsync` caches and checks that list (`UserService.Permissions.cs:35-43`).
- The claim type used is the constant `"permission"` (`BuildingBlocks/Core/Shared/Authorization/CaboodleClaims.cs:6`).

A permission's policy name has the shape `Permissions.{Module}.{Resource}.{Action}` (`CaboodlePermissions.cs:155`).

### Where role claims come from

**1. Startup seeding — `ApplicationDbSeeder.SeedRolesAsync` (`BuildingBlocks/Infrastructure/Persistence/Initialization/ApplicationDbSeeder.cs:38-59`).**
On boot it ensures all six roles exist, then assigns permission claims to **only three** of them:

| Role | Permissions seeded | Source |
|---|---|---|
| `ADMIN` | **All** permissions in the catalog (`CaboodlePermissions.Admin`) | `ApplicationDbSeeder.cs:52-53` → `CaboodlePermissions.cs:144` |
| `BROKER` | `CaboodlePermissions.Broker` = every catalog permission whose Module is `Broker`, **except** the `Brokers` resource | `ApplicationDbSeeder.cs:54-55` → `CaboodlePermissions.cs:145-146` |
| `BROKERSUBUSER` | `CaboodlePermissions.SubBroker` = **identical** to the Broker set | `ApplicationDbSeeder.cs:56-57` → `CaboodlePermissions.cs:148-149` |

The claims are written into the `RoleClaims` table with claim type `permission` (`ApplicationDbSeeder.cs:74-80`).

**2. No seeding for the brand roles or unassigned.**
There is **no branch** in `SeedRolesAsync` for `BRANDOWNER`, `BRANDSUBUSER`, or `UNASSIGNED`. These roles are created (so they exist) but receive **zero permission claims** from seeding.

**3. Resolving the critical question — how do BRANDOWNER / BRANDSUBUSER / UNASSIGNED get permissions?**

- **From code, statically: they get none.** Registration/creation only puts the user *into* a role; it never grants permissions:
  - New self-signup → `UNASSIGNED` role, no permissions (`UserService.CreateUpdate.cs:405`).
  - Admin-created user with no role → `UNASSIGNED` (`UserService.CreateUpdate.cs:270-271`).
  - Admin-created brand owner → `BRANDOWNER` role only (`UserService.CreateUpdate.cs:274-275`).
  - Brand sub-user invite → `BRANDSUBUSER` role only (`UserService.CreateUpdate.cs:788`).
  - Assigning a role later (`AssignRoleAsync`) swaps role membership; it adds no permission claims (`UserService.Roles.cs:46-88`).
- **The only way these roles can gain permissions is at runtime, manually**, via the "Update Role Permissions" API, which writes `RoleClaims` for whatever permissions an admin selects (`RoleService.UpdatePermissionsAsync`, `RoleService.cs:150-189`; exposed at `RolesController` PUT, `Hosts/API/Controllers/Identity/RolesController.cs:71`).
- **Unclear from code** — whether, in any given deployment, an admin has manually assigned permissions to the BRANDOWNER / BRANDSUBUSER roles through that API. Nothing in the repository (no seeder branch, no migration inserting `RoleClaims` for these roles — migrations only *create* the `RoleClaims` table, e.g. `Database/Migrator/Migrations/ApplicationDb/20230814061056_IdentityTablesCreation.cs`) grants them. Their live permission set is data-dependent, not code-dependent.

**Consequence:** out of the box, a brand owner can only reach endpoints that require *no permission* (the authenticated-only endpoints). Any endpoint guarded by `[MustHavePermission(...)]` — e.g. viewing brands, contacts, categories, products, price lists, banners — would return 403 for a brand owner **until an admin grants those permissions to the role**. See Gaps & Inconsistencies.

---

## How Permissions Are Enforced (Admin bypass? role-claim vs user-claim)

- **Enforcement point:** `PermissionAuthorizationHandler.HandleRequirementAsync` (`BuildingBlocks/Infrastructure/Auth/Permissions/PermissionAuthorizationHandler.cs:17-25`). It reads the user id from the token; if empty → 401 (`:19-21`); otherwise it calls `HasPermissionAsync(userId, requiredPermission)` and only succeeds if true (`:23-24`).
- **Role-claim vs user-claim:** enforcement is **role-claim based**. `HasPermissionAsync` → `GetPermissionsAsync` derives permissions purely from the user's **roles' claims** (`UserService.Permissions.cs:18-32`). There is no per-user permission claim path.
- **Admin bypass? No hard-coded bypass.** The handler does **not** special-case the ADMIN role. Admin succeeds only because the seeder granted the ADMIN role *every* permission (`ApplicationDbSeeder.cs:52-53`). In other words, Admin's "all access" is data (seeded claims), not a code shortcut. If the ADMIN role's claims were removed, an admin would lose access like anyone else.
- **The `[MustHavePermission]` attribute** is an `AuthorizeAttribute` whose `Policy` is the `Permissions.{Module}.{Resource}.{Action}` string (`Auth/Permissions/MustHavePermissionAttribute.cs:6-9`); the `PermissionPolicyProvider` turns any policy name starting with `permission` into a `PermissionRequirement` handled above (`PermissionPolicyProvider.cs:18-25`).

---

## Permission Matrix (Role × Module / Resource / Action)

This matrix reflects **only what the code actually grants** (startup seeding). "Manual only" means the role can hold the permission solely if an admin assigns it at runtime.

Legend: **Y** = granted by seeding · **—** = not granted · **manual** = only via admin action at runtime.

| Permission (Module.Resource.Action) — description | ADMIN | BROKER | BROKERSUBUSER | BRANDOWNER | BRANDSUBUSER | UNASSIGNED |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| User.Users.View / Search / Create / Update / Delete | Y | — | — | manual | manual | manual |
| User.UserRoles.View / Update / Delete | Y | — | — | manual | manual | manual |
| Role.Roles.View / Create / Update / Delete | Y | — | — | manual | manual | manual |
| Brand.Brands.View / Upsert / Delete | Y | — | — | manual | manual | manual |
| Brand.BrandAssign.Assign | Y | — | — | manual | manual | manual |
| PipeLine.PipeLineDealStage.View / Update | Y | — | — | manual | manual | manual |
| Broker.BrandAssign.Assign (assign brands to broker) | Y | Y | Y | manual | manual | manual |
| Broker.Brokers.View | Y | **—** (excluded) | **—** (excluded) | manual | manual | manual |
| Broker.BrokerDashBoard.View | Y | Y | Y | manual | manual | manual |
| Broker.BrokerMarketOverview.View / Create / Update / Delete | Y | Y | Y | manual | manual | manual |
| Broker.BrokerCategoryReview.Import / View | Y | Y | Y | manual | manual | manual |
| Broker.BrokerPromotionalManagement.View | Y | Y | Y | manual | manual | manual |
| Broker.Banners.View ("View All Banners") | Y | Y | Y | manual | manual | manual |
| Broker.SubUsers.View / Update / Delete | Y | Y | Y | manual | manual | manual |
| DataUpload.MasterDataUpload.Export / Import | Y | — | — | manual | manual | manual |
| DataUpload.DataUpload.Create (data mapping) | Y | — | — | manual | manual | manual |
| Retailer.Retailers.View / Upsert / Delete | Y | — | — | manual | manual | manual |
| Distributor.Distributors.View / Upsert / Delete | Y | — | — | manual | manual | manual |
| Category.Categories.View | Y | — | — | manual | manual | manual |
| ProductSpec.ProductsSpec.View | Y | — | — | manual | manual | manual |
| PriceList.PriceLists.View | Y | — | — | manual | manual | manual |
| Banner.Banners.View | Y | — | — | manual | manual | manual |
| BannerSKU.BannerSKUs.View | Y | — | — | manual | manual | manual |
| Contact.Contacts.View | Y | — | — | manual | manual | manual |
| SubUser.SubUsers.View | Y | — | — | manual | manual | manual |
| Store.Stores.View / Create | Y | — | — | manual | manual | manual |
| DataHub.EntityResolution.View / Upsert / Update | Y | — | — | manual | manual | manual |

Notes:
- The full catalog of permissions is the `_all` array (`CaboodlePermissions.cs:75-142`).
- The BROKER / BROKERSUBUSER "Y" rows are exactly the `Module == Broker && Resource != Brokers` filter (`CaboodlePermissions.cs:146`, `:149`). That is why **Broker.Brokers.View is `—` even for brokers** — only Admin holds it.
- Every "manual" cell for BRANDOWNER / BRANDSUBUSER / UNASSIGNED is otherwise **not granted by code**. Treat those three roles' real capabilities as **Unclear from code** (deployment-data dependent).

---

## Endpoints With No / Weak Authorization (Risks)

### A. Truly anonymous endpoints (`[AllowAnonymous]`) — no login required
These are expected for pre-login flows, but listed for completeness:
- `AuthController` — token/login endpoints (`Identity/AuthController.cs:15`, `:26`).
- `RegistrationController` — controller-level `[AllowAnonymous]` (`Registration/RegistrationController.cs:17`).
- `UsersController` — self-signup, email verify, forgot/reset password (`Identity/UsersController.cs:17`, `:235`, `:246`, `:257`, `:269`).
- `AdminController` — one anonymous endpoint (`Admin/AdminController.cs:26`).
- `DataHubController` — several anonymous endpoints (`Modules/DataHub/DataHubController.cs:26`, `:37`, `:99`, `:722`). **Review needed:** DataHub deals with ingestion/entity data; confirm these anonymous routes are intentional and safe.

### B. Authenticated-but-ungated controllers — **any logged-in user, regardless of role or permission** (HIGH interest)
These controllers have **zero** `[MustHavePermission]` attributes on any endpoint, so the only gate is "be authenticated." An `UNASSIGNED` user with no permissions, or a brand owner, can call every endpoint on them:

| Controller | File | Concern |
|---|---|---|
| TradeSpendsController | `Modules/TradeSpend/TradeSpendsController.cs:18` | Trade-spend financial data — no permission gate |
| TradeSpendsSandboxController | `Modules/TradeSpendSandbox/TradeSpendsSandboxController.cs:8` | Trade-spend sandbox — no permission gate |
| DashboardController | `Modules/Dashboard/DashboardController.cs:7` | Aggregated dashboard data |
| ReportsController | `Modules/Report/ReportsController.cs:10` | All reports |
| UNFIController | `Modules/DataUpload/UNFIController.cs:12` | Data upload/ingestion |
| KeHEController | `Modules/DataUpload/KeHeController.cs:13` | Data upload/ingestion |
| SPINSController | `Modules/DataUpload/SPINSController.cs:7` | Data upload/ingestion |
| DistributorSalesReportsController | `Modules/DataUpload/DistributorSalesReportsController.cs:7` | Sales data upload |
| PipelinesController | `Modules/CRM/PipeLinesController.cs:9` | CRM pipeline data |
| RegionsController | `Modules/CRM/RegionsController.cs:7` | Reference data |
| DistributionCenterController | `Modules/CRM/DistributionCenterController.cs:7` | Reference data |
| ExportController | `Modules/DataHub/ExportController.cs:6` | Data export |
| IntelligenceChatController | `Modules/Intelligence/IntelligenceChatController.cs:8` | AI chat |
| DirectoryController | `Modules/FileRepository/DirectoryController.cs:10` | File repository |
| FilesController | `Modules/FileRepository/FilesController.cs:10` | File repository |
| ProfileController | `Profile/ProfileController.cs:10` | Own-profile (low risk — self-scoped) |

**Count: 16 controllers with no permission gating** (15 data/feature controllers + `ProfileController`, which is self-scoped and low risk). **Severity: HIGH** for the data-upload, trade-spend, reports, file-repository and export controllers, because sensitive tenant data is reachable by any authenticated principal irrespective of role.

*Mitigating factor to verify (not a permission control):* the pipeline includes `.UseBrandValidationMiddleware()` (`BuildingBlocks/Infrastructure/Startup.cs:89`). It appears to scope requests to a brand, which may limit cross-tenant reach, but it is **not** a permission/role check. **Unclear from code** how strictly it constrains these ungated controllers — recommend a dedicated review.

### C. Partially gated controllers — read endpoints open, some writes gated (MEDIUM)
These gate a few actions but leave most endpoints (typically the list/GET actions) authenticated-only:
- `ContactsController` — only one gated endpoint: Contacts.View (`Modules/CRM/ContactsController.cs:80`); other endpoints ungated.
- `BannersController` — gates Banner.View (`:87`) and BannerSKU.View (`:236`); other endpoints ungated (`Modules/CRM/BannersController.cs`).
- `DistributorsController` — gates only Upsert (`:237`, `:248`) and a Delete (`:360`, see bug below); the list/GET endpoints are ungated (`Modules/CRM/DistributorsController.cs`).
- `RetailersController` — gates only Upsert (`:144`) and Delete (`:155`); list/GET ungated (`Modules/CRM/RetailersController.cs`).
- `StoresController` — gates only Create (`:51`); "Get Stores" is ungated (`Modules/CRM/StoresController.cs`).
- `CategoriesController` — gates only View (`:71`); other endpoints ungated (`Modules/ProductSpecs/CategoriesController.cs`).
- `ProductSpecsController` — gates only View (`:50`); other endpoints ungated (`Modules/ProductSpecs/ProductSpecsController.cs`).
- `PriceListsController` — gates only View (`:88`); other endpoints ungated (`Modules/ProductSpecs/PriceListsController.cs`).

---

## Gaps & Inconsistencies

1. **Brand roles receive no permissions in code.** BRANDOWNER, BRANDSUBUSER, UNASSIGNED are seeded as roles but with **no** permission claims (`ApplicationDbSeeder.cs:38-59` has branches only for ADMIN/BROKER/BROKERSUBUSER). Their real capabilities depend entirely on manual admin assignment at runtime (`RoleService.cs:150-189`) — **Unclear from code** what a live deployment grants.

2. **Permission-guarded endpoints that no seeded role (other than Admin) can satisfy.** Because brand roles get nothing by default, endpoints such as Brand.Brands.View (`BrandsController.cs:23`), Contact.Contacts.View (`ContactsController.cs:80`), Category.Categories.View (`CategoriesController.cs:71`), ProductSpec.ProductsSpec.View (`ProductSpecsController.cs:50`), PriceList.PriceLists.View (`PriceListsController.cs:88`), Banner.Banners.View (`BannersController.cs:87`) are reachable only by ADMIN (and by BROKER only where the permission is in the Broker module). A brand owner would be blocked from these read endpoints unless permissions are manually granted. Likely relies on runtime role-permission configuration — flag for BA confirmation.

3. **Likely-unused ("defined but not enforced") permissions.** Present in the catalog (`CaboodlePermissions.cs`) but no controller references them (verified by searching all controllers):
   - `User.Users.Search` — the `Search` action (`CaboodlePermissions.cs:78`) is used by no endpoint.
   - `Broker.BrokerDashBoard.View` (`:101`) — no controller references it; the actual dashboard (`DashboardController`) is ungated.
   - `Brand.Brands.Delete` (`:94`) — no endpoint enforces it.
   - `Distributor.Distributors.View` ("View All Distributors", `:114`) — the distributor list endpoint is ungated, so this permission is never enforced.
   - `Retailer.Retailers.View` ("View All Retailers", `:113`) — retailer list endpoint ungated; not enforced.
   - `Store.Stores.View` ("Get Stores", `:135`) — the GET stores endpoint is ungated; not enforced.
   - `Distributor.Distributors.Delete` (`:125`) — see bug below; the distributor delete endpoint uses the **Retailer** delete permission instead.

4. **Wrong-permission bug on distributor delete.** In `DistributorsController.cs:360` the endpoint is guarded by `MustHavePermission(Delete, Retailers, Retailer)` — the **Retailer** delete permission — rather than the intended `Distributor.Distributors.Delete`. This means deleting a distributor is gated by a retailer permission. Confirm with engineering.

5. **No code-level Admin bypass.** Admin omnipotence is entirely a function of seeded claims (`ApplicationDbSeeder.cs:52-53`). If seeding is skipped or claims are edited, Admin loses access. This is a fragility worth noting.

6. **Global "authenticated-only" default is broad.** Because protection defaults to mere authentication (`Startup.cs:98`) and 16 controllers add no permission attribute, a large surface of sensitive functionality (data upload, trade spend, reports, file repository, export) is available to *any* authenticated user including `UNASSIGNED`. This is the single biggest authorization gap.
