# Brand Modules | TSS | Remove or Modify Approved Promotions

**CS-1625** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand user working in Trade Spend Sandbox / Brand Approved Promotions (BAP),  
**I want** a supported way to remove or modify a promotion once it has been Approved,  
**So that** I don't have to rely on a manual copy/delete workaround.

---

## Description

Currently there is **no option to remove a promotion from Approved Promotions** once it's approved. The only workaround is to delete the Approved promotion from the Sandbox, which causes data/calendar side-effects (see Jira refs). Users instead follow a manual SOP (see CS-1626): copy the Approved promo into the Sandbox, rename it ("Original Version …"), delete the original, and (for modifications) create a "Revised …" copy, edit, and push back to Approved.

This ticket captures the **need** for a first-class Remove/Modify capability on Approved Promotions. The detailed SOP and versioning rules are specified in **CS-1626**.

---

## Acceptance Criteria

### Scenario 1: Remove an Approved Promotion
- **Given** a promotion is in Brand Approved Promotions
- **When** the user chooses to remove/delete it
- **Then** the promotion is removed cleanly (no orphan/blank rows in the Promo Calendar)
- **And** the action is confirmed (and ideally permission/audit-gated)

### Scenario 2: Modify an Approved Promotion
- **Given** a promotion is Approved
- **When** the user wants to change it
- **Then** they can do so without the manual copy/rename/delete dance
- **And** prior versions are preserved per the versioning rules in CS-1626

---

## Jira Reference (data/jira-tickets)
- **CS-1122** — TSS & Approved Promotions: copy-to-Approved workflow + "how do we indicate a cancelled event on the promo calendar?" (current manual approach).
- **CS-1208** — Brand Approved Promotions: user shouldn't be able to change Promo Name in BAP.
- **CS-1183** — Data between TSS and BAP is not consistent (root issue this ticket addresses).
- **CS-1160** — Deleting in Sandbox removes from Approved but leaves a blank row in the Promo Calendar (current workaround defect).

---

## Related
- **CS-1626** — detailed SOP for remove/modify (version naming: "Original Version", "Revised …").
- **CS-1098 / CS-1108** — module renamed Promo Planning → Brand Approved Promotions (BAP).

---

## Notes
- Coordinate with CS-1626 (versioning SOP) — this ticket is the capability; CS-1626 is the procedure.
- Confirm whether "remove" = soft-delete (preserve for audit) vs. hard delete.
