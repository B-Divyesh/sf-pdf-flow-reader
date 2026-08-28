import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name), root) : join(directory, entry.name).slice(root.length).replaceAll('\\', '/')));
  return files.flat();
}
const files = (await walk('dist')).filter((file) => !file.endsWith('.map') && file !== '/sw.js');
const template = await readFile('src/sw-template.js', 'utf8');
await writeFile('dist/sw.js', template.replace('__PRECACHE__', JSON.stringify(files)));
