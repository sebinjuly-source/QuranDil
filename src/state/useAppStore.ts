/**
 * App Store - Zustand state management for UI
 */

import { create } from 'zustand';
import { AppEngine } from './AppEngine';
import { SearchResult } from '../engines/SearchEngine';
import { RepeatMode, AudioPosition } from '../utils/audioUtils';

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
  playbackSpeed: number;
  repeatMode: RepeatMode;
  gapDuration: number;
  playerPosition: AudioPosition;
  playerMinimized: boolean;
  isLoading: boolean;
  currentPage: number | null;
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
  history: number[];
  isDualPage: boolean;
  isFullscreen: boolean;
}

export interface SearchState {
  searchQuery: string;
  searchResults: SearchResult[];
  searchLoading: boolean;
  searchResultsPaneOpen: boolean;
  isListening: boolean;
}

export interface AppState {
  // Navigation
  navigation: NavigationState;
  setCurrentPage: (page: number, addToHistory?: boolean) => void;
  setCurrentSurah: (surah: number) => void;
  setCurrentJuz: (juz: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  goBack: () => void;
  toggleDualPage: () => void;
  toggleFullscreen: () => void;

  // Search
  search: SearchState;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSearchResultsPaneOpen: (open: boolean) => void;
  setIsListening: (listening: boolean) => void;

  // Selection
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  clearSelection: () => void;

  // Audio
  audio: AudioState;
  setAudioPlaying: (playing: boolean) => void;
  setAudioReciter: (reciter: string) => void;
  setAudioAyah: (surah: number | null, ayah: number | null, page?: number | null) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setGapDuration: (gap: number) => void;
  setPlayerPosition: (position: AudioPosition) => void;
  setPlayerMinimized: (minimized: boolean) => void;
  setAudioLoading: (loading: boolean) => void;

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
  leftPanelOpen: boolean;
  setLeftPanelOpen: (open: boolean) => void;
  goToDialogOpen: boolean;
  setGoToDialogOpen: (open: boolean) => void;

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
    history: [],
    isDualPage: false,
    isFullscreen: false,
  },
  // Search state
  search: {
    searchQuery: '',
    searchResults: [],
    searchLoading: false,
    searchResultsPaneOpen: false,
    isListening: false,
  },
  setCurrentPage: (page, addToHistory = true) => set((state) => {
    const newPage = Math.max(1, Math.min(604, page));
    // Only add to history if actually changing pages
    const newHistory = (addToHistory && state.navigation.currentPage !== newPage)
      ? [...state.navigation.history, state.navigation.currentPage].slice(-10)
      : state.navigation.history;
    return {
      navigation: { 
        ...state.navigation, 
        currentPage: newPage,
        history: newHistory
      }
    };
  }),
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
  goBack: () => set((state) => {
    const history = [...state.navigation.history];
    const previousPage = history.pop();
    if (previousPage !== undefined) {
      return {
        navigation: { 
          ...state.navigation, 
          currentPage: previousPage,
          history
        }
      };
    }
    return state;
  }),
  toggleDualPage: () => set((state) => ({
    navigation: { ...state.navigation, isDualPage: !state.navigation.isDualPage }
  })),
  toggleFullscreen: () => set((state) => {
    const newFullscreen = !state.navigation.isFullscreen;
    if (newFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    return {
      navigation: { ...state.navigation, isFullscreen: newFullscreen }
    };
  }),

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
    playbackSpeed: 1,
    repeatMode: 'off',
    gapDuration: 1,
    playerPosition: { x: window.innerWidth - 380 - 20, y: window.innerHeight - 180 - 20 },
    playerMinimized: false,
    isLoading: false,
    currentPage: null,
  },
  setAudioPlaying: (playing) => set((state) => ({
    audio: { ...state.audio, isPlaying: playing }
  })),
  setAudioReciter: (reciter) => set((state) => ({
    audio: { ...state.audio, currentReciter: reciter }
  })),
  setAudioAyah: (surah, ayah, page) => set((state) => ({
    audio: { ...state.audio, currentSurah: surah, currentAyah: ayah, currentPage: page ?? state.audio.currentPage }
  })),
  setVolume: (volume) => set((state) => ({
    audio: { ...state.audio, volume: Math.max(0, Math.min(1, volume)) }
  })),
  setPlaybackSpeed: (speed) => set((state) => ({
    audio: { ...state.audio, playbackSpeed: speed }
  })),
  setRepeatMode: (mode) => set((state) => ({
    audio: { ...state.audio, repeatMode: mode }
  })),
  setGapDuration: (gap) => set((state) => ({
    audio: { ...state.audio, gapDuration: gap }
  })),
  setPlayerPosition: (position) => set((state) => ({
    audio: { ...state.audio, playerPosition: position }
  })),
  setPlayerMinimized: (minimized) => set((state) => ({
    audio: { ...state.audio, playerMinimized: minimized }
  })),
  setAudioLoading: (loading) => set((state) => ({
    audio: { ...state.audio, isLoading: loading }
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
  leftPanelOpen: true,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  goToDialogOpen: false,
  setGoToDialogOpen: (open) => set({ goToDialogOpen: open }),

  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  // Search methods
  setSearchQuery: (query) => set((state) => ({
    search: { ...state.search, searchQuery: query }
  })),
  performSearch: async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      set((state) => ({
        search: { 
          ...state.search, 
          searchQuery: '', 
          searchResults: [], 
          searchResultsPaneOpen: false 
        }
      }));
      return;
    }

    set((state) => ({
      search: { ...state.search, searchLoading: true, searchQuery: trimmedQuery }
    }));

    try {
      const { searchEngine } = await import('../engines/SearchEngine');
      const results = await searchEngine.searchText(trimmedQuery);
      
      set((state) => ({
        search: { 
          ...state.search, 
          searchResults: results,
          searchLoading: false,
          searchResultsPaneOpen: true
        }
      }));
    } catch (error) {
      console.error('Search error:', error);
      set((state) => ({
        search: { 
          ...state.search, 
          searchResults: [],
          searchLoading: false,
          searchResultsPaneOpen: false
        }
      }));
    }
  },
  clearSearch: () => set((state) => ({
    search: {
      ...state.search,
      searchQuery: '',
      searchResults: [],
      searchResultsPaneOpen: false,
    }
  })),
  setSearchResultsPaneOpen: (open) => set((state) => ({
    search: { ...state.search, searchResultsPaneOpen: open }
  })),
  setIsListening: (listening) => set((state) => ({
    search: { ...state.search, isListening: listening }
  })),

  // Engine reference
  engine: AppEngine,
}));
