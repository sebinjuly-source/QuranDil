/**
 * MushafRebuilder - Rebuilds Mushaf pages using verified Quran text
 * Preserves page boundaries and groups words by line number
 */

import { QuranApiClient, QVerse, QWord } from './QuranApiClient';
import { knownMushafs, MushafFingerprint } from '../data/knownMushafs';

export interface MushafLine {
  line_number: number;
  words: QWord[];
  verse_keys: string[]; // List of verse_keys that appear on this line
}

export interface MushafPage {
  page_number: number;
  lines: MushafLine[];
  verses: QVerse[];
  mushaf_type: string;
  lines_per_page: number;
}

/**
 * Mushaf Page Rebuilder
 * Reconstructs Mushaf pages while preserving traditional pagination
 */
export class MushafRebuilder {
  private apiClient: QuranApiClient;
  private mushafFingerprint: MushafFingerprint;

  /**
   * Create a new MushafRebuilder
   * @param apiClient QuranApiClient instance
   * @param mushafType Type of Mushaf (e.g., 'madani-15-tajweed')
   */
  constructor(apiClient: QuranApiClient, mushafType: string = 'madani-15-tajweed') {
    this.apiClient = apiClient;
    
    const mushaf = knownMushafs.find(m => m.id === mushafType);
    if (!mushaf) {
      throw new Error(`Unknown Mushaf type: ${mushafType}`);
    }
    
    this.mushafFingerprint = mushaf;
  }

  /**
   * Rebuild a specific page with proper line grouping
   * @param pageNum Page number (1-604)
   * @param linesPerPage Optional override for lines per page
   * @returns Structured page data with lines and words
   */
  async rebuildPage(pageNum: number, linesPerPage?: number): Promise<MushafPage> {
    if (pageNum < 1 || pageNum > 604) {
      throw new Error(`Invalid page number: ${pageNum}. Must be between 1 and 604.`);
    }

    const effectiveLinesPerPage = linesPerPage ?? this.mushafFingerprint.linesPerPage;

    // Fetch verses for this page from API
    const verses = await this.apiClient.getPageVerses(pageNum);

    if (!verses || verses.length === 0) {
      throw new Error(`No verses found for page ${pageNum}`);
    }

    // Extract all words from all verses
    const allWords: QWord[] = [];
    verses.forEach(verse => {
      if (verse.words) {
        allWords.push(...verse.words);
      }
    });

    // Group words by line number
    const lineMap = new Map<number, QWord[]>();
    const lineVerseKeys = new Map<number, Set<string>>();

    allWords.forEach(word => {
      const lineNum = word.line_number ?? 1;
      
      if (!lineMap.has(lineNum)) {
        lineMap.set(lineNum, []);
        lineVerseKeys.set(lineNum, new Set());
      }
      
      lineMap.get(lineNum)!.push(word);
      
      // Determine which verse this word belongs to
      const verse = verses.find(v => 
        v.words && v.words.some(w => w.id === word.id)
      );
      if (verse) {
        lineVerseKeys.get(lineNum)!.add(verse.verse_key);
      }
    });

    // Sort line numbers and create line objects
    const sortedLineNumbers = Array.from(lineMap.keys()).sort((a, b) => a - b);
    
    const lines: MushafLine[] = sortedLineNumbers.map(lineNum => {
      const words = lineMap.get(lineNum)!;
      // Sort words by position within the line
      words.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      
      return {
        line_number: lineNum,
        words,
        verse_keys: Array.from(lineVerseKeys.get(lineNum) ?? []),
      };
    });

    // Validate line count matches expected
    if (lines.length > effectiveLinesPerPage) {
      console.warn(
        `Page ${pageNum} has ${lines.length} lines but expected ${effectiveLinesPerPage}. ` +
        `This may indicate data inconsistency.`
      );
    }

    return {
      page_number: pageNum,
      lines,
      verses,
      mushaf_type: this.mushafFingerprint.id,
      lines_per_page: effectiveLinesPerPage,
    };
  }

  /**
   * Verify page boundaries against known fingerprints
   * @param pageNum Page number to verify
   * @returns True if page boundaries match the fingerprint
   */
  async verifyPageBoundaries(pageNum: number): Promise<boolean> {
    const samplePage = this.mushafFingerprint.samplePages.find(sp => sp.page === pageNum);
    if (!samplePage) {
      // No fingerprint data for this page, assume valid
      return true;
    }

    try {
      const verses = await this.apiClient.getPageVerses(pageNum);
      
      if (verses.length === 0) {
        return false;
      }

      const firstVerse = verses[0];
      const lastVerse = verses[verses.length - 1];

      // Extract surah and ayah from verse_key (format: "surah:ayah")
      const parseVerseKey = (key: string) => {
        const [surah, ayah] = key.split(':').map(Number);
        return { surah, ayah };
      };

      const firstActual = parseVerseKey(firstVerse.verse_key);
      const lastActual = parseVerseKey(lastVerse.verse_key);

      const firstMatch = 
        firstActual.surah === samplePage.firstAyah.surah &&
        firstActual.ayah === samplePage.firstAyah.ayah;

      const lastMatch = 
        lastActual.surah === samplePage.lastAyah.surah &&
        lastActual.ayah === samplePage.lastAyah.ayah;

      return firstMatch && lastMatch;
    } catch (error) {
      console.error(`Error verifying page ${pageNum}:`, error);
      return false;
    }
  }

  /**
   * Get the current Mushaf fingerprint
   */
  getMushafInfo(): MushafFingerprint {
    return this.mushafFingerprint;
  }

  /**
   * Rebuild multiple pages in batch
   * @param startPage Start page number
   * @param endPage End page number
   * @returns Array of rebuilt pages
   */
  async rebuildPages(startPage: number, endPage: number): Promise<MushafPage[]> {
    if (startPage < 1 || endPage > 604 || startPage > endPage) {
      throw new Error(`Invalid page range: ${startPage}-${endPage}`);
    }

    const pages: MushafPage[] = [];
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const page = await this.rebuildPage(pageNum);
      pages.push(page);
    }

    return pages;
  }

  /**
   * Get line count for a specific page
   * @param pageNum Page number
   * @returns Number of lines on the page
   */
  async getLineCount(pageNum: number): Promise<number> {
    const page = await this.rebuildPage(pageNum);
    return page.lines.length;
  }
}
