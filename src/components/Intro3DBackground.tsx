import React, { useEffect, useRef, useState } from 'react';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const [rotation, setRotation] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  // Strictly ONLY show once the intro animation is completed
  const isIntroComplete = stage === 'completed';

  // Smooth continuous celestial rotation
  useEffect(() => {
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setRotation((elapsed * 0.018) % 360);

      // Smooth mouse interpolation (LERP)
      setMousePos((prev) => ({
        x: prev.x + (prev.targetX - prev.x) * 0.04,
        y: prev.y + (prev.targetY - prev.y) * 0.04,
        targetX: prev.targetX,
        targetY: prev.targetY,
      }));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Mouse move listener for interactive 3D perspective tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos((prev) => ({ ...prev, targetX: x, targetY: y }));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-1200 ease-out ${
        isIntroComplete
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-98 pointer-events-none invisible'
      }`}
      aria-hidden="true"
    >
      {/* ── 1. AMBIENT CELESTIAL AURORA (Subtle warm gold & sapphire bloom) ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          background: `
            radial-gradient(ellipse 65% 55% at 50% 50%, rgba(223, 183, 74, 0.12) 0%, rgba(0, 75, 121, 0.04) 45%, transparent 75%),
            radial-gradient(circle at 25% 75%, rgba(223, 183, 74, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 75% 25%, rgba(0, 75, 121, 0.05) 0%, transparent 40%)
          `,
        }}
      />

      {/* ── 2. EDITORIAL WATERMARK TYPOGRAPHY (Deep in background) ── */}
      <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16 pointer-events-none opacity-35 overflow-hidden">
        <span
          className="font-serif italic font-light text-[#002137]/[0.032] select-none tracking-tight leading-none"
          style={{
            fontSize: 'clamp(5rem, 18vw, 16rem)',
            transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`,
          }}
        >
          HUMAN
        </span>
        <span
          className="font-serif italic font-light text-[#002137]/[0.032] select-none tracking-tight leading-none"
          style={{
            fontSize: 'clamp(5rem, 18vw, 16rem)',
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
          }}
        >
          REASON
        </span>
      </div>

      {/* ── 3. SACRED GEOMETRIC CELESTIAL ASTROLABE (3D Perspective Tilt) ── */}
      <div
        className="absolute left-1/2 top-1/2 pointer-events-none will-change-transform"
        style={{
          width: 'min(92vw, 760px)',
          height: 'min(92vw, 760px)',
          transform: `
            translate(-50%, -50%)
            perspective(1100px)
            rotateX(${-mousePos.y * 14}deg)
            rotateY(${mousePos.x * 16}deg)
            translateZ(${Math.abs(mousePos.x) * 15}px)
          `,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <svg viewBox="0 0 700 700" className="w-full h-full overflow-visible">
          {/* Outer Hairline Compass Perimeter */}
          <circle
            cx="350"
            cy="350"
            r="330"
            fill="none"
            stroke="#002137"
            strokeWidth="1"
            strokeOpacity="0.08"
          />

          {/* Golden Celestial Degree Track */}
          <circle
            cx="350"
            cy="350"
            r="305"
            fill="none"
            stroke="#DFB74A"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="2 10"
          />

          {/* 1. Primary Golden Celestial Ring (Rotating Clockwise) */}
          <g transform={`rotate(${rotation}, 350, 350)`}>
            <circle
              cx="350"
              cy="350"
              r="265"
              fill="none"
              stroke="#DFB74A"
              strokeWidth="1.5"
              strokeOpacity="0.38"
              strokeDasharray="6 14"
            />
            {/* Primary Golden Photon Bead with Specular Flare */}
            <circle
              cx="615"
              cy="350"
              r="5.5"
              fill="#DFB74A"
              style={{ filter: 'drop-shadow(0 0 10px rgba(223,183,74,0.85))' }}
            />
            {/* Secondary Golden Photon Node */}
            <circle
              cx="85"
              cy="350"
              r="3.5"
              fill="#DFB74A"
              fillOpacity="0.6"
            />
          </g>

          {/* 2. Counter-Rotating Sapphire Harmony Ring */}
          <g transform={`rotate(${-rotation * 0.75}, 350, 350)`}>
            <circle
              cx="350"
              cy="350"
              r="195"
              fill="none"
              stroke="#004B79"
              strokeWidth="1.2"
              strokeOpacity="0.28"
              strokeDasharray="14 10"
            />
            {/* Sapphire Orbiting Photon */}
            <circle
              cx="350"
              cy="155"
              r="4.5"
              fill="#004B79"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,75,121,0.6))' }}
            />
            {/* Opposing Golden Spark */}
            <circle
              cx="350"
              cy="545"
              r="3"
              fill="#DFB74A"
              fillOpacity="0.7"
            />
          </g>

          {/* 3. Inner Precision Golden Tick Track (Around Medallion) */}
          <g transform={`rotate(${rotation * 0.4}, 350, 350)`}>
            <circle
              cx="350"
              cy="350"
              r="135"
              fill="none"
              stroke="#DFB74A"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="3 8"
            />
          </g>

          {/* Precision Cardinal Crosshairs */}
          <line x1="350" y1="30" x2="350" y2="70" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="350" y1="630" x2="350" y2="670" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="30" y1="350" x2="70" y2="350" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="630" y1="350" x2="670" y2="350" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Cardinal Typography Labels */}
          <text x="350" y="24" textAnchor="middle" fill="#002137" fillOpacity="0.32" fontSize="8" fontFamily="monospace" letterSpacing="0.25em" fontWeight="bold">
            COGNITION · 01
          </text>
          <text x="350" y="692" textAnchor="middle" fill="#002137" fillOpacity="0.32" fontSize="8" fontFamily="monospace" letterSpacing="0.25em" fontWeight="bold">
            SYNTHESIS · 02
          </text>
          <text x="24" y="353" textAnchor="middle" fill="#002137" fillOpacity="0.32" fontSize="8" fontFamily="monospace" letterSpacing="0.25em" fontWeight="bold">
            HUMAN
          </text>
          <text x="676" y="353" textAnchor="middle" fill="#002137" fillOpacity="0.32" fontSize="8" fontFamily="monospace" letterSpacing="0.25em" fontWeight="bold">
            AI
          </text>
        </svg>
      </div>

      {/* ── 4. CORNER EDITORIAL REGISTRATION MARKS (Luxury Blueprint Accents) ── */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 font-mono text-[9px] text-[#002137]/35 tracking-[0.25em] uppercase pointer-events-none hidden sm:flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A]" />
        <span>MANTIF · SYNERGY CANVAS</span>
      </div>

      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 font-mono text-[9px] text-[#002137]/35 tracking-[0.25em] uppercase pointer-events-none hidden sm:flex items-center gap-2">
        <span>EST. 2024</span>
        <span className="text-[#002137]/20">/</span>
        <span className="text-[#DFB74A]">EDTECH</span>
      </div>

      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 font-mono text-[9px] text-[#002137]/30 tracking-[0.25em] uppercase pointer-events-none hidden sm:block">
        [ SYSTEM · 3D PERSPECTIVE ]
      </div>

      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 font-mono text-[9px] text-[#002137]/30 tracking-[0.25em] uppercase pointer-events-none hidden sm:block">
        INTUITION × REASON
      </div>
    </div>
  );
};
