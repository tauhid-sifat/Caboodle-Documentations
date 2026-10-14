---
type: Document
title: "DataHub Module"
---

# DataHub Module

> Audience: Business Analysts. Plain-English walkthrough of the backend DataHub module. Every factual claim cites `path.cs:line` (backend root `/d/Projects/caboodle.backend`). Where the code does not make something clear, the text says so explicitly.

---

## Purpose

DataHub is the module that sits **downstream of the Data Upload module**. Data Upload runs background imports of external distributor data (UNFI, KeHE, SPINS) and produces "mapped" rows (where an external identifier was successfully matched to a canonical Caboodle record) and **"unmapped" rows** (where a raw external value — a retailer name, a store/customer name, or a UPC — could not be matched). DataHub is where those unmapped rows get investigated and resolved into canonical entities, where the health of the mapping process is monitored, where third-party distributor login credentials are stored, and where large data extracts are exported.

DataHub is organised into several functional areas, each with its own controller or code folder:

- **Entity Resolution** — the canonical "master list" of unified entities (retailers, stores, products, etc.) and their aliases, plus the matching engine that suggests which canonical entity an unmapped raw value belongs to (`EntityResolutionController.cs`, `Modules.DataHub.Application/EntityResolution/`).
- **Sync Mechanism / Unmapped Records** — runs data syncs and lists/resolves the unmapped rows produced by them (`DataHubController.cs`, `Application/SyncMechanism/`).
- **Admin & Mapped Dashboards** — coverage, quality, trends, and business-metric summaries (`DataHubController.cs`, `Application/AdminDashboard/`).
- **Credential Manager** — encrypted storage of third-party distributor credentials (`CredentialManagerController.cs`).
- **Export** — background jobs that produce downloadable CSV extracts (`ExportController.cs`).

The four controllers in scope all inherit from `VersionedApiController`, which has no class-level `[Authorize]` attribute of its own, so each endpoint's protection depends entirely on the attribute placed on that individual method (see **Who Can Access**).

---

## Domain Entities

Located in `Modules.DataHub.Domain/`. All inherit `AuditableEntity`, so all support soft delete via a `Deleted` flag (EF queries auto-filter deleted rows; raw Dapper SQL must filter `"Deleted" = FALSE` by hand — e.g. `ResolveUnmappedRecordCommand.cs:58`).

### Entity Resolution entities

- **UnifiedEntity** (`EntityResolution/UnifiedEntity.cs`) — a canonical master record. Has an `EntityType` (Retailer, Store, Product, Brand, etc. — `Enums.cs:312`), a `DisplayName` (`UnifiedEntity.cs:23`), optional `Description`/`MetadataJson`, a `LifecycleStatus` (Active / Inactive / Archived — `Enums.cs:368`), and a collection of aliases (`UnifiedEntity.cs:31`). Its "primary alias" is the one flagged primary **and** approved (`UnifiedEntity.cs:33`).
- **UnifiedEntityAlias** (`EntityResolution/UnifiedEntityAlias.cs`) — one raw spelling/variant that points to a UnifiedEntity. Stores the `RawValue` as received, a cleaned `NormalizedValue`, the `SourceProvider` (Manual/KeHe/Unfi/Spins/etc. — `Enums.cs:344`), a `Status` (Suggested / Approved / Rejected / Deprecated / Merged — `Enums.cs:335`), a `ConfidenceLevel` and numeric `ConfidenceScore` (`UnifiedEntityAlias.cs:55-59`), and review-tracking fields `SuggestedBy` / `ReviewedBy` / `ReviewedOn` / `ReviewNotes` (`UnifiedEntityAlias.cs:63-69`).
- **UnifiedEntityAliasAudit** (`EntityResolution/UnifiedEntityAliasAudit.cs`) — an immutable log row written every time an alias changes status, capturing previous status, new status, who changed it, when, and notes (`UnifiedEntityAliasAudit.cs:12-20`).
- **AliasMatchAttempt** (`EntityResolution/AliasMatchAttempt.cs`) — a record of a proposed match: raw value, normalized value, a `ProposedUnifiedEntityId`, `SimilarityScore`, `Algorithm`, `ConfidenceLevel`, and reviewer decision fields (`AliasMatchAttempt.cs:14-42`). **See Gaps** — this table exists and has a repository, but no in-scope endpoint writes or reviews it.

