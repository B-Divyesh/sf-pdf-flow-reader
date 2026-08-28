import { describe, expect, it } from 'vitest';
import { fragmentsToLines, linesToBlocks, scoreExtraction } from '../../src/extract';

describe('PDF flow extraction', () => {
  it('sorts fragments into reading lines and preserves spaces', () => {
    const lines = fragmentsToLines([
      { text: 'world.', x: 50, y: 700, width: 38, height: 12 },
      { text: 'Hello', x: 10, y: 700, width: 30, height: 12 },
      { text: 'Next line', x: 10, y: 680, width: 55, height: 12 }
    ]);
    expect(lines.map((line) => line.text)).toEqual(['Hello world.', 'Next line']);
  });

  it('groups wrapped lines and detects large headings', () => {
    const blocks = linesToBlocks([
      { text: 'A USEFUL HEADING', x: 20, y: 740, height: 24 },
      { text: 'This sentence wraps across', x: 20, y: 700, height: 12 },
      { text: 'two lines in the source.', x: 20, y: 686, height: 12 }
    ], 2);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: 'heading', page: 2 });
    expect(blocks[1].text).toBe('This sentence wraps across two lines in the source.');
  });

  it('makes low-text extraction risk explicit', () => {
    const result = scoreExtraction([{ id: 'a', page: 1, kind: 'paragraph', text: 'Tiny' }], 8);
    expect(result.score).toBeLessThan(80);
    expect(result.notes.join(' ')).toContain('little selectable text');
  });
});
