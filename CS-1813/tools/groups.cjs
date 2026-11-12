const fs = require("node:fs");
const raw = fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813-Route-Inspection-Matrix.csv", "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);
const parse = (l) => { const o = []; let c = ""; let q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const h = parse(lines[0]);
const rows = lines.slice(1).map((l) => { const v = parse(l); const o = {}; h.forEach((k, i) => (o[k] = v[i])); return o; });

const ok = [], none = [], blocked = [];
const groups = {};
for (const r of rows) {
  const st = r["Consistency status"];
  const name = r["Page title"] + " (" + r["Route ID"] + ")";
  if (r["Inspection status"] === "Blocked") { blocked.push(name + " - " + r["Route"]); continue; }
  if (st.startsWith("No page-level")) { none.push(name); continue; }
  if (st.startsWith("Consistent")) { ok.push(name); continue; }
  st.replace("Inconsistent: ", "").split("; ").forEach((p) => {
    const key = p.replace(/\(x = \d+\)/, "").trim();
    (groups[key] = groups[key] || []).push(name);
  });
}
console.log("NO CHANGES (" + ok.length + "):");
ok.forEach((x) => console.log("  " + x));
console.log("\nNO PAGE-LEVEL ACTIONS (" + none.length + "):");
none.forEach((x) => console.log("  " + x));
console.log("\nBLOCKED (" + blocked.length + "):");
blocked.forEach((x) => console.log("  " + x));
console.log("\nCHANGES BY TYPE:");
for (const [k, v] of Object.entries(groups)) { console.log("  " + k + " (" + v.length + "): " + v.join(", ")); }
