import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { AVATAR_LIST } from '@/config/avatars';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatar?: string;
}

export default function AvatarPickerModal({ isOpen, onClose, onSelect, currentAvatar }: AvatarPickerModalProps) {
  const [selected, setSelected] = useState(currentAvatar || AVATAR_LIST[0]);

  useEffect(() => {
    if (isOpen && currentAvatar) {
      setSelected(currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[95vw] max-w-2xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,243,255,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-archivo text-lg font-bold uppercase tracking-wider text-white">
            Choose Your Avatar
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3">
            {AVATAR_LIST.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelected(url)}
                className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  selected === url
                    ? 'border-accent-primary shadow-[0_0_18px_rgba(0,243,255,0.5)] scale-110 z-10'
                    : 'border-white/10 hover:border-white/30 hover:scale-105'
                }`}
              >
                <img
                  src={url}
                  alt="avatar"
                  className="w-full h-full object-cover bg-[#0f0f1a]"
                  loading="lazy"
                />
                {selected === url && (
                  <div className="absolute inset-0 bg-accent-primary/20 flex items-center justify-center">
                    <Check size={18} className="text-accent-primary drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <img
              src={selected}
              alt="selected"
              className="w-10 h-10 rounded-xl border border-accent-primary/50 object-cover"
            />
            <span className="text-xs text-zinc-400">Selected</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-accent-primary hover:bg-accent-primary/90 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
