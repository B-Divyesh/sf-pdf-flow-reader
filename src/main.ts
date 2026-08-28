import './style.css';
import { cancelExtraction, extractPdf, ReaderError } from './pdf';
import { clearDocuments, deleteDocument, exportLibrary, getRecentDocuments, importLibrary, saveDocument, setDemoStorage } from './db';
import { defaultSettings, type ReaderSettings, type SavedDocument } from './types';

declare const __APP_VERSION__: string;

const app = document.querySelector<HTMLElement>('#app')!;
let current: SavedDocument | undefined;
let recent: SavedDocument[] = [];
let pendingFile: File | undefined;
let saveTimer = 0;
let activeBlock = 0;
const demoMode = location.pathname.replace(/\/$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
setDemoStorage(demoMode);

const icons = {
  upload: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M4 15v5h16v-5"/></svg>',
  menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  tune: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 4v6M6 14v6"/></svg>',
  close: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>'
};

const escapeHtml = (text: string) => text.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const timeAgo = (timestamp: number) => {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  return days === 0 ? 'today' : new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-days, 'day');
};
const confidenceLabel = (score: number) => score >= 80 ? 'High confidence' : score >= 55 ? 'Review suggested' : 'Low confidence';

function header() {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="PDF Flow Reader home"><img src="/assets/icon.svg" width="36" height="36" alt=""><span>PDF FLOW READER</span></a>
    <p class="local-note"><span aria-hidden="true">●</span> Local only</p>
    <nav class="site-nav" aria-label="Primary"><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a></nav>
    <div class="header-actions">
      <button class="text-button" id="shortcut-button" type="button" aria-haspopup="dialog"><kbd>?</kbd> Shortcuts</button>
      <button class="text-button" id="data-button" type="button" aria-haspopup="dialog">Manage local data</button>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>No upload. No tracking.</span><span>Built by Param Factory · v${__APP_VERSION__}</span><span class="art-credit">Original AI-generated artwork.</span></footer>`;
}

function shell(content: string) {
  const demoBanner = demoMode ? `<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved to your real library.</strong><div><button class="text-button" id="reset-demo" type="button">Reset demo</button><button class="secondary-button" id="start-real" type="button">Start for real</button></div></aside>` : '';
  app.innerHTML = `${header()}<div id="connection-banner" class="connection-banner" role="status" hidden>You’re offline. Saved reading and new local PDFs still work.</div>${demoBanner}${content}${footer()}
  <div id="live-status" class="sr-only" aria-live="polite"></div>
  <div id="update-toast" class="toast" role="status" hidden><span>An app update is ready.</span><button type="button" id="reload-button">Reload</button></div>
  ${dialogs()}`;
  bindShared();
  updateConnection();
}

function homeView(error = '') {
  const resume = recent[0] ? `<section class="resume-strip" aria-labelledby="resume-title">
    <div><p class="eyebrow">Saved on this device</p><h3 id="resume-title">${escapeHtml(recent[0].name)}</h3><p>Page ${recent[0].blocks[recent[0].currentBlock]?.page || 1} of ${recent[0].pageCount} · ${timeAgo(recent[0].updatedAt)}</p></div>
    <button type="button" class="secondary-button" id="resume-button">Resume reading <span aria-hidden="true">→</span></button>
  </section>` : '';
  shell(`<main id="main" class="home-main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span>01</span> A steadier way through PDFs</p>
        <h1>Read long PDFs<br>in a steady <mark>column.</mark></h1>
        <p class="lede">For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view.</p>
        <div class="upload-zone" id="drop-zone">
          <input id="pdf-input" type="file" accept="application/pdf,.pdf" class="visually-hidden-input" aria-label="PDF file" tabindex="-1">
          <button class="primary-button" id="try-demo" type="button">Try it with sample data</button>
          <button class="secondary-button" id="choose-pdf" type="button">${icons.upload}<span>Choose a PDF</span></button>
          <p>The sample opens now. Your PDF is processed on this device.</p>
        </div>
        ${error ? `<div class="error-box" role="alert"><strong>Couldn’t open that PDF.</strong><span>${escapeHtml(error)}</span><button class="link-button" type="button" id="retry-button">Try another file</button></div>` : ''}
        <ul class="trust-list" aria-label="Reader features"><li><strong>01</strong> No upload</li><li><strong>02</strong> Remembers your place</li><li><strong>03</strong> Works offline</li></ul>
      </div>
      <figure class="hero-art">
        <picture><source type="image/avif" srcset="/assets/reflow-gate-720.avif 720w, /assets/reflow-gate-1280.avif 1280w" sizes="(max-width: 900px) 100vw, 48vw"><source type="image/webp" srcset="/assets/reflow-gate-720.webp 720w, /assets/reflow-gate-1280.webp 1280w" sizes="(max-width: 900px) 100vw, 48vw"><img src="/assets/reflow-gate-1280.jpg" srcset="/assets/reflow-gate-720.jpg 720w, /assets/reflow-gate-1280.jpg 1280w" sizes="(max-width: 900px) 100vw, 48vw" width="1280" height="853" fetchpriority="high" alt="Paper fragments feed into a blue mechanical press and emerge as one orderly column of text."></picture>
        <figcaption><span aria-hidden="true">↳</span> We extract readable text. We never alter or certify the source file.</figcaption>
      </figure>
    </section>${resume}
    <section class="how-it-works" aria-labelledby="how-title"><p class="eyebrow">What happens here</p><h2 id="how-title">The document stays yours.</h2><ol><li><span>1</span><h3>Open locally</h3><p>Your browser reads the file. It never travels to a server.</p></li><li><span>2</span><h3>Inspect the flow</h3><p>We show a confidence note because extraction can get reading order wrong.</p></li><li><span>3</span><h3>Read your way</h3><p>Set size, spacing, measure, and contrast. Return at the same paragraph.</p></li></ol></section>
  </main>`);
  bindHome();
}

function loadingView(file: File) {
  shell(`<main id="main" class="loading-main"><section class="loading-card" aria-labelledby="loading-title">
    <p class="eyebrow">Reading on this device</p><h2 id="loading-title">Building a stable flow…</h2><p class="file-name">${escapeHtml(file.name)}</p>
    <div class="progress-track" aria-hidden="true"><span id="progress-bar"></span></div><p id="progress-label" role="status" aria-live="polite">Opening the PDF…</p>
    <p class="muted">Long or image-heavy PDFs can take a moment. Nothing is uploaded.</p><button class="secondary-button" id="cancel-button" type="button">Cancel</button>
  </section></main>`);
  document.querySelector('#cancel-button')?.addEventListener('click', async () => { await cancelExtraction(); pendingFile = undefined; homeView(); });
}

function readerView(saved: SavedDocument, resumed = false) {
  current = saved;
  activeBlock = Math.min(saved.currentBlock, saved.blocks.length - 1);
  const headings = saved.blocks.map((block, index) => ({ block, index })).filter(({ block }) => block.kind === 'heading');
  shell(`<main id="main" class="reader-shell" data-theme="${saved.settings.theme}">
    <h1 class="sr-only">Reading ${escapeHtml(saved.name)}</h1>
    <nav class="outline-panel" id="outline-panel" aria-label="Document headings"><div class="panel-heading"><div><p class="eyebrow">Document map</p><h2>Headings</h2></div><button class="icon-button panel-close" data-close-panel="outline-panel" aria-label="Close headings">${icons.close}</button></div>
      ${headings.length ? `<ol class="heading-list">${headings.map(({ block, index }) => `<li><button type="button" data-block="${index}"><span>${String(block.page).padStart(2, '0')}</span>${escapeHtml(block.text)}</button></li>`).join('')}</ol>` : '<div class="panel-empty"><strong>No headings detected</strong><p>Use J and K to move paragraph by paragraph.</p></div>'}
    </nav>
    <section class="reader-center">
      <div class="reader-toolbar" aria-label="Reading tools"><button class="toolbar-button" id="outline-button" type="button" aria-label="Headings" aria-controls="outline-panel" aria-expanded="false">${icons.menu}<span>Headings</span></button><div class="doc-meta"><strong>${escapeHtml(saved.name)}</strong><span>${saved.pageCount} pages · ${saved.blocks.length} blocks</span></div><button class="toolbar-button" id="settings-button" type="button" aria-label="Reading setup" aria-controls="settings-panel" aria-expanded="false">${icons.tune}<span>Reading setup</span></button><button class="secondary-button change-file" id="change-file" type="button">Open another</button></div>
      <div class="confidence ${saved.confidence < 55 ? 'low' : ''}" role="note"><button type="button" id="confidence-toggle" aria-expanded="false"><span class="confidence-icon" aria-hidden="true">!</span><span><strong>${confidenceLabel(saved.confidence)}</strong><small>Extraction estimate · check against the source when meaning matters</small></span><span aria-hidden="true">＋</span></button><div id="confidence-details" hidden><p>Flow Reader adapts extracted text; it does not repair or certify the PDF.</p><ul>${saved.confidenceNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div></div>
      <article class="reading-plane" id="reading-plane" aria-label="Reflowed document" style="${settingsStyle(saved.settings)}">${saved.blocks.map((block, index) => block.kind === 'heading' ? `<h${Math.max(2, Math.min(3, block.level || 3))} id="${block.id}" data-block-index="${index}" tabindex="-1"><span class="page-tag">Page ${block.page}</span>${escapeHtml(block.text)}</h${Math.max(2, Math.min(3, block.level || 3))}>` : `<p id="${block.id}" data-block-index="${index}" tabindex="-1">${escapeHtml(block.text)}</p>`).join('')}</article>
      <div class="position-bar" aria-label="Reading position"><span id="position-text">Page ${saved.blocks[activeBlock]?.page || 1} of ${saved.pageCount}</span><div><button type="button" id="previous-block" aria-label="Previous paragraph">K ↑</button><button type="button" id="next-block" aria-label="Next paragraph">J ↓</button></div></div>
    </section>
    <aside class="settings-panel" id="settings-panel" aria-label="Reading setup"><div class="panel-heading"><div><p class="eyebrow">Make it yours</p><h2>Reading setup</h2></div><button class="icon-button panel-close" data-close-panel="settings-panel" aria-label="Close reading setup">${icons.close}</button></div>${settingsControls(saved.settings)}</aside>
  </main>${resumed ? '<div class="resume-toast" role="status">Restored your last reading position.</div>' : ''}`);
  bindReader(resumed);
}

function settingsStyle(settings: ReaderSettings) {
  return `--reader-size:${settings.fontSize}px;--reader-leading:${settings.lineHeight};--reader-word:${settings.wordSpacing}em;--reader-measure:${settings.measure}ch`;
}

function settingsControls(settings: ReaderSettings) {
  return `<form id="settings-form">
    <fieldset><legend>Text size</legend><div class="stepper"><button type="button" data-adjust="size-down" aria-label="Decrease text size">A−</button><output id="size-output">${settings.fontSize}px</output><button type="button" data-adjust="size-up" aria-label="Increase text size">A＋</button></div></fieldset>
    <label for="font-select">Typeface</label><select id="font-select"><option value="serif" ${settings.font === 'serif' ? 'selected' : ''}>Book serif</option><option value="sans" ${settings.font === 'sans' ? 'selected' : ''}>Clear sans</option><option value="hyper" ${settings.font === 'hyper' ? 'selected' : ''}>Hyperlegible fallback</option></select>
    <label for="line-range">Line spacing <output id="line-output">${settings.lineHeight.toFixed(2)}</output></label><input id="line-range" type="range" min="1.35" max="2.1" step="0.05" value="${settings.lineHeight}">
    <label for="word-range">Word spacing <output id="word-output">${settings.wordSpacing.toFixed(2)} em</output></label><input id="word-range" type="range" min="0" max="0.24" step="0.02" value="${settings.wordSpacing}">
    <label for="measure-range">Line width <output id="measure-output">${settings.measure} characters</output></label><input id="measure-range" type="range" min="42" max="78" step="4" value="${settings.measure}">
    <fieldset><legend>Contrast</legend><div class="swatches">${(['cream', 'white', 'dark', 'contrast'] as const).map((theme) => `<label class="swatch ${theme}"><input type="radio" name="theme" value="${theme}" ${settings.theme === theme ? 'checked' : ''}><span aria-hidden="true">Aa</span><small>${theme === 'cream' ? 'Warm' : theme[0].toUpperCase() + theme.slice(1)}</small></label>`).join('')}</div></fieldset>
    <p class="saved-note" id="saved-note"><span aria-hidden="true">●</span> Changes save on this device</p>
  </form>`;
}

function dialogs() {
  return `<dialog id="shortcut-dialog"><form method="dialog"><div class="dialog-heading"><h2>Keyboard shortcuts</h2><button class="icon-button" value="close" aria-label="Close shortcuts">${icons.close}</button></div><dl class="shortcut-list"><div><dt><kbd>J</kbd> / <kbd>K</kbd></dt><dd>Next / previous block</dd></div><div><dt><kbd>]</kbd> / <kbd>[</kbd></dt><dd>Increase / decrease text</dd></div><div><dt><kbd>T</kbd></dt><dd>Cycle contrast</dd></div><div><dt><kbd>H</kbd></dt><dd>Open headings</dd></div><div><dt><kbd>Space</kbd></dt><dd>Move down one screen</dd></div></dl></form></dialog>
  <dialog id="data-dialog"><form method="dialog"><div class="dialog-heading"><h2>Local reading data</h2><button class="icon-button" value="close" aria-label="Close local data">${icons.close}</button></div><p>Extracted text, settings, and reading positions live only in this browser.</p><div class="dialog-actions"><button type="button" class="secondary-button" id="export-button">Export my data</button><button type="button" class="secondary-button" id="import-button">Import data</button><input class="visually-hidden-input" id="import-input" type="file" accept="application/json" aria-label="Import PDF Flow Reader data" tabindex="-1"><button type="button" class="danger-button" id="clear-button">Erase all local data</button></div><p class="dialog-status" id="data-status" role="status"></p></form></dialog>
  <dialog id="password-dialog"><form id="password-form"><div class="dialog-heading"><h2>Password protected</h2><button class="icon-button" value="cancel" formmethod="dialog" aria-label="Cancel opening PDF">${icons.close}</button></div><p>This PDF needs its open password. The password is used only for this attempt and is never saved.</p><label for="password-input">PDF password</label><input id="password-input" type="password" autocomplete="off" required><p id="password-error" class="field-error" role="alert"></p><div class="dialog-actions"><button type="submit" class="primary-button">Unlock locally</button><button value="cancel" formmethod="dialog" class="secondary-button">Cancel</button></div></form></dialog>`;
}

function bindShared() {
  const shortcut = document.querySelector<HTMLDialogElement>('#shortcut-dialog')!;
  const data = document.querySelector<HTMLDialogElement>('#data-dialog')!;
  document.querySelector('#shortcut-button')?.addEventListener('click', () => shortcut.showModal());
  document.querySelector('#data-button')?.addEventListener('click', () => data.showModal());
  document.querySelector('#reload-button')?.addEventListener('click', () => location.reload());
  document.querySelector('#reset-demo')?.addEventListener('click', resetDemo);
  document.querySelector('#start-real')?.addEventListener('click', async () => { await clearDocuments(); location.assign('/'); });
  document.querySelector('#export-button')?.addEventListener('click', async () => {
    const json = await exportLibrary();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `pdf-flow-reader-${new Date().toISOString().slice(0, 10)}.json` });
    link.click(); URL.revokeObjectURL(url); announce('Your local reading data was exported.');
  });
  document.querySelector('#import-button')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#import-input')?.click());
  document.querySelector<HTMLInputElement>('#import-input')?.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
    const status = document.querySelector<HTMLElement>('#data-status')!;
    try { const count = await importLibrary(await file.text()); status.textContent = `Imported ${count} saved ${count === 1 ? 'document' : 'documents'}.`; recent = await getRecentDocuments(); }
    catch (error) { status.textContent = error instanceof Error ? error.message : 'The import could not be read.'; }
  });
  document.querySelector('#clear-button')?.addEventListener('click', async () => {
    if (!confirm('Erase all saved documents, positions, and reader settings from this browser? This cannot be undone.')) return;
    await clearDocuments(); recent = []; current = undefined; data.close(); homeView(); announce('All local reading data was erased.');
  });
}

function bindHome() {
  const input = document.querySelector<HTMLInputElement>('#pdf-input')!;
  document.querySelector('#choose-pdf')?.addEventListener('click', () => input.click());
  document.querySelector('#try-demo')?.addEventListener('click', () => location.assign('/demo/'));
  input.addEventListener('change', () => input.files?.[0] && openFile(input.files[0]));
  const drop = document.querySelector<HTMLElement>('#drop-zone')!;
  for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('is-dragging'); });
  for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('is-dragging'); });
  drop.addEventListener('drop', (event) => { const file = (event as DragEvent).dataTransfer?.files[0]; if (file) openFile(file); });
  document.querySelector('#retry-button')?.addEventListener('click', () => input.click());
  document.querySelector('#resume-button')?.addEventListener('click', () => recent[0] && readerView(recent[0], true));
}

async function openSample() {
  try {
    const response = await fetch('/samples/reading-routine.pdf');
    if (!response.ok) throw new Error('The sample PDF could not be loaded.');
    await openFile(new File([await response.blob()], 'reading-routine.pdf', { type: 'application/pdf' }));
  } catch (error) {
    homeView(error instanceof Error ? error.message : 'The sample PDF could not be loaded.');
  }
}

async function resetDemo() {
  await clearDocuments();
  recent = [];
  current = undefined;
  await openSample();
}

async function openFile(file: File, password?: string) {
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { homeView('Choose a file ending in .pdf.'); return; }
  if (file.size > 100 * 1024 * 1024) { homeView('That file is over the 100 MB local processing limit.'); return; }
  pendingFile = file; loadingView(file);
  try {
    const result = await extractPdf(file, password, (page, total) => {
      const label = document.querySelector('#progress-label'); const bar = document.querySelector<HTMLElement>('#progress-bar');
      if (label) label.textContent = `Extracting page ${page} of ${total}…`;
      if (bar) bar.style.width = `${Math.round(page / total * 100)}%`;
    });
    const existing = recent.find((item) => item.id === result.id);
    const now = Date.now();
    const saved: SavedDocument = { ...result, name: file.name.replace(/\.pdf$/i, ''), currentBlock: existing?.currentBlock || 0, settings: existing?.settings || { ...defaultSettings }, createdAt: existing?.createdAt || now, updatedAt: now };
    await saveDocument(saved); recent = [saved, ...recent.filter((item) => item.id !== saved.id)]; pendingFile = undefined; readerView(saved, Boolean(existing));
  } catch (error) {
    if (error instanceof ReaderError && error.code === 'PASSWORD') { showPassword(error.message); return; }
    if (error instanceof ReaderError && error.code === 'CANCELLED') return;
    pendingFile = undefined; homeView(error instanceof Error ? error.message : 'The PDF could not be read.');
  }
}

function showPassword(message: string) {
  homeView(); const dialog = document.querySelector<HTMLDialogElement>('#password-dialog')!; const form = document.querySelector<HTMLFormElement>('#password-form')!;
  const file = pendingFile;
  document.querySelector('#password-error')!.textContent = message; dialog.showModal(); document.querySelector<HTMLInputElement>('#password-input')!.focus();
  form.addEventListener('submit', (event) => { event.preventDefault(); const password = document.querySelector<HTMLInputElement>('#password-input')!.value; dialog.close('submit'); if (file) openFile(file, password); }, { once: true });
  dialog.addEventListener('close', () => { if (dialog.returnValue === 'cancel') pendingFile = undefined; }, { once: true });
}

function bindReader(resumed: boolean) {
  if (!current) return;
  applySettings();
  document.querySelector('#change-file')?.addEventListener('click', () => homeView());
  document.querySelector('#confidence-toggle')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement; const details = document.querySelector<HTMLElement>('#confidence-details')!; details.hidden = !details.hidden; button.setAttribute('aria-expanded', String(!details.hidden));
  });
  document.querySelector('#outline-button')?.addEventListener('click', () => togglePanel('outline-panel'));
  document.querySelector('#settings-button')?.addEventListener('click', () => togglePanel('settings-panel'));
  document.querySelectorAll<HTMLElement>('[data-close-panel]').forEach((button) => button.addEventListener('click', () => closePanel(button.dataset.closePanel!)));
  document.querySelectorAll<HTMLButtonElement>('[data-block]').forEach((button) => button.addEventListener('click', () => { goToBlock(Number(button.dataset.block)); closePanel('outline-panel'); }));
  document.querySelector('#previous-block')?.addEventListener('click', () => goToBlock(activeBlock - 1));
  document.querySelector('#next-block')?.addEventListener('click', () => goToBlock(activeBlock + 1));
  bindSettings();
  let scrollTimer = 0;
  window.addEventListener('scroll', () => { window.clearTimeout(scrollTimer); scrollTimer = window.setTimeout(updatePositionFromScroll, 120); }, { passive: true });
  if (resumed && current.currentBlock > 0) requestAnimationFrame(() => goToBlock(current!.currentBlock, false)); else updatePosition(0);
}

function togglePanel(id: string) {
  const panel = document.querySelector<HTMLElement>(`#${id}`)!; const open = panel.classList.toggle('is-open');
  document.body.classList.toggle('panel-open', open); const button = document.querySelector<HTMLButtonElement>(id === 'outline-panel' ? '#outline-button' : '#settings-button'); button?.setAttribute('aria-expanded', String(open));
  if (open) panel.querySelector<HTMLElement>('button, input, select')?.focus();
}
function closePanel(id: string) { document.querySelector(`#${id}`)?.classList.remove('is-open'); document.body.classList.remove('panel-open'); document.querySelector(id === 'outline-panel' ? '#outline-button' : '#settings-button')?.setAttribute('aria-expanded', 'false'); }

function goToBlock(index: number, focus = true) {
  if (!current) return; activeBlock = Math.max(0, Math.min(index, current.blocks.length - 1));
  const block = document.querySelector<HTMLElement>(`[data-block-index="${activeBlock}"]`)!;
  block.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); if (focus) block.focus({ preventScroll: true }); updatePosition(activeBlock);
}

