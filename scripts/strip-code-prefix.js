/**
 * Remove the "[CODE] " prefix from the summary of the 43 Jira tickets created.
 * Uses scripts/.env for credentials.
 *
 * Usage:
 *   node strip-code-prefix.js             # dry run — print current summaries & new
 *   node strip-code-prefix.js --apply     # actually update Jira
 */

const fs = require('fs');
const path = require('path');

const MAP = {
  AAC1:'CS-1588', AAC2:'CS-1589', ACDU1:'CS-1590', AD1:'CS-1591', ANAWT1:'CS-1592',
  ASR1:'CS-1593', BMP1:'CS-1594', BMP2:'CS-1595', BMTPS1:'CS-1596', BMTRC1:'CS-1597',
  BD1:'CS-1598', BD2:'CS-1599', BD3:'CS-1600', BD4:'CS-1601', DA1:'CS-1602',
  DA2:'CS-1603', PM7:'CS-1604', CR1:'CS-1605', CR4:'CS-1606', CR5:'CS-1607',
  MO1:'CS-1608', MO2:'CS-1609', MO3:'CS-1610', MO4:'CS-1611', MO5:'CS-1612',
  MO6:'CS-1613', PM2:'CS-1614', PM3:'CS-1615', PM4:'CS-1616', PM5:'CS-1617',
  PM6:'CS-1618', RBMO1:'CS-1619', RBS1:'CS-1620', RBST1:'CS-1621', RDR1:'CS-1622',
  RDR2:'CS-1623', SRM1:'CS-1624', BMTSS1:'CS-1625', BMTSS2:'CS-1626', BMTSS3:'CS-1627',
  BMTSS4:'CS-1628', BMTSS5:'CS-1629', BMTSS6:'CS-1630',
};

function loadEnv() {
  const p = path.join(__dirname, '.env');
  const out = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const apply = process.argv.includes('--apply');
const env = loadEnv();
const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = env;
if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing Jira config in scripts/.env');
  process.exit(1);
}
const baseUrl = JIRA_BASE_URL.replace(/\/+$/, '');
const auth = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const headers = { Authorization: auth, 'Content-Type': 'application/json' };

async function getSummary(key) {
  const r = await fetch(`${baseUrl}/rest/api/3/issue/${key}?fields=summary`, { headers });
  if (!r.ok) throw new Error(`GET ${key} failed: ${r.status}`);
  return (await r.json()).fields.summary;
}

async function updateSummary(key, summary) {
  const r = await fetch(`${baseUrl}/rest/api/3/issue/${key}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ fields: { summary } }),
  });
  if (!r.ok) throw new Error(`PUT ${key} failed: ${r.status}: ${await r.text()}`);
  return true;
}

async function main() {
  for (const [code, key] of Object.entries(MAP)) {
    let summary;
    try {
      summary = await getSummary(key);
    } catch (e) {
      console.log(`ERR  ${key} (${code}): ${e.message}`);
      continue;
    }
    const prefix = `[${code}] `;
    let next = summary;
    if (summary.startsWith(prefix)) next = summary.slice(prefix.length);
    if (next === summary) {
      console.log(`SKIP ${key} (${code}): no [${code}] prefix — "${summary}"`);
      continue;
    }
    console.log(`${key} (${code}):\n  OLD: ${summary}\n  NEW: ${next}`);
    if (apply) {
      try { await updateSummary(key, next); console.log(`  UPDATED`); }
      catch (e) { console.log(`  FAIL: ${e.message}`); }
    }
  }
  console.log(apply ? '\n(Applied.)' : '\n(DRY RUN — use --apply to update Jira.)');
}

main().catch((e) => { console.error(e); process.exit(1); });
