const fs = require("node:fs");
const raw = fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/inventory.csv", "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);
const parse = (l) => { const o = []; let c = ""; let q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const h = parse(lines[0]);
const idx = (n) => h.indexOf(n);
console.log("rows", lines.length - 1, "idx rel", idx("Relative position"), "idx label", idx("Button label"));
const slotOf = (label) => {
  const l = (label || "").toLowerCase().trim();
  if (!l) return null;
  if (/^filter|range filter|^reset$|^clear filters?/.test(l)) return "filter";
  if (/export|download/.test(l)) return "export";
  if (/^add|^new |^create|^upload$|^import actuals|^copy$|^import$/.test(l)) return "action";
  if (/^delete|^remove|force delete|delete selected|remove from calendar/.test(l)) return "destructive";
  if (/^sort by$|^sorted|^list view|^grid view|^refresh|^more actions|^expand |^previous|^next|^page |^items per page|^settings|switch sort/.test(l)) return "utility";
  if (/^edit|^link banner|^versions|^resume|^validate|^submit|^revoke|^push to|^view notes|^view comment|^about|^new folder|^select promo|^go to /.test(l)) return "secondary";
  return null;
};
let head = 0, un = 0;
const byLabel = {};
for (const l of lines.slice(1)) {
  const r = parse(l);
  if (!/Page header/.test(r[idx("Relative position")] || "")) continue;
  head++;
  const lab = r[idx("Button label")];
  if (!slotOf(lab)) { un++; byLabel[lab] = (byLabel[lab] || 0) + 1; }
}
console.log("header-band buttons:", head, "unassigned:", un);
console.log(Object.entries(byLabel).sort((a, b) => b[1] - a[1]).slice(0, 12));
