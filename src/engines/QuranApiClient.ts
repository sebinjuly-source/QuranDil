/**
 * QuranApiClient - Cached, offline-safe Quran.com API client
 * Provides IndexedDB-backed caching for Quran verses and word-level data
 */

const DB_NAME = 'QuranCache';
const DB_VERSION = 1;
const VERSES_STORE = 'verses';
const PAGES_STORE = 'pages';
const CACHE_TTL = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

export interface QWord {
  id: number;
  position: number;
  text_uthmani: string;
  text_imlaei?: string;
  translation?: string;
  transliteration?: string;
  char_type_name?: string;
  line_number?: number;
  page_number?: number;
  audio_url?: string;
}

export interface QVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  text_uthmani: string;
  text_imlaei?: string;
  page_number: number;
  words?: QWord[];
}

export interface QPage {
  page_number: number;
  verses: QVerse[];
  cached_at: number;
}

interface CacheEntry<T> {
  data: T;
  cached_at: number;
}

/**
 * Quran.com API Client with IndexedDB caching
 */
export class QuranApiClient {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly baseUrl = 'https://api.quran.com/api/v4';

  constructor() {
    this.initPromise = this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(VERSES_STORE)) {
          db.createObjectStore(VERSES_STORE);
        }

        if (!db.objectStoreNames.contains(PAGES_STORE)) {
          db.createObjectStore(PAGES_STORE);
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Get data from cache
   */
  private async getFromCache<T>(store: string, key: string): Promise<T | null> {
    await this.ensureDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is still valid
        const now = Date.now();
        if (now - entry.cached_at > CACHE_TTL) {
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store data in cache
   */
  private async storeInCache<T>(store: string, key: string, data: T): Promise<void> {
    await this.ensureDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const entry: CacheEntry<T> = {
        data,
        cached_at: Date.now(),
      };
      const request = objectStore.put(entry, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fetch from API with error handling
   */
  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      return json;
    } catch (error) {
      throw new Error(`Failed to fetch from Quran API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all verses for a specific page
   * @param pageNum Page number (1-604)
   * @returns Array of verses on the page
   */
  async getPageVerses(pageNum: number): Promise<QVerse[]> {
    if (pageNum < 1 || pageNum > 604) {
      throw new Error(`Invalid page number: ${pageNum}. Must be between 1 and 604.`);
    }

    const cacheKey = `page_${pageNum}`;
    
    // Try cache first
    const cached = await this.getFromCache<QPage>(PAGES_STORE, cacheKey);
    if (cached) {
      return cached.verses;
    }

    // Fetch from API
    const data = await this.fetchFromApi<{ verses: QVerse[] }>(`/verses/by_page/${pageNum}?words=true&word_fields=text_uthmani,line_number,page_number,position`);
    
    const pageData: QPage = {
      page_number: pageNum,
      verses: data.verses,
      cached_at: Date.now(),
    };

    // Store in cache
    await this.storeInCache(PAGES_STORE, cacheKey, pageData);

    return pageData.verses;
  }

  /**
   * Get a specific verse by surah and ayah number
   * @param surah Surah number (1-114)
   * @param ayah Ayah number
   * @returns Verse data
   */
  async getVerse(surah: number, ayah: number): Promise<QVerse> {
    if (surah < 1 || surah > 114) {
      throw new Error(`Invalid surah number: ${surah}. Must be between 1 and 114.`);
    }

    const cacheKey = `verse_${surah}_${ayah}`;
    
    // Try cache first
    const cached = await this.getFromCache<QVerse>(VERSES_STORE, cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.fetchFromApi<{ verse: QVerse }>(`/verses/by_key/${surah}:${ayah}`);
    
    // Store in cache
    await this.storeInCache(VERSES_STORE, cacheKey, data.verse);

    return data.verse;
  }

  /**
   * Get a specific verse with detailed word-level data
   * @param surah Surah number (1-114)
   * @param ayah Ayah number
   * @returns Verse with word-level details
   */
  async getVerseWithWords(surah: number, ayah: number): Promise<QVerse> {
    if (surah < 1 || surah > 114) {
      throw new Error(`Invalid surah number: ${surah}. Must be between 1 and 114.`);
    }

    const cacheKey = `verse_words_${surah}_${ayah}`;
    
    // Try cache first
    const cached = await this.getFromCache<QVerse>(VERSES_STORE, cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API with word details
    const data = await this.fetchFromApi<{ verse: QVerse }>(
      `/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,text_imlaei,translation,transliteration,char_type_name,line_number,page_number,position,audio_url`
    );
    
    // Store in cache
    await this.storeInCache(VERSES_STORE, cacheKey, data.verse);

    return data.verse;
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.ensureDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VERSES_STORE, PAGES_STORE], 'readwrite');
      
      transaction.objectStore(VERSES_STORE).clear();
      transaction.objectStore(PAGES_STORE).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ verses: number; pages: number }> {
    await this.ensureDB();
    if (!this.db) return { verses: 0, pages: 0 };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VERSES_STORE, PAGES_STORE], 'readonly');
      
      const versesCount = transaction.objectStore(VERSES_STORE).count();
      const pagesCount = transaction.objectStore(PAGES_STORE).count();

      let verses = 0;
      let pages = 0;

      versesCount.onsuccess = () => {
        verses = versesCount.result;
      };

      pagesCount.onsuccess = () => {
        pages = pagesCount.result;
      };

      transaction.oncomplete = () => resolve({ verses, pages });
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const quranApiClient = new QuranApiClient();