### Sync / Unmapped entities

- **UnmappedRecordBase** (`SyncMechanism/UnmappedRecordBase.cs`) — the shared shape of an unmapped row (concrete tables `UnmappedUNFIRecord` and `UnmappedKeHeRecord`). Each row tracks **three independent dimensions** — Retailer, Customer/Store, and UPC — each with its own `MappingDimensionStatus` (Mapped / Unmapped / ManuallyResolved / Ignored — `Enums.cs:419`), a resolved id, and the raw value (`UnmappedRecordBase.cs:16-24`). A row is **fully resolved** only when all three dimensions are Mapped or ManuallyResolved (`UnmappedRecordBase.cs:27-30`). The `OverallStatus` (PendingReview / PartiallyResolved / FullyResolved / Ignored — `Enums.cs:427`) is recomputed by `UpdateOverallStatus()` (`UnmappedRecordBase.cs:32-54`): any Ignored dimension makes the whole row Ignored; all-resolved makes it FullyResolved; some-resolved makes it PartiallyResolved; otherwise PendingReview.
- **DataSyncRun**, **UnmappedRecordResolutionAudit** (`SyncMechanism/`) — a sync execution and an audit of a resolution pass (audit status enum InProgress/Completed/PartiallyCompleted/Failed — `UnmappedRecordResolutionAudit.cs:26-32`).
- **StoreListEntry** (`StoreList/StoreListEntry.cs`) — a store master row (retailer name, banner, store name, address, geo, source provider). Used as the naming source when resolving store/customer values.
- **DistributorUpcMapping** (`UpcMapping/`) — a UPC-to-product mapping used to resolve unmapped UPC values.

### Supporting entities

- **ThirdPartyCredential** (`CredentialManager/Credential.cs`) — `BrandID`, `Provider`, `Username`, and `PasswordCipher` (the password is stored **encrypted**, never in plaintext — `Credential.cs:11`).
- **ExportJob** (`Export/ExportJob.cs`) — a background export job with status (Pending/Running/Done/Failed/Cancelled — `Enums.cs:215`), progress counters, and S3 file location fields (`ExportJob.cs`).
- **ImportJob** (`Import/ImportJob.cs`) — mirror of ExportJob for chunked S3 imports; not driven by the four in-scope controllers.

---

## Entity Resolution Workflow (suggestion → review → approve)

### The canonical model
Every retailer, store, product, etc. that DataHub knows about is a **UnifiedEntity** with one or more **aliases**. When an unmapped raw value (e.g. the retailer string "WHOLE FOODS MKT #123" from a UNFI file) can be tied to a UnifiedEntity via an approved alias, that value becomes resolvable.

### 1. Suggestion (matching + confidence)
The suggestion engine is **EntityResolutionMatcher** (`Application/EntityResolution/Services/EntityResolutionMatcher.cs`). Given an entity type and a raw value, it:

1. **Normalizes** the raw value via `EntityNormalizationService` (`Services/EntityNormalizationService.cs`) — trims, strips diacritics, lower-cases, removes punctuation, collapses whitespace (`EntityNormalizationService.cs:26-40`), expands abbreviations (e.g. "st"→"saint", "ave"→"avenue" — `EntityResolutionOptions.cs:38-50`), and removes stop-words (e.g. "inc", "llc", "market", "foods" — `EntityResolutionOptions.cs:32-36`).
2. **Looks for an exact alias match** on the normalized value; if found it is scored `1.0` and flagged as an exact hit (`EntityResolutionMatcher.cs:36-46`).
3. **Fetches up to 25 candidate entities** and scores the raw value against each candidate's aliases and display name using an ordered set of **matching strategies** (`EntityResolutionMatcher.cs:48-93`):
   - `exact` — case-insensitive equality → score 1.0 (`DefaultMatchingStrategies.cs:6-19`).
   - `prefix` — one string starts with the other → length-ratio score plus 0.2 (`DefaultMatchingStrategies.cs:21-47`).
   - `token_set` — fuzzy token-set ratio via the `FuzzySharp` library, 0–1 (`DefaultMatchingStrategies.cs:49-63`).
