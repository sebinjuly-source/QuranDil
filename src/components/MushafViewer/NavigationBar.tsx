import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { surahPageRanges, juzPageRanges } from '../../data/quranMetadata';
import './NavigationBar.css';

const NavigationBar: React.FC = () => {
  const currentPage = useAppStore((state) => state.navigation.currentPage);
  const currentSurah = useAppStore((state) => state.navigation.currentSurah);
  const currentJuz = useAppStore((state) => state.navigation.currentJuz);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setCurrentSurah = useAppStore((state) => state.setCurrentSurah);
  const setCurrentJuz = useAppStore((state) => state.setCurrentJuz);

  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showJuzDropdown, setShowJuzDropdown] = useState(false);
  
  const surahDropdownRef = useRef<HTMLDivElement>(null);
  const juzDropdownRef = useRef<HTMLDivElement>(null);

  // Update page input when page changes externally
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (surahDropdownRef.current && !surahDropdownRef.current.contains(event.target as Node)) {
        setShowSurahDropdown(false);
      }
      if (juzDropdownRef.current && !juzDropdownRef.current.contains(event.target as Node)) {
        setShowJuzDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
      setCurrentPage(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSurahSelect = (surah: number) => {
    setCurrentSurah(surah);
    setShowSurahDropdown(false);
  };

  const handleJuzSelect = (juz: number) => {
    setCurrentJuz(juz);
    setShowJuzDropdown(false);
  };

  const currentSurahInfo = surahPageRanges.find(s => s.surah === currentSurah);
  const surahName = currentSurahInfo?.name || 'Unknown';

  return (
    <div className="compact-navigation">
      <button 
        className="nav-arrow" 
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        title="Previous page (←)"
      >
        ←
      </button>

      <div className="nav-section surah-section" ref={surahDropdownRef}>
        <button 
          className="nav-button"
          onClick={() => setShowSurahDropdown(!showSurahDropdown)}
          title="Select Surah"
        >
          {surahName}
        </button>
        {showSurahDropdown && (
          <div className="nav-dropdown surah-dropdown">
            {surahPageRanges.map((surah) => (
              <button
                key={surah.surah}
                className={`dropdown-item ${surah.surah === currentSurah ? 'active' : ''}`}
                onClick={() => handleSurahSelect(surah.surah)}
              >
                {surah.surah}. {surah.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="nav-separator">|</span>

      <div className="nav-section page-section">
        <input
          type="text"
          className="page-input"
          value={pageInput}
          onChange={handlePageInputChange}
          onBlur={handlePageInputBlur}
          onKeyDown={handlePageInputKeyDown}
          title="Page number"
        />
        <span className="page-total">/604</span>
      </div>

      <span className="nav-separator">|</span>

      <div className="nav-section juz-section" ref={juzDropdownRef}>
        <button 
          className="nav-button"
          onClick={() => setShowJuzDropdown(!showJuzDropdown)}
          title="Select Juz"
        >
          Juz {currentJuz}
        </button>
        {showJuzDropdown && (
          <div className="nav-dropdown juz-dropdown">
            {juzPageRanges.map((juz) => (
              <button
                key={juz.juz}
                className={`dropdown-item ${juz.juz === currentJuz ? 'active' : ''}`}
                onClick={() => handleJuzSelect(juz.juz)}
              >
                Juz {juz.juz}
              </button>
            ))}
          </div>
        )}
      </div>

      <button 
        className="nav-arrow" 
        onClick={handleNextPage}
        disabled={currentPage === 604}
        title="Next page (→)"
      >
        →
      </button>
    </div>
  );
};

export default NavigationBar;
