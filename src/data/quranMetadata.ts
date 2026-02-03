/**
 * Quran Metadata - Complete mapping of Pages, Surahs, and Juz
 * Based on standard Mushaf page numbering (604 pages)
 */

export const TOTAL_QURAN_PAGES = 604;

export interface PageInfo {
  page: number;
  surah: number;
  juz: number;
}

export interface SurahPageRange {
  surah: number;
  name: string;
  startPage: number;
  endPage: number;
  startJuz: number;
  endJuz: number;
}

export interface JuzPageRange {
  juz: number;
  startPage: number;
  endPage: number;
}

// Surah names with page ranges (based on standard Mushaf)
export const surahPageRanges: SurahPageRange[] = [
  { surah: 1, name: 'Al-Fatihah', startPage: 1, endPage: 1, startJuz: 1, endJuz: 1 },
  { surah: 2, name: 'Al-Baqarah', startPage: 2, endPage: 49, startJuz: 1, endJuz: 3 },
  { surah: 3, name: 'Aal-e-Imran', startPage: 50, endPage: 76, startJuz: 3, endJuz: 4 },
  { surah: 4, name: 'An-Nisa', startPage: 77, endPage: 106, startJuz: 4, endJuz: 6 },
  { surah: 5, name: 'Al-Maidah', startPage: 106, endPage: 127, startJuz: 6, endJuz: 7 },
  { surah: 6, name: 'Al-Anam', startPage: 128, endPage: 151, startJuz: 7, endJuz: 8 },
  { surah: 7, name: 'Al-Araf', startPage: 151, endPage: 176, startJuz: 8, endJuz: 9 },
  { surah: 8, name: 'Al-Anfal', startPage: 177, endPage: 186, startJuz: 9, endJuz: 10 },
  { surah: 9, name: 'At-Tawbah', startPage: 187, endPage: 207, startJuz: 10, endJuz: 11 },
  { surah: 10, name: 'Yunus', startPage: 208, endPage: 221, startJuz: 11, endJuz: 11 },
  { surah: 11, name: 'Hud', startPage: 221, endPage: 235, startJuz: 11, endJuz: 12 },
  { surah: 12, name: 'Yusuf', startPage: 235, endPage: 248, startJuz: 12, endJuz: 13 },
  { surah: 13, name: 'Ar-Rad', startPage: 249, endPage: 255, startJuz: 13, endJuz: 13 },
  { surah: 14, name: 'Ibrahim', startPage: 255, endPage: 261, startJuz: 13, endJuz: 13 },
  { surah: 15, name: 'Al-Hijr', startPage: 262, endPage: 267, startJuz: 14, endJuz: 14 },
  { surah: 16, name: 'An-Nahl', startPage: 267, endPage: 281, startJuz: 14, endJuz: 14 },
  { surah: 17, name: 'Al-Isra', startPage: 282, endPage: 293, startJuz: 15, endJuz: 15 },
  { surah: 18, name: 'Al-Kahf', startPage: 293, endPage: 304, startJuz: 15, endJuz: 16 },
  { surah: 19, name: 'Maryam', startPage: 305, endPage: 312, startJuz: 16, endJuz: 16 },
  { surah: 20, name: 'Taha', startPage: 312, endPage: 321, startJuz: 16, endJuz: 16 },
  { surah: 21, name: 'Al-Anbiya', startPage: 322, endPage: 331, startJuz: 17, endJuz: 17 },
  { surah: 22, name: 'Al-Hajj', startPage: 332, endPage: 341, startJuz: 17, endJuz: 17 },
  { surah: 23, name: 'Al-Muminun', startPage: 342, endPage: 349, startJuz: 18, endJuz: 18 },
  { surah: 24, name: 'An-Nur', startPage: 350, endPage: 359, startJuz: 18, endJuz: 18 },
  { surah: 25, name: 'Al-Furqan', startPage: 359, endPage: 366, startJuz: 18, endJuz: 19 },
  { surah: 26, name: 'Ash-Shuara', startPage: 367, endPage: 377, startJuz: 19, endJuz: 19 },
  { surah: 27, name: 'An-Naml', startPage: 377, endPage: 385, startJuz: 19, endJuz: 20 },
  { surah: 28, name: 'Al-Qasas', startPage: 385, endPage: 396, startJuz: 20, endJuz: 20 },
  { surah: 29, name: 'Al-Ankabut', startPage: 396, endPage: 404, startJuz: 20, endJuz: 21 },
  { surah: 30, name: 'Ar-Rum', startPage: 404, endPage: 410, startJuz: 21, endJuz: 21 },
  { surah: 31, name: 'Luqman', startPage: 411, endPage: 414, startJuz: 21, endJuz: 21 },
  { surah: 32, name: 'As-Sajdah', startPage: 415, endPage: 417, startJuz: 21, endJuz: 21 },
  { surah: 33, name: 'Al-Ahzab', startPage: 418, endPage: 427, startJuz: 21, endJuz: 22 },
  { surah: 34, name: 'Saba', startPage: 428, endPage: 433, startJuz: 22, endJuz: 22 },
  { surah: 35, name: 'Fatir', startPage: 434, endPage: 440, startJuz: 22, endJuz: 22 },
  { surah: 36, name: 'Ya-Sin', startPage: 440, endPage: 445, startJuz: 22, endJuz: 23 },
  { surah: 37, name: 'As-Saffat', startPage: 446, endPage: 452, startJuz: 23, endJuz: 23 },
  { surah: 38, name: 'Sad', startPage: 453, endPage: 458, startJuz: 23, endJuz: 23 },
  { surah: 39, name: 'Az-Zumar', startPage: 458, endPage: 467, startJuz: 23, endJuz: 24 },
  { surah: 40, name: 'Ghafir', startPage: 467, endPage: 476, startJuz: 24, endJuz: 24 },
  { surah: 41, name: 'Fussilat', startPage: 477, endPage: 482, startJuz: 24, endJuz: 25 },
  { surah: 42, name: 'Ash-Shuraa', startPage: 483, endPage: 489, startJuz: 25, endJuz: 25 },
  { surah: 43, name: 'Az-Zukhruf', startPage: 489, endPage: 495, startJuz: 25, endJuz: 25 },
  { surah: 44, name: 'Ad-Dukhan', startPage: 496, endPage: 498, startJuz: 25, endJuz: 25 },
  { surah: 45, name: 'Al-Jathiyah', startPage: 499, endPage: 502, startJuz: 25, endJuz: 25 },
  { surah: 46, name: 'Al-Ahqaf', startPage: 502, endPage: 507, startJuz: 26, endJuz: 26 },
  { surah: 47, name: 'Muhammad', startPage: 507, endPage: 511, startJuz: 26, endJuz: 26 },
  { surah: 48, name: 'Al-Fath', startPage: 511, endPage: 515, startJuz: 26, endJuz: 26 },
  { surah: 49, name: 'Al-Hujurat', startPage: 515, endPage: 518, startJuz: 26, endJuz: 26 },
  { surah: 50, name: 'Qaf', startPage: 518, endPage: 520, startJuz: 26, endJuz: 26 },
  { surah: 51, name: 'Adh-Dhariyat', startPage: 520, endPage: 523, startJuz: 26, endJuz: 27 },
  { surah: 52, name: 'At-Tur', startPage: 523, endPage: 525, startJuz: 27, endJuz: 27 },
  { surah: 53, name: 'An-Najm', startPage: 526, endPage: 528, startJuz: 27, endJuz: 27 },
  { surah: 54, name: 'Al-Qamar', startPage: 528, endPage: 531, startJuz: 27, endJuz: 27 },
  { surah: 55, name: 'Ar-Rahman', startPage: 531, endPage: 534, startJuz: 27, endJuz: 27 },
  { surah: 56, name: 'Al-Waqiah', startPage: 534, endPage: 537, startJuz: 27, endJuz: 27 },
  { surah: 57, name: 'Al-Hadid', startPage: 537, endPage: 541, startJuz: 27, endJuz: 27 },
  { surah: 58, name: 'Al-Mujadila', startPage: 542, endPage: 545, startJuz: 28, endJuz: 28 },
  { surah: 59, name: 'Al-Hashr', startPage: 545, endPage: 548, startJuz: 28, endJuz: 28 },
  { surah: 60, name: 'Al-Mumtahanah', startPage: 549, endPage: 551, startJuz: 28, endJuz: 28 },
  { surah: 61, name: 'As-Saff', startPage: 551, endPage: 553, startJuz: 28, endJuz: 28 },
  { surah: 62, name: 'Al-Jumuah', startPage: 553, endPage: 554, startJuz: 28, endJuz: 28 },
  { surah: 63, name: 'Al-Munafiqun', startPage: 554, endPage: 556, startJuz: 28, endJuz: 28 },
  { surah: 64, name: 'At-Taghabun', startPage: 556, endPage: 558, startJuz: 28, endJuz: 28 },
  { surah: 65, name: 'At-Talaq', startPage: 558, endPage: 560, startJuz: 28, endJuz: 28 },
  { surah: 66, name: 'At-Tahrim', startPage: 560, endPage: 562, startJuz: 28, endJuz: 28 },
  { surah: 67, name: 'Al-Mulk', startPage: 562, endPage: 564, startJuz: 29, endJuz: 29 },
  { surah: 68, name: 'Al-Qalam', startPage: 564, endPage: 566, startJuz: 29, endJuz: 29 },
  { surah: 69, name: 'Al-Haqqah', startPage: 566, endPage: 568, startJuz: 29, endJuz: 29 },
  { surah: 70, name: 'Al-Maarij', startPage: 568, endPage: 570, startJuz: 29, endJuz: 29 },
  { surah: 71, name: 'Nuh', startPage: 570, endPage: 571, startJuz: 29, endJuz: 29 },
  { surah: 72, name: 'Al-Jinn', startPage: 572, endPage: 573, startJuz: 29, endJuz: 29 },
  { surah: 73, name: 'Al-Muzzammil', startPage: 574, endPage: 575, startJuz: 29, endJuz: 29 },
  { surah: 74, name: 'Al-Muddaththir', startPage: 575, endPage: 577, startJuz: 29, endJuz: 29 },
  { surah: 75, name: 'Al-Qiyamah', startPage: 577, endPage: 578, startJuz: 29, endJuz: 29 },
  { surah: 76, name: 'Al-Insan', startPage: 578, endPage: 580, startJuz: 29, endJuz: 29 },
  { surah: 77, name: 'Al-Mursalat', startPage: 580, endPage: 581, startJuz: 29, endJuz: 29 },
  { surah: 78, name: 'An-Naba', startPage: 582, endPage: 583, startJuz: 30, endJuz: 30 },
  { surah: 79, name: 'An-Naziat', startPage: 583, endPage: 585, startJuz: 30, endJuz: 30 },
  { surah: 80, name: 'Abasa', startPage: 585, endPage: 586, startJuz: 30, endJuz: 30 },
  { surah: 81, name: 'At-Takwir', startPage: 586, endPage: 587, startJuz: 30, endJuz: 30 },
  { surah: 82, name: 'Al-Infitar', startPage: 587, endPage: 587, startJuz: 30, endJuz: 30 },
  { surah: 83, name: 'Al-Mutaffifin', startPage: 587, endPage: 589, startJuz: 30, endJuz: 30 },
  { surah: 84, name: 'Al-Inshiqaq', startPage: 589, endPage: 590, startJuz: 30, endJuz: 30 },
  { surah: 85, name: 'Al-Buruj', startPage: 590, endPage: 591, startJuz: 30, endJuz: 30 },
  { surah: 86, name: 'At-Tariq', startPage: 591, endPage: 591, startJuz: 30, endJuz: 30 },
  { surah: 87, name: 'Al-Ala', startPage: 591, endPage: 592, startJuz: 30, endJuz: 30 },
  { surah: 88, name: 'Al-Ghashiyah', startPage: 592, endPage: 592, startJuz: 30, endJuz: 30 },
  { surah: 89, name: 'Al-Fajr', startPage: 593, endPage: 594, startJuz: 30, endJuz: 30 },
  { surah: 90, name: 'Al-Balad', startPage: 594, endPage: 595, startJuz: 30, endJuz: 30 },
  { surah: 91, name: 'Ash-Shams', startPage: 595, endPage: 595, startJuz: 30, endJuz: 30 },
  { surah: 92, name: 'Al-Lail', startPage: 595, endPage: 596, startJuz: 30, endJuz: 30 },
  { surah: 93, name: 'Ad-Duhaa', startPage: 596, endPage: 596, startJuz: 30, endJuz: 30 },
  { surah: 94, name: 'Ash-Sharh', startPage: 596, endPage: 596, startJuz: 30, endJuz: 30 },
  { surah: 95, name: 'At-Tin', startPage: 597, endPage: 597, startJuz: 30, endJuz: 30 },
  { surah: 96, name: 'Al-Alaq', startPage: 597, endPage: 597, startJuz: 30, endJuz: 30 },
  { surah: 97, name: 'Al-Qadr', startPage: 598, endPage: 598, startJuz: 30, endJuz: 30 },
  { surah: 98, name: 'Al-Bayyinah', startPage: 598, endPage: 598, startJuz: 30, endJuz: 30 },
  { surah: 99, name: 'Az-Zalzalah', startPage: 599, endPage: 599, startJuz: 30, endJuz: 30 },
  { surah: 100, name: 'Al-Adiyat', startPage: 599, endPage: 599, startJuz: 30, endJuz: 30 },
  { surah: 101, name: 'Al-Qariah', startPage: 600, endPage: 600, startJuz: 30, endJuz: 30 },
  { surah: 102, name: 'At-Takathur', startPage: 600, endPage: 600, startJuz: 30, endJuz: 30 },
  { surah: 103, name: 'Al-Asr', startPage: 600, endPage: 600, startJuz: 30, endJuz: 30 },
  { surah: 104, name: 'Al-Humazah', startPage: 601, endPage: 601, startJuz: 30, endJuz: 30 },
  { surah: 105, name: 'Al-Fil', startPage: 601, endPage: 601, startJuz: 30, endJuz: 30 },
  { surah: 106, name: 'Quraish', startPage: 601, endPage: 601, startJuz: 30, endJuz: 30 },
  { surah: 107, name: 'Al-Maun', startPage: 602, endPage: 602, startJuz: 30, endJuz: 30 },
  { surah: 108, name: 'Al-Kawthar', startPage: 602, endPage: 602, startJuz: 30, endJuz: 30 },
  { surah: 109, name: 'Al-Kafirun', startPage: 602, endPage: 602, startJuz: 30, endJuz: 30 },
  { surah: 110, name: 'An-Nasr', startPage: 603, endPage: 603, startJuz: 30, endJuz: 30 },
  { surah: 111, name: 'Al-Masad', startPage: 603, endPage: 603, startJuz: 30, endJuz: 30 },
  { surah: 112, name: 'Al-Ikhlas', startPage: 604, endPage: 604, startJuz: 30, endJuz: 30 },
  { surah: 113, name: 'Al-Falaq', startPage: 604, endPage: 604, startJuz: 30, endJuz: 30 },
  { surah: 114, name: 'An-Nas', startPage: 604, endPage: 604, startJuz: 30, endJuz: 30 },
];

