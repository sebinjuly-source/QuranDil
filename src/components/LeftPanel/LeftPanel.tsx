import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { surahData } from '../../data/surahData';
import './LeftPanel.css';

function LeftPanel() {
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

  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [ayahInput, setAyahInput] = useState('');

  const handlePageChange = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNum = parseInt(e.target.value, 10);
    if (!isNaN(surahNum)) {
      setCurrentSurah(surahNum);
    }
  };

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juzNum = parseInt(e.target.value, 10);
    if (!isNaN(juzNum)) {
      setCurrentJuz(juzNum);
    }
  };

  const handleAyahNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const match = ayahInput.match(/^(\d+):(\d+)$/);
    if (match) {
      const surah = parseInt(match[1], 10);
      const ayah = parseInt(match[2], 10);
      console.log(`Navigate to Surah ${surah}, Ayah ${ayah}`);
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
                    onChange={(e) => setPageInput(e.target.value)}
                    className="control-input"
                  />
                  <button type="submit" className="go-btn">Go</button>
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

              <div className="control-group">
                <label htmlFor="ayah-input">Ayah (e.g., 2:255)</label>
                <form onSubmit={handleAyahNavigate} className="inline-form">
                  <input
                    id="ayah-input"
                    type="text"
                    placeholder="2:255"
                    value={ayahInput}
                    onChange={(e) => setAyahInput(e.target.value)}
                    className="control-input"
                  />
                  <button type="submit" className="go-btn">Go</button>
                </form>
              </div>

              <div className="current-location">
                <strong>Current:</strong> Page {currentPage}
                {currentSurah && ` • Surah ${currentSurah}`}
                {currentJuz && ` • Juz ${currentJuz}`}
              </div>

              <button
                className="back-btn"
                onClick={goBack}
                disabled={history.length === 0}
                title="Go back (Ctrl+Z)"
              >
                ← Back
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
            <h3 className="section-title">Audio Player</h3>
            <div className="audio-preview">
              <p className="text-muted">Audio controls preview</p>
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title">Flashcard Decks</h3>
            <div className="flashcard-list">
              <button className="deck-btn">Mistakes</button>
              <button className="deck-btn">Mutashabihat</button>
              <button className="deck-btn">Transitions</button>
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title">Quick Settings</h3>
            <div className="settings-shortcuts">
              <button className="setting-btn">⚙️ Preferences</button>
              <button className="setting-btn">🎨 Appearance</button>
              <button className="setting-btn">🔊 Audio</button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

export default LeftPanel;
