// Tiny static server for dist/ with clean URLs, used by the audit, tests and CI. No dependencies.
// Text files are gzipped when the client asks, as Cloudflare Pages does in production, so Lighthouse
// numbers measured against it are representative. Pass --no-gzip to turn that off.
//   node scripts/serve.mjs [dir] [port] [--no-gzip]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.gpx': 'application/gpx+xml' };

const TEXT = /\.(html|css|js|json|svg|xml|txt|webmanifest|gpx)$/;

/** @param {string} dir @param {number} port @param {{ gzip?: boolean }} [opts] @returns {Promise<http.Server>} */
export function serve(dir, port = 4173, { gzip = true } = {}) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'Not found');
      return;
    }
    const headers = { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', vary: 'accept-encoding' };
    if (gzip && TEXT.test(file) && /\bgzip\b/.test(String(req.headers['accept-encoding']))) {
      res.writeHead(200, { ...headers, 'content-encoding': 'gzip' });
      fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
      return;
    }
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const dir = args[0] || 'dist', port = Number(args[1] || 4173);
  serve(dir, port, { gzip: !process.argv.includes('--no-gzip') }).then(() => console.log(`Serving ${dir} at http://127.0.0.1:${port}/`));
}
