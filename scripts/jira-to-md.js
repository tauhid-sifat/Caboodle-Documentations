/**
 * Convert fetched Jira exports (jira/tickets/*.md) to trimmed Markdown (jira/notes/*.md).
 * Keeps the contract: key, type, status, epic, assignee,
 * updated, summary, description, comments, links. Drops Reporter/Created/
 * Priority/Labels rows and normalises whitespace. Never invents content:
 * sections stay empty where the export has none. `module` dropped: no
 * module data exists in any Jira field. Epic derived from parent link
 * when the parent issuetype is Epic, else "".
 *
 * Usage:
 *   node scripts/jira-to-md.js --range 1728-1777   # pilot: CS-1728..CS-1777
 *   node scripts/jira-to-md.js --all               # full conversion
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_DIR = path.join(ROOT, 'jira', 'tickets');
const OUT_DIR = path.join(ROOT, 'jira', 'notes');

function splitSections(text) {
  const sections = {};
  const re = /^## (.+)$/gm;
  const heads = [];
  let m;
  while ((m = re.exec(text))) heads.push({ name: m[1].trim(), idx: m.index, end: m.index + m[0].length });
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].end;
    const stop = i + 1 < heads.length ? heads[i + 1].idx : text.length;
    sections[heads[i].name] = text.slice(start, stop).trim();
  }
  return sections;
}

function parseTicket(text, fallbackKey) {
  const lines = text.split('\n');
  const m = (lines[0] || '').match(/^#\s+([A-Z]+-\d+)\s+-\s?(.*)$/);
  const key = m ? m[1] : fallbackKey;
  const summary = m ? m[2].trim() : '';
  const fields = {};
  for (const line of lines) {
    const fm = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|$/);
    if (fm) fields[fm[1].trim()] = fm[2].trim();
  }
  const sections = splitSections(text);
  let body = sections.Description || '';
  // Trim: drop converter-artifact lead line, collapse 3+ blanks, trim edges.
  body = body.replace(/^\s*\*\*Description:\*\*\s*\n/, '').replace(/[ \t]+$/gm, '');
  body = body.replace(/\n{3,}/g, '\n\n').trim();
  return { key, summary, fields, body, sections };
}

const q = s => JSON.stringify(s ?? '');

// Trim each comment (split on ### headers) to first ~20 lines.
function trimComments(raw) {
  if (!raw || /^no comments\.?$/i.test(raw)) return '(none in export)';
  const parts = raw.split(/^### /m);
  const head = parts[0].trim();
  const comments = parts.slice(1);
  const out = [];
  if (head) out.push(head);
  for (const c of comments) {
    const lines = c.trimEnd().split('\n');
    const kept = lines.slice(0, 20).join('\n').trimEnd();
    out.push('### ' + kept + (lines.length > 20 ? `\n\n_(trimmed: ${lines.length - 20} more lines in export)_` : ''));
  }
  return out.join('\n\n').trim() || '(none in export)';
}

function toTrimmed(t) {
  const parentLine = (t.sections.Parent || '').split('\n')[0].trim();
  const isEpicParent = /\(epic\)\s*$/i.test(parentLine);
  const epic = isEpicParent ? (parentLine.match(/^([A-Z]+-\d+)/) || [])[1] || '' : '';
  const hasParent = parentLine && !/^no parent\.?$/i.test(parentLine);
  const linksRaw = (t.sections.Links || t.sections['Issue Links'] || '').trim();
  const noLinks = /^no issue links\.?$/i.test(linksRaw) || !linksRaw;
  const links = (noLinks ? '' : linksRaw) + (hasParent ? `${noLinks ? '' : '\n\n'}Parent: ${parentLine}` : '') || '(none in export)';
  return [
    '---',
    `key: ${t.key}`,
    `type: ${q(t.fields.Type)}`,
    `status: ${q(t.fields.Status)}`,
    `epic: ${q(epic)}`,
    `assignee: ${q(t.fields.Assignee)}`,
    `updated: ${q(t.fields.Updated)}`,
    `summary: ${q(t.summary)}`,
    '---',
    '',
    '## Description',
    '',
    t.body,
    '',
    '## Comments',
    '',
    trimComments((t.sections.Comments || '').trim()),
    '',
    '## Links',
    '',
    links,
    '',
  ].join('\n');
}

function main() {
  const args = process.argv.slice(2);
  let keys;
  const ri = args.indexOf('--range');
  const r = ri >= 0 ? args[ri + 1] : null;
  if (r) {
    const [lo, hi] = r.split('-').map(Number);
    keys = [];
    for (let n = lo; n <= hi; n++) keys.push(`CS-${n}`);
  } else if (args.includes('--all')) {
    keys = fs.readdirSync(IN_DIR).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3));
  } else {
    console.error('Usage: jira-to-md.js --range LO-HI | --all');
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const t0 = Date.now();
  let ok = 0, skipped = 0;
  for (const key of keys) {
    const src = path.join(IN_DIR, `${key}.md`);
    if (!fs.existsSync(src)) { skipped++; continue; }
    const t = parseTicket(fs.readFileSync(src, 'utf8'), key);
    fs.writeFileSync(path.join(OUT_DIR, `${t.key}.md`), toTrimmed(t));
    ok++;
  }
  console.log(`done: ${ok} converted, ${skipped} missing, ${Date.now() - t0}ms`);
}

main();
