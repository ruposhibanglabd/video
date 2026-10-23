// Minimal static server for the CodePixel Web microsite (range-enabled for video).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    // the rendered promo lives in ../output — serve it without copying a huge file into site/
    const ALIASES = {
      "/media/promo.mp4": path.resolve(ROOT, "..", "output", "CodePixel-Web-Promo-Reels.mp4"),
    };
    const alias = ALIASES[rel];
    const file = alias || path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));
    const insideRoot = alias ? true : file.startsWith(ROOT);
    if (!insideRoot || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404 — পাওয়া যায়নি");
      return;
    }
    const stat = fs.statSync(file);
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range;
    if (range && /^bytes=/.test(range)) {
      const [s, e] = range.replace("bytes=", "").split("-");
      const start = s ? parseInt(s, 10) : 0;
      const end = e ? parseInt(e, 10) : stat.size - 1;
      if (start >= stat.size) {
        res.writeHead(416, { "content-range": `bytes */${stat.size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        "content-type": type,
        "content-range": `bytes ${start}-${end}/${stat.size}`,
        "accept-ranges": "bytes",
        "content-length": end - start + 1,
        "cache-control": "public, max-age=3600",
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, {
      "content-type": type,
      "content-length": stat.size,
      "accept-ranges": "bytes",
      "cache-control": type.startsWith("video/") ? "public, max-age=3600" : "no-cache",
    });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("500 — " + err.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`CodePixel site → http://${HOST}:${PORT}  (root: ${ROOT})`);
});
