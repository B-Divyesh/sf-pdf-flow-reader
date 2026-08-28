import { describe, expect, test } from 'vitest';
import { isSavedDocument } from '../../src/db';
import { defaultSettings, type SavedDocument } from '../../src/types';

const validDocument = (): SavedDocument => ({
  id: 'document-1',
  name: 'Reading notes',
  pageCount: 1,
  blocks: [{ id: 'block-1', page: 1, text: 'A readable paragraph.', kind: 'paragraph' }],
  confidence: 90,
  confidenceNotes: ['Simple layout'],
  currentBlock: 0,
  settings: { ...defaultSettings },
  createdAt: 1,
  updatedAt: 2
});

describe('saved document validation', () => {
  test('accepts a complete exported document', () => {
    expect(isSavedDocument(validDocument())).toBe(true);
  });

  test.each([
    ['missing name', { ...validDocument(), name: undefined }],
    ['empty blocks', { ...validDocument(), blocks: [] }],
    ['invalid current block', { ...validDocument(), currentBlock: 4 }],
    ['incomplete settings', { ...validDocument(), settings: {} }],
    ['invalid block text', { ...validDocument(), blocks: [{ id: 'block-1', page: 1, kind: 'paragraph' }] }],
    ['retained PDF bytes', { ...validDocument(), originalPdf: '%PDF-private-content' }]
  ])('rejects %s', (_label, candidate) => {
    expect(isSavedDocument(candidate)).toBe(false);
  });
});
