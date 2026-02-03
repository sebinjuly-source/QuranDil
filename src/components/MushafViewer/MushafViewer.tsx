import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import SelectionPopup from './SelectionPopup';
import NavigationBar from './NavigationBar';
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
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageData2, setPageData2] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const isDualPage = useAppStore((state) => state.navigation.isDualPage);
  const hifzMode = useAppStore((state) => state.navigation.hifzMode);
  const zoom = useAppStore((state) => state.navigation.zoom);
  const engine = useAppStore((state) => state.engine);
  const highlightController = useAppStore((state) => state.audio.highlightController);

  useEffect(() => {
    loadPage(currentPage);
    if (isDualPage && currentPage < 604) {
      loadPage2(currentPage + 1);
    }
  }, [currentPage, isDualPage]);

  useEffect(() => {
    if (pageData && canvasRef.current) {
      renderPage(canvasRef.current, pageData, currentPage);
      
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
    
    if (isDualPage && pageData2 && canvas2Ref.current) {
      renderPage(canvas2Ref.current, pageData2, currentPage + 1);
    }
  }, [pageData, pageData2, isDualPage, zoom, highlightController, currentPage, hifzMode]);

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      // Use MushafRebuilder for accurate line-based layout
      const mushafPage = await engine.mushafRebuilder.rebuildPage(page);
      
      // Debug logging to see what the API returns
      console.log('API Response:', mushafPage);
      console.log('First line words:', mushafPage.lines[0]?.words);
      
      // Transform to component format with proper line numbers from word data
      const versesWithLines = mushafPage.lines.map(line => {
        // Get the text for this line by combining all words with null safety
        const lineText = line.words
          .map(w => w.text_uthmani || w.text_imlaei || '')
          .filter(t => t)
          .join(' ');
        
        // Get the first verse key for this line for reference
        const verseKey = line.verse_keys[0] || '1:1';
        const [surah, ayah] = verseKey.split(':').map(Number);
        
        return {
          surah,
          ayah,
          text: lineText,
          line: line.line_number,
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

  const loadPage2 = async (page: number) => {
    if (page > 604) {
      setPageData2(null);
      return;
    }
    
    try {
      const mushafPage = await engine.mushafRebuilder.rebuildPage(page);
      const versesWithLines = mushafPage.lines.map(line => {
        const lineText = line.words
          .map(w => w.text_uthmani || w.text_imlaei || '')
          .filter(t => t)
          .join(' ');
        
        const verseKey = line.verse_keys[0] || '1:1';
        const [surah, ayah] = verseKey.split(':').map(Number);
        
        return {
          surah,
          ayah,
          text: lineText,
          line: line.line_number,
        };
      });
      
      setPageData2({ verses: versesWithLines });
    } catch (error) {
      console.error('Error loading page 2:', error);
      setPageData2(null);
    }
  };

  const renderPage = (canvas: HTMLCanvasElement, data: PageData, pageNum: number) => {

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (standard Mushaf proportions)
    const width = 600;
    const height = 800;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas with Mushaf-like background
    ctx.fillStyle = '#faf9f7';
    ctx.fillRect(0, 0, width, height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw decorative border (golden for traditional Mushaf look)
    const margin = 40;
    const innerMargin = 10;
    
    // Outer border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
    
    // Inner border
    ctx.strokeStyle = '#c19a6b';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + innerMargin, margin + innerMargin, 
                   width - 2 * (margin + innerMargin), height - 2 * (margin + innerMargin));

    // Calculate text area
    const textMargin = margin + innerMargin + 10;
    const textHeight = height - 2 * textMargin;
    const lineHeight = textHeight / 15; // 15 lines per page
    const startY = textMargin + 25; // Offset from top
    const startX = width - textMargin - 5; // RTL - start from right

    // Configure Arabic text rendering
    ctx.font = '24px "Scheherazade New", "Amiri", "Traditional Arabic", serif';
    ctx.fillStyle = hifzMode ? 'rgba(26, 26, 26, 0.1)' : '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';

    // Group verses by line
    const lineGroups: Map<number, typeof data.verses> = new Map();
    data.verses.forEach(verse => {
      if (!lineGroups.has(verse.line)) {
        lineGroups.set(verse.line, []);
      }
      lineGroups.get(verse.line)!.push(verse);
    });

    // Sort lines
    const sortedLines = Array.from(lineGroups.keys()).sort((a, b) => a - b);

    // Render each line
    sortedLines.forEach((lineNum) => {
      const verses = lineGroups.get(lineNum)!;
      const y = startY + (lineNum - 1) * lineHeight;
      
      // Combine all text for this line
      const lineText = verses.map(v => v.text).join(' ');
      
      // Draw the line text (blurred in hifz mode)
      if (lineText) {
        if (hifzMode) {
          // Add blur effect for hifz mode
          ctx.filter = 'blur(8px)';
          ctx.fillText(lineText, startX, y);
          ctx.filter = 'none';
        } else {
          ctx.fillText(lineText, startX, y);
        }
      }
    });

    // Draw page number at bottom center with ornamental styling
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Amiri", serif';
    ctx.fillStyle = '#8b6914';
    
    // Draw ornamental brackets around page number
    const pageNumY = height - margin / 2;
    ctx.fillText(`﴾ ${pageNum} ﴿`, width / 2, pageNumY);

    ctx.restore();
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Show selection popup on double-click
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setSelectedText('Sample selected text'); // TODO: Get actual selected text
    setShowPopup(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Check if there's a text selection
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      // Position popup near the selection
      setPopupPosition({ x: e.clientX, y: e.clientY });
      setSelectedText(selectedText);
      setShowPopup(true);
    }
  };

  return (
    <div className="mushaf-viewer">
      <NavigationBar />
      
      <div className={`canvas-container ${isDualPage ? 'dual-page' : ''}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading page {currentPage}...</p>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="mushaf-canvas"
          onDoubleClick={handleCanvasDoubleClick}
          onMouseUp={handleMouseUp}
        />
        
        {isDualPage && currentPage < 604 && (
          <canvas
            ref={canvas2Ref}
            className="mushaf-canvas mushaf-canvas-right"
            onDoubleClick={handleCanvasDoubleClick}
            onMouseUp={handleMouseUp}
          />
        )}
        
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
