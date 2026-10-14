# Security notes (names only — never paste secret values here)

## Rotation list
- `JIRA_API_TOKEN` in `scripts/.env` is known plaintext on disk. Status: still
  live-configured; rotation NOT performed by agents. User rotates it in
  Atlassian admin (id.atlassian.com → Security → API tokens → revoke `caboodle-script`,
  create new, paste into `scripts/.env`), then confirms old token is revoked.
- `api/ask.js`: CLEAR. Reads `OPENCODE_API_KEY` / `OPENCODE_MODEL` from server env
  only; no hardcoded secret, nothing client-exposed. No rotation needed.

## Telemetry (okn not installed — do not install it)
Record for okn-agent, run once okn exists:
```
okn telemetry disable
```
plus `DO_NOT_TRACK=1` in the environment.
