import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts } from 'pdf-lib';

async function samplePdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]);
  page.drawText('FOCUS AND FLOW', { x: 72, y: 720, size: 24, font: bold });
  page.drawText('A practical guide for long reading sessions.', { x: 72, y: 675, size: 14, font });
  page.drawText('Start with a comfortable type size and generous spacing.', { x: 72, y: 650, size: 14, font });
  page.drawText('RETURNING TO YOUR PLACE', { x: 72, y: 590, size: 21, font: bold });
  page.drawText('The reader remembers this paragraph on your device.', { x: 72, y: 550, size: 14, font });
  return Buffer.from(await pdf.save());
}

async function blankPdf() {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  return Buffer.from(await pdf.save());
}

async function openGeneratedPdf(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'focus-guide.pdf', mimeType: 'application/pdf', buffer: await samplePdf() });
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('FOCUS AND FLOW', { timeout: 15_000 });
}

async function storedDocuments(page: import('@playwright/test').Page, databaseName: string) {
  return page.evaluate(async (name) => new Promise<unknown[]>((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const documents = request.result.transaction('documents').objectStore('documents').getAll();
      documents.onerror = () => reject(documents.error);
      documents.onsuccess = () => { request.result.close(); resolve(documents.result); };
    };
  }), databaseName);
}

test('empty state is accessible and fits the viewport', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to reader' })).toBeFocused();
  await expect(page).toHaveTitle(/PDF Flow Reader/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Choose a PDF/i })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  expect(consoleErrors).toEqual([]);
});

test('landing steps name the text check and reading adjustments in plain words', async ({ page }, testInfo) => {
  await page.goto('/');
  const steps = page.locator('.how-it-works');
  await expect(steps.getByRole('heading', { level: 3 })).toHaveText([
    'Open locally',
    'Check the text order',
    'Adjust the reading view'
  ]);
  await expect(steps).toContainText('Set text size, spacing, line width, and contrast.');

  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Reading setup' }).click();
  await expect(page.locator('label[for="measure-range"]')).toBeVisible();
  await expect(page.locator('label[for="measure-range"]')).toContainText('Line width');
});

test('@claim:resume-place extracts a PDF, adjusts reading, and resumes its reading place', async ({ page }) => {
  await openGeneratedPdf(page);
  await expect(page.getByText(/confidence|Review suggested/).first()).toBeVisible();
  await page.keyboard.press('j');
  await expect(page.locator('[data-current="true"]')).toHaveCount(1);
  await page.keyboard.press(']');
  await expect(page.locator('#size-output')).toHaveText('24px');
  const readerAxe = await new AxeBuilder({ page }).analyze();
  expect(readerAxe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.getByRole('button', { name: /Resume reading/ })).toBeVisible();
  await page.getByRole('button', { name: /Resume reading/ }).click();
  await expect(page.getByText('Restored your last reading place.')).toBeVisible();
  await expect(page.locator('#reading-plane')).toHaveCSS('font-size', '24px');
});

test('shows a useful invalid-file error', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') });
  await expect(page.getByRole('alert')).toContainText(/valid|supported PDF/i, { timeout: 15_000 });
});

test('@claim:offline-reload app shell reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Reading reading-routine/i })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE');
  await expect(page.getByRole('status').filter({ hasText: 'offline' })).toBeVisible();
  await page.goto('/?source=installed-v3');
  await expect(page).toHaveTitle('PDF Flow Reader — read PDFs in a steady column');
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeVisible();
});

test('@claim:demo-sample opens the bundled sample in an isolated demo library', async ({ page }) => {
  await openGeneratedPdf(page);
  await page.getByRole('button', { name: 'Open another' }).click();
  const realLibraryBeforeDemo = await storedDocuments(page, 'pdf-flow-reader');
  expect(realLibraryBeforeDemo).toHaveLength(1);

  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByLabel('Demo controls')).toContainText('Demo — sample data');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).toContain('demo:pdf-flow-reader');
  expect(names).toContain('pdf-flow-reader');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: 'Resume reading' })).toBeVisible();
  await expect.poll(() => storedDocuments(page, 'pdf-flow-reader')).toEqual(realLibraryBeforeDemo);
});