4. **Keeps only candidates scoring at or above the "suggested match cutoff" of 0.65** (`EntityResolutionMatcher.cs:84`, threshold at `EntityResolutionOptions.cs:14`), sorts them best-first, and returns them (`EntityResolutionMatcher.cs:95-100`).

The one place this engine is actually invoked is the **"List unmapped raw values"** endpoint (`POST /mapping/unmapped` → `GetUnmappedEntitiesQuery.cs:103`). For each distinct unmapped raw value it returns the top-scoring suggested entity name, id, and confidence score (`GetUnmappedEntitiesQuery.cs:110-117`). This is the screen where a reviewer sees "raw value X → we think this is entity Y (confidence 0.87)".

Configured confidence thresholds are High = 0.92, Medium = 0.75, SuggestedCutoff = 0.65 (`EntityResolutionOptions.cs:10-14`). **Only the 0.65 cutoff is actually applied in code**; the High/Medium thresholds are defined but not referenced by the matcher (see Gaps).

### 2. Review — how a raw value becomes an alias
A human reviewer takes a suggested raw value and attaches it to an entity in one of two ways:

- **Bulk-map** (`POST /mapping/unmapped/bulk-map` → `BulkMapUnmappedValuesCommand`): maps a list of raw values to one existing UnifiedEntity (`DataHubController.cs:572-585`).
- **Attach alias** (`POST /entities/{id}/aliases` → `AddUnifiedEntityAliasCommand.cs`): adds a single alias to an entity.

Either way the alias is created through `UnifiedEntityService.AddAliasInternalAsync` (`Services/UnifiedEntityService.cs:200-259`), which:
- Rejects an exact-duplicate raw value on the same entity (`UnifiedEntityService.cs:213-217`).
- Rejects a normalized value that already belongs to a **different** entity, telling the user to merge instead (`UnifiedEntityService.cs:222-241`).
- **Always creates the alias with status `Suggested`** (`UnifiedEntityService.cs:248`), regardless of the confidence passed in — even a manually typed alias enters as Suggested and must be approved separately (see Gaps).

### 3. Approve / reject
A reviewer changes an alias's status via `PUT /aliases/{aliasId}/status` (`EntityResolutionController.cs:116` → `ChangeAliasStatusCommand.cs`). The service sets the new status, records the reviewer id and timestamp, and writes a `UnifiedEntityAliasAudit` row for the transition (`UnifiedEntityService.cs:87-104`). Valid target statuses are Approved, Rejected, Deprecated, or Merged (`Enums.cs:335`). This endpoint corresponds to the **"Approve Entity Resolution Suggestions"** permission (`CaboodlePermissions.cs:141`).

Related management operations:
- **Create entity** with optional aliases — `POST /entities` (`EntityResolutionController.cs:79`).
- **Update entity** display name/description — `PUT /entities/{id}`; the OpenAPI note says name changes propagate to KeHe/UNFI mapped reports in the background (`EntityResolutionController.cs:90-98`).
- **Merge entities** — `POST /entities/merge`: copies all aliases from a source entity into a target of the same type, then archives the source (`UnifiedEntityService.cs:106-151`). Fails if types differ (`UnifiedEntityService.cs:119-122`).
- **Seed** unified retailers/customers from KeHE uploads — `POST /entities/seed/kehe-retailers|kehe-customers` (`EntityResolutionController.cs:138-158`).

### Applying resolutions to the actual data rows
Once aliases and UPC mappings exist, unmapped rows are re-processed:
- **Bulk resolve / re-resolve by value** endpoints (`DataHubController.cs:591-694`) resolve every unmapped row sharing a given raw retailer, store, or UPC value to a chosen target (or mark them Ignored), updating both UNFI and KeHe unmapped tables. Re-resolve variants exist to correct a previous resolution.
- **Re-Process Mapping** (`POST /unmapped/resolve` → `ResolveUnmappedRecordsCommand.cs`) is a **system-wide** pass: it finds all unmapped UNFI and KeHe rows whose `OverallStatus` is already `FullyResolved` and moves them into the mapped tables, writing a per-brand resolution audit (`ResolveUnmappedRecordCommand.cs:35-157`).

