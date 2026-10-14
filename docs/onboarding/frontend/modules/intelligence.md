# Intelligence Module ("Ask Caboodle" / AI Query)

> Audience: Business Analyst (non-technical). Every claim below cites `path.cs:line`. Backend root: `/d/Projects/caboodle.backend`. Paths under `caboodle/src/Modules/Intelligence/...` are shortened where obvious.
> When something could not be determined from the code, it is called out as "Unclear from code."

---

## Purpose

The Intelligence module powers "Ask Caboodle" — a chat box where a user types a natural-language question ("show me KeHE sales for last year") and gets back a data-driven answer built from the platform's own database. The design intent is that the AI (an LLM) never writes raw SQL against the database; instead the AI produces a structured "plan" (JSON), and trusted backend code turns that plan into a safe, read-only SQL query. See the aspirational spec at `docs/ASK Cab.md`.

Two data domains are actually supported today:
- **Distributor Report** path — KeHE / UNFI distributor sales data (`Orchestration/PathAwareOrchestrator.cs:145-148`).
- **Internal Data** path — CRM and related internal tables (`PathAwareOrchestrator.cs:150-153`).

Anything else returns a canned "I can only help with those two" message (`PathAwareOrchestrator.cs:155-161`).

---

## What Actually Happens on a Chat Message (cited)

The user calls `POST /api/v{version}/intelligencechat/chat` (`Hosts/API/Controllers/Modules/Intelligence/IntelligenceChatController.cs:10-18`). That hands off to the orchestrator `PathAwareOrchestrator.ProcessAsync` (`Requests/ChatRequest.cs` handler → `PathAwareOrchestrator.cs:95`). Step by step:

1. **Identify user + brand, load/create the conversation.** `userId` and `brandId` come from the logged-in user (`PathAwareOrchestrator.cs:97-99`). A chat session is loaded or created (`:99`).
2. **Session length cap.** If the conversation already has 20 messages (`MaxSessionMessages`, `Configuration/IntelligenceOptions.cs:44`), it is refused (`PathAwareOrchestrator.cs:102-109`).
3. **Prompt Guard.** The raw message is screened by `PromptGuard.Check` (`PathAwareOrchestrator.cs:115`; `Planner/PromptGuard.cs:31-61`). Blocked → logged and refused.
4. **Intent classification (LLM).** `LlmIntentClassifier` decides whether the message is a runnable data question vs. chit-chat/ambiguous (`PathAwareOrchestrator.cs:129`). Non-queryable → a clarification reply (`:131-140`).
5. **Data-context classification (LLM).** `LlmDataContextClassifier` routes to Distributor Report or Internal Data (`PathAwareOrchestrator.cs:143-153`).
6. **Entity extraction + resolution** (Internal Data path only). An LLM extracts entity mentions (`LlmEntityExtractor`, `:306`) and `MasterEntityResolutionService` maps names → IDs using the `Intelligence.MasterEntities` table (`:307-309`).
7. **Planning (LLM).** The planner LLM returns a structured **QueryPlan JSON** (dataset, joins, measures, dimensions, filters, time range, sort, limit) — not SQL (`InternalDataLlmPlanner` `:317`; `InternalData/InternalDataQueryPlan.cs`).
8. **Compile plan → SQL (backend, deterministic).** `InternalDataSqlCompiler.Compile` builds a parameterized `SELECT` against an allow-list of tables, injecting `Deleted = FALSE` and the tenant `BrandID` filter (`InternalData/InternalDataSqlCompiler.cs:139-383`).
9. **Execute (read-only-by-convention).** `InternalDataExecutor.ExecuteAsync` runs the SQL via Dapper with a 30s timeout and a forbidden-keyword safety check (`InternalData/InternalDataExecutor.cs:27-110`).
10. **Compose the answer (LLM).** `ReportResponseBuilder` turns rows into a headline + structured report (`ReportResponse/ReportResponseBuilder.cs`), stored on the assistant message.
11. **Audit.** A `QueryAuditLog` row is written (`PathAwareOrchestrator.cs:427-431`, `PersistAuditAsync :526-537`).

The Distributor Report path (`RunPathAAsync`, `:177-283`) is the same shape minus entity resolution, using `DistributorReportLlmPlanner` → `DistributorReportCompiler` → `DistributorReportExecutor`.

There is also a separate, unused-in-chat frontend stub at `d:/Projects/caboodle.web/src/app/api/ai-message/route.ts` — a placeholder that returns canned replies and does NOT call this backend. Mentioned for completeness only.

---

## Domain Entities & Data Stored

