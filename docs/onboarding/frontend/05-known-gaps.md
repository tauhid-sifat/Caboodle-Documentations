# Known Gaps, Half-Built Features & Risks

> Audience: Business Analyst. This is the honest list of things that are **incomplete, inconsistent, or work differently than expected** — the things that matter most when writing requirements. Everything here is grounded in the actual code (cited). Items marked ⚠ are security/data-integrity risks worth escalating.

---

## A. Authorization & multi-tenant security

This is the single most important theme for a BA. The platform *looks* like it has fine-grained role-based permissions, but in practice most enforcement is weak or frontend-only.

1. **⚠ Brand roles are granted no permissions in code.** The startup seeder assigns permission claims only to **ADMIN, BROKER, BROKERSUBUSER** — there is **no branch for BRANDOWNER, BRANDSUBUSER, or UNASSIGNED** (`ApplicationDbSeeder.cs:38-59`). The only way a brand role could gain a permission is an admin manually granting it at runtime. *Consequence:* every permission-gated endpoint is effectively **ADMIN-only** unless permissions are hand-configured per deployment (Unclear from code whether any deployment does this).
2. **⚠ 16 controllers have no permission checks at all** (authenticated-only). This includes all of **Trade Spend, Trade Spend Sandbox, Reports, Dashboard, the UNFI/KeHe/SPINS/Distributor-Sales endpoints, Export, and FileRepository**. Any logged-in user can reach them; the only protection is in-handler brand scoping (see [Role & Permission Matrix](02-role-permission-matrix.md)).
3. **How access actually works:** endpoints without `[AllowAnonymous]` still require a valid login (a global `RequireAuthorization()` default policy, `Startup.cs:98`), and tenant isolation depends on each handler filtering by the current user's brand ID. Where a handler forgets that filter, cross-tenant access is possible.
4. **⚠ Frontend authorization is not a security boundary.** No brand page has a server-side role or ownership check (only authentication); the user's role is read from a **client-writable Zustand store that defaults to `BRANDOWNER`** (`roleStore.ts:11`), and trade-spend access is enforced only by **hiding menu items** (`SideBarMenus.tsx:84`) — the routes themselves have no guard. Broker routes have no role guard either.
5. **⚠ Cross-tenant data risks in specific handlers:**
   - Deleting trade-spend **promotions** has no brand-ownership check (`DeleteTradeSpendPromotionsRequest.cs:46-67`).
   - Sandbox **event deletion** is scoped by event ID only, not promotion or brand (`DeletePromotionalEventsRequest.cs:104`).
   - Sandbox **event edit** checks the promotion ID but not the brand (`UpdatePromotionalEventRequest.cs:111`).
   - **File download** returns a file by ID with **no ownership/brand check** (cross-tenant read).
6. **⚠ `TRUNCATE` wipes all tenants:** the retailer-promo-rules "delete all" runs `TRUNCATE TABLE` with no brand scoping — it clears **every brand's** rules (`DeleteRetailerPromoRulesRequest.cs:34`).
7. **⚠ All-tenant data migration exposed as an endpoint:** `plans/add-default` rewrites default pipelines for **every brand** and is unguarded (`CreateDefaultPlanRequest.cs:29-55`). Similar all-tenant `add-default` patterns should be treated as admin-only operations.
8. **⚠ Master-password back door:** login can be satisfied by a configurable master password that bypasses the user's own password (`TokenService.cs`).
9. **Wrong-permission bug:** deleting a Distributor is guarded by the *Retailer* delete permission (`DistributorsController.cs:360`).
10. **Credentials protected by a read permission:** DataHub credential create/update/delete are guarded only by the **View** permission (not a write permission), and several DataHub sync/list and **all** Export endpoints have no permission attribute; some imports are `[AllowAnonymous]`.
11. **Privacy defaults to Public:** new FileRepository folders and files default to `PrivacyType = Public`.

---

## B. Intelligence / "Ask Caboodle" — spec vs. reality