// Juz page ranges (30 Juz)
export const juzPageRanges: JuzPageRange[] = [
  { juz: 1, startPage: 1, endPage: 21 },
  { juz: 2, startPage: 22, endPage: 41 },
  { juz: 3, startPage: 42, endPage: 61 },
  { juz: 4, startPage: 62, endPage: 81 },
  { juz: 5, startPage: 82, endPage: 101 },
  { juz: 6, startPage: 102, endPage: 121 },
  { juz: 7, startPage: 122, endPage: 141 },
  { juz: 8, startPage: 142, endPage: 161 },
  { juz: 9, startPage: 162, endPage: 181 },
  { juz: 10, startPage: 182, endPage: 201 },
  { juz: 11, startPage: 202, endPage: 221 },
  { juz: 12, startPage: 222, endPage: 241 },
  { juz: 13, startPage: 242, endPage: 261 },
  { juz: 14, startPage: 262, endPage: 281 },
  { juz: 15, startPage: 282, endPage: 301 },
  { juz: 16, startPage: 302, endPage: 321 },
  { juz: 17, startPage: 322, endPage: 341 },
  { juz: 18, startPage: 342, endPage: 361 },
  { juz: 19, startPage: 362, endPage: 381 },
  { juz: 20, startPage: 382, endPage: 401 },
  { juz: 21, startPage: 402, endPage: 421 },
  { juz: 22, startPage: 422, endPage: 441 },
  { juz: 23, startPage: 442, endPage: 461 },
  { juz: 24, startPage: 462, endPage: 481 },
  { juz: 25, startPage: 482, endPage: 501 },
  { juz: 26, startPage: 502, endPage: 521 },
  { juz: 27, startPage: 522, endPage: 541 },
  { juz: 28, startPage: 542, endPage: 561 },
  { juz: 29, startPage: 562, endPage: 581 },
  { juz: 30, startPage: 582, endPage: 604 },
];

