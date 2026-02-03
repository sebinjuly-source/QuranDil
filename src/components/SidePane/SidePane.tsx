import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../state/useAppStore';
import DeckSelection from '../Flashcards/DeckSelection';
import ReviewSession from '../Flashcards/ReviewSession';
import SessionStats from '../Flashcards/SessionStats';
import MutashabihatCompare from '../Mutashabihat/MutashabihatCompare';
import { SessionStats as SessionStatsType } from '../Flashcards/ReviewSession';
import { Flashcard } from '../../engines/FlashcardStore';
import './SidePane.css';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SidePane: React.FC = () => {
  const sidePaneContent = useAppStore((state) => state.sidePaneContent);
  const setSidePaneOpen = useAppStore((state) => state.setSidePaneOpen);
  const activeFlashcardType = useAppStore((state) => state.flashcards.activeType);
  const isReviewing = useAppStore((state) => state.flashcards.isReviewing);
  const stopReview = useAppStore((state) => state.stopReview);
  const searchQuery = useAppStore((state) => state.search.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const performSearch = useAppStore((state) => state.performSearch);
  const isListening = useAppStore((state) => state.search.isListening);
  const setIsListening = useAppStore((state) => state.setIsListening);
  
  const [reviewCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStatsType | null>(null);
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

  const handleSessionComplete = (stats: SessionStatsType) => {
    setSessionStats(stats);
  };

  const handleContinueStudying = () => {
    setSessionStats(null);
    // This will show the DeckSelection again
  };

  const handleFinish = () => {
    setSessionStats(null);
    stopReview();
  };

  const renderContent = () => {
    // Show session stats after completing a review
    if (sessionStats) {
      return (
        <SessionStats 
          stats={sessionStats} 
          onContinue={handleContinueStudying}
          onFinish={handleFinish}
        />
      );
    }

    // Show review session if actively reviewing
    if (isReviewing && reviewCards.length > 0) {
      return (
        <ReviewSession 
          cards={reviewCards} 
          onComplete={handleSessionComplete}
        />
      );
    }

    switch (sidePaneContent) {
      case 'flashcards':
        // Show deck selection if not reviewing, or flashcard creator
        if (activeFlashcardType && !isReviewing) {
          return (
            <div className="sidepane-section">
              <h2>Create Flashcard</h2>
              {activeFlashcardType && (
                <div className={`flashcard-creator ${activeFlashcardType}`}>
                  <div className="flashcard-type-badge">
                    {activeFlashcardType === 'mistake' && '🔴 Mistake'}
                    {activeFlashcardType === 'mutashabihat' && '🟡 Mutashabihat'}
                    {activeFlashcardType === 'transition' && '🔵 Transition'}
                    {activeFlashcardType === 'custom-transition' && '🟣 Custom Transition'}
                    {activeFlashcardType === 'page-number' && '🟢 Page Number'}
                  </div>
                  
                  <div className="flashcard-preview">
                    <p>Flashcard preview will appear here</p>
                    <p className="help-text">
                      Click and drag on the Mushaf to select text for this flashcard
                    </p>
                  </div>

                  <div className="flashcard-actions">
                    <button className="btn btn-primary">Save Flashcard</button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => useAppStore.getState().setActiveFlashcardType(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flashcard-list">
                <h3>Recent Flashcards</h3>
                <p className="empty-state">No flashcards yet. Create your first one!</p>
              </div>
            </div>
          );
        }
        return <DeckSelection />;
      
      case 'search':
        return (
          <div className="sidepane-section">
            <h2>Search Quran</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search in Arabic or English..."
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
              </div>
            </form>
            <div className="search-results">
              <p className="empty-state">Enter a search query to find verses</p>
            </div>
          </div>
        );
      
      case 'mutashabihat':
        return <MutashabihatCompare />;
      
      default:
        return (
          <div className="sidepane-section">
            <h2>Welcome to QuranDil</h2>
            <p>Select an option from the menu to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="sidepane">
      <div className="sidepane-header">
        <button
          className="close-btn"
          onClick={() => setSidePaneOpen(false)}
          title="Close side pane"
        >
          ✕
        </button>
      </div>
      
      <div className="sidepane-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default SidePane;
