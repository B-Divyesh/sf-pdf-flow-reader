import type { SavedDocument } from './types';

const REAL_DB_NAME = 'pdf-flow-reader';
const DEMO_DB_NAME = 'demo:pdf-flow-reader';
const STORE = 'documents';
const DB_VERSION = 1;
let demoMode = false;

/** Keep the sample reader completely separate from a visitor's saved library. */
export function setDemoStorage(enabled: boolean) {
  demoMode = enabled;
}

export const storageDatabaseName = () => demoMode ? DEMO_DB_NAME : REAL_DB_NAME;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(storageDatabaseName(), DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export const saveDocument = (document: SavedDocument) => transaction('readwrite', (store) => store.put(document));
export const getDocument = (id: string) => transaction<SavedDocument | undefined>('readonly', (store) => store.get(id));
export const deleteDocument = (id: string) => transaction('readwrite', (store) => store.delete(id));
export const clearDocuments = () => transaction('readwrite', (store) => store.clear());

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

/** Validate every field consumed by the reader before untrusted data reaches IndexedDB. */
export function isSavedDocument(value: unknown): value is SavedDocument {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0 || typeof value.name !== 'string' || value.name.trim().length === 0) return false;
  if (!hasOnlyKeys(value, ['id', 'name', 'pageCount', 'blocks', 'confidence', 'confidenceNotes', 'currentBlock', 'settings', 'updatedAt', 'createdAt'])) return false;
  if (!Number.isInteger(value.pageCount) || (value.pageCount as number) < 1 || !Array.isArray(value.blocks) || value.blocks.length === 0) return false;
  if (!Number.isInteger(value.currentBlock) || (value.currentBlock as number) < 0 || (value.currentBlock as number) >= value.blocks.length) return false;
  if (!isFiniteNumber(value.confidence) || value.confidence < 0 || value.confidence > 100 || !Array.isArray(value.confidenceNotes) || !value.confidenceNotes.every((note) => typeof note === 'string')) return false;
  if (!isFiniteNumber(value.createdAt) || !isFiniteNumber(value.updatedAt) || !isRecord(value.settings)) return false;

  const settings = value.settings;
  if (!hasOnlyKeys(settings, ['fontSize', 'lineHeight', 'wordSpacing', 'theme', 'font', 'measure'])) return false;
  if (!isFiniteNumber(settings.fontSize) || settings.fontSize < 18 || settings.fontSize > 36) return false;
  if (!isFiniteNumber(settings.lineHeight) || settings.lineHeight < 1.35 || settings.lineHeight > 2.1) return false;
  if (!isFiniteNumber(settings.wordSpacing) || settings.wordSpacing < 0 || settings.wordSpacing > 0.24) return false;
  if (!isFiniteNumber(settings.measure) || settings.measure < 42 || settings.measure > 78) return false;
  if (!['cream', 'white', 'dark', 'contrast'].includes(String(settings.theme)) || !['serif', 'sans', 'hyper'].includes(String(settings.font))) return false;

  return value.blocks.every((block) => {
    if (!isRecord(block) || typeof block.id !== 'string' || block.id.length === 0 || typeof block.text !== 'string' || block.text.trim().length === 0) return false;
    if (!hasOnlyKeys(block, ['id', 'page', 'text', 'kind', 'level'])) return false;
    if (!Number.isInteger(block.page) || (block.page as number) < 1 || (block.page as number) > (value.pageCount as number)) return false;
    if (block.kind !== 'heading' && block.kind !== 'paragraph') return false;
    return block.level === undefined || (Number.isInteger(block.level) && (block.level as number) >= 1 && (block.level as number) <= 6);
  });
}

export async function getRecentDocuments(): Promise<SavedDocument[]> {
  const items = await transaction<unknown[]>('readonly', (store) => store.getAll());
  const valid = items.filter(isSavedDocument);
  const invalidIds = items
    .filter((item): item is Record<string, unknown> => !isSavedDocument(item) && isRecord(item) && typeof item.id === 'string')
    .map((item) => item.id as string);
  await Promise.all(invalidIds.map((id) => deleteDocument(id)));
  return valid.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function exportLibrary(): Promise<string> {
  const documents = await getRecentDocuments();
  return JSON.stringify({ product: 'pdf-flow-reader', version: 1, exportedAt: new Date().toISOString(), documents }, null, 2);
}

export async function importLibrary(raw: string): Promise<number> {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('product' in data) || data.product !== 'pdf-flow-reader' || !('version' in data) || data.version !== 1 || !('documents' in data) || !Array.isArray(data.documents)) {
    throw new Error('This is not a PDF Flow Reader export.');
  }
  if (!data.documents.every(isSavedDocument)) {
    throw new Error('This export contains an invalid saved document. Nothing was imported.');
  }
  for (const document of data.documents) await saveDocument(document);
  return data.documents.length;
}
