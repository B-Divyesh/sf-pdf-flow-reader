import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name), root) : join(directory, entry.name).slice(root.length).replaceAll('\\', '/')));
  return files.flat();
}
const assetFiles = (await walk('dist')).filter((file) => !file.endsWith('.map') && file !== '/sw.js');
// Static hosts resolve directory URLs to index.html, while Cache Storage does not.
// Precache both forms so /demo/ remains available after a first online visit.
const routeAliases = assetFiles.filter((file) => file.endsWith('/index.html') && file !== '/index.html').map((file) => file.slice(0, -'index.html'.length));
const installedStartUrl = '/?source=installed-v3';
const files = ['/', installedStartUrl, ...assetFiles, ...routeAliases];
const digest = createHash('sha256');
for (const file of assetFiles.sort()) {
  digest.update(file);
  digest.update(await readFile(`dist${file}`));
}
const cacheName = `pdf-flow-reader-${digest.digest('hex').slice(0, 12)}`;
const template = await readFile('src/sw-template.js', 'utf8');
await writeFile('dist/sw.js', template.replace('__CACHE_NAME__', cacheName).replace('__PRECACHE__', JSON.stringify(files)));
