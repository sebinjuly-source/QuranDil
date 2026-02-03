import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './SelectionPopup.css';

interface SelectionPopupProps {
  x: number;
  y: number;
  selectedText: string;
  onClose: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Brown', value: '#92400e' },
  { name: 'Grey', value: '#6b7280' },
];

const SelectionPopup: React.FC<SelectionPopupProps> = ({ x, y, selectedText, onClose }) => {
  const [showHighlightSubmenu, setShowHighlightSubmenu] = useState(false);
  const setActiveFlashcardType = useAppStore((state) => state.setActiveFlashcardType);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const performSearch = useAppStore((state) => state.performSearch);

  const handleCloze = () => {
    // Create cloze deletion flashcard
    setActiveFlashcardType('mistake'); // Use mistake type for cloze
    setSidePaneContent('flashcards');
    // TODO: Auto-populate with cloze deletion
    onClose();
  };

  const handleSearch = () => {
    setSearchQuery(selectedText);
    performSearch(selectedText);
    onClose();
  };

  const handleMutashabihat = () => {
    setActiveFlashcardType('mutashabihat');
    setSidePaneContent('mutashabihat');
    onClose();
  };

  const handleMistake = () => {
    setActiveFlashcardType('mistake');
    setSidePaneContent('flashcards');
    onClose();
  };

  const handleTransition = () => {
    setActiveFlashcardType('transition');
    setSidePaneContent('flashcards');
    onClose();
  };

  const handleCustomTransition = () => {
    setActiveFlashcardType('custom-transition');
    setSidePaneContent('flashcards');
    onClose();
  };

  const handleHighlight = (color: string) => {
    // TODO: Add highlight annotation to canvas
    console.log('Highlight with color:', color);
    // This will need to interact with AnnotationStore
    onClose();
  };

  const handleComment = () => {
    // TODO: Open comment modal
    const comment = prompt('Enter your comment:');
    if (comment) {
      console.log('Add comment:', comment);
      // This will need to save to AnnotationStore
    }
    onClose();
  };

  const handleTranslation = async () => {
    // TODO: Fetch and show translation
    console.log('Show translation for:', selectedText);
    onClose();
  };

  return (
    <div 
      className="selection-popup" 
      style={{ 
        left: x, 
        top: y,
        position: 'fixed'
      }}
    >
      <button className="popup-item cloze" onClick={handleCloze}>
        <span className="popup-icon">🔲</span>
        Cloze
      </button>
      
      <button className="popup-item search" onClick={handleSearch}>
        <span className="popup-icon">🔍</span>
        Search
      </button>
      
      <button className="popup-item mutashabihat" onClick={handleMutashabihat}>
        <span className="popup-icon">🔁</span>
        Mutashabihat
      </button>
      
      <div className="popup-divider" />
      
      <button className="popup-item mistake" onClick={handleMistake}>
        <span className="popup-icon">🔴</span>
        Mistake
      </button>
      
      <button className="popup-item transition" onClick={handleTransition}>
        <span className="popup-icon">🔵</span>
        Transition
      </button>
      
      <button className="popup-item custom-transition" onClick={handleCustomTransition}>
        <span className="popup-icon">🟣</span>
        Custom Transition
      </button>
      
      <div className="popup-divider" />
      
      <div 
        className="popup-item highlight"
        onMouseEnter={() => setShowHighlightSubmenu(true)}
        onMouseLeave={() => setShowHighlightSubmenu(false)}
      >
        <span className="popup-icon">🖍</span>
        Highlight
        <span className="popup-arrow">▶</span>
        
        {showHighlightSubmenu && (
          <div className="highlight-submenu">
            {HIGHLIGHT_COLORS.map(color => (
              <button
                key={color.value}
                className="submenu-item"
                onClick={() => handleHighlight(color.value)}
              >
                <span 
                  className="color-swatch" 
                  style={{ backgroundColor: color.value }}
                />
                {color.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button className="popup-item comment" onClick={handleComment}>
        <span className="popup-icon">💬</span>
        Comment
      </button>
      
      <button className="popup-item translation" onClick={handleTranslation}>
        <span className="popup-icon">📖</span>
        Translation
      </button>
      
      <div className="popup-divider" />
      
      <button className="popup-item" onClick={onClose}>
        <span className="popup-icon">✕</span>
        Cancel
      </button>
    </div>
  );
};

export default SelectionPopup;
