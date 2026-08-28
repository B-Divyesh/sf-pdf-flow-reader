import { clearDocuments, exportLibrary, importLibrary } from './db';

declare const __APP_VERSION__: string;

const closeIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>';
const routeFocusKey = 'pdf-flow-reader:route-focus';

export function siteHeader() {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="PDF Flow Reader home"><img src="/assets/icon.svg" width="36" height="36" alt=""><span>PDF FLOW READER</span></a>
    <p class="local-note"><span aria-hidden="true">●</span> Local only</p>
    <nav class="site-nav" aria-label="Primary"><a href="/?demo=1">Demo</a><a href="/privacy/">Privacy</a></nav>
    <div class="header-actions">
      <button class="text-button" id="shortcut-button" type="button" aria-haspopup="dialog" aria-label="Show keyboard shortcuts"><kbd>?</kbd> <span class="shortcut-wide">Show keyboard shortcuts</span><span class="shortcut-short" aria-hidden="true">Keys</span></button>
      <button class="text-button" id="data-button" type="button" aria-haspopup="dialog" aria-label="Manage local data"><span class="data-wide">Manage local data</span><span class="data-short" aria-hidden="true">Local data</span></button>
    </div>
  </header>`;
}

export function siteFooter() {
  return `<footer class="site-footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Read long PDFs in a steady column.</span><span>No upload. No tracking.</span><span>Built by Param Factory · v${__APP_VERSION__}</span><span class="art-credit">Original AI-generated artwork.</span></footer>`;
}

export function sharedRegions() {
  return `<div id="live-status" class="sr-only" aria-live="polite"></div><div id="route-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>`;
}

export function sharedDialogs() {
  return `<dialog id="shortcut-dialog" aria-labelledby="shortcut-title"><form method="dialog"><div class="dialog-heading"><h2 id="shortcut-title">Keyboard shortcuts</h2><button class="icon-button" value="close" aria-label="Close shortcuts">${closeIcon}</button></div><dl class="shortcut-list"><div><dt><kbd>J</kbd> / <kbd>K</kbd></dt><dd>Next / previous block</dd></div><div><dt><kbd>]</kbd> / <kbd>[</kbd></dt><dd>Increase / decrease text</dd></div><div><dt><kbd>T</kbd></dt><dd>Cycle contrast</dd></div><div><dt><kbd>H</kbd></dt><dd>Open headings</dd></div><div><dt><kbd>Space</kbd></dt><dd>Move down one screen</dd></div></dl></form></dialog>
  <dialog id="data-dialog" aria-labelledby="data-title"><form method="dialog"><div class="dialog-heading"><h2 id="data-title">Local reading data</h2><button class="icon-button" value="close" aria-label="Close local data">${closeIcon}</button></div><p>Extracted text, settings, and your reading place live only in this browser.</p><div class="dialog-actions"><button type="button" class="secondary-button" id="export-button">Export my data</button><button type="button" class="secondary-button" id="import-button">Import data</button><input class="visually-hidden-input" id="import-input" type="file" accept="application/json" aria-label="Import PDF Flow Reader data" tabindex="-1"><button type="button" class="danger-button" id="clear-button">Erase all local data</button></div><p class="dialog-status" id="data-status" role="status"></p></form></dialog>`;
}

type ChromeOptions = {
  onDataChanged?: () => void | Promise<void>;
  onDataCleared?: () => void | Promise<void>;
};

function announce(message: string) {
  const region = document.querySelector('#live-status');
  if (region) region.textContent = message;
}

export function bindChrome(options: ChromeOptions = {}) {
  const shortcut = document.querySelector<HTMLDialogElement>('#shortcut-dialog');
  const data = document.querySelector<HTMLDialogElement>('#data-dialog');
  document.querySelector('#shortcut-button')?.addEventListener('click', () => shortcut?.showModal());
  document.querySelector('#data-button')?.addEventListener('click', () => data?.showModal());
  document.querySelector('#export-button')?.addEventListener('click', async () => {
    const json = await exportLibrary();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `pdf-flow-reader-${new Date().toISOString().slice(0, 10)}.json` });
    link.click();
    URL.revokeObjectURL(url);
    announce('Your local reading data was exported.');
  });
  document.querySelector('#import-button')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#import-input')?.click());
  document.querySelector<HTMLInputElement>('#import-input')?.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    const status = document.querySelector<HTMLElement>('#data-status');
    try {
      const count = await importLibrary(await file.text());
      if (status) status.textContent = `Imported ${count} saved ${count === 1 ? 'document' : 'documents'}.`;
      await options.onDataChanged?.();
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : 'The import could not be read.';
    }
  });
  document.querySelector('#clear-button')?.addEventListener('click', async () => {
    if (!confirm('Erase all saved documents, reading places, and reader settings from this browser? This cannot be undone.')) return;
    await clearDocuments();
    data?.close();
    await options.onDataCleared?.();
    announce('All local reading data was erased.');
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => link.addEventListener('click', () => {
    const target = new URL(link.href, location.href);
    if (target.origin === location.origin && target.href !== location.href) sessionStorage.setItem(routeFocusKey, '1');
  }));
}

export function focusRouteHeading() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const requested = sessionStorage.getItem(routeFocusKey) === '1' || navigation?.type === 'back_forward';
  sessionStorage.removeItem(routeFocusKey);
  if (!requested) return;
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: false });
    const status = document.querySelector<HTMLElement>('#route-status');
    if (status) window.setTimeout(() => { status.textContent = `Opened ${heading.textContent?.trim() || document.title}`; }, 50);
  });
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    sessionStorage.setItem(routeFocusKey, '1');
    focusRouteHeading();
  }
});
