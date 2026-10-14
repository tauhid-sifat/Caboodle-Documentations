---
type: reference
title: Promotional management status life
module: promo-management
status: current
last_verified: 2026-10-14
---

# PROMOTIONAL MANAGEMENT — STATUS LIFE

### PromotionEventStatus Enum
| Code | Label | Notes |
|------|-------|-------|
| 1 | Active | Planned/active |
| 2 | Cancelled | Cancelled before running |
| 3 | Pending | Awaiting approval |
| 4 | DidNotRun | Scheduled but didn't occur |
| 5 | Declined | Declined by retailer |
| 6 | RetailerApproved | Approved by retailer |
| 7 | Completed | Ran and concluded |

**Gap:** Live TradeSpend module **never writes status** — only reads it for financial calculations. Status transitions happen only in Sandbox (`UpdateEventStatusAsync`).

### Submission (IsSubmitted flag)
- Separate from status — parallel flag on events
- Managed by `UpdateSubmissionStatusOfEventsRequest`
- Role-aware: BROKER/BROKERSUBUSER restricted to assigned brands

### Market Overview SkuStatus (separate enum)
Active, Pending, NotActive, Declined, Discontinued, Approved, Commit
