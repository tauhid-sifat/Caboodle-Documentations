// Local file sink for the CS-1813 audit run.
// Receives POST bodies from the audited page and writes them under CS-1813/.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8787;

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.end("ok");
    const url = new URL(req.url, "http://127.0.0.1");
    const rel = url.searchParams.get("path") || "raw/pages/unnamed.json";
    const target = path.resolve(ROOT, rel);
    if (!target.startsWith(ROOT)) {
      res.statusCode = 403;
      return res.end("outside root");
    }
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const body = Buffer.concat(chunks);
      const isBin = url.searchParams.get("base64") === "1";
      fs.writeFileSync(target, isBin ? Buffer.from(body.toString("utf8"), "base64") : body);
      res.end("saved " + rel + " " + body.length);
    });
  })
  .listen(PORT, "127.0.0.1", () => console.log("sink on " + PORT));
