import React, { useRef, useState } from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

export interface ServiceCardData {
  id: string;
  title: string;
  category: string;
  highlight: string;
  description: string;
  features: string[];
  quote?: string;
  badge: string;
  linkText: string;
  contact: string;
  originImage?: string;
}

interface ServiceCardProps {
  card: ServiceCardData;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ card }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((y - cy) / cy) * -7,
      y: ((x - cx) / cx) * 7,
    });
    setCursorPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setCursorMode('hover');
    soundManager.playHoverTick();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setCursorPos({ x: 50, y: 50 });
    setCursorMode('default');
  };

  // Unique accent colour per card
  const accent = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#64748B';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl p-[1.5px] will-change-transform cursor-pointer h-full flex flex-col"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? '-10px' : '0'})`,
        transition: isHovered ? 'transform 0.08s linear' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        background: isHovered
          ? `conic-gradient(from ${Math.atan2(tilt.x, tilt.y) * (180 / Math.PI) + 90}deg, transparent, ${accent} 60deg, transparent 120deg, transparent)`
          : `linear-gradient(135deg, ${accent}30, transparent)`,
      }}
    >
      {/* Card inner panel */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
        style={{ background: '#FAF8F5' }}
      >
        {/* Moving spotlight glow (follows cursor) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-3xl"
          style={{
            background: `radial-gradient(circle 200px at ${cursorPos.x}% ${cursorPos.y}%, ${accent}18 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Top-right ambient glow orb */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-600"
          style={{ background: accent + '20', opacity: isHovered ? 1 : 0 }}
        />

        {/* Background subtle grain */}
        <div className="absolute inset-0 bg-grain opacity-50 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-7 sm:p-8 flex flex-col flex-1">

          {/* Top row: id + badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono text-2xl font-bold leading-none"
                style={{ color: accent }}
              >
                {card.id}
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold tracking-[0.22em] uppercase text-[#64748B]">
                  {card.category}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase border"
              style={{
                color: accent,
                borderColor: accent + '40',
                background: accent + '0D',
              }}>
              {card.badge}
            </span>
          </div>

          {/* Heading */}
          <h3
            className="font-serif text-2xl sm:text-3xl font-bold text-[#002137] transition-all duration-400 leading-snug"
            style={{ transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }}
          >
            {card.title}
          </h3>

          {/* Thin accent underline on hover */}
          <div
            className="mt-2 h-[2px] rounded-full transition-all duration-500"
            style={{
              width: isHovered ? '60%' : '24px',
              background: `linear-gradient(to right, ${accent}, transparent)`,
            }}
          />

          <p className="font-sans text-xs sm:text-sm text-[#475569] mt-4 leading-relaxed">
            {card.description}
          </p>

          {/* Optional italic quote */}
          {card.quote && (
            <div
              className="mt-4 px-4 py-3 rounded-xl border-l-2 text-xs sm:text-sm font-serif italic text-[#002137] leading-relaxed"
              style={{
                borderColor: accent,
                background: accent + '0A',
              }}
            >
              {card.quote}
            </div>
          )}

          {/* Feature list */}
          <ul className="mt-5 space-y-2 flex-1">
            {card.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#334155]">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0"
                  style={{ background: accent }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Card 01 — origin photo */}
          {card.id === '01' && (
            <div className="mt-5 pt-4 border-t border-[#002137]/8 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#002137]/10">
                <img
                  src="/images/gallery_1.jpg"
                  alt="Tutoring Hub Origin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[8px] uppercase tracking-wider font-bold"
                  style={{ color: accent }}>
                  ORIGIN MILESTONE
                </span>
                <p className="font-sans text-[11px] text-[#64748B] mt-0.5">
                  From physical classrooms in 2024 to digital today.
                </p>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-6 pt-4 border-t border-[#002137]/8 flex items-center justify-between">
            <a
              href="https://mantif.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#64748B] hover:text-[#004B79] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" style={{ color: accent }} />
              <span>mantif.com</span>
            </a>

            <a
              href="https://mantif.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300"
              style={{
                borderColor: isHovered ? accent : '#002137' + '20',
                background: isHovered ? accent : 'transparent',
                color: isHovered ? '#FAF8F5' : '#002137',
                transform: isHovered ? 'rotate(45deg) scale(1.1)' : 'none',
              }}
              aria-label="Visit mantif.com"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