---

## Credential Manager

Stores per-brand login credentials for third-party distributor portals (`CredentialManagerController.cs`). A credential holds `BrandID`, `Provider`, `Username`, and an **encrypted** password (`Credential.cs`). On create, the password is encrypted via `ICredentialCryptoService.Encrypt` before storage (`CreateCredentialRequest.cs:42`), and a uniqueness check prevents duplicate Brand+Provider+Username+Password rows (`CreateCredentialRequest.cs:64-72`). Operations: search (paged, filter by brand/provider), get-by-id, create, update, delete (`CredentialManagerController.cs:10-84`). These credentials are what the sync/crawler process uses to log into UNFI/KeHE to download data.

---

## Export

Produces large data extracts as background jobs writing CSV files to S3 (`ExportController.cs`, `Export/ExportJob.cs`). Flow:
1. **Start** (`POST /export/start`, requires a BrandID header) creates an `ExportJob` row and enqueues a background job (`StartExportRequest.cs:44-79`). The caller gets a `JobId` back immediately.
2. **Poll status** (`GET /export/{jobId}/status`) returns progress and, when finished, a download URL (`ExportController.cs:19-28`).
3. **Admin variants** (`POST /export/admin/start`, `GET /export/admin/{jobId}/status`) do the same without a BrandID header (`ExportController.cs:30-48`).

Supported export types are KeHE, UNFI, SPINS, StoreList, MonthlyReport, and DistributorSalesReport; any other module type is rejected with a validation error (`StartExportRequest.cs:20-52`). Output content type is `text/csv` (`StartExportRequest.cs:64`).

---

## Business Rules & Validation

- **Validators auto-run** on requests (FluentValidation `AbstractValidator`/`CustomValidator`); a failure returns HTTP 400. Examples: `AddUnifiedEntityAliasCommandValidator` requires a non-empty entity id and a raw value ≤ 512 chars (`AddUnifiedEntityAliasCommand.cs:21-35`); `ChangeAliasStatusCommandValidator` requires a non-empty alias id (`ChangeAliasStatusCommand.cs:16-22`).
- **Alias uniqueness**: no duplicate exact raw value on one entity; no normalized value shared across two entities (merge instead) (`UnifiedEntityService.cs:213-241`).
- **New aliases always start as `Suggested`** (`UnifiedEntityService.cs:248`).
- **Entity display name cannot be empty** (`UnifiedEntity.cs:48-50`); a duplicate display name for the same type is rejected on create (`UnifiedEntityService.cs:41-45`).
- **Merge** requires matching entity types and different ids (`UnifiedEntityService.cs:108-122`).
- **Fully-resolved definition** for unmapped rows: all three dimensions Mapped/ManuallyResolved (`UnmappedRecordBase.cs:27-30`).
- **Credential uniqueness** on Brand+Provider+Username+Password (`CreateCredentialRequest.cs:64-72`); passwords always encrypted (`CreateCredentialRequest.cs:42`).
- **Export type whitelist** (`StartExportRequest.cs:20-52`).
- **Soft delete**: Dapper queries filter `"Deleted" = FALSE` explicitly (`ResolveUnmappedRecordCommand.cs:58,111`); EF filters automatically.

---

## Key Operations

