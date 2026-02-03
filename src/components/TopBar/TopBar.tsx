import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './TopBar.css';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function TopBar() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
  const isFullscreen = useAppStore((state) => state.navigation.isFullscreen);
  const searchQuery = useAppStore((state) => state.search.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const performSearch = useAppStore((state) => state.performSearch);
  const isListening = useAppStore((state) => state.search.isListening);
  const setIsListening = useAppStore((state) => state.setIsListening);
  
  const [localQuery, setLocalQuery] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLocalQuery(transcript);
      setSearchQuery(transcript);
      performSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setIsListening, setSearchQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      performSearch(localQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    // Debounce search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (value.trim()) {
        setSearchQuery(value);
        performSearch(value);
      }
    }, 300);
  };

  const handleVoiceSearch = () => {
    if (!speechSupported) {
      alert('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        // Default to Arabic for Middle East region, English otherwise
        const defaultLang = navigator.language.startsWith('ar') ? 'ar-SA' : 'en-US';
        recognitionRef.current.lang = defaultLang;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Could not start voice search. Please try again.');
      }
    }
  };

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // S key (when not in input)
      if (e.key === 's' || e.key === 'S') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <div className="top-bar-left">
          <div className="logo">
            <span className="logo-icon">❤️📖</span>
            <h1>QuranDil</h1>
          </div>
        </div>

        <div className="top-bar-center">
          <form className="search-container" onSubmit={handleSearch}>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search Quran... (Ctrl+F or S)"
              value={localQuery}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className={`voice-search-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceSearch}
              title={isListening ? 'Stop listening' : 'Voice search'}
              disabled={!speechSupported}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </form>
        </div>

        <div className="top-bar-right">
          <button
            className="top-bar-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (F11)' : 'Fullscreen (F11)'}
          >
            {isFullscreen ? '⬜' : '⛶'}
          </button>
          <button
            className="top-bar-btn"
            title="Settings"
          >
            ⚙️
          </button>
          <button
            className="top-bar-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
