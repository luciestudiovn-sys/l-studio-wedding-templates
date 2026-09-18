import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc, X } from 'lucide-react';
import { Template } from '../types/template';
import { getAudioUrl } from '../utils/formatters';

interface GlobalMusicPlayerProps {
  currentTemplate: Template | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClosePlayer: () => void;
}

export const GlobalMusicPlayer: React.FC<GlobalMusicPlayerProps> = ({
  currentTemplate,
  isPlaying,
  onTogglePlay,
  onClosePlayer,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const audioSrc = currentTemplate ? getAudioUrl(currentTemplate.audioKey) : '';

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = audioSrc;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioSrc]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!currentTemplate) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto bg-neutral-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-neutral-700/80 flex items-center justify-between gap-3 animate-fade-in font-sans">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
      />

      {/* Rotating Vinyl Icon */}
      <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'}`}>
        <Disc className="w-6 h-6 text-amber-400" />
      </div>

      {/* Track info */}
      <div className="flex flex-col min-w-0 pr-2">
        <span className="font-semibold text-xs truncate max-w-[140px] sm:max-w-[180px] text-white">
          {currentTemplate.audioTitle || 'Marry You'}
        </span>
        <span className="text-[10px] text-neutral-400 font-mono truncate">
          Đang phát &bull; {currentTemplate.templateName}
        </span>
      </div>

      {/* Waveform bars */}
      {isPlaying && (
        <div className="hidden sm:flex items-center gap-0.5 h-3.5 px-1">
          <span className="wave-bar bg-amber-400" />
          <span className="wave-bar bg-amber-400" />
          <span className="wave-bar bg-amber-400" />
          <span className="wave-bar bg-amber-400" />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="w-7 h-7 rounded-full bg-white text-neutral-900 hover:bg-neutral-200 flex items-center justify-center transition-colors shadow-sm"
          title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={toggleMute}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          title={isMuted ? 'Bật âm' : 'Tắt âm'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onClosePlayer}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          title="Đóng trình phát"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
