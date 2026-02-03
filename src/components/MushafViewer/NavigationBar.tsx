import { useAppStore } from '../../state/useAppStore';
import './NavigationBar.css';

const NavigationBar: React.FC = () => {
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const zoom = useAppStore((state) => state.navigation.zoom);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setZoom = useAppStore((state) => state.setZoom);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(zoom - 0.1);
  };

  return (
    <div className="navigation-bar">
      <div className="nav-section">
        <button
          className="nav-btn"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          title="Previous page"
        >
          ←
        </button>
        
        <div className="page-input-container">
          <input
            type="number"
            className="page-input"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= 604) {
                setCurrentPage(page);
              }
            }}
            min={1}
            max={604}
          />
          <span className="page-label">/ 604</span>
        </div>
        
        <button
          className="nav-btn"
          onClick={goToNextPage}
          disabled={currentPage === 604}
          title="Next page"
        >
          →
        </button>
      </div>

      <div className="nav-section">
        <button className="nav-btn" onClick={handleZoomOut} title="Zoom out">
          −
        </button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="nav-btn" onClick={handleZoomIn} title="Zoom in">
          +
        </button>
      </div>

      <div className="nav-section">
        <button
          className="nav-btn highlight-btn"
          title="Create flashcard"
          onClick={() => useAppStore.getState().setSidePaneContent('flashcards')}
        >
          📝
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
