---
type: Document
title: "FileRepository, Report \u0026 Dashboard Modules"
---

# FileRepository, Report & Dashboard Modules

> Business-analyst onboarding notes for three of the "thinner" Caboodle backend modules. Written in plain business English. Every factual claim cites `path.cs:line` relative to the backend root (`/d/Projects/caboodle.backend`). Where the code does not make something clear, it is called out as "Unclear from code".

## Cross-cutting notes that apply to all three modules

- **No permission checks anywhere in these three controllers.** A repo-wide search for `MustHavePermission` / `Authorize` across the FileRepository, Report, and Dashboard controllers returned nothing. Every endpoint below is therefore **unprotected by a module/resource/action permission**. The base controllers (`caboodle/src/Hosts/API/Controllers/BaseApiController.cs:5-11` and `VersionedApiController.cs:3-5`) carry only `[ApiController]` and a route template — no `[Authorize]` — so, per the platform's stated fallback, these endpoints fall back to **null / no permission requirement**. (Whether a *global* authentication filter still requires a logged-in user is not visible in these files — Unclear from code.)
- **`[BrandIDHeader]`** appears on most brand-facing endpoints. It signals the endpoint expects the caller's active brand to be supplied via an HTTP header; the current user's brand is then read server-side (e.g. `_currentUser.GetBrandID()`). It is a *context* marker, not a *permission* check.
- Domain entities inherit `AuditableEntity`, so records are **soft-deleted** (flagged `Deleted = true`) rather than physically removed.
- Data access uses two styles: `IRepository<T>` (Entity Framework, object-based) and `IDapperRepository` (raw SQL). Reports/Dashboard lean heavily on raw SQL against a multi-schema Postgres database (schemas like `"CRM"`, `"ProductSpecs"` are referenced by name).

---

## FileRepository

Controllers: `caboodle/src/Hosts/API/Controllers/Modules/FileRepository/DirectoryController.cs`, `.../FilesController.cs`.
Domain: `caboodle/src/Modules/FileRepository/Modules.FileRepository.Domain/`.
Application: `caboodle/src/Modules/FileRepository/Modules.FileRepository.Application/`.

### Purpose
A file-repository / document library where users can organise files into folders (directories), upload and download files, search, move, rename, and delete them. It serves **both** brand users and brokers — nearly every operation has a plain (brand) variant and a `broker/...` variant. Files themselves live in an external file store (see Entities); the database only tracks metadata and folder structure.

### Entities
- **FileDirectory** (a folder) — `Modules.FileRepository.Domain/Directory/FileDirectory.cs`. Fields: optional `BrandID` (line 7), `Name` (line 8), `DirectoryType` (line 9), optional `ParentDirectoryId` for nesting (line 10), owning `UserId` (line 11), and a `PrivacyType` that defaults to **Public** (line 12). It is an aggregate root and auditable/soft-deletable (line 5).
- **UserFile** (a file) — `Modules.FileRepository.Domain/File/UserFile.cs`. Fields: `UserId` (line 16), optional `BrandID` (line 17), optional `DirectoryId` (folder it sits in, line 18), `Name` (line 19), `Size` in bytes (line 20), `Extension` (line 21), `Url` (line 22 — where the physical file is stored), and `PrivacyType` defaulting to **Public** (line 23).
- **Storage backing:** files are handled through an `IFileStorageService` abstraction — upload (`UploadFileRequest.cs:122`), multipart **chunked** upload (`UploadChunkFileRequest.cs:125`), copy+delete for moves (`FileMoveRequest.cs:115-116`), remove on delete (`DeleteFileRequest.cs:95`), and a **generated file URL** on download (`FileDownloadRequest.cs:59`). Chunked upload plus URL generation strongly imply an S3-style object store, but the concrete implementation (e.g. AWS S3) is not in these files — Unclear from code.

### Operations (endpoints)
Folders — `DirectoryController.cs`:
- Get one folder (with sorting) — `GET` (line 12-26).
- Search folders + files by name, scoped by `PrivacyType` and optional brand — `GET search` (line 28-44).
- Get the folder tree from a folder down — `GET tree` (line 46-60).
- Get the parent-path breadcrumb for a folder — `GET parent` (line 62-70).
- Get the root folder tree + files (brand) — `GET root` (line 72-87); broker equivalent `GET broker/root` (line 89-103).
- Create a folder (brand) — `POST` (line 105-114); broker `POST broker` (line 116-124).
- Upload a whole folder tree at once (brand) — `POST tree` (line 126-135); broker `POST broker/tree` (line 137-145).
- Rename/update a folder (brand) — `PUT` (line 147-156); broker `PUT broker` (line 158-166).
- Delete a folder (brand) — `DELETE` (line 168-177); broker `DELETE broker` (line 179-187).
- Download a folder as a file (zip/stream) (brand) — `GET download` (line 189-197); broker `GET broker/download` (line 199-206).

