/**
 * FlashcardStore - IndexedDB operations for flashcards
 */

import { FSRSCard } from './FSRSEngine';

export type FlashcardType = 'mistake' | 'mutashabihat' | 'transition' | 'custom-transition' | 'page-number';

export interface Flashcard {
  id: string;
  type: FlashcardType;
  surah: number;
  ayah: number;
  page: number;
  front: string;
  back: string;
  fsrsState: FSRSCard;
  createdAt: Date;
  lastReviewed: Date | null;
  metadata?: {
    color?: string;
    notes?: string;
    tags?: string[];
  };
}

const DB_NAME = 'QuranDilDB';
const DB_VERSION = 1;
const FLASHCARD_STORE = 'flashcards';

class FlashcardStore {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(FLASHCARD_STORE)) {
          const store = db.createObjectStore(FLASHCARD_STORE, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('surah', 'surah', { unique: false });
          store.createIndex('page', 'page', { unique: false });
          store.createIndex('due', 'fsrsState.due', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async create(flashcard: Flashcard): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readwrite');
      const store = tx.objectStore(FLASHCARD_STORE);
      const request = store.add(flashcard);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async read(id: string): Promise<Flashcard | null> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readonly');
      const store = tx.objectStore(FLASHCARD_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async update(flashcard: Flashcard): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readwrite');
      const store = tx.objectStore(FLASHCARD_STORE);
      const request = store.put(flashcard);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readwrite');
      const store = tx.objectStore(FLASHCARD_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<Flashcard[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readonly');
      const store = tx.objectStore(FLASHCARD_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByType(type: FlashcardType): Promise<Flashcard[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readonly');
      const store = tx.objectStore(FLASHCARD_STORE);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBySurah(surah: number): Promise<Flashcard[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readonly');
      const store = tx.objectStore(FLASHCARD_STORE);
      const index = store.index('surah');
      const request = index.getAll(surah);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByPage(page: number): Promise<Flashcard[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FLASHCARD_STORE, 'readonly');
      const store = tx.objectStore(FLASHCARD_STORE);
      const index = store.index('page');
      const request = index.getAll(page);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getDueCards(date: Date = new Date()): Promise<Flashcard[]> {
    const all = await this.getAll();
    return all.filter(card => new Date(card.fsrsState.due) <= date);
  }

  async getDueCardsByType(type: FlashcardType, date: Date = new Date()): Promise<Flashcard[]> {
    const cards = await this.getByType(type);
    return cards.filter(card => new Date(card.fsrsState.due) <= date);
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<FlashcardType, number>;
    dueToday: number;
  }> {
    const all = await this.getAll();
    const now = new Date();
    
    const byType: Record<FlashcardType, number> = {
      'mistake': 0,
      'mutashabihat': 0,
      'transition': 0,
      'custom-transition': 0,
      'page-number': 0,
    };

    all.forEach(card => {
      byType[card.type] = (byType[card.type] || 0) + 1;
    });

    const dueToday = all.filter(card => new Date(card.fsrsState.due) <= now).length;

    return {
      total: all.length,
      byType,
      dueToday,
    };
  }
}

export const flashcardStore = new FlashcardStore();
