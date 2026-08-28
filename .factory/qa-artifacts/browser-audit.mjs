import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs/promises';

const out = { generatedAt: new Date().toISOString(), checks: [] };
const artifact = new URL('./browser/', import.meta.url);
await fs.mkdir(artifact, { recursive: true });

async function check(name, fn) {
  const started = Date.now();
  try {
    const evidence = await fn();
    out.checks.push({ name, status: 'PASS', durationMs: Date.now() - started, evidence });
  } catch (error) {
    out.checks.push({ name, status: 'FAIL', durationMs: Date.now() - started, error: String(error?.stack || error) });
  }
}

const browser = await chromium.launch();

for (const target of [
  { name: 'local', url: 'http://127.0.0.1:4173' },
  { name: 'live', url: 'https://pdf-flow-reader.sociobot.in' }
]) {
  await check(`${target.name}: cold first screen desktop`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${target.url}/`, { waitUntil: 'networkidle' });
    const evidence = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.innerText,
      lede: document.querySelector('.lede')?.textContent?.trim(),
      firstActions: [...document.querySelectorAll('.upload-zone button')].map(x => x.textContent?.trim()),
      facts: [...document.querySelectorAll('.trust-list li')].map(x => x.textContent?.trim()),
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      lang: document.documentElement.lang,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }));
    await page.screenshot({ path: new URL(`${target.name}-home-desktop.png`, artifact).pathname, fullPage: true });
    if (!evidence.h1?.toLowerCase().includes('read long pdfs') || !evidence.lede?.includes('low vision') || evidence.firstActions[0] !== 'Try it with sample data') throw new Error(JSON.stringify(evidence));
    if (errors.length) throw new Error(`console errors: ${errors.join(' | ')}`);
    await context.close();
    return evidence;
  });

  await check(`${target.name}: demo privacy, semantics and axe`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    page.on('request', r => requests.push({ url: r.url(), method: r.method(), postData: r.postData(), type: r.resourceType() }));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${target.url}/demo/`, { waitUntil: 'networkidle' });
    await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
    const origin = new URL(page.url()).origin;
    const databases = await page.evaluate(async () => (await indexedDB.databases()).map(x => x.name));
    const semantics = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      banner: document.querySelector('.demo-banner')?.textContent?.replace(/\s+/g, ' ').trim(),
      blocks: document.querySelectorAll('[data-block-index]').length,
      headings: document.querySelectorAll('.reading-plane h2,.reading-plane h3').length,
      confidence: document.querySelector('.confidence')?.textContent?.replace(/\s+/g, ' ').trim()
    }));
    const axe = await new AxeBuilder({ page }).analyze();
    const severe = axe.violations.filter(v => ['serious', 'critical'].includes(v.impact || '')).map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    const external = requests.filter(r => new URL(r.url).origin !== origin);
    const writes = requests.filter(r => r.method !== 'GET' || r.postData !== null);
    await page.screenshot({ path: new URL(`${target.name}-demo-desktop.png`, artifact).pathname, fullPage: true });
    if (external.length || writes.length || errors.length || severe.length || !databases.includes('demo:pdf-flow-reader') || databases.includes('pdf-flow-reader')) {
      throw new Error(JSON.stringify({ external, writes, errors, severe, databases }));
    }
    await context.close();
    return { semantics, databases, requestCount: requests.length, requestPaths: requests.map(r => new URL(r.url).pathname), severe };
  });

  await check(`${target.name}: 390px keyboard, drawers, focus and reduced motion`, async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${target.url}/demo/`, { waitUntil: 'networkidle' });
    await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
    const initial = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      outlineInert: document.querySelector('#outline-panel')?.hasAttribute('inert'),
      settingsInert: document.querySelector('#settings-panel')?.hasAttribute('inert'),
      nextBox: document.querySelector('#next-block')?.getBoundingClientRect().toJSON(),
      previousText: document.querySelector('#previous-block')?.textContent?.trim(),
      nextText: document.querySelector('#next-block')?.textContent?.trim(),
      panelTransition: getComputedStyle(document.querySelector('#outline-panel')).transitionDuration,
      markerAnimation: getComputedStyle(document.querySelector('.resume-toast') || document.body).animationDuration
    }));
    const visited = [];
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      visited.push(await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id, text: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 50), hiddenPanel: Boolean(document.activeElement?.closest('.outline-panel[inert],.settings-panel[inert]')) })));
    }
    if (visited.some(x => x.hiddenPanel)) throw new Error(`offscreen focus: ${JSON.stringify(visited)}`);
    const opener = page.getByRole('button', { name: 'Headings' });
    await opener.click();
    await page.getByRole('button', { name: 'Close headings' }).click();
    const restored = await opener.evaluate(el => el === document.activeElement);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => { const el = document.activeElement; const s = getComputedStyle(el); return { text: el?.textContent?.trim(), outlineColor: s.outlineColor, outlineWidth: s.outlineWidth, outlineStyle: s.outlineStyle, focusVisible: el?.matches(':focus-visible') }; });
    await page.screenshot({ path: new URL(`${target.name}-demo-mobile-focus.png`, artifact).pathname, fullPage: true });
    if (!restored || initial.overflow || !initial.outlineInert || !initial.settingsInert || Number(initial.nextBox?.height || 0) < 44 || Number.parseFloat(initial.panelTransition) > 0.001 || !focus.focusVisible || Number.parseFloat(focus.outlineWidth) < 2) throw new Error(JSON.stringify({ initial, restored, focus }));
    await context.close();
    return { initial, restored, focus, visited };
  });

  await check(`${target.name}: service worker controlled offline demo reload`, async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${target.url}/demo/`);
    await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    const before = await page.evaluate(async () => ({ controlled: Boolean(navigator.serviceWorker.controller), caches: await caches.keys(), registrations: (await navigator.serviceWorker.getRegistrations()).length }));
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
    const after = await page.evaluate(() => ({ title: document.title, sample: document.querySelector('#reading-plane')?.textContent?.includes('QUIET READING ROUTINE'), offlineBanner: !document.querySelector('#connection-banner')?.hasAttribute('hidden') }));
    if (!before.controlled || !after.sample || !after.offlineBanner) throw new Error(JSON.stringify({ before, after }));
    await context.close();
    return { before, after };
  });
}

