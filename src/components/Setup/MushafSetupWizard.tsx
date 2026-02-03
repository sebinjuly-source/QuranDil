import { useState } from 'react';
import './MushafSetupWizard.css';

interface MushafSetupWizardProps {
  onComplete: () => void;
}

const MushafSetupWizard: React.FC<MushafSetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const handleDefaultMushaf = () => {
    // Use default Madani Mushaf from Quran.com API
    localStorage.setItem('qurandil-mushaf-config', JSON.stringify({
      type: 'default',
      name: 'Madani 15-Line',
      linesPerPage: 15,
      source: 'quran-api'
    }));
    onComplete();
  };

  const handleUploadMushaf = () => {
    setStep(2);
  };

  const handlePresetMushaf = () => {
    setStep(3);
  };

  return (
    <div className="setup-wizard-overlay">
      <div className="setup-wizard-modal">
        <h1>Welcome to QuranDil</h1>
        <p>Choose how you want to read the Quran</p>
        
        {step === 1 && (
          <div className="mushaf-options">
            <button className="mushaf-option-btn" onClick={handleDefaultMushaf}>
              <span className="option-icon">📖</span>
              <span className="option-title">Use Default Madani Mushaf</span>
              <span className="option-desc">Recommended - 15 lines per page</span>
            </button>
            
            <button className="mushaf-option-btn" onClick={handleUploadMushaf}>
              <span className="option-icon">📤</span>
              <span className="option-title">Upload My Own Mushaf</span>
              <span className="option-desc">Upload a PDF of your Mushaf</span>
            </button>
            
            <button className="mushaf-option-btn" onClick={handlePresetMushaf}>
              <span className="option-icon">📚</span>
              <span className="option-title">Choose from Presets</span>
              <span className="option-desc">Indo-Pak, Warsh, and more</span>
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div className="upload-step">
            <p>PDF upload feature coming soon!</p>
            <p>For now, please use the default Mushaf.</p>
            <button className="btn-primary" onClick={() => setStep(1)}>
              Back
            </button>
          </div>
        )}
        
        {step === 3 && (
          <div className="preset-step">
            <h3>Choose a Mushaf Preset</h3>
            <div className="preset-options">
              <button className="preset-btn" onClick={() => {
                localStorage.setItem('qurandil-mushaf-config', JSON.stringify({
                  type: 'preset',
                  name: 'Indo-Pak',
                  linesPerPage: 15,
                  source: 'quran-api'
                }));
                onComplete();
              }}>
                Indo-Pak Mushaf
              </button>
              <button className="preset-btn" onClick={() => {
                localStorage.setItem('qurandil-mushaf-config', JSON.stringify({
                  type: 'preset',
                  name: 'Warsh',
                  linesPerPage: 15,
                  source: 'quran-api'
                }));
                onComplete();
              }}>
                Warsh Mushaf
              </button>
            </div>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MushafSetupWizard;
