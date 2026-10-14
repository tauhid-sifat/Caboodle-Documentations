# APL terminology decision memo (for Constance)

> Status: AWAITING RULING (tracks CS-1779). Evidence only below — no decision invented.
> Date: 2026-10-14. Author: orchestrator (from D17, D20, DA1/DA2, CS-1403, CS-1424).

## Conflict

- **Decisions say "Retail APL":** D17 — Retail APL pushed live for Jade Street demo; D20 — retail APL export APPROVED (`meetings/notes/2026-08-24-ticket-call.md`, `meetings/notes/2026-08-17-ticket-call.md`).
- **Specs say only "Distributor APL":** `specs/broker-dashboard/DA1-distributor-apl-infinite-scroll.md:9`, `DA2-distributor-apl-wholesale-cost-validation.md:9`, `CS-1403-apl-upload-unfi-upc-adjustment.md:9`, `CS-1424-data-sync-broker-distributor-apl.md:18-19`. Zero mentions of "Retail APL" anywhere in specs/.

## Options

| # | Reading | If true, what changes |
|---|---|---|
| A | Rename: Retail APL is the new name for Distributor APL | Retitle 4 specs + wiki rows; single surface |
| B | Subset: Retail APL is a retailer-facing view over distributor data | New spec for the view/export; DA specs untouched |
| C | Separate page: Retail APL is a distinct surface (own upload, grid, export) | New specs for page + export; DA specs untouched |

## Recommendation

**B, until proven otherwise.** D17's "pushed live for demo" suggests something viewable already exists (a view, not a renamed module), and D20 approves only an *export*, not a rebuild. A rename (A) would leave demo evidence unexplained; a full new page (C) overbuilds on current evidence.

## What the ruling unlocks

- Retail APL export spec + store merge-tool UI spec (tracker A3).
- Terminology row in `wiki/broker-brand-terminology.md` or module catalog.

## Reply needed (one line)

A, B, or C — plus, if B/C, where the surface lives (URL or module name).
