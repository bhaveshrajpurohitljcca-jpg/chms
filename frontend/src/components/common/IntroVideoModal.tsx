import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-black overflow-hidden font-manrope">
      {/* Full-Screen Edge-to-Edge Video */}
      <video
        ref={videoRef}
        src="/new_intro.mp4"
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted={isMuted}
        onEnded={onClose}
      />

      {/* Transparent Bottom Control Bar Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-between gap-4 z-20 pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Subtle Transparent Mute Toggle */}
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-all opacity-60 hover:opacity-100"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-accent-primary" />}
          </button>

          <div>
            <h3 className="font-archivo text-base sm:text-xl font-black text-white uppercase tracking-wider drop-shadow-md">
              Welcome to HexaThon
            </h3>
            <p className="text-[10px] sm:text-xs text-white/50 font-light mt-0.5">
              The Next-Generation College Hackathon Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Skip Button */}
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300"
          >
            Skip
          </button>

          {/* Transparent Enter Console Button */}
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <span>Enter Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
