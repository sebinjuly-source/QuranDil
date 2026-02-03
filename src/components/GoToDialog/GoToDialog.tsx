import { useState, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './GoToDialog.css';

function GoToDialog() {
  const isOpen = useAppStore((state) => state.goToDialogOpen);
  const setIsOpen = useAppStore((state) => state.setGoToDialogOpen);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInput('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(input, 10);
    if (!isNaN(page) && page >= 1 && page <= 604) {
      setCurrentPage(page);
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Go to Page</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="dialog-form">
          <input
            type="number"
            min="1"
            max="604"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter page number (1-604)"
            className="dialog-input"
            autoFocus
          />
          <div className="dialog-actions">
            <button type="button" onClick={handleClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Go
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoToDialog;