test('@claim:extraction-boundary creates a reading column without changing or certifying the source PDF', async ({ page }) => {
  const sourceHash = async () => page.evaluate(async () => {
    const bytes = await (await fetch('/samples/reading-routine.pdf')).arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  });
  await page.goto('/?demo=1');
  const before = await sourceHash();
  const readingColumn = page.getByRole('article', { name: 'Reflowed document' });
  await expect(readingColumn).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
  await page.locator('#confidence-toggle').click();
  await expect(page.locator('#confidence-details')).toContainText('does not repair or certify the PDF');
  expect(await sourceHash()).toBe(before);
});

test('@claim:extraction-confidence shows the estimate, source check, and extraction notes', async ({ page }) => {
  await page.goto('/?demo=1');
  const note = page.getByRole('note');
  await expect(note).toContainText('Extraction estimate', { timeout: 15_000 });
  await expect(note).toContainText('check against the source when meaning matters');
  await note.getByRole('button').click();
  await expect(page.locator('#confidence-details')).toBeVisible();
  await expect(page.locator('#confidence-details li')).not.toHaveCount(0);
});

test('@claim:no-api-key-or-backend runs the static demo without credentials or an application backend', async ({ browser }, testInfo) => {
  const port = 43_900 + testInfo.workerIndex;
  const origin = `http://127.0.0.1:${port}`;
  const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: process.cwd(),
    env: { PATH: process.env.PATH || '', NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const output: string[] = [];
  preview.stdout.on('data', (chunk) => output.push(String(chunk)));
  preview.stderr.on('data', (chunk) => output.push(String(chunk)));

  try {
    await expect.poll(async () => {
      if (preview.exitCode !== null) throw new Error(`Static preview exited early:\n${output.join('')}`);
      try { return (await fetch(origin)).status; } catch { return 0; }
    }, { timeout: 10_000 }).toBe(200);

    const context = await browser.newContext();
    const requests: { url: string; method: string; postData: string | null }[] = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), postData: request.postData() }));
    const page = await context.newPage();
    await page.goto(`${origin}/?demo=1`);
    await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((request) => new URL(request.url).origin === origin)).toBe(true);
    expect(requests.every((request) => request.method === 'GET' && request.postData === null)).toBe(true);
    await context.close();
  } finally {
    preview.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      if (preview.exitCode !== null) resolve();
      else {
        preview.once('exit', () => resolve());
        setTimeout(() => { preview.kill('SIGKILL'); resolve(); }, 2_000);
      }
    });
  }
});

test('@claim:artwork-provenance verifies the displayed artwork source and generation record', async ({ page }) => {
  const [design, sourceRecordRaw, promptRecordRaw] = await Promise.all([
    readFile('.factory/design.md', 'utf8'),
    readFile('assets/src/reflow-gate.png.json', 'utf8'),
    readFile('assets/src/reflow-gate.prompt.json', 'utf8')
  ]);
  const sourceRecord = JSON.parse(sourceRecordRaw) as { prompt: string; deployment: string; size: string; quality: string };
  const promptRecord = JSON.parse(promptRecordRaw) as { asset: string; date: string; generator: string; prompt: string };

  await Promise.all([
    access('assets/src/reflow-gate.png'),
    access('public/assets/reflow-gate-720.avif'),
    access('public/assets/reflow-gate-1280.webp'),
    access('public/assets/social-card.jpg')
  ]);
  expect(promptRecord.asset).toBe('reflow-gate');
  expect(promptRecord.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(promptRecord.generator).toContain('/opt/fleet/lib/gen-image.sh');
  expect(sourceRecord.deployment).toBe('factory-image');
  expect(sourceRecord.quality).toBe('high');
  expect(sourceRecord.prompt).toBe(promptRecord.prompt);
  expect(design).toContain('Original asset generated for this product');
  expect(design).toContain('/opt/fleet/lib/gen-image.sh');
  expect(design).toContain(promptRecord.date);
  expect(design).toContain('reflow-gate');

  await page.goto('/');
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', '/assets/reflow-gate-1280.jpg');
  await expect(page.locator('footer')).toContainText('Original AI-generated artwork.');
});

test('@claim:private-local keeps the demo flow on the product origin', async ({ page }) => {
  const requests: { url: string; method: string; postData: string | null; resourceType: string }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), postData: request.postData(), resourceType: request.resourceType() }));
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((request) => new URL(request.url).origin === origin)).toBe(true);
  expect(requests.every((request) => request.method === 'GET' && request.postData === null)).toBe(true);
  expect(requests.filter((request) => ['fetch', 'xhr'].includes(request.resourceType)).map((request) => new URL(request.url).pathname)).toEqual(['/samples/reading-routine.pdf']);
  const privacySurfaces = await page.evaluate(() => ({
    cookies: document.cookie,
    scripts: [...document.scripts].map((script) => script.src).filter(Boolean),
    links: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) => link.href),
    analyticsGlobals: ['ga', 'gtag', 'dataLayer', 'fbq'].filter((key) => key in window)
  }));
  expect(privacySurfaces.cookies).toBe('');
  expect(privacySurfaces.analyticsGlobals).toEqual([]);
  expect([...privacySurfaces.scripts, ...privacySurfaces.links].every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:keyboard-controls changes the sample reader with keys', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  for (let repetition = 0; repetition < 5; repetition += 1) {
    await page.keyboard.press('j');
    await expect(page.locator('[data-current="true"]')).toHaveAttribute('data-block-index', '1');
    await page.waitForTimeout(150);
    await expect(page.locator('[data-current="true"]')).toHaveAttribute('data-block-index', '1');
    await page.keyboard.press('k');
    await expect(page.locator('[data-current="true"]')).toHaveAttribute('data-block-index', '0');
  }
  await page.keyboard.press(']');
  await expect(page.locator('#size-output')).toHaveText('24px');
  await page.keyboard.press('[');
  await expect(page.locator('#size-output')).toHaveText('22px');
  await page.keyboard.press('t');
  await expect(page.locator('.reader-shell')).toHaveAttribute('data-theme', 'white');
  await page.keyboard.press('h');
  await expect(page.locator('#outline-button')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#outline-button')).toHaveAttribute('aria-expanded', 'false');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('#reading-plane')?.insertAdjacentHTML('beforeend', '<div aria-hidden="true" style="height:2000px"></div>');
    window.scrollTo(0, 0);
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1200);
  const afterPageDown = 1200;
  await page.keyboard.press('Shift+Space');
  await page.waitForTimeout(500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(afterPageDown);
});

