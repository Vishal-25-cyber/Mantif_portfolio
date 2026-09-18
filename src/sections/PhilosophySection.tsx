import React, { useState, useRef } from 'react';
import { siteContent } from '../data/content';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

export const PhilosophySection: React.FC = () => {
  const { philosophy } = siteContent;
  const [activeSentence, setActiveSentence] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleSelectSentence = (idx: number) => {
    setActiveSentence(idx);
    soundManager.playChime(280 + idx * 45, 'sine', 0.7, 0.08);
  };

  return (
    <section
      id="philosophy"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-[#0D1B24] py-28 sm:py-36 px-4 sm:px-8 overflow-hidden select-none"
    >
      {/* Ghost big number backdrop */}
      <div className="absolute top-8 left-4 sm:left-10 pointer-events-none select-none" aria-hidden="true">
        <span className="font-serif font-bold text-[18vw] text-[#FAF8F5] leading-none"
          style={{ opacity: 0.03 }}>05</span>
      </div>

      {/* Decorative top-right cross lines */}
      <div className="absolute top-8 right-8 sm:right-16 opacity-[0.10] pointer-events-none" aria-hidden="true">
        <div className="w-16 h-[1px] bg-[#DFB74A]" />
        <div className="w-[1px] h-16 bg-[#DFB74A] mt-[-1px] ml-auto" />
      </div>

      {/* Cursor-tracked spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(223,183,74,0.10) 0%, transparent 70%)`,
        }}
      />

      {/* Ghost text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-serif font-bold text-[20vw] text-[#FAF8F5] select-none"
          style={{ opacity: 0.018, lineHeight: 1 }}
        >
          WHY
        </span>
      </div>

      {/* Ambient line art grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#DFB74A 1px, transparent 1px)',
          backgroundSize: '100% 80px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top editorial metadata strip */}
        <div className="flex items-center justify-between mb-12 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#94A3B8] tracking-[0.25em] uppercase">Chapter 05</span>
            <span className="w-4 h-[1px] bg-white/20" />
            <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">Core Philosophy</span>
          </div>
          <span className="font-mono text-[10px] text-[#94A3B8] hidden sm:block">mantif.com/philosophy</span>
        </div>

        {/* Section Header — editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#DFB74A] uppercase">
                05 / WHY WE BUILD
              </span>
            </div>

            <h2 className="font-serif font-bold text-[#FAF8F5] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
              {philosophy.heading}
            </h2>
          </div>

          {/* Callout box */}
          <div className="border border-[#004B79]/40 rounded-xl p-5 max-w-xs bg-[#002137]/60 backdrop-blur-sm">
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#DFB74A] uppercase mb-2">Manifesto Spotlight</div>
            <p className="font-sans text-sm text-[#94A3B8] leading-snug">
              Interactive manifesto. Click or hover any statement to illuminate foundational beliefs.
            </p>
          </div>
        </div>

        {/* Sentence index navigator */}
        <div className="flex items-center gap-1.5 mb-12 overflow-x-auto pb-2">
          {philosophy.manifesto.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSentence(idx)}
              className={`shrink-0 w-7 h-7 rounded-full font-mono text-[10px] font-bold border transition-all ${
                activeSentence === idx
                  ? 'bg-[#DFB74A] text-[#002137] border-[#DFB74A] scale-110 shadow-[0_0_12px_rgba(223,183,74,0.5)]'
                  : idx < activeSentence
                  ? 'bg-[#004B79]/30 text-[#94A3B8] border-[#004B79]/40'
                  : 'bg-transparent text-[#334155] border-[#334155]/40 hover:border-[#DFB74A]/40'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Progressive manifesto sentences */}
        <div className="space-y-10 sm:space-y-14">
          {philosophy.manifesto.map((item, idx) => {
            const isActive = activeSentence === idx;
            const isPassed = idx <= activeSentence;

            return (
              <div
                key={idx}
                onClick={() => handleSelectSentence(idx)}
                onMouseEnter={() => { setCursorMode('hover'); handleSelectSentence(idx); }}
                onMouseLeave={() => setCursorMode('default')}
                className={`relative cursor-pointer group transition-all duration-600 pl-8 sm:pl-12 border-l-[3px] ${
                  isActive
                    ? 'border-[#DFB74A]'
                    : isPassed
                    ? 'border-[#004B79]/40'
                    : 'border-[#334155]/20'
                }`}
              >
                {/* Left bullet */}
                <div className={`absolute -left-2 top-2 w-3 h-3 rounded-full transition-all duration-500 ${
                  isActive
                    ? 'bg-[#DFB74A] shadow-[0_0_12px_rgba(223,183,74,0.7)] scale-125'
                    : isPassed
                    ? 'bg-[#004B79]'
                    : 'bg-[#334155]/30'
                }`}/>

                {/* Sentence text with dramatic typography */}
                {item.emphasis === 'teal' && (
                  <p className={`font-serif leading-tight transition-all duration-600 ${
                    isActive ? 'text-[#DFB74A] opacity-100' : isPassed ? 'text-[#004B79] opacity-60' : 'text-[#334155]/30'
                  }`} style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}>
                    {item.text}
                  </p>
                )}

                {item.emphasis === 'italic' && (
                  <p className={`font-serif italic font-light leading-tight transition-all duration-600 ${
                    isActive ? 'text-[#FAF8F5] opacity-100' : isPassed ? 'text-[#94A3B8] opacity-60' : 'text-[#334155]/20'
                  }`} style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}>
                    {item.text}
                  </p>
                )}

                {item.emphasis === 'bold-gold' && (
                  <p className={`font-serif font-bold leading-tight transition-all duration-600 relative ${
                    isActive ? 'text-[#DFB74A] opacity-100' : isPassed ? 'text-[#DFB74A]/40 opacity-50' : 'text-[#334155]/15'
                  }`} style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
                    {item.text}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#DFB74A]/40 rounded-full"/>
                    )}
                  </p>
                )}

                {(item.emphasis === 'teal-subtle' || item.emphasis === 'normal') && (
                  <p className={`font-sans font-normal leading-relaxed transition-all duration-600 ${
                    isActive ? 'text-[#CBD5E1] opacity-100' : isPassed ? 'text-[#475569] opacity-60' : 'text-[#334155]/20'
                  }`} style={{ fontSize: 'clamp(0.9rem, 2vw, 1.25rem)' }}>
                    {item.text}
                  </p>
                )}

                {item.emphasis === 'bold' && (
                  <p className={`font-serif font-semibold leading-snug transition-all duration-600 ${
                    isActive ? 'text-[#FAF8F5] opacity-100' : isPassed ? 'text-[#94A3B8] opacity-55' : 'text-[#334155]/20'
                  }`} style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)' }}>
                    {item.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Seal */}
        <div className="mt-20 pt-8 border-t border-[#DFB74A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] font-mono text-[#334155]">
          <span>MANTIF CORE PHILOSOPHY · NO ALGORITHM REPLACES THE TEACHER</span>
          <span>MANTIF · Est. 2024</span>
        </div>
      </div>
    </section>
  );
};