function updatePositionFromScroll() {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-block-index]')]; if (!blocks.length) return;
  const target = blocks.reduce((closest, block) => Math.abs(block.getBoundingClientRect().top - innerHeight * .3) < Math.abs(closest.getBoundingClientRect().top - innerHeight * .3) ? block : closest);
  updatePosition(Number(target.dataset.blockIndex));
}

function updatePosition(index: number) {
  if (!current || index === activeBlock && current.currentBlock === index && document.querySelector('[data-current="true"]')) return;
  activeBlock = index; current.currentBlock = index; current.updatedAt = Date.now();
  document.querySelector('[data-current="true"]')?.removeAttribute('data-current'); document.querySelector(`[data-block-index="${index}"]`)?.setAttribute('data-current', 'true');
  const page = current.blocks[index]?.page || 1; const position = document.querySelector('#position-text'); if (position) position.textContent = `Page ${page} of ${current.pageCount}`;
  document.querySelectorAll('[data-block]').forEach((item) => item.removeAttribute('aria-current')); document.querySelector(`[data-block="${index}"]`)?.setAttribute('aria-current', 'location'); scheduleSave();
}

function bindSettings() {
  if (!current) return;
  document.querySelectorAll<HTMLElement>('[data-adjust]').forEach((button) => button.addEventListener('click', () => { if (!current) return; current.settings.fontSize = Math.max(18, Math.min(36, current.settings.fontSize + (button.dataset.adjust === 'size-up' ? 2 : -2))); applySettings(); }));
  const bindRange = (id: string, key: 'lineHeight' | 'wordSpacing' | 'measure') => document.querySelector<HTMLInputElement>(id)?.addEventListener('input', (event) => { if (!current) return; current.settings[key] = Number((event.currentTarget as HTMLInputElement).value); applySettings(); });
  bindRange('#line-range', 'lineHeight'); bindRange('#word-range', 'wordSpacing'); bindRange('#measure-range', 'measure');
  document.querySelector<HTMLSelectElement>('#font-select')?.addEventListener('change', (event) => { if (!current) return; current.settings.font = (event.currentTarget as HTMLSelectElement).value as ReaderSettings['font']; applySettings(); });
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((input) => input.addEventListener('change', () => { if (!current) return; current.settings.theme = input.value as ReaderSettings['theme']; applySettings(); }));
}