test('@claim:local-data-control exports, erases, and imports the local library', async ({ page }) => {
  await openGeneratedPdf(page);
  await page.getByRole('button', { name: 'Manage local data' }).click();
  const dataDialog = page.getByRole('dialog', { name: 'Local reading data' });
  await expect(dataDialog).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await dataDialog.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = Buffer.concat(chunks);
  expect(JSON.parse(exported.toString()).documents).toHaveLength(1);

  page.once('dialog', (dialog) => dialog.accept());
  await dataDialog.getByRole('button', { name: 'Erase all local data' }).click();
  await expect(page.getByRole('button', { name: /Resume reading/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Manage local data' }).click();
  await page.locator('#import-input').setInputFiles({ name: 'library.json', mimeType: 'application/json', buffer: exported });
  await expect(page.getByRole('status').filter({ hasText: 'Imported 1 saved document' })).toBeVisible();
  const savedCount = await page.evaluate(async () => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('pdf-flow-reader');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const count = request.result.transaction('documents').objectStore('documents').count();
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    };
  }));
  expect(savedCount).toBe(1);
});

test('rejects malformed branded imports and recovers from invalid legacy records', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage local data' }).click();
  const malformed = Buffer.from(JSON.stringify({
    product: 'pdf-flow-reader',
    version: 1,
    documents: [{ id: 'broken-record', blocks: [], settings: {} }]
  }));
  await page.locator('#import-input').setInputFiles({ name: 'malformed-library.json', mimeType: 'application/json', buffer: malformed });
  await expect(page.getByRole('status').filter({ hasText: 'invalid saved document' })).toBeVisible();
  await page.getByRole('dialog', { name: 'Local reading data' }).getByRole('button', { name: 'Close local data' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /Read long PDFs/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Resume reading/ })).toHaveCount(0);

  await page.evaluate(async () => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('pdf-flow-reader');
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('documents')) request.result.createObjectStore('documents', { keyPath: 'id' });
    };
    request.onsuccess = () => {
      const transaction = request.result.transaction('documents', 'readwrite');
      transaction.objectStore('documents').put({ id: 'legacy-broken-record', blocks: [], settings: {} });
      transaction.oncomplete = () => { request.result.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
  }));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /Read long PDFs/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Manage local data' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Open another clears reader shortcuts and produces no page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Open another' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Read long PDFs/ })).toBeVisible();
  await page.keyboard.press('j');
  await page.keyboard.press('h');
  await expect(page.getByRole('heading', { level: 1, name: /Read long PDFs/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('PDF loading state keeps the page h1 semantic', async ({ page }) => {
  await page.route('**/assets/pdf-*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'loading-check.pdf', mimeType: 'application/pdf', buffer: await samplePdf() });
  await expect(page.getByRole('heading', { level: 1, name: 'Building a stable flow…' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
});

test('@claim:stored-data-scope retains extracted reading data but no PDF bytes or password', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles('tests/fixtures/password-protected.pdf');
  const passwordDialog = page.getByRole('dialog', { name: 'Password protected' });
  await expect(passwordDialog).toBeVisible({ timeout: 15_000 });
  await passwordDialog.getByLabel('PDF password').fill('reader-secret');
  await passwordDialog.getByRole('button', { name: 'Unlock locally' }).click();
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('QUIET READING ROUTINE', { timeout: 15_000 });
  const stored = await page.evaluate(async () => new Promise<Record<string, unknown>>((resolve, reject) => {
    const request = indexedDB.open('pdf-flow-reader');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const all = request.result.transaction('documents').objectStore('documents').getAll();
      all.onsuccess = () => resolve(all.result[0]);
      all.onerror = () => reject(all.error);
    };
  }));
  expect(Object.keys(stored).sort()).toEqual(['blocks', 'confidence', 'confidenceNotes', 'createdAt', 'currentBlock', 'id', 'name', 'pageCount', 'settings', 'updatedAt']);
  const serialized = JSON.stringify(stored);
  expect(serialized).not.toContain('reader-secret');
  expect(serialized).not.toContain('%PDF');
  expect(await page.locator('#password-input').count()).toBe(1);
  expect(await page.locator('#password-input').inputValue()).toBe('');
});

test('@claim:scan-report reports image-only PDFs without a cloud request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'scan.pdf', mimeType: 'application/pdf', buffer: await blankPdf() });
  await expect(page.getByRole('alert')).toContainText('No selectable text was found', { timeout: 15_000 });
  await expect(page.getByRole('alert')).toContainText('cloud OCR is intentionally not used');
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:copy-restrictions refuses a PDF whose owner disabled text copying', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles('tests/fixtures/copy-restricted.pdf');
  await expect(page.getByRole('alert')).toContainText('owner has disabled text copying', { timeout: 15_000 });
  await expect(page.getByRole('alert')).toContainText('will not bypass that restriction');
});

test('@claim:reader-adjustments applies every reading control and contrast treatment', async ({ page }, testInfo) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Reading setup' }).click();
  await page.getByRole('button', { name: 'Increase text size' }).click();
  await page.locator('#font-select').selectOption('sans');
  await page.locator('#line-range').fill('2');
  await page.locator('#word-range').fill('0.2');
  await page.locator('#measure-range').fill('42');
  const computed = await page.locator('#reading-plane').evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontFamily: style.fontFamily, lineHeight: style.lineHeight, wordSpacing: style.wordSpacing, measure: style.getPropertyValue('--reader-measure') };
  });
  expect(computed.fontSize).toBe('24px');
  expect(computed.fontFamily).toContain('Arial');
  expect(Number.parseFloat(computed.lineHeight)).toBeCloseTo(48, 0);
  expect(Number.parseFloat(computed.wordSpacing)).toBeCloseTo(4.8, 0);
  expect(computed.measure).toBe('42ch');
  for (const theme of ['cream', 'white', 'dark', 'contrast']) {
    await page.locator(`input[name="theme"][value="${theme}"]`).check();
    await expect(page.locator('.reader-shell')).toHaveAttribute('data-theme', theme);
  }
});

