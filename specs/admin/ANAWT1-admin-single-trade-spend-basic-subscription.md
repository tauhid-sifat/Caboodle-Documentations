---
module: admin
jira: [CS-1592]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Admin | Single Trade Spend for Basic Subscription

**CS-1592** | New Requirement | User Story | Priority: TBD | Status: New | https://caboodleservices.atlassian.net/browse/CS-1592

> **Scoping update 2026-09-07 (CW/IR notes):** CW asked to further define *how many* can be created under Basic; IR notes new pricing model is **based on how many promotions**. Ticket updated to capture that — ACs now scope a promotion-count limit, not just a single-entity flag.

---

## User Story

**As an** Admin managing subscriptions,
**I want** a way to provide/limit a Basic Subscription to a **single Trade Spend** (one trade spend entity/sandbox),
**So that** basic-tier subscribers are correctly scoped to a single Trade Spend rather than multiple.

---

## Description

Need a mechanism (admin control or subscription rule) to enforce a **Single Trade Spend** for **Basic Subscription** tier accounts. The exact requirement/constraint is not yet fully specified ('NEED A WAY TO') - this ticket captures the need and awaits definition of:
- What 'single Trade Spend' means (one TSS per brand? per account? per brokerage?).
- How Basic vs. higher tiers differ in Trade Spend allowance.
- Where the limit is enforced (creation, assignment, billing).

**Update 2026-09-07 — Pricing model clarification (CW + IR):**
- **CW (Constance Wolfe):** *Should we further define how many they can create?* — ticket should define the numeric cap for Basic, so ACs are testable.
- **IR (Internal Review):** *New pricing model based on how many promotions* — the enforcement is now understood as a **promotion-count limit** tied to subscription tier, not merely "one TSS object exists". This aligns Basic with a promotion quota (e.g., N promotions per billing period/contract). Exact N and whether it counts drafts vs pushed/approved promos is still to be defined — captured as open questions below.

---

## Acceptance Criteria

### Scenario 1: Basic Subscription Limited to One Trade Spend (entity-level)
- **Given** an account on the Basic Subscription
- **When** it attempts to create/use Trade Spend entities
- **Then** it is limited to a single Trade Spend (additional creation is blocked or restricted)

### Scenario 2: Higher Tiers Unaffected
- **Given** a non-basic subscription
- **When** it uses Trade Spend
- **Then** the single-Trade-Spend limit does not apply

### Scenario 3: Basic Subscription — Promotion Count Cap (new pricing model)
- **Given** an account on the Basic Subscription with a defined promotion quota **N** (to be defined — see Open Questions)
- **When** it attempts to create the (N+1)th promotion (counting scope to be defined: drafts vs approved vs active)
- **Then** creation is blocked with a clear upsell/limit message and admin/billing is notified
- **And** existing promotions remain unaffected

### Scenario 4: Quota Visibility
- **Given** a Basic subscriber viewing Trade Spend
- **Then** they see their promotion quota (e.g., "3 of N promotions used") and what counts toward it

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for 'single Trade Spend for Basic Subscription' (CS-1430 is an unrelated SNS subscription).
- Context: Trade Spend / TradeSpendSandbox module (see BMTSS* tickets for TSS behavior).

---

## Open Questions (to close before dev)

1. **How many promotions for Basic?** Define **N** (e.g., 1, 3, 5?) — CW's question. Is "Single Trade Spend" actually "N promotions" or "1 TSS sandbox = N promotions inside it"?
2. **What counts?** Do drafts (Sandbox/Pending), approved, and discontinued all count, or only active/pushed promos?
3. **Scope:** Per brand, per brokerage, or per account?
4. **Enforcement point:** Creation blocked in-app, or assignment/billing gate, or both?
5. **Billing source of truth:** Stripe/internal subscription service? How is tier checked server-side?

## Notes
- Requires clarification with product/Client on the exact scoping rule and enforcement point.
- May intersect with billing/subscription management - confirm the system of record for subscription tiers.
- **2026-09-07:** Added Scenarios 3-4 to make CW/IR pricing-model note testable; numeric cap N left as placeholder pending product decision — do not implement until N is defined.