Files — `FilesController.cs`:
- Upload a file (brand) — `POST upload` (line 13-23); broker `POST broker/upload` (line 112-121).
- Upload a file chunk-by-chunk (brand) — `POST upload/chunk` (line 25-56); broker `POST broker/upload/chunk` (line 123-153).
- Download a file — returns a URL (brand) — `GET download` (line 58-66); broker `GET broker/download` (line 155-162).
- Delete a file (brand) — `DELETE {id}` (line 68-81); broker `DELETE broker/{id}` (line 164-176).
- Move a file to another folder (brand) — `PUT move` (line 83-97); broker `PUT broker/move` (line 178-191).
- Rename a file (brand) — `PUT rename` (line 99-108); broker `PUT broker/rename` (line 193-201).

Access scoping is applied inside the query specifications, e.g. broker-owned folders (`Specifications/GetDirectoriesOfBrokerSpec.cs`), files by user (`GetFileByUserIDSpec.cs`), brand-user folder/file (`GetFileDirectoryOfBrandUserSpec.cs`, `GetFileOfBrandUserSpec.cs`), and broker-user files (`GetFileofBrokerUserSpec.cs`). Exactly how each spec limits rows was not read line-by-line — Unclear from code beyond the filenames' intent.

### Who Can Access
- **Every FileRepository endpoint listed above has NO permission attribute** (no `MustHavePermission`, no `Authorize`) — confirmed by search across both controllers. There is a "brand" set of endpoints and a parallel "broker" set (the `broker/...` routes), but the separation is by *route*, not by an enforced permission. So role restriction, if any, is not enforced at the controller — Unclear from code (would depend on a global filter not present in these files).

### Gaps / Open Questions
- No endpoint-level authorization: any authenticated caller could, on the evidence here, hit both brand and broker routes. Worth confirming with backend whether a global auth policy compensates.
- `FileDownloadRequest` looks up the file by ID and returns a URL **without checking the caller owns/belongs to that file's brand or user** (`FileDownloadRequest.cs:44-60`) — potential cross-tenant access. Flagging, not fixing.
- `PrivacyType` defaults to **Public** for both folders and files — confirm this is the intended default.

---

## Report

Application only: `caboodle/src/Modules/Report/Modules.Report.Application/`.
Controller: `caboodle/src/Hosts/API/Controllers/Modules/Report/ReportsController.cs`.

### Purpose
Read-only reporting endpoints for **brand** users. Each endpoint aggregates data (mostly via raw SQL) and returns a shaped DTO for the frontend's report screens. Also provides file exports (Excel/stream) for some reports.

### What Reports Exist (the endpoints this controller exposes)
1. **Products report** — `GET products` (`ReportsController.cs:12-24`). Per-SKU promo vs non-promo case volumes broken down by month, with grand totals; defaults to the current year (DTO: `ProductsReportDTO`/`SKUSummaryDTO`, `DTOs/ReportDTOs.cs:8-96`). This is the SKU velocity/volume report.
2. **Sandbox roll-up (trade-spend) report** — `POST roll-up/sandbox-promotions` (line 26-35). Returns banner-level trade-spend calculations (`BannerReportResponseDTO`).
3. **Brand-approved promotions roll-up report** — `POST roll-up/brand-approved-promotions` (line 37-46). Same shape (`BannerReportResponseDTO`), for approved promotions rather than sandbox.
4. **Brand market-overview report** — `GET brand-market-overview` (line 48-89). Paged list of SKU/banner/retailer/region/store/DC distribution rows with heavy filtering (statuses, banners, retailers, SKUs, DCs, stores, regions, date range, training/case-stack flags). DTO `BrandMarketOverViewReportDTO` (`ReportDTOs.cs:141-166`).
5. **Market-overview export** — `GET brand-market-overview-export` (line 91-126). Same data as #4, streamed out as a downloadable file.
6. **Market-overview filter options** — `GET brand-market-overview-filters` (line 128-137). Returns the dropdown option lists (retailers, stores, DCs, regions, banners, SKUs, statuses) to drive #4's filters. DTO `BrandMarketOverviewFilterDTO` (`ReportDTOs.cs:168-188`).
7. **Retail report** — `GET retail-report` (line 139-168). Paged retailer/banner list with filters (retailer, banner, product name, status, date range). DTO `RetailReportDTO` (`DTOs/RetailReportDTO.cs:2-8`).
8. **Retail report — products** — `GET retail-report/product/{id}` (line 170-191). Products under a given banner (`RetailReportProductDTO`).
9. **Retail report — activities** — `GET retail-report/activities/{id}` (line 193-216). Activity/notes log for a banner over a date range (`RetailReportActivityDTO`).
10. **Sales tracker report** — `POST sales-tracker` (line 218-227). Per-banner counts of SKUs by status (Active, Pending, NotActive, Declined, Discontinued, Approved, Commit). DTO `SalesTrackerReportDTO` (`DTOs/SalesTrackerReportDTOs.cs:38-49`).
11. **Forecast data export** — `POST forecast-data-export` (line 229-237). Streams forecast data (from the sandbox) out as a downloadable file.

