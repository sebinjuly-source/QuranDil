import { useState, useEffect } from 'react';
import { flashcardStore, FlashcardType } from '../../engines/FlashcardStore';
import { useAppStore } from '../../state/useAppStore';
import './DeckSelection.css';

interface DeckInfo {
  type: FlashcardType;
  label: string;
  icon: string;
  color: string;
  dueCount: number;
}

const DeckSelection: React.FC = () => {
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSurah, setFilterSurah] = useState<number | null>(null);
  const [filterJuz, setFilterJuz] = useState<number | null>(null);
  const startReview = useAppStore((state) => state.startReview);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);

  useEffect(() => {
    loadDecks();
  }, [filterSurah, filterJuz]);

  const loadDecks = async () => {
    setLoading(true);
    try {
      await flashcardStore.init();
      const now = new Date();
      
      const types: Array<{ type: FlashcardType; label: string; icon: string; color: string }> = [
        { type: 'mistake', label: 'Mistakes', icon: '🔴', color: '#ef4444' },
        { type: 'mutashabihat', label: 'Mutashabihat', icon: '🟡', color: '#eab308' },
        { type: 'transition', label: 'Transitions', icon: '🔵', color: '#3b82f6' },
        { type: 'custom-transition', label: 'Custom Trans.', icon: '🟣', color: '#a855f7' },
        { type: 'page-number', label: 'Page Numbers', icon: '⚪', color: '#6b7280' },
      ];

      const deckInfos: DeckInfo[] = await Promise.all(
        types.map(async ({ type, label, icon, color }) => {
          let cards = await flashcardStore.getByType(type);
          
          // Apply filters
          if (filterSurah !== null) {
            cards = cards.filter(c => c.surah === filterSurah);
          }
          if (filterJuz !== null) {
            // TODO: Add juz filtering when juz data is available
          }
          
          const dueCards = cards.filter(card => new Date(card.fsrsState.due) <= now);
          
          return {
            type,
            label,
            icon,
            color,
            dueCount: dueCards.length,
          };
        })
      );

      setDecks(deckInfos);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (type: FlashcardType) => {
    console.log('Starting review for type:', type);
    // TODO: Load review queue for this type
    startReview();
    setSidePaneContent('flashcards');
  };

  const handleStudyAll = () => {
    // TODO: Load all due cards
    startReview();
    setSidePaneContent('flashcards');
  };

  const totalDue = decks.reduce((sum, deck) => sum + deck.dueCount, 0);

  if (loading) {
    return (
      <div className="deck-selection loading">
        <div className="loading-spinner">Loading decks...</div>
      </div>
    );
  }

  return (
    <div className="deck-selection">
      <div className="deck-header">
        <h2>Study Flashcards</h2>
      </div>

      <div className="deck-list">
        {decks.map(deck => (
          <div key={deck.type} className="deck-item" style={{ borderColor: deck.color }}>
            <div className="deck-info">
              <span className="deck-icon">{deck.icon}</span>
              <span className="deck-label">{deck.label}</span>
              <span className="deck-count">
                ({deck.dueCount} due)
              </span>
            </div>
            <button
              className="deck-start-btn"
              onClick={() => handleStartReview(deck.type)}
              disabled={deck.dueCount === 0}
              title={deck.dueCount === 0 ? 'No cards due' : 'Start review'}
            >
              ▶
            </button>
          </div>
        ))}
      </div>

      <div className="deck-filters">
        <div className="filter-group">
          <label>Filter:</label>
          <select 
            value={filterSurah || 'all'}
            onChange={(e) => setFilterSurah(e.target.value === 'all' ? null : parseInt(e.target.value))}
          >
            <option value="all">All</option>
            {Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Surah {num}</option>
            ))}
          </select>
          
          <select 
            value={filterJuz || 'all'}
            onChange={(e) => setFilterJuz(e.target.value === 'all' ? null : parseInt(e.target.value))}
          >
            <option value="all">All Juz</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Juz {num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="deck-actions">
        <button
          className="btn btn-primary study-all-btn"
          onClick={handleStudyAll}
          disabled={totalDue === 0}
        >
          Study All Due ({totalDue})
        </button>
      </div>
    </div>
  );
};

export default DeckSelection;
