/**
 * Audio utility functions for QuranDil Audio Player
 */

export interface Reciter {
  id: string;
  name: string;
  style?: string;
}

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', style: 'Hafs' },
  { id: 'ar.abdurrahmanalsudais', name: 'Abdurrahman As-Sudais', style: 'Hafs' },
  { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad', style: 'Murattal' },
  { id: 'ar.saadalghamadi', name: 'Saad Al-Ghamdi', style: 'Hafs' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', style: 'Hafs' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', style: 'Murattal' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri', style: 'Hafs' },
];

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const GAP_DURATIONS = [0, 1, 2, 3, 5];

export type RepeatMode = 'off' | 'verse' | 'page' | 'range';

export interface AudioPosition {
  x: number;
  y: number;
}

/**
 * Get audio URL for a specific verse
 */
export function getVerseAudioUrl(reciter: string, surah: number, ayah: number): string {
  const paddedSurah = surah.toString().padStart(3, '0');
  const paddedAyah = ayah.toString().padStart(3, '0');
  return `https://verses.quran.com/${reciter}/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * Get audio URL for entire surah
 */
export function getSurahAudioUrl(reciter: string, surah: number): string {
  const paddedSurah = surah.toString().padStart(3, '0');
  return `https://download.quranicaudio.com/qdc/${reciter}/${paddedSurah}.mp3`;
}

/**
 * Format time in MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Save audio player position to localStorage
 */
export function savePlayerPosition(position: AudioPosition): void {
  try {
    localStorage.setItem('audioPlayerPosition', JSON.stringify(position));
  } catch (e) {
    console.warn('Failed to save player position:', e);
  }
}

/**
 * Load audio player position from localStorage
 */
export function loadPlayerPosition(): AudioPosition | null {
  try {
    const saved = localStorage.getItem('audioPlayerPosition');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load player position:', e);
  }
  return null;
}

/**
 * Save minimized state
 */
export function saveMinimizedState(minimized: boolean): void {
  try {
    localStorage.setItem('audioPlayerMinimized', minimized.toString());
  } catch (e) {
    console.warn('Failed to save minimized state:', e);
  }
}

/**
 * Load minimized state
 */
export function loadMinimizedState(): boolean {
  try {
    const saved = localStorage.getItem('audioPlayerMinimized');
    return saved === 'true';
  } catch (e) {
    console.warn('Failed to load minimized state:', e);
  }
  return false;
}

/**
 * Save playback speed preference
 */
export function savePlaybackSpeed(speed: number): void {
  try {
    localStorage.setItem('audioPlayerSpeed', speed.toString());
  } catch (e) {
    console.warn('Failed to save playback speed:', e);
  }
}

/**
 * Load playback speed preference
 */
export function loadPlaybackSpeed(): number {
  try {
    const saved = localStorage.getItem('audioPlayerSpeed');
    if (saved) {
      const speed = parseFloat(saved);
      if (PLAYBACK_SPEEDS.includes(speed)) {
        return speed;
      }
    }
  } catch (e) {
    console.warn('Failed to load playback speed:', e);
  }
  return 1;
}

/**
 * Save gap duration preference
 */
export function saveGapDuration(gap: number): void {
  try {
    localStorage.setItem('audioPlayerGap', gap.toString());
  } catch (e) {
    console.warn('Failed to save gap duration:', e);
  }
}

/**
 * Load gap duration preference
 */
export function loadGapDuration(): number {
  try {
    const saved = localStorage.getItem('audioPlayerGap');
    if (saved) {
      const gap = parseInt(saved, 10);
      if (GAP_DURATIONS.includes(gap)) {
        return gap;
      }
    }
  } catch (e) {
    console.warn('Failed to load gap duration:', e);
  }
  return 1;
}

/**
 * Constrain position to viewport bounds
 */
export function constrainToViewport(position: AudioPosition, playerWidth: number, playerHeight: number): AudioPosition {
  const maxX = window.innerWidth - playerWidth - 20;
  const maxY = window.innerHeight - playerHeight - 20;
  
  return {
    x: Math.max(20, Math.min(position.x, maxX)),
    y: Math.max(20, Math.min(position.y, maxY)),
  };
}

/**
 * Get default player position (bottom-right corner)
 */
export function getDefaultPosition(playerWidth: number, playerHeight: number): AudioPosition {
  return {
    x: window.innerWidth - playerWidth - 20,
    y: window.innerHeight - playerHeight - 20,
  };
}

/**
 * Get surah name by number (1-114)
 */
export function getSurahName(surahNumber: number): string {
  const surahNames = [
    'Al-Fatihah', 'Al-Baqarah', 'Ali \'Imran', 'An-Nisa', 'Al-Ma\'idah',
    'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
    'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
    'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
    'Al-Anbya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
    'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-\'Ankabut', 'Ar-Rum',
    'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
    'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
    'Fussilat', 'Ash-Shuraa', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
    'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
    'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
    'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
    'As-Saf', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
    'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
    'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
    'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
    'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
    'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
    'Ash-Shams', 'Al-Layl', 'Ad-Duhaa', 'Ash-Sharh', 'At-Tin',
    'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat',
    'Al-Qari\'ah', 'At-Takathur', 'Al-\'Asr', 'Al-Humazah', 'Al-Fil',
    'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
    'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
  ];
  
  if (surahNumber < 1 || surahNumber > 114) {
    return `Surah ${surahNumber}`;
  }
  
  return surahNames[surahNumber - 1];
}
