/**
 * Word Timestamp Loader - Fetch and parse word-level audio timestamps
 * Uses Quran.com API v4 with word audio data
 */

import { QuranApiClient, QWord } from '../engines/QuranApiClient';
import { WordTimestamp } from '../engines/AudioWordHighlightController';

/**
 * Load word timestamps for a specific ayah
 * @param surah Surah number
 * @param ayah Ayah number
 * @param quranApi QuranApiClient instance
 * @returns Array of word timestamps with positions
 */
export async function loadWordTimestamps(
  surah: number,
  ayah: number,
  quranApi: QuranApiClient
): Promise<WordTimestamp[]> {
  try {
    // Fetch verse with word-level data
    const verse = await quranApi.getVerseWithWords(surah, ayah);
    
    if (!verse.words || verse.words.length === 0) {
      console.warn(`No words found for ${surah}:${ayah}`);
      return [];
    }

    const timestamps: WordTimestamp[] = [];
    let cumulativeTime = 0;
    
    // Process each word
    verse.words.forEach((word: QWord) => {
      // TODO: Replace estimation with actual audio timing data from API (Phase 4.1)
      // Estimate word duration (will be replaced with actual audio duration in production)
      // For now, use a simple heuristic: ~0.3 seconds per word
      const duration = estimateWordDuration(word);
      
      const timestamp: WordTimestamp = {
        wordId: `${verse.verse_key}:${word.position}`,
        startTime: cumulativeTime,
        endTime: cumulativeTime + duration,
        x: 0, // Will be calculated from word mapper
        y: 0,
        width: 0,
        height: 0,
        verseKey: verse.verse_key,
        position: word.position,
      };

      timestamps.push(timestamp);
      cumulativeTime += duration;
    });

    return timestamps;
  } catch (error) {
    console.error(`Failed to load word timestamps for ${surah}:${ayah}:`, error);
    return [];
  }
}

/**
 * Estimate word duration based on text length
 * This is a fallback until we have actual audio timing data
 */
function estimateWordDuration(word: QWord): number {
  // Base duration: 0.3 seconds
  const baseDuration = 0.3;
  
  // Adjust based on text length
  const textLength = word.text_uthmani.length;
  if (textLength <= 2) {
    return baseDuration * 0.7; // Short word
  } else if (textLength <= 4) {
    return baseDuration;
  } else if (textLength <= 6) {
    return baseDuration * 1.2;
  } else {
    return baseDuration * 1.5; // Long word
  }
}

/**
 * Merge word timestamps with spatial positions from AyahWordMapper
 */
export function mergeTimestampsWithPositions(
  timestamps: WordTimestamp[],
  wordPositions: Array<{ wordId: string; x: number; y: number; width: number; height: number }>
): WordTimestamp[] {
  return timestamps.map(timestamp => {
    const position = wordPositions.find(p => p.wordId === timestamp.wordId);
    if (position) {
      return {
        ...timestamp,
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
      };
    }
    return timestamp;
  });
}

/**
 * Get cache key for word timestamps
 */
export function getTimestampCacheKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}
