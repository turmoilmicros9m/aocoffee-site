// Regenerates sortmark/privacy/ and sortmark/support/ from the Sortmark docs.
// Usage: node build.mjs [path to sortmark/docs/app-store]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = process.argv[2] ?? '../sortmark/docs/app-store';
const email = 'turmoil.micros-9m@icloud.com';

const pages = [
  { md: 'privacy-policy.md', out: 'sortmark/privacy', other: ['/sortmark/support/', 'Sortmark support'] },
  { md: 'support.md', out: 'sortmark/support', other: ['/sortmark/privacy/', 'Sortmark privacy policy'] },
];

// Fill in the placeholders and drop the leading <!-- ... --> note.
const fill = (md) => md
  .replace(/^<!--[\s\S]*?-->\s*/, '')
  .replace(/https:\/\/example\.com\/sortmark\/privacy \(placeholder, replace\)/g, 'https://aocoffee.com/sortmark/privacy/')
  .replace(/\[CONTACT EMAIL\]( \(placeholder, replace\))?/g, email);

// Inline markdown: escape HTML, **bold**, bare URLs and emails become links.
const inline = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/https?:\/\/[^\s<]*[^\s<.,;:)]|[\w.+-]+@[\w-]+(\.[\w-]+)+/g,
    (m) => `<a href="${m.includes('@') ? 'mailto:' : ''}${m}">${m}</a>`);

// Block markdown: blank-line separated blocks of headings, lists or paragraphs.
const toHtml = (md) => md.trim().split(/\n\s*\n/).map((block) => {
  const lines = block.split('\n');
  const h = block.match(/^(#{1,6}) (.*)/);
  if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
  const list = (tag, re) => `<${tag}>\n${lines.map((l) => `  <li>${inline(l.replace(re, ''))}</li>`).join('\n')}\n</${tag}>`;
  if (lines.every((l) => /^- /.test(l))) return list('ul', /^- /);
  if (lines.every((l) => /^\d+\. /.test(l))) return list('ol', /^\d+\. /);
  return `<p>${lines.map(inline).join('<br>\n')}</p>`;
}).join('\n\n');

for (const { md, out, other } of pages) {
  const body = toHtml(fill(readFileSync(`${src}/${md}`, 'utf8')));
  const title = body.match(/<h1>(.*?)<\/h1>/)[1];
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/index.html`, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<main>
${body}
</main>
<footer><a href="${other[0]}">${other[1]}</a> · <a href="/">AO Coffee</a></footer>
</body>
</html>
`);
  console.log(`wrote ${out}/index.html`);
}