- **ChatSession** (`Domain/Chat/ChatSession.cs`) — one conversation. Fields: `UserId`, `BrandId`, `Title`, `ConstraintYear`, `ConstraintModule`, `ConstraintEntitiesJson`, `LastActivityAt`. Soft-deletable (`AuditableEntity`, `:6`).
- **ChatMessage** (`Domain/Chat/ChatMessage.cs`) — user/assistant/system turns. Stores `Content`, `ResponseJson` (the structured report), `Intent`, `QueryPlanJson`, `GeneratedSqlHash` (hash, not the SQL), `TokensUsed`, `ExecutionTimeMs`, `RowsReturned`.
- **QueryAuditLog** (`Domain/Audit/QueryAuditLog.cs`) — per-request audit: `UserId`, `BrandId`, `SessionId`, `Prompt`, `Intent`, `Model`, token counts, `EstimatedCost`, `ExecutionTimeMs`, `RowsReturned`, failure type/message, response summary (truncated to 2000 chars, `:84`). Note fields `QueryPlanJson` and `GeneratedSql` exist but the orchestrator writes them as `null` (`PathAwareOrchestrator.cs:269-271`, `:427-429`).
- **MasterEntity** (`Domain/EntityResolution/MasterEntity.cs`) — name → real entity ID lookup table for entity resolution. Types: Product, Retailer, Banner, Distributor, Category, Store, Brand (`Domain/Enums/IntelligenceEnums.cs:46-55`).
- **QueryPlan** models (`Domain/Models/QueryPlan.cs`, `InternalData/InternalDataQueryPlan.cs`) — the structured plan shape.
- **Enums** (`Domain/Enums/IntelligenceEnums.cs`) — `IntentType`, `QueryFailureType` (includes `PermissionFailure`, `CostOrTimeoutFailure` — but see gaps), `CatalogAccessLevel`, `CatalogTenantScope`, `ChatMessageRole`, `MasterEntityType`.

---

## Spec vs Reality

Spec source: `/d/Projects/caboodle.backend/docs/ASK Cab.md`.