/**
 * Get Surah number for a given page
 */
export function getSurahForPage(page: number): number {
  const surahInfo = surahPageRanges.find(
    (s) => page >= s.startPage && page <= s.endPage
  );
  return surahInfo?.surah || 1;
}

/**
 * Get Juz number for a given page
 */
export function getJuzForPage(page: number): number {
  const juzInfo = juzPageRanges.find(
    (j) => page >= j.startPage && page <= j.endPage
  );
  return juzInfo?.juz || 1;
}

/**
 * Get starting page for a given Surah
 */
export function getPageForSurah(surah: number): number {
  const surahInfo = surahPageRanges.find((s) => s.surah === surah);
  return surahInfo?.startPage || 1;
}

/**
 * Get starting page for a given Juz
 */
export function getPageForJuz(juz: number): number {
  const juzInfo = juzPageRanges.find((j) => j.juz === juz);
  return juzInfo?.startPage || 1;
}

/**
 * Get Surah info by number
 */
export function getSurahInfo(surah: number): SurahPageRange | undefined {
  return surahPageRanges.find((s) => s.surah === surah);
}

/**
 * Get Juz info by number
 */
export function getJuzInfo(juz: number): JuzPageRange | undefined {
  return juzPageRanges.find((j) => j.juz === juz);
}

/**
 * Get page info (surah and juz for a page)
 */
export function getPageInfo(page: number): PageInfo {
  return {
    page,
    surah: getSurahForPage(page),
    juz: getJuzForPage(page),
  };
}
