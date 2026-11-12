const fs = require("node:fs");
const s = JSON.parse(fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/summary.json", "utf8"));
const fn = (l) => {
  const x = (l || "").toLowerCase();
  if (/select year|search year/.test(x)) return "search";
  if (/^search/.test(x)) return "search";
  if (/^filter/.test(x)) return "filter";
  if (/export/.test(x)) return "export";
  if (/delete|remove|force delete/.test(x)) return "delete";
  if (/^add|new |create|upload|import|submit/.test(x)) return "action";
  if (/^back/.test(x)) return "back";
  return "other";
};
let lastFilter = 0, lastExport = 0, neither = 0, withAll3 = 0, destructiveFirst = 0;
const rows = [];
for (const p of s.pages) {
  const seq = p.seq || [];
  const f = seq.findIndex((l) => fn(l) === "filter");
  const e = seq.findIndex((l) => fn(l) === "export");
  if (f < 0 && e < 0) continue;
  const last = seq.length - 1;
  const tail = fn(seq[last]);
  if (tail === "filter") lastFilter++;
  else if (tail === "export") lastExport++;
  else neither++;
  if (f >= 0 && e >= 0) withAll3++;
  if (seq.length && fn(seq[0]) === "delete") destructiveFirst++;
  rows.push([p.id, p.type, seq.join(" > "), tail]);
}
console.log("pages ending with Filter:", lastFilter, "| ending with Export:", lastExport, "| other:", neither);
console.log("pages with both Filter and Export:", withAll3);
console.log("pages whose left-most header action is destructive:", destructiveFirst);
console.log("----");
rows.forEach((r) => console.log(r[0], r[1], "|", r[2].slice(0, 90), "| last:", r[3]));

console.log("\n== search control x position ==");
const dir = "E:/My Code/Caboodle-Documentations/CS-1813/raw/controls";
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = d + "/" + e.name; if (e.isDirectory()) walk(p, acc); else acc.push(p); } return acc; };
for (const f of walk(dir)) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  const c = (j.controls || []).find((x) => /search|select year/i.test(x.l || ""));
  if (c) console.log(f.replace(dir + "/", "").padEnd(32), "x=" + c.r.x, "y=" + c.r.y, "w=" + c.r.w, "'" + (c.l || "").slice(0, 40) + "'");
}
