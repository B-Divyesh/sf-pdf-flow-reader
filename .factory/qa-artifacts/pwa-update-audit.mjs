import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const root = process.argv[2];
const url = process.argv[3];
const result = { url, initial: {}, update: {}, offline: {} };
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${url}/demo/`);
await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
result.initial = await page.evaluate(async () => ({ controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() }));

const swPath = `${root}/sw.js`;
const original = await fs.readFile(swPath, 'utf8');
await fs.writeFile(swPath, original.replace('pdf-flow-reader-a271f7ea36a4', 'pdf-flow-reader-qa-update'));
await page.evaluate(() => navigator.serviceWorker.getRegistration().then(reg => reg?.update()));
let toastObserved = false;
for (let i = 0; i < 50; i++) {
  toastObserved ||= await page.locator('#update-toast').isVisible();
  if (await page.evaluate(async () => (await caches.keys()).includes('pdf-flow-reader-qa-update'))) break;
  await page.waitForTimeout(100);
}
await page.waitForTimeout(500);
toastObserved ||= await page.locator('#update-toast').isVisible();
result.update = await page.evaluate(async () => ({
  controller: navigator.serviceWorker.controller?.scriptURL,
  caches: await caches.keys(),
  toastVisibleNow: !document.querySelector('#update-toast')?.hasAttribute('hidden')
}));
result.update.toastObserved = toastObserved;
if (toastObserved) {
  await page.getByRole('button', { name: 'Reload' }).click();
  await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
  await page.waitForFunction(async () => (await caches.keys()).includes('pdf-flow-reader-qa-update'));
  result.update.afterReloadCaches = await page.evaluate(() => caches.keys());
}
await context.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.getByRole('article', { name: 'Reflowed document' }).waitFor();
result.offline = await page.evaluate(() => ({ sample: document.querySelector('#reading-plane')?.textContent?.includes('QUIET READING ROUTINE'), offlineBanner: !document.querySelector('#connection-banner')?.hasAttribute('hidden') }));
await browser.close();
console.log(JSON.stringify(result, null, 2));
await fs.writeFile('/work/repo/.factory/qa-artifacts/pwa-update.json', JSON.stringify(result, null, 2));
if (!result.update.caches.includes('pdf-flow-reader-qa-update') || !result.update.toastObserved || !result.offline.sample) process.exitCode = 1;
