import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { SearchResult } from '../../engines/SearchEngine';
import './SearchResults.css';

const RESULTS_PER_PAGE = 20;

function SearchResults() {
  const searchResults = useAppStore((state) => state.search.searchResults);
  const searchLoading = useAppStore((state) => state.search.searchLoading);
  const searchQuery = useAppStore((state) => state.search.searchQuery);
  const setSearchResultsPaneOpen = useAppStore((state) => state.setSearchResultsPaneOpen);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setAudioAyah = useAppStore((state) => state.setAudioAyah);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  
  const [paginationPage, setPaginationPage] = useState(1);

  const totalPages = Math.ceil(searchResults.length / RESULTS_PER_PAGE);
  const startIndex = (paginationPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const handleClose = () => {
    setSearchResultsPaneOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    setCurrentPage(result.page, true);
  };

  const handlePlayClick = (e: React.MouseEvent, result: SearchResult) => {
    e.stopPropagation();
    setAudioAyah(result.surah, result.ayah);
    setAudioPlaying(true);
  };

  const highlightText = (text: string, indices: [number, number][]) => {
    if (indices.length === 0) {
      return <span>{text}</span>;
    }

    const parts: React.ReactElement[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end], idx) => {
      if (start > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{text.slice(lastIndex, start)}</span>);
      }
      parts.push(
        <mark key={`mark-${idx}`} className="search-highlight">
          {text.slice(start, end)}
        </mark>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>Search Results</h2>
        <button className="close-btn" onClick={handleClose} title="Close (Esc)">
          ✕
        </button>
      </div>

      {searchLoading ? (
        <div className="search-loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="search-no-results">
          <p>No results found for "{searchQuery}"</p>
          <p className="search-tip">Try different keywords or use Arabic text</p>
        </div>
      ) : (
        <>
          <div className="search-results-count">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>

          <div className="search-results-list">
            {currentResults.map((result, index) => (
              <div
                key={`${result.surah}-${result.ayah}-${index}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-header">
                  <span className="result-surah">
                    {result.surahName} - {result.surahEnglishName}
                  </span>
                  <span className="result-location">
                    Surah {result.surah}:{result.ayah} (Juz {result.juz}, Page {result.page})
                  </span>
                </div>

                <div className="result-text" dir="rtl">
                  {highlightText(result.text, result.highlightIndices)}
                </div>

                {result.translation && (
                  <div className="result-translation">
                    {result.translation}
                  </div>
                )}

                <div className="result-actions">
                  <button
                    className="play-btn"
                    onClick={(e) => handlePlayClick(e, result)}
                    title="Play audio"
                  >
                    ▶ Play
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="search-pagination">
              <button
                className="pagination-btn"
                onClick={() => setPaginationPage(paginationPage - 1)}
                disabled={paginationPage === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {paginationPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPaginationPage(paginationPage + 1)}
                disabled={paginationPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;
