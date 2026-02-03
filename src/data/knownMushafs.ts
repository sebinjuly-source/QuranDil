/**
 * Known Mushafs - Fingerprint database for common Mushaf types
 */

export interface MushafFingerprint {
  id: string;
  name: string;
  linesPerPage: number;
  totalPages: number;
  hasTajweed: boolean;
  // Sample verses for fingerprint matching (page number, first ayah, last ayah)
  samplePages: Array<{
    page: number;
    firstAyah: { surah: number; ayah: number };
    lastAyah: { surah: number; ayah: number };
  }>;
  gridConfig: {
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    lineHeight: number;
  };
  indicators: {
    hasJuzMarkers: boolean;
    hasSajdahMarkers: boolean;
    hasRubMarkers: boolean;
  };
}

export const knownMushafs: MushafFingerprint[] = [
  {
    id: 'madani-15-tajweed',
    name: 'Madani Mushaf 15-Line (Tajweed)',
    linesPerPage: 15,
    totalPages: 604,
    hasTajweed: true,
    samplePages: [
      { page: 1, firstAyah: { surah: 1, ayah: 1 }, lastAyah: { surah: 2, ayah: 5 } },
      { page: 2, firstAyah: { surah: 2, ayah: 6 }, lastAyah: { surah: 2, ayah: 16 } },
      { page: 50, firstAyah: { surah: 2, ayah: 254 }, lastAyah: { surah: 2, ayah: 260 } },
      { page: 100, firstAyah: { surah: 4, ayah: 148 }, lastAyah: { surah: 4, ayah: 155 } },
      { page: 604, firstAyah: { surah: 114, ayah: 1 }, lastAyah: { surah: 114, ayah: 6 } }
    ],
    gridConfig: {
      marginTop: 80,
      marginBottom: 80,
      marginLeft: 60,
      marginRight: 60,
      lineHeight: 35
    },
    indicators: {
      hasJuzMarkers: true,
      hasSajdahMarkers: true,
      hasRubMarkers: true
    }
  },
  {
    id: 'madani-15',
    name: 'Madani Mushaf 15-Line (King Fahd)',
    linesPerPage: 15,
    totalPages: 604,
    hasTajweed: false,
    samplePages: [
      { page: 1, firstAyah: { surah: 1, ayah: 1 }, lastAyah: { surah: 2, ayah: 5 } },
      { page: 2, firstAyah: { surah: 2, ayah: 6 }, lastAyah: { surah: 2, ayah: 16 } },
      { page: 50, firstAyah: { surah: 2, ayah: 254 }, lastAyah: { surah: 2, ayah: 260 } },
      { page: 100, firstAyah: { surah: 4, ayah: 148 }, lastAyah: { surah: 4, ayah: 155 } },
      { page: 604, firstAyah: { surah: 114, ayah: 1 }, lastAyah: { surah: 114, ayah: 6 } }
    ],
    gridConfig: {
      marginTop: 80,
      marginBottom: 80,
      marginLeft: 60,
      marginRight: 60,
      lineHeight: 35
    },
    indicators: {
      hasJuzMarkers: true,
      hasSajdahMarkers: true,
      hasRubMarkers: true
    }
  },
  {
    id: 'indopak-13',
    name: 'Indo-Pak 13-Line',
    linesPerPage: 13,
    totalPages: 540,
    hasTajweed: false,
    samplePages: [
      { page: 1, firstAyah: { surah: 1, ayah: 1 }, lastAyah: { surah: 2, ayah: 7 } },
      { page: 2, firstAyah: { surah: 2, ayah: 8 }, lastAyah: { surah: 2, ayah: 21 } },
      { page: 50, firstAyah: { surah: 2, ayah: 282 }, lastAyah: { surah: 3, ayah: 5 } },
      { page: 540, firstAyah: { surah: 114, ayah: 1 }, lastAyah: { surah: 114, ayah: 6 } }
    ],
    gridConfig: {
      marginTop: 70,
      marginBottom: 70,
      marginLeft: 50,
      marginRight: 50,
      lineHeight: 40
    },
    indicators: {
      hasJuzMarkers: true,
      hasSajdahMarkers: true,
      hasRubMarkers: false
    }
  },
  {
    id: 'madani-16-warsh',
    name: 'Madani 16-Line (Warsh)',
    linesPerPage: 16,
    totalPages: 559,
    hasTajweed: false,
    samplePages: [
      { page: 1, firstAyah: { surah: 1, ayah: 1 }, lastAyah: { surah: 2, ayah: 6 } },
      { page: 559, firstAyah: { surah: 114, ayah: 1 }, lastAyah: { surah: 114, ayah: 6 } }
    ],
    gridConfig: {
      marginTop: 75,
      marginBottom: 75,
      marginLeft: 55,
      marginRight: 55,
      lineHeight: 33
    },
    indicators: {
      hasJuzMarkers: true,
      hasSajdahMarkers: true,
      hasRubMarkers: true
    }
  }
];

export function matchMushaf(
  detectedLines: number,
  sampleVerses: Array<{ page: number; firstAyah: { surah: number; ayah: number }; lastAyah: { surah: number; ayah: number } }>
): MushafFingerprint | null {
  // First filter by line count
  const candidates = knownMushafs.filter(m => m.linesPerPage === detectedLines);
  
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  
  // If multiple candidates, match by sample verses
  for (const candidate of candidates) {
    let matches = 0;
    for (const sample of sampleVerses) {
      const matchingPage = candidate.samplePages.find(p => p.page === sample.page);
      if (matchingPage &&
          matchingPage.firstAyah.surah === sample.firstAyah.surah &&
          matchingPage.firstAyah.ayah === sample.firstAyah.ayah &&
          matchingPage.lastAyah.surah === sample.lastAyah.surah &&
          matchingPage.lastAyah.ayah === sample.lastAyah.ayah) {
        matches++;
      }
    }
    // If more than 50% of samples match, we found it
    if (matches > sampleVerses.length / 2) {
      return candidate;
    }
  }
  
  // Default to first candidate if no clear match
  return candidates[0];
}
