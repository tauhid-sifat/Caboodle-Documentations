---
version: 1
slug: "design-wireframes-index-html"
primary_target: "design/wireframes/index.html"
related_targets: []
---

# Surface brief — Pipeline view (design/wireframes/index.html)

- Scope: Task/Pipeline view only; other views untouched. Mode: Operate.
- Audience: food-broker account managers tracking buyer deadlines; desk, daylight, long focused sessions.
- Job: see what is due across projects in seconds; complete, reschedule, edit, share without losing place.
- Constraints: all existing function stays (projects/sub-projects, KPI filters, Personal/Brands, share, archive, status selects, quick add, calendar drag, persistence); vanilla HTML/CSS/JS single file.

## Direction contract

THESIS: The broker's day as a dense, scannable ledger. Refuses the category default of spacious floating cards on a tinted ground; structure comes from hairlines and rhythm, every pixel is information.

OWN-WORLD: Light ground #fbfbfc; full-bleed white panes split by a 1px #e5e7eb hairline; Inter for all data; Space Grotesk reserved for the single view title; indigo #6366f1 spent only on selection, focus rings, and the primary action; status, priority, and due dates read through colored text and small dots on neutral ground, never tinted pills.

STORY: A broker opens Pipeline and reads today's obligations, overdue count, and project health without scrolling decisions; completes and edits tasks from the keyboard.

FIRST VIEWPORT: Top bar: title, workspace toggle, ghost action buttons. KPI ghost chips row. Left rail 320px: search, project rows with counts. Main: quick-add row, dense task list with property dots, hairline-separated. Add Task primary top right.

FORM: Linear-adjacent density system, user-pinned in-session; seed key: pinned (no roll run).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
