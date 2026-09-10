const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const rewrites = new Map([
  ['/', 'index.html'],
  ['/index', 'index.html'],
  ['/index-source', 'index-source.html'],
  ['/demo', 'demo-shell.html'],
  ['/demo-shell', 'demo-shell.html'],
  ['/demo-source', 'demo-source.html']
]);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8'
};

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const mapped = rewrites.get(pathname);
  const relative = mapped || pathname.replace(/^\/+/, '');
  const candidates = mapped || path.extname(relative) ? [relative] : [`${relative}.html`, relative];
  for (const candidate of candidates) {
    const full = path.resolve(root, candidate);
    if (full !== root && !full.startsWith(root + path.sep)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file) {
    res.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }
  const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-store'
  });
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`FootMate test server listening on http://${host}:${port}`);
});