await check('local: invalid, encrypted, storage and import recovery paths', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#pdf-input').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  const wrongType = await page.getByRole('alert').textContent();
  await page.locator('#pdf-input').setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not-pdf') });
  const malformed = await page.getByRole('alert').textContent();
  const blank = await PDFDocument.create(); blank.addPage([612, 792]);
  await page.locator('#pdf-input').setInputFiles({ name: 'scan.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await blank.save()) });
  const scan = await page.getByRole('alert').textContent();
  await page.locator('#pdf-input').setInputFiles('/work/repo/tests/fixtures/password-protected.pdf');
  const dialog = page.getByRole('dialog', { name: 'Password protected' });
  await dialog.getByLabel('PDF password').fill('wrong');
  await dialog.getByRole('button', { name: 'Unlock locally' }).click();
  await page.getByRole('dialog', { name: 'Password protected' }).waitFor();
  const wrongPassword = await page.locator('#password-error').textContent();
  await page.getByLabel('PDF password').fill('reader-secret');
  await page.getByRole('button', { name: 'Unlock locally' }).click();
  await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
  const stored = await page.evaluate(async () => await new Promise((resolve, reject) => {
    const r = indexedDB.open('pdf-flow-reader'); r.onerror = () => reject(r.error); r.onsuccess = () => { const q = r.result.transaction('documents').objectStore('documents').getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); };
  }));
  await page.getByRole('button', { name: 'Manage local data' }).click();
  await page.locator('#import-input').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{ nope') });
  await page.waitForFunction(() => Boolean(document.querySelector('#data-status')?.textContent?.trim()));
  const importError = await page.locator('#data-status').textContent();
  const passwordField = await page.locator('#password-input').inputValue();
  const serialized = JSON.stringify(stored);
  if (!wrongType?.includes('ending in .pdf') || !malformed?.match(/valid|supported/) || !scan?.includes('No selectable text') || !wrongPassword?.includes('did not open') || serialized.includes('reader-secret') || serialized.includes('%PDF') || passwordField || !importError) throw new Error(JSON.stringify({ wrongType, malformed, scan, wrongPassword, stored, passwordField, importError }));
  await context.close();
  return { wrongType, malformed, scan, wrongPassword, storedKeys: Object.keys(stored[0]).sort(), passwordField, importError };
});

await check('local: oversized boundary is rejected before extraction', async () => {
  const context = await browser.newContext(); const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#pdf-input').setInputFiles('/tmp/pdf-flow-reader-over-limit.pdf');
  const alert = await page.getByRole('alert').textContent();
  if (!alert?.includes('over the 100 MB')) throw new Error(String(alert));
  await context.close(); return { alert };
});

await browser.close();
await fs.writeFile(new URL('./browser-audit.json', import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (out.checks.some(x => x.status === 'FAIL')) process.exitCode = 1;
