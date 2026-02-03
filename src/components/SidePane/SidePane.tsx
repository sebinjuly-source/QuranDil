import { useAppStore } from '../../state/useAppStore';
import './SidePane.css';

const SidePane: React.FC = () => {
  const sidePaneContent = useAppStore((state) => state.sidePaneContent);
  const setSidePaneOpen = useAppStore((state) => state.setSidePaneOpen);
  const activeFlashcardType = useAppStore((state) => state.flashcards.activeType);

  const renderContent = () => {
    switch (sidePaneContent) {
      case 'flashcards':
        return (
          <div className="sidepane-section">
            <h2>Create Flashcard</h2>
            {activeFlashcardType && (
              <div className={`flashcard-creator ${activeFlashcardType}`}>
                <div className="flashcard-type-badge">
                  {activeFlashcardType === 'mistake' && '🔴 Mistake'}
                  {activeFlashcardType === 'mutashabihat' && '🟡 Mutashabihat'}
                  {activeFlashcardType === 'transition' && '🔵 Transition'}
                  {activeFlashcardType === 'custom-transition' && '🟣 Custom Transition'}
                </div>
                
                <div className="flashcard-preview">
                  <p>Flashcard preview will appear here</p>
                  <p className="help-text">
                    Click and drag on the Mushaf to select text for this flashcard
                  </p>
                </div>

                <div className="flashcard-actions">
                  <button className="btn btn-primary">Save Flashcard</button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => useAppStore.getState().setActiveFlashcardType(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flashcard-list">
              <h3>Recent Flashcards</h3>
              <p className="empty-state">No flashcards yet. Create your first one!</p>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="sidepane-section">
            <h2>Search Quran</h2>
            <input
              type="text"
              className="search-input"
              placeholder="Search in Arabic or English..."
            />
            <div className="search-results">
              <p className="empty-state">Enter a search query to find verses</p>
            </div>
          </div>
        );
      
      case 'mutashabihat':
        return (
          <div className="sidepane-section">
            <h2>Mutashabihat Comparison</h2>
            <p className="help-text">
              Mutashabihat are similar verses that are easy to confuse.
              Create flashcards to help distinguish between them.
            </p>
            <div className="mutashabihat-list">
              <p className="empty-state">No mutashabihat pairs created yet</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="sidepane-section">
            <h2>Welcome to QuranDil</h2>
            <p>Select an option from the menu to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="sidepane">
      <div className="sidepane-header">
        <button
          className="close-btn"
          onClick={() => setSidePaneOpen(false)}
          title="Close side pane"
        >
          ✕
        </button>
      </div>
      
      <div className="sidepane-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default SidePane;
