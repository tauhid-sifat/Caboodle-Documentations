---
type: Document
title: "Key End-to-End Workflows"
---

# Key End-to-End Workflows

> Audience: Business Analyst. Each workflow describes **what actually happens** when a user does something, including the validation failures and edge cases the code handles. Citations point at the governing file. Read alongside the per-module docs for detail.

---

## 1. User onboarding — registration → role → login

**What the user does:** signs up (or accepts an invitation), verifies email, then logs in and lands in the right workspace.

**What actually happens:**
1. **Registration** is a single public endpoint (`RegistrationController.cs:19`). It branches:
   - **Self sign-up (no invitation):** the account is created **inactive with email unconfirmed** and assigned the **UNASSIGNED** role; a verify-email link is emailed (`UserService.CreateUpdate.cs:374-418`). The user can't do anything meaningful until an admin later assigns a real role.
   - **Invited registration (invite code + `HasInvited`):** the invitation code and expiry are validated, then the role is taken from the invitation's type — BrandSubUser→`BRANDSUBUSER`, BrandOwner→`BRANDOWNER`, BrokerSubUser→`BROKERSUBUSER`, Broker→`BROKER`, otherwise `UNASSIGNED` (`:281-337`). If the inviter is an ADMIN, the new user is **auto-activated and email-confirmed** (`:311-317`).
2. **Email verification** confirms the address and activates the account (self-signup path).
3. **Login** (`POST /auth/login`) issues a JWT access token + refresh token, and requires an **active, email-confirmed** account with the correct password (`TokenService.cs:46-68`). ⚠ A configurable **master-password back door** can bypass the password check. Admins use a separate `POST /admin/login` that additionally requires the ADMIN role.
4. **Role-based routing (frontend):** after login the app always navigates to `/dashboard`, then `WorkspaceContainer` redirects **brand** users to `/{brandId}/dashboard` while **brokers** stay on the shared broker dashboard (`WorkspaceContainer.tsx:53-64`). The role is **not** in the login token — it comes from a subsequent `getAllBrands` API call and is cached in a client-side store that **defaults to BRANDOWNER** (`roleStore.ts:11`).

**Edge cases / gotchas:**
- A self-signed-up user is stranded in UNASSIGNED until an admin acts — there is no automatic brand creation.
- Because the frontend role lives in a client-writable store, it is not a security boundary (see [Known Gaps](05-known-gaps.md)).

---

## 2. Bulk data upload — file → validate → map → import (UNFI / KeHe / SPINS)

**What the user does:** uploads a distributor/syndicated data file so it appears in reports.

**What actually happens** — there are **two paths**, and the frontend chooses which (the backend does not enforce a size cutoff):
1. **Small files — synchronous:** the file is parsed with CsvHelper inside the request. Headers are validated first — a missing required column (marked with a `[*]`) or any unrecognized header **rejects the whole file** (`FileExportHelper.cs:74-118`). Valid rows are inserted into the **raw** provider table; **bad rows are skipped per-row** and returned as an **error CSV embedded in the response**. **No mapping to canonical entities happens on this path.**
2. **Large files — chunked/background:** the file is uploaded to object storage in chunks; when the last chunk lands, a **Hangfire background job** is queued and the endpoint returns a **JobId** the UI polls (`UploadChunkForUNFIImportRequest.cs:171`). The job processes rows in batches of 5,000. **For UNFI and KeHe only,** it applies mapping via the shared data-hub service, splitting the file into raw rows, **mapped** rows, **unmapped** rows, and distributor-sales rows (`SharedDataHubService.cs:394-436`). Error rows are written to an error CSV in object storage and exposed as a download URL through the status endpoint.

**Edge cases / gotchas:**
- **SPINS never maps** (even on the background path); **SPINS Items Ranking has no background path at all** (synchronous-only).
- The **Master KeHe** import rejects the *entire* file on any error, unlike the per-row-skip behavior elsewhere.
- Header validation runs on the synchronous path but is **skipped on the background path** — a malformed header can slip through when uploading a large file.

**Follow-on:** rows that couldn't be matched become "unmapped" and flow into Entity Resolution (Workflow 4).

---

## 3. Entity Resolution — turning unmapped rows into canonical data

**What the user does:** reviews import rows the system couldn't automatically match and confirms the correct canonical entity.

**What actually happens:**
1. **Suggestion:** for an unmapped raw value (e.g. a retailer/store/UPC string), the matching engine normalizes it (strips punctuation, expands abbreviations, drops stop-words) and scores it against candidate **UnifiedEntity** records using exact/prefix/token-set (fuzzy) strategies, keeping matches at **≥ 0.65 confidence** (`EntityResolutionMatcher.cs`). Suggestions are computed on demand and surfaced via `POST /mapping/unmapped` — they are **not stored**.
2. **Review:** a person attaches the raw value to the correct entity as an **alias** (bulk-map or attach-alias). The alias is always created with status **`Suggested`**.
3. **Approve:** `PUT /aliases/{id}/status` flips the alias to **Approved** (or Rejected) and writes an audit row — this requires the "Approve Entity Resolution Suggestions" permission.
4. **Resolve:** `POST /unmapped/resolve` sweeps the now-resolvable rows into the mapped tables so reports can use them.