| Operation | Endpoint | Handler / logic |
|---|---|---|
| List unmapped raw values with match suggestions | `POST /mapping/unmapped` | `GetUnmappedEntitiesQuery.cs` (invokes matcher) |
| Bulk map raw values to an entity | `POST /mapping/unmapped/bulk-map` | `BulkMapUnmappedValuesCommand` |
| Bulk resolve / re-resolve retailer, store, UPC by value | `POST /unmapped/resolve-*-by-value`, `/unmapped/re-resolve-*-by-value` | `SyncMechanism/Commands/BulkResolve*`, `BulkReResolve*` |
| System-wide re-process of resolved rows | `POST /unmapped/resolve` | `ResolveUnmappedRecordsCommand.cs` |
| Search / view unified entities | `GET /entities`, `GET /entities/{id}` | `GetUnifiedEntitiesRequest`, `GetUnifiedEntityDetailsQuery` |
| Create / update / merge entity | `POST /entities`, `PUT /entities/{id}`, `POST /entities/merge` | `UnifiedEntityService.cs` |
| Attach alias / change alias status | `POST /entities/{id}/aliases`, `PUT /aliases/{id}/status` | `AddUnifiedEntityAliasCommand.cs`, `ChangeAliasStatusCommand.cs` |
| Execute data sync / list sync runs | `POST /sync`, `GET /sync-runs`, `GET /sync/dashboard` | `SyncMechanism/Requests` |
| Credential CRUD | `/credentials` (GET/POST/PUT/DELETE) | `CredentialManagerController.cs` |
| Start / poll export | `POST /export/start`, `GET /export/{jobId}/status` (+ admin) | `Export/Requests` |

---

## Who Can Access

The base `VersionedApiController` carries **no** class-level authorization, so protection is per-endpoint. Permissions follow `[MustHavePermission(action, resource, module)]` → `Permissions.DataHub.EntityResolution.{Action}`. The three seeded EntityResolution permissions are: **View** = "View Entity Resolution Records", **Upsert** = "Manage Entity Resolution Records", **Update** = "Approve Entity Resolution Suggestions" (`CaboodlePermissions.cs:139-141`). ADMIN has all permissions; Broker roles are limited to the Broker module and would **not** hold DataHub permissions; Brand-owner permission grants are seeded elsewhere (not verifiable from these files — Unclear from code).

| Endpoint | Attribute | Permission required |
|---|---|---|
| `EntityResolution: GET /dashboard, /entities, /entities/{id}, POST /suggestions, /rules/apply` | View | View EntityResolution |
| `EntityResolution: POST /entities, /entities/{id}/aliases, /entities/merge, /entities/seed/*` | Upsert | Manage EntityResolution |
| `EntityResolution: PUT /entities/{id}` | Update | Approve EntityResolution |
| `EntityResolution: PUT /aliases/{id}/status` | Update | Approve EntityResolution ("Approve Suggestions") |
| `DataHub: GET /sync/dashboard, /summary, /sources, POST /mapped-dashboard/*, /mapping/unmapped, GET /unmapped/product-suggestions` | View | View EntityResolution |
| `DataHub: POST /mapping/unmapped/bulk-map, /unmapped/resolve-*-by-value, /unmapped/re-resolve-*-by-value` | Upsert | Manage EntityResolution |
| `DataHub: POST /import/unified/retailer, /import/unified/store, /health/crawler, /validate-mapping-status` | **`[AllowAnonymous]`** | **NONE — public** |
| `DataHub: POST /import/mapping-data, /sync, /map-existing-data, /report-sync/*` | **none** | **No attribute — flag** |
| `DataHub: GET /sync-runs, /sync-runs/{id}, /unmapped/dashboard, /unmapped/records, /unmapped/retailers, /unmapped/customers, /unmapped/upcs, /unmapped/audits, POST /unmapped/resolve, /unmapped/unfi\|kehe/records-by-status, GET /mapped/kehe, /mapped/unfi, /mapped/upcs` | **none** | **No attribute — flag** |
| `CredentialManager: GET /credentials, /credentials/{id}` | View | View EntityResolution |
| `CredentialManager: POST/PUT/DELETE /credentials` | **View** | **View EntityResolution — flag (write ops guarded only by View)** |
| `Export: POST /start, GET /{jobId}/status` | none (`[BrandIDHeader]` only) | **No permission — flag** |
| `Export: POST /admin/start, GET /admin/{jobId}/status` | **none** | **No attribute, no brand scoping — flag** |

---

## Dependencies