| Specced control | Status | Evidence / cite |
|---|---|---|
| **LLM orchestrator** (provider/model) | IMPLEMENTED | `PathAwareOrchestrator.cs` (whole file). Provider is configurable: `PlannerProviderType` OpenAI (default) / Gemini / Claude (`Configuration/IntelligenceOptions.cs:3-14`). Default models: OpenAI `gpt-4o` (`:18`), Gemini `gemini-2.5-flash` (`:23`), Claude `claude-sonnet-4-6` (`:28`). |
| **Prompt Guard** (injection / schema-probing defense) | IMPLEMENTED (basic) | `Planner/PromptGuard.cs:15-61` — regex blocklist (ignore-instructions, reveal-prompt, dump-schema, SQL DDL/DML, UNION SELECT, role-play) + sensitive-keyword list + a hard **100-character** max length (`:38`). Regex/keyword only; no LLM-based guard. |
| **Intent classification** | IMPLEMENTED | `IntentClassification/LlmIntentClassifier.cs`, wired at `PathAwareOrchestrator.cs:129`; enum `ConversationIntentType`. |
| **Entity Resolver** (name → ID) | IMPLEMENTED | `EntityResolution/LlmEntityExtractor.cs` + `InternalData/MasterEntityResolutionService.cs`, called at `PathAwareOrchestrator.cs:306-309`; backed by `MasterEntity` table. |
| **Query Planner → QueryPlan (JSON, not SQL)** | IMPLEMENTED | `InternalData/InternalDataLlmPlanner.cs:243-289` parses LLM JSON into `InternalDataQueryPlan`. LLM never emits SQL. |
| **QueryPlan Validator: max joins ≤ 3** | NOT FOUND | No join-count check anywhere. Config `MaxJoins = 7` (`IntelligenceOptions.cs:47`) is **dead** — grep shows it is never referenced in code. Compiler accepts any number of joins as long as each table is allow-listed (`InternalDataSqlCompiler.cs:157-166`). |
| **QueryPlan Validator: required limit** | IMPLEMENTED (defaulted, not rejected) | Compiler always applies a limit: `Math.Min(plan.Limit, 1000)` or default 100 (`InternalDataSqlCompiler.cs:369`). It defaults rather than rejecting unbounded plans. |
| **QueryPlan Validator: disallowed operators** | PARTIAL | Only a fixed operator whitelist is honored (eq/neq/gt/gte/lt/lte/in/between/ilike); anything else silently falls back to `=` (`InternalDataSqlCompiler.cs:725-735`). Column names are regex-validated (`:66`, `:437`). No explicit reject-with-error path. |
| **Permission Engine: per-tenant BrandId filtering / row-level security** | PARTIAL | `BrandID = @brand` is injected only for tables in `TablesWithBrandId` (`InternalDataSqlCompiler.cs:43-64`, `:247-253`); `Deleted = FALSE` on all tables (`:246`). Tables without a `BrandID` column (e.g. `CRM.Distributors`, `CRM.Retailers`, `CRM.Banners`, `CRM.Stores`) get **no tenant filter**. No `OrgId`. `QueryFailureType.PermissionFailure` enum exists but is never raised. |
| **Query Builder → SELECT-only** | IMPLEMENTED | `InternalDataSqlCompiler` only ever emits `SELECT` and uses parameterized values (`InternalDataSqlCompiler.cs:217-375`). |
| **Read-only DB role** (dedicated, no write privileges) | NOT FOUND | Execution uses the same `IDapperRepository` as the rest of the app (`InternalDataExecutor.cs:13`, `DistributorReportExecutor.cs:13`). Read-only is enforced only by a forbidden-keyword string check (`InternalDataExecutor.cs:98-110`), not a database-level read-only role. |
| **Query Cost Guard (EXPLAIN FORMAT JSON)** | NOT FOUND | No `EXPLAIN` anywhere in the module (grep: 0 hits). Only protections are a 30s timeout (`InternalDataExecutor.cs:35`, `IntelligenceOptions.cs:42`) and the row limit. `QueryFailureType.CostOrTimeoutFailure` exists but is unused by cost logic. |
| **Rate limiting / token budget caps** | NOT FOUND | No rate-limit, per-user daily token cap, per-hour execution cap, or tenant budget (grep: 0 hits). Only limiter is 20 messages per session (`IntelligenceOptions.cs:44`). |
| **Caching (semantic / queryplan / result)** | NOT FOUND (only session cache) | The only cache is an in-memory `IMemoryCache` for loading the ChatSession object (`Chat/ChatContextStore.cs:16,38-40`). No semantic, queryplan, or result cache. |
| **Audit logging** (prompt/intent/SQL/tokens/model/timestamp) | PARTIAL | `QueryAuditLog` captures prompt, intent, model, tokens, cost, exec time, rows, failure, timestamp (via `AuditableEntity`). But **SQL and QueryPlan are written as null** (`PathAwareOrchestrator.cs:269-271`, `:427-429`) — only a SQL hash lives on `ChatMessage`. Not immutable: it's a soft-delete `AuditableEntity` (`QueryAuditLog.cs:6`). Cost only computed when provider = Claude (`PathAwareOrchestrator.cs:252,410`). |
| **Explainability** ("how was this calculated?") | NOT FOUND / not wired | `Explain` flag exists on `ChatRequest` (`Requests/ChatRequest.cs`) and `QueryPlan` (`InternalDataQueryPlan.cs:76`) but the compiler ignores it (grep for `Explain` in compiler: 0 hits) and no explanation of filters/scope/tenant restrictions is produced. |

---

## Business Rules & Validation

- Conversation hard-capped at 20 messages (`IntelligenceOptions.cs:44`).
- User message hard-capped at 100 characters by Prompt Guard (`PromptGuard.cs:38`) — a notably tight limit for natural-language questions.
- Only two data domains answerable: Distributor Report (KeHE/UNFI) and Internal Data (CRM); everything else is politely declined (`PathAwareOrchestrator.cs:155-161`).
- Result set capped at min(requested, 1000), default 100 rows (`InternalDataSqlCompiler.cs:369`).
- Query timeout 30s with up to 2 transient retries (`IntelligenceOptions.cs:42-43`, `InternalDataExecutor.cs:35,71`).
- Allowed tables are an explicit whitelist across CRM, ProductSpecs, TradeSpend, TradeSpendSandbox schemas (`InternalDataSqlCompiler.cs:8-41`). Broker / Brand / DataHub schemas named in the spec are **not** in the allow-list.
- Soft delete respected: `Deleted = FALSE` added to every table (`InternalDataSqlCompiler.cs:246`). Audit-metadata columns (CreatedBy/On, etc.) are stripped from selectable dimensions (`:68-71`, `:175`).
- ID-looking columns are hidden from the user-facing response (`IdColumnFilter.RemoveIdColumnsFromRows`, `PathAwareOrchestrator.cs:235,391`).
- FluentValidation validators auto-register (`Startup.cs:27`), though no Intelligence-specific request validator was found in the module.

---

## Who Can Access

