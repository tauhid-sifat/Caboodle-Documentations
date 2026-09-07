# Post internal tickets to Jira

Reads the spec files in `../tickets/` and creates them as Jira tickets in the **CS** project,
skipping any that already exist (matched by real `CS-*` number or by summary).

## What it posts

Only your **40 selected internal codes** (your list minus **CR3** and **RBMO2**):
`BD1 BD2 BD3 BD4 PM7 CR1 CR4 CR5 DA1 DA2 MO1–MO6 PM2–PM6 BMP1 BMP2 BMTSS1–BMTSS6 BMTPS1 BMTRC1 SRM1 RDR1 RDR2 RBMO1 RBS1 RBST1 ACDU1 AD1 AAC1 AAC2 ANAWT1 ASR1`

It does **not** re-post tickets that already exist in Jira (CS-1296, CS-1305, CS-1316, CS-1318, CS-1324, CS-1361, CS-1403, CS-1424, CS-1543, CS-1072).

---

## Step 1 — Get your Atlassian API token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**, name it (e.g. `caboodle-script`), and copy it.
3. You also need your **Atlassian account email** (the one you log in to Jira with).

## Step 2 — Fill in `.env`

In this folder (`scripts/`), copy `.env.example` to `.env` and fill in:

```ini
JIRA_BASE_URL=https://caboodleservices.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=paste-your-token-here
JIRA_PROJECT=CS
```

> `.env` is gitignored — your token is never committed.

## Step 3 — Verify (dry run)

```powershell
node post-jira.js
```

This prints what **would** be created and checks Jira for existing matches. No tickets are made.

## Step 4 — Create the tickets

```powershell
node post-jira.js --yes
```

You'll see one line per ticket: `OK  code -> CS-xxxx`, or `SKIP` / `FAIL` as appropriate.

---

## Troubleshooting

- **401 Unauthorized** → wrong email or token. Double-check the token is from the same account.
- **403 / API not available** → Jira is a Cloud (atlassian.net) site, and the account needs API access.
- **Issue type name not found** → the script falls back to Story/Task/Bug; if your CS project uses custom types, tell me the names.
- **FAIL with priority error** → the CS project may not have that priority value; priorities are auto-set to `Medium` when the spec says `TBD`.
