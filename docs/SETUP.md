# Caboodle Knowledge Base — setup for any AI client

Gives your AI assistant cited answers from this repo (wiki, specs, meeting notes,
transcripts, docs, 1,784 Jira tickets) over MCP. Works with opencode, Claude Code,
Cursor, VS Code/Copilot, Windsurf — anything speaking MCP stdio.

## 1. Clone + install okn

```sh
git clone <this-repo> && cd Caboodle-Documentations
```

Install the `okn`/`openknowledge` binary and put it on PATH:
- macOS/Linux: `curl -fsSL https://openknowledge.sh/install | bash`
- Windows: download `openknowledge_windows_amd64.tar.gz` from
  github.com/openknowledge-sh/openknowledge/releases, extract, add to PATH.
- (Not yet published: `npm install -g @openknowledge-sh/openknowledge` — 404 as of 2026-10-14.)

Verify: `okn --no-telemetry version` (expect 0.14.0+; `check`/`publish` need it).

## 2. Register the six bundles (pick your client)

Replace `<root>` with your checkout path. All servers are read-only; telemetry off.

| Bundle | Source dir |
|---|---|
| caboodle-wiki | `<root>/kb/Wiki` |
| caboodle-specs | `<root>/Pilot` |
| caboodle-notes | `<root>/kb/Notes` |
| caboodle-transcripts | `<root>/kb/Transcripts` |
| caboodle-docs | `<root>/kb/Docs` |
| caboodle-jira | `<root>/kb/Jira` |

### opencode

Add to `opencode.json` under `mcp.servers` (one entry per bundle):

```jsonc
"caboodle-wiki": {
  "type": "local",
  "command": ["okn", "--no-telemetry", "mcp", "<root>/kb/Wiki"],
  "environment": { "DO_NOT_TRACK": "1" }
}
```

### Claude Code

```sh
claude mcp add --scope user caboodle-wiki --env DO_NOT_TRACK=1 -- okn --no-telemetry mcp <root>/kb/Wiki
# repeat for caboodle-specs (<root>/Pilot), caboodle-notes, caboodle-transcripts, caboodle-docs, caboodle-jira
```

Use `--scope project` instead to share via `.mcp.json` (teammates approve once with `/mcp`).

### Cursor / VS Code / Windsurf (generic `mcpServers` JSON)

```json
{
  "mcpServers": {
    "caboodle-wiki": {
      "command": "okn",
      "args": ["--no-telemetry", "mcp", "<root>/kb/Wiki"],
      "env": { "DO_NOT_TRACK": "1" }
    }
  }
}
```

## 3. Verify

Ask: *"What is the correct brand–broker assignment phrasing?"*
Expect a cited answer from `broker-brand-terminology.md:9-22`.
Then try: *"What does CS-1361 specify?"* (Jira bundle), *"Which meeting decided the sheet view?"* (notes bundle).

## 4. Refreshing data

```sh
bash scripts/sync.sh        # Jira fetch -> notes regen -> date stamp (Sunday 06:00 via Task Scheduler on maintainer box)
```

Re-run `okn setup <Bundle> --from <source> --mode copy` after big source changes; the MCP serves whatever is in the bundle dirs.

## Notes

- Telemetry is disabled everywhere here (`--no-telemetry` + `DO_NOT_TRACK=1`) — client-confidential data stays local. Re-enable per-client if you want analytics.
- `.env` (Jira creds) is gitignored and never needed for MCP reads.
- Jira *writes* (create/edit tickets) need the Atlassian remote MCP + OAuth, separate from this setup.
