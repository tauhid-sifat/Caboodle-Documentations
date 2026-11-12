const fs = require("node:fs");
const path = require("node:path");
const ROOT = "E:/My Code/Caboodle-Documentations";
const parse = (l) => { const o = []; let c = ""; let q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const read = (f) => { const t = fs.readFileSync(f, "utf8").split(/\r\n/).filter(Boolean); const h = parse(t[0]); return t.slice(1).map((l) => { const v = parse(l); const o = {}; h.forEach((k, i) => (o[k] = v[i])); return o; }); };

const matrix = read(path.join(ROOT, "CS-1813-Route-Inspection-Matrix.csv"));
const inv = read(path.join(ROOT, "CS-1813-Button-Inventory.csv"));

const statuses = {};
for (const r of matrix) statuses[r["Inspection status"]] = (statuses[r["Inspection status"]] || 0) + 1;
console.log("routes:", matrix.length, statuses);

const ids = new Set(matrix.map((r) => r["Route ID"]));
const missingIds = [...new Set(inv.map((r) => r["Route ID"]))].filter((id) => !ids.has(id));
console.log("inventory route ids not in matrix:", missingIds.length);

const badEvidence = matrix.filter((r) => r["Evidence reference"] && !fs.existsSync(path.join(ROOT, "CS-1813", r["Evidence reference"])));
console.log("matrix evidence refs missing on disk:", badEvidence.length, badEvidence.slice(0, 3).map((b) => b["Evidence reference"]));

const invBad = [...new Set(inv.map((r) => r["Evidence reference"]))].filter((e) => e && !fs.existsSync(path.join(ROOT, "CS-1813", e)));
console.log("inventory evidence refs missing on disk:", invBad.length, invBad.slice(0, 3));

const noButtons = matrix.filter((r) => r["Inspection status"] === "Inspected" && !inv.some((i) => i["Route ID"] === r["Route ID"]));
console.log("inspected routes with no documented buttons:", noButtons.map((r) => r["Route ID"]));

const bp = {};
for (const r of inv) bp[r["Placement classification"]] = (bp[r["Placement classification"]] || 0) + 1;
console.log("bp counts:", bp);
console.log("inventory rows:", inv.length);
console.log("tabs identified:", [...new Set(matrix.map((r) => r["Tabs identified"]))].filter((t) => t && t !== "None" && t !== "n/a"));
