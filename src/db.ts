import type { SavedDocument } from './types';

const DB_NAME = 'pdf-flow-reader';
const STORE = 'documents';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

export async function getRecentDocuments(): Promise<SavedDocument[]> {
  const items = await transaction<SavedDocument[]>('readonly', (store) => store.getAll());
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function exportLibrary(): Promise<string> {
  const documents = await getRecentDocuments();
  return JSON.stringify({ product: 'pdf-flow-reader', version: 1, exportedAt: new Date().toISOString(), documents }, null, 2);
}

export async function importLibrary(raw: string): Promise<number> {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('product' in data) || data.product !== 'pdf-flow-reader' || !('documents' in data) || !Array.isArray(data.documents)) {
    throw new Error('This is not a PDF Flow Reader export.');
  }
  let count = 0;
  for (const candidate of data.documents) {
    if (candidate && typeof candidate.id === 'string' && Array.isArray(candidate.blocks) && candidate.settings) {
      await saveDocument(candidate as SavedDocument);
      count += 1;
    }
  }
  return count;
}
