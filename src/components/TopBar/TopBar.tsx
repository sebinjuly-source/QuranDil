import { useAppStore } from '../../state/useAppStore';
import './TopBar.css';

function TopBar() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
  const isFullscreen = useAppStore((state) => state.navigation.isFullscreen);
  const isDualPage = useAppStore((state) => state.navigation.isDualPage);
  const toggleDualPage = useAppStore((state) => state.toggleDualPage);
  const setSettingsPanelOpen = useAppStore((state) => state.setSettingsPanelOpen);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);
  const sidePaneContent = useAppStore((state) => state.sidePaneContent);
  
  const handleSearchClick = () => {
    // Toggle search pane
    if (sidePaneContent === 'search') {
      setSidePaneContent(null);
    } else {
      setSidePaneContent('search');
    }
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

        <div className="top-bar-right">
          <button
            className="top-bar-btn"
            onClick={handleSearchClick}
            title="Search (Ctrl+F)"
          >
            🔍
          </button>
          <button
            className="top-bar-btn"
            onClick={toggleDualPage}
            title={isDualPage ? 'Single page view' : 'Dual page view'}
          >
            {isDualPage ? '📄' : '📖'}
          </button>
          <button
            className="top-bar-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (F11)' : 'Fullscreen (F11)'}
          >
            {isFullscreen ? '⬜' : '⛶'}
          </button>
          <button
            className="top-bar-btn"
            onClick={() => setSettingsPanelOpen(true)}
            title="Settings (Ctrl+,)"
          >
            ⚙️
          </button>
          <button
            className="top-bar-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '📖'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
