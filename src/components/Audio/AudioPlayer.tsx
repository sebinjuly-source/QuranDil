import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import './AudioPlayer.css';

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audio = useAppStore((state) => state.audio);
  const setAudioPlaying = useAppStore((state) => state.setAudioPlaying);
  const setVolume = useAppStore((state) => state.setVolume);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    const handleEnded = () => {
      setAudioPlaying(false);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [setAudioPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audio.volume;
    }
  }, [audio.volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audio.isPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't show player if no audio is loaded
  if (!audio.currentSurah || !audio.currentAyah) {
    return null;
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} />
      
      <div className="audio-controls">
        <button className="control-btn" onClick={togglePlayPause}>
          {audio.isPlaying ? '⏸' : '▶'}
        </button>

        <div className="time-display">
          {formatTime(currentTime)}
        </div>

        <input
          type="range"
          className="seek-slider"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
        />

        <div className="time-display">
          {formatTime(duration)}
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

      <div className="audio-info">
        <span className="reciter-name">{audio.currentReciter}</span>
        <span className="ayah-info">
          Surah {audio.currentSurah} : Ayah {audio.currentAyah}
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;
