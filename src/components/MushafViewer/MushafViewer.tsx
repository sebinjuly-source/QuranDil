import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import NavigationBar from './NavigationBar';
import SelectionPopup from './SelectionPopup';
import './MushafViewer.css';

interface MushafViewerProps {}

interface PageData {
  verses: Array<{
    surah: number;
    ayah: number;
    text: string;
    line: number;
  }>;
}

const MushafViewer: React.FC<MushafViewerProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const zoom = useAppStore((state) => state.navigation.zoom);
  const engine = useAppStore((state) => state.engine);
  const highlightController = useAppStore((state) => state.audio.highlightController);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (pageData && canvasRef.current) {
      renderPage();
      
      // Sync highlight canvas dimensions with main canvas
      if (highlightCanvasRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const highlightCanvas = highlightCanvasRef.current;
        highlightCanvas.width = canvas.width;
        highlightCanvas.height = canvas.height;
        highlightCanvas.style.width = canvas.style.width;
        highlightCanvas.style.height = canvas.style.height;
        
        // Update highlight controller transform if active
        if (highlightController) {
          highlightController.setTransform(zoom, 0, 0);
        }
      }
    }
  }, [pageData, zoom, highlightController]);

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      const verses = await engine.quranApi.getPageVerses(page);
      
      // Transform verses to match our component's expected format
      const linesPerPage = 15;
      const versesWithLines = verses.map((verse, index) => {
        // Parse surah and ayah from verse_key (e.g., "1:1" -> surah 1, ayah 1)
        const [surah, ayah] = verse.verse_key.split(':').map(Number);
        return {
          surah,
          ayah,
          text: verse.text_uthmani || verse.text_imlaei || '', // Fallback to empty string
          line: Math.floor((index / verses.length) * linesPerPage) + 1,
        };
      });
      
      setPageData({ verses: versesWithLines });
    } catch (error) {
      console.error('Error loading page:', error);
      // Set empty data on error to prevent "undefined" display
      setPageData({ verses: [] });
    } finally {
      setLoading(false);
    }
  };

  const renderPage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = 600;
    const height = 800;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#faf9f7';
    ctx.fillRect(0, 0, width, height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw border
    ctx.strokeStyle = '#c19a6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Render verses by line
    const lineHeight = 45;
    const startY = 80;
    const startX = width - 80; // RTL - start from right

    // Use the Google Fonts we added
    ctx.font = '22px "Scheherazade New", "Amiri", "Traditional Arabic", serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';

    const lineGroups: Map<number, typeof pageData.verses> = new Map();
    pageData.verses.forEach(verse => {
      if (!lineGroups.has(verse.line)) {
        lineGroups.set(verse.line, []);
      }
      lineGroups.get(verse.line)!.push(verse);
    });

    lineGroups.forEach((verses, lineNum) => {
      const y = startY + (lineNum - 1) * lineHeight;
      let x = startX;
      
      verses.forEach((verse, idx) => {
        // Skip if no text
        if (!verse.text) return;
        
        // Draw ayah number in circle
        if (idx > 0) {
          ctx.fillText(' ۝ ', x, y);
          x -= 20;
        }
        
        // Draw verse text with ayah number
        const ayahLabel = `﴿${verse.ayah}﴾`;
        ctx.fillText(verse.text + ' ' + ayahLabel, x, y);
        
        // Measure text for next position
        const metrics = ctx.measureText(verse.text + ' ' + ayahLabel);
        x -= metrics.width + 10;
      });
    });

    // Draw page number at bottom center
    ctx.textAlign = 'center';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`${currentPage}`, width / 2, height - 15);

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Show selection popup
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setSelectedText('Sample selected text'); // TODO: Get actual selected text
    setShowPopup(true);
  };

  return (
    <div className="mushaf-viewer">
      <NavigationBar />
      
      <div className="canvas-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading page {currentPage}...</p>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="mushaf-canvas"
          onClick={handleCanvasClick}
        />
        
        {/* Highlight overlay canvas */}
        <canvas
          ref={highlightCanvasRef}
          className="mushaf-canvas highlight-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {showPopup && (
        <SelectionPopup
          x={popupPosition.x}
          y={popupPosition.y}
          selectedText={selectedText}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default MushafViewer;