test('mobile drawers are inert when closed and return focus to their opener', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '390px regression');
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  for (const panel of ['#outline-panel', '#settings-panel']) {
    await expect(page.locator(panel)).toHaveAttribute('inert', '');
    await expect(page.locator(panel)).toHaveAttribute('aria-hidden', 'true');
  }
  for (let index = 0; index < 24; index += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.outline-panel, .settings-panel')))).toBe(false);
  }
  const cases = [
    { opener: 'Headings', closer: 'Close headings', panel: '#outline-panel' },
    { opener: 'Reading setup', closer: 'Close reading setup', panel: '#settings-panel' }
  ];
  for (const item of cases) {
    const opener = page.getByRole('button', { name: item.opener });
    await opener.click();
    await expect(page.locator(item.panel)).not.toHaveAttribute('inert', '');
    await expect(page.getByRole('button', { name: item.closer })).toBeFocused();
    await page.getByRole('button', { name: item.closer }).click();
    await expect(page.locator(item.panel)).toHaveAttribute('inert', '');
    await expect(opener).toBeFocused();
  }
});

test('mobile reading controls stay visible and all reported targets meet 44px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '390px regression');
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#previous-block')).toContainText('Previous');
  await expect(page.locator('#next-block')).toContainText('Next');
  for (const locator of [
    page.locator('#previous-block'),
    page.locator('#next-block'),
    page.getByRole('link', { name: 'PDF Flow Reader home' }),
    page.getByRole('link', { name: 'Demo', exact: true }),
    page.locator('footer').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/privacy/');
  const contactBox = await page.getByRole('link', { name: 'sociobot.in' }).boundingBox();
  expect(contactBox?.width).toBeGreaterThanOrEqual(44);
  expect(contactBox?.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const skipBox = await skip.boundingBox();
  expect(skipBox?.width).toBeGreaterThanOrEqual(44);
  expect(skipBox?.height).toBeGreaterThanOrEqual(44);
});

test('reader focus and dialogs expose visible accessible state', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  for (const [id, name] of [['shortcut-dialog', 'Keyboard shortcuts'], ['data-dialog', 'Local reading data'], ['password-dialog', 'Password protected']]) {
    await page.locator(`#${id}`).evaluate((dialog: HTMLDialogElement) => dialog.showModal());
    await expect(page.getByRole('dialog', { name })).toBeVisible();
    await page.locator(`#${id}`).evaluate((dialog: HTMLDialogElement) => dialog.close());
  }
  await page.locator('.reader-shell').evaluate((element) => { (element as HTMLElement).dataset.theme = 'dark'; });
  await page.locator('#next-block').focus();
  await expect(page.locator('#next-block')).toHaveCSS('outline-color', 'rgb(244, 255, 87)');
  await page.locator('.reader-shell').evaluate((element) => { (element as HTMLElement).dataset.theme = 'contrast'; });
  await expect(page.locator('#next-block')).toHaveCSS('outline-color', 'rgb(244, 255, 87)');
});

test('legal, not-found, and every reader contrast treatment pass serious accessibility checks', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/', '/404/']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), route).toEqual([]);
  }
  await page.goto('/?demo=1');
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toBeVisible({ timeout: 15_000 });
  for (const theme of ['cream', 'white', 'dark', 'contrast']) {
    await page.locator('.reader-shell').evaluate((element, value) => { (element as HTMLElement).dataset.theme = value; }, theme);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), theme).toEqual([]);
  }
});

