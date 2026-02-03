import { useState, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './SettingsPanel.css';

interface Settings {
  display: {
    theme: 'light' | 'dark' | 'sepia';
    pageView: 'single' | 'dual';
    fontSize: 'small' | 'medium' | 'large';
  };
  audio: {
    defaultReciter: string;
    autoPlayOnReveal: boolean;
    gapBetweenVerses: number;
  };
  flashcards: {
    editImmediately: boolean;
    showMetadata: boolean;
  };
}

const defaultSettings: Settings = {
  display: {
    theme: 'light',
    pageView: 'single',
    fontSize: 'medium',
  },
  audio: {
    defaultReciter: 'ar.alafasy',
    autoPlayOnReveal: false,
    gapBetweenVerses: 1,
  },
  flashcards: {
    editImmediately: true,
    showMetadata: true,
  },
};

const reciters = [
  { value: 'ar.alafasy', label: 'Mishary Rashid Alafasy' },
  { value: 'ar.abdulbasitmurattal', label: 'Abdul Basit (Murattal)' },
  { value: 'ar.husary', label: 'Mahmoud Khalil Al-Husary' },
  { value: 'ar.minshawi', label: 'Mohamed Siddiq El-Minshawi' },
  { value: 'ar.muhammadayyoub', label: 'Muhammad Ayyoub' },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const isDualPage = useAppStore((state) => state.navigation.isDualPage);
  const toggleDualPage = useAppStore((state) => state.toggleDualPage);
  const setAudioReciter = useAppStore((state) => state.setAudioReciter);
  const setGapDuration = useAppStore((state) => state.setGapDuration);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('qurandil-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('qurandil-settings', JSON.stringify(newSettings));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'sepia') => {
    const newSettings = {
      ...settings,
      display: { ...settings.display, theme: newTheme },
    };
    saveSettings(newSettings);
    if (theme !== newTheme) {
      setTheme(newTheme);
    }
  };

  const handlePageViewChange = (view: 'single' | 'dual') => {
    const newSettings = {
      ...settings,
      display: { ...settings.display, pageView: view },
    };
    saveSettings(newSettings);
    if ((view === 'dual') !== isDualPage) {
      toggleDualPage();
    }
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    const newSettings = {
      ...settings,
      display: { ...settings.display, fontSize: size },
    };
    saveSettings(newSettings);
    // TODO: Apply font size to Mushaf
  };

  const handleReciterChange = (reciter: string) => {
    const newSettings = {
      ...settings,
      audio: { ...settings.audio, defaultReciter: reciter },
    };
    saveSettings(newSettings);
    setAudioReciter(reciter);
  };

  const handleAutoPlayToggle = () => {
    const newValue = !settings.audio.autoPlayOnReveal;
    const newSettings = {
      ...settings,
      audio: { ...settings.audio, autoPlayOnReveal: newValue },
    };
    saveSettings(newSettings);
    localStorage.setItem('settings.audio.autoPlayOnReveal', String(newValue));
  };

  const handleGapChange = (gap: number) => {
    const newSettings = {
      ...settings,
      audio: { ...settings.audio, gapBetweenVerses: gap },
    };
    saveSettings(newSettings);
    setGapDuration(gap);
  };

  const handleFlashcardSettingChange = (key: keyof Settings['flashcards'], value: boolean) => {
    const newSettings = {
      ...settings,
      flashcards: { ...settings.flashcards, [key]: value },
    };
    saveSettings(newSettings);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      saveSettings(defaultSettings);
      setTheme(defaultSettings.display.theme);
      if ((defaultSettings.display.pageView === 'dual') !== isDualPage) toggleDualPage();
      setAudioReciter(defaultSettings.audio.defaultReciter);
      setGapDuration(defaultSettings.audio.gapBetweenVerses);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Display</h3>
            <div className="setting-item">
              <label>Theme</label>
              <select 
                value={settings.display.theme}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'sepia')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="sepia">Sepia</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Page View</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="pageView"
                    value="single"
                    checked={settings.display.pageView === 'single'}
                    onChange={(e) => handlePageViewChange(e.target.value as 'single' | 'dual')}
                  />
                  Single
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="pageView"
                    value="dual"
                    checked={settings.display.pageView === 'dual'}
                    onChange={(e) => handlePageViewChange(e.target.value as 'single' | 'dual')}
                  />
                  Dual
                </label>
              </div>
            </div>

            <div className="setting-item">
              <label>Font Size</label>
              <select 
                value={settings.display.fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as any)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>Audio</h3>
            <div className="setting-item">
              <label>Default Reciter</label>
              <select 
                value={settings.audio.defaultReciter}
                onChange={(e) => handleReciterChange(e.target.value)}
              >
                {reciters.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.audio.autoPlayOnReveal}
                  onChange={handleAutoPlayToggle}
                />
                Auto-play on flashcard reveal
              </label>
            </div>

            <div className="setting-item">
              <label>Gap between verses</label>
              <select 
                value={settings.audio.gapBetweenVerses}
                onChange={(e) => handleGapChange(Number(e.target.value))}
              >
                <option value="0">0s</option>
                <option value="0.5">0.5s</option>
                <option value="1">1s</option>
                <option value="2">2s</option>
                <option value="3">3s</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>Flashcards</h3>
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.flashcards.editImmediately}
                  onChange={(e) => handleFlashcardSettingChange('editImmediately', e.target.checked)}
                />
                Edit immediately after creation
              </label>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.flashcards.showMetadata}
                  onChange={(e) => handleFlashcardSettingChange('showMetadata', e.target.checked)}
                />
                Show metadata (page, surah, ayah)
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h3>Mushaf</h3>
            <div className="setting-item">
              <button className="btn btn-secondary" disabled>
                Change Mushaf...
              </button>
              <p className="help-text">Coming soon: Switch between different Mushaf styles</p>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={handleResetToDefaults}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
