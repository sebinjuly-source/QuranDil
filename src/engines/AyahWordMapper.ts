/**
 * AyahWordMapper - Word-level mapping and hit-testing for Mushaf pages
 * Provides Page → Ayah → Line → Word hierarchy with bounding box calculations
 */

import { MushafPage } from './MushafRebuilder';
import { QWord } from './QuranApiClient';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WordPosition extends QWord {
  bounds: BoundingBox;
  verse_key: string;
  line_number: number;
}

export interface AyahPosition {
  verse_key: string;
  verse_number: number;
  words: WordPosition[];
  bounds: BoundingBox; // Combined bounds of all words in ayah
}

export interface LinePosition {
  line_number: number;
  words: WordPosition[];
  ayahs: string[]; // Verse keys that appear on this line
  bounds: BoundingBox;
}

export interface PageMap {
  page_number: number;
  lines: LinePosition[];
  ayahs: Map<string, AyahPosition>;
  words: WordPosition[];
  bounds: BoundingBox; // Overall page bounds
}

/**
 * Word-level mapper for hit-testing and spatial queries
 */
export class AyahWordMapper {
  private pageMap: PageMap | null = null;
  private gridConfig: {
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    lineHeight: number;
    pageWidth: number;
    pageHeight: number;
  };

  /**
   * Create a new AyahWordMapper
   * @param gridConfig Optional grid configuration for layout calculations
   */
  constructor(gridConfig?: {
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    lineHeight?: number;
    pageWidth?: number;
    pageHeight?: number;
  }) {
    this.gridConfig = {
      marginTop: gridConfig?.marginTop ?? 80,
      marginBottom: gridConfig?.marginBottom ?? 80,
      marginLeft: gridConfig?.marginLeft ?? 60,
      marginRight: gridConfig?.marginRight ?? 60,
      lineHeight: gridConfig?.lineHeight ?? 35,
      pageWidth: gridConfig?.pageWidth ?? 420,
      pageHeight: gridConfig?.pageHeight ?? 600,
    };
  }

  /**
   * Build spatial map from Mushaf page data
   * @param mushafPage Rebuilt Mushaf page
   * @returns Page map with spatial data
   */
  buildPageMap(mushafPage: MushafPage): PageMap {
    const lines: LinePosition[] = [];
    const ayahMap = new Map<string, AyahPosition>();
    const allWords: WordPosition[] = [];

    const contentWidth = this.gridConfig.pageWidth - this.gridConfig.marginLeft - this.gridConfig.marginRight;

    // Process each line
    mushafPage.lines.forEach((line, lineIndex) => {
      const lineY = this.gridConfig.marginTop + (lineIndex * this.gridConfig.lineHeight);
      const lineWords: WordPosition[] = [];

      // Calculate word positions within the line
      let currentX = this.gridConfig.marginLeft;
      const averageWordWidth = contentWidth / (line.words.length || 1);

      line.words.forEach((word) => {
        const wordWidth = averageWordWidth * 0.9; // Approximate word width
        
        const wordPosition: WordPosition = {
          ...word,
          verse_key: line.verse_keys[0] ?? '', // Default to first verse key on line
          line_number: line.line_number,
          bounds: {
            x: currentX,
            y: lineY,
            width: wordWidth,
            height: this.gridConfig.lineHeight,
          },
        };

        // Find which verse this word belongs to
        const verse = mushafPage.verses.find(v => 
          v.words && v.words.some(w => w.id === word.id)
        );
        if (verse) {
          wordPosition.verse_key = verse.verse_key;
        }

        lineWords.push(wordPosition);
        allWords.push(wordPosition);

        // Add word to ayah map
        if (!ayahMap.has(wordPosition.verse_key)) {
          ayahMap.set(wordPosition.verse_key, {
            verse_key: wordPosition.verse_key,
            verse_number: parseInt(wordPosition.verse_key.split(':')[1]) || 0,
            words: [],
            bounds: { x: 0, y: 0, width: 0, height: 0 },
          });
        }
        ayahMap.get(wordPosition.verse_key)!.words.push(wordPosition);

        currentX += wordWidth;
      });

      // Calculate line bounds
      const lineBounds: BoundingBox = {
        x: this.gridConfig.marginLeft,
        y: lineY,
        width: contentWidth,
        height: this.gridConfig.lineHeight,
      };

      lines.push({
        line_number: line.line_number,
        words: lineWords,
        ayahs: line.verse_keys,
        bounds: lineBounds,
      });
    });

    // Calculate bounds for each ayah
    ayahMap.forEach(ayah => {
      if (ayah.words.length > 0) {
        const xs = ayah.words.map(w => w.bounds.x);
        const ys = ayah.words.map(w => w.bounds.y);
        const rights = ayah.words.map(w => w.bounds.x + w.bounds.width);
        const bottoms = ayah.words.map(w => w.bounds.y + w.bounds.height);

        ayah.bounds = {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...rights) - Math.min(...xs),
          height: Math.max(...bottoms) - Math.min(...ys),
        };
      }
    });