test('route links focus and announce each new h1, including Back and the 404 route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toContainText('Opened Privacy, kept local.');

  await page.getByRole('link', { name: 'Terms', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toContainText('Opened A reading aid, not a repair tool.');

  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByRole('link', { name: 'PDF Flow Reader home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused({ timeout: 15_000 });
  await expect(page.locator('#route-status')).toContainText('Opened Reading reading-routine');

  await page.evaluate(() => sessionStorage.setItem('pdf-flow-reader:route-focus', '1'));
  await page.goto('/404/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toContainText('Opened This page is not in the reader.');
});

test('every document route uses the same header, footer, controls, and canonical metadata', async ({ page }) => {
  const routes = [
    { route: '/', title: 'PDF Flow Reader — read PDFs in a steady column', canonical: 'https://pdf-flow-reader.sociobot.in/' },
    { route: '/?demo=1', title: 'Demo — PDF Flow Reader', canonical: 'https://pdf-flow-reader.sociobot.in/demo/' },
    { route: '/privacy/', title: 'Privacy — PDF Flow Reader', canonical: 'https://pdf-flow-reader.sociobot.in/privacy/' },
    { route: '/terms/', title: 'Terms — PDF Flow Reader', canonical: 'https://pdf-flow-reader.sociobot.in/terms/' },
    { route: '/404/', title: 'Page not found — PDF Flow Reader', canonical: 'https://pdf-flow-reader.sociobot.in/404/' }
  ];
  for (const { route, title, canonical } of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Show keyboard shortcuts' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Manage local data' })).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Read long PDFs in a steady column.');
    await expect(page.locator('footer')).toContainText('Original AI-generated artwork.');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  }
});
