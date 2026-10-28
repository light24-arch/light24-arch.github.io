import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  }))).flat();
}

const allFiles = await filesIn(dist);
const published = new Set(allFiles.map((file) => path.relative(dist, file).split(path.sep).join('/')));
const failures = [];
const localURL = (value) => {
  const decoded = value.replaceAll('&amp;', '&');
  const url = new URL(decoded, 'https://light24-arch.github.io');
  if (url.origin !== 'https://light24-arch.github.io') return;
  const local = decodeURIComponent(url.pathname).replace(/^\//, '');
  if (!published.has(local) && !published.has(`${local.replace(/\/$/, '')}/index.html`) && !(local === '' && published.has('index.html'))) {
    failures.push(`Missing local resource: ${decoded}`);
  }
};

const pages = allFiles.filter((file) => file.endsWith('.html'));
let imageCount = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/<(img|script|link|video|a)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/g)) {
    const attributes = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((attribute) => [attribute[1].toLowerCase(), attribute[2] ?? attribute[3]]));
    for (const name of ['src', 'href']) if (attributes[name]) localURL(attributes[name]);
    if (match[1] !== 'img') continue;
    imageCount++;
    if (!attributes.width || !attributes.height || !attributes.srcset || !attributes.sizes) {
      failures.push(`Image without responsive sizes in ${path.relative(dist, file)}: ${attributes.src}`);
    }
    if (!attributes.src?.startsWith('/media/')) failures.push(`Unoptimized image: ${attributes.src}`);
    for (const candidate of attributes.srcset?.split(',') ?? []) localURL(candidate.trim().split(/\s+/)[0]);
  }
}
for (const file of published) {
  if (/\.(txt|docx?|jpe?g|png)$/i.test(file)) failures.push(`Authoring document or original image was published: ${file}`);
}
for (const collection of ['projects', 'artwork']) {
  for (const entry of await readdir(path.join(root, 'src/content', collection))) {
    if (entry.endsWith('.md') && !published.has(`${collection}/${entry.slice(0, -3)}/index.html`)) failures.push(`Missing project page: ${entry}`);
  }
}
if (pages.length !== 13) failures.push(`Expected 13 pages; found ${pages.length}`);
if (failures.length) throw new Error(failures.join('\n'));
const versions = {};
for (const name of ['astro', '@astrojs/react', 'react', 'sharp']) {
  versions[name] = JSON.parse(await readFile(path.join(root, 'node_modules', name, 'package.json'), 'utf8')).version;
}
const imageStats = JSON.parse(await readFile(path.join(root, 'src/generated/image-stats.json'), 'utf8'));
const totalBytes = (await Promise.all(allFiles.map((file) => stat(file)))).reduce((sum, item) => sum + item.size, 0);
const info = { commit: process.env.GITHUB_SHA ?? 'local', node: process.version, versions, pages: pages.length, imageCount, totalBytes, imageStats };
await writeFile(path.join(dist, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`);
console.log(`Verified ${pages.length} pages and ${imageCount} responsive images; no authoring documents or full-size originals published. Build ${(totalBytes / 1e6).toFixed(2)} MB.`);
