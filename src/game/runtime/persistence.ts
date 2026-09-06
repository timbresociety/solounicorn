import type { RuntimeSnapshot } from './game-runtime';

export type SaveEnvelope = {
  saveVersion: 1;
  savedAtMetadata: string;
  balanceVersion: string;
  contentVersion: string;
  checksum: string;
  snapshot: RuntimeSnapshot;
};

export interface PersistenceAdapter {
  load(slot: string): Promise<SaveEnvelope | null>;
  save(slot: string, value: SaveEnvelope): Promise<void>;
  remove(slot: string): Promise<void>;
}

export function createSaveEnvelope(snapshot: RuntimeSnapshot): SaveEnvelope {
  return { saveVersion: 1, savedAtMetadata: new Date().toISOString(), balanceVersion: snapshot.state.header.balanceVersion, contentVersion: snapshot.state.header.contentVersion, checksum: snapshot.checksum, snapshot };
}

export function assertCompatibleSave(save: SaveEnvelope, balanceVersion: string, contentVersion: string): void {
  if (save.saveVersion !== 1) throw new Error(`INCOMPATIBLE_SAVE_SCHEMA:${save.saveVersion}`);
  if (save.balanceVersion !== balanceVersion || save.contentVersion !== contentVersion) throw new Error(`INCOMPATIBLE_SAVE_CONTENT:${save.balanceVersion}/${save.contentVersion}`);
}

export class IndexedDbPersistence implements PersistenceAdapter {
  constructor(private readonly databaseName = 'one-person-unicorn', private readonly storeName = 'run-saves') {}
  private async database(): Promise<IDBDatabase> {
    return await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(this.storeName)) request.result.createObjectStore(this.storeName); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async load(slot: string): Promise<SaveEnvelope | null> { const db = await this.database(); return await new Promise((resolve, reject) => { const request = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(slot); request.onsuccess = () => resolve((request.result as SaveEnvelope | undefined) ?? null); request.onerror = () => reject(request.error); }); }
  async save(slot: string, value: SaveEnvelope): Promise<void> { const db = await this.database(); await new Promise<void>((resolve, reject) => { const transaction = db.transaction(this.storeName, 'readwrite'); transaction.objectStore(this.storeName).put(value, slot); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); }
  async remove(slot: string): Promise<void> { const db = await this.database(); await new Promise<void>((resolve, reject) => { const transaction = db.transaction(this.storeName, 'readwrite'); transaction.objectStore(this.storeName).delete(slot); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); }
}

export class MemoryPersistence implements PersistenceAdapter {
  private values = new Map<string, SaveEnvelope>();
  async load(slot: string) { return this.values.get(slot) ?? null; }
  async save(slot: string, value: SaveEnvelope) { this.values.set(slot, JSON.parse(JSON.stringify(value)) as SaveEnvelope); }
  async remove(slot: string) { this.values.delete(slot); }
}
