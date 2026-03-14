import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function safePath(urlPath) {
  const normalized = path.normalize(decodeURIComponent(urlPath)).replace(/^\/+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  const reqPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = safePath(reqPath);

  if (!filePath) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Static server running at http://127.0.0.1:${port}`);
});
