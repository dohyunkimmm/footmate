'use strict';

// Check repository-relative links in current and retained Markdown documentation.
// Remote URLs and fragment-only links are intentionally out of scope.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const markdown = ['README.md', '.github/pull_request_template.md'];

function collect(directory) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) collect(relative);
    else if (entry.isFile() && entry.name.endsWith('.md')) markdown.push(relative);
  }
}
collect('docs');

const failures = [];
let checkedLinks = 0;
for (const source of markdown) {
  const content = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of content.matchAll(/!?\[[^\]\r\n]*\]\((<[^>]+>|[^)\r\n]+)\)/g)) {
    const raw = match[1].trim();
    let href = raw.startsWith('<')
      ? raw.slice(1, raw.indexOf('>'))
      : raw.replace(/\s+(?:"[^"]*"|'[^']*')\s*$/, '').trim();
    if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) continue;
    href = href.split(/[?#]/)[0];
    if (!href) continue;
    let decoded;
    try { decoded = decodeURIComponent(href); }
    catch { failures.push(source + ': invalid URI ' + href); continue; }

    const absolute = decoded.startsWith('/')
      ? path.resolve(root, '.' + decoded)
      : path.resolve(root, path.dirname(source), decoded);
    checkedLinks++;
    if ((absolute !== root && !absolute.startsWith(root + path.sep)) || !fs.existsSync(absolute)) {
      failures.push(source + ': ' + href);
    }
  }
}
// Main entry points and retained Case Study pages also expose static assets.
// The Worker serves the route aliases below; they are not filesystem paths.
const htmlEntries = [
  'index.html',
  'app.html',
  'beta.html',
  'beta-operator.html',
  'beta-data-notice.html',
  'src/case-study/materials.html',
  'src/case-study/forecast.html',
  'src/case-study/decision-memos.html'
];
const routedPages = new Set([
  '/demo', '/beta', '/beta/operator', '/prototype',
  '/app', '/demo.html', '/next', '/next.html'
]);
let checkedHtmlLinks = 0;

for (const source of htmlEntries) {
  const html = fs.readFileSync(path.join(root, source), 'utf8');
  // Check only concrete local href/src/poster attributes, not dynamic JS URLs.
  const tags = /<(?:a|link|script|img|source)\b[^>]*?\b(?:href|src|poster)\s*=\s*(["'])([^"']*)\1/gi;
  for (const match of html.matchAll(tags)) {
    const raw = match[2].trim();
    if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) continue;
    const href = raw.replace(/&amp;/gi, '&').split(/[?#]/)[0];
    if (!href || routedPages.has(href)) continue;
    let decoded;
    try { decoded = decodeURIComponent(href); }
    catch { failures.push(source + ': invalid URI ' + href); continue; }

    const absolute = decoded.startsWith('/')
      ? path.resolve(root, '.' + decoded)
      : path.resolve(root, path.dirname(source), decoded);
    checkedHtmlLinks++;
    if ((absolute !== root && !absolute.startsWith(root + path.sep)) || !fs.existsSync(absolute)) {
      failures.push(source + ': ' + href);
    }
  }
}

if (failures.length) {
  console.error('Broken local documentation/HTML links:\n' + failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS ' + markdown.length + ' Markdown files, ' + checkedLinks + ' local links; ' + htmlEntries.length + ' HTML entry points, ' + checkedHtmlLinks + ' local links');
}
