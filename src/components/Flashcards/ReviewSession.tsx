import { useState } from 'react';
import { Flashcard } from '../../engines/FlashcardStore';
import { FSRSEngine, Rating } from '../../engines/FSRSEngine';
import { useAppStore } from '../../state/useAppStore';
import './ReviewSession.css';

interface ReviewSessionProps {
  cards: Flashcard[];
  onComplete: (stats: SessionStats) => void;
}

export interface SessionStats {
  cardsReviewed: number;
  correctCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  timeSpent: number;
  startTime: Date;
  endTime: Date;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    cardsReviewed: 0,
    correctCount: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    timeSpent: 0,
    startTime: new Date(),
    endTime: new Date(),
  });
  const [startTime] = useState(Date.now());
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setAudioAyah = useAppStore((state) => state.setAudioAyah);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  const fsrsEngine = new FSRSEngine();

  const currentCard = cards[currentIndex];

  const handleReveal = () => {
    setRevealed(true);
    
    // Auto-play audio if enabled
    const autoPlayOnReveal = localStorage.getItem('settings.audio.autoPlayOnReveal');
    if (autoPlayOnReveal === 'true' && currentCard) {
      setAudioAyah(currentCard.surah, currentCard.ayah, currentCard.page);
      setAudioPlaying(true);
    }
  };

  const handleRate = async (rating: Rating) => {
    if (!currentCard) return;

    // Update stats
    const newStats = { ...stats };
    newStats.cardsReviewed++;
    
    switch (rating) {
      case Rating.Again:
        newStats.againCount++;
        break;
      case Rating.Hard:
        newStats.hardCount++;
        break;
      case Rating.Good:
        newStats.goodCount++;
        newStats.correctCount++;
        break;
      case Rating.Easy:
        newStats.easyCount++;
        newStats.correctCount++;
        break;
    }

    setStats(newStats);

    // Rate card with FSRS
    const updatedFsrs = fsrsEngine.rateCard(currentCard.fsrsState, rating);
    const updatedCard: Flashcard = {
      ...currentCard,
      fsrsState: updatedFsrs,
      lastReviewed: new Date(),
    };

    // Save to store
    const { flashcardStore } = await import('../../engines/FlashcardStore');
    await flashcardStore.update(updatedCard);

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
    } else {
      // Session complete
      const endTime = new Date();
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        ...newStats,
        timeSpent,
        endTime,
      });
    }
  };

  const handleDoubleClick = () => {
    if (currentCard) {
      setCurrentPage(currentCard.page);
    }
  };

  if (!currentCard) {
    return (
      <div className="review-session empty">
        <p>No cards to review!</p>
      </div>
    );
  }

  return (
    <div className="review-session">
      <div className="review-progress">
        <div className="progress-text">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div 
        className={`flashcard ${revealed ? 'revealed' : ''}`}
        onClick={!revealed ? handleReveal : undefined}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flashcard-front">
          <div className="card-type-badge">
            {currentCard.type === 'mistake' && '🔴 Mistake'}
            {currentCard.type === 'mutashabihat' && '🟡 Mutashabihat'}
            {currentCard.type === 'transition' && '🔵 Transition'}
            {currentCard.type === 'custom-transition' && '🟣 Custom Transition'}
            {currentCard.type === 'page-number' && '⚪ Page Number'}
          </div>
          <div className="card-content">
            {currentCard.front}
          </div>
          {!revealed && (
            <div className="card-hint">
              Click to reveal
            </div>
          )}
        </div>

        {revealed && (
          <div className="flashcard-back">
            <div className="card-divider" />
            <div className="card-content">
              {currentCard.back}
            </div>
          </div>
        )}
      </div>

      {revealed && (
        <div className="rating-buttons">
          <button 
            className="rating-btn again"
            onClick={() => handleRate(Rating.Again)}
          >
            <span className="rating-label">Again</span>
            <span className="rating-number">1</span>
          </button>
          <button 
            className="rating-btn hard"
            onClick={() => handleRate(Rating.Hard)}
          >
            <span className="rating-label">Hard</span>
            <span className="rating-number">2</span>
          </button>
          <button 
            className="rating-btn good"
            onClick={() => handleRate(Rating.Good)}
          >
            <span className="rating-label">Good</span>
            <span className="rating-number">3</span>
          </button>
          <button 
            className="rating-btn easy"
            onClick={() => handleRate(Rating.Easy)}
          >
            <span className="rating-label">Easy</span>
            <span className="rating-number">4</span>
          </button>
        </div>
      )}

      {!revealed && (
        <div className="review-hint">
          <p>Double-click card to jump to this location in the Mushaf</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSession;
