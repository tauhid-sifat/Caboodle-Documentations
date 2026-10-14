# Data Upload Module

> Audience: Business Analyst. Code-grounded; cites `path:line` in `caboodle.backend/`.

## Purpose

Data Upload ingests bulk data files from external syndicated-data and distributor sources — **UNFI**, **KeHe**, **SPINS** — plus **Master Data** (the brand's own CRM/product reference data) and **Distributor Sales** reports. It parses uploaded files, validates rows, optionally maps external identifiers to Caboodle's canonical entities, and stores the results so the reporting modules can query them.

## Data Sources

- **UNFI** and **KeHe** are natural-products distributors; their files carry product movement/sales (units, cases, dollars, wholesale price, dates, product and customer identifiers). Uploaded via `UNFIController` / `KeHeController`.
- **SPINS** is a syndicated retail-data provider; two file types exist — **Items Ranking** and **Stores Insight** (dollars, units, ARP, promo %, week-ending periods). Uploaded via `SPINSController`.
- **Master Data Upload** (`MasterDataUploadController`) bulk-imports the brand's own reference data: distributors, sub-distributors, retailers, contacts, banners, banner SKUs, categories, price lists, product specs, distributor-DC links, retailer-regions, regions, stores, distribution centers — and even raw KeHe/UNFI rows.
- **Distributor Sales Reports** (`DistributorSalesReportsController`) are read-only reporting endpoints over ingested distributor sales (sales by product/chain/store/city/state, velocity, DC report, warehouse, void, retail sales).

## The Upload → Validate → Map → Import Flow

**There are two distinct code paths, and they behave very differently:**

1. **Legacy / synchronous** (`ImportXxxRecordsRequest` handlers). The file is processed inside the web request. Rows are parsed and validated, valid rows are bulk-inserted **directly into the RAW provider table** (`Unfi`, `KeHe`, `SPINSItemsRanking`, `SPINSStoresInsight`), and **no mapping to canonical entities is applied**. Invalid rows are **skipped per-row** (valid rows still import) and returned as an **error CSV embedded in the HTTP response**.
2. **Chunked / background** (`UploadChunkForXxxImportRequest` handlers). The file is uploaded to S3 in chunks (multipart upload). When the last chunk lands, a **Hangfire background job** is enqueued (`IImportJobService.ExecuteImportAsync`) and the endpoint returns a **`JobId`** the client polls for status. The job downloads from S3, parses in batches of **5,000 rows** (`ImportJobService.cs:35`), validates, and — **for UNFI and KeHe only** — applies mapping. Error rows are written to an error CSV in S3 (`imports/errors/...`) and exposed as a presigned URL via the status endpoint.

**Which decision is made where — a key finding:** the "small file → synchronous, large file → chunked (≈30 MB)" split is **only documented in controller comments; it is not enforced by the backend.** There is no server-side size limit — the chunk endpoints are explicitly `[DisableRequestSizeLimit]` (`UNFIController.cs:604`, `KeHeController.cs:40`, `SPINSController.cs:44`). *The frontend decides which path to use.*

**Mapping (canonical-entity resolution) only happens on the background path, and only for UNFI/KeHe.** Those jobs call `SharedDataHubService.SaveUNFIWithUnmappedHandlingAsync` / `SaveKeHeWithUnmappedHandlingAsync`, which build alias/UPC/store/product lookups and split each file into four outputs: raw rows, **mapped** rows (`UNFIMapped` / `KeHeMapped`), **unmapped** rows (kept for later resolution), and **DistributorSalesRecord** rows (`SharedDataHubService.cs:394-436, 693-696`). **SPINS Stores Insight, even on the background path, is raw-only — it is never mapped** (`ImportJobService.cs:1451-1466`). **SPINS Items Ranking has no background path at all — it is synchronous-only** (there is no chunk handler or job branch for it).

### File parsing & header validation

All imports parse **CSV via the CsvHelper library** (no Excel/XLSX import). The shared `FileExportHelper.GetRecords<T>` (`Modules.Shared.Application/Common/FileExportHelper/FileExportHelper.cs:59-123`) does header validation **before** parsing: a column marked required (its mapping name contains a `[*]` marker) that is missing, **or** any header that doesn't match a known column, causes the **whole file to be rejected** with a validation error (`:74-118`). *Inconsistency:* the background job path uses its own local CSV readers that **skip** this header validation (`ImportJobService.cs:1249-1261` etc.), so a malformed header could be caught on the sync path but not on the chunked path.

### Invalid-row handling differs by endpoint

- Most legacy imports **skip bad rows and still import the good ones**, returning an error file.
- The **Master KeHe** import (`ImportMasterKeHeRecordsRequest`) instead **rejects the entire batch** if any error is found — it throws rather than returning a partial result (`MasterDataUploadService.cs:1322-1323`).

## Data Mapping

`DataMappingsController` manages the **mapping rules** that let the system translate external identifiers (e.g. a distributor's own customer/retailer codes and UPCs) into Caboodle's canonical Retailers/Distributors/Products. It supports listing, viewing, creating, and deleting mappings, importing/exporting mappings as files, a sample template, and filter data. These stored mappings feed the UNFI/KeHe background mapping step above; rows that can't be matched are retained as "unmapped" for later resolution (see [DataHub — Entity Resolution](data-hub.md)).

## Business Rules & Validation

- Legacy import validators only assert the uploaded file is present and non-empty; **all row/type/header validation is inside the handlers and `FileExportHelper`** (e.g. `ImportUNFIRecordsRequest.cs:31-40`).
- UNFI rows require a non-blank **UPC**; KeHe rows require a UPC; numeric/date columns are type-checked with per-column parsing, and cleaned of special characters before parsing (`ImportUNFIRecordsRequest.cs:71-226`).
- SPINS rows require a **TimePeriod**, parsed from a "# Week Ending mm/dd/yy" pattern via regex; bad formats are rejected (`ImportSPINSItemsRankingRecordsRequest.cs:148-196`).
- Chunk-upload validators enforce **`.csv` only** and sane chunk indices (`UploadChunkForUNFIImportRequest.cs:30-61`).
- *Bug:* the KeHe legacy import's success message is inverted — it emits "KeHE Data uploaded successfully" only when there *are* invalid records (`ImportKeHERequest.cs:99`).

## Who Can Access

| Endpoint group | Permission required | Notes |
|---|---|---|
| Data Mappings (all CRUD + import/export) | `Create` · `DataUpload` · `DataUpload` | `DataMappingsController.cs:11-134` — one permission gates everything, including deletes and exports |
| Master Data uploads (distributors, retailers, banners, price lists, etc.) | `Import` · `MasterDataUpload` · `DataUpload` | `MasterDataUploadController.cs:17-190` |
| Master Data exports | `Export` · `MasterDataUpload` · `DataUpload` | `MasterDataUploadController.cs:225-269` |
| **UNFI, KeHe, SPINS, Distributor Sales — all import, report, and delete endpoints** | **None** | ⚠ These controllers carry **no `[MustHavePermission]`** at all — not permission-gated. Access = baseline auth + in-handler brand scoping only. |

The `Import Data` / `Export Data` permissions are held by ADMIN (all permissions); whether brand users hold them is resolved in the [Role & Permission Matrix](../02-role-permission-matrix.md).

## Dependencies

- **DataHub / Shared** — `SharedDataHubService` performs the mapped/unmapped split; unmapped rows flow to Entity Resolution.
- **CRM & Product Specs** — Master Data Upload writes directly into CRM (distributors, retailers, banners, stores, regions, contacts) and Product Specs (categories, products, price lists).
- **Shared import infrastructure** — S3 file storage, Hangfire jobs, `ImportJob` status tracking (shared with the Trade Spend monthly-report actuals import).

## Gaps, TODOs & Inconsistencies

1. **UNFI/KeHe/SPINS/Distributor-Sales controllers have no permission checks** — unlike DataMappings/MasterData, these bulk-data endpoints are not RBAC-gated.
2. **The 30 MB sync-vs-chunked threshold is not enforced server-side** — it's a frontend convention; chunk endpoints disable size limits entirely.
3. **Header validation is inconsistent** between the sync path (validates) and background path (skips).
4. **Only UNFI/KeHe (background) produce mapped data**; SPINS is always raw, and every synchronous import is raw — worth knowing when reasoning about which reports have "mapped" vs "raw" data.
5. **Master KeHe rejects the whole file on any error**, unlike the per-row-skip behavior elsewhere.
6. **KeHe legacy success message is inverted** (`ImportKeHERequest.cs:99`).
7. **Commented-out endpoints** exist in `MasterDataUploadController.cs:200-224` (banner-retailer / crm) — scaffolding left in place.