- The controller `IntelligenceChatController` inherits `VersionedApiController` → `BaseApiController`, which carries only `[ApiController]` and **no `[Authorize]`** attribute (`Hosts/API/Controllers/VersionedApiController.cs:1-6`, `BaseApiController.cs:5-11`).
- **No endpoint carries `[MustHavePermission]`** — none of the five actions in `IntelligenceChatController.cs` is permission-gated. They carry only `[BrandIDHeader]` (chat/sessions) or nothing (evaluation/master-entities populate). Permission fallback is therefore effectively null; any authenticated caller who reaches the route can call it. Whether authentication is enforced by global middleware is **Unclear from code** (not visible within this module).
- Two admin-intent endpoints are exposed with the same (non-)gating: `POST evaluation/run` (`:43-50`) and `POST master-entities/populate` (`:52-60`) — their OpenAPI notes say "Admin/dev use only" / "Admin/sync use only" but nothing in code enforces admin.
- Tenant isolation is data-level (BrandID injection) and partial — see Spec vs Reality.

---

## Dependencies

- **LLM provider:** pluggable via `IntelligenceSettings:PlannerProvider` — OpenAI (default), Gemini, or Anthropic Claude (`IntelligenceOptions.cs:3-14`). Same provider drives planning, classification, entity extraction, response building, and session-title generation (`Startup.cs:35-58`, `Chat/SessionTitleGeneratorSelector.cs:27-31`, `ReportResponse/ReportResponseBuilder.cs:284-299`).
  - Default models: OpenAI `gpt-4o`, Gemini `gemini-2.5-flash`, Claude `claude-sonnet-4-6` (`IntelligenceOptions.cs:18,23,28`). API keys/base URLs come from config; not hardcoded.
  - Token-cost estimation only runs on the Claude path (`PathAwareOrchestrator.cs:252-257,410-415`) via `ModelPricingService`.
- **Database:** PostgreSQL via `IDapperRepository` (raw parameterized SQL) for query execution (`InternalDataExecutor.cs:13`); EF `IRepository<QueryAuditLog>` for audit writes (`PathAwareOrchestrator.cs:41,530`).
- **Data it can read:** the whitelisted tables in `InternalDataSqlCompiler.cs:8-41` — CRM (distributors, retailers, banners, stores, contacts, regions, pipeline, SKUs, activities), ProductSpecs (categories, product specs, price list), TradeSpend and TradeSpendSandbox (monthly reports, promos, events, notes) — plus KeHE/UNFI distributor sales via the Distributor Report path.
- **Chat session caching:** in-memory `IMemoryCache` (`ChatContextStore.cs`).

---

## Gaps, TODOs & Inconsistencies

1. **No query cost guard.** The spec's `EXPLAIN (FORMAT JSON)` cost gating is entirely absent; only a 30s timeout + row cap protect the DB. A cheap-looking plan with many joins on large tables can still run.
2. **No dedicated read-only DB role.** "Read-only" is enforced only by a forbidden-keyword string scan (`InternalDataExecutor.cs:98-110`) on generated SQL, using the app's normal DB credentials. A defense-in-depth read-only role is missing.
3. **`MaxJoins` is dead config.** Set to 7 (spec says ≤3) and never referenced; join count is unbounded.
4. **No rate limiting / token budgets.** None of the spec's per-minute / per-day / per-hour / tenant-budget caps exist.
5. **No real caching layer** beyond the session object cache — no semantic/queryplan/result cache.
6. **Audit does not persist SQL or QueryPlan.** Despite dedicated columns, the orchestrator passes `null` for both (`PathAwareOrchestrator.cs:269-271,427-429`); only a SQL hash is kept on the message. Audit log is a soft-delete entity, so "immutable" is not guaranteed.
7. **Partial tenant isolation.** Tables lacking a `BrandID` column get no tenant filter (`InternalDataSqlCompiler.cs:43-64`); no OrgId scoping; `PermissionFailure`/`CostOrTimeoutFailure` enum members are never raised.
8. **Explainability not implemented** — the `Explain` flag is plumbed through requests/plans but ignored by the compiler and unused in responses.
9. **No permission gating on endpoints.** Admin-only operations (evaluation run, master-entity rebuild) are not enforced as admin in code.
10. **100-char prompt limit** is very restrictive for natural-language questions and may block legitimate queries (`PromptGuard.cs:38`).
11. **Spec's multi-module claim overstated.** Broker / Brand / DataHub are named in the spec but not in the query allow-list; only CRM/ProductSpecs/TradeSpend(+Sandbox) and distributor sales are reachable.
12. **`SyndicatedReport` data context** (`DataContextType.cs:6`) is defined but not handled by the orchestrator's routing (`PathAwareOrchestrator.cs:145-161`) — such requests fall through to the "unsupported" message.
