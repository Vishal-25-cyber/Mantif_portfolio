import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { siteContent } from '../data/content';
import { ServiceCard } from '../components/ServiceCard';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

export const ServicesSection: React.FC = () => {
  const { services } = siteContent;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHoveredStack, setIsHoveredStack] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalCards = services.cards.length;
  const AUTOPLAY_INTERVAL = 2000; // Fast cadence: 2.0s per card

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

  // Continuous smooth auto-moving loop (stops immediately when touched or hovered)
  useEffect(() => {
    if (!isAutoPlay || isHoveredStack || isTouched) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((curr) => (curr + 1) % totalCards);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHoveredStack, isTouched, totalCards]);

  // Touch handlers for mobile / touch devices — touches stop the auto-shuffle
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouched(true);
    setIsHoveredStack(true);
    touchStartXRef.current = e.touches[0].clientX;
    if (touchTimeoutRef.current) {
      window.clearTimeout(touchTimeoutRef.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
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
    }
    // After lifting touch, stay paused for 3.5s so user can read, then resume
    if (touchTimeoutRef.current) {
      window.clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = window.setTimeout(() => {
      setIsTouched(false);
      setIsHoveredStack(false);
    }, 3500);
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
        {/* ATTRACTIVE & UNIQUE "ONE OVER ANOTHER" 3D FAN STACK CAROUSEL              */}
        {/* ========================================================================= */}
        <div className="relative w-full py-6 sm:py-8 flex flex-col items-center">
          {/* 3D Stack Stage Container — Symmetrical Both Sides Visibility */}
          <div
              onMouseEnter={() => setIsHoveredStack(true)}
              onMouseLeave={() => setIsHoveredStack(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-[340px] sm:max-w-[370px] h-[490px] sm:h-[520px] mx-auto flex items-center justify-center"
            >
              {/* Decorative Ambient Luxury Orbiting Ring behind the Stack */}
              <div
                className="absolute -inset-10 sm:-inset-14 rounded-full border border-dashed border-[#DFB74A]/25 pointer-events-none"
                style={{
                  animation: 'spin 60s linear infinite',
                }}
              />
              <div
                className="absolute -inset-4 sm:-inset-6 rounded-full border border-dotted border-[#002137]/15 pointer-events-none"
                style={{
                  animation: 'spin 40s linear infinite reverse',
                }}
              />

              {/* Floating Prev Button (<) — Framed outside left fanned card */}
              <button
                onClick={handlePrev}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  setIsHoveredStack(true);
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => {
                  setCursorMode('default');
                  setIsHoveredStack(false);
                }}
                className="absolute -left-4 sm:-left-20 lg:-left-24 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                aria-label="Previous card in stack"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Floating Next Button (>) — Framed outside right fanned card */}
              <button
                onClick={handleNext}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  setIsHoveredStack(true);
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => {
                  setCursorMode('default');
                  setIsHoveredStack(false);
                }}
                className="absolute -right-4 sm:-right-20 lg:-right-24 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                aria-label="Next card in stack"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* The 3 Cards Stacked with Both Sides Prominently Visible */}
              {services.cards.map((card, idx) => {
                const offset = (idx - activeIndex + totalCards) % totalCards;

                // Responsive symmetric fan offsets for BOTH SIDES
                const xOffset = windowWidth < 640 ? 45 : windowWidth < 1024 ? 85 : 125;
                const rotateDeg = windowWidth < 640 ? 3 : 4.5;
                const scaleVal = windowWidth < 640 ? 0.92 : 0.90;

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
                  // Right Card — Fanned out clearly to the RIGHT side
                  zIndex = 20;
                  transform = `translateY(12px) translateX(${xOffset}px) scale(${scaleVal}) rotate(${rotateDeg}deg)`;
                  opacity = 0.94;
                  filter = 'brightness(0.97)';
                  pointerEvents = 'auto';
                } else {
                  // Left Card — Fanned out clearly to the LEFT side
                  zIndex = 20;
                  transform = `translateY(12px) translateX(-${xOffset}px) scale(${scaleVal}) rotate(-${rotateDeg}deg)`;
                  opacity = 0.94;
                  filter = 'brightness(0.97)';
                  pointerEvents = 'auto';
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (offset !== 0) {
                        handleSelectCard(idx);
                      } else {
                        // Touching / tapping the active center card toggles stop/play
                        setIsAutoPlay((prev) => !prev);
                        soundManager.playClick();
                      }
                    }}
                    onMouseEnter={() => setIsHoveredStack(true)}
                    onMouseLeave={() => setIsHoveredStack(false)}
                    onTouchStart={() => {
                      setIsTouched(true);
                      setIsHoveredStack(true);
                    }}
                    className="absolute inset-0 rounded-3xl transition-all duration-400 ease-out will-change-transform"
                    style={{
                      zIndex,
                      transform,
                      opacity,
                      filter,
                      pointerEvents,
                      cursor: 'pointer',
                      boxShadow:
                        offset === 0
                          ? `0 24px 55px -12px rgba(0, 33, 55, 0.20), 0 8px 24px -4px ${accentColor}30`
                          : `0 14px 34px -8px rgba(0, 33, 55, 0.14), 0 4px 16px -4px ${accentColor}25`,
                    }}
                  >
                    <ServiceCard card={card} />

                    {/* Attractive Clickable Callout Badge for Background Cards */}
                    {offset !== 0 && (
                      <div
                        className="absolute inset-0 rounded-3xl bg-[#FAF8F5]/25 hover:bg-transparent backdrop-blur-[0.5px] transition-all flex items-start justify-end p-3.5 group/fan"
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
          </div>

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
