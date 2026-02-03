/**
 * App Store - Zustand state management for UI
 */

import { create } from 'zustand';
import { AppEngine } from './AppEngine';

export type FlashcardType = 'mistake' | 'mutashabihat' | 'transition' | 'custom-transition' | 'page-number';

export interface SelectionState {
  startWord: number | null;
  endWord: number | null;
  surah: number | null;
  ayah: number | null;
  text: string | null;
}

export interface AudioState {
  isPlaying: boolean;
  currentReciter: string;
  currentSurah: number | null;
  currentAyah: number | null;
  volume: number;
}

export interface FlashcardState {
  activeType: FlashcardType | null;
  isReviewing: boolean;
  reviewQueue: string[]; // flashcard IDs
  currentCard: any | null;
}

export interface NavigationState {
  currentPage: number;
  currentSurah: number | null;
  currentJuz: number | null;
  zoom: number;
  panX: number;
  panY: number;
}

export interface AppState {
  // Navigation
  navigation: NavigationState;
  setCurrentPage: (page: number) => void;
  setCurrentSurah: (surah: number) => void;
  setCurrentJuz: (juz: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // Selection
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  clearSelection: () => void;

  // Audio
  audio: AudioState;
  setAudioPlaying: (playing: boolean) => void;
  setAudioReciter: (reciter: string) => void;
  setAudioAyah: (surah: number, ayah: number) => void;
  setVolume: (volume: number) => void;

  // Flashcards
  flashcards: FlashcardState;
  setActiveFlashcardType: (type: FlashcardType | null) => void;
  startReview: () => void;
  stopReview: () => void;
  rateCurrentCard: (rating: number) => void;

  // UI State
  sidePaneOpen: boolean;
  sidePaneContent: 'flashcards' | 'search' | 'mutashabihat' | null;
  setSidePaneOpen: (open: boolean) => void;
  setSidePaneContent: (content: 'flashcards' | 'search' | 'mutashabihat' | null) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Engine reference
  engine: typeof AppEngine;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation state
  navigation: {
    currentPage: 1,
    currentSurah: null,
    currentJuz: null,
    zoom: 1,
    panX: 0,
    panY: 0,
  },
  setCurrentPage: (page) => set((state) => ({
    navigation: { ...state.navigation, currentPage: page }
  })),
  setCurrentSurah: (surah) => set((state) => ({
    navigation: { ...state.navigation, currentSurah: surah }
  })),
  setCurrentJuz: (juz) => set((state) => ({
    navigation: { ...state.navigation, currentJuz: juz }
  })),
  setZoom: (zoom) => set((state) => ({
    navigation: { ...state.navigation, zoom: Math.max(0.5, Math.min(3, zoom)) }
  })),
  setPan: (x, y) => set((state) => ({
    navigation: { ...state.navigation, panX: x, panY: y }
  })),

  // Selection state
  selection: {
    startWord: null,
    endWord: null,
    surah: null,
    ayah: null,
    text: null,
  },
  setSelection: (selection) => set((state) => ({
    selection: { ...state.selection, ...selection }
  })),
  clearSelection: () => set({
    selection: {
      startWord: null,
      endWord: null,
      surah: null,
      ayah: null,
      text: null,
    }
  }),

  // Audio state
  audio: {
    isPlaying: false,
    currentReciter: 'ar.alafasy',
    currentSurah: null,
    currentAyah: null,
    volume: 0.8,
  },
  setAudioPlaying: (playing) => set((state) => ({
    audio: { ...state.audio, isPlaying: playing }
  })),
  setAudioReciter: (reciter) => set((state) => ({
    audio: { ...state.audio, currentReciter: reciter }
  })),
  setAudioAyah: (surah, ayah) => set((state) => ({
    audio: { ...state.audio, currentSurah: surah, currentAyah: ayah }
  })),
  setVolume: (volume) => set((state) => ({
    audio: { ...state.audio, volume: Math.max(0, Math.min(1, volume)) }
  })),

  // Flashcards state
  flashcards: {
    activeType: null,
    isReviewing: false,
    reviewQueue: [],
    currentCard: null,
  },
  setActiveFlashcardType: (type) => set((state) => ({
    flashcards: { ...state.flashcards, activeType: type }
  })),
  startReview: () => set((state) => ({
    flashcards: { ...state.flashcards, isReviewing: true }
  })),
  stopReview: () => set((state) => ({
    flashcards: { ...state.flashcards, isReviewing: false, currentCard: null }
  })),
  rateCurrentCard: (rating) => {
    const { flashcards } = get();
    if (flashcards.currentCard) {
      // Update card with FSRS
      const updatedCard = AppEngine.fsrsEngine.rateCard(flashcards.currentCard, rating);
      // TODO: Save to IndexedDB
      console.log('Card rated:', rating, updatedCard);
    }
  },

  // UI state
  sidePaneOpen: false,
  sidePaneContent: null,
  setSidePaneOpen: (open) => set({ sidePaneOpen: open }),
  setSidePaneContent: (content) => set({ sidePaneContent: content, sidePaneOpen: content !== null }),

  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  // Engine reference
  engine: AppEngine,
}));
