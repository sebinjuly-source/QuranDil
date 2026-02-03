import { useEffect, useState } from 'react';
import { useAppStore } from './state/useAppStore';
import { MUSHAF_CONFIG_KEY } from './constants';
import TopBar from './components/TopBar/TopBar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import MushafViewer from './components/MushafViewer/MushafViewer';
import SidePane from './components/SidePane/SidePane';
import SearchResults from './components/SearchResults/SearchResults';
import AudioPlayer from './components/Audio/AudioPlayer';
import GoToDialog from './components/GoToDialog/GoToDialog';
import SettingsPanel from './components/Settings/SettingsPanel';
import DrawingCanvas from './components/Drawing/DrawingCanvas';
import MushafSetupWizard from './components/Setup/MushafSetupWizard';
import './App.css';

function App() {
  const [mushafConfigured, setMushafConfigured] = useState(false);
  const theme = useAppStore((state) => state.theme);
  const sidePaneOpen = useAppStore((state) => state.sidePaneOpen);
  const leftPanelOpen = useAppStore((state) => state.leftPanelOpen);
  const searchResultsPaneOpen = useAppStore((state) => state.search.searchResultsPaneOpen);
  const settingsPanelOpen = useAppStore((state) => state.settingsPanelOpen);
  const drawingModeActive = useAppStore((state) => state.drawingModeActive);
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const isFullscreen = useAppStore((state) => state.navigation.isFullscreen);
  const audio = useAppStore((state) => state.audio);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
  const setGoToDialogOpen = useAppStore((state) => state.setGoToDialogOpen);
  const setSearchResultsPaneOpen = useAppStore((state) => state.setSearchResultsPaneOpen);
  const setSettingsPanelOpen = useAppStore((state) => state.setSettingsPanelOpen);
  const setDrawingModeActive = useAppStore((state) => state.setDrawingModeActive);
  const goBack = useAppStore((state) => state.goBack);

  // Check if Mushaf is configured on first load
  useEffect(() => {
    const config = localStorage.getItem(MUSHAF_CONFIG_KEY);
    if (config) {
      setMushafConfigured(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          // Spacebar for play/pause audio
          if (audio.currentSurah && audio.currentAyah) {
            e.preventDefault();
            setAudioPlaying(!audio.isPlaying);
          }
          break;
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
        case ',':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSettingsPanelOpen(true);
          }
          break;
        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setDrawingModeActive(!drawingModeActive);
          }
          break;
        case 'Escape':
          if (drawingModeActive) {
            e.preventDefault();
            setDrawingModeActive(false);
          } else if (settingsPanelOpen) {
            e.preventDefault();
            setSettingsPanelOpen(false);
          } else if (searchResultsPaneOpen) {
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
  }, [currentPage, isFullscreen, searchResultsPaneOpen, settingsPanelOpen, drawingModeActive, audio.isPlaying, audio.currentSurah, audio.currentAyah, setCurrentPage, toggleFullscreen, setGoToDialogOpen, setSearchResultsPaneOpen, setSettingsPanelOpen, setDrawingModeActive, goBack, setAudioPlaying]);

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

  // Show setup wizard if Mushaf is not configured
  if (!mushafConfigured) {
    return (
      <MushafSetupWizard
        onComplete={() => {
          setMushafConfigured(true);
        }}
      />
    );
  }

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
      <SettingsPanel isOpen={settingsPanelOpen} onClose={() => setSettingsPanelOpen(false)} />
      <DrawingCanvas isActive={drawingModeActive} onClose={() => setDrawingModeActive(false)} />
    </div>
  );
}

export default App;
