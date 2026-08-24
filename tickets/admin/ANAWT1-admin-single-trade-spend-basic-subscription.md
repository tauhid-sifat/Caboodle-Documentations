# Admin | Single Trade Spend for Basic Subscription

**ANAWT1** | New Requirement | User Story | Priority: TBD | Status: New

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

---

## Acceptance Criteria

### Scenario 1: Basic Subscription Limited to One Trade Spend
- **Given** an account on the Basic Subscription
- **When** it attempts to create/use Trade Spend entities
- **Then** it is limited to a single Trade Spend (additional creation is blocked or restricted)

### Scenario 2: Higher Tiers Unaffected
- **Given** a non-basic subscription
- **When** it uses Trade Spend
- **Then** the single-Trade-Spend limit does not apply

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for 'single Trade Spend for Basic Subscription' (CS-1430 is an unrelated SNS subscription).
- Context: Trade Spend / TradeSpendSandbox module (see BMTSS* tickets for TSS behavior).

---

## Notes
- Requires clarification with product/Client on the exact scoping rule and enforcement point.
- May intersect with billing/subscription management - confirm the system of record for subscription tiers.
