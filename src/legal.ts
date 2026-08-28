import './style.css';

const privacy = location.pathname.startsWith('/privacy');
const root = document.querySelector<HTMLElement>('#legal')!;
root.innerHTML = privacy ? `
  <header class="site-header"><a class="brand" href="/"><img src="/assets/icon.svg" width="36" height="36" alt=""><span>PDF FLOW READER</span></a><nav class="site-nav" aria-label="Primary"><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a></nav></header>
  <main id="main" class="legal-page"><p class="eyebrow">Plain-language policy · 28 August 2026</p><h1>Privacy, kept local.</h1>
  <p>PDF Flow Reader processes PDFs in your browser. Your files, extracted text, reading position, and preferences are not uploaded to us.</p>
  <h2>What stays on your device</h2><p>When you open a PDF, its extracted text, document name, display settings, and last reading block are saved in your browser’s IndexedDB so you can resume. The original PDF is not retained. You can export or erase this data from the reader.</p>
  <h2>Network activity</h2><p>The installed app may contact this site to check for updated app files. We do not use analytics, advertising, third-party scripts, tracking pixels, or cloud OCR.</p>
  <h2>Your controls</h2><p>Use “Manage local data” in the reader to export or clear saved reading data. Clearing site data in your browser also removes it.</p>
  <h2>Contact</h2><p>For privacy questions, contact the site operator through <a href="https://sociobot.in">sociobot.in</a>.</p></main>` : `
  <header class="site-header"><a class="brand" href="/"><img src="/assets/icon.svg" width="36" height="36" alt=""><span>PDF FLOW READER</span></a><nav class="site-nav" aria-label="Primary"><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a></nav></header>
  <main id="main" class="legal-page"><p class="eyebrow">Terms · 28 August 2026</p><h1>A reading aid, not a repair tool.</h1>
  <p>PDF Flow Reader is free software that presents selectable PDF text in an adjustable reading view. By using it, you accept these terms.</p>
  <h2>No compliance claim</h2><p>The app does not repair, certify, or change the source document. Reflow and heading detection are best-effort adaptations and may not preserve the author’s reading order, tables, equations, footnotes, or visual meaning.</p>
  <h2>Your responsibility</h2><p>Use the original PDF when exact layout or authoritative meaning matters. You are responsible for having permission to access documents you open. The reader will not bypass owner restrictions on text copying.</p>
  <h2>No warranty</h2><p>The software is provided “as is”, without warranties. It is not a substitute for professional accessibility remediation or legal advice.</p>
  <h2>License</h2><p>The application source is offered under the MIT License. Generated artwork is original to this product.</p></main>`;

document.body.insertAdjacentHTML('beforeend', '<footer class="site-footer"><a href="/">Reader</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Files stay on this device.</span><span>Built by Param Factory · v1.0.0</span></footer>');
