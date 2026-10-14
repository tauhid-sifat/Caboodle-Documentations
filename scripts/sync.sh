#!/usr/bin/env bash
# Knowledge refresh: Jira fetch -> regenerate notes -> stamp date.
# Usage: bash scripts/sync.sh [--dry-run]
#   --dry-run prints the steps without network writes.
# TODO(v0.14.0): plug `okn check` after regen, and sqlite rebuild of data/jira.db
#   (db is gitignored local cache; rebuild on demand via jira-agent).
# Requires: node, scripts/.env (Jira creds, gitignored). Telemetry stays off.
set -euo pipefail
cd "$(dirname "$0")/.."
export DO_NOT_TRACK=1

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "would: node scripts/fetch-jira.js --sync"
  echo "would: node scripts/jira-to-md.js --all"
  echo "would: stamp 'Last synced with live evidence' date in AGENTS.md"
  exit 0
fi

node scripts/fetch-jira.js --sync
node scripts/jira-to-md.js --all

TODAY=$(date +%F)
export TODAY
# Stamp the sync date in the AGENTS.md router header.
node scripts/stamp-sync-date.js "$TODAY"
echo "synced $TODAY"
