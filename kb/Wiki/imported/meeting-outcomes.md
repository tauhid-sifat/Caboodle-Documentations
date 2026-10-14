---
type: reference
title: Meeting outcomes (client clarifications)
module: general
status: current
last_verified: 2026-10-14
---

# MEETING OUTCOMES (Client Clarifications)

### Key Decisions (from Broker Dashboard meetings)
1. **Category Review scrolling** → Infinite scroll, not pagination (CS-1316)
2. **CS-1305 re-scoped** → Broker Dashboard with KPI cards, not just UI polish
3. **Pipeline ≠ CRM Pipeline** → Simple task board (To Do / In Progress / Done) — lightweight, no deal stages
4. **Status hierarchy** → Discontinued is terminal; Market Overview cannot override it
5. **UNFI Independents** → Door count (700) is misleading — actual per-store count needed for accurate KPIs
6. **Multi-brand log entry** → Sheet view: select retailer → grid of all brands' SKUs → click-click → one submit
7. **Broker adds/represents brands** — not "assigned under brand"

### Open Questions
| Question | Status |
|----------|--------|
| Status transition matrix for SkuStatus | Need to confirm with Bijoy |
| Store count for UNFI Independents | Need store picker implementation |
| MO6 sheet mockup | Client has one — need to obtain |
| Email backend for Send to Contacts | SMTP/SendGrid/Resend? |
| Is "Submitted" a new status value or parallel flag? | TBD |
| PM6 scope (multi-month events) | Option A (read-only display) vs C (full drag) |

> **Consolidated, provenance-tagged decisions & open questions** are in `client-decisions-open-questions.md` (synthesized from all 14 `meetings/` transcripts).
