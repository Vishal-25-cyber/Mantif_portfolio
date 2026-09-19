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
  const [shuffleStep, setShuffleStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
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
    setShuffleStep((prev) => prev + 1);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setShuffleStep((prev) => prev + 1);
    soundManager.playClick();
  };

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
    setShuffleStep((prev) => prev + 1);
    soundManager.playClick();
  };

  // Continuous smooth auto-moving loop (stops immediately when touched or hovered)
  useEffect(() => {
    if (!isAutoPlay || isHoveredStack || isTouched) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((curr) => (curr + 1) % totalCards);
      setShuffleStep((prev) => prev + 1);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHoveredStack, isTouched, totalCards]);

  // When user clicks to view Services from Navbar or URL hash, restart from the first service card
  useEffect(() => {
    const handleSectionView = (e: any) => {
      if (e?.detail?.sectionId === 'services') {
        setActiveIndex(0);
        setShuffleStep(0);
      }
    };
    window.addEventListener('mantif:section-view', handleSectionView as EventListener);

    const handleHash = () => {
      if (window.location.hash === '#services') {
        setActiveIndex(0);
        setShuffleStep(0);
      }
    };
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView as EventListener);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // When scrolling into Services after being out of view, automatically restart from card 0
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let hasBeenOutOfView = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.15) {
            hasBeenOutOfView = true;
          } else if (entry.intersectionRatio >= 0.45 && hasBeenOutOfView) {
            hasBeenOutOfView = false;
            setActiveIndex(0);
            setShuffleStep(0);
          }
        }
      },
      { threshold: [0.1, 0.45] }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

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
      ref={sectionRef}
      id="services"
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#FAF8F5] pt-14 sm:pt-16 pb-3 sm:pb-4 px-4 sm:px-8 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Ghost big number backdrop alone */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-10 pointer-events-none select-none z-0" aria-hidden="true">
        <span
          className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
          style={{ opacity: 0.05 }}
        >
          02
        </span>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col justify-between">
        {/* Section Header (Clean: removed both redundant title strips, kept watermark number) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-3 sm:gap-6 mb-2 sm:mb-3 shrink-0">
          <div>
            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3rem)' }}
            >
              {services.heading}
            </h2>
          </div>

          {/* MSME Registered Callout box */}
          <div className="border border-[#002137]/12 rounded-xl p-2 sm:p-2.5 max-w-md bg-white/70 backdrop-blur-sm shadow-xs flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-bold">
                  MSME Registered
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#DFB74A]/15 border border-[#DFB74A]/30 font-mono text-[8px] font-bold text-[#002137] uppercase">
                  TN-GOV
                </span>
              </div>
              <p className="font-sans text-[11px] sm:text-xs text-[#475569] leading-snug line-clamp-1 sm:line-clamp-2">
                {services.subheading}
              </p>
            </div>
            <a
              href="https://mantif.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#002137] text-white hover:bg-[#004B79] font-mono text-[9px] font-bold tracking-wider transition-all uppercase shadow-xs"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3 h-3 text-[#DFB74A]" />
            </a>
          </div>
        </div>

        {/* Minimalist Card Navigation Bar */}
        <div className="flex items-center justify-between gap-2 py-1.5 mb-2 border-b border-[#002137]/10 shrink-0">
          <div className="flex items-center gap-1.5">
            {services.cards.map((card, idx) => {
              const isActive = activeIndex === idx;
              const accentColor = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#002137';
              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(idx)}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#002137] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#002137] hover:bg-[#002137]/5'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? accentColor : '#94A3B8',
                    }}
                  />
                  <span>
                    {card.id} · {card.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-7 h-7 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all"
              aria-label="Previous service"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-7 h-7 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all"
              aria-label="Next service"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Fan Stack Stage Container — Symmetrical Both Sides Visibility */}
        <div className="relative w-full flex-1 min-h-0 py-1 flex flex-col items-center justify-center">
          <div
            onMouseEnter={() => setIsHoveredStack(true)}
            onMouseLeave={() => setIsHoveredStack(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ perspective: '1200px' }}
            className="relative w-full max-w-[340px] sm:max-w-[370px] h-[370px] sm:h-[400px] lg:h-[420px] mx-auto flex items-center justify-center"
          >
            {/* Ambient Orbiting Rings */}
            <div
              className="absolute -inset-8 sm:-inset-12 rounded-full border border-dashed border-[#DFB74A]/25 pointer-events-none"
              style={{ animation: 'spin 60s linear infinite' }}
            />
            <div
              className="absolute -inset-3 sm:-inset-5 rounded-full border border-dotted border-[#002137]/15 pointer-events-none"
              style={{ animation: 'spin 40s linear infinite reverse' }}
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
              className="absolute -left-4 sm:-left-20 lg:-left-24 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
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
              className="absolute -right-4 sm:-right-20 lg:-right-24 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-[#002137]/15 shadow-md flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
              aria-label="Next card in stack"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* The 3 Cards Stacked with Both Sides Coming From the Back */}
            {services.cards.map((card, idx) => {
              const offset = (idx - activeIndex + totalCards) % totalCards;

              // Responsive symmetric fan offsets for BOTH SIDES
              const xOffset = windowWidth < 640 ? 46 : windowWidth < 1024 ? 85 : 125;
              const rotateDeg = windowWidth < 640 ? 3 : 4.5;
              const scaleVal = windowWidth < 640 ? 0.92 : 0.89;

              // Alternate incoming entrance side from the back (Right then Left)
              const isRightFirst = shuffleStep % 2 === 0;
              const isRightCard = offset === 1 ? isRightFirst : !isRightFirst;

              let zIndex = 30;
              let transform = 'translate3d(0px, 0px, 40px) scale(1) rotate(0deg)';
              let opacity = 1;
              let filter = 'none';
              let pointerEvents: 'auto' | 'none' = 'auto';
              let accentColor = card.id === '01' ? '#DFB74A' : card.id === '02' ? '#004B79' : '#002137';

              if (offset === 0) {
                // Active Front Card — elevated towards viewer in 3D
                zIndex = 30;
                transform = 'translate3d(0px, 0px, 40px) scale(1) rotate(0deg)';
                opacity = 1;
                filter = 'none';
                pointerEvents = 'auto';
              } else if (isRightCard) {
                // Card in the BACK on the RIGHT side — tilted in 3D depth
                zIndex = 15;
                transform = `translate3d(${xOffset}px, 10px, -60px) scale(${scaleVal}) rotate(${rotateDeg}deg) rotateY(-8deg)`;
                opacity = 0.92;
                filter = 'brightness(0.96)';
                pointerEvents = 'auto';
              } else {
                // Card in the BACK on the LEFT side — tilted in 3D depth
                zIndex = 15;
                transform = `translate3d(-${xOffset}px, 10px, -60px) scale(${scaleVal}) rotate(-${rotateDeg}deg) rotateY(8deg)`;
                opacity = 0.92;
                filter = 'brightness(0.96)';
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
        <div className="pt-2.5 border-t border-[#002137]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#64748B] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A]" />
            <span>MANTIF is an MSME-registered EdTech startup — Tamil Nadu, India.</span>
          </div>
          <a
            href="https://mantif.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#004B79] text-[#002137] font-semibold transition-colors flex items-center gap-1"
          >
            <span>mantif.com ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