The spec at `docs/ASK Cab.md` describes an enterprise-grade AI querying module. The **safety core is real** (an LLM produces a JSON QueryPlan, and a deterministic backend compiles **SELECT-only, parameterized** SQL against a table allow-list with `Deleted=FALSE` injected). But most advertised enterprise controls are **missing or stubbed**:

| Specced control | Reality |
|---|---|
| Read-only database role | ❌ Not found — uses the app's normal DB credentials; "read-only" is only a keyword scan |
| Query cost guard (`EXPLAIN`) | ❌ Not found |
| Rate limiting / token budgets | ❌ Not found (only a ~20-message-per-session cap) |
| Semantic / query-plan / result caching | ❌ Not found (only an in-memory session cache) |
| Max joins ≤ 3 | ❌ Not enforced — the `MaxJoins=7` setting is dead code; join count is unbounded |
| Explainability ("how was this calculated?") | ⚠ Plumbed but ignored |
| Audit logging | ⚠ Partial — does **not** persist the generated SQL or QueryPlan (only a hash); the audit row is soft-deletable, so not immutable |
| Per-tenant isolation | ⚠ Partial — tables without a `BrandID` column get **no** tenant filter; no OrgId; permission-failure path never fires |
| Prompt guard | ✅ Basic (regex/keyword + 100-char cap) |

- **Auth:** the Intelligence controller has no permission attributes; admin-only operations (evaluation runs, master-entity rebuild) are not enforced as admin.
- **LLM provider** is pluggable — OpenAI `gpt-4o` (default), Gemini `gemini-2.5-flash`, or Anthropic `claude-sonnet-4-6`; cost estimation runs only on the Claude path.
- The **frontend `api/ai-message` route is a canned-response placeholder** not wired to this backend at all.

---

## C. Scaffolded / unfinished features