function applySettings() {
  if (!current) return; const plane = document.querySelector<HTMLElement>('#reading-plane'); const shell = document.querySelector<HTMLElement>('.reader-shell'); if (!plane || !shell) return;
  plane.setAttribute('style', settingsStyle(current.settings)); plane.dataset.font = current.settings.font; shell.dataset.theme = current.settings.theme;
  const values: Record<string, string> = { '#size-output': `${current.settings.fontSize}px`, '#line-output': current.settings.lineHeight.toFixed(2), '#word-output': `${current.settings.wordSpacing.toFixed(2)} em`, '#measure-output': `${current.settings.measure} characters` };
  for (const [selector, value] of Object.entries(values)) { const output = document.querySelector(selector); if (output) output.textContent = value; }
  current.updatedAt = Date.now(); scheduleSave();
}

function scheduleSave() { if (!current) return; window.clearTimeout(saveTimer); saveTimer = window.setTimeout(async () => { if (!current) return; await saveDocument(current); const note = document.querySelector('#saved-note'); note?.classList.add('just-saved'); window.setTimeout(() => note?.classList.remove('just-saved'), 600); }, 250); }
function announce(message: string) { const region = document.querySelector('#live-status'); if (region) region.textContent = message; }
function updateConnection() { const banner = document.querySelector<HTMLElement>('#connection-banner'); if (banner) banner.hidden = navigator.onLine; }

