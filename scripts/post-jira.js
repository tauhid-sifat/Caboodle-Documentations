/**
 * Caboodle — Post internal ticket specs to Jira.
 *
 * Reads spec files from ../tickets (all subfolders, *.md), skips ones that
 * already exist (matched by existing CS-* ticket number or by summary), and
 * creates the rest via the Jira Cloud REST API v3.
 *
 * REQUIRES (in ../scripts/.env):
 *   JIRA_BASE_URL   e.g. https://yourcompany.atlassian.net
 *   JIRA_EMAIL      the Atlassian account email
 *   JIRA_API_TOKEN  the Atlassian API token
 *   JIRA_PROJECT    the project key, e.g. CS
 *
 * Usage:
 *   node post-jira.js            # dry run — prints what WOULD be created
 *   node post-jira.js --yes      # actually create tickets
 *   node post-jira.js --list     # print all spec codes found
 *
 * Zero-dependency: uses Node's global fetch (Node 18+).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TICKETS_DIR = path.join(ROOT, 'tickets');

/* JSMap of existing real CS-* tickets and spec tuples that are already in Jira.
   Any spec whose code is in this set is skipped. */
const ALREADY_IN_JIRA = new Set([
  'CS-1296', 'CS-1305', 'CS-1316', 'CS-1318', 'CS-1324',
  'CS-1361', 'CS-1403', 'CS-1424', 'CS-1543', 'CS-1072',
]);

/* Explicitly excluded per client. */
const EXCLUDED = new Set(['CR3', 'RBMO2']);

/* The exact set of internal codes to post (the user's list minus CR3, RBMO2).
   Only these specs are considered; everything else in ../tickets is ignored. */
const TO_POST = new Set([
  'BD1', 'BD2', 'BD3', 'BD4', 'PM7',
  'CR1', 'CR4', 'CR5', 'DA1', 'DA2',
  'MO1', 'MO2', 'MO3', 'MO4', 'MO5', 'MO6',
  'PM2', 'PM3', 'PM4', 'PM5', 'PM6',
  'BMP1', 'BMP2',
  'BMTSS1', 'BMTSS2', 'BMTSS3', 'BMTSS4', 'BMTSS5', 'BMTSS6',
  'BMTPS1', 'BMTRC1', 'SRM1',
  'RDR1', 'RDR2', 'RBMO1', 'RBS1', 'RBST1',
  'ACDU1', 'AD1', 'AAC1', 'AAC2', 'ANAWT1', 'ASR1',
]);

/* Every spec is posted as a Story, Medium priority (per request). */
const ISSUE_TYPE_MAP = {
  story: 'Story',
  bug: 'Story',
  question: 'Story',
  prototype: 'Story',
  epic: 'Story',
  task: 'Story',
};
const DEFAULT_PRIORITY = 'Medium';

function envFile() {
  const p = path.join(__dirname, '.env');
  return p;
}

function loadEnv() {
  const p = envFile();
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

/* Parse a spec file into { code, title, type, priority, body } */
function parseSpec(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split('\n');

  const title = (lines[0] || '').replace(/^\uFEFF/, '').replace(/^#+\s*/, '').trim();

  let code = null, type = null, priority = 'TBD';
  const meta = lines.slice(0, 4).join('\n');

  // Code: leading **CODE** pattern anywhere in first 4 lines
  const codeMatch = meta.match(/\*\*([A-Za-z0-9-]+)\*\*/);
  if (codeMatch) code = codeMatch[1];

  // Type: after a pipe
  const typeMatch = meta.match(/\|\s*([^|]+?)\s*\|/);
  if (typeMatch) type = typeMatch[1].trim();

  // Priority
  const prMatch = meta.match(/Priority:\s*([^|\n]+)/i);
  if (prMatch) priority = prMatch[1].trim();

  // Fallback code from filename, e.g. BD1-broker....md -> BD1
  if (!code) {
    const fn = path.basename(file).replace(/\.md$/, '');
    const parts = fn.split('-');
    // if file starts with a code like BD1 add to first token
    code = parts[0] && /^[A-Za-z]{2,}\d+$/.test(parts[0]) ? parts[0] : fn;
  }

  return { code, title, type, priority, body: raw, file };
}

function normalizeType(t) {
  const s = (t || '').toLowerCase();
  if (!s) return 'story';
  if (s.includes('bug')) return 'bug';
  if (s.includes('question')) return 'question';
  if (s.includes('prototype')) return 'prototype';
  if (s.includes('epic')) return 'epic';
  return 'story';
}

async function listProjectIssueTypes(baseUrl, email, token, project) {
  const api = `${baseUrl}/rest/api/3/issuetype`;
  const r = await fetch(api, {
    headers: { Authorization: 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64') },
  });
  if (!r.ok) throw new Error('GET issuetype failed: ' + r.status + ' ' + await r.text());
  const data = await r.json();
  return data.map((t) => t.name);
}

async function searchExistingBySummary(baseUrl, email, token, project, summary) {
  // JQL: project = CS AND summary ~ "<summary>"
  const jql = encodeURIComponent(`project = ${project} AND summary ~ "${summary.replace(/"/g, '\\"')}"`);
  const api = `${baseUrl}/rest/api/3/search?jql=${jql}&maxResults=5`;
  const r = await fetch(api, {
    headers: { Authorization: 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64') },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.issues || []).map((i) => i.key);
}

function toAdf(md) {
  // Convert markdown spec body to Jira ADF (simple, best-effort).
  // Returns an ADF doc for the description field.
  const paragraphs = [];
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('# ')) {
      paragraphs.push({ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: line.slice(2) }] });
    } else if (line.startsWith('## ')) {
      paragraphs.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: line.slice(3) }] });
    } else if (line.startsWith('### ')) {
      paragraphs.push({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: line.slice(4) }] });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push({ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: line.slice(2).replace(/^\*\*|\*\*$/g, '') }] }] }] });
    } else if (/^\d+\.\s/.test(line)) {
      const t = line.replace(/^\d+\.\s/, '');
      paragraphs.push({ type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] }] });
    } else if (line === '---') {
      // skip hr
    } else {
      paragraphs.push({ type: 'paragraph', content: [{ type: 'text', text: line.replace(/\*\*/g, '') }] });
    }
  }
  return { type: 'doc', version: 1, content: paragraphs };
}

