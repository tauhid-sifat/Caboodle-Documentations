---
type: Document
module: trade-spend
jira: [CS-1629]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Brand Modules | TSS | Edit Promo Details - More Space at Bottom for Single Row

**CS-1629** | Bug / Enhancement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand user viewing Promo Event Details (View & Edit Promo Event Details),
**I want** adequate spacing at the bottom of the details panel when only a single row is displayed,
**So that** the content is not cramped/truncated and is easy to read and interact with.

---

## Description

In the **Edit Promo Details / View & Edit Promo Event Details** panel, when only **one row** of promo event data is shown, the bottom of the panel lacks sufficient space (per the referenced screenshot). The layout should provide comfortable spacing/padding at the bottom for a single-row view so controls and content are not cut off or visually crowded.

---

## Acceptance Criteria

### Scenario 1: Single-Row Spacing
- **Given** a promo event has only one row in the details panel
- **When** the panel renders
- **Then** there is adequate padding/space at the bottom (no cramped/truncated content)
- **And** action buttons or fields at the bottom remain fully visible

### Scenario 2: Multi-Row Still Correct
- **Given** multiple rows are shown
- **When** the panel renders
- **Then** spacing remains appropriate (no regression)

---

## Jira Reference (data/jira-tickets)
- **CS-1188** - View & Edit Promo Event Details: make the scroll bar thicker (related UI spacing/usability).
- **CS-1239** - Columns from View & Edit Promo Event Details needed (layout).
- **CS-827** - Can't make edits in View & Edit Promo Event Details (says promotion not found).
- **CS-1107** - View & Edit Promo Event Details: ad fee filter behavior.

---

## Related
- **CS-1627** - EDLP entry in Edit Promo Details (same panel).

---

## Notes
- Verify the issue is CSS/layout (min-height / padding) and not data-dependent.
- Check on common laptop resolutions (several TSS/BAP UI issues reported on smaller screens, e.g., CS-1477).
