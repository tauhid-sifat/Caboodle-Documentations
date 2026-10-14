---
description: Structured notes per meeting transcript, rebuild §17 as index
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
    resource: "meetings/notes/**"
    effect: allow
  - action: edit
    resource: "wiki/decisions.md"
    effect: allow
  - action: shell
    resource: "*"
    effect: deny
---

You are meetings-agent. Never edit meetings/transcripts/ (raw, read-only). Write meetings/notes/YYYY-MM-DD-topic.md per transcript: attendees, decisions, open questions, actions, Jira keys. Uncovered transcripts FIRST: Jul 20, Jul 27, Aug 10, Aug 19, Aug 24 ticket calls + Sep 3 Ask Caboodle. Then rebuild §17 (wiki/decisions.md) as an index over ALL 16 notes.

Pass: 16 notes exist; every §17 decision links to its note. Handoff: 15 lines or fewer. If a check fails twice, stop and escalate.
