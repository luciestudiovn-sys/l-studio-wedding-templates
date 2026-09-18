import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc } from 'lucide-react';
import { getAudioUrl } from '../utils/formatters';

interface AudioPlayerPillProps {
  audioKey?: string;
  audioTitle?: string;
  autoPlay?: boolean;
}

export const AudioPlayerPill: React.FC<AudioPlayerPillProps> = ({
  audioKey,
  audioTitle = 'Marry You',
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = getAudioUrl(audioKey);

  useEffect(() => {
    setIsPlaying(false);
    setLoadError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = audioSrc;
      if (autoPlay) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [audioSrc, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setLoadError(true);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2.5 bg-neutral-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-full shadow-lg border border-neutral-700/60 text-xs">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        onError={() => setLoadError(true)}
      />

      {/* Vinyl Icon */}
      <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'}`}>
        <Disc className="w-4 h-4 text-neutral-300" />
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-5 h-5 rounded-full bg-white text-neutral-900 hover:bg-neutral-200 flex items-center justify-center transition-colors"
        title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
      >
        {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
      </button>

      {/* Track Title */}
      <div className="flex flex-col min-w-0 pr-1">
        <span className="font-medium text-[11px] truncate max-w-[120px] text-neutral-100">
          {audioTitle}
        </span>
        <span className="text-[9px] text-neutral-400">Nhạc nền cưới</span>
      </div>

      {/* Waveform Bars */}
      {isPlaying && (
        <div className="flex items-center gap-0.5 h-3.5 px-1">
          <span className="wave-bar" />
          <span className="wave-bar" />
          <span className="wave-bar" />
          <span className="wave-bar" />
          <span className="wave-bar" />
        </div>
      )}

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="text-neutral-400 hover:text-white transition-colors ml-0.5"
        title={isMuted ? 'Bật âm' : 'Tắt âm'}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {loadError && (
        <span className="text-[10px] text-amber-300">Không tải được nhạc</span>
      )}
    </div>
  );
};
