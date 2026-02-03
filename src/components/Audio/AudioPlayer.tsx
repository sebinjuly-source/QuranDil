import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../state/useAppStore';
import {
  RECITERS,
  PLAYBACK_SPEEDS,
  GAP_DURATIONS,
  getVerseAudioUrl,
  formatTime,
  savePlayerPosition,
  loadPlayerPosition,
  saveMinimizedState,
  loadMinimizedState,
  savePlaybackSpeed,
  loadPlaybackSpeed,
  saveGapDuration,
  loadGapDuration,
  constrainToViewport,
  getDefaultPosition,
  getSurahName,
} from '../../utils/audioUtils';
import { loadWordTimestamps, getTimestampCacheKey } from '../../utils/wordTimestampLoader';
import './AudioPlayer.css';

const PLAYER_WIDTH = 380;
const PLAYER_HEIGHT = 180;
const MINIMIZED_SIZE = 60;

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gapTimeoutRef = useRef<number | null>(null);

  const audio = useAppStore((state) => state.audio);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  const setVolume = useAppStore((state) => state.setVolume);
  const setAudioReciter = useAppStore((state) => state.setAudioReciter);
  const setPlaybackSpeed = useAppStore((state) => state.setPlaybackSpeed);
  const setRepeatMode = useAppStore((state) => state.setRepeatMode);
  const setGapDuration = useAppStore((state) => state.setGapDuration);
  const setPlayerPosition = useAppStore((state) => state.setPlayerPosition);
  const setPlayerMinimized = useAppStore((state) => state.setPlayerMinimized);
  const setAudioLoading = useAppStore((state) => state.setAudioLoading);
  const setAudioAyah = useAppStore((state) => state.setAudioAyah);
  const initHighlightController = useAppStore((state) => state.initHighlightController);
  const setWordTimestamps = useAppStore((state) => state.setWordTimestamps);
  const engine = useAppStore((state) => state.engine);

  // Load saved preferences on mount
  useEffect(() => {
    // Initialize highlight controller
    initHighlightController();
    
    const savedPosition = loadPlayerPosition();
    if (savedPosition) {
      const constrained = constrainToViewport(savedPosition, PLAYER_WIDTH, PLAYER_HEIGHT);
      setPlayerPosition(constrained);
    } else {
      setPlayerPosition(getDefaultPosition(PLAYER_WIDTH, PLAYER_HEIGHT));
    }

    const savedMinimized = loadMinimizedState();
    setPlayerMinimized(savedMinimized);

    const savedSpeed = loadPlaybackSpeed();
    setPlaybackSpeed(savedSpeed);

    const savedGap = loadGapDuration();
    setGapDuration(savedGap);
  }, [setPlayerPosition, setPlayerMinimized, setPlaybackSpeed, setGapDuration, initHighlightController]);

  // Load audio when surah/ayah changes
  useEffect(() => {
    if (!audio.currentSurah || !audio.currentAyah || !audioRef.current) return;

    const audioElement = audioRef.current;
    const audioUrl = getVerseAudioUrl(audio.currentReciter, audio.currentSurah, audio.currentAyah);
    
    setAudioLoading(true);
    audioElement.src = audioUrl;
    audioElement.load();

    // Load word timestamps for highlighting
    loadWordTimestampsForAyah(audio.currentSurah, audio.currentAyah);

    if (audio.isPlaying) {
      audioElement.play().catch((err) => {
        console.error('Playback error:', err);
        setAudioPlaying(false);
        setAudioLoading(false);
      });
    }
  }, [audio.currentSurah, audio.currentAyah, audio.currentReciter, audio.isPlaying, setAudioPlaying, setAudioLoading]);

  // Load word timestamps
  const loadWordTimestampsForAyah = async (surah: number, ayah: number) => {
    const cacheKey = getTimestampCacheKey(surah, ayah);
    
    // Check cache first
    if (audio.wordTimestampsCache.has(cacheKey)) {
      const timestamps = audio.wordTimestampsCache.get(cacheKey)!;
      if (audio.highlightController) {
        audio.highlightController.setWordTimestamps(timestamps);
      }
      return;
    }

    // Load from API
    try {
      const timestamps = await loadWordTimestamps(surah, ayah, engine.quranApi);
      setWordTimestamps(cacheKey, timestamps);
      
      if (audio.highlightController) {
        audio.highlightController.setWordTimestamps(timestamps);
      }
    } catch (error) {
      console.error('Failed to load word timestamps:', error);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      setAudioLoading(false);
    };

    const handleCanPlay = () => {
      setAudioLoading(false);
    };

    const handleEnded = () => {
      setAudioPlaying(false);
      handleVerseEnd();
    };

    const handleError = () => {
      console.error('Audio loading error');
      setAudioLoading(false);
      setAudioPlaying(false);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [setAudioPlaying, setAudioLoading]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audio.volume;
    }
  }, [audio.volume]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audio.playbackSpeed;
    }
  }, [audio.playbackSpeed]);

  // Integrate highlight controller with audio playback
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audio.highlightController) return;

    const handlePlay = () => {
      // TODO: Pass canvas ref directly via props instead of DOM query (more robust)
      // Find highlight canvas in DOM
      const highlightCanvas = document.querySelector('.highlight-overlay') as HTMLCanvasElement;
      if (highlightCanvas && audio.highlightController) {
        audio.highlightController.start(audioElement, highlightCanvas);
      }
    };

    const handlePause = () => {
      if (audio.highlightController) {
        audio.highlightController.stop();
      }
    };

    const handleEnded = () => {
      if (audio.highlightController) {
        audio.highlightController.stop();
      }
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audio.highlightController]);

  // Stop highlight controller on page change
  useEffect(() => {
    return () => {
      if (audio.highlightController) {
        audio.highlightController.stop();
      }
    };
  }, [audio.currentPage, audio.highlightController]);

  const handleVerseEnd = useCallback(() => {
    if (gapTimeoutRef.current) {
      clearTimeout(gapTimeoutRef.current);
    }

    const playNext = () => {
      if (audio.repeatMode === 'verse' && audio.currentSurah && audio.currentAyah) {
        setAudioAyah(audio.currentSurah, audio.currentAyah);
        setAudioPlaying(true);
      } else if (audio.repeatMode === 'page') {
        // TODO: Implement page repeat logic with verse navigation
        console.log('Page repeat not yet implemented');
      }
      // TODO: Add range repeat logic
    };

    if (audio.gapDuration > 0) {
      gapTimeoutRef.current = window.setTimeout(playNext, audio.gapDuration * 1000);
    } else {
      playNext();
    }
  }, [audio.repeatMode, audio.gapDuration, audio.currentSurah, audio.currentAyah, setAudioAyah, setAudioPlaying]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audio.isPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Playback error:', err);
        setAudioPlaying(false);
      });
      setAudioPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
  };

  const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAudioReciter(e.target.value);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    savePlaybackSpeed(speed);
  };

  const handleRepeatModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRepeatMode(e.target.value as 'off' | 'verse' | 'page' | 'range');
  };

  const handleGapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gap = parseInt(e.target.value, 10);
    setGapDuration(gap);
    saveGapDuration(gap);
  };

  const handleMinimize = () => {
    const newMinimized = !audio.playerMinimized;
    setPlayerMinimized(newMinimized);
    saveMinimizedState(newMinimized);
  };

  const handleClose = () => {
    setAudioPlaying(false);
    setAudioAyah(null, null);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      
      const width = audio.playerMinimized ? MINIMIZED_SIZE : PLAYER_WIDTH;
      const height = audio.playerMinimized ? MINIMIZED_SIZE : PLAYER_HEIGHT;
      const constrained = constrainToViewport(newPosition, width, height);
      setPlayerPosition(constrained);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePlayerPosition(audio.playerPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, audio.playerMinimized, audio.playerPosition, setPlayerPosition]);

  // Reposition on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = audio.playerMinimized ? MINIMIZED_SIZE : PLAYER_WIDTH;
      const height = audio.playerMinimized ? MINIMIZED_SIZE : PLAYER_HEIGHT;
      const constrained = constrainToViewport(audio.playerPosition, width, height);
      if (constrained.x !== audio.playerPosition.x || constrained.y !== audio.playerPosition.y) {
        setPlayerPosition(constrained);
        savePlayerPosition(constrained);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [audio.playerPosition, audio.playerMinimized, setPlayerPosition]);

  // Don't show player if no audio is loaded
  if (!audio.currentSurah || !audio.currentAyah) {
    return null;
  }

  const surahName = getSurahName(audio.currentSurah);

  if (audio.playerMinimized) {
    return (
      <div
        ref={playerRef}
        className="audio-player minimized"
        style={{
          left: `${audio.playerPosition.x}px`,
          top: `${audio.playerPosition.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleMinimize}
      >
        <div className="minimized-icon">
          {audio.isPlaying ? '⏸' : '▶'}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={playerRef}
      className="audio-player"
      style={{
        left: `${audio.playerPosition.x}px`,
        top: `${audio.playerPosition.y}px`,
      }}
    >
      <audio ref={audioRef} />
      
      <div className="audio-header" onMouseDown={handleMouseDown}>
        <div className="header-title">
          <span className="header-icon">📖</span>
          <span>Now Playing</span>
        </div>
        <div className="header-buttons">
          <button className="header-btn" onClick={handleMinimize} title="Minimize">
            −
          </button>
          <button className="header-btn" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="audio-body">
        <div className="audio-controls-main">
          <button className="control-btn" onClick={togglePlayPause} disabled={audio.isLoading}>
            {audio.isLoading ? '⏳' : audio.isPlaying ? '⏸' : '▶'}
          </button>

          <div className="seek-container">
            <input
              type="range"
              className="seek-slider"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              disabled={audio.isLoading}
            />
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="volume-control">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              className="volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={audio.volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="audio-controls-secondary">
          <select
            className="control-select reciter-select"
            value={audio.currentReciter}
            onChange={handleReciterChange}
            title="Reciter"
          >
            {RECITERS.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>

          <select
            className="control-select speed-select"
            value={audio.playbackSpeed}
            onChange={handleSpeedChange}
            title="Speed"
          >
            {PLAYBACK_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>

          <select
            className="control-select repeat-select"
            value={audio.repeatMode}
            onChange={handleRepeatModeChange}
            title="Repeat Mode"
          >
            <option value="off">🔁 Off</option>
            <option value="verse">🔁 Verse</option>
            <option value="page">🔁 Page</option>
            <option value="range">🔁 Range</option>
          </select>

          <select
            className="control-select gap-select"
            value={audio.gapDuration}
            onChange={handleGapChange}
            title="Gap Duration"
          >
            {GAP_DURATIONS.map((gap) => (
              <option key={gap} value={gap}>
                Gap {gap}s
              </option>
            ))}
          </select>
        </div>

        <div className="audio-info">
          <div className="audio-info-line">
            <strong>{surahName}</strong> : Ayah {audio.currentAyah}
            {audio.currentPage && ` (Page ${audio.currentPage})`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
