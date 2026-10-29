---
type: reference
title: "Feature dependency matrix and change recipes (code-verified)"
module: platform
status: current
last_verified: 2026-10-29
source: docs/feature-context.md §4-§5
---

# Feature dependency matrix and change recipes (code-verified)

Source of truth: `docs/feature-context.md` §4 and §5.

## §4 Feature Dependency Matrix

Rows depend on columns. `X` marks a direct code or data dependency (a module reads or writes the other module's tables, calls its services or endpoints, or reuses its components). Every module also depends on 2.1 (authentication) and 2.2 (authorization through `[RequireModule]`, `[RequireOrgPermission]` and `IAccessContext`); the 2.2 column is marked only where a module also uses 2.2 data or settings beyond request authorization (quotas, module settings, connections, memberships).

| Depends on: | 2.1 | 2.2 | 2.3 | 2.4 | 2.5 | 2.6 | 2.7 | 2.8 | 2.9 | 2.10 | 2.11 | 2.12 | 2.13 | 2.14 | 2.15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **2.1 Identity & Authentication** | | X | X | | | | | | | | | | | | X |
| **2.2 Organizations & Access** | X | | X | X | | | | | | | | | | | X |
| **2.3 Brands & Brokers** | | X | | X | | | | | | X | | | | | |
| **2.4 CRM** | | X | | | X | X | | | X | X | X | | | X | |
| **2.5 Product Specifications** | | | | X | | X | | | X | X | | | | | |
| **2.6 Trade Promotion Planning** | | X | | X | X | | | | | X | X | | | | |
| **2.7 Promotional Calendars** | | X | | X | X | X | | X | | | | | | X | |
| **2.8 Category Review & Brand Report** | X | X | X | X | | | | | | | | | | X | X |
| **2.9 Market Overview & APL** | | X | | X | X | | | | | | | | | X | |
| **2.10 Data Uploads** | | X | | X | X | | | | | | | | | X | |
| **2.11 Reports & Dashboards** | | X | | X | X | X | | | X | X | | X | | X | |
| **2.12 Intelligence** | | X | X | X | X | X | | | | X | X | | | X | |
| **2.13 File Repository** | | X | | | | | | | | | | | | | X |
| **2.14 DataHub** | | X | X | X | X | | | | | X | | | | | |
| **2.15 Platform Administration** | | X | | X | X | X | | | X | | | | X | | |

Notes on the main edges (detail and paths are in each module's "Cross-module dependencies" field):
- 2.1 to 2.3: Legacy invitations and sub-users read and write `Brand.Brands.UserID`, `Brand.BrandSubUsers`, `Brand.BrandBrokers`.
- 2.1, 2.2, 2.8 to 2.15: All mail goes through `SmtpMailService`, which logs every send to `Email.EmailLoggers`; the SNS webhook updates delivery status.
- 2.2 to 2.3, 2.4: A Brand organization creates its `Brand.Brands` row; the organization backfill reads legacy `BrandBrokers`; `BrandConnection.RegionID` references `CRM.Regions`.
- 2.3 to 2.10: Brand CSV import and export run through `IMasterDataUploadService`.
- 2.4 to 2.6, 2.10, 2.11: Banner unlink and SKU delete are blocked by promotion events; retailer and banner rename jobs update mapped data-upload records and monthly report rows.
- 2.5 to 2.6, 2.9, 2.10: Price writes reprice promotion events; product force delete removes APL rows; product updates push names and case packs into data-upload tables.
- 2.6 to 2.10, 2.11: The promotion product step pre-fills velocity from distributor sales; delete handlers trigger the monthly report refresh.
- 2.7 to 2.6: Calendars read `TradeSpend.TradeSpendPromoEvents` and reuse the `PromoEvents.tsx` drill-down.
- 2.7, 2.8, 2.9, 2.10, 2.11 to 2.14: Async exports and chunked imports use the shared `ExportJob`/`ImportJob` entities and job services.
- 2.8 to 2.3: Notify Brands and Email Brands pickers call `POST /api/v1/brands/users`; access helpers still read `Brand.BrandBrokers`.
- 2.11, 2.12 to 2.6: Roll-up, product report, forecast and monthly report read sandbox reporting versions and Brand Approved events; the AI internal-data path queries promotion tables.
- 2.14 to 2.10: DataHub writes, re-links and deletes KeHE, UNFI and distributor sales records; data-upload imports call DataHub mapping and are refused during a store clean-up.
- 2.15 to 2.4, 2.5, 2.6, 2.9, 2.13: Admin data cleanup rewrites banner SKU dates from Market Overview logs and syncs per-unit prices into events; the file key backfill fills `FileRepository.UserFiles.Key`.

## §5 Common Change Recipes
Every path below was checked to exist on the documented branches. Worked examples point at real code you can copy.

### 5.1 Add a field to an existing entity, end to end
Worked example already in the code: `MasterPack` on product specifications.
1. Entity property: `Modules/ProductSpec/Modules.ProductSpecs.Domain/ProductSpec/ProductSpec.cs` (entities derive from `AuditableEntity`).
2. EF mapping: `Modules/Shared/.../Persistence/MainDbContext.cs` `OnModelCreating` (block for `ProductSpecifications`, `ToTable(..., SchemaNames.ProductSpecs)`). Mapping is inline in `MainDbContext`, not separate configuration classes. Only touch `ApplicationDbContext` for Identity tables.
3. Migration: `Database/Migrator/Migrations/<timestamp>_<PascalName>.cs` (+ `.Designer.cs`, `MainDbContextModelSnapshot.cs`), e.g. `20260702055635_MasterPackColumnAddedInProductTable.cs`. `dotnet ef migrations add <Name> --context MainDbContext --project caboodle/src/Database/Migrator/Migrator.csproj --startup-project caboodle/src/Hosts/API/API.csproj`. Two contexts exist, so `--context` required. Migrations apply automatically at API start (`InitializeMainDbAsync`).
4. DTO: `Modules/ProductSpec/.../DTOs/ProductSpecsDTO.cs`.
5. Request + validator + handler (write): `Modules/ProductSpec/.../ProductSpecifications/UpsertProductSpecRequest.cs`. Request, `AbstractValidator`, and handler sit in one file. A PUT overwriting the whole row must carry the new field or it is stored as null.
6. Dapper read SQL: `Modules/ProductSpec/.../ProductSpecifications/GetProductsSpecRequest.cs` (`p."MasterPack" AS "MasterPack"`). Quote identifiers exactly; filter `"Deleted" = false`.
7. Import/export: `Modules/ProductSpec/.../ExportImport/{ImportProductsRequest,ExportProductsRequest}.cs` (only if entity imported/exported).
8. Web model: `caboodle.web/src/models/product.interface.ts` — use `number | null` for optional numeric fields.
9. Web service/UI: `caboodle.web/src/service/product.service.ts`; UI `app/(brand)/[brandID]/(product-specs)/products/ProductForm.tsx`, `ProductsRowTemplate.tsx`, `products/[productID]/ProductOtherInfo.tsx`.
10. Admin (if admin edits entity): `caboodle.admin/src/interface/productSpec.interface.ts`, `caboodle.admin/src/component/ProductSpec/AddProductSpec.tsx`.
11. Test: backend `tests/ProductSpecs.Application.Test/ProductSpecifications/`; web `src/__tests__/`. Run `dotnet test caboodle.sln` and `yarn test`.

### 5.2 Add a backend endpoint
1. Request + handler + validator: `Modules/<Module>/Modules.<Module>.Application/<Feature>/<Verb><Thing>Request.cs` (pattern: `UploadChunkForKeHEImportRequest.cs`). `IRequest<TResponse>`, `AbstractValidator<T>`, `IRequestHandler<,>`. Validators discovered by each module's `AddValidatorsFromAssembly` and run at model binding (no MediatR behaviors). Throw errors with `ErrorHelper.Throw*`.
2. Controller action: `Hosts/API/Controllers/<Area>/<Name>Controller.cs` deriving `VersionedApiController`; call `Mediator.Send(...)`. Route prefix `api/v{version}/<controller>`.
3. Authorization attribute: exactly one of `[RequireModule(brandSlug, brokerSlug, ModuleActions.X)]` with optional `CrossBrand = true` or `OrganizationLevel = true`; `[RequireOrgPermission(OrgPermissions.X)]`; `[MustHavePermission(CaboodleAction, CaboodleResource, CaboodleModule)]` for platform endpoints; or `[AllowAnonymous]`. `MapControllers().RequireAuthorization()` makes auth default. For create-or-update action, gate with `View` and call `IAccessContext.DemandModuleAsync(..., Create or Update)` in handler.
4. Authorization coverage test: `tests/API.Test/Authorization/EndpointAuthorizationCoverageTests.cs` and `bare-endpoints-baseline.txt`. Test fails if new action has no rule or two rules, or platform controller lacks platform permission. Do not add new lines to baseline (it "only shrinks").
5. Handler tests: `tests/<Module>.Application.Test/` (xUnit + Moq).
6. Front end: web `service/<domain>.service.ts` + `hooks/<domain>.ts`; admin `services/*.service.ts` + `hooks/*.ts`.

### 5.3 Add a module slug and gate a new screen
1. Slug constant: `BuildingBlocks/Core/Shared/Authorization/ModuleSlugs.cs` (same slug may exist for both audiences).
2. Catalog seed: `Modules/Admin/.../Configuration/Seeding/ModuleCatalogSeedData.cs` (`BrandRoots`, `BrokerRoots`, `Dependencies`). Seeded through `POST /api/v1/configurations/modules/seed`.
3. Data migration for existing databases: new migration modelled on `20261010090710_AddBrandReportModule.cs`. Inserts into `"Configuration"."Modules"`, `"ModuleDependencies"`, backfills `"ModuleAssignments"` and copies `"Organization"."BrandAccessModules"` grants, all guarded by `NOT EXISTS`. Without it, existing tenants never see module.
4. Endpoints: `[RequireModule(...)]` on each action (5.2). `EveryModuleSlugExistsInTheCatalog` in API test checks step 2.
5. Web slug and route map: `constants/moduleConstants.ts` (`MODULE_SLUGS`, then `BRAND_ROUTE_MODULES` keyed by first segment after `[brandID]`, or `BROKER_ROUTE_MODULES`/`BROKER_COMPANY_LEVEL_ROUTES` keyed by first segment). `ModuleRouteGuard` reads through `resolveRouteModuleGate` (`helper/moduleAccess.helper.ts`). `DEFAULT_MODULE_ACCESS` is false, so slug API never returns hides screen.
6. Web nav entry: `helper/appNav.helper.ts` (`moduleSlug` on `INavItem`, `companyLevel` for brokerage company access).
7. Controls: `useModuleAccess()` (`hooks/moduleAccess.ts`): `can(slug, action)`, `hasCompanyModule`, `anyBrandCan`. Hide controls while `isLoading`.
8. Test: `__tests__/helper/moduleAccess.test.ts`, `appNav.helper.test.ts`; backend `API.Test`.

### 5.4 Add an organization permission or role
1. Permission constant: `OrgPermissions.cs` (constant + `All` list). Dot-separated lowercase key, e.g. `member.invite`.
2. Role definition: `OrgRoles.cs` (`System` list: id, key, name, organization type, full brand access flag, permissions). Fixed GUIDs for system roles.
3. Seeding: `OrganizationRoleSeeder.cs` (`ICustomSeeder`) runs at startup and adds/removes role permissions to match `OrgRoles.System`. No migration needed for permission rows.
4. Enforcement: `[RequireOrgPermission(OrgPermissions.X)]` on actions or `IAccessContext.DemandOrgPermissionAsync` in handlers.
5. Web: `ORG_PERMISSIONS` in `access.interface.ts`; check with `useAccess().hasPermission`; nav action can carry `permission` (`appNav.helper.ts`).
Platform (admin-app) permission instead: `CaboodlePermissions.cs` (`CaboodleResource` constant + entry in permission list); seeded to ADMIN role by `ApplicationDbSeeder.cs`; enforced with `[MustHavePermission(...)]`.

### 5.5 Add a web route and page with a nav entry
1. Page: Brand `app/(brand)/[brandID]/<segment>/page.tsx`; broker `app/(broker)/<segment>/page.tsx`; company admin `app/(company)/company/<segment>/page.tsx`. Group layout supplies session check, `AppContainer`, React Query and interceptor. Start page with `HeaderWithBack.tsx` as sibling of content card.
2. Gate: `moduleConstants.ts` route map (5.3 step 5).
3. Nav entry: `appNav.helper.ts` (`buildBrandNavItems` builds URLs from resolved brand id, never raw route param; or `buildBrokerNavItems`; or `buildNavActions` for toolbar shortcut). Quick jump picks it up automatically (`flattenNavScreens` in `quickJump.helper.ts`); rail and header share model.
4. Data: 5.9. Brand-scoped calls send `BrandID` from `useParams().brandID`.
5. Test: `__tests__/helper/appNav.helper.test.ts`; page suites under `__tests__/app/`. `yarn test`.

### 5.6 Add an admin page
1. Route: `admin/src/app/(mainApp)/<route>/page.tsx` (thin wrapper, e.g. `domains/page.tsx` rendering `component/Organization/DomainsTable`). `(mainApp)` layout enforces session and renders `AdminLayout`.
2. Component: `admin/src/component/<Feature>/...`; tables on `TableWithHeaderAction.tsx`. Must work in light and dark themes (use tokens from `component/Antd/theme.ts` / Tailwind `data-theme`).
3. Service: `admin/src/services/<x>.service.ts` using `axiosInstanceFromClient` (client) or `httpClient` (server) with `appConfig.baseUrl`.
4. Hook + key: `admin/src/hooks/<x>.ts` with `QueryKeys` member in `admin/src/enums/index.ts`.
5. Nav: `admin/src/component/Layout/Sidebar/navConfig.tsx` (`title`, `href`, `icon`, `hint`).
6. Test: no admin test runner; verify with `yarn lint` and manual run.

### 5.7 Add a chunked import provider
1. Job type: `ModuleType` member in `Enums.cs`.
2. Chunk request: new `UploadChunkFor<X>ImportRequest.cs` modelled on `UploadChunkForKeHEImportRequest.cs`: create/reload `ImportJob`, `IFileStorageService.UploadChunkAsync`, on last chunk `IJobService.Enqueue<IImportJobService>(s => s.ExecuteImportAsync(jobId, brandId, userId, ModuleType.X, CancellationToken.None))`. Chunk 1 carries `fileSize`.
3. Processing: add `case ModuleType.X` to `ImportJobService.ExecuteImportAsync`; interface `IImportJobService.cs`; status DTO `ImportJobStatusDto`. Status values 5/7/10 (in progress) and 15/17/20/25 (terminal); `outcome` 5/10/15.
4. Endpoints: `POST <area>/import/chunk` and `GET <area>/import/{jobId}/status` with `[RequireModule(..., ModuleActions.Import)]`.
5. Web service: `chunked-import.service.ts`: add to `ChunkedImportProvider`, add `PROVIDER_BASE_PATH`, add `start<X>Import` method only if endpoint needs start step.
6. Web UI: reuse `useChunkedImport`; clone status block of `DistributorSalesReportImport.tsx`; mount in `BulkUploader.tsx` via `customUploadHandler` + `statusContent` (and `disableDismiss` while active). Reference consumer: `CategoryReviewImport.tsx`.
7. Test: backend `tests/DataUpload.Application.Test/Requests/`; web `__tests__/hooks/useChunkedImport.test.tsx`, `__tests__/service/chunkedImport.fileSize.service.test.ts`.

### 5.8 Add a recurring Hangfire job
1. Executor: interface deriving `ITransientService` (auto-registered by `Common/Startup.cs` `AddServices`) + class, e.g. `UnverifiedAccountCleanupJobExecutor.cs`. Add `[DisableConcurrentExecution(seconds)]` or `[AutomaticRetry(Attempts = 0)]` on interface method when needed.
2. Registrar: `IHostedService` that calls `RecurringJob.AddOrUpdate<IExecutor>(jobId, x => x.ExecuteAsync(), cron, TimeZoneInfo.Utc)` inside `ApplicationStarted.Register(...)`, e.g. `UnverifiedAccountCleanupJobRegistrar.cs`. For config-driven on/off schedule copy `StoreCleanupNightlyRelinkJobRegistrar.cs` (`RemoveIfExists` when disabled). Registering after start guarantees Hangfire storage ready.
3. Wire: `.AddHostedService<YourRegistrar>()` in module's `Startup.cs`.
4. Config (optional): section in `appsettings.{Development,Staging,Production}.json` + options class (5.10).
Notes: one worker per process (`HangfireSettings:Server:WorkerCount` 1), queue `default`; check dashboard at `/jobs`.

### 5.9 Add a React Query hook and a `QueryKeys` entry (web)
1. Key: `enums/index.ts` `QueryKeys`. Never inline a string key.
2. Service call: `service/<domain>.service.ts` using default export of `AxiosInterceptor.tsx` in browser (`httpClient` from `axiosConfig.ts` only server side), URL `${CABOODLE_API_URL}/api/v1/...`. Pass `BrandID` per call from route param; `OrganizationID` and `Authorization` added by interceptor. Raw `fetch` goes through `fetchWithMock.ts`.
3. Hook: `hooks/<domain>.ts` with `useQuery`/`useMutation`; key `[QueryKeys.x, ...params]`; usual options `keepPreviousData`, `refetchOnWindowFocus: false`, `retry: false`. Use `isFetching` for spinners when `keepPreviousData` on; mutations call `showErrorNotification` in `onError` and invalidate named set in `onSuccess`.
4. Mock (optional): `mocks/mockApi.ts`/`mockData.ts` for `USE_MOCK_DATA`.
Test: `__tests__/hooks/` with `renderWithProviders`/`createTestQueryClient` (`test-utils.tsx`); services under `__tests__/service/`. Admin equivalent: `admin/src/enums/index.ts` + `admin/src/hooks/` (no tests).

### 5.10 Add an environment variable or configuration key
Backend: 1. Add key to `appsettings.Development.json`, `appsettings.Staging.json`, `appsettings.Production.json` (or `appsettings.json` for shared). 2. Add options class with `SectionName` constant (pattern `StoreCleanupSettings.cs`) and `services.Configure<T>(config.GetSection(...))` in module `Startup.cs` (pattern `Organization/.../Startup.cs`). 3. Inject `IOptions<T>`. Environment variables override JSON (`Configurations/Startup.cs`), using `__` for nesting. Do not commit secret values.
Web: 1. Add variable to all six files `.env.{development,dev.production,dev.backend,staging,qa,production}`. 2. Read through `process.env.X`, ideally exported once from `constants/appConstants.ts`. 3. `NEXT_PUBLIC_*` values inlined at build time (Docker `ARG BUILD` picks script, which picks file), so change needs rebuild; anything without prefix server only (NextAuth `options.ts`).
Admin: same across `.env.{development,staging,production,backend}`; read from `appConstant/constant.ts` `appConfig`; never put secret on `appConfig` (imported by client components).
Test: backend options binding tests in `tests/<Module>.Application.Test/`. Web no env test harness; constants test such as `themeConstants.test.ts` shows style.

## Traceability
- Source: `docs/feature-context.md` §4-§5
- Related KB pages: `wiki/architecture.md`, `wiki/tech-stack.md`, `wiki/module-catalog.md`