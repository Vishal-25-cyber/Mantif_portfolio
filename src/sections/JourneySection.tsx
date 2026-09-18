import React, { useState, useRef } from 'react';
import { siteContent } from '../data/content';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';
import { MediaRevealModal } from '../components/MediaRevealModal';
import { Play, Eye, Maximize2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export const JourneySection: React.FC = () => {
  const { journey } = siteContent;
  const [activeLetterIdx, setActiveLetterIdx] = useState<number>(0);
  const [isZoomedOut, setIsZoomedOut] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    mediaType: 'image' | 'video' | 'placeholder';
    src: string;
    poster?: string;
    caption?: string;
  }>({ isOpen: false, title: '', mediaType: 'image', src: '' });

  const activeItem = journey.letters[activeLetterIdx];

  const handleSelectLetter = (idx: number) => {
    setIsZoomedOut(false);
    setActiveLetterIdx(idx);
    soundManager.playRopePluck(240 + idx * 50);
  };

  const handleZoomOut = () => {
    setIsZoomedOut(true);
    soundManager.playChime(528, 'sine', 1.5, 0.15);
  };

  const openModal = (item: typeof activeItem) => {
    setSelectedMedia({
      isOpen: true,
      title: `${item.letter === 'A' ? 'Λ' : item.letter} — ${item.milestone}`,
      subtitle: item.date,
      mediaType: item.mediaType,
      src: item.mediaSrc,
      poster: item.poster,
      caption: item.description,
    });
  };

  const letterDisplays = ['M', 'Λ', 'N', 'T', 'I', 'F'];

  return (
    <section
      id="journey"
      className="relative w-full bg-[#001A2C] py-24 sm:py-32 px-4 sm:px-8 overflow-hidden"
    >
      {/* Ghost backdrop letters */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="font-serif font-bold text-[30vw] text-[#FAF8F5] select-none"
          style={{ opacity: 0.015, lineHeight: 1, letterSpacing: '-0.02em' }}>
          JOURNEY
        </span>
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #DFB74A 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header — white on dark */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#DFB74A]" />
            <span className="font-mono text-xs font-bold tracking-[0.22em] text-[#DFB74A] uppercase">
              {journey.eyebrow}
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF8F5] tracking-tight mt-4">
            {journey.heading}
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#94A3B8] mt-4 leading-relaxed max-w-xl">
            {journey.subheading}
          </p>
        </div>

        {/* Stage Controls Bar */}
        <div className="w-full bg-[#002137] border border-[#004B79]/30 rounded-xl px-5 py-3 flex items-center justify-between mb-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#DFB74A] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#64748B] uppercase font-bold">
              PUPPET THEATRE STAGE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSelectLetter(Math.max(0, activeLetterIdx - 1))}
              disabled={isZoomedOut || activeLetterIdx === 0}
              className="p-1.5 rounded-full border border-[#004B79]/40 hover:bg-[#004B79]/20 disabled:opacity-25 text-[#94A3B8] transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleSelectLetter(Math.min(5, activeLetterIdx + 1))}
              disabled={isZoomedOut || activeLetterIdx === 5}
              className="p-1.5 rounded-full border border-[#004B79]/40 hover:bg-[#004B79]/20 disabled:opacity-25 text-[#94A3B8] transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className={`ml-3 px-4 py-1.5 rounded-full font-mono text-[11px] font-bold border transition-all ${
                isZoomedOut
                  ? 'bg-[#DFB74A] text-[#002137] border-[#DFB74A]'
                  : 'border-[#DFB74A]/40 text-[#DFB74A] hover:bg-[#DFB74A]/10'
              }`}
            >
              {isZoomedOut ? '✦ MANTIF UNITED' : 'ZOOM OUT → MANTIF'}
            </button>
          </div>
        </div>

        {/* ── THEATRE STAGE ── */}
        <div className="w-full bg-[#00111D] border-x border-b border-[#004B79]/20 rounded-b-3xl overflow-hidden shadow-2xl">

          {/* Rope + Letter Row */}
          <div className="grid grid-cols-6 border-b border-[#004B79]/20 pt-2">
            {journey.letters.map((item, idx) => {
              const isActive = !isZoomedOut && activeLetterIdx === idx;
              const isPassed = !isZoomedOut && idx <= activeLetterIdx;
              const displayChar = letterDisplays[idx];

              return (
                <div key={item.letter} className="flex flex-col items-center py-4 relative group border-r border-[#004B79]/10 last:border-r-0">

                  {/* SVG rope from gantry */}
                  <svg className="w-full h-14 sm:h-20 overflow-visible" preserveAspectRatio="xMidYMid meet">
                    {/* Pulley ring at top */}
                    <circle cx="50%" cy="6" r="4" fill="#DFB74A" stroke="#001A2C" strokeWidth="1.5"/>
                    {/* Rope cord */}
                    <line x1="50%" y1="6" x2="50%" y2="100%"
                      stroke={isActive ? '#DFB74A' : '#334155'}
                      strokeWidth={isActive ? '2' : '1.2'}
                      strokeDasharray={!isPassed ? '4 3' : 'none'}
                      style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(223,183,74,0.6))' } : undefined}
                    />
                  </svg>

                  {/* Suspended letter tile */}
                  <button
                    onClick={() => handleSelectLetter(idx)}
                    onMouseEnter={() => setCursorMode('explore')}
                    onMouseLeave={() => setCursorMode('default')}
                    className={`relative w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-xl flex flex-col items-center justify-center border transition-all duration-500 will-change-transform group ${
                      isActive
                        ? 'bg-[#DFB74A] text-[#002137] border-[#DFB74A] shadow-[0_0_30px_rgba(223,183,74,0.4)] scale-110'
                        : isPassed
                        ? 'bg-[#002137] text-[#FAF8F5] border-[#004B79]/50 hover:border-[#DFB74A]/60'
                        : 'bg-[#001626] text-[#334155] border-[#334155]/30 hover:border-[#004B79]/50'
                    }`}
                    style={isActive ? {
                      animation: 'puppetSwayDark 3s ease-in-out infinite',
                      transformOrigin: 'top center',
                    } : undefined}
                  >
                    {/* Hook on top */}
                    <div className={`absolute -top-2 w-3 h-3 rounded-full border-2 ${isActive ? 'bg-[#002137] border-[#DFB74A]' : 'bg-[#DFB74A] border-[#001A2C]'}`}/>
                    <span className={`font-serif font-bold leading-none ${
                      isActive ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl sm:text-2xl md:text-3xl'
                    }`}>
                      {displayChar}
                    </span>
                    <span className="font-mono text-[7px] sm:text-[8px] mt-0.5 opacity-60">0{idx + 1}</span>
                  </button>

                  {/* Chapter name below */}
                  <span className="font-mono text-[8px] sm:text-[9px] text-[#475569] mt-2 text-center px-1 line-clamp-2 hidden sm:block">
                    {item.character}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Stage Content Area ── */}
          {!isZoomedOut ? (
            <div className="p-5 sm:p-8 animate-fadeIn" key={activeLetterIdx}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left: narrative */}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#002137] text-[#DFB74A] border border-[#DFB74A]/30">
                      {activeItem.date}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#004B79] tracking-wider uppercase">
                      {activeItem.tag}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-6xl sm:text-8xl font-bold text-[#DFB74A] leading-none opacity-15">
                        {letterDisplays[activeLetterIdx]}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF8F5] -ml-10 relative z-10">
                        {activeItem.milestone}
                      </h3>
                    </div>
                    <p className="font-sans text-sm text-[#94A3B8] leading-relaxed mt-3">
                      {activeItem.description}
                    </p>
                  </div>

                  {/* Gallery strip for M */}
                  {activeItem.letter === 'M' && (
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#475569]">
                        Archive Gallery ·
                      </span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {['/images/gallery_1.jpg', '/images/gallery_2.jpg', '/images/gallery_3.jpg'].map((img, i) => (
                          <div key={i}
                            onClick={() => setSelectedMedia({ isOpen: true, title: `Tutoring Hub — Study #${i+1}`, mediaType: 'image', src: img, caption: 'Authentic Tutoring Hub classroom collaboration.' })}
                            onMouseEnter={() => setCursorMode('view')}
                            onMouseLeave={() => setCursorMode('default')}
                            className="aspect-square rounded-lg overflow-hidden border border-[#004B79]/30 cursor-pointer hover:opacity-80 transition-opacity hover:border-[#DFB74A]/50"
                          >
                            <img src={img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => openModal(activeItem)}
                    onMouseEnter={() => setCursorMode('hover')}
                    onMouseLeave={() => setCursorMode('default')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DFB74A] text-[#002137] font-mono text-xs font-bold hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    View Full Milestone
                  </button>
                </div>

                {/* Right: media frame */}
                <div
                  onClick={() => openModal(activeItem)}
                  onMouseEnter={() => setCursorMode('view')}
                  onMouseLeave={() => setCursorMode('default')}
                  className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-[#004B79]/30 bg-[#001626] cursor-pointer shadow-xl hover:border-[#DFB74A]/40 transition-all"
                >
                  {activeItem.mediaType === 'video' ? (
                    <div className="relative w-full h-full">
                      <video src={activeItem.mediaSrc} poster={activeItem.poster} muted playsInline className="w-full h-full object-cover opacity-70"/>
                      <div className="absolute inset-0 bg-[#001A2C]/50 flex items-center justify-center group-hover:bg-[#001A2C]/30 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-[#DFB74A] text-[#002137] flex items-center justify-center shadow-[0_0_30px_rgba(223,183,74,0.5)] group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-0.5"/>
                        </div>
                      </div>
                    </div>
                  ) : activeItem.mediaType === 'image' && activeItem.mediaSrc ? (
                    <div className="relative w-full h-full">
                      <img src={activeItem.mediaSrc} alt={activeItem.milestone}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001A2C]/70 via-transparent to-transparent flex items-end p-4">
                        <span className="font-mono text-xs text-[#FAF8F5] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#DFB74A]"/> Click to expand
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-full border border-[#DFB74A]/40 flex items-center justify-center mb-3">
                        <Sparkles className="w-5 h-5 text-[#DFB74A]"/>
                      </div>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-[#DFB74A] uppercase">
                        Upcoming Talent Cohort
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#FAF8F5] mt-1">MEDIA TO BE ADDED</h4>
                      <p className="font-sans text-xs text-[#475569] mt-1 max-w-xs">
                        Hiring session documentation for new educator & developer positions is being prepared.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── ZOOM OUT: FULL MANTIF CLIMAX ── */
            <div className="p-8 sm:p-16 flex flex-col items-center text-center animate-scaleUp">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#DFB74A] uppercase mb-8">
                All chapters united
              </span>

              {/* All 6 letters with ropes */}
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                {letterDisplays.map((char, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-[#DFB74A] to-[#DFB74A]/20 mb-2"/>
                    <span className={`font-serif font-bold leading-none ${char === 'Λ' ? 'text-[#DFB74A]' : 'text-[#FAF8F5]'}`}
                      style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}>
                      {char}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 max-w-lg">
                <div className="flex items-center justify-center gap-4 mb-5">
                  <span className="w-8 h-[1px] bg-[#DFB74A]/60"/>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#475569] uppercase">The Continuous Thread</span>
                  <span className="w-8 h-[1px] bg-[#DFB74A]/60"/>
                </div>
                <p className="font-serif italic text-2xl sm:text-3xl text-[#FAF8F5] font-light">
                  "{journey.finalePrompt}"
                </p>
                <p className="font-sans text-sm text-[#64748B] mt-4">
                  Six milestones. One story. From physical classrooms to digital intelligence.
                </p>
                <button
                  onClick={() => handleSelectLetter(0)}
                  onMouseEnter={() => setCursorMode('hover')}
                  onMouseLeave={() => setCursorMode('default')}
                  className="mt-8 px-6 py-2.5 rounded-full border border-[#DFB74A]/40 text-[#DFB74A] hover:bg-[#DFB74A] hover:text-[#002137] font-mono text-xs font-bold transition-all"
                >
                  ← Restart Stage Timeline
                </button>
              </div>
            </div>
          )}

          {/* Stage footer bar */}
          <div className="px-6 py-3 border-t border-[#004B79]/20 flex justify-between text-[9px] font-mono text-[#334155]">
            <span>PUPPET THEATRE // PHYSICAL TO DIGITAL CONTINUUM</span>
            <span>MANTIF · Est. 2024</span>
          </div>
        </div>
      </div>

      <MediaRevealModal
        isOpen={selectedMedia.isOpen}
        onClose={() => setSelectedMedia(p => ({ ...p, isOpen: false }))}
        title={selectedMedia.title}
        subtitle={selectedMedia.subtitle}
        mediaType={selectedMedia.mediaType}
        src={selectedMedia.src}
        poster={selectedMedia.poster}
        caption={selectedMedia.caption}
      />

      <style>{`
        @keyframes puppetSwayDark {
          0%,100% { transform: scale(1.1) rotate(0deg) translateY(-2px); }
          30%      { transform: scale(1.1) rotate(2.5deg) translateY(-4px); }
          70%      { transform: scale(1.1) rotate(-2.5deg) translateY(-2px); }
        }
      `}</style>
    </section>
  );
};
