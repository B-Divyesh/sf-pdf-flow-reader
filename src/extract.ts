import type { FlowBlock } from './types';

export interface TextFragment {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEol?: boolean;
}

interface Line {
  text: string;
  y: number;
  height: number;
  x: number;
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export function fragmentsToLines(fragments: TextFragment[]): Line[] {
  const rows: TextFragment[][] = [];
  for (const fragment of fragments.filter((item) => normalize(item.text))) {
    const row = rows.find((items) => Math.abs(items[0].y - fragment.y) <= Math.max(2, fragment.height * 0.35));
    if (row) row.push(fragment); else rows.push([fragment]);
  }
  return rows
    .sort((a, b) => b[0].y - a[0].y)
    .map((row) => {
      row.sort((a, b) => a.x - b.x);
      let text = '';
      let edge = row[0].x;
      for (const item of row) {
        const averageCharacter = item.width / Math.max(item.text.length, 1);
        if (text && item.x - edge > averageCharacter * 0.35 && !text.endsWith(' ')) text += ' ';
        text += item.text;
        edge = item.x + item.width;
      }
      return { text: normalize(text), y: row[0].y, height: Math.max(...row.map((item) => item.height)), x: Math.min(...row.map((item) => item.x)) };
    });
}

function isHeading(line: Line, median: number): boolean {
  const titleCase = /^[A-Z\d][^.!?]{1,90}$/.test(line.text) && !/[,:;]$/.test(line.text);
  const numbered = /^(chapter|section|part|appendix|\d+(\.\d+)*\s+)\b/i.test(line.text);
  return line.height >= median * 1.28 || (titleCase && numbered);
}

export function linesToBlocks(lines: Line[], page: number): FlowBlock[] {
  if (!lines.length) return [];
  const heights = lines.map((line) => line.height).sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)] || 12;
  const blocks: FlowBlock[] = [];
  let paragraph: string[] = [];
  let previous: Line | undefined;
  const flush = () => {
    const text = normalize(paragraph.join(' ').replace(/([a-z])\-\s+([a-z])/g, '$1$2'));
    if (text) blocks.push({ id: `p${page}-b${blocks.length}`, page, text, kind: 'paragraph' });
    paragraph = [];
  };
  for (const line of lines) {
    const heading = isHeading(line, median);
    const gap = previous ? previous.y - line.y : 0;
    const newParagraph = previous && (gap > median * 1.75 || Math.abs(line.x - previous.x) > median * 1.3) && /[.!?\”\"]$/.test(previous.text);
    if (heading) {
      flush();
      blocks.push({ id: `p${page}-b${blocks.length}`, page, text: line.text, kind: 'heading', level: line.height >= median * 1.75 ? 2 : 3 });
    } else {
      if (newParagraph) flush();
      paragraph.push(line.text);
    }
    previous = line;
  }
  flush();
  return blocks;
}

export function scoreExtraction(blocks: FlowBlock[], pageCount: number): { score: number; notes: string[] } {
  const text = blocks.map((block) => block.text).join(' ');
  const notes: string[] = [];
  let score = 100;
  if (text.length < pageCount * 120) { score -= 40; notes.push('Very little selectable text was found for the page count.'); }
  const replacementCount = (text.match(/�/g) || []).length;
  if (replacementCount > Math.max(2, text.length * 0.003)) { score -= 30; notes.push('Some characters could not be decoded reliably.'); }
  const tinyBlocks = blocks.filter((block) => block.text.length < 4).length;
  if (tinyBlocks > blocks.length * 0.25) { score -= 20; notes.push('The source produced many short fragments; reading order may be uneven.'); }
  if (!blocks.some((block) => block.kind === 'heading')) { score -= 10; notes.push('No reliable heading structure was detected.'); }
  if (!notes.length) notes.push('Text volume, character decoding, and paragraph grouping look consistent.');
  return { score: Math.max(0, score), notes };
}
