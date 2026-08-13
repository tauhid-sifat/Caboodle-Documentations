const fs = require('fs');
const csv = fs.readFileSync('F:\\My Code\\Caboodle\\Jira (3).csv', 'utf-8');
const lines = csv.split('\n');
const firstLine = lines[0];
const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
const descIdx = headers.findIndex(h => h === 'Description');
const keyIdx = headers.findIndex(h => h === 'Issue key');
const summaryIdx = headers.findIndex(h => h === 'Summary');
console.log('Description column index:', descIdx);
console.log('Issue key column index:', keyIdx);

function parseRow(text, start) {
  const fields = [];
  let cur = '';
  let inQ = false;
  let i = start;
  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      fields.push(cur);
      cur = '';
    } else if ((c === '\n' || c === '\r') && !inQ) {
      break;
    } else {
      cur += c;
    }
    i++;
  }
  fields.push(cur);
  return { fields, end: i };
}

const keys = ['CS-478','CS-1077','CS-1386','CS-1400','CS-617','CS-280','CS-376','CS-1112',
'CS-1225','CS-1211','CS-1199','CS-992','CS-1369',
'CS-1118','CS-1348','CS-1349','CS-1150','CS-1425','CS-1059',
'CS-1209','CS-1212','CS-1240','CS-1254','CS-725','CS-1022','CS-1090','CS-1092',
'CS-1095','CS-1174','CS-1177','CS-1185','CS-1186','CS-1187','CS-1192','CS-1193',
'CS-1236','CS-1244','CS-1248','CS-1258','CS-1259','CS-1273','CS-1353','CS-1413',
'CS-1414','CS-653','CS-1196','CS-1197','CS-1201','CS-1351','CS-1354','CS-1132',
'CS-1178','CS-1372','CS-1381','CS-1382','CS-1436','CS-532',
'CS-1202','CS-1307'];
const keySet = new Set(keys);
const results = [];
let pos = lines[0].length + 1;
while (pos < csv.length) {
  const r = parseRow(csv, pos);
  const key = r.fields[keyIdx];
  if (keySet.has(key)) {
    const desc = (r.fields[descIdx] || '').trim();
    const summary = (r.fields[summaryIdx] || '').trim();
    const hasText = desc.length > 50 && !desc.startsWith('!image');
    results.push({ key, hasDesc: hasText ? 'YES' : 'NO', len: desc.length, preview: desc.replace(/\n/g, ' ').substring(0, 80), summary: summary.substring(0, 60) });
  }
  pos = r.end + 1;
  if (pos <= 0) break;
}

console.log('\n=== NO DESCRIPTION ===');
results.filter(r => r.hasDesc === 'NO').forEach(r => console.log(r.key, '-', r.summary));
console.log('\n=== WITH DESCRIPTION ===');
results.filter(r => r.hasDesc === 'YES').forEach(r => console.log(r.key, '-', r.summary));
console.log('\nTotal:', results.length, '| With desc:', results.filter(r => r.hasDesc === 'YES').length, '| Without:', results.filter(r => r.hasDesc === 'NO').length);
