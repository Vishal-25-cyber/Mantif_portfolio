import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  LayoutGrid,
  Layers,
  RotateCw,
  Play,
  Pause,
} from 'lucide-react';
import { siteContent } from '../data/content';
import { ServiceCard } from '../components/ServiceCard';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

export const ServicesSection: React.FC = () => {
  const { services } = siteContent;
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHoveredStack, setIsHoveredStack] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const totalCards = services.cards.length;
  const AUTOPLAY_INTERVAL = 2000; // Fast cadence: 2.0s per card
  const STEP_TIME = 20; // 20ms update interval for butter-smooth progress bar

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
    setProgress(0);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setProgress(0);
    soundManager.playClick();
  };

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    soundManager.playClick();
  };

  // Continuous smooth auto-moving progress loop
  useEffect(() => {
    if (!isAutoPlay || isHoveredStack || viewMode !== 'stack') {
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (STEP_TIME / AUTOPLAY_INTERVAL) * 100;
        if (next >= 100) {
          setActiveIndex((curr) => (curr + 1) % totalCards);
          return 0;
        }
        return next;
      });
    }, STEP_TIME);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHoveredStack, viewMode, totalCards]);

  // Touch swipe listeners for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      id="services"
      className="relative w-full min-h-screen bg-[#FAF8F5] py-20 sm:py-28 px-4 sm:px-8 overflow-hidden select-none"
    >
      {/* Ghost big number backdrop */}
      <div className="absolute top-8 left-4 sm:left-10 pointer-events-none select-none" aria-hidden="true">
        <span
          className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
          style={{ opacity: 0.03 }}
        >
          02
        </span>
      </div>

      {/* Decorative top-right architectural cross lines */}
      <div className="absolute top-8 right-8 sm:right-16 opacity-[0.08] pointer-events-none" aria-hidden="true">
        <div className="w-20 h-[1px] bg-[#002137]" />
        <div className="w-[1px] h-20 bg-[#002137] mt-[-1px] ml-auto" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top editorial metadata strip */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#002137]/10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#64748B] tracking-[0.25em] uppercase">Chapter 02</span>
            <span className="w-4 h-[1px] bg-[#002137]/20" />
            <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">
              Services & Offerings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
            <span className="font-mono text-[10px] text-[#64748B] hidden sm:block">mantif.com/services</span>
          </div>
        </div>

        {/* Section Header — editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#004B79] uppercase">
                {services.eyebrow}
              </span>
            </div>

            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
            >
              {services.heading}
            </h2>
          </div>

          {/* MSME Registered Callout box */}
          <div className="border border-[#002137]/12 rounded-2xl p-5 max-w-sm bg-white/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-bold">
                MSME Registered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DFB74A]/15 border border-[#DFB74A]/30 font-mono text-[8px] font-bold text-[#002137] uppercase">
                TN-GOV
              </span>
            </div>
            <p className="font-sans text-xs text-[#475569] leading-relaxed">{services.subheading}</p>
            <a
              href="https://mantif.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#004B79] hover:text-[#DFB74A] transition-colors"
            >
              <span>Explore Platform</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CAROUSEL CONTROLS BAR: AUTOPLAY STATUS & VIEW SWITCHER                    */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#002137]/10">
          {/* Subtle Stage Label / Active Initiative */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
            <span className="tracking-wider uppercase font-semibold text-[#002137]">
              {viewMode === 'stack' ? 'Curated Offerings' : 'All Offerings'}
            </span>
            <span className="opacity-40">/</span>
            <span className="text-[11px] font-mono text-[#004B79] font-medium">
              {viewMode === 'stack' ? `Initiative 0${activeIndex + 1} of 0${totalCards}` : '3 Core Initiatives'}
            </span>
          </div>

          {/* Right Controls: Autoplay Button, Counter, & Grid Toggle */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            {/* Auto-play toggle with status */}
            {viewMode === 'stack' && (
              <button
                onClick={() => {
                  setIsAutoPlay(!isAutoPlay);
                  soundManager.playClick();
                }}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
                  isAutoPlay
                    ? 'bg-[#DFB74A]/15 border-[#DFB74A] text-[#002137] font-semibold'
                    : 'bg-white/70 border-[#002137]/15 text-[#64748B] hover:text-[#002137]'
                }`}
                title={isAutoPlay ? 'Auto-slide is active (hover card to pause)' : 'Auto-slide paused (click to resume)'}
                aria-label="Toggle auto play"
              >
                {isAutoPlay ? (
                  <>
                    <Pause className="w-3 h-3 text-[#DFB74A]" />
                    <span className="text-[10px] hidden md:inline">
                      {isHoveredStack ? 'PAUSED' : 'AUTO-MOVING'}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span className="text-[10px] hidden md:inline">PLAY</span>
                  </>
                )}
              </button>
            )}

            {/* Slide Counter */}
            {viewMode === 'stack' && (
              <div className="font-mono text-xs text-[#64748B] tracking-widest px-1">
                <span className="font-bold text-[#002137]">0{activeIndex + 1}</span>
                <span className="opacity-40 mx-1">/</span>
                <span>0{totalCards}</span>
              </div>
            )}

            {/* View Mode Switcher: Stacked Carousel vs Spread Grid */}
            <button
              onClick={() => {
                setViewMode(viewMode === 'stack' ? 'grid' : 'stack');
                soundManager.playClick();
              }}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#002137]/15 bg-white/80 hover:bg-white text-xs font-mono text-[#002137] font-semibold transition-colors shadow-sm"
            >
              {viewMode === 'stack' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-[#004B79]" />
                  <span className="hidden sm:inline">Spread Grid</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#DFB74A]" />
                  <span className="hidden sm:inline">Stacked Carousel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: ATTRACTIVE & UNIQUE "ONE OVER ANOTHER" 3D FAN STACK           */}
        {/* ========================================================================= */}
        {viewMode === 'stack' && (
          <div className="relative w-full py-4 sm:py-6 flex flex-col items-center">
            {/* 3D Stack Stage Container — Compact, proportional dimensions */}
            <div
              onMouseEnter={() => setIsHoveredStack(true)}
              onMouseLeave={() => setIsHoveredStack(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-[340px] sm:max-w-[370px] h-[480px] sm:h-[510px] mx-auto flex items-center justify-center"
            >
              {/* Decorative Ambient Luxury Orbiting Ring behind the Stack */}
              <div
                className="absolute -inset-8 sm:-inset-10 rounded-full border border-dashed border-[#DFB74A]/25 pointer-events-none"
                style={{
                  animation: 'spin 60s linear infinite',
                }}
              />
              <div
                className="absolute -inset-3 sm:-inset-5 rounded-full border border-dotted border-[#002137]/15 pointer-events-none"
                style={{
                  animation: 'spin 40s linear infinite reverse',
                }}
              />

              {/* Floating Prev Button (<) */}
              <button
                onClick={handlePrev}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="absolute -left-3 sm:-left-12 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                aria-label="Previous card in stack"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Floating Next Button (>) */}
              <button
                onClick={handleNext}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="absolute -right-3 sm:-right-12 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                aria-label="Next card in stack"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* The 3 Cards Stacked One Over Another in a 3D Fan */}
              {services.cards.map((card, idx) => {
                const offset = (idx - activeIndex + totalCards) % totalCards;

                // 3D Symmetrical Fanned Stack Geometry
                let zIndex = 30;
                let transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
                let opacity = 1;
                let filter = 'none';
                let pointerEvents: 'auto' | 'none' = 'auto';
                let accentColor = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#002137';

                if (offset === 0) {
                  // Active Top Card — Front and Center
                  zIndex = 30;
                  transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
                  opacity = 1;
                  filter = 'none';
                  pointerEvents = 'auto';
                } else if (offset === 1) {
                  // Next card — Fanned out to the right underneath
                  zIndex = 20;
                  transform =
                    window.innerWidth < 640
                      ? 'translateY(14px) translateX(22px) scale(0.94) rotate(2.5deg)'
                      : 'translateY(14px) translateX(46px) scale(0.94) rotate(3deg)';
                  opacity = 0.94;
                  filter = 'brightness(0.98)';
                  pointerEvents = 'auto';
                } else {
                  // Previous card — Fanned out to the left underneath
                  zIndex = 15;
                  transform =
                    window.innerWidth < 640
                      ? 'translateY(24px) translateX(-22px) scale(0.88) rotate(-2.5deg)'
                      : 'translateY(14px) translateX(-46px) scale(0.94) rotate(-3deg)';
                  opacity = 0.94;
                  filter = 'brightness(0.98)';
                  pointerEvents = 'auto';
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (offset !== 0) {
                        handleSelectCard(idx);
                      }
                    }}
                    className="absolute inset-0 rounded-3xl transition-all duration-400 ease-out will-change-transform"
                    style={{
                      zIndex,
                      transform,
                      opacity,
                      filter,
                      pointerEvents,
                      cursor: offset !== 0 ? 'pointer' : 'default',
                      boxShadow:
                        offset === 0
                          ? `0 20px 48px -12px rgba(0, 33, 55, 0.16), 0 6px 20px -4px ${accentColor}25`
                          : `0 12px 30px -8px rgba(0, 33, 55, 0.12), 0 4px 14px -4px ${accentColor}25`,
                    }}
                  >
                    <ServiceCard card={card} />

                    {/* Attractive Clickable Callout Badge for Background Cards */}
                    {offset !== 0 && (
                      <div
                        className="absolute inset-0 rounded-3xl bg-[#FAF8F5]/30 hover:bg-transparent backdrop-blur-[0.5px] transition-all flex items-start justify-end p-3.5 group/fan"
                        title={`Click to bring ${card.title} to front`}
                      >
                        <span
                          className="px-2.5 py-0.5 rounded-full font-mono text-[8px] font-bold uppercase tracking-wider shadow-sm transition-transform group-hover/fan:scale-105"
                          style={{
                            backgroundColor: accentColor,
                            color: '#FAF8F5',
                          }}
                        >
                          0{idx + 1} · {card.title} ↗
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Stack Indicators, Progress Bar, & Quick Shuffle Action */}
            <div className="flex flex-col items-center gap-3 mt-8 sm:mt-10 z-20">
              {/* Dynamic Auto-Moving Linear Progress Bar */}
              {isAutoPlay && (
                <div className="w-48 sm:w-64 h-1.5 rounded-full bg-[#002137]/10 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#004B79] to-[#DFB74A] rounded-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {services.cards.map((card, idx) => {
                  const isActive = activeIndex === idx;
                  const accent = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#002137';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectCard(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive ? 'w-8' : 'w-2 bg-[#002137]/20 hover:bg-[#002137]/40'
                      }`}
                      style={{
                        backgroundColor: isActive ? accent : undefined,
                      }}
                      aria-label={`Go to card ${idx + 1}`}
                    />
                  );
                })}
              </div>

              {/* Status and Hint */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748B] tracking-wider uppercase">
                <span className="font-bold text-[#002137]">0{activeIndex + 1}</span>
                <span className="opacity-40">/</span>
                <span>0{totalCards}</span>
                <span className="mx-1 opacity-30">·</span>
                <span className="text-[10px] text-[#004B79] font-semibold">
                  {isHoveredStack ? 'PAUSED (HOVERING)' : 'AUTO-CYCLING STACK'}
                </span>
              </div>

              {/* Quick Shuffle Action Button */}
              <button
                onClick={handleNext}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#002137]/15 shadow-sm font-mono text-xs font-semibold text-[#002137] hover:border-[#DFB74A] hover:bg-[#FAF8F5] transition-all active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#DFB74A]" />
                <span>Shuffle Next Card</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: FULL SPREAD GRID (ALL 3 CARDS SIDE BY SIDE)                  */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.cards.map((card) => (
              <div key={card.id} className="h-[480px] sm:h-[510px]">
                <ServiceCard card={card} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom credentials strip */}
        <div className="mt-14 pt-6 border-t border-[#002137]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DFB74A]" />
            <span>MANTIF is an MSME-registered EdTech startup — Tamil Nadu, India.</span>
          </div>
          <a
            href="https://mantif.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#004B79] text-[#002137] font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>mantif.com ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
