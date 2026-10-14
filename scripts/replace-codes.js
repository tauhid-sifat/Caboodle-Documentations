/**
 * Replace internal ticket codes (BD1, MO1, …) with the real Jira codes
 * (CS-1588 … CS-1630) across all MD spec files in ../specs.
 *
 * Usage: node replace-codes.js            # dry run (prints changes)
 *        node replace-codes.js --apply    # apply changes in place
 */

const fs = require('fs');
const path = require('path');

const TICKETS_DIR = path.join(__dirname, '..', 'specs');

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

// Internal codes that must NOT be replaced (not part of the 43; they are
// analysis notes or spec-adjacent files we intentionally leave alone).
const DO_NOT_TOUCH = new Set([
  'INTERNAL', 'Talking', 'CS', 'CS-NEW', 'CR2', 'CR3', 'PM1', 'MO7', 'MO8', 'MO9',
]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const apply = process.argv.includes('--apply');
const sortedCodes = Object.keys(MAP).sort((a, b) => b.length - a.length);
const patterns = sortedCodes.map((c) => {
  if (DO_NOT_TOUCH.has(c)) return null;
  return { re: new RegExp(`\\b${escapeRegex(c)}\\b`, 'g'), from: c, to: MAP[c] };
}).filter(Boolean);

let total = 0;
for (const file of walk(TICKETS_DIR)) {
  if (file.includes('INTERNAL_TRACKING.md')) continue;
  const raw = fs.readFileSync(file, 'utf8');
  let out = raw;
  let changes = 0;
  for (const p of patterns) {
    const before = out;
    out = out.replace(p.re, p.to);
    const n = (before.match(p.re) || []).length;
    if (n > 0) changes += n;
  }
  if (changes > 0) {
    console.log(`${file.replace(TICKETS_DIR + path.sep, '')}  ->  ${changes} replace(s)`);
    if (apply) fs.writeFileSync(file, out);
    total += changes;
  }
}

console.log(`\nTotal replacements: ${total}${apply ? ' (applied)' : ' (DRY RUN — use --apply)'}`);
