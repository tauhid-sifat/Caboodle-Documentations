---
type: Document
title: "Known Gaps, Half-Built Features \u0026 Risks"
---

# Known Gaps, Half-Built Features & Risks

*Items found in code that BAs should know about when writing requirements. Each cites a source.*

---

## Incomplete or not-implemented features

| Item | Evidence | Business impact |
|------|----------|-----------------|
| Some report export types throw `NotImplementedException` | `ExportKeHEReportByTypeRequest.cs`, `ExportUNFIReportByTypeRequest.cs`, `ExportDistributorSalesReportByTypeRequest.cs` | Users selecting certain report types will get errors — exact types depend on enum values passed |
| Message provider/client not implemented | `MessageProvider.cs`, `MessageClient.cs` throw `NotImplementedException` | No messaging/notification infrastructure active |
| Cache key service not implemented | `CacheKeyService.cs` throws `NotImplementedException` | Caching may be partially functional only |
| Store module is orphan Domain only | `Modules.Store.Domain` exists; no Application project; CRM owns store CRUD | Do not reference Store as a separate module in requirements |
| Dashboard module is minimal | Only `ProductStatusSummaryReportRequest` in Application | Limited dashboard backend support |
| DataSyncJobService hardcodes BrandName = "Brand" | `DataSyncJobService.cs` line 311 `// TODO: Lookup` | Sync run metadata may show placeholder brand name |

---

## Security & authorization risks

| Risk | Evidence | Recommendation for BAs |
|------|----------|------------------------|
| ~18 of 38 controllers have no permission checks | Controller audit; only `RequireAuthorization()` globally | Brand-scoped endpoints rely entirely on `BrandID` header validation — document this in security stories |
| BRANDOWNER/BRANDSUBUSER have zero permission claims | `ApplicationDbSeeder.cs` | Do not assume permission matrix covers brand user capabilities |
| Some DataHub endpoints are `[AllowAnonymous]` | `DataHubController.cs` lines 36, 47, 109, 779 | Flag for security review; may be dev-only |
| AdminController has `[AllowAnonymous]` endpoint | `AdminController.cs` line 26 | Verify production exposure |
| UsersController has multiple `[AllowAnonymous]` endpoints | `UsersController.cs` | Registration/password reset — expected, but verify scope |
| JWT does not contain permissions | `TokenService.cs` | Permission changes take effect on next request (cached per user) |
| Credential manager uses View permission for writes | `CredentialManagerController` | Misleading permission name — all CRUD gated by View |
| Default admin password in seeder | `ApplicationDbSeeder.cs` `admin@caboodle.com` / `123456` | Production deployment concern |

---

## Frontend/backend inconsistencies

| Gap | Evidence |
|-----|----------|
| `masterPack` field not in frontend | Backend `ProductSpecification` has field; `product-spec-master-pack-fe-integration.md` describes it; grep found no frontend usage |
| No Next.js middleware for role-based routing | No `middleware.ts` in either frontend repo; menu hiding only |
| Frontend `UserRole` enum missing ADMIN | Expected — admin uses separate app |
| Admin route group is `(mainApp)` not `(admin)` | `Caboddle Admin Web/src/app/(mainApp)/` |
| Commented-out broker redirect logic | `HeaderComponent.tsx`, `SideBarMenus.tsx` — navigation behavior may change |
| `category-review.tsx` folder name in brand routes | Unusual `.tsx` in directory name — possible routing quirk |

---

## Data model inconsistencies

| Issue | Evidence |
|-------|----------|
| Duplicate `Store` entity | `Modules.Store.Domain/Store/Store.cs` mirrors `Modules.CRM.Domain/Store/Store.cs` |
| Distributor delete uses Retailers.Delete permission | `DistributorsController.cs` — possible copy-paste error |
| Broker and BrokerSubUser have identical permission sets | `CaboodlePermissions.Broker` and `.SubBroker` use same filter |
| Promotion has no top-level status in sandbox | Only event-level `PromotionEventStatus` — BAs should not write stories assuming promo-level approval |

---

## Async/job patterns BAs should account for

| Pattern | Evidence | User expectation |
|---------|----------|------------------|
| Data sync is background job | `DataSyncJobService` | User must poll `DataSyncRun` status, not expect synchronous completion |
| Import/export jobs are async | `ImportJob`, `ExportJob` domain entities | Poll job status endpoints |
| Backfill jobs are async | `retailer-matching-backfill-fe-integration.md`, DataHub backfill handlers | Poll via `GET /Export/admin/{jobId}/status` |
| Push to BAP is synchronous | `PushPromotionToTradeSpendRequest` | Immediate success/failure response |
| Re-push replaces all live events | `PushPromotionToTradeSpendRequest` handler | Users should be warned about overwrite behavior |

---

## Missing documentation files

Referenced in existing docs but **not present** in `caboodle/docs/business/`:

- `entity-resolution-fe-integration.md`
- `unmapped-distinct-values-fe-integration.md`
- `brand-data-cleanup-fe-integration.md`

Admin frontend implements features for entity resolution and brand data cleanup, but formal integration docs are missing.

---

## Mapping business rules that commonly surprise users

| Rule | Source |
|------|--------|
| Auto-resolved retailer/store rows do NOT auto-promote | `UnmappedRecordBase.CanPromoteToMappedDuringSync()` |
| Ignored dimension makes entire row Ignored | `ComputeOverallStatus()` |
| BannerSKU delete blocked by sandbox event reference | `DeleteBannerSKURequest.cs` |
| NumberOfStores cannot exceed banner door count | `UpsertPromotionRequest.cs` |
| Distributor markup must be ≥ 0 | `ConnectRetailerToDistributorRequest.cs` |
| Master data upload unrecognized names create stub mappings | `MasterDataUploadService` |
| Default roles cannot be modified/deleted | `RoleService.cs`, `CaboodleRoles.IsDefault()` |

---

## Items requiring further code investigation

These were not fully traceable from code review and should not be assumed:

| Question | Why unclear |
|----------|-------------|
| Exact list of unimplemented report export types | Depends on runtime `ReportType` enum value — would need enum + switch statement cross-reference |
| Whether `[AllowAnonymous]` DataHub endpoints are disabled in production | Configuration-dependent |
| Full list of SPINS report capabilities | Multiple SPINS entities exist; not all may have UI |
| Pipeline module frontend completeness | Pipeline pages exist in brand app; depth of feature not fully audited |
| Intelligence module guardrails and query limits | Domain exists; full constraint set not exhaustively reviewed |
