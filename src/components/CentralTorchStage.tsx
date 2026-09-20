import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Maximize2, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

interface CentralTorchStageProps {
  children: React.ReactNode;
  activeCardIndex: number;
  onTorchClick?: () => void;
}

export const CentralTorchStage: React.FC<CentralTorchStageProps> = ({
  children,
  activeCardIndex,
  onTorchClick,
}) => {
  // isCenteredMode: when true, the torch sits heroically in the dead center of the stage
  // when false, it sits at the center base, beaming light directly upward through the cards
  const [isCenteredMode, setIsCenteredMode] = useState(false);
  const [isLit, setIsLit] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lightScale, setLightScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const flashTimeoutRef = useRef<number | null>(null);

  // Trigger torch flash, optical flare, sound, and expanding light beam
  const triggerFlash = (sound: boolean = true) => {
    if (sound) {
      soundManager.playTorchFlash();
    }
    setIsFlashing(true);
    setIsLit(true);
    setLightScale(0.2);

    // Expand light rapidly like an optical shockwave
    setTimeout(() => {
      setLightScale(1.1);
    }, 45);

    setTimeout(() => {
      setLightScale(1.0);
    }, 280);

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsFlashing(false);
    }, 350);

    // If currently in centered hero mode, transition to revealed cards
    if (isCenteredMode) {
      setIsCenteredMode(false);
    } else {
      onTorchClick?.();
    }
  };

  // Initial entry flash when mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerFlash(false);
    }, 350);
    return () => {
      clearTimeout(timer);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // Flash subtly when active card changes
  useEffect(() => {
    setLightScale(0.92);
    const t = setTimeout(() => setLightScale(1.0), 180);
    return () => clearTimeout(t);
  }, [activeCardIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full flex-1 min-h-0 py-1 flex flex-col items-center justify-center select-none"
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. AMBIENT SHADOW BACKDROP & EXPANDING LIGHT CONE FIELD      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center transition-all duration-700 ease-out"
        style={{
          opacity: isLit ? 1 : 0.2,
        }}
      >
        {/* Deep ambient shadow vignette that recedes when light expands */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(0, 33, 55, 0.08) 70%, rgba(0, 33, 55, 0.18) 100%)',
          }}
        />

        {/* Expanding Conical & Radial Torch Beam Field */}
        <div
          className="absolute rounded-full transition-transform duration-500 ease-out will-change-transform pointer-events-none"
          style={{
            width: 'min(94vw, 880px)',
            height: 'min(94vw, 880px)',
            transform: `scale(${lightScale}) translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)`,
            background: isFlashing
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(223, 183, 74, 0.6) 28%, rgba(250, 248, 245, 0.3) 58%, transparent 75%)'
              : 'radial-gradient(circle, rgba(255, 250, 240, 0.92) 0%, rgba(223, 183, 74, 0.2) 40%, rgba(250, 248, 245, 0.08) 68%, transparent 85%)',
            boxShadow: isFlashing
              ? '0 0 140px rgba(255, 255, 255, 0.95), 0 0 220px rgba(223, 183, 74, 0.75)'
              : '0 0 90px rgba(223, 183, 74, 0.18)',
            filter: isFlashing ? 'brightness(1.5)' : 'none',
          }}
        />

        {/* Volumetric Torch Light Rays (Expanding light projection) */}
        <div
          className="absolute w-[660px] h-[660px] rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isFlashing ? 0.95 : 0.4,
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(223,183,74,0.15) 0deg, transparent 25deg, rgba(255,255,255,0.22) 45deg, transparent 65deg, rgba(223,183,74,0.15) 90deg, transparent 115deg, rgba(255,255,255,0.22) 135deg, transparent 155deg, rgba(223,183,74,0.15) 180deg, transparent 205deg, rgba(255,255,255,0.22) 225deg, transparent 245deg, rgba(223,183,74,0.15) 270deg, transparent 295deg, rgba(255,255,255,0.22) 315deg, transparent 335deg, rgba(223,183,74,0.15) 360deg)',
            transform: `rotate(${mousePos.x * 0.4}deg)`,
          }}
        />

        {/* Optical Flash Shockwave Ring */}
        {isFlashing && (
          <div
            className="absolute rounded-full border border-white/95 animate-ping pointer-events-none"
            style={{
              width: '480px',
              height: '480px',
              animationDuration: '0.45s',
            }}
          />
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. THE CARDS REVEALED IN THE ILLUMINATED LIGHT STAGE         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full flex items-center justify-center transition-all duration-700 ease-out"
        style={{
          transform: isCenteredMode ? 'scale(0.86) translateY(-25px)' : 'scale(1) translateY(0px)',
          opacity: isCenteredMode ? 0.12 : 1,
          filter: isCenteredMode ? 'blur(5px)' : 'none',
          pointerEvents: isCenteredMode ? 'none' : 'auto',
        }}
      >
        {children}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PHYSICAL REALISTIC TORCH (HERO CENTER & DOCKED BASE)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={`relative z-30 flex flex-col items-center transition-all duration-700 ease-out ${
          isCenteredMode
            ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110 sm:scale-125'
            : 'mt-1 sm:mt-2 scale-90 sm:scale-95'
        }`}
      >
        {/* Realistic Upward-Facing Tactical Torch with Direct Light Beam */}
        <div
          onClick={() => triggerFlash(true)}
          onMouseEnter={() => setCursorMode('hover')}
          onMouseLeave={() => setCursorMode('default')}
          title={isCenteredMode ? 'Click Torch to Flash & Reveal Cards' : 'Click Torch to Flash Light & Next Service'}
          className="group relative cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          {/* Volumetric Conical Light Beam (Emanating straight up from the top lens) */}
          <div
            className="absolute bottom-[85%] left-1/2 -translate-x-1/2 pointer-events-none origin-bottom transition-all duration-500"
            style={{
              width: isCenteredMode ? '340px' : '440px',
              height: isCenteredMode ? '260px' : '360px',
              clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
              background: isFlashing
                ? 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(223, 183, 74, 0.6) 35%, rgba(250, 248, 245, 0.2) 80%, transparent 100%)'
                : 'linear-gradient(to top, rgba(255, 250, 240, 0.75) 0%, rgba(223, 183, 74, 0.25) 40%, rgba(250, 248, 245, 0.05) 85%, transparent 100%)',
              filter: 'blur(3px)',
              opacity: isLit ? 1 : 0,
              transform: `scaleY(${isFlashing ? 1.15 : 1}) rotate(${mousePos.x * 0.12}deg)`,
            }}
          />

          {/* Anamorphic Horizontal Lens Flare across the top emitter */}
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 h-[2px] pointer-events-none rounded-full z-10 transition-all duration-300"
            style={{
              width: isFlashing ? '220px' : '90px',
              background: 'linear-gradient(90deg, transparent, #DFB74A 25%, #FFFFFF 50%, #DFB74A 75%, transparent)',
              boxShadow: isFlashing ? '0 0 15px #FFFFFF, 0 0 25px #DFB74A' : '0 0 8px #DFB74A',
            }}
          />

          {/* Pulsing Light Corona on the Lens Head */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-7 rounded-full pointer-events-none transition-all duration-300 z-10"
            style={{
              background: isFlashing
                ? 'radial-gradient(ellipse, rgba(255,255,255,1) 0%, rgba(223,183,74,0.9) 50%, transparent 80%)'
                : 'radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(223,183,74,0.45) 60%, transparent 100%)',
              boxShadow: isFlashing ? '0 0 40px #FFFFFF, 0 0 70px #DFB74A' : '0 0 22px #DFB74A',
              transform: `scale(${isFlashing ? 1.7 : 1})`,
            }}
          />

          {/* Detailed Vertical Tactical Torch Vector (Machined Aerospace Body) */}
          <div className="relative w-16 sm:w-20 h-36 sm:h-44 flex items-center justify-center drop-shadow-2xl">
            <svg
              viewBox="0 0 80 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Cylindrical 3D Metal Reflection */}
                <linearGradient id="v-torch-body" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#001122" />
                  <stop offset="20%" stopColor="#0B2A42" />
                  <stop offset="42%" stopColor="#246491" />
                  <stop offset="65%" stopColor="#0B2A42" />
                  <stop offset="100%" stopColor="#001122" />
                </linearGradient>

                {/* Cylindrical 3D Gold Bands */}
                <linearGradient id="v-torch-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8C6615" />
                  <stop offset="25%" stopColor="#DFB74A" />
                  <stop offset="45%" stopColor="#FFF2B0" />
                  <stop offset="70%" stopColor="#DFB74A" />
                  <stop offset="100%" stopColor="#6E4E0D" />
                </linearGradient>

                {/* Parabolic Chrome Reflector */}
                <radialGradient id="v-reflector" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#FFF3C4" />
                  <stop offset="75%" stopColor="#CBD5E1" />
                  <stop offset="100%" stopColor="#1E293B" />
                </radialGradient>

                {/* Lens Radial Glare */}
                <radialGradient id="v-lens-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#FFE082" />
                  <stop offset="70%" stopColor="#DFB74A" />
                  <stop offset="100%" stopColor="#002137" />
                </radialGradient>

                {/* Diamond Knurling Texture */}
                <pattern id="v-knurl" width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M0 4L4 0M0 0L4 4" stroke="#DFB74A" strokeWidth="0.55" strokeOpacity="0.45" />
                </pattern>
              </defs>

              {/* 1. Tailcap (Bottom) */}
              <rect x="23" y="152" width="34" height="18" rx="3" fill="url(#v-torch-body)" stroke="#001122" strokeWidth="1" />
              <rect x="26" y="154" width="28" height="10" fill="url(#v-knurl)" />
              <rect x="23" y="150" width="34" height="3" fill="url(#v-torch-gold)" />
              {/* Lanyard eyelet */}
              <rect x="36" y="170" width="8" height="5" rx="1.5" fill="url(#v-torch-gold)" />

              {/* 2. Main Handle Grip Body */}
              <rect x="24" y="80" width="32" height="68" rx="2" fill="url(#v-torch-body)" stroke="#001122" strokeWidth="1" />
              
              {/* Knurled Grip Texture on Handle */}
              <rect x="26" y="84" width="28" height="60" fill="url(#v-knurl)" />
              
              {/* Gold Grip Rings */}
              <rect x="24" y="82" width="32" height="2.5" fill="url(#v-torch-gold)" />
              <rect x="24" y="112" width="32" height="2" fill="url(#v-torch-gold)" />
              <rect x="24" y="146" width="32" height="2.5" fill="url(#v-torch-gold)" />

              {/* 3. Mid-Body Switch Collar & Push Button */}
              <rect x="22" y="58" width="36" height="20" rx="2" fill="url(#v-torch-body)" stroke="#001122" strokeWidth="1" />
              <rect x="22" y="76" width="36" height="2" fill="url(#v-torch-gold)" />

              {/* Tactical Side Push Switch (Center facing viewer) */}
              <circle cx="40" cy="68" r="6" fill="url(#v-torch-gold)" />
              <circle cx="40" cy="68" r="4.5" fill={isFlashing ? '#FFFFFF' : '#002137'} />
              <circle cx="40" cy="68" r="2.5" fill={isFlashing ? '#00E5FF' : '#DFB74A'} />

              {/* 4. Head Heat-Sink Fins */}
              <rect x="18" y="38" width="44" height="18" fill="url(#v-torch-body)" stroke="#001122" strokeWidth="1" />
              <line x1="18" y1="42" x2="62" y2="42" stroke="#DFB74A" strokeWidth="1" />
              <line x1="18" y1="47" x2="62" y2="47" stroke="#001122" strokeWidth="1.2" />
              <line x1="18" y1="52" x2="62" y2="52" stroke="#DFB74A" strokeWidth="1" />

              {/* 5. Flared Reflector Head */}
              <polygon
                points="10,12 70,12 62,38 18,38"
                fill="url(#v-torch-body)"
                stroke="#001122"
                strokeWidth="1.2"
              />

              {/* Gold Bezel Ring */}
              <ellipse cx="40" cy="12" rx="30" ry="7" fill="url(#v-torch-gold)" />

              {/* Crenulated Strike Bezel Teeth */}
              <path
                d="M10 12 Q25 8 40 8 Q55 8 70 12 L68 14 Q55 10 40 10 Q25 10 12 14 Z"
                fill="#FFF2B0"
              />

              {/* Recessed Chrome Parabolic Reflector Bowl */}
              <ellipse cx="40" cy="12" rx="25" ry="5.5" fill="url(#v-reflector)" />

              {/* Central High-Intensity Cree LED Diode */}
              <ellipse
                cx="40"
                cy="12"
                rx="14"
                ry="3.5"
                fill="url(#v-lens-glow)"
              />
              <circle cx="40" cy="12" r={isFlashing ? 5 : 2.5} fill="#FFFFFF" />
            </svg>
          </div>

          {/* Torch Beacon Status Pill */}
          <div className="mt-1 sm:mt-1.5 flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5]/95 border border-[#002137]/20 shadow-md backdrop-blur-md group-hover:border-[#DFB74A] transition-all">
            <span className="w-2 h-2 rounded-full bg-[#DFB74A] animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#002137] uppercase">
              {isCenteredMode
                ? 'CLICK TORCH TO FLASH & REVEAL'
                : isFlashing
                ? 'TORCH FLASHING!'
                : 'CENTER TORCH • CLICK TO FLASH & SHUFFLE'}
            </span>
            <Sparkles className="w-3 h-3 text-[#DFB74A]" />
          </div>
        </div>

        {/* View Controls: Toggle Centered Hero vs Docked Base */}
        <div className="mt-1.5 flex items-center gap-2">
          <button
            onClick={() => {
              if (isCenteredMode) {
                triggerFlash(true);
              } else {
                setIsCenteredMode(true);
                soundManager.playClick();
              }
            }}
            onMouseEnter={() => setCursorMode('hover')}
            onMouseLeave={() => setCursorMode('default')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white border border-[#002137]/15 hover:border-[#DFB74A] text-[#002137] font-mono text-[8px] sm:text-[9px] tracking-wider uppercase transition-all shadow-xs"
          >
            {isCenteredMode ? (
              <>
                <Maximize2 className="w-2.5 h-2.5 text-[#DFB74A]" />
                <span>Reveal Cards in Beam</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-2.5 h-2.5 text-[#DFB74A]" />
                <span>Keep Torch At Center</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
