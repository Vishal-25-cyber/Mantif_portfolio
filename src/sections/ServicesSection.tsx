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
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const totalCards = services.cards.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    soundManager.playClick();
  };

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
    soundManager.playClick();
  };

  // Auto-play management
  useEffect(() => {
    if (isAutoPlay && viewMode === 'stack') {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % totalCards);
      }, 5000);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, viewMode, totalCards]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 45) {
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

      {/* Decorative top-right cross lines */}
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

          {/* Callout box */}
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
        {/* CAROUSEL CONTROLS BAR: CATEGORY TABS, AUTOPLAY & VIEW MODE SWITCHER       */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-3 border-b border-[#002137]/10">
          {/* Quick Selection Category Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {services.cards.map((card, idx) => {
              const isActive = activeIndex === idx;
              const accent = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#64748B';
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    handleSelectCard(idx);
                  }}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`group relative flex items-center gap-2 px-3.5 sm:px-4.5 py-2 rounded-full font-mono text-xs tracking-wider transition-all duration-300 shrink-0 border ${
                    isActive
                      ? 'bg-[#002137] text-white border-[#002137] shadow-md scale-105'
                      : 'bg-white/80 text-[#475569] border-[#002137]/12 hover:border-[#DFB74A] hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full transition-transform duration-300"
                    style={{
                      backgroundColor: accent,
                      transform: isActive ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                  <span className="font-bold">{card.id}</span>
                  <span className="opacity-40">/</span>
                  <span className="font-semibold">{card.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Auto-slide, Counter, & Grid/Stack Switcher */}
          <div className="flex items-center justify-end gap-3 shrink-0 self-end sm:self-auto">
            {/* Auto-play toggle */}
            {viewMode === 'stack' && (
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className={`p-2 rounded-full border transition-colors ${
                  isAutoPlay
                    ? 'bg-[#DFB74A]/20 border-[#DFB74A] text-[#002137]'
                    : 'bg-white/70 border-[#002137]/15 text-[#64748B] hover:text-[#002137]'
                }`}
                title={isAutoPlay ? 'Pause Auto-slide' : 'Start Auto-slide'}
                aria-label="Toggle auto play"
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
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
        {/* VIEW MODE 1: "ONE OVER ANOTHER" STACKED CARDS CAROUSEL                     */}
        {/* ========================================================================= */}
        {viewMode === 'stack' && (
          <div className="relative w-full py-4 sm:py-6 flex flex-col items-center">
            {/* Stack Stage Container */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-[430px] sm:max-w-[460px] h-[640px] sm:h-[670px] mx-auto flex items-center justify-center"
            >
              {/* Floating Prev Button (<) */}
              <button
                onClick={handlePrev}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="absolute -left-3 sm:-left-16 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
                aria-label="Previous card in stack"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Floating Next Button (>) */}
              <button
                onClick={handleNext}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="absolute -right-3 sm:-right-16 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
                aria-label="Next card in stack"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* The 3 Cards Stacked One Over Another */}
              {services.cards.map((card, idx) => {
                const offset = (idx - activeIndex + totalCards) % totalCards;

                // Stacking transforms and depth geometry
                let zIndex = 30;
                let transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
                let opacity = 1;
                let filter = 'none';
                let pointerEvents: 'auto' | 'none' = 'auto';

                if (offset === 0) {
                  // Active Top Card
                  zIndex = 30;
                  transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
                  opacity = 1;
                  filter = 'none';
                  pointerEvents = 'auto';
                } else if (offset === 1) {
                  // Second card stacked right underneath
                  zIndex = 20;
                  transform = 'translateY(24px) translateX(14px) scale(0.95) rotate(-2deg)';
                  opacity = 0.92;
                  filter = 'brightness(0.98)';
                  pointerEvents = 'auto';
                } else {
                  // Third card at bottom of stack
                  zIndex = 10;
                  transform = 'translateY(48px) translateX(-14px) scale(0.90) rotate(2deg)';
                  opacity = 0.78;
                  filter = 'brightness(0.96)';
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
                    className="absolute inset-0 rounded-3xl transition-all duration-500 will-change-transform"
                    style={{
                      zIndex,
                      transform,
                      opacity,
                      filter,
                      pointerEvents,
                      cursor: offset !== 0 ? 'pointer' : 'default',
                      boxShadow:
                        offset === 0
                          ? '0 25px 60px -15px rgba(0, 33, 55, 0.16)'
                          : offset === 1
                          ? '0 20px 40px -15px rgba(0, 33, 55, 0.12)'
                          : '0 15px 30px -15px rgba(0, 33, 55, 0.08)',
                    }}
                  >
                    <ServiceCard card={card} />

                    {/* Subtle click-to-focus overlay on background cards */}
                    {offset !== 0 && (
                      <div
                        className="absolute inset-0 rounded-3xl bg-transparent hover:bg-black/[0.03] transition-colors"
                        title={`Click to bring ${card.title} to front`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Stack Indicators & Quick Shuffle Action */}
            <div className="flex flex-col items-center gap-3 mt-10">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {services.cards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCard(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === idx
                        ? 'w-8 bg-[#DFB74A]'
                        : 'w-2 bg-[#002137]/20 hover:bg-[#002137]/40'
                    }`}
                    aria-label={`Go to card ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Status and Hint */}
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#64748B] tracking-wider uppercase">
                <span className="font-bold text-[#002137]">0{activeIndex + 1}</span>
                <span className="opacity-40">/</span>
                <span>0{totalCards} · Stacked Carousel</span>
              </div>

              {/* Quick Shuffle button */}
              <button
                onClick={handleNext}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className="mt-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#002137]/12 shadow-sm font-mono text-[10px] font-semibold text-[#002137] hover:border-[#DFB74A] hover:bg-[#FAF8F5] transition-all active:scale-95"
              >
                <RotateCw className="w-3 h-3 text-[#DFB74A]" />
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
              <div key={card.id} className="h-[620px]">
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
