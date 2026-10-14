---
type: Document
module: meta
jira: []
status: internal
last_verified: 2026-10-14
related_wiki: ../wiki/deliverables-index.md
---

# INTERNAL TICKET TRACKING — Caboodle

> **Purpose:** Internal tracking layer for ticket-spec files in `specs/`.
> **Important:** These internal codes (BD1, MO1, PM2, …) are **not** Jira tickets.
> They are our spec documents. Real Jira tickets use the **CS-*** numbering and live in `jira/tickets/`.
> Where an internal code is a NEW requirement with no Jira ticket yet, the row is marked **To Be Posted → Jira**.
> Where it builds on an existing real ticket, the real CS-* number is listed in **Upstream/Related**.

| Internal code | Spec | Type | Upstream / related real CS-* ticket |
|---|---|---|---|
| BD1 | Broker Dashboard shell (wireframe) | User Story | CS-1305 |
| BD2 | Assign time & person | User Story | — (builds on BD4) |
| BD3 | Filter my tasks / contact | User Story | — (builds on BD4) |
| BD4 | Pipeline / Task view (Fellow-style) | User Story | — (new; supersedes old task-board) |
| PM7 | Broker logo button | User Story | CS-1072 |
| CR1 | Remove all reviews at once | User Story | — |
| CR4 | Calendar sort by Banner/Category | Question | CS-1361 |
| CR5 | Review end date in template | Question | CS-1296 |
| DA1 | Distributor APL infinite scroll | User Story | — |
| DA2 | APL wholesale cost required on edit | Bug | — |
| MO1 | Edit DC in edit log | User Story | — |
| MO2 | Text search in list view | User Story | — |
| MO3 | Status hierarchy → CRM | User Story | — |
| MO4 | Fix misleading store count (UNFI/Infra) | Bug | — |
| MO5 | Multiple stores per log entry | User Story | — |
| MO6 | One retailer, multiple brands per entry | User Story | — |
| PM2 | Export to formatted report | User Story | — |
| PM3 | Promo status options in submission | User Story | — |
| PM4 | Pin/freeze filter options | User Story | — |
| PM5 | Uniform grid format | Bug | — |
| PM6 | Event span/move across months | User Story | — |
| PM9 | Promo Management UI to match CR calendar | User Story | CS-1711 |
| SE1 | Simple Entries (non-calculated promos) | User Story | CS-1708 |
| BMP1 | Pipeline assign users | User Story | — |
| BMP2 | Pipeline email on update | User Story | — |
| BMTSS1 | Remove/modify approved promos | User Story | CS-1098 / CS-1108 |
| BMTSS2 | Remove/modify approved promos — SOP | User Story | BMTSS1 |
| BMTSS3 | EDLP stepper vs edit details | Question | BMTSS6 |
| BMTSS4 | Actualize promotions | User Story | BMTSS6 |
| BMTSS5 | Edit promo details spacing | Bug / Enhancement | BMTSS3 |
| BMTSS6 | EDLP calendar Jan-only span | Bug | — |
| BMTPS1 | Product spec UPC → pricing | User Story | — |
| BMTRC1 | Retailer CRM store listing | User Story | — |
| SRM1 | Store report — house accounts | Concept / Epic | — |
| RDR1 | Distributor report export | Question | — |
| RDR2 | Distributor report rolling 12 months | User Story | — |
| RBMO1 | Broker MO sort date | Bug | — |
| RBMO2 | *(removed — not created)* | — | — |
| RBS1 | SPINS hide market insights | User Story | — |
| RBST1 | Sales tracker back button | Bug | — |
| ACDU1 | CRM upload filter audit | User Story | — |
| ACDU2 | CRM Data Upload: delete or merge Retailers | Task | CS-1709 |
| AD1 | Dashboard flags prototype | Prototype | — |
| AAC1 | Report page icon controls | User Story | — |
| AAC2 | CR brand report dropdown | User Story | — |
| ANAWT1 | Single Trade Spend subscription | User Story | — |
| ASR1 | Store report merge duplicates | User Story | — |
| ASGE1 | System generated email sender address | Task | CS-1710 |

## Mapping notes
- **Already in Jira (real CS-* tickets):** CS-1296, CS-1305, CS-1316, CS-1318, CS-1324, CS-1361, CS-1403, CS-1424, CS-1543, CS-1072 — these spec files ARE their real tickets; do **not** re-post.
- **To be posted → Jira as new tickets:** all rows with `Upstream = —`.
- Excluded by client: **CR3**, **RBMO2**.
