import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './MutashabihatCompare.css';

interface VerseData {
  surah: number;
  ayah: number;
  text: string;
  page: number;
  surahName?: string;
}

interface MutashabihatCompareProps {
  verse1?: VerseData;
  verse2?: VerseData;
}

const MutashabihatCompare: React.FC<MutashabihatCompareProps> = ({ verse1, verse2 }) => {
  const [selectedVerse1, setSelectedVerse1] = useState<VerseData | null>(verse1 || null);
  const [selectedVerse2, setSelectedVerse2] = useState<VerseData | null>(verse2 || null);
  const [verse1Input, setVerse1Input] = useState('');
  const [verse2Input, setVerse2Input] = useState('');
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setAudioAyah = useAppStore((state) => state.setAudioAyah);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  const setActiveFlashcardType = useAppStore((state) => state.setActiveFlashcardType);

  // Function to find common and different parts
  const compareVerses = (text1: string, text2: string) => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    // Convert words2 to Set for O(1) lookups
    const words2Set = new Set(words2);
    
    // Simple word-level comparison
    const common: string[] = [];
    const diff1: string[] = [];
    const diff2: string[] = [];
    
    // Find common words
    words1.forEach((word) => {
      if (words2Set.has(word)) {
        common.push(word);
      } else {
        diff1.push(word);
      }
    });
    
    // Convert words1 to Set for checking words unique to words2
    const words1Set = new Set(words1);
    words2.forEach((word) => {
      if (!words1Set.has(word)) {
        diff2.push(word);
      }
    });
    
    return { common: common.join(' '), diff1: diff1.join(' '), diff2: diff2.join(' ') };
  };

  const handleLoadVerse = async (verseRef: string, setVerse: (v: VerseData) => void) => {
    const match = verseRef.match(/^(\d+):(\d+)$/);
    if (!match) {
      alert('Invalid verse format. Use format: 2:255');
      return;
    }
    
    const surah = parseInt(match[1], 10);
    const ayah = parseInt(match[2], 10);
    
    if (surah < 1 || surah > 114) {
      alert('Surah number must be between 1 and 114');
      return;
    }
    
    try {
      // Fetch verse text from QuranApiClient
      const engine = useAppStore.getState().engine;
      const verse = await engine.quranApi.getVerse(surah, ayah);
      
      setVerse({
        surah,
        ayah,
        text: verse.text_uthmani || verse.text_imlaei || '',
        page: verse.page_number || 1,
        surahName: `Surah ${surah}`,
      });
    } catch (error) {
      console.error('Error loading verse:', error);
      alert('Failed to load verse. Please check your connection and try again.');
    }
  };

  const handleCreateFlashcard = () => {
    if (!selectedVerse1 || !selectedVerse2) {
      alert('Please load both verses first');
      return;
    }
    
    setActiveFlashcardType('mutashabihat');
    // The SidePane will show flashcard creator
  };

  const handlePlayAudio = (verse: VerseData) => {
    setAudioAyah(verse.surah, verse.ayah, verse.page);
    setAudioPlaying(true);
  };

  const handleGoToVerse = (verse: VerseData) => {
    setCurrentPage(verse.page, true);
  };

  const comparison = selectedVerse1 && selectedVerse2 
    ? compareVerses(selectedVerse1.text, selectedVerse2.text)
    : null;

  return (
    <div className="mutashabihat-compare">
      <div className="compare-header">
        <h2>Mutashabihat Comparison</h2>
        <p className="help-text">
          Compare similar verses to identify differences and create flashcards
        </p>
      </div>

      <div className="verse-input-section">
        <div className="verse-input-group">
          <label>Verse 1 (e.g., 2:255)</label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="2:255"
              value={verse1Input}
              onChange={(e) => setVerse1Input(e.target.value)}
              className="verse-input"
            />
            <button 
              onClick={() => handleLoadVerse(verse1Input, setSelectedVerse1)}
              className="btn btn-primary"
            >
              Load
            </button>
          </div>
        </div>

        <div className="verse-input-group">
          <label>Verse 2 (e.g., 3:88)</label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="3:88"
              value={verse2Input}
              onChange={(e) => setVerse2Input(e.target.value)}
              className="verse-input"
            />
            <button 
              onClick={() => handleLoadVerse(verse2Input, setSelectedVerse2)}
              className="btn btn-primary"
            >
              Load
            </button>
          </div>
        </div>
      </div>

      {selectedVerse1 && selectedVerse2 ? (
        <>
          <div className="comparison-view">
            <div className="verse-pane verse-1">
              <div className="verse-header">
                <h3>{selectedVerse1.surahName || `Surah ${selectedVerse1.surah}`}</h3>
                <span className="verse-ref">
                  {selectedVerse1.surah}:{selectedVerse1.ayah} (Page {selectedVerse1.page})
                </span>
              </div>
              
              <div className="verse-text" dir="rtl">
                {selectedVerse1.text}
              </div>
              
              <div className="verse-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handlePlayAudio(selectedVerse1)}
                  title="Play audio"
                >
                  ▶ Play
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleGoToVerse(selectedVerse1)}
                  title="Go to this verse in Mushaf"
                >
                  📖 Go to Mushaf
                </button>
              </div>
            </div>

            <div className="verse-pane verse-2">
              <div className="verse-header">
                <h3>{selectedVerse2.surahName || `Surah ${selectedVerse2.surah}`}</h3>
                <span className="verse-ref">
                  {selectedVerse2.surah}:{selectedVerse2.ayah} (Page {selectedVerse2.page})
                </span>
              </div>
              
              <div className="verse-text" dir="rtl">
                {selectedVerse2.text}
              </div>
              
              <div className="verse-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handlePlayAudio(selectedVerse2)}
                  title="Play audio"
                >
                  ▶ Play
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleGoToVerse(selectedVerse2)}
                  title="Go to this verse in Mushaf"
                >
                  📖 Go to Mushaf
                </button>
              </div>
            </div>
          </div>

          {comparison && (
            <div className="comparison-analysis">
              <div className="analysis-section">
                <h4>Shared Text</h4>
                <div className="shared-text" dir="rtl">
                  {comparison.common || 'No common words found'}
                </div>
              </div>

              <div className="analysis-section">
                <h4>Differences</h4>
                <div className="differences-grid">
                  <div className="difference-item">
                    <span className="diff-label">Verse 1 only:</span>
                    <span className="diff-text" dir="rtl">
                      {comparison.diff1 || 'None'}
                    </span>
                  </div>
                  <div className="difference-item">
                    <span className="diff-label">Verse 2 only:</span>
                    <span className="diff-text" dir="rtl">
                      {comparison.diff2 || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flashcard-section">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleCreateFlashcard}
                >
                  🟡 Create Mutashabihat Flashcard
                </button>
                <p className="help-text">
                  Create a flashcard to help memorize the difference between these verses
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>Enter verse references above to start comparison</p>
          <p className="help-text">
            Example: Enter "2:162" and "3:88" to compare these similar verses
          </p>
        </div>
      )}
    </div>
  );
};

export default MutashabihatCompare;
