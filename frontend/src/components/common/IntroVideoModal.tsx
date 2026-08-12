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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in font-manrope">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 via-transparent to-accent-secondary/20 pointer-events-none blur-3xl opacity-50" />

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl">
          <img
            src="/hexathon_logo.jpeg"
            alt="Hexathon Logo"
            className="w-7 h-7 object-contain mix-blend-screen drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] filter brightness-110"
          />
          <span className="font-archivo text-sm font-black text-white uppercase tracking-wider">
            Hexathon Intro
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2.5 px-4 rounded-2xl bg-black/60 border border-white/10 hover:border-accent-primary text-white/70 hover:text-white transition-all backdrop-blur-xl flex items-center gap-2 text-xs font-semibold"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={15} className="text-white/50" /> : <Volume2 size={15} className="text-accent-primary" />}
            <span>{isMuted ? 'Unmute' : 'Sound On'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-accent-primary text-black font-extrabold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all flex items-center gap-2"
          >
            <span>Skip to Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-[0_0_80px_rgba(0,243,255,0.15)] mx-4 z-10">
        <video
          ref={videoRef}
          src="/hexathon_intro.mp4"
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={onClose}
        />

        {/* Bottom Overlay Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between gap-4 pointer-events-auto">
          <div>
            <h3 className="font-archivo text-lg md:text-xl font-black text-white uppercase tracking-wider drop-shadow-md">
              Welcome to Hexathon
            </h3>
            <p className="text-xs text-white/60 font-light mt-0.5">
              The Next-Generation College Hackathon Platform
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Enter Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
