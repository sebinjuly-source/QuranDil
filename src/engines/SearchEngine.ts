/**
 * SearchEngine - Text and Arabic search with fuzzy matching and caching
 */

import { quranApiClient } from './QuranApiClient';
import { surahData } from '../data/surahData';

const SEARCH_CACHE_DB = 'SearchCache';
const SEARCH_CACHE_VERSION = 1;
const SEARCH_RESULTS_STORE = 'searchResults';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface SearchResult {
  surah: number;
  ayah: number;
  page: number;
  juz: number;
  text: string;
  translation?: string;
  highlightIndices: [number, number][];
  surahName: string;
  surahEnglishName: string;
}

interface CacheEntry {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

class SearchEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SEARCH_CACHE_DB, SEARCH_CACHE_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SEARCH_RESULTS_STORE)) {
          db.createObjectStore(SEARCH_RESULTS_STORE, { keyPath: 'query' });
        }
      };
    });
  }

  private async ensureDB(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async getCachedResults(query: string): Promise<SearchResult[] | null> {
    await this.ensureDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SEARCH_RESULTS_STORE], 'readonly');
      const store = transaction.objectStore(SEARCH_RESULTS_STORE);
      const request = store.get(query.toLowerCase());

      request.onsuccess = () => {
        const entry: CacheEntry | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (now - entry.timestamp > CACHE_TTL) {
          resolve(null);
          return;
        }

        resolve(entry.results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async cacheResults(query: string, results: SearchResult[]): Promise<void> {
    await this.ensureDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SEARCH_RESULTS_STORE], 'readwrite');
      const store = transaction.objectStore(SEARCH_RESULTS_STORE);
      const entry: CacheEntry = {
        query: query.toLowerCase(),
        results,
        timestamp: Date.now(),
      };
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private getSurahInfo(surahNum: number) {
    const info = surahData.find(s => s.number === surahNum);
    return {
      name: info?.name || '',
      englishName: info?.englishName || '',
    };
  }

  private removeArabicDiacritics(text: string): string {
    return text.replace(/[\u064B-\u0652\u0670]/g, '');
  }

  private fuzzyMatchArabic(text: string, query: string): boolean {
    const normalizedText = this.removeArabicDiacritics(text).replace(/\s+/g, ' ').trim();
    const normalizedQuery = this.removeArabicDiacritics(query).replace(/\s+/g, ' ').trim();
    
    return normalizedText.includes(normalizedQuery);
  }

  private findArabicHighlightIndices(text: string, query: string): [number, number][] {
    const indices: [number, number][] = [];
    const normalizedText = this.removeArabicDiacritics(text);
    const normalizedQuery = this.removeArabicDiacritics(query);
    
    let startIndex = 0;
    while (true) {
      const index = normalizedText.indexOf(normalizedQuery, startIndex);
      if (index === -1) break;
      
      // Find actual position in original text
      let actualIndex = 0;
      let normalizedIndex = 0;
      while (normalizedIndex < index) {
        if (!/[\u064B-\u0652\u0670]/.test(text[actualIndex])) {
          normalizedIndex++;
        }
        actualIndex++;
      }
      
      let endIndex = actualIndex;
      let matchLength = 0;
      while (matchLength < normalizedQuery.length) {
        if (!/[\u064B-\u0652\u0670]/.test(text[endIndex])) {
          matchLength++;
        }
        endIndex++;
      }
      
      indices.push([actualIndex, endIndex]);
      startIndex = index + 1;
    }

    return indices;
  }

  async searchText(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Check cache
    const cached = await this.getCachedResults(trimmedQuery);
    if (cached) {
      return cached;
    }

    // Detect if query is Arabic or English
    const isArabic = /[\u0600-\u06FF]/.test(trimmedQuery);
    
    if (isArabic) {
      return this.searchArabic(trimmedQuery);
    } else {
      return this.searchTranslation(trimmedQuery);
    }
  }

  /**
   * Search for Arabic text in the Quran with fuzzy matching
   * Note: This performs a sequential search through all 604 pages,
   * which may take 5-10 seconds on first search. Results are cached
   * for subsequent searches. Consider pre-indexing or using Web Workers
   * for production use with large datasets.
   */
  async searchArabic(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Check cache
    const cached = await this.getCachedResults(trimmedQuery);
    if (cached) {
      return cached;
    }

    const results: SearchResult[] = [];

    try {
      // Search through all verses
      for (let page = 1; page <= 604; page++) {
        const verses = await quranApiClient.getPageVerses(page);
        
        for (const verse of verses) {
          if (this.fuzzyMatchArabic(verse.text_uthmani, trimmedQuery)) {
            const [surah, ayah] = verse.verse_key.split(':').map(Number);
            const surahInfo = this.getSurahInfo(surah);
            
            results.push({
              surah,
              ayah,
              page: verse.page_number,
              juz: verse.juz_number,
              text: verse.text_uthmani,
              highlightIndices: this.findArabicHighlightIndices(verse.text_uthmani, trimmedQuery),
              surahName: surahInfo.name,
              surahEnglishName: surahInfo.englishName,
            });
          }
        }
      }

      // Cache results
      await this.cacheResults(trimmedQuery, results);
    } catch (error) {
      console.error('Error searching Arabic text:', error);
      throw error;
    }

    return results;
  }

  /**
   * Search for text in translations
   * Note: This is a placeholder implementation that searches surah names.
   * Full translation search requires additional API endpoints or pre-indexed
   * translation data. Sequential page loading may cause delays.
   */
  async searchTranslation(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Check cache
    const cached = await this.getCachedResults(trimmedQuery);
    if (cached) {
      return cached;
    }

    const results: SearchResult[] = [];

    try {
      // For translation search, we'll need to fetch verses with translations
      // This is a simplified version - in production you'd want to fetch translations more efficiently
      for (let page = 1; page <= 604; page++) {
        const verses = await quranApiClient.getPageVerses(page);
        
        for (const verse of verses) {
          // For now, we'll search in the Arabic text transliteration or word translations
          // In a full implementation, you'd want to fetch actual translations from the API
          const [surah, ayah] = verse.verse_key.split(':').map(Number);
          const surahInfo = this.getSurahInfo(surah);
          
          // Simple English keyword matching in surah/ayah context
          // This is a placeholder - ideally you'd have translation data
          const searchableText = `${surahInfo.englishName} ${verse.text_uthmani}`;
          
          if (searchableText.toLowerCase().includes(trimmedQuery.toLowerCase())) {
            results.push({
              surah,
              ayah,
              page: verse.page_number,
              juz: verse.juz_number,
              text: verse.text_uthmani,
              highlightIndices: [],
              surahName: surahInfo.name,
              surahEnglishName: surahInfo.englishName,
            });
          }
        }
      }

      // Cache results
      await this.cacheResults(trimmedQuery, results);
    } catch (error) {
      console.error('Error searching translation:', error);
      throw error;
    }

    return results;
  }

  async clearCache(): Promise<void> {
    await this.ensureDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SEARCH_RESULTS_STORE], 'readwrite');
      const store = transaction.objectStore(SEARCH_RESULTS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const searchEngine = new SearchEngine();
