import { useEffect } from 'react';
import { useAppStore } from './state/useAppStore';
import TopBar from './components/TopBar/TopBar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import MushafViewer from './components/MushafViewer/MushafViewer';
import SidePane from './components/SidePane/SidePane';
import SearchResults from './components/SearchResults/SearchResults';
import AudioPlayer from './components/Audio/AudioPlayer';
import GoToDialog from './components/GoToDialog/GoToDialog';
import './App.css';

function App() {
  const theme = useAppStore((state) => state.theme);
  const sidePaneOpen = useAppStore((state) => state.sidePaneOpen);
  const leftPanelOpen = useAppStore((state) => state.leftPanelOpen);
  const searchResultsPaneOpen = useAppStore((state) => state.search.searchResultsPaneOpen);
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const isFullscreen = useAppStore((state) => state.navigation.isFullscreen);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
  const setGoToDialogOpen = useAppStore((state) => state.setGoToDialogOpen);
  const setSearchResultsPaneOpen = useAppStore((state) => state.setSearchResultsPaneOpen);
  const goBack = useAppStore((state) => state.goBack);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentPage(currentPage - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentPage(currentPage + 1);
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPage(1);
          break;
        case 'End':
          e.preventDefault();
          setCurrentPage(604);
          break;
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'g':
        case 'G':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setGoToDialogOpen(true);
          }
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            goBack();
          }
          break;
        case 'Escape':
          if (searchResultsPaneOpen) {
            e.preventDefault();
            setSearchResultsPaneOpen(false);
          } else if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isFullscreen, searchResultsPaneOpen, setCurrentPage, toggleFullscreen, setGoToDialogOpen, setSearchResultsPaneOpen, goBack]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      const storeFullscreen = useAppStore.getState().navigation.isFullscreen;
      if (isCurrentlyFullscreen !== storeFullscreen) {
        useAppStore.setState((state) => ({
          navigation: { ...state.navigation, isFullscreen: isCurrentlyFullscreen }
        }));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="app">
      <TopBar />

      <main className={`app-main ${sidePaneOpen ? 'with-sidepane' : ''} ${leftPanelOpen ? 'with-leftpanel' : ''} ${searchResultsPaneOpen ? 'with-searchpane' : ''}`}>
        <LeftPanel />
        <div className="mushaf-container">
          <MushafViewer />
        </div>
        {sidePaneOpen && (
          <div className="sidepane-container">
            <SidePane />
          </div>
        )}
        {searchResultsPaneOpen && (
          <div className="searchpane-container">
            <SearchResults />
          </div>
        )}
      </main>

      <AudioPlayer />
      <GoToDialog />
    </div>
  );
}

export default App;
