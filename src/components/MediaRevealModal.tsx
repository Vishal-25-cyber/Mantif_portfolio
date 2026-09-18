import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mediaType: 'image' | 'video' | 'placeholder';
  src: string;
  poster?: string;
  caption?: string;
}

export const MediaRevealModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  mediaType,
  src,
  poster,
  caption,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-8 bg-[#002137]/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-2xl border border-[#FAF8F5]/20 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#002137]/10 bg-[#FAF8F5]">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#002137]">{title}</h3>
            {subtitle && <p className="font-mono text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            onMouseEnter={() => setCursorMode('hover')}
            onMouseLeave={() => setCursorMode('default')}
            className="p-2 rounded-full border border-[#002137]/15 hover:bg-[#002137]/10 text-[#002137] transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Content */}
        <div className="relative aspect-video w-full bg-[#001726] flex items-center justify-center overflow-hidden">
          {mediaType === 'video' ? (
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : mediaType === 'image' && src ? (
            <img src={src} alt={title} className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-[#FAF8F5]">
              <div className="w-16 h-16 rounded-full border border-[#DFB74A]/40 flex items-center justify-center mb-4 bg-[#002137]">
                <span className="font-serif text-2xl text-[#DFB74A]">M</span>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#DFB74A] mb-1">
                ARCHIVE IN TRANSIT
              </p>
              <h4 className="font-serif text-2xl font-bold text-[#FAF8F5]">MEDIA TO BE ADDED</h4>
              <p className="font-sans text-xs text-slate-400 max-w-md mt-2">
                High-resolution authentic documentation from the MANTIF archive is being prepared for this milestone.
              </p>
            </div>
          )}
        </div>

        {/* Footer Caption */}
        {caption && (
          <div className="px-6 py-3 bg-[#F3EFE6] border-t border-[#002137]/10">
            <p className="font-sans text-xs text-[#334155] leading-relaxed italic">{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};
