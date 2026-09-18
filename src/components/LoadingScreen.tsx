import React, { useEffect, useState, useRef } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  /* Continuous subtle geometric rotation */
  useEffect(() => {
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      setRotation(((ts - startRef.current) * 0.02) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Smooth progressive timeline (reaches 100% in ~2.5s) */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = prev < 35 ? 2.4 : prev < 75 ? 3.0 : 1.8;
        return Math.min(prev + step, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  /* Auto transition on 100% */
  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setExiting(true), 350);
      const t2 = setTimeout(() => onComplete(), 950);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [progress, onComplete]);

  /* Mouse parallax for organic depth */
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleSkip = () => {
    setExiting(true);
    setTimeout(onComplete, 350);
  };

  // Curated thoughts reflecting the Human × AI synergy
  const getPhilosophy = () => {
    if (progress < 25) return 'ORIGIN · THE HUMAN SPARK OF CURIOSITY';
    if (progress < 55) return 'SYNAPSE · ARCHITECTING ALGORITHMIC THOUGHT';
    if (progress < 85) return 'SYMBIOSIS · WHERE INTUITION MEETS SCALE';
    return 'GENESIS · THE MANTIF CANVAS IS READY';
  };

  return (
    <div
      onClick={handleSkip}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[10000] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden cursor-pointer"
      style={{
        backgroundColor: '#FAF8F5',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.06)' : 'scale(1)',
        filter: exiting ? 'blur(12px)' : 'blur(0px)',
        transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1), transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), filter 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* ── 1. LIVING ARTISTIC ATMOSPHERE ── */}
      {/* Soft golden-amber & celestial azure light bloom */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          background: `
            radial-gradient(ellipse 65% 55% at 50% 48%, rgba(223, 183, 74, 0.18) 0%, rgba(0, 75, 121, 0.05) 50%, transparent 75%),
            radial-gradient(circle at 20% 80%, rgba(223, 183, 74, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(0, 75, 121, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Ghost Watermark Editorial Typography in Background */}
      <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12 pointer-events-none opacity-40 overflow-hidden">
        <span
          className="font-serif italic font-light text-[#002137]/[0.035] select-none tracking-tight leading-none"
          style={{ fontSize: 'clamp(5rem, 16vw, 15rem)' }}
        >
          HUMAN
        </span>
        <span
          className="font-serif italic font-light text-[#002137]/[0.035] select-none tracking-tight leading-none"
          style={{ fontSize: 'clamp(5rem, 16vw, 15rem)' }}
        >
          INTELLIGENCE
        </span>
      </div>

      {/* ── 2. SACRED GEOMETRY ORBITAL RINGS (SVG) ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          width: 'min(90vw, 680px)',
          height: 'min(90vw, 680px)',
          transform: `translate(-50%, -50%) translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
        }}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full overflow-visible">
          {/* Outer hairline circle */}
          <circle
            cx="300"
            cy="300"
            r="280"
            fill="none"
            stroke="#002137"
            strokeWidth="1"
            strokeOpacity="0.06"
          />

          {/* Rotating celestial ring with golden degree ticks */}
          <g transform={`rotate(${rotation}, 300, 300)`}>
            <circle
              cx="300"
              cy="300"
              r="230"
              fill="none"
              stroke="#DFB74A"
              strokeWidth="1.5"
              strokeOpacity="0.35"
              strokeDasharray="4 16"
            />
            {/* Primary Golden Photon node */}
            <circle cx="530" cy="300" r="5" fill="#DFB74A" filter="drop-shadow(0 0 8px #DFB74A)" />
            {/* Secondary Navy Node */}
            <circle cx="70" cy="300" r="3.5" fill="#002137" fillOpacity="0.7" />
          </g>

          {/* Counter-rotating dashed harmony ring */}
          <g transform={`rotate(${-rotation * 0.75}, 300, 300)`}>
            <circle
              cx="300"
              cy="300"
              r="170"
              fill="none"
              stroke="#004B79"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="12 12"
            />
            <circle cx="300" cy="130" r="4" fill="#004B79" filter="drop-shadow(0 0 6px rgba(0,75,121,0.5))" />
            <circle cx="300" cy="470" r="2.5" fill="#DFB74A" />
          </g>

          {/* Precision Cardinal Crosshairs */}
          <line x1="300" y1="40" x2="300" y2="70" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="300" y1="530" x2="300" y2="560" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="40" y1="300" x2="70" y2="300" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="530" y1="300" x2="560" y2="300" stroke="#DFB74A" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Cardinal Labels */}
          <text x="300" y="32" textAnchor="middle" fill="#002137" fillOpacity="0.3" fontSize="8" fontFamily="monospace" letterSpacing="0.2em">COGNITION</text>
          <text x="300" y="585" textAnchor="middle" fill="#002137" fillOpacity="0.3" fontSize="8" fontFamily="monospace" letterSpacing="0.2em">SYNTHESIS</text>
          <text x="25" y="303" textAnchor="middle" fill="#002137" fillOpacity="0.3" fontSize="8" fontFamily="monospace" letterSpacing="0.2em">HUMAN</text>
          <text x="575" y="303" textAnchor="middle" fill="#002137" fillOpacity="0.3" fontSize="8" fontFamily="monospace" letterSpacing="0.2em">AI</text>
        </svg>
      </div>

      {/* ── 3. TOP EDITORIAL HEADER ── */}
      <div className="relative z-10 w-full flex items-center justify-between text-[#002137]/60 font-mono text-[10px] sm:text-xs tracking-[0.28em] uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_8px_#DFB74A]" />
          <span className="font-semibold text-[#002137]">MANTIF</span>
          <span className="text-[#002137]/30">/</span>
          <span>EST. 2024</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] tracking-[0.3em] text-[#002137]/45">
          <span>HUMAN × ARTIFICIAL INTELLIGENCE</span>
          <span>✦</span>
          <span>EDTECH ECOSYSTEM</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#002137]">
          <span className="font-light text-[#004B79]">{Math.round(progress).toString().padStart(3, '0')}</span>
          <span className="text-[#DFB74A]">/ 100</span>
        </div>
      </div>

      {/* ── 4. CENTERPIECE — SCULPTURAL MEDALLION & KINETIC TYPOGRAPHY ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-xl mx-auto text-center px-4 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      >
        {/* Floating Sculptural Medallion */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Ambient Golden Halo Ripple */}
          <div
            className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(223, 183, 74, 0.35) 0%, rgba(223, 183, 74, 0.08) 55%, transparent 75%)',
              filter: 'blur(20px)',
            }}
          />

          {/* The Pristine Ceramic Glass Medallion */}
          <div
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center bg-white transition-transform hover:scale-105"
            style={{
              boxShadow: `
                0 25px 60px -15px rgba(0, 33, 55, 0.14),
                0 10px 25px -5px rgba(223, 183, 74, 0.25),
                0 0 0 1px rgba(223, 183, 74, 0.35),
                inset 0 2px 6px rgba(255, 255, 255, 1)
              `,
            }}
          >
            {/* The Crisp MANTIF Brain × AI Icon */}
            <img
              src="/images/mantif_icon.png"
              alt="MANTIF Icon"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain transition-transform"
              style={{
                filter: 'drop-shadow(0 6px 12px rgba(0, 33, 55, 0.12))',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://mantif.com/images/mantif_icon.png';
              }}
            />
          </div>
        </div>

        {/* Brand Monogram: M Λ N T I F */}
        <div className="mb-2 select-none">
          <div className="flex items-baseline justify-center tracking-[0.18em]">
            <span className="font-serif font-light text-5xl sm:text-7xl text-[#002137]">
              M
            </span>
            <span
              className="font-serif font-semibold text-5xl sm:text-7xl text-[#C99A2C] mx-1"
              style={{
                textShadow: '0 0 24px rgba(201, 154, 44, 0.4)',
              }}
            >
              Λ
            </span>
            <span className="font-serif font-light text-5xl sm:text-7xl text-[#002137]">
              NTIF
            </span>
          </div>
        </div>

        {/* Poetic Sub-Mark */}
        <div className="flex items-center justify-center gap-3 text-[#004B79] font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase mb-8">
          <span>HUMAN INTUITION</span>
          <span className="text-[#DFB74A]">×</span>
          <span>MACHINE REASON</span>
        </div>

        {/* ── 5. LIQUID GOLDEN CONTINUUM (PROGRESS METER) ── */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-3">
          {/* Hairline Golden Laser Track */}
          <div className="relative w-full h-[2px] bg-[#002137]/10 rounded-full overflow-visible">
            {/* Progress Fill with Golden Gradient */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #004B79 0%, #DFB74A 100%)',
                boxShadow: '0 0 10px rgba(223, 183, 74, 0.7)',
              }}
            />
            {/* Traveling Gold Photon Head */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#DFB74A] border-2 border-white shadow-[0_0_12px_#DFB74A] transition-all duration-75"
              style={{
                left: `calc(${progress}% - 6px)`,
              }}
            />
          </div>

          {/* Changing Philosophy Line */}
          <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#002137]/65 uppercase text-center mt-1">
            {getPhilosophy()}
          </div>
        </div>
      </div>

      {/* ── 6. BOTTOM EDITORIAL FOOTER ── */}
      <div className="relative z-10 w-full flex items-center justify-between text-[#002137]/45 font-mono text-[9px] sm:text-[10px] tracking-[0.25em] uppercase">
        <div className="flex items-center gap-2">
          <span>MANTIF.COM</span>
          <span className="hidden sm:inline text-[#002137]/25">|</span>
          <span className="hidden sm:inline">MSME REGISTERED</span>
        </div>

        <div className="text-[#002137]/50 hover:text-[#002137] transition-colors">
          [ CLICK ANYWHERE TO ENTER ]
        </div>

        <div className="flex items-center gap-2">
          <span>EDTECH 2024</span>
        </div>
      </div>
    </div>
  );
};


