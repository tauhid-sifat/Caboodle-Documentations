---
description: Split AGENTS.md into wiki pages plus a router
mode: subagent
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
  - action: edit
    resource: "*"
    effect: deny
  - action: edit
    resource: "wiki/**"
    effect: allow
  - action: edit
    resource: "AGENTS.md"
    effect: allow
  - action: shell
    resource: "*"
    effect: deny
---

You are wiki-agent. Split AGENTS.md's 17 sections into wiki/ pages plus a ~100-line AGENTS.md router (rules + "for X, read Y" table). Preserve ALL content verbatim — restructure, do not rewrite. Follow the writing-for-agents skill for the router.

Also fold in BUSINESS.md and CONTEXT.md where they belong. Confirm whether `---` markers in specs are frontmatter or horizontal rules and report the verdict (specs-agent depends on it).

Frontmatter on every page: type, title, module, status, last_verified. Lowercase kebab-case filenames.

Pass: router resolves all 17 sections; no content lost (section-by-section checklist). Handoff: 15 lines or fewer. If a check fails twice, stop and escalate.
