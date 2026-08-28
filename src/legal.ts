import './style.css';
import { bindChrome, focusRouteHeading, sharedDialogs, sharedRegions, siteFooter, siteHeader } from './chrome';

const privacy = location.pathname.startsWith('/privacy');
const root = document.querySelector<HTMLElement>('#legal')!;
const content = privacy ? `
  <main id="main" class="legal-page"><p class="eyebrow">Plain-language policy · 28 August 2026</p><h1>Privacy, kept local.</h1>
  <p>PDF Flow Reader processes PDFs in your browser. Your files, extracted text, reading place, and preferences are not uploaded to us.</p>
  <h2>What stays on your device</h2><p>Extracted text, the document name, display settings, and your reading place are saved in this browser. The original PDF is not retained.</p><p>Use Manage local data above to export, import, or erase this information.</p>
  <h2>Network activity</h2><p>The installed app may contact this site to check for updated app files. We do not use analytics, advertising, third-party scripts, tracking pixels, or cloud OCR.</p>
  <h2>Your controls</h2><p>Use Manage local data to export or erase saved reading data. Clearing site data in your browser also removes it.</p>
  <h2>Contact</h2><p>For privacy questions, contact the site operator through <a href="https://sociobot.in">sociobot.in (external site)</a>.</p></main>` : `
  <main id="main" class="legal-page"><p class="eyebrow">Terms · 28 August 2026</p><h1>A reading aid, not a repair tool.</h1>
  <p>PDF Flow Reader presents selectable PDF text in an adjustable reading view. By using it, you accept these terms.</p>
  <h2>No compliance claim</h2><p>The app does not repair, certify, or change the source PDF. Check the original for reading order, tables, equations, footnotes, and visual meaning.</p>
  <h2>Your responsibility</h2><p>Use the original PDF when exact layout or authoritative meaning matters. You must have permission to access each PDF you open.</p><p>The reader will not bypass owner restrictions on text copying.</p>
  <h2>No warranty</h2><p>The software is provided “as is”, without warranties. It is not a substitute for professional accessibility remediation or legal advice.</p>
  <h2>License</h2><p>The application source is offered under the MIT License. Generated artwork is original to this product.</p></main>`;

root.innerHTML = `${siteHeader()}${content}${siteFooter()}${sharedRegions()}${sharedDialogs()}`;
bindChrome();
focusRouteHeading();
