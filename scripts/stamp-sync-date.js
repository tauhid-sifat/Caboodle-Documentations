// Stamp the sync date into the AGENTS.md router header.
// Usage: node scripts/stamp-sync-date.js YYYY-MM-DD
const fs = require('fs');
const day = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) {
  console.error('usage: node scripts/stamp-sync-date.js YYYY-MM-DD');
  process.exit(1);
}
const marker = 'Last synced with live evidence:** ';
const p = 'AGENTS.md';
const t = fs.readFileSync(p, 'utf8');
const i = t.indexOf(marker);
if (i < 0) {
  console.error('stamp: pattern not found');
  process.exit(1);
}
const dateStart = i + marker.length;
const dateEnd = t.indexOf('\n', dateStart);
const u = t.slice(0, dateStart) + day + t.slice(dateEnd);
fs.writeFileSync(p, u);
console.log('stamped ' + day);
