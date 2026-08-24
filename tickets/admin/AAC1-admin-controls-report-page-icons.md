# Admin | Admin Controls | Control Icons on Report Page Buttons (e.g., Monthly Report)

**AAC1** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As an** Admin user,
**I want** to control the icons displayed on the buttons of the Reports pages (e.g., Monthly Report),
**So that** report-page buttons show the correct/approved iconography and can be managed centrally.

---

## Description

Admins should have an **Admin Control** to manage the **icons on buttons** across Reports pages (starting with the Monthly Report). This implies a configurable mapping of button -> icon, editable by Admin rather than hard-coded.

---

## Acceptance Criteria

### Scenario 1: Admin Can Change an Icon
- **Given** an Admin with the appropriate permission
- **When** they open the Admin Control for report-page button icons
- **Then** they can select/change the icon for a given Reports-page button
- **And** the change applies on the relevant Reports page (e.g., Monthly Report)

### Scenario 2: Change Persists
- **Given** an icon is changed
- **When** the Reports page reloads
- **Then** the new icon is displayed (persisted, not reverted)

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for 'admin control of report button icons.'
- Context (Reports-page UI): **CS-1282** (Monthly Report column hierarchy), **CS-1335** (Monthly Report calculations/refresh), **CS-1336** (Monthly Report layout/filtering) - the Reports pages this control would affect.

---

## Related
- **AAC2** - Admin control of dropdown options (same Admin Controls area).

---

## Notes
- Clarify storage: is there an icon/button config entity, or add one?
- Determine scope: all Reports pages or Monthly Report first.
