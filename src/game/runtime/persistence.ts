import { hashState } from '../engine/hash';
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
  if (!save?.snapshot?.state?.header || !save.snapshot.actionLog || !Array.isArray(save.snapshot.events)) throw new Error('INVALID_SAVE');
  if (save.saveVersion !== 1) throw new Error(`INCOMPATIBLE_SAVE_SCHEMA:${save.saveVersion}`);
  if (save.balanceVersion !== balanceVersion || save.contentVersion !== contentVersion) throw new Error(`INCOMPATIBLE_SAVE_CONTENT:${save.balanceVersion}/${save.contentVersion}`);
  if (save.snapshot.state.header.balanceVersion !== balanceVersion || save.snapshot.state.header.contentVersion !== contentVersion || save.checksum !== save.snapshot.checksum || hashState(save.snapshot.state) !== save.checksum) throw new Error('INVALID_SAVE_CHECKSUM');
}

export class IndexedDbPersistence implements PersistenceAdapter {
  constructor(private readonly databaseName = 'one-person-unicorn', private readonly storeName = 'run-saves') {}
  private connection: Promise<IDBDatabase> | undefined;
  private database(): Promise<IDBDatabase> {
    if (this.connection) return this.connection;
    this.connection = new Promise<IDBDatabase>((resolve, reject) => {
      let expired = false;
      const timeout = setTimeout(() => { expired = true; reject(new Error('SAVE_STORAGE_TIMEOUT')); }, 4000);
      const request = indexedDB.open(this.databaseName, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(this.storeName)) request.result.createObjectStore(this.storeName); };
      request.onsuccess = () => { clearTimeout(timeout); if (expired) { request.result.close(); return; } request.result.onversionchange = () => { request.result.close(); this.connection = undefined; }; resolve(request.result); };
      request.onerror = () => { clearTimeout(timeout); reject(request.error); };
      request.onblocked = () => { expired = true; clearTimeout(timeout); reject(new Error('SAVE_STORAGE_BLOCKED')); };
    }).catch((error) => { this.connection = undefined; throw error; });
    return this.connection;
  }
  async load(slot: string): Promise<SaveEnvelope | null> { const db = await this.database(); return await new Promise((resolve, reject) => { const request = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(slot); request.onsuccess = () => resolve((request.result as SaveEnvelope | undefined) ?? null); request.onerror = () => reject(request.error); }); }
  async save(slot: string, value: SaveEnvelope): Promise<void> { const db = await this.database(); await new Promise<void>((resolve, reject) => { const transaction = db.transaction(this.storeName, 'readwrite'); transaction.objectStore(this.storeName).put(value, slot); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error ?? new Error('SAVE_TRANSACTION_ABORTED')); }); }
  async remove(slot: string): Promise<void> { const db = await this.database(); await new Promise<void>((resolve, reject) => { const transaction = db.transaction(this.storeName, 'readwrite'); transaction.objectStore(this.storeName).delete(slot); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error ?? new Error('SAVE_TRANSACTION_ABORTED')); }); }
}

export class MemoryPersistence implements PersistenceAdapter {
  private values = new Map<string, SaveEnvelope>();
  async load(slot: string) { return this.values.get(slot) ?? null; }
  async save(slot: string, value: SaveEnvelope) { this.values.set(slot, JSON.parse(JSON.stringify(value)) as SaveEnvelope); }
  async remove(slot: string) { this.values.delete(slot); }
}
