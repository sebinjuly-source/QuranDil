import { useAppStore } from '../../state/useAppStore';
import './SelectionPopup.css';

interface SelectionPopupProps {
  x: number;
  y: number;
  onClose: () => void;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ x, y, onClose }) => {
  const setActiveFlashcardType = useAppStore((state) => state.setActiveFlashcardType);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);

  const handleCreateFlashcard = (type: 'mistake' | 'mutashabihat' | 'transition' | 'custom-transition') => {
    setActiveFlashcardType(type);
    setSidePaneContent('flashcards');
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
      <button className="popup-item mistake" onClick={() => handleCreateFlashcard('mistake')}>
        <span className="popup-icon">🔴</span>
        Mistake Flashcard
      </button>
      
      <button className="popup-item mutashabihat" onClick={() => handleCreateFlashcard('mutashabihat')}>
        <span className="popup-icon">🟡</span>
        Mutashabihat
      </button>
      
      <button className="popup-item transition" onClick={() => handleCreateFlashcard('transition')}>
        <span className="popup-icon">🔵</span>
        Transition
      </button>
      
      <button className="popup-item custom-transition" onClick={() => handleCreateFlashcard('custom-transition')}>
        <span className="popup-icon">🟣</span>
        Custom Transition
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
