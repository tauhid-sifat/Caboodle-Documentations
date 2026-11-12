const fs = require("node:fs");
const t = fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/route-matrix.csv", "utf8").split(/\r\n/).filter(Boolean);
const parse = (l) => { const o = []; let c = ""; let q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const h = parse(t[0]);
const rows = t.slice(1).map((l) => { const v = parse(l); const o = {}; h.forEach((k, i) => (o[k] = v[i])); return o; });
const types = {};
rows.filter((r) => r["Consistency status"].startsWith("Inconsistent")).forEach((r) => {
  r["Consistency status"].replace("Inconsistent: ", "").split("; ").forEach((p) => {
    const k = p.replace(/\(x = \d+\)/, "").trim();
    types[k] = (types[k] || 0) + 1;
  });
});
console.log(types);
console.log("consistent:", rows.filter((r) => r["Consistency status"].startsWith("Consistent")).length);
console.log("no actions:", rows.filter((r) => r["Consistency status"].startsWith("No page-level")).length);
rows.filter((r) => r["Consistency status"].startsWith("Inconsistent")).forEach((r) => console.log(" ", r["Route ID"], "|", r["Consistency status"].slice(0, 150)));