async function createIssue(baseUrl, email, token, project, spec, issueTypes) {
  const typeName = ISSUE_TYPE_MAP[normalizeType(spec.type)] || 'Story';
  let id = typeName;
  // If the project does not have that issue type by name, fall back to first available (usually Story/Task).
  if (!issueTypes.includes(typeName)) {
    id = issueTypes.find((n) => /story|task|bug/i.test(n)) || issueTypes[0];
  }

  const priority = DEFAULT_PRIORITY;

  const payload = {
    fields: {
      project: { key: project },
      summary: `[${spec.code}] ${spec.title}`,
      issuetype: { name: id },
      description: toAdf(spec.body),
    },
    update: {},
  };
  if (priority) payload.fields.priority = { name: priority };

  const api = `${baseUrl}/rest/api/3/issue`;
  const r = await fetch(api, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const resp = await r.text();
  if (r.ok) {
    return { ok: true, key: JSON.parse(resp).key };
  }
  return { ok: false, error: `${r.status}: ${resp}` };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--yes');
  const listOnly = args.includes('--list');

  const env = loadEnv();
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT } = env;
  if (listOnly) {
    for (const f of walk(TICKETS_DIR)) {
      const s = parseSpec(f);
      if (s.code && TO_POST.has(s.code)) {
        console.log(`${s.code.padEnd(8)} ${s.title}`);
      }
    }
    return;
  }

  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT) {
    console.error('Missing Jira config. Create scripts/.env with:');
    console.error('  JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT');
    return;
  }

  const baseUrl = JIRA_BASE_URL.replace(/\/+$/, '');
  const issueTypes = await listProjectIssueTypes(baseUrl, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT);

  const specs = [];
  for (const f of walk(TICKETS_DIR)) {
    const s = parseSpec(f);
    if (!s.code) continue;
    if (!TO_POST.has(s.code)) continue;
    if (EXCLUDED.has(s.code)) continue;
    if (ALREADY_IN_JIRA.has(s.code)) continue;
    specs.push(s);
  }

  console.log('Found candidate specs (not yet in Jira): ' + specs.length + '\n');

  let created = 0, skipped = 0, failed = 0;
  for (const s of specs) {
    const existing = await searchExistingBySummary(baseUrl, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT, s.title);
    if (existing.length > 0) {
      console.log(`SKIP  ${s.code.padEnd(8)} already exists -> ${existing.join(', ')}`);
      skipped++;
      continue;
    }
    if (dryRun) {
      console.log(`WOULD ${s.code.padEnd(8)} create "${s.title}" [${normalizeType(s.type)}]`);
      continue;
    }
    const res = await createIssue(baseUrl, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT, s, issueTypes);
    if (res.ok) {
      console.log(`OK    ${s.code.padEnd(8)} -> ${res.key}`);
      created++;
    } else {
      console.log(`FAIL  ${s.code.padEnd(8)} ${res.error}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created} | Skipped (exists): ${skipped} | Failed: ${failed}`);
  if (dryRun) console.log('(Dry run — ran with --yes to actually create.)');
}

main().catch((e) => { console.error(e); process.exit(1); });
