import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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

test('extracts a PDF, adjusts reading, and resumes position', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'focus-guide.pdf', mimeType: 'application/pdf', buffer: await samplePdf() });
  await expect(page.getByRole('article', { name: 'Reflowed document' })).toContainText('FOCUS AND FLOW', { timeout: 15_000 });
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
  await expect(page.getByText('Restored your last reading position.')).toBeVisible();
  await expect(page.locator('#reading-plane')).toHaveCSS('font-size', '24px');
});

test('shows a useful invalid-file error', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') });
  await expect(page.getByRole('alert')).toContainText(/valid|supported PDF/i, { timeout: 15_000 });
});

test('app shell reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'PDF FLOW READER' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'offline' })).toBeVisible();
});
