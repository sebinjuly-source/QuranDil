import { useEffect } from 'react';
import { useAppStore } from './state/useAppStore';
import MushafViewer from './components/MushafViewer/MushafViewer';
import SidePane from './components/SidePane/SidePane';
import AudioPlayer from './components/Audio/AudioPlayer';
import './App.css';

function App() {
  const theme = useAppStore((state) => state.theme);
  const sidePaneOpen = useAppStore((state) => state.sidePaneOpen);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">❤️📖</span>
            <h1>QuranDil</h1>
          </div>
          <nav className="header-nav">
            <button className="nav-button" title="Settings">
              ⚙️
            </button>
            <button
              className="nav-button"
              onClick={() => useAppStore.getState().toggleTheme()}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>

      <main className={`app-main ${sidePaneOpen ? 'with-sidepane' : ''}`}>
        <div className="mushaf-container">
          <MushafViewer />
        </div>
        {sidePaneOpen && (
          <div className="sidepane-container">
            <SidePane />
          </div>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}

export default App;