**Edge cases / gotchas:**
- Configured High/Medium confidence thresholds are **unused** — only the single 0.65 cutoff applies.
- A full suggestion-persistence schema (`AliasMatchAttempt`) exists but is **dead scaffolding** — nothing writes to it.
- A copy-paste bug tags KeHe resolution audits as UNFI (`ResolveUnmappedRecordCommand.cs:135`).

---

## 4. Trade spend promo lifecycle — plan → price → submit → analyze

**What the user does:** builds a promotion with events, submits it, and views its financials; optionally duplicates it into a new year or moves it to/from the Sandbox.

**What actually happens:**
1. **Create/edit a promo + events** (`UpsertTradeSpendPromoRequest`): the promo needs a non-empty name, ≥1 category, and ≥1 event; each event needs month, dates, retailer, banner, product, and category. The promo **name must be unique per brand**. An event's **stores may not exceed the banner's door count**.
2. **Per-unit price is derived automatically** from the brand's price list (matching category+distributor+product, most recent price effective on/before the event start date); **if no price is found it defaults to 0** (`UpsertTradeSpendPromoRequest.cs:362-372`). All other financial fields are stored exactly as entered — **no spend math happens on save.**
3. **Submission:** a broker (or brand) marks events submitted in bulk via the submission-status operation, which sets `IsSubmitted`. For brokers, results are restricted to their assigned brands (`UpdateSubmissionStatusOfEventsRequest.cs:105-115`).
4. **Analysis (read side):** opening a promo computes all the money — non-promo (baseline) cases, promo cases, promo revenue with/without allowance, TPR spend, TPR fees, POD — bounded by each SKU's active/discontinued dates (`TradeSpendDTOBuilder.cs`). Only events in status Active/Pending/RetailerApproved/Completed are included in the math.
5. **Duplicate into a new year** (`DuplicateTradeSpendRequest`): clones the promo and events, re-basing dates; **carries over submission state, status, and the sandbox link** rather than resetting them.
6. **Sandbox round-trip:** `push-to-sandbox` (live→sandbox) and `push-to-tradespend` (sandbox→live) copy promotions between the modules via a shared service; the `SandboxEventID` links the two.

**Edge cases / gotchas:**
- **No handler in the live module ever sets the promo-event *status*** — the approval lifecycle (RetailerApproved/Completed/etc.) is not implemented here; status only changes by being copied on duplicate. *Confirm with engineering where status is set.*
- **Deleting promotions has no brand-ownership check** (cross-tenant delete risk); deleting *events* does check ownership.
- List and detail views **hide promos/events whose related master records were soft-deleted** (inner joins) — "event not found" can mean "its retailer/banner/product was deleted."
- Entering an average weekly sales of **0 is rejected** by validation.

---

## 5. Sales pipeline — managing deals on a board

**What the user does:** organizes deals as cards on a Plan (board), moving them across Deal Stage columns.

**What actually happens:**
1. A **Plan** is a board; a **Pipeline** row is a deal card that lives in exactly one **Deal Stage** column with an ordered position. Stages are data-driven and either global or brand-specific.
2. A new card is added at the **bottom** of its stage. Cards are reordered within a stage via a reorder operation, and moved across stages via a change-stage operation that runs three coordinated updates: close the gap in the old column, make room in the new column, then relocate the card (`UpdatePipeLineDealStageStateRequest.cs:87-191`).
3. Deleting a card soft-deletes it and re-sequences the survivors. A Plan cannot be deleted while it still contains deals.

**Edge cases / gotchas:**
- There is **no allowed-transition matrix** — any stage can move to any other stage; the only checks are existence, brand-visibility, and "not the same stage."
- `plans/add-default` is an **all-tenant data migration** exposed as an unguarded endpoint — calling it rewrites default pipelines for **every brand** (`CreateDefaultPlanRequest.cs:29-55`).

---

## Cross-cutting notes that affect every workflow

- **Tenant isolation is enforced inside handlers** (by the current user's brand ID), not by the database (no foreign keys) and largely not by permissions. If a handler omits the brand check (several do), cross-tenant access is possible.
- **"Delete" almost always means soft delete** (a `Deleted` flag) — records are recoverable. The exceptions (sandbox event delete, some "remove from brand" and sub-user removal flows, and a promo-rules `TRUNCATE`) are permanent and are called out in [Known Gaps](05-known-gaps.md).
