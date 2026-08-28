import { mkdir, writeFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const pdf = await PDFDocument.create();
pdf.setTitle('Reading Routine — Sample PDF');
pdf.setAuthor('PDF Flow Reader');
const regular = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

function page(title, paragraphs) {
  const sheet = pdf.addPage([612, 792]);
  sheet.drawText(title, { x: 64, y: 710, size: 22, font: bold, color: rgb(0.09, 0.09, 0.08) });
  let y = 662;
  for (const paragraph of paragraphs) {
    sheet.drawText(paragraph, { x: 64, y, size: 13, font: regular, color: rgb(0.09, 0.09, 0.08), maxWidth: 480, lineHeight: 21 });
    y -= 84;
  }
  sheet.drawText('PDF Flow Reader sample · local demo', { x: 64, y: 44, size: 9, font: regular, color: rgb(0.28, 0.28, 0.25) });
}

page('A QUIET READING ROUTINE', [
  'Mara reads project briefs before the office becomes busy. She chooses one task, raises the text size, and keeps the line length short enough to follow without losing her place.',
  'The useful change is not a different document. It is a steadier way to move through the words that are already there.',
  'This sample has ordinary headings and paragraphs so you can try the document map, text controls, contrast choices, and keyboard reading keys.'
]);
page('RETURNING TO THE SAME PLACE', [
  'After a meeting, Mara returns to the paragraph she was reading. The reader records the last block and the settings she chose in this browser.',
  'Use J and K to move between blocks. Use the square brackets to change text size. Open the headings panel to jump to a section.',
  'Extraction can make mistakes in complex layouts. Compare important details with the original PDF when meaning depends on columns, tables, equations, or footnotes.'
]);

await mkdir('public/samples', { recursive: true });
await writeFile('public/samples/reading-routine.pdf', await pdf.save());