window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
window.addEventListener('keydown', (event) => {
  if (!current || event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || document.querySelector('dialog[open]')) return;
  const key = event.key.toLowerCase();
  if (key === 'j' || key === 'k') { event.preventDefault(); goToBlock(activeBlock + (key === 'j' ? 1 : -1)); }
  if (key === ']' || key === '[') { event.preventDefault(); current.settings.fontSize = Math.max(18, Math.min(36, current.settings.fontSize + (key === ']' ? 2 : -2))); applySettings(); announce(`Text size ${current.settings.fontSize} pixels.`); }
  if (key === 't') { event.preventDefault(); const themes: ReaderSettings['theme'][] = ['cream', 'white', 'dark', 'contrast']; current.settings.theme = themes[(themes.indexOf(current.settings.theme) + 1) % themes.length]; applySettings(); announce(`${current.settings.theme} contrast.`); }
  if (key === 'h') { event.preventDefault(); togglePanel('outline-panel'); }
});

async function boot() {
  try { recent = await getRecentDocuments(); } catch { recent = []; }
  if (demoMode) {
    document.title = 'Demo — PDF Flow Reader';
    await resetDemo();
  } else {
    homeView();
  }
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js');
    if (registration.waiting) document.querySelector<HTMLElement>('#update-toast')!.hidden = false;
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => { if (registration.waiting && navigator.serviceWorker.controller) document.querySelector<HTMLElement>('#update-toast')!.hidden = false; }));
  }
}
boot();
