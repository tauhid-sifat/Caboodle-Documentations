/**
 * Fetch live Jira tickets and sync to jira/tickets/
 * Uses new Jira Cloud search/jql API (nextPageToken pagination)
 * Converts ADF description to markdown-ish text
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'jira', 'tickets');

function loadEnv() {
  const p = path.join(__dirname, '.env');
  if (!fs.existsSync(p)) {
    console.error('Missing .env');
    process.exit(1);
  }
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

// Simple ADF -> markdown converter
function adfToMarkdown(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'doc') {
    return (node.content || []).map(adfToMarkdown).join('\n\n');
  }
  if (node.type === 'paragraph') {
    return (node.content || []).map(adfToMarkdown).join('');
  }
  if (node.type === 'text') {
    let t = node.text || '';
    // apply marks
    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === 'strong') t = `**${t}**`;
        else if (m.type === 'em') t = `*${t}*`;
        else if (m.type === 'underline') t = `${t}`;
        else if (m.type === 'code') t = `\`${t}\``;
        else if (m.type === 'link') {
          const href = m.attrs?.href || '';
          t = `[${t}](${href})`;
        }
      }
    }
    return t;
  }
  if (node.type === 'heading') {
    const level = node.attrs?.level || 1;
    const inner = (node.content || []).map(adfToMarkdown).join('');
    return `${'#'.repeat(level)} ${inner}`;
  }
  if (node.type === 'bulletList') {
    return (node.content || []).map(li => {
      const txt = (li.content || []).map(adfToMarkdown).join('');
      // li content may be paragraphs/lists, flatten bullet
      const lines = txt.split('\n').filter(Boolean);
      return lines.map((l, i) => i===0 ? `* ${l}` : `  ${l}`).join('\n');
    }).join('\n');
  }
  if (node.type === 'orderedList') {
    let idx = node.attrs?.order || 1;
    return (node.content || []).map(li => {
      const txt = (li.content || []).map(adfToMarkdown).join('');
      const line = `${idx++}. ${txt}`;
      return line;
    }).join('\n');
  }
  if (node.type === 'listItem') {
    return (node.content || []).map(adfToMarkdown).join('\n');
  }
  if (node.type === 'codeBlock') {
    const lang = node.attrs?.language || '';
    const inner = (node.content || []).map(adfToMarkdown).join('');
    return `\`\`\`${lang}\n${inner}\n\`\`\``;
  }
  if (node.type === 'blockquote') {
    const inner = (node.content || []).map(adfToMarkdown).join('\n');
    return inner.split('\n').map(l=>`> ${l}`).join('\n');
  }
  if (node.type === 'rule') return '---';
  if (node.type === 'hardBreak') return '\n';
  if (node.type === 'inlineCard') {
    const url = node.attrs?.url || '';
    return url ? `[${url}](${url})` : '';
  }
  if (node.type === 'media' || node.type === 'mediaGroup' || node.type === 'mediaSingle') {
    // attachments
    return '';
  }
  if (node.type === 'emoji') {
    return node.attrs?.shortName || node.attrs?.text || '';
  }
  if (node.type === 'mention') {
    return node.attrs?.text || '@' + (node.attrs?.id || '');
  }
  if (node.type === 'table') {
    const rows = (node.content || []).map(adfToMarkdown).join('\n');
    return rows;
  }
  if (node.type === 'tableRow') {
    const cells = (node.content || []).map(adfToMarkdown);
    return '| ' + cells.join(' | ') + ' |';
  }
  if (node.type === 'tableHeader' || node.type === 'tableCell') {
    return (node.content || []).map(adfToMarkdown).join(' ');
  }
  // fallback: recurse
  if (node.content) {
    return node.content.map(adfToMarkdown).join('');
  }
  return '';
}

function formatDate(iso) {
  if (!iso) return '';
  // keep ISO as in existing files? Existing files use 2026-08-17T17:33:00.292+0600
  // search API already returns that format, so just return as is
  return iso;
}

async function fetchAll(base, auth, jql) {
  const all = [];
  let nextPageToken = null;
  let page = 0;
  while (true) {
    let url = `${base}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,issuetype,status,priority,assignee,reporter,created,updated,labels,description`;
    if (nextPageToken) url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    console.log(`Fetching page ${++page}...`);
    const r = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json' } });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Search failed ${r.status}: ${t}`);
    }
    const data = await r.json();
    const issues = data.issues || [];
    all.push(...issues);
    console.log(`  got ${issues.length}, total so far ${all.length}, isLast=${data.isLast}`);
    if (data.isLast) break;
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
    // small delay to avoid rate limit
    await new Promise(res => setTimeout(res, 200));
  }
  return all;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || !args.includes('--sync')) {
    console.log('Usage: node fetch-jira.js --sync\nSyncs live Jira (CS, GTMS) to jira/tickets/. Requires scripts/.env.');
    return;
  }
  const env = loadEnv();
  const base = env.JIRA_BASE_URL.replace(/\/+$/, '');
  const auth = 'Basic ' + Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');

  // Fetch CS and GTMS
  const jql = 'project in (CS, GTMS) order by key ASC';
  const issues = await fetchAll(base, auth, jql);
  console.log(`\nTotal fetched: ${issues.length}`);

  // Ensure output dir
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Build index of existing files to detect deletions
  const existingFiles = new Set(fs.readdirSync(OUT_DIR).filter(f=>f.endsWith('.md')).map(f=>path.basename(f, '.md')));

  let written = 0, skipped = 0;
  for (const iss of issues) {
    const key = iss.key;
    const f = iss.fields;
    const summary = f.summary || '';
    const type = f.issuetype?.name || '';
    const status = f.status?.name || '';
    const priority = f.priority?.name || '';
    const assignee = f.assignee?.displayName || '';
    const reporter = f.reporter?.displayName || '';
    const created = formatDate(f.created);
    const updated = formatDate(f.updated);
    const labels = (f.labels || []).join(', ');

    let descMd = '';
    if (f.description) {
      descMd = adfToMarkdown(f.description).trim();
      if (!descMd) descMd = 'No description provided.';
    } else {
      descMd = 'No description provided.';
    }

    const md = `# ${key} - ${summary}

| Field | Value |
|-------|-------|
| **Type** | ${type} |
| **Status** | ${status} |
| **Priority** | ${priority} |
| **Assignee** | ${assignee} |
| **Reporter** | ${reporter} |
| **Created** | ${created} |
| **Updated** | ${updated} |
| **Labels** | ${labels} |

## Description

${descMd}
`;

    const outPath = path.join(OUT_DIR, `${key}.md`);
    fs.writeFileSync(outPath, md, 'utf8');
    written++;
    existingFiles.delete(key);
  }

  console.log(`Written ${written} files to ${OUT_DIR}`);
  if (existingFiles.size > 0) {
    console.log(`Stale files (no longer in Jira, keeping): ${Array.from(existingFiles).slice(0,20).join(', ')}${existingFiles.size>20?' ...':''} (total ${existingFiles.size})`);
    // Do not delete automatically; just report
  }

  // Also report max key
  const csKeys = issues.filter(i=>i.key.startsWith('CS-')).map(i=>parseInt(i.key.split('-')[1],10)).filter(n=>!isNaN(n));
  const maxCS = Math.max(...csKeys);
  console.log(`Max CS number: CS-${maxCS}`);
  console.log(`Total CS: ${csKeys.length}, Total GTMS: ${issues.length - csKeys.length}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
