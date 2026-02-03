import { useState } from 'react';
import './SmartMushafImport.css';

type WizardStep = 'choose' | 'upload' | 'detect' | 'preview' | 'complete';

interface SmartMushafImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartMushafImport: React.FC<SmartMushafImportProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('choose');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mushafType, setMushafType] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setCurrentStep('detect');
      
      // Simulate detection
      setTimeout(() => {
        setMushafType('Madani 15-line Tajweed');
        setCurrentStep('preview');
      }, 2000);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUseDefault = () => {
    setMushafType('Default Madani Mushaf');
    setCurrentStep('complete');
  };

  const handleStartUsing = () => {
    // TODO: Save mushaf configuration
    onClose();
  };

  const renderChooseStep = () => (
    <div className="wizard-step step-choose">
      <h2>Choose Mushaf</h2>
      <p className="step-description">
        Select how you'd like to set up your Mushaf
      </p>

      <div className="option-cards">
        <button className="option-card recommended" onClick={handleUseDefault}>
          <div className="option-icon">📖</div>
          <h3>Use Default Madani Mushaf</h3>
          <p>Standard 15-line Hafs Mushaf (recommended)</p>
          <span className="recommended-badge">Recommended</span>
        </button>

        <label className="option-card">
          <div className="option-icon">📁</div>
          <h3>Upload My Mushaf PDF</h3>
          <p>Use your own Mushaf PDF file</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>

        <button className="option-card" disabled>
          <div className="option-icon">📚</div>
          <h3>Select from Presets</h3>
          <p>Choose from popular Mushaf styles</p>
          <span className="coming-soon-badge">Coming Soon</span>
        </button>
      </div>
    </div>
  );

  const renderDetectStep = () => (
    <div className="wizard-step step-detect">
      <h2>Analyzing PDF...</h2>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Detecting Mushaf format and properties</p>
      </div>

      <div className="detection-info">
        <div className="info-item">
          <span className="info-label">File name:</span>
          <span className="info-value">{selectedFile?.name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">File size:</span>
          <span className="info-value">
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="wizard-step step-preview">
      <h2>Detection Complete</h2>
      <p className="step-description">
        We've detected your Mushaf properties
      </p>

      <div className="detection-results">
        <div className="result-item success">
          <span className="result-icon">✓</span>
          <div className="result-content">
            <span className="result-label">Mushaf Type:</span>
            <span className="result-value">{mushafType}</span>
          </div>
        </div>

        <div className="result-item success">
          <span className="result-icon">✓</span>
          <div className="result-content">
            <span className="result-label">Lines per page:</span>
            <span className="result-value">15</span>
          </div>
        </div>

        <div className="result-item success">
          <span className="result-icon">✓</span>
          <div className="result-content">
            <span className="result-label">Tajweed colors:</span>
            <span className="result-value">Yes</span>
          </div>
        </div>

        <div className="result-item success">
          <span className="result-icon">✓</span>
          <div className="result-content">
            <span className="result-label">Total pages:</span>
            <span className="result-value">604</span>
          </div>
        </div>

        <div className="result-item success">
          <span className="result-icon">✓</span>
          <div className="result-content">
            <span className="result-label">Confidence:</span>
            <span className="result-value">High (95%)</span>
          </div>
        </div>
      </div>

      <div className="preview-actions">
        <button className="btn btn-secondary" onClick={() => setCurrentStep('choose')}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={() => setCurrentStep('complete')}>
          Continue →
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="wizard-step step-complete">
      <div className="success-icon">✓</div>
      <h2>Setup Complete!</h2>
      <p className="step-description">
        Your Mushaf has been configured successfully
      </p>

      <div className="mushaf-info">
        <div className="info-card">
          <h4>Selected Mushaf:</h4>
          <p className="mushaf-name">{mushafType}</p>
        </div>
      </div>

      <div className="complete-actions">
        <button className="btn btn-primary btn-large" onClick={handleStartUsing}>
          Start Using QuranDil
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="import-overlay" onClick={onClose} />
      <div className="import-wizard">
        <div className="wizard-header">
          <h1>Smart Mushaf Setup</h1>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="wizard-content">
          {currentStep === 'choose' && renderChooseStep()}
          {currentStep === 'detect' && renderDetectStep()}
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>

        <div className="wizard-footer">
          <div className="step-indicators">
            <div className={`step-dot ${currentStep === 'choose' ? 'active' : ''} ${['detect', 'preview', 'complete'].includes(currentStep) ? 'completed' : ''}`} />
            <div className={`step-dot ${currentStep === 'detect' ? 'active' : ''} ${['preview', 'complete'].includes(currentStep) ? 'completed' : ''}`} />
            <div className={`step-dot ${currentStep === 'preview' ? 'active' : ''} ${currentStep === 'complete' ? 'completed' : ''}`} />
            <div className={`step-dot ${currentStep === 'complete' ? 'active' : ''}`} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartMushafImport;
