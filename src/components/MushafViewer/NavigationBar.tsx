import { useAppStore } from '../../state/useAppStore';
import './NavigationBar.css';

const ZoomControl: React.FC = () => {
  const zoom = useAppStore((state) => state.navigation.zoom);
  const setZoom = useAppStore((state) => state.setZoom);

  const handleZoomIn = () => {
    setZoom(zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(zoom - 0.1);
  };

  const handleReset = () => {
    setZoom(1);
  };

  return (
    <div className="zoom-control">
      <button className="zoom-btn" onClick={handleZoomOut} title="Zoom out (-)">
        −
      </button>
      <button className="zoom-reset" onClick={handleReset} title="Reset zoom (100%)">
        {Math.round(zoom * 100)}%
      </button>
      <button className="zoom-btn" onClick={handleZoomIn} title="Zoom in (+)">
        +
      </button>
    </div>
  );
};

export default ZoomControl;
