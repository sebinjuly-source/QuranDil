import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { surahData } from '../../data/surahData';
import './LeftPanel.css';

const LeftPanel: React.FC = () => {
  const leftPanelOpen = useAppStore((state) => state.leftPanelOpen);
  const setLeftPanelOpen = useAppStore((state) => state.setLeftPanelOpen);
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const currentSurah = useAppStore((state) => state.navigation.currentSurah);
  const currentJuz = useAppStore((state) => state.navigation.currentJuz);
  const isDualPage = useAppStore((state) => state.navigation.isDualPage);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setCurrentSurah = useAppStore((state) => state.setCurrentSurah);
  const setCurrentJuz = useAppStore((state) => state.setCurrentJuz);
  const toggleDualPage = useAppStore((state) => state.toggleDualPage);
  const goBack = useAppStore((state) => state.goBack);
  const history = useAppStore((state) => state.navigation.history);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);
  const setActiveFlashcardType = useAppStore((state) => state.setActiveFlashcardType);
  const setSettingsPanelOpen = useAppStore((state) => state.setSettingsPanelOpen);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageChange = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    // Navigate on blur if valid
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= 604) {
      setCurrentPage(page);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNum = parseInt(e.target.value, 10);
    if (!isNaN(surahNum)) {
      setCurrentSurah(surahNum);
      // Note: In a full implementation, you'd look up the page for this surah
      // For now, we'll just set the surah without changing the page
    }
  };

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juzNum = parseInt(e.target.value, 10);
    if (!isNaN(juzNum)) {
      setCurrentJuz(juzNum);
      // Navigate to juz page
      // Approximate calculation: most juz are ~20 pages
      // In a full implementation, use a proper juz-to-page lookup table
      const juzPage = 1 + (juzNum - 1) * 20;
      setCurrentPage(juzPage);
    }
  };

  return (
    <aside className={`left-panel ${leftPanelOpen ? 'open' : 'closed'}`}>
      <button
        className="panel-toggle"
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        title={leftPanelOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {leftPanelOpen ? '◀' : '▶'}
      </button>

      {leftPanelOpen && (
        <div className="panel-content">
          <section className="panel-section">
            <h3 className="section-title">Navigation</h3>
            
            <div className="nav-controls">
              <div className="control-group">
                <label htmlFor="page-input">Page</label>
                <form onSubmit={handlePageChange} className="inline-form">
                  <input
                    id="page-input"
                    type="number"
                    min="1"
                    max="604"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    className="control-input"
                    placeholder="1-604"
                  />
                </form>
              </div>

              <div className="control-group">
                <label htmlFor="surah-select">Surah</label>
                <select
                  id="surah-select"
                  value={currentSurah || ''}
                  onChange={handleSurahChange}
                  className="control-select"
                >
                  <option value="">Select Surah</option>
                  {surahData.map((surah) => (
                    <option key={surah.number} value={surah.number}>
                      {surah.number}. {surah.name} ({surah.englishName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="juz-select">Juz</label>
                <select
                  id="juz-select"
                  value={currentJuz || ''}
                  onChange={handleJuzChange}
                  className="control-select"
                >
                  <option value="">Select Juz</option>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                    <option key={juz} value={juz}>
                      Juz {juz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="current-location">
                <strong>Current:</strong> Page {currentPage}
                {currentSurah && ` • Surah ${currentSurah}`}
                {currentJuz && ` • Juz ${currentJuz}`}
              </div>

              <div className="navigation-buttons">
                <button
                  className="nav-action-btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page (←)"
                >
                  ← Previous
                </button>
                <button
                  className="nav-action-btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === 604}
                  title="Next page (→)"
                >
                  Next →
                </button>
              </div>

              <button
                className="back-btn"
                onClick={goBack}
                disabled={history.length === 0}
                title="Go back (Ctrl+Z)"
              >
                ↶ Back
              </button>
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title">View Settings</h3>
            <div className="view-controls">
              <button
                className={`view-btn ${isDualPage ? 'active' : ''}`}
                onClick={toggleDualPage}
              >
                {isDualPage ? 'Dual Page' : 'Single Page'}
              </button>
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title">Flashcard Decks</h3>
            <div className="flashcard-list">
              <button 
                className="deck-btn mistakes"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType('mistake');
                }}
              >
                🔴 Mistakes
              </button>
              <button 
                className="deck-btn mutashabihat"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType('mutashabihat');
                }}
              >
                🟡 Mutashabihat
              </button>
              <button 
                className="deck-btn transitions"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType('transition');
                }}
              >
                🔵 Transitions
              </button>
              <button 
                className="deck-btn custom-transitions"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType('custom-transition');
                }}
              >
                🟣 Custom Trans.
              </button>
              <button 
                className="deck-btn page-numbers"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType('page-number');
                }}
              >
                ⚪ Page Numbers
              </button>
              <button 
                className="deck-btn study-all"
                onClick={() => {
                  setSidePaneContent('flashcards');
                  setActiveFlashcardType(null);
                }}
                style={{ marginTop: '8px', fontWeight: 'bold' }}
              >
                📚 Study All
              </button>
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title">Quick Settings</h3>
            <div className="settings-shortcuts">
              <button 
                className="setting-btn"
                onClick={() => setSettingsPanelOpen(true)}
              >
                ⚙️ Preferences
              </button>
              <button 
                className="setting-btn"
                onClick={() => toggleTheme()}
              >
                🎨 Appearance
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

export default LeftPanel;
