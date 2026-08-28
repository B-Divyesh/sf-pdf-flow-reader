import { fragmentsToLines, linesToBlocks, scoreExtraction, type TextFragment } from './extract';
import type { FlowBlock } from './types';

export class ReaderError extends Error {
  constructor(public code: 'PASSWORD' | 'PERMISSION' | 'EMPTY' | 'INVALID' | 'CANCELLED', message: string) { super(message); }
}

export interface ExtractionResult {
  id: string;
  pageCount: number;
  blocks: FlowBlock[];
  confidence: number;
  confidenceNotes: string[];
}

let activeTask: { destroy: () => Promise<void> } | undefined;
export async function cancelExtraction() {
  await activeTask?.destroy();
  activeTask = undefined;
}

export async function extractPdf(file: File, password: string | undefined, onProgress: (page: number, total: number) => void): Promise<ExtractionResult> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const digestPromise = crypto.subtle.digest('SHA-256', bytes.slice(0, Math.min(bytes.length, 1_000_000)));
  const loadingTask = pdfjs.getDocument({ data: bytes, password, isEvalSupported: false });
  activeTask = loadingTask;
  let pdf;
  try {
    pdf = await loadingTask.promise;
  } catch (error) {
    activeTask = undefined;
    const candidate = error as { name?: string; code?: number; message?: string };
    if (candidate.name === 'PasswordException') throw new ReaderError('PASSWORD', candidate.code === 1 ? 'This PDF needs a password.' : 'That password did not open the PDF.');
    if (candidate.name === 'InvalidPDFException') throw new ReaderError('INVALID', 'This file is not a valid or supported PDF.');
    if (candidate.name === 'AbortException') throw new ReaderError('CANCELLED', 'Extraction was cancelled.');
    throw error;
  }
  const permissions = await pdf.getPermissions();
  if (permissions && !permissions.includes(pdfjs.PermissionFlag.COPY)) {
    await pdf.destroy();
    activeTask = undefined;
    throw new ReaderError('PERMISSION', 'The PDF owner has disabled text copying. Flow Reader will not bypass that restriction.');
  }
  const blocks: FlowBlock[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      onProgress(pageNumber, pdf.numPages);
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent({ includeMarkedContent: false });
      const fragments: TextFragment[] = content.items.flatMap((item) => {
        if (!('str' in item)) return [];
        return [{ text: item.str, x: item.transform[4], y: item.transform[5], width: item.width, height: Math.abs(item.height || item.transform[3]), hasEol: item.hasEOL }];
      });
      blocks.push(...linesToBlocks(fragmentsToLines(fragments), pageNumber));
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
    activeTask = undefined;
  }
  if (!blocks.length) throw new ReaderError('EMPTY', 'No selectable text was found. This may be a scanned PDF; cloud OCR is intentionally not used.');
  const result = scoreExtraction(blocks, pdf.numPages);
  const digest = await digestPromise;
  const id = Array.from(new Uint8Array(digest).slice(0, 12)).map((part) => part.toString(16).padStart(2, '0')).join('');
  return { id, pageCount: pdf.numPages, blocks, confidence: result.score, confidenceNotes: result.notes };
}