1. **Store module is domain-only.** It has a single `Store` entity but **no application layer, service, or endpoints** — you cannot manage stores through it. (Store data is actually served via CRM's `StoresController`, which routes to DataHub.) There's also a duplicate `Store` entity across two modules.
2. **`DeleteBrandRequest` has a handler but no controller endpoint** — brand deletion is unreachable through the API. The handler also sets `Deleted=true` but may not persist it (no save call observed).
3. **`AliasMatchAttempt`** (a full entity-resolution suggestion/review schema) is dead scaffolding — nothing writes to or reads it.
4. **Monthly-report forecast calculator** exists as a shared service but is **not wired to any endpoint**.
5. **Commented-out endpoints / dead code:** master-data upload has commented-out CRM/banner-retailer endpoints (`MasterDataUploadController.cs:200-224`); CRM Store endpoints are commented out; profile phone-number update is commented out.
6. **Untyped statuses:** `BannerSKU.Status` is a raw integer with no enum defining its values.
7. **Dead configuration:** unused High/Medium confidence thresholds in Entity Resolution; `jaro_winkler` referenced but never registered (silently dropped).

---

## D. Data-integrity bugs (verified in code)

1. **ProductSpecs "safe delete" reference checks query the wrong table** — the "is this product on a price list / APL?" guards both actually query `CRM.BannerSKUs` (copy-paste), so they don't protect as intended (`DeleteProductsSpecRequest.cs:84-107`).
2. **UPC duplicate check uses the raw value** while the stored UPC is stripped of punctuation, so punctuation-only variants can pass the check and then collide.
3. **Sandbox deletes events with a hard SQL `DELETE`** (permanent, no audit) while everything else soft-deletes (`DeletePromotionalEventsRequest.cs:102-111`).
4. **KeHe legacy import success message is inverted** — it says "uploaded successfully" only when there *are* invalid records (`ImportKeHERequest.cs:99`).
5. **`RemoveUnassignedUsersRequest` uses `DELETE … INNER JOIN`**, which PostgreSQL does not accept — likely fails at runtime; plus contradictory success messaging.
6. **Bulk submission-status distributor filter references an un-joined table alias** — passing `DistributorIDs` would produce failing SQL (`UpdateSubmissionStatusOfEventsRequest.cs:183`).
7. **EDLP upsert snaps Regular-event dates to Jan 1–Dec 31** instead of honoring entered dates (`UpsertEDLPOnlyPromotionRequest.cs:269-270`).
8. **Delete-Plans guard is inverted** — it treats plans that *have* tasks as deletable and only blocks when *all* selected plans have tasks (`DeletePlansRequest.cs`).
9. **KeHe entity-resolution audits are tagged as UNFI** (`ResolveUnmappedRecordCommand.cs:135`).
10. **Frontend product form always calls `addProduct`** and never its update hook — editing may create duplicates.

---

## E. Behaviors that surprise (not bugs, but requirement-relevant)

1. **Trade-spend promo status is never set by the live module** — the approval lifecycle a BA would expect (Pending → RetailerApproved → Completed) is not implemented in the trade-spend handlers; status only propagates when a promo is duplicated. **This is a major gap if the business assumes an approval workflow exists.**
2. **List/detail views hide records whose related master data was soft-deleted** (inner joins) — a promo whose only product was deleted disappears from the list; "event not found" can mean "a related retailer/banner/product was deleted."
3. **Price lists have no end date** — price history is a series of `ValidFrom`-dated rows; there is no explicit "price valid until."
4. **Editing a price's effective date creates a new price row** rather than updating the existing one.
5. **Saving a product auto-generates empty price rows** for every eligible leaf distributor and soft-deletes the old category's price rows.
6. **Duplicated promos inherit submission/status/sandbox links** rather than starting fresh.
7. **Monthly-report entities store distributor/retailer/banner/product as plain text**, not IDs — denormalized snapshots with no relational link.
8. **No database-level foreign keys or cascade rules** exist on the core business entities — all relationships are logical ID references, and every cascade is application logic. Referential integrity depends entirely on handler code.

---

## F. Validation quirks

1. **`NotEmpty()` on non-nullable numbers rejects a legitimate `0`** — affects trade-spend/sandbox average-weekly-sales and banner `DoorCount` (a banner with 0 doors, or a 0 velocity, can't be saved).
2. **No client-side password-strength rules** — signup/reset only require a non-empty password matching its confirmation; any complexity policy is backend-only.
3. **Login email is not format-validated on the frontend**, unlike signup/forgot-password (an inconsistency).
4. **Some duplicate-name errors are returned as HTTP 404** rather than a validation error (e.g. ProductSpecs), which can confuse API consumers.

---

## G. Naming & structural inconsistencies

1. **Live vs sandbox naming divergence:** live uses `TradeSpendPromo`/`TradeSpendPromoEvent`; sandbox uses `Promotion`/`PromotionalEvent` for the same concepts.
2. **Brand module namespace is plural (`Brands`)** while folders are singular; a typo project `Modules.Brands.Application.csproj` references a non-existent domain project (broken/dead).
3. **Two "DC" concepts** (`DistributionCenter` vs `DistributorDc`) — which one various `DCID` fields target is unconfirmed.
4. **Two `Store` entities** (CRM module and Store module).
5. **`MarketOverview.SKUID`** — ambiguous whether it targets a BannerSKU or a ProductSpecification.
6. **Backup/duplicate project files** (`* - Backup.csproj`, `ProductSpec.csproj`) are build noise.
7. **Hard-coded broker email** drives a special promo-query path in production code (Broker module).

---

## How to use this list

- When gathering requirements for **any promotional-approval, permission, or multi-brand feature**, assume the current enforcement is thinner than the UI implies and validate the specific handler.
- Treat section **B** (Ask Caboodle) as a **backlog of unbuilt controls**, not existing capabilities.
- Treat sections **A** and **D** as candidates for **defect tickets / security review**, not documentation of intended behavior.
- Where an item says "Unclear from code," that is a genuine open question for engineering, not an omission in this document.
