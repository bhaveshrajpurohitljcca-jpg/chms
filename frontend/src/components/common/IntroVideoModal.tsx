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
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-black flex items-center justify-center overflow-hidden animate-fade-in font-manrope">
      {/* Full-screen Ambient Neon Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/25 via-transparent to-accent-secondary/25 pointer-events-none blur-3xl opacity-60" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-black/70 border border-white/15 px-3.5 py-2 rounded-2xl backdrop-blur-xl">
          <img
            src="/real_logo.jpeg"
            alt="Hexathon Logo"
            className="w-7 h-7 object-contain mix-blend-screen drop-shadow-[0_0_12px_rgba(0,243,255,0.9)] filter brightness-110 contrast-125"
          />
          <span className="font-archivo text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            Hexathon Intro
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleMute}
            className="p-2 px-3.5 rounded-2xl bg-black/70 border border-white/15 hover:border-accent-primary text-white/80 hover:text-white transition-all backdrop-blur-xl flex items-center gap-2 text-xs font-semibold"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={15} className="text-white/50" /> : <Volume2 size={15} className="text-accent-primary" />}
            <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Sound On'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-2xl bg-accent-primary text-black font-extrabold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all flex items-center gap-2"
          >
            <span>Skip to Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 16:9 Aspect Ratio Video Container Covering Full Screen */}
      <div className="relative w-full h-full max-w-[177.77vh] max-h-[56.25vw] aspect-[16/9] bg-black flex items-center justify-center overflow-hidden z-10">
        <video
          ref={videoRef}
          src="/hexathon_intro.mp4"
          className="w-full h-full aspect-[16/9] object-cover"
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={onClose}
        />

        {/* Bottom Overlay Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-center justify-between gap-4 pointer-events-auto">
          <div>
            <h3 className="font-archivo text-base sm:text-xl font-black text-white uppercase tracking-wider drop-shadow-md">
              Welcome to Hexathon
            </h3>
            <p className="text-[10px] sm:text-xs text-white/60 font-light mt-0.5">
              The Next-Generation College Hackathon Platform
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Enter Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
