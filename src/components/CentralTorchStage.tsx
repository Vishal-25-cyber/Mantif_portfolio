import React, { useState, useEffect, useRef } from 'react';
import { Flashlight, Sparkles } from 'lucide-react';
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
  const [isLit, setIsLit] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lightScale, setLightScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const flashTimeoutRef = useRef<number | null>(null);

  // Trigger torch flash and expanding light
  const triggerFlash = (sound: boolean = true) => {
    if (sound) {
      soundManager.playTorchFlash();
    }
    setIsFlashing(true);
    setIsLit(true);
    setLightScale(0.3);

    // Expand light rapidly like an optical shockwave
    setTimeout(() => {
      setLightScale(1.05);
    }, 40);

    setTimeout(() => {
      setLightScale(1.0);
    }, 280);

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsFlashing(false);
    }, 320);

    onTorchClick?.();
  };

  // Initial auto-flash when mounted / section enters view
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerFlash(false);
    }, 300);
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
              'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0, 33, 55, 0.08) 75%, rgba(0, 33, 55, 0.16) 100%)',
          }}
        />

        {/* Expanding Conical & Radial Torch Beam Field */}
        <div
          className="absolute rounded-full transition-transform duration-500 ease-out will-change-transform"
          style={{
            width: 'min(92vw, 840px)',
            height: 'min(92vw, 840px)',
            transform: `scale(${lightScale}) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
            background: isFlashing
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(223, 183, 74, 0.55) 30%, rgba(250, 248, 245, 0.25) 60%, transparent 75%)'
              : 'radial-gradient(circle, rgba(255, 250, 240, 0.9) 0%, rgba(223, 183, 74, 0.18) 42%, rgba(250, 248, 245, 0.08) 68%, transparent 85%)',
            boxShadow: isFlashing
              ? '0 0 120px rgba(255, 255, 255, 0.9), 0 0 180px rgba(223, 183, 74, 0.7)'
              : '0 0 80px rgba(223, 183, 74, 0.15)',
            filter: isFlashing ? 'brightness(1.5)' : 'none',
          }}
        />

        {/* Volumetric Torch Light Rays (Subtle expanding light projection) */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isFlashing ? 0.9 : 0.35,
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(223,183,74,0.12) 0deg, transparent 25deg, rgba(255,255,255,0.2) 45deg, transparent 65deg, rgba(223,183,74,0.12) 90deg, transparent 115deg, rgba(255,255,255,0.2) 135deg, transparent 155deg, rgba(223,183,74,0.12) 180deg, transparent 205deg, rgba(255,255,255,0.2) 225deg, transparent 245deg, rgba(223,183,74,0.12) 270deg, transparent 295deg, rgba(255,255,255,0.2) 315deg, transparent 335deg, rgba(223,183,74,0.12) 360deg)',
            transform: `rotate(${mousePos.x * 0.4}deg)`,
          }}
        />

        {/* Flash Strobe Shockwave Ring */}
        {isFlashing && (
          <div
            className="absolute rounded-full border border-white/90 animate-ping pointer-events-none"
            style={{
              width: '420px',
              height: '420px',
              animationDuration: '0.45s',
            }}
          />
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. THE CARDS REVEALED IN THE ILLUMINATED LIGHT STAGE         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PHYSICAL CENTER TORCH BEACON & INTERACTIVE FLASHLIGHT     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 mt-2 sm:mt-4 flex flex-col items-center">
        <button
          onClick={() => triggerFlash(true)}
          onMouseEnter={() => setCursorMode('hover')}
          onMouseLeave={() => setCursorMode('default')}
          title="Click to Flash Central Torch"
          className="group relative flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FAF8F5]/90 hover:bg-[#FAF8F5] border border-[#002137]/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Torch Model Icon with Glow Ring */}
          <div className="relative w-6 h-6 rounded-full bg-[#002137] border border-[#DFB74A] flex items-center justify-center text-[#DFB74A] shadow-xs">
            <Flashlight className={`w-3.5 h-3.5 transition-transform duration-300 ${isFlashing ? 'scale-125 text-white' : 'group-hover:rotate-12'}`} />
            {/* Pulsing light ring at lens */}
            <span
              className="absolute -inset-1 rounded-full border border-[#DFB74A] opacity-60 animate-ping pointer-events-none"
              style={{ animationDuration: isFlashing ? '0.3s' : '2.4s' }}
            />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#002137] uppercase">
                {isFlashing ? 'Torch Flashing!' : 'Center Torch'}
              </span>
            </div>
            <span className="font-mono text-[7px] sm:text-[8px] text-[#64748B] tracking-wider uppercase -mt-0.5">
              Click to Flash Light & Shadow
            </span>
          </div>

          <Sparkles className="w-3.5 h-3.5 text-[#DFB74A] group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    </div>
  );
};
