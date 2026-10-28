import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const media = path.join(root, 'public/media');
const generated = path.join(root, 'src/generated');
const widths = [480, 960, 1600, 2400];
const quality = 80;
sharp.concurrency(2);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  }))).flat();
}

const references = new Set();
for (const file of await filesIn(path.join(root, 'src'))) {
  if (file.startsWith(generated) || !/\.(astro|tsx?|md)$/.test(file)) continue;
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/["'](\/images\/[^"'\r\n]+\.(?:png|jpe?g))["']/gi)) references.add(match[1]);
}
await mkdir(media, { recursive: true });
await mkdir(generated, { recursive: true });
const manifest = {};
const usedFiles = new Set();
let originalBytes = 0;
let variantBytes = 0;
let fallbackBytes = 0;
const queue = [...references].sort();

// Bound parallel decoding for large architectural drawings on CI.
async function worker() {
  for (;;) {
    const url = queue.shift();
    if (!url) return;
    const input = await readFile(path.join(root, 'assets', url.slice(1)));
    originalBytes += input.length;
    const hash = createHash('sha256').update(input).update(`webp-v1-${quality}`).digest('hex').slice(0, 16);
    const metadata = await sharp(input).metadata();
    const sourceWidth = (metadata.orientation ?? 1) >= 5 ? metadata.height : metadata.width;
    if (!sourceWidth) throw new Error(`Missing dimensions: ${url}`);
    const targets = [...new Set(widths.map((width) => Math.min(width, sourceWidth)))];
    const variants = [];
    for (const width of targets) {
      const filename = `${hash}-${width}.webp`;
      usedFiles.add(filename);
      const output = path.join(media, filename);
      let info;
      try {
        const data = await stat(output);
        info = { ...(await sharp(output).metadata()), size: data.size };
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        info = await sharp(input).autoOrient().resize({ width, withoutEnlargement: true })
          .webp({ quality, effort: 4, smartSubsample: true }).toFile(output);
      }
      variantBytes += info.size;
      variants.push({ src: `/media/${filename}`, width: info.width, height: info.height, bytes: info.size });
    }
    const fallback = variants.find((variant) => variant.width >= 1600) ?? variants.at(-1);
    fallbackBytes += fallback.bytes;
    manifest[url] = {
      src: fallback.src, width: fallback.width, height: fallback.height,
      srcSet: variants.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    };
  }
}
await Promise.all([worker(), worker()]);
for (const filename of await readdir(media)) {
  if (/^[a-f0-9]{16}-\d+\.webp$/.test(filename) && !usedFiles.has(filename)) await unlink(path.join(media, filename));
}
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(generated, 'image-manifest.json'), `${JSON.stringify(sorted)}\n`);
const stats = { images: references.size, originalBytes, variantBytes, fallbackBytes };
await writeFile(path.join(generated, 'image-stats.json'), `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Images: ${stats.images}; originals ${(originalBytes / 1e6).toFixed(2)} MB; all variants ${(variantBytes / 1e6).toFixed(2)} MB; default images ${(fallbackBytes / 1e6).toFixed(2)} MB.`);
