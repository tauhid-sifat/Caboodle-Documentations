---
type: Document
module: trade-spend
jira: [CS-1626]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Brand Modules | TSS | Remove or Modify Approved Promotions - Detailed SOP

**CS-1626** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand user managing Approved Promotions,
**I want** a clear, supported procedure for removing and modifying approved promotions while preserving all versions,
**So that** we keep an auditable history of every change.

---

## Description

Detailed standard operating procedure (SOP) the system should support for Approved Promotions. Today users follow this manually:

**Remove an Approved Promotion**
1. Create a copy of the Approved Promotion in the Sandbox.
2. Add to the Promotion name: 'Original Version', Date, User Initials.
3. Delete the original version from Approved Promotions.

**Modify an Approved Promotion**
1. Create a copy of the Original Version.
2. Rename to reflect 'Revised', Date, User Initials.
3. Make the modifications in this Sandbox version.
4. Push the revised version to Approved Promotions.
5. This preserves all versions of the promotion if changes are made.

The goal is to turn this manual SOP into a supported, system-guided workflow (ideally with automatic version labeling and history) so users do not perform fragile copy/rename/delete steps.

---

## Acceptance Criteria

### Scenario 1: Versioned Remove (Original Version)
- **Given** an Approved Promotion
- **When** the user removes it
- **Then** the system preserves an 'Original Version' record (Date + User Initials) before removal
- **And** no blank/orphan rows are left in the Promo Calendar

### Scenario 2: Versioned Modify (Revised)
- **Given** an Approved Promotion
- **When** the user modifies it
- **Then** a 'Revised' copy is created automatically (Date + User Initials in name/metadata)
- **And** the revised version is pushed to Approved while the original version is retained
- **And** the modification history is visible (Original to Revised chain)

### Scenario 3: Audit / History
- **Given** a promotion has been revised multiple times
- **When** a user inspects it
- **Then** all versions (Original, Revised xN) are listed with Date and User Initials

---

## Jira Reference (data/jira-tickets)
- **CS-1122** - documents the current copy/push workaround and the cancelled-event indication gap.
- **CS-1208** - Brand Approved Promotions: user shouldn't change Promo Name in BAP (relevant to auto version-naming).
- **CS-1183** - TSS and BAP data not consistent (root issue).
- **CS-1160** - deleting in Sandbox leaves a blank Promo Calendar row (current workaround defect).

---

## Related
- **CS-1625** - the capability ticket; CS-1626 is the detailed versioning SOP.

---

## Notes
- Auto-generate version labels (Original Version / Revised) instead of relying on manual rename.
- Confirm whether version history is per-promotion or per-event.
