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
if (failures.length) {
  console.error('Broken local Markdown links:\n' + failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS ' + markdown.length + ' Markdown files, ' + checkedLinks + ' local links');
}
