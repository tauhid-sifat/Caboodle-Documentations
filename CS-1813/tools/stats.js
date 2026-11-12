const fs = require("node:fs");
const s = JSON.parse(fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/summary.json", "utf8"));
const inv = fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/inventory.csv", "utf8").split(/\r\n/).filter(Boolean);
const parse = (l) => { const o = []; let c = ""; let q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const hdr = parse(inv[0]); const idx = (n) => hdr.indexOf(n);
const rows = inv.slice(1).map(parse);

const perRoute = {};
for (const r of rows) {
  const id = r[idx("routeId")];
  perRoute[id] = (perRoute[id] || 0) + 1;
}
const top = Object.entries(perRoute).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log("buttons per route top:", top);

const byArea = {};
for (const r of rows) { const a = r[idx("area")]; byArea[a] = (byArea[a] || 0) + 1; }
console.log("by area:", byArea);

const labels = {};
for (const r of rows) { const l = r[idx("label")]; labels[l] = (labels[l] || 0) + 1; }
console.log("top labels:", Object.entries(labels).sort((a, b) => b[1] - a[1]).slice(0, 20));

const hdrRows = rows.filter((r) => /Page header/.test(r[idx("relative")]));
console.log("header-band buttons:", hdrRows.length);
const hdrLabels = {};
for (const r of hdrRows) { const l = r[idx("label")]; hdrLabels[l] = (hdrLabels[l] || 0) + 1; }
console.log("top header labels:", Object.entries(hdrLabels).sort((a, b) => b[1] - a[1]).slice(0, 25));

console.log("pages with header seq:");
s.pages.forEach((p) => console.log(" ", p.id, p.type.padEnd(13), (p.seq || []).join(" > ").slice(0, 100)));

console.log("issues:", s.orderFindings.filter((o) => o.issues.length).length);
console.log("pages with any of filter/export/action:", s.orderFindings.length);
