---
module: admin
jira: [CS-1709]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Admin | CRM Data Upload | Delete or Merge Retailers

**CS-1709** | Task | Priority: Medium | Status: Backlog
**Internal code:** ACDU2
**Reporter:** Constance Wolfe

---

## User Story

**As an** Admin managing CRM master data,
**I want** to delete or merge Retailers,
**So that** duplicate or mis-entered retailers can be cleaned up without leaving unusable records in the system.

---

## Description

In Admin > CRM Data Upload > Retailers, the only editable fields are the retailer Name and Image URL. There is no way to remove a retailer, and no way to merge two retailers that are actually the same company.

Because delete and merge are missing, the current workaround is to change the retailer name or add a message asking people not to use it. The record remains in the list and keeps appearing in filters and dropdowns, so the underlying problem stays.

This ticket adds two operations:
- Delete: remove a retailer that is not in use.
- Merge: combine two retailers into one, moving all references to the surviving record.

A retailer is platform-wide master data shared across brands, so both operations must consider every place a retailer is referenced.

---

## Acceptance Criteria

### Scenario 1: Delete an unused retailer
- **Given** a retailer that is not referenced anywhere
- **When** the Admin selects Delete and confirms
- **Then** the retailer is removed from the Retailers list
- **And** it no longer appears in any filter or dropdown

### Scenario 2: Deletion blocked when in use
- **Given** a retailer that is referenced, for example by a Banner, Store, Distributor, or Region
- **When** the Admin attempts to delete it
- **Then** deletion is blocked
- **And** the Admin sees which records reference it

### Scenario 3: Merge two retailers
- **Given** two retailers that represent the same company
- **When** the Admin merges source into target
- **Then** all references move from source to target
- **And** the target keeps its current name and Image URL
- **And** the source is removed from the active list

### Scenario 4: Merge is traceable
- **Given** a merge has been performed
- **Then** the system records who performed it, when, and which records moved

### Scenario 5: Permissions
- **Given** a non-admin user
- **Then** Delete and Merge are not available

---

## Design Notes
- Retailers are shared master data, so reference checks must cover every reference, not only the current brand.
- Prefer soft delete, consistent with the platform convention, unless the client wants hard delete.
- Merge is effectively a re-point of references plus an archive of the source record.
- Confirm the full reference list: Banners, Stores, Distributor Retailers, Retailer Regions, and any historical promotion or report references.

---

## Open Questions
- Soft delete or hard delete?
- Which references block deletion, and which should move on merge?
- What happens to historical reports and promotions tied to the merged retailer?
- Who can perform delete and merge, Admin only or a specific permission?
- Can a merge be undone?
- Should existing "do not use" name messages be migrated or cleaned up?

---

## Jira Reference
- **CS-1059** - CRM sub-modules need a delete option (only Banner has one today)
- **CS-1593** - Store duplicates, merge without losing history
- **CS-1419** - Store merge script
- **REQ-095** in `index.md`