**Reports the task asked about that this module does NOT expose:** there is **no APL report** and **no category-review report** in this controller. Those surfaces live outside the Report module (the broker-side controllers — e.g. `MarketOverviewsController.cs` and broker/category-review controllers — not in scope here). The "banner report" is delivered here as the two **roll-up** endpoints (#2, #3) returning `BannerReportResponseDTO`, not a standalone `/banner` route.

There is also a **monthly-report forecast calculator** in this module (`MonthlyReport/ComputeMonthlyReportForecastRequest.cs`, `MonthlyReportForecastCalculator.cs`, `IMonthlyReportRefreshJobService.cs`) — but it is **not wired to any endpoint in `ReportsController`**. Search shows it is consumed by other modules/infrastructure (TradeSpend and Shared.Infrastructure), i.e. it is a shared/background service, not a report surfaced by this controller.

### Who Can Access
- **All 11 endpoints have NO permission attribute** (no `MustHavePermission`, no `Authorize`). Every one carries `[BrandIDHeader]` **except** `POST forecast-data-export` (line 229-237), which has neither — so that export endpoint has no brand-context marker at all. Role enforcement is not present at the controller level — Unclear from code whether a global filter restricts these.

### Gaps / Open Questions
- No authorization on any reporting endpoint despite returning brand-scoped commercial data. Confirm a global auth layer exists.
- `forecast-data-export` lacks `[BrandIDHeader]` while every sibling has it — confirm the brand scope is derived some other way, or this is an oversight.
- APL and category-review reports are **not** in this module — the BA should look to the Broker module for those.

---

## Dashboard

Application only: `caboodle/src/Modules/Dashboard/Modules.Dashboard.Application/`.
Controller: `caboodle/src/Hosts/API/Controllers/Modules/Dashboard/DashboardController.cs`.

### Purpose
Supplies the summary widgets on the brand home dashboard. Very thin — two read-only endpoints, both brand-scoped, both built from raw SQL / shared calculations.

### What It Returns
1. **Product status summary** — `GET product-status-summery-report` (`DashboardController.cs:9-18`). For the current user's brand, it counts each product's SKUs (banner-SKUs) by status and rolls them up by category → product, giving **Active / Discontinued / NotActive** counts per product. Built by a raw SQL query joining `"CRM"."BannerSKUs"`, `"ProductSpecs"."ProductSpecifications"`, and `"ProductSpecs"."Categories"`, filtered to the caller's brand (`Requests/ProductStatusSummaryReportRequest.cs:69-96`; status codes: 1 = Active, 5 = Discontinued, 3 = NotActive, lines 77-79). Uncategorised products fall under a placeholder "Uncategorized" category (line 74). DTO `ProductStatusSummeryReportDTO` (`DTOs/ReportDTOs.cs:2-41`).
2. **Roll-up report** — `GET roll-up-report` (`DashboardController.cs:20-29`). A single set of trade-spend totals for the brand's dashboard: **GrossRevenue, NetDollar, TPRSpend, AddFee, TPRAddFeePercentage** (`RollUpReportForDashboardDTO` → `CalculationPropertiesDTO`, in `Modules/Shared/Modules.Shared.Application/DTOs/TradeSpendDTOs.cs:262-268` and `247-254`). The handler for this request lives in the **Report** module (`GetRollUpReportForDashboardRequest.cs`), which the Dashboard controller reuses — it aggregates promotion events and price lists to compute the totals.

Note the DTO is named `ProductStatusSummeryReportDTO` ("Summery" — a pre-existing spelling that also appears in the route `product-status-summery-report`). Kept verbatim so searches match.

### Who Can Access
- **Both endpoints have NO permission attribute** (no `MustHavePermission`, no `Authorize`). Both carry `[BrandIDHeader]` (lines 12 and 23) and read the brand from the current user, so they are brand-scoped by context but not by an enforced permission. Role restriction is not enforced at the controller — Unclear from code.

### Gaps / Open Questions
- Same authorization gap as the other two modules: no endpoint-level permission on brand-scoped commercial metrics.
- Only two widgets are backed here (product-status counts and a trade-spend totals card); any other dashboard widgets the frontend shows must be sourced from other modules — Unclear from code which.
- The dashboard's roll-up reuses the Report module's handler, so the two modules are coupled; changes to the Report roll-up logic affect the dashboard card.