- **Data Upload module** — upstream producer of the raw UNFI/KeHe records and the unmapped rows DataHub resolves; DataHub also references `DataUpload.Application.Requests.ReportSync` (`DataHubController.cs:18`).
- **Shared module** — `ISharedDataHubService` moves resolved rows into mapped tables (`ResolveUnmappedRecordCommand.cs:19,88,141`); `IBulkRepository`, `IDapperRepository`, `IRepository<T>`, `MainDbContext` (schema `DataHub`).
- **Product / Product Spec** — UPC resolution targets a `ProductSpecificationId` (`DataHubController.cs:636`).
- **Retailer / Store** — retailer/store resolution uses retailer ids and `StoreListEntry` names (`DataHubController.cs:591-623`).
- **BuildingBlocks** — shared enums (`Enums.cs`), permissions (`CaboodlePermissions.cs`), `ICurrentUser`, `ICredentialCryptoService`, `IJobService` (background jobs), FluentValidation.
- **External libraries** — `FuzzySharp` (fuzzy string matching), AWS S3 (export/import file storage).
- **Postgres, schema `DataHub`** — all tables live under the `DataHub` schema (`MainDbContext.cs:491`; raw SQL uses `"DataHub"."..."`).

---

## Gaps, TODOs & Inconsistencies

1. **AliasMatchAttempt is dead scaffolding (in scope).** The table, entity, and repository methods (`AddMatchAttemptAsync`, `GetPendingMatchAttemptsAsync` — `UnifiedEntityRepository.cs:33,118`) exist, and the domain has full reviewer-decision fields, but **no in-scope command/endpoint writes or reviews match attempts**. It is read only for dashboard counts (`GetDataHubAdminSummaryQuery.cs:39`, `GetDataHubSourceStatusQuery.cs:87`). A formal "suggestion→review→approve" queue implied by the schema is not implemented — suggestions are computed on the fly by `GetUnmappedEntitiesQuery` and never persisted.
2. **Configured confidence thresholds partly unused.** `HighConfidenceThreshold` (0.92) and `MediumConfidenceThreshold` (0.75) are defined (`EntityResolutionOptions.cs:10-12`) but the matcher only applies `SuggestedMatchCutoff` (0.65) (`EntityResolutionMatcher.cs:84`). There is no code mapping a numeric score to a `ConfidenceLevel` enum in the matcher; the returned confidence is the raw score only.
3. **`jaro_winkler` strategy referenced but not registered.** It is in the default/config strategy order (`EntityResolutionOptions.cs:29`, `MatchingStrategyResolver.cs:22`) but only `exact`, `prefix`, and `token_set` are registered in DI (`Startup.cs:22-24`), so the resolver logs a warning and silently drops it (`MatchingStrategyResolver.cs:31-34`). Fuzzy matching is weaker than the config implies.
4. **Manual aliases enter as `Suggested`.** `AddAliasInternalAsync` hard-codes `AliasStatus.Suggested` even when a manual alias is passed `ConfidenceLevel.Exact`/score 1.0 (`AddUnifiedEntityAliasCommand.cs:57-58` vs `UnifiedEntityService.cs:248`). A user who manually adds an alias must still separately approve it.
5. **Credential write operations are guarded only by the View permission.** Create, Update, and Delete on `/credentials` all use `CaboodleAction.View` rather than Upsert/Update/Delete (`CredentialManagerController.cs:45,56,76`). Anyone able to view credentials can also create/modify/delete them.
6. **Public and unauthenticated endpoints.** `import/unified/retailer`, `import/unified/store`, `health/crawler`, and `validate-mapping-status` are `[AllowAnonymous]` (`DataHubController.cs:26,37,99,722`). Many sync, unmapped-listing, mapped-listing, and audit endpoints have **no** authorization attribute at all, as do all four Export endpoints. The admin export endpoints additionally have no brand scoping.
7. **KeHe audit mislabels provider as UNFI.** In `ProcessUnresolvedKeHERecordsAsync` the audit row is created with `Provider = Provider.UNFI` (`ResolveUnmappedRecordCommand.cs:135`) inside the KeHe method — an apparent copy-paste bug that would misattribute KeHe resolution audits to UNFI.
8. **Alias validation message mismatch.** The 512-char rule reports "must not exceed 256 characters" (`AddUnifiedEntityAliasCommand.cs:32-33`).
9. **Brand-role permission seeding not verifiable** from these files (Unclear from code — where BRANDOWNER/BRANDSUBUSER get DataHub grants, if any).