    const pageMap: PageMap = {
      page_number: mushafPage.page_number,
      lines,
      ayahs: ayahMap,
      words: allWords,
      bounds: {
        x: 0,
        y: 0,
        width: this.gridConfig.pageWidth,
        height: this.gridConfig.pageHeight,
      },
    };

    this.pageMap = pageMap;
    return pageMap;
  }

  /**
   * Find word at specific coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Word at position or null
   */
  getWordAt(x: number, y: number): WordPosition | null {
    if (!this.pageMap) {
      return null;
    }

    return this.pageMap.words.find(word => 
      x >= word.bounds.x &&
      x <= word.bounds.x + word.bounds.width &&
      y >= word.bounds.y &&
      y <= word.bounds.y + word.bounds.height
    ) ?? null;
  }

  /**
   * Get ayah range between two words
   * @param startWord Starting word
   * @param endWord Ending word
   * @returns Array of verse keys in range
   */
  getAyahRange(startWord: WordPosition, endWord: WordPosition): string[] {
    if (!this.pageMap) {
      return [];
    }

    const startIndex = this.pageMap.words.findIndex(w => w.id === startWord.id);
    const endIndex = this.pageMap.words.findIndex(w => w.id === endWord.id);

    if (startIndex === -1 || endIndex === -1) {
      return [];
    }

    const [start, end] = startIndex <= endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];

    const wordsInRange = this.pageMap.words.slice(start, end + 1);
    const verseKeys = new Set(wordsInRange.map(w => w.verse_key));

    return Array.from(verseKeys);
  }

  /**
   * Get all words for a specific ayah
   * @param verseKey Verse key (e.g., "2:255")
   * @returns Array of words in the ayah
   */
  getAyahWords(verseKey: string): WordPosition[] {
    if (!this.pageMap) {
      return [];
    }

    const ayah = this.pageMap.ayahs.get(verseKey);
    return ayah ? ayah.words : [];
  }

  /**
   * Get all words on a specific line
   * @param lineNumber Line number
   * @returns Array of words on the line
   */
  getLineWords(lineNumber: number): WordPosition[] {
    if (!this.pageMap) {
      return [];
    }

    const line = this.pageMap.lines.find(l => l.line_number === lineNumber);
    return line ? line.words : [];
  }

  /**
   * Find all ayahs that intersect with a bounding box
   * @param bounds Bounding box to check
   * @returns Array of verse keys that intersect
   */
  getAyahsInBounds(bounds: BoundingBox): string[] {
    if (!this.pageMap) {
      return [];
    }

    const intersectingAyahs: string[] = [];

    this.pageMap.ayahs.forEach((ayah, verseKey) => {
      if (this.boundsIntersect(bounds, ayah.bounds)) {
        intersectingAyahs.push(verseKey);
      }
    });

    return intersectingAyahs;
  }

  /**
   * Check if two bounding boxes intersect
   */
  private boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Get the current page map
   */
  getPageMap(): PageMap | null {
    return this.pageMap;
  }

  /**
   * Export page map as JSON
   * @returns JSON-serializable page map
   */
  toJSON(): string {
    if (!this.pageMap) {
      return JSON.stringify(null);
    }

    const serializable = {
      page_number: this.pageMap.page_number,
      lines: this.pageMap.lines,
      ayahs: Array.from(this.pageMap.ayahs.entries()).map(([key, value]) => ({ key, value })),
      words: this.pageMap.words,
      bounds: this.pageMap.bounds,
    };

    return JSON.stringify(serializable, null, 2);
  }

  /**
   * Load page map from JSON
   * @param json JSON string
   */
  fromJSON(json: string): void {
    const data = JSON.parse(json);
    
    if (!data) {
      this.pageMap = null;
      return;
    }

    this.pageMap = {
      page_number: data.page_number,
      lines: data.lines,
      ayahs: new Map(data.ayahs.map((item: any) => [item.key, item.value])),
      words: data.words,
      bounds: data.bounds,
    };
  }
}
