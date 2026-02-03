import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './TopBar.css';

function TopBar() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
  const isFullscreen = useAppStore((state) => state.navigation.isFullscreen);
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search query:', searchQuery);
    }
  };

  const handleVoiceSearch = () => {
    console.log('Voice search activated');
  };

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
              type="text"
              className="search-input"
              placeholder="Search Quran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="voice-search-btn"
              onClick={handleVoiceSearch}
              title="Voice search"
            >
              🎤
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
