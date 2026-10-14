---
type: Document
module: market-overview
jira: [MO8]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Comment Edits Should Append, Not Override

**MO8** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user editing a Market Overview log entry,  
**I want** new comments to be appended to the existing comment rather than overwriting it,  
**So that** the full observation history is preserved for audit and review.

---

## Description

Currently, editing the `Comment` field on a Market Overview record overwrites the previous comment text. If a broker rep adds a follow-up note or correction, the original observation context is lost.

This story changes the edit behavior so that new comment text is appended (with a timestamp/prefix) to the existing comment, preserving a full audit trail within the field itself.

---

## Acceptance Criteria

### Scenario 1: Append on Edit
- **Given** a Market Overview record has an existing comment "Shelf stock low"
- **When** I edit and save a new comment "Restocked on follow-up visit"
- **Then** the stored comment becomes:
  ```
  Shelf stock low
  --- Jul 09 2026: Restocked on follow-up visit
  ```
- **And** the original text is preserved

### Scenario 2: Empty Initial Comment
- **Given** a Market Overview record has no comment
- **When** I add a comment on edit
- **Then** the comment is saved as-is (no prefix/date needed for first entry)

### Scenario 3: Edit Without Comment Change
- **Given** I am editing other fields (status, DC, etc.)
- **When** I do not modify the comment
- **Then** the comment remains unchanged (not appended with empty text)

---

## Design Notes

### Option A: Simple Append (Recommended for MVP)
- Append new text with a date-separator line on edit
- Single `Comment` field stores the full history as plain text
- No separate audit table required

### Option B: Comment History Table
- Create a `MarketOverviewComment` child table
- Each edit adds a new row with `MarketOverviewID`, `Comment`, `CreatedBy`, `CreatedOn`
- The UI shows the latest comment and a "View History" link
- More complex but enables per-comment author tracking

---

## Notes
- Option A is simpler and addresses the immediate problem
- Option B is recommended if comment audit trail is needed for compliance
- Consider max length limits on the accumulated comment text
