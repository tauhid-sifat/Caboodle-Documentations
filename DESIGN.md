---
name: Caboodle Pipeline (dense ledger world)
description: Linear-adjacent sharp-and-dense task view for food-broker account managers; hairline structure, property dots, one indigo accent
colors:
  ground: "#fbfbfc"
  pane: "#ffffff"
  hairline: "#e9ebf0"
  hairline-soft: "#f0f1f5"
  border-ctrl: "#e5e7eb"
  border-ctrl-hover: "#dcdfe6"
  fill-hover: "#f4f5f8"
  fill-selected: "#eceef4"
  ink: "#14161d"
  ink-body: "#1a1d26"
  ink-secondary: "#5c6470"
  ink-muted: "#6b7280"
  ink-faint: "#9aa1af"
  accent: "#6366f1"
  accent-deep: "#4f46e5"
  accent-deeper: "#4338ca"
  status-todo: "#51607a"
  status-progress: "#1d4ed8"
  status-blocked: "#be123c"
  status-done: "#166534"
  status-done-dot: "#15803d"
  due-overdue: "#dc2626"
  due-today: "#b45309"
  priority-high: "#dc2626"
  priority-med: "#b45309"
  priority-low: "#15803d"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  meta:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    fontFeature: "tabular-nums"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "2px"
  sm: "5px"
  md: "8px"
  lg: "12px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.status-todo}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  task-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.lg}"
    padding: "7px 10px"
  project-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.md}"
    padding: "5px 10px"
  checkbox:
    backgroundColor: "#ffffff"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    size: "16px"
---

# Design System: Caboodle Pipeline (dense ledger world)

## Overview

**Creative North Star: "The Broker's Ledger"**

This world treats the Pipeline view as a working ledger, not a showcase. Structure is carried entirely by hairlines, rhythm, and the property-dot system; depth, decoration, and tinted pills are refused. Everything on screen is information: state reads through colored text and small dots on neutral ground, counts use tabular numerals, and the single accent (indigo) is spent only on selection, focus, and the primary action. The visitor is a broker at a desk in daylight, working a list of buyer deadlines for hours; density is a kindness, not a style.

**Key Characteristics:**
- Full-bleed white panes split by a 1px hairline; no floating cards.
- Contiguous dense rows; hover fills, no borders on rest.
- Property dots: status, priority, and due urgency as colored text + 5-6px dots.
- One accent rule: indigo on selection, focus rings, primary action only.
- Keyboard-first: Enter adds, Space completes, Escape closes, "/" jumps to search.

## Colors

Neutral, cool-tinted scale; color appears only where it carries state.

### Primary
- **Indigo Accent** (#6366f1, deep variants #4f46e5 / #4338ca): selection fill, focus rings, primary buttons, the today-cell ring. Never a fill for passive surfaces.

### Neutral
- **Ledger Ground** (#fbfbfc): view background.
- **Pane White** (#ffffff): sidebar and main panes.
- **Hairline** (#e9ebf0, soft #f0f1f5): all structure; borders never carry color.
- **Ink** (#14161d / #1a1d26): headings, task titles.
- **Ink Secondary/Muted** (#5c6470 / #6b7280): meta, labels, counts. Faint #9aa1af only for disabled.

### State colors (text + dots, never pills)
- To Do #51607a · In Progress #1d4ed8 · Blocked #be123c · Done #166534 (dot #15803d).
- Overdue #dc2626 · Due today #b45309 · Priority high #dc2626 / med #b45309 / low #15803d.

### Named Rules
**The One Accent Rule.** Indigo appears on ≤3 surface types per screen: selection, focus, primary action. Everything else is ink on hairlines.
**The Dot-Not-Pill Rule.** State is colored text and a small dot on neutral ground; tinted pill backgrounds are refused for status, priority, and due dates.
**The Hairline Rule.** Structure is 1px #e9ebf0; no colored border-left above 1px on any row or card.

## Typography

**Display Font:** Space Grotesk (reserved: the single view title only)
**Body Font:** Inter (all data, rows, controls)

**Character:** One voice, quiet; hierarchy from size and weight steps, never from fonts or color.

### Hierarchy
- **Display** (600, 1.02rem, -0.01em): the view title "Pipeline" only.
- **Title** (600, 0.95rem): pane/project titles; Inter, not the display face.
- **Body** (500, 0.85rem, 13.6px): task titles.
- **Meta** (500, 0.72rem, tabular-nums): due dates, counts, assignees.
- **Label** (600, 0.7rem, 0.05em, uppercase): group headers ("To Do", "Projects").

### Named Rules
**The Tabular Rule.** Every count, date, and number column uses tabular numerals.
**The 11px Floor Rule.** No functional text below 0.7rem; dense means tight, not small.

## Layout

Left rail 320px (projects) + fluid main pane; top bar (title, workspace toggle, actions) and KPI ghost-chip row sit above the hairline that starts the work area. Row rhythm: 1px gaps in lists, 8px side insets, group headers with more space above than below. Content scrolls inside panes; chrome is fixed. Responsive: not specified in the wireframe (desktop-first).

## Elevation & Depth

Flat by default. Depth is carried by hairlines and the hover fill; shadows exist only on modals (tight, 0 4px 16px -4px rgba(15,23,42,.18)) and as inset focus rings. No ambient glows, no lift-on-hover transforms.

## Shapes

Small radii: 4px (checkbox), 6px (rows, small controls), 8px (task rows, buttons, inputs), 12px (modals). No 16px+ softness. Controls are standard web components; selects are restyled native selects with a custom chevron, not custom widgets.

## Components

### Buttons
- **Shape:** 8px radius (not pills)
- **Primary:** #4f46e5 fill, white text; hover #4338ca
- **Ghost:** transparent, 1px #e5e7eb border, #51607a text; hover #f4f5f8 fill
- **Disabled:** opacity 1, #9aa1af text, transparent bg (visible, never white-on-white)

### Task rows
- **Shape:** 8px radius, contiguous 1px gaps, transparent at rest
- **Hover:** #f4f5f8 fill, no shadow, no transform
- **Done:** title #6b7280 with line-through; row stays at full opacity
- **Checkbox:** 16px, 4px radius, #d0d4dd border; checked = indigo fill

### Status select (property control)
- Native select, appearance:none; transparent bg; colored text per status; 9px chevron at right 3px; hover = #eceef4 rounded fill.

### Chips / KPI pills
- Ghost buttons: transparent, hairline border; active = flat #eceef4 fill, ink text (never indigo fill).

### Inputs
- 8px radius, 1px #e5e7eb; focus = indigo border + 3px rgba(99,102,241,.12) ring; error = #ef4444 border with inline .modal-error text below the field.

## Do's and Don'ts

### Do:
- **Do** carry state with colored text + dots on neutral ground.
- **Do** keep all numerals tabular in counts and dates.
- **Do** reserve indigo for selection, focus, and the primary action.
- **Do** give disabled controls visible ink (#9aa1af) at full opacity.

### Don't:
- **Don't** use tinted pill backgrounds for status, priority, or due dates.
- **Don't** put colored borders (left/right >1px) on rows or cards.
- **Don't** pair hairline borders with wide diffuse shadows; a defined edge or a tight shadow, never both.
- **Don't** use Space Grotesk anywhere but the view title.
- **Don't** drop functional text below 0.7rem.
