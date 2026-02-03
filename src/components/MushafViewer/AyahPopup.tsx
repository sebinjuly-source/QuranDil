import { useAppStore } from '../../state/useAppStore';
import './AyahPopup.css';

interface AyahPopupProps {
  x: number;
  y: number;
  surah: number;
  ayah: number;
  page: number;
  onClose: () => void;
}

const AyahPopup: React.FC<AyahPopupProps> = ({ x, y, surah, ayah, page, onClose }) => {
  const setActiveFlashcardType = useAppStore((state) => state.setActiveFlashcardType);
  const setSidePaneContent = useAppStore((state) => state.setSidePaneContent);
  const setAudioAyah = useAppStore((state) => state.setAudioAyah);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);

  const handleCreateTransition = () => {
    setActiveFlashcardType('transition');
    setSidePaneContent('flashcards');
    // TODO: Auto-populate with transition data
    onClose();
  };

  const handlePlayAudio = () => {
    setAudioAyah(surah, ayah, page);
    setAudioPlaying(true);
    onClose();
  };

  const handleShowTranslation = async () => {
    // TODO: Fetch and show translation in a modal
    console.log('Show translation for', surah, ayah);
    onClose();
  };

  return (
    <div 
      className="ayah-popup" 
      style={{ 
        left: x, 
        top: y,
        position: 'fixed'
      }}
    >
      <button className="popup-item transition" onClick={handleCreateTransition}>
        <span className="popup-icon">🔵</span>
        Transition Card
      </button>
      
      <button className="popup-item play" onClick={handlePlayAudio}>
        <span className="popup-icon">▶</span>
        Play Audio
      </button>
      
      <button className="popup-item translation" onClick={handleShowTranslation}>
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

export default AyahPopup;
