import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { siteContent } from '../data/content';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';
import { MediaRevealModal } from '../components/MediaRevealModal';
import {
  Play,
  Pause,
  Eye,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Film,
  RotateCcw,
} from 'lucide-react';

type SceneMode = 'opening' | 'title' | 'chapter_content';

export const JourneySection: React.FC = () => {
  const { journey } = siteContent;
  const [sceneMode, setSceneMode] = useState<SceneMode>('opening');
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  // Auto-play is ENABLED by default so the theatre movie starts and moves automatically!
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(0);
  const [animKey, setAnimKey] = useState<number>(0);

  const [selectedMedia, setSelectedMedia] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    mediaType: 'image' | 'video' | 'placeholder';
    src: string;
    poster?: string;
    caption?: string;
  }>({ isOpen: false, title: '', mediaType: 'image', src: '' });

  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);

  const letterDisplays = ['M', 'Λ', 'N', 'T', 'I', 'F'];
  const activeItem = journey.letters[activeChapterIdx];

  const sceneTabs = [
    { id: 'opening' as const, label: 'PROLOGUE' },
    { id: 'title' as const, label: 'TITLE CARD' },
    { id: 'chapter_content' as const, label: 'CHAPTERS 01-06' },
  ];

  const pillRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const navRef = useRef<HTMLElement>(null);
  const isPillInitialized = useRef<boolean>(false);

  const updatePillPosition = useCallback(
    (animate = true) => {
      const activeEl = tabRefs.current[sceneMode];
      const pill = pillRef.current;
      if (!activeEl || !pill) return;

      const targetX = activeEl.offsetLeft;
      const targetW = activeEl.offsetWidth;

      if (!animate || !isPillInitialized.current) {
        gsap.set(pill, {
          x: targetX,
          width: targetW,
          opacity: 1,
        });
        isPillInitialized.current = true;
      } else {
        // Butter-smooth liquid physics glide across tabs with golden deceleration
        gsap.to(pill, {
          x: targetX,
          width: targetW,
          opacity: 1,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    },
    [sceneMode]
  );

  useLayoutEffect(() => {
    updatePillPosition(isPillInitialized.current);
  }, [sceneMode, updatePillPosition]);

  useEffect(() => {
    const handleResize = () => updatePillPosition(false);
    window.addEventListener('resize', handleResize);
    if (document.fonts) {
      document.fonts.ready.then(() => updatePillPosition(false));
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePillPosition]);

  const CHAPTER_DURATION = 5500; // 5.5s per chapter
  const OPENING_DURATION = 4200; // 4.2s for prologue
  const TITLE_DURATION = 3200;   // 3.2s for title card

  // Velvet Curtain & Screen Closing State (triggers after Chapter F)
  const [isCurtainClosed, setIsCurtainClosed] = useState(false);
  const closingTimeoutRef = useRef<number | null>(null);
  const reopenTimeoutRef = useRef<number | null>(null);

  // Extra archival images for Chapter 01 (M)
  const chapter1Gallery = [
    { src: '/images/gallery_1.webp', fallback: '/images/gallery_1.jpg', title: 'Study 01 · Collaborative Circles' },
    { src: '/images/gallery_2.webp', fallback: '/images/gallery_2.jpg', title: 'Study 02 · Concept Inquiry' },
    { src: '/images/gallery_3.webp', fallback: '/images/gallery_3.jpg', title: 'Study 03 · Mentorship In Action' },
  ];

  /* ─── Chapter Switching with Procedural Sound ─── */
  const goToChapter = useCallback((idx: number) => {
    if (closingTimeoutRef.current) window.clearTimeout(closingTimeoutRef.current);
    if (reopenTimeoutRef.current) window.clearTimeout(reopenTimeoutRef.current);
    setIsCurtainClosed(false);
    setActiveChapterIdx(idx);
    setSelectedGalleryIdx(0);
    setSceneMode('chapter_content');
    setAnimKey((k) => k + 1); // Always restart animation from the first for this chapter
    soundManager.playRopePluck(240 + idx * 45);
  }, []);

  const resetJourneyToFirst = useCallback(() => {
    if (closingTimeoutRef.current) window.clearTimeout(closingTimeoutRef.current);
    if (reopenTimeoutRef.current) window.clearTimeout(reopenTimeoutRef.current);
    setIsCurtainClosed(false);
    setActiveChapterIdx(0);
    setSelectedGalleryIdx(0);
    setSceneMode('opening'); // Always start from PROLOGUE!
    setAnimKey((k) => k + 1);
  }, []);

  // When user clicks to view Journey from Navbar, restart from PROLOGUE
  useEffect(() => {
    const handleSectionView = (e: any) => {
      if (e?.detail?.sectionId === 'journey') {
        resetJourneyToFirst();
      }
    };
    window.addEventListener('mantif:section-view', handleSectionView as EventListener);

    const handleHash = () => {
      if (window.location.hash === '#journey') {
        resetJourneyToFirst();
      }
    };
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView as EventListener);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [resetJourneyToFirst]);

  // When scrolling into Journey after being out of view, automatically restart from PROLOGUE
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
            resetJourneyToFirst();
          }
        }
      },
      { threshold: [0.1, 0.45] }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [resetJourneyToFirst]);

  /* ─── Theatrical Screen Close after Chapter F & Restart From Title Card ─── */
  const closeScreenAndRestartFromTitle = useCallback(() => {
    setIsCurtainClosed(true);
    soundManager.playClick();

    if (closingTimeoutRef.current) window.clearTimeout(closingTimeoutRef.current);
    if (reopenTimeoutRef.current) window.clearTimeout(reopenTimeoutRef.current);

    // 1. Wait for velvet curtains to draw fully across the screen (1100ms)
    closingTimeoutRef.current = window.setTimeout(() => {
      // 2. Behind closed curtains, reset to Title Card
      setSceneMode('title');
      setActiveChapterIdx(0);
      setAnimKey((k) => k + 1);

      // 3. Pause briefly in dark intermission, then reopen curtains to reveal Title Card
      reopenTimeoutRef.current = window.setTimeout(() => {
        setIsCurtainClosed(false);
      }, 500);
    }, 1100);
  }, []);

  useEffect(() => {
    return () => {
      if (closingTimeoutRef.current) window.clearTimeout(closingTimeoutRef.current);
      if (reopenTimeoutRef.current) window.clearTimeout(reopenTimeoutRef.current);
    };
  }, []);

  const handleNextScene = useCallback(() => {
    if (isCurtainClosed) return;
    soundManager.playClick();
    if (sceneMode === 'opening') {
      setSceneMode('title');
      setAnimKey((prev) => prev + 1);
    } else if (sceneMode === 'title') {
      goToChapter(0);
    } else if (sceneMode === 'chapter_content') {
      if (activeChapterIdx >= 5) {
        // After completing Chapter F (Scene 06), screen closes and restarts from Title Card
        closeScreenAndRestartFromTitle();
      } else {
        goToChapter(activeChapterIdx + 1);
      }
    }
  }, [sceneMode, activeChapterIdx, isCurtainClosed, goToChapter, closeScreenAndRestartFromTitle]);

  const handlePrevScene = useCallback(() => {
    if (isCurtainClosed) return;
    soundManager.playClick();
    if (sceneMode === 'chapter_content') {
      if (activeChapterIdx > 0) {
        goToChapter(activeChapterIdx - 1);
      } else {
        setSceneMode('title');
        setAnimKey((prev) => prev + 1);
      }
    } else if (sceneMode === 'title') {
      setSceneMode('opening');
      setAnimKey((prev) => prev + 1);
    } else if (sceneMode === 'opening') {
      goToChapter(5);
    }
  }, [sceneMode, activeChapterIdx, isCurtainClosed, goToChapter]);

  /* ─── AUTOMATIC THEATRE SCREEN MOVIE LOOP ─── */
  useEffect(() => {
    if (!isPlaying || isCurtainClosed) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    let delay = CHAPTER_DURATION;
    if (sceneMode === 'opening') delay = OPENING_DURATION;
    if (sceneMode === 'title') delay = TITLE_DURATION;

    timerRef.current = window.setTimeout(() => {
      handleNextScene();
    }, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isPlaying, isCurtainClosed, sceneMode, activeChapterIdx, handleNextScene]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextScene();
      else if (e.key === 'ArrowLeft') handlePrevScene();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        soundManager.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextScene, handlePrevScene]);

  const openModal = (item: typeof activeItem) => {
    soundManager.playClick();
    const mediaSource =
      item.letter === 'M'
        ? chapter1Gallery[selectedGalleryIdx].src
        : item.mediaSrc;

    setSelectedMedia({
      isOpen: true,
      title: `${item.letter === 'A' ? 'Λ' : item.letter} — ${item.milestone}`,
      subtitle: item.date,
      mediaType: item.mediaType,
      src: mediaSource,
      poster: item.poster,
      caption: item.description,
    });
  };

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#01040A] text-[#FAF8F5] pt-14 sm:pt-16 pb-1 px-2 sm:px-4 lg:px-6 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. CINEMA AUDITORIUM CEILING & PROJECTOR BEAM                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* Overhead Angled Projector Light Cone streaming onto the silver screen */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-[550px] pointer-events-none opacity-30 z-0"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, rgba(223, 183, 74, 0.22) 0deg, transparent 40deg, transparent 320deg, rgba(0, 75, 121, 0.25) 360deg)',
          filter: 'blur(45px)',
        }}
      />

      {/* Animated Projector Dust Particles in Beam */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-96 pointer-events-none opacity-20 z-0 animate-pulse">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #DFB74A 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Auditorium Floor Ambient Golden Bounce from screen */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 pointer-events-none opacity-40 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 95%, rgba(223, 183, 74, 0.18) 0%, rgba(0, 75, 121, 0.1) 40%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── TOP-LEFT BACKGROUND 04 WATERMARK ── */}
      <div
        className="absolute top-10 sm:top-12 md:top-14 left-2 sm:left-5 md:left-8 z-0 pointer-events-none select-none flex items-start gap-3 opacity-90 transition-opacity duration-700"
        aria-hidden="true"
      >
        <span
          className="font-serif font-black text-[6.5rem] sm:text-[9.5rem] md:text-[12.5rem] lg:text-[14.5rem] leading-[0.82] tracking-tighter select-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(223, 183, 74, 0.22) 0%, rgba(223, 183, 74, 0.08) 55%, rgba(0, 75, 121, 0.02) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 35px rgba(223, 183, 74, 0.08)',
            fontFeatureSettings: '"tnum"',
          }}
        >
          04
        </span>
        <div className="hidden sm:flex flex-col gap-1 pt-3 opacity-30">
          <span className="w-8 sm:w-12 h-[1px] bg-[#DFB74A]" />
          <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-[#DFB74A] uppercase font-bold">
            SECTION // 04
          </span>
          <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.18em] text-white/60 uppercase">
            THE MANTIF JOURNEY
          </span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-between min-h-0">
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 2. TOP AUDITORIUM MARQUEE & THEATRE STATUS BAR                          */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-1.5 sm:mb-2 pb-1.5 border-b border-white/[0.08] text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#DFB74A]/15 border border-[#DFB74A]/40 text-[#DFB74A] font-mono text-[9px] sm:text-[10px] font-bold tracking-wider">
              04
            </span>
            <span className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#DFB74A]/10 border border-[#DFB74A]/40 text-[#DFB74A] text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase shadow-[0_0_12px_rgba(223,183,74,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              NOW SHOWING · ORIGINAL THEATRE SCREEN
            </span>
            <span className="text-white/30 hidden md:inline">/</span>
            <span className="text-white/70 tracking-[0.2em] uppercase text-[9px] sm:text-[10px] hidden md:inline">
              AUTOMATED CINEMATIC REEL
            </span>
          </div>

          {/* Quick Scene Selector Shortcuts with Smooth Sliding Glider */}
          <nav
            ref={navRef}
            aria-label="Cinema scenes"
            className="relative flex items-center p-1 rounded-full bg-black/65 border border-white/12 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]"
          >
            {/* The Smooth Sliding Golden Pill Glider with Cinema Halo */}
            <div
              ref={pillRef}
              className="absolute top-1 bottom-1 left-0 rounded-full pointer-events-none"
              style={{
                opacity: 0,
                background: 'linear-gradient(135deg, #F5D77F 0%, #DFB74A 55%, #C89930 100%)',
                boxShadow:
                  '0 0 20px rgba(223, 183, 74, 0.75), 0 0 35px rgba(223, 183, 74, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
              }}
            />

            {sceneTabs.map((tab) => {
              const isActive = sceneMode === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  onClick={() => {
                    if (tab.id === 'chapter_content') {
                      goToChapter(0);
                    } else {
                      setSceneMode(tab.id);
                      setAnimKey((k) => k + 1);
                      soundManager.playClick();
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isActive) soundManager.playHoverTick();
                  }}
                  className={`relative z-10 px-3.5 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold font-mono transition-colors duration-300 select-none ${
                    isActive
                      ? 'text-[#002137] font-bold drop-shadow-xs'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 3. THE GRAND MOVIE THEATRE PROSCENIUM SETUP WITH DRAPES & SCREEN        */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* ── TOP STAGE VALANCE DRAPERY (COMPACT CINEMA CANOPY) ── */}
          <div
            className="relative z-30 w-full h-8 sm:h-9 md:h-10 rounded-t-xl sm:rounded-t-2xl shadow-2xl flex items-center justify-center overflow-hidden border-t-2 border-x-2 border-[#DFB74A]/50 shrink-0"
            style={{
              background: `
                linear-gradient(180deg, #4d0a14 0%, #2e050c 65%, #140205 100%)
              `,
              borderBottom: '2px solid rgba(223, 183, 74, 0.85)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.9), inset 0 2px 10px rgba(223, 183, 74, 0.35)',
            }}
          >
            {/* Subtle velvet pleats across valance */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #000 0px, transparent 15px, #DFB74A 30px, transparent 45px, #000 60px)',
              }}
            />

            <div className="relative z-10 flex items-center gap-2.5 sm:gap-4 md:gap-6 px-4">
              <div className="w-10 sm:w-20 md:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFB74A] to-[#DFB74A] shadow-[0_0_8px_#DFB74A]" />
              <span className="font-serif italic font-bold text-xs sm:text-sm md:text-base text-[#DFB74A] tracking-[0.25em] sm:tracking-[0.34em] uppercase drop-shadow-[0_0_12px_rgba(223,183,74,0.7)] whitespace-nowrap">
                ✦ MANTIF CINEMA AUDITORIUM ✦
              </span>
              <div className="w-10 sm:w-20 md:w-36 h-[1.5px] bg-gradient-to-l from-transparent via-[#DFB74A] to-[#DFB74A] shadow-[0_0_8px_#DFB74A]" />
            </div>
          </div>

          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
            {/* ── LEFT THEATRE VELVET CURTAIN DRAPE (CLOSES ON COMPLETING F) ── */}
            <div
              className={`absolute left-0 top-0 bottom-0 z-40 pointer-events-none rounded-bl-xl sm:rounded-bl-2xl overflow-hidden shadow-2xl transition-[width] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isCurtainClosed ? 'w-[50.5%]' : 'w-4 sm:w-7 md:w-10 lg:w-12'
              }`}
              style={{
                background: `
                  repeating-linear-gradient(90deg, 
                    #110204 0px, 
                    #2c060b 8px, 
                    #1a0306 16px, 
                    #3a080f 24px, 
                    #160205 32px, 
                    #2c060b 40px)
                `,
                borderRight: isCurtainClosed
                  ? '3px solid rgba(223, 183, 74, 0.95)'
                  : 'none',
                boxShadow: isCurtainClosed
                  ? 'inset -12px 0 35px rgba(0, 0, 0, 0.95), 10px 0 35px rgba(0, 0, 0, 0.95)'
                  : 'inset -4px 0 16px rgba(0, 0, 0, 0.9), 6px 0 20px rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Golden curtain tieback cord on left */}
              <div
                className={`absolute top-1/2 right-1 -translate-y-1/2 w-2.5 h-8 rounded-full border-r-2 border-[#DFB74A] shadow-[0_0_8px_#DFB74A] transition-opacity duration-500 ${
                  isCurtainClosed ? 'opacity-0' : 'opacity-70'
                }`}
              />
            </div>

            {/* ── RIGHT THEATRE VELVET CURTAIN DRAPE (CLOSES ON COMPLETING F) ── */}
            <div
              className={`absolute right-0 top-0 bottom-0 z-40 pointer-events-none rounded-br-xl sm:rounded-br-2xl overflow-hidden shadow-2xl transition-[width] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isCurtainClosed ? 'w-[50.5%]' : 'w-4 sm:w-7 md:w-10 lg:w-12'
              }`}
              style={{
                background: `
                  repeating-linear-gradient(90deg, 
                    #160205 0px, 
                    #2c060b 8px, 
                    #1a0306 16px, 
                    #3a080f 24px, 
                    #110204 32px, 
                    #2c060b 40px)
                `,
                borderLeft: isCurtainClosed
                  ? '3px solid rgba(223, 183, 74, 0.95)'
                  : 'none',
                boxShadow: isCurtainClosed
                  ? 'inset 12px 0 35px rgba(0, 0, 0, 0.95), -10px 0 35px rgba(0, 0, 0, 0.95)'
                  : 'inset 4px 0 16px rgba(0, 0, 0, 0.9), -6px 0 20px rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Golden curtain tieback cord on right */}
              <div
                className={`absolute top-1/2 left-1 -translate-y-1/2 w-2.5 h-8 rounded-full border-l-2 border-[#DFB74A] shadow-[0_0_8px_#DFB74A] transition-opacity duration-500 ${
                  isCurtainClosed ? 'opacity-0' : 'opacity-70'
                }`}
              />
            </div>

            {/* ── CENTER THEATRE SEAL (VISIBLE WHEN CURTAINS MEET) ── */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center justify-center transition-all duration-700 ${
                isCurtainClosed
                  ? 'opacity-100 scale-100 delay-300'
                  : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#DFB74A] bg-[#000812] flex items-center justify-center shadow-[0_0_35px_rgba(223,183,74,0.7)]">
                <Film className="w-7 h-7 sm:w-8 sm:h-8 text-[#DFB74A] animate-pulse" />
              </div>
              <div className="mt-2.5 px-3 py-1 rounded-full bg-black/85 border border-[#DFB74A]/60 shadow-[0_0_15px_rgba(223,183,74,0.3)]">
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-[#DFB74A] uppercase font-bold">
                  ✦ SCREEN CLOSING · RESTARTING ✦
                </span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* THE ORIGINAL EXPANDED CURVED SILVER SCREEN CONTAINER               */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div
              className="relative w-full h-full rounded-b-xl sm:rounded-b-2xl overflow-hidden bg-[#000812] border-b-2 border-x-2 border-[#DFB74A]/40 shadow-2xl flex flex-col justify-between min-h-0"
              style={{
                boxShadow: `
                  0 20px 80px -10px rgba(0, 0, 0, 0.98),
                  0 0 60px -5px rgba(223, 183, 74, 0.3),
                  inset 0 0 50px rgba(0, 0, 0, 0.9)
                `,
              }}
            >
            {/* Film grain overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(#FAF8F5 1px, transparent 1px)`,
                backgroundSize: '3px 3px',
              }}
            />

            {/* ── TOP MATTE LETTERBOX BAR (CINEMA METADATA) ── */}
            <div className="relative z-40 w-full h-7 sm:h-8 bg-[#000308] border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between font-mono text-[8px] sm:text-[9px] md:text-[10px] text-white/40 tracking-[0.2em] uppercase shrink-0">
              <div className="flex items-center gap-2 text-[#DFB74A]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="font-bold">LIVE PROJECTION</span>
                <span className="text-white/20">|</span>
                <span className="text-white/70">24 FPS SCOPE</span>
              </div>

              {/* Central Auto-Advancing Scene Progress Indicator */}
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-[#DFB74A] font-bold">
                  {isPlaying ? 'AUTO-ADVANCING REEL' : 'PAUSED'}
                </span>
                <span className="text-white/30 hidden sm:inline">✦</span>
                <span className="hidden sm:inline font-sans">
                  Scene 0{activeChapterIdx + 1} of 06
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[#DFB74A] font-bold">
                <span>SCENE 0{activeChapterIdx + 1}</span>
                <span className="text-white/20">/</span>
                <span className="text-white/40">06</span>
              </div>
            </div>

            {/* ── CENTRAL PROJECTED CINEMA CONTENT STAGE ── */}
            <div className="relative w-full flex-1 min-h-0 overflow-hidden flex flex-col justify-between">
              {/* ───────────────────────────────────────────────────────── */}
              {/* SCENE A: PROLOGUE MANIFESTO CARD                          */}
              {/* ───────────────────────────────────────────────────────── */}
              {sceneMode === 'opening' && (
                <div
                  key={`opening-${animKey}`}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#00060E]"
                  style={{
                    animation: 'theatreSceneFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  <div
                    className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(223, 183, 74, 0.25) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }}
                  />

                  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    <span className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-[#DFB74A] uppercase mb-4 animate-pulse">
                      ✦ PROLOGUE · THE LIVING CONTINUUM ✦
                    </span>

                    <h3
                      className="font-serif italic font-light text-2xl sm:text-4xl lg:text-5xl text-[#FAF8F5] leading-snug sm:leading-tight mb-6"
                      style={{
                        textShadow: '0 0 35px rgba(223, 183, 74, 0.4)',
                      }}
                    >
                      "MANTIF as a handcrafted puppet theatre."
                    </h3>

                    <p className="font-sans text-xs sm:text-sm md:text-base text-white/75 leading-relaxed max-w-xl font-light tracking-wide mb-8">
                      Each letter is suspended by a rope of memory, connecting each milestone into one living continuum.
                    </p>

                    <div className="flex items-center gap-3 font-mono text-[10px] text-[#DFB74A]">
                      <span>NEXT SCENE ADVANCING AUTOMATICALLY...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────── */}
              {/* SCENE B: MAIN MOVIE TITLE CARD                             */}
              {/* ───────────────────────────────────────────────────────── */}
              {sceneMode === 'title' && (
                <div
                  key={`title-${animKey}`}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#00040A]"
                  style={{
                    animation: 'theatreSceneFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  <div
                    className="absolute w-80 h-80 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(0, 75, 121, 0.35) 0%, transparent 70%)',
                      filter: 'blur(45px)',
                    }}
                  />

                  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.35em] text-[#DFB74A] uppercase mb-4">
                      <span>MANTIF CINEMATIC PRESENTATION</span>
                      <span>✦</span>
                      <span>2024</span>
                    </div>

                    <h2
                      className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-[#FAF8F5] tracking-tight mb-4"
                      style={{
                        textShadow: '0 0 50px rgba(223, 183, 74, 0.35)',
                      }}
                    >
                      THE MANTIF JOURNEY
                    </h2>

                    <div className="w-16 h-[1.5px] bg-[#DFB74A] my-3" />

                    <p className="font-mono text-xs sm:text-sm tracking-[0.28em] text-[#94A3B8] uppercase mb-6">
                      CHAPTER 04 · CHRONICLES & MILESTONES
                    </p>

                    <span className="font-mono text-[10px] text-[#DFB74A] animate-pulse">
                      STARTING CHAPTER 01 AUTOMATICALLY...
                    </span>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────── */}
              {/* SCENE C: CHAPTER DOCUMENTARY & PUPPET GANTRY (DEFAULT)     */}
              {/* ───────────────────────────────────────────────────────── */}
              {sceneMode === 'chapter_content' && (
                <div
                  key={`chapter-scene-shell-${animKey}`}
                  className="relative z-10 w-full h-full flex flex-col justify-between p-2 sm:p-3 lg:p-4 min-h-0"
                  style={{
                    animation: 'theatreSceneFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  {/* ── 1. PUPPET THEATRE GANTRY & SUSPENDED ROPES ── */}
                  <div className="w-full shrink-0 border-b border-white/[0.08] pb-1.5 sm:pb-2">
                    <div className="grid grid-cols-6 items-end">
                      {journey.letters.map((item, idx) => {
                        const isActive = activeChapterIdx === idx;
                        const isPast = idx < activeChapterIdx;
                        const char = letterDisplays[idx];

                        return (
                          <div
                            key={item.letter}
                            onClick={() => goToChapter(idx)}
                            onMouseEnter={() => {
                              setCursorMode('hover');
                              soundManager.playHoverTick();
                            }}
                            onMouseLeave={() => setCursorMode('default')}
                            className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${
                              isActive
                                ? 'opacity-100 scale-105'
                                : 'opacity-85 hover:opacity-100 hover:scale-100'
                            }`}
                          >
                            {/* Pulley & Rope Cord */}
                            <svg className="w-full h-4 sm:h-5 overflow-visible" preserveAspectRatio="xMidYMid meet">
                              <circle cx="50%" cy="3" r="3" fill="#DFB74A" stroke="#000" strokeWidth="1" />
                              <line
                                x1="50%"
                                y1="3"
                                x2="50%"
                                y2="100%"
                                stroke={isActive ? '#DFB74A' : '#DFB74A'}
                                strokeOpacity={isActive ? 1 : 0.45}
                                strokeWidth={isActive ? '2.5' : '1.5'}
                                strokeDasharray={!isPast && !isActive ? '3 3' : 'none'}
                                style={
                                  isActive
                                    ? {
                                        filter: 'drop-shadow(0 0 8px rgba(223, 183, 74, 0.95))',
                                      }
                                    : undefined
                                }
                              />
                            </svg>

                            {/* Hanging Marionette Letter Tile (Clean without under-words) */}
                            <div
                              className={`relative px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center shadow-lg ${
                                isActive
                                  ? 'bg-[#DFB74A] text-[#002137] border-[#DFB74A] shadow-[0_0_30px_rgba(223,183,74,0.75)] -translate-y-0.5 scale-105'
                                  : 'bg-[#002137]/90 text-white border-white/25 hover:border-[#DFB74A]/80 hover:bg-[#002F4D]'
                              }`}
                              style={
                                isActive
                                  ? {
                                      animation: 'theatrePuppetSway 3.5s ease-in-out infinite',
                                      transformOrigin: 'top center',
                                    }
                                  : undefined
                              }
                            >
                              <span className="font-serif font-bold text-lg sm:text-2xl leading-none">
                                {char}
                              </span>
                              <span className="font-mono text-[7px] sm:text-[8px] tracking-wider font-semibold opacity-75 mt-0.5">
                                0{idx + 1}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── 2. DOCUMENTARY SCENE SPLIT: WIDESCREEN FILM MONITOR & BALANCED NARRATIVE ── */}
                  <div
                    key={`chapter-split-${activeChapterIdx}`}
                    className="flex-1 w-full max-w-[1340px] mx-auto grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 sm:gap-6 lg:gap-12 xl:gap-16 items-center my-auto py-1 sm:py-2 px-3 sm:px-6 lg:px-8 min-h-0 overflow-hidden"
                    style={{
                      animation: 'theatreChapterFadeIn 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    }}
                  >
                    {/* LEFT: WIDESCREEN FILM FRAME (LITTLE BIG & CRISP) */}
                    <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[450px] xl:max-w-[480px] aspect-video max-h-[170px] sm:max-h-[215px] lg:max-h-[235px] rounded-xl overflow-hidden bg-[#00111E] border-2 border-[#DFB74A]/45 shadow-[0_12px_35px_rgba(0,0,0,0.88),0_0_25px_rgba(223,183,74,0.22)] group mx-auto lg:mx-0 shrink-0">
                      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

                      {/* Video or Image */}
                      {activeItem.mediaType === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            src={activeItem.mediaSrc}
                            poster={activeItem.poster?.replace('.png', '.webp') || activeItem.poster}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          {/* Timecode overlay */}
                          <div className="absolute top-2.5 left-2.5 z-30 font-mono text-[8px] sm:text-[9px] text-[#FAF8F5] tracking-widest uppercase flex items-center gap-1.5 bg-black/85 px-2.5 py-0.5 rounded border border-white/10 backdrop-blur-xs shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            <span className="font-bold">MANTIF ARCHIVE // SCENE 0{activeChapterIdx + 1}</span>
                          </div>
                          <button
                            onClick={() => openModal(activeItem)}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 hover:bg-black/10 transition-colors group"
                            title="Play full video"
                          >
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#DFB74A] text-[#002137] flex items-center justify-center shadow-[0_0_25px_rgba(223,183,74,0.75)] group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                            </div>
                          </button>
                        </div>
                      ) : activeItem.mediaType === 'image' && activeItem.mediaSrc ? (
                        <div
                          onClick={() => openModal(activeItem)}
                          className="relative w-full h-full cursor-pointer overflow-hidden"
                        >
                          {/* Continuous Slow Ken Burns Motion */}
                          <picture className="w-full h-full block">
                            <source
                              srcSet={
                                activeItem.letter === 'M'
                                  ? chapter1Gallery[selectedGalleryIdx].src
                                  : activeItem.mediaSrc
                              }
                              type={activeItem.mediaSrc.endsWith('.jpg') ? 'image/jpeg' : 'image/webp'}
                            />
                            <img
                              src={
                                activeItem.letter === 'M'
                                  ? chapter1Gallery[selectedGalleryIdx].src
                                  : activeItem.mediaSrc
                              }
                              alt={activeItem.milestone}
                              loading="eager"
                              decoding="async"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src.endsWith('.webp')) {
                                  target.src = activeItem.mediaSrc.replace(/\.webp$/, '.jpg');
                                } else if (target.src.endsWith('.jpg')) {
                                  target.src = activeItem.mediaSrc.replace(/\.jpg$/, '.webp');
                                }
                              }}
                              className="w-full h-full object-cover transition-transform duration-[12000ms] ease-out group-hover:scale-105"
                              style={{
                                animation: 'theatreKenBurns 16s ease-in-out infinite alternate',
                                objectPosition:
                                  activeItem.letter === 'T'
                                    ? 'center 22%'
                                    : activeItem.letter === 'F'
                                    ? 'center 45%'
                                    : 'center',
                              }}
                            />
                          </picture>

                          {/* Timecode overlay */}
                          <div className="absolute top-2.5 left-2.5 z-30 font-mono text-[8px] sm:text-[9px] text-[#FAF8F5] tracking-widest uppercase flex items-center gap-1.5 bg-black/85 px-2.5 py-0.5 rounded border border-white/10 backdrop-blur-xs shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
                            <span className="font-bold">MANTIF ARCHIVE // SCENE 0{activeChapterIdx + 1}</span>
                          </div>

                          {/* Expand badge */}
                          <div className="absolute bottom-2.5 right-2.5 z-30 font-mono text-[8px] sm:text-[9px] text-white tracking-wider uppercase flex items-center gap-1 bg-black/85 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xs hover:bg-[#DFB74A] hover:text-[#002137] transition-all font-semibold shadow-md">
                            <Eye className="w-3 h-3 text-[#DFB74A]" />
                            <span>EXPAND</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#001422]">
                          <div className="w-9 h-9 rounded-full border border-[#DFB74A]/40 flex items-center justify-center mb-1.5 bg-[#002137]">
                            <Sparkles className="w-4 h-4 text-[#DFB74A]" />
                          </div>
                          <span className="font-mono text-[8.5px] tracking-[0.25em] text-[#DFB74A] uppercase font-bold">
                            UPCOMING TALENT COHORT
                          </span>
                          <h4 className="font-serif text-base sm:text-lg font-bold text-[#FAF8F5] mt-0.5">
                            DOCUMENTATION IN TRANSIT
                          </h4>
                          <p className="font-sans text-[11px] text-white/70 max-w-xs mt-0.5">
                            Authentic documentation for new educator & engineering cohort is being recorded.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: DOCUMENTARY NARRATIVE CONTENT (COVERS RIGHT SPACE BEAUTIFULLY) */}
                    <div className="flex flex-col justify-center space-y-2 sm:space-y-2.5 pr-2 sm:pr-4 lg:pr-8 overflow-hidden min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                        <span className="px-3 py-0.5 rounded-full bg-[#DFB74A]/15 border border-[#DFB74A]/50 text-[#DFB74A] text-[9.5px] sm:text-[10.5px] font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(223,183,74,0.25)]">
                          {activeItem.date}
                        </span>
                        <span className="text-white/30">✦</span>
                        <span className="text-[#A5B4FC] text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold">
                          {activeItem.tag}
                        </span>
                        <span className="text-white/30 hidden sm:inline">✦</span>
                        <span className="font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.22em] text-[#DFB74A] uppercase font-bold hidden sm:inline">
                          {activeItem.character}
                        </span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] tracking-[0.2em] text-[#DFB74A] uppercase font-bold block sm:hidden mb-0.5">
                          {activeItem.character}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FAF8F5] tracking-tight leading-snug">
                          {activeItem.milestone}
                        </h3>
                      </div>

                      <p className="font-sans text-xs sm:text-sm lg:text-[15px] text-white/90 leading-relaxed font-normal w-full max-w-2xl lg:max-w-3xl">
                        {activeItem.description}
                      </p>

                      {/* Archival Filmstrip for Chapter 01 (M) */}
                      {activeItem.letter === 'M' && (
                        <div className="pt-0.5">
                          <span className="font-mono text-[8.5px] sm:text-[9.5px] text-[#DFB74A] uppercase tracking-[0.2em] font-semibold block mb-1">
                            ARCHIVAL CONTACT SHEET :
                          </span>
                          <div className="flex items-center gap-2.5">
                            {chapter1Gallery.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedGalleryIdx(i)}
                                className={`relative w-14 h-9 sm:w-16 sm:h-10 rounded-md overflow-hidden border-2 transition-all ${
                                  selectedGalleryIdx === i
                                    ? 'border-[#DFB74A] ring-2 ring-[#DFB74A]/50 scale-105 shadow-md'
                                    : 'border-white/30 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-1.5 flex items-center gap-3">
                        <button
                          onClick={() => openModal(activeItem)}
                          onMouseEnter={() => setCursorMode('hover')}
                          onMouseLeave={() => setCursorMode('default')}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#DFB74A] to-[#F5D77F] text-[#002137] hover:from-white hover:to-white font-mono text-[10px] sm:text-[11.5px] font-bold tracking-wider uppercase transition-all shadow-[0_0_18px_rgba(223,183,74,0.35)] hover:scale-105"
                        >
                          {activeItem.mediaType === 'video' ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>PLAY CINEMATIC VIDEO</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>FULL RESOLUTION ARCHIVE</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── BOTTOM CINEMATIC LETTERBOX BAR & REAL-TIME AUTO-PROGRESS TRACK ── */}
            <footer className="relative z-40 w-full h-7 sm:h-9 bg-[#000308] border-t border-white/[0.08] px-3 sm:px-6 flex items-center justify-between font-mono text-[9px] sm:text-[10px] shrink-0">
              {/* Previous Scene Button */}
              <button
                onClick={handlePrevScene}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-white/70 hover:text-[#DFB74A] hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline">PREV SCENE</span>
              </button>

              {/* Center: Cinema Auto-Play Scrubber Timeline */}
              <div className="flex items-center gap-2 sm:gap-3 max-w-md w-full justify-center px-2">
                <button
                  onClick={() => {
                    setIsPlaying((p) => !p);
                    soundManager.playClick();
                  }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#DFB74A]/60 flex items-center justify-center text-[#DFB74A] hover:bg-[#DFB74A] hover:text-[#002137] transition-all shrink-0 shadow-[0_0_8px_rgba(223,183,74,0.3)]"
                  title={isPlaying ? 'Pause movie' : 'Play movie'}
                >
                  {isPlaying ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />}
                </button>

                {/* 6 Segmented Chapter Dots with Live Auto-Countdown Progress Bar */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {journey.letters.map((_, i) => {
                    const isCur = activeChapterIdx === i && sceneMode === 'chapter_content';
                    const isDone = i < activeChapterIdx && sceneMode === 'chapter_content';

                    return (
                      <button
                        key={i}
                        onClick={() => goToChapter(i)}
                        className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 ${
                          isCur
                            ? 'w-7 sm:w-10 bg-white/20'
                            : isDone
                            ? 'w-2 sm:w-2.5 bg-[#DFB74A]'
                            : 'w-2 sm:w-2.5 bg-white/20 hover:bg-white/40'
                        }`}
                        title={`Scene 0${i + 1}`}
                      >
                        {/* Live countdown fill animation when playing this chapter */}
                        {isCur && (
                          <div
                            key={`progress-${activeChapterIdx}-${isPlaying}`}
                            className="h-full bg-[#DFB74A] shadow-[0_0_10px_#DFB74A]"
                            style={{
                              animation: isPlaying
                                ? `theatreBarCountdown ${CHAPTER_DURATION}ms linear forwards`
                                : 'none',
                              width: isPlaying ? undefined : '100%',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[9px] sm:text-[10px] tracking-widest text-[#DFB74A] uppercase font-bold hidden md:inline">
                  {sceneMode === 'opening'
                    ? 'PROLOGUE'
                    : sceneMode === 'title'
                    ? 'TITLE CARD'
                    : `CHAPTER 0${activeChapterIdx + 1} / 06`}
                </span>
              </div>

              {/* Next Scene Button */}
              <button
                onClick={handleNextScene}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 rounded-full border border-white/15 text-white/80 hover:text-[#DFB74A] hover:border-[#DFB74A]/50 transition-all uppercase tracking-wider"
              >
                <span className="hidden sm:inline">NEXT SCENE</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </footer>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 4. REALISTIC AUDIENCE CINEMA THEATRE SETUP: 2 ROWS OF AUDITORIUM CHAIRS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative w-full max-w-[1400px] -mt-2 sm:-mt-3 md:-mt-4 z-30 pointer-events-none select-none shrink-0">
          {/* Realistic 2-Tier Auditorium Cinema Seating with Contoured Seats, Backrests, Armrests & Rim Lights */}
          <svg
            viewBox="0 0 1400 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-14 sm:h-18 md:h-22 drop-shadow-[0_-12px_28px_rgba(0,0,0,0.95)]"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Silver screen bounce glow on Back Row headrests */}
              <linearGradient id="backSeatRim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DFB74A" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#04060d" stopOpacity="0" />
              </linearGradient>

              {/* Vivid screen rim reflection on Front Row VIP headrests */}
              <linearGradient id="frontSeatRim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF3C4" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#DFB74A" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#004B79" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#010307" stopOpacity="0" />
              </linearGradient>

              {/* Luxury velvet cushion depth */}
              <linearGradient id="frontSeatCushion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d1320" />
                <stop offset="50%" stopColor="#070a12" />
                <stop offset="100%" stopColor="#020306" />
              </linearGradient>

              {/* Back row cushion */}
              <linearGradient id="backSeatCushion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#080c14" />
                <stop offset="100%" stopColor="#030408" />
              </linearGradient>
            </defs>

            {/* ── TIER 2: BACK ROW ELEVATED AUDITORIUM SEATS (10 SEATS) ── */}
            <g opacity="0.75">
              {[80, 215, 350, 485, 620, 755, 890, 1025, 1160, 1295].map((cx, i) => (
                <g key={`back-seat-${i}`}>
                  {/* Headrest */}
                  <rect x={cx - 36} y="14" width="72" height="22" rx="7" fill="url(#backSeatCushion)" />
                  {/* Curved top rim light catching cinema projection */}
                  <path
                    d={`M${cx - 36} 23 Q${cx} 13 ${cx + 36} 23`}
                    stroke="url(#backSeatRim)"
                    strokeWidth="1.8"
                  />
                  {/* Seat Back Cushion */}
                  <path
                    d={`M${cx - 32} 32 L${cx + 32} 32 L${cx + 28} 68 L${cx - 28} 68 Z`}
                    fill="#04060d"
                  />
                  {/* Vertical stitch line */}
                  <line x1={cx} y1="33" x2={cx} y2="67" stroke="#000" strokeWidth="1.5" opacity="0.8" />
                  {/* Armrests between seats */}
                  <rect x={cx - 43} y="38" width="9" height="28" rx="3.5" fill="#020408" />
                  <rect x={cx + 34} y="38" width="9" height="28" rx="3.5" fill="#020408" />
                  {/* Seat letter tag */}
                  <text
                    x={cx}
                    y="52"
                    fill="#DFB74A"
                    fillOpacity="0.25"
                    fontSize="6.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    B{i + 1}
                  </text>
                </g>
              ))}
            </g>

            {/* ── TIER 1: FRONT ROW VIP LUXURY SEATS (11 STAGGERED SEATS) ── */}
            <g>
              {[10, 147, 282, 417, 552, 687, 822, 957, 1092, 1227, 1362].map((cx, i) => (
                <g key={`front-seat-${i}`}>
                  {/* Plush Contoured Headrest */}
                  <rect x={cx - 46} y="44" width="92" height="28" rx="10" fill="#090e18" />
                  {/* Double screen rim reflection along curved headrest top */}
                  <path
                    d={`M${cx - 44} 56 Q${cx} 44 ${cx + 44} 56`}
                    stroke="url(#frontSeatRim)"
                    strokeWidth="2.6"
                  />
                  <path
                    d={`M${cx - 30} 51 Q${cx} 46 ${cx + 30} 51`}
                    stroke="#FFF3C4"
                    strokeWidth="1"
                    strokeOpacity="0.75"
                  />

                  {/* Contoured Back Cushion */}
                  <path
                    d={`M${cx - 42} 70 L${cx + 42} 70 L${cx + 38} 120 L${cx - 38} 120 Z`}
                    fill="url(#frontSeatCushion)"
                  />
                  {/* Central upholstery stitch line */}
                  <line x1={cx} y1="71" x2={cx} y2="120" stroke="#000" strokeWidth="2" opacity="0.8" />
                  {/* Horizontal lumbar contour seam */}
                  <path
                    d={`M${cx - 36} 92 Q${cx} 96 ${cx + 36} 92`}
                    stroke="#000"
                    strokeWidth="1.8"
                    opacity="0.6"
                  />

                  {/* VIP Armrests on Left & Right */}
                  <rect x={cx - 55} y="72" width="13" height="48" rx="5" fill="#03050a" />
                  <rect x={cx + 42} y="72" width="13" height="48" rx="5" fill="#03050a" />
                  {/* Armrest top rim edge */}
                  <path
                    d={`M${cx - 55} 75 Q${cx - 48} 72 ${cx - 42} 75`}
                    stroke="#DFB74A"
                    strokeOpacity="0.4"
                    strokeWidth="1.2"
                  />
                  <path
                    d={`M${cx + 42} 75 Q${cx + 48} 72 ${cx + 55} 75`}
                    stroke="#DFB74A"
                    strokeOpacity="0.4"
                    strokeWidth="1.2"
                  />
                  {/* Amber illuminated cupholder ring */}
                  <circle
                    cx={cx - 48}
                    cy="82"
                    r="2.8"
                    fill="none"
                    stroke="#DFB74A"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <circle
                    cx={cx + 48}
                    cy="82"
                    r="2.8"
                    fill="none"
                    stroke="#DFB74A"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />

                  {/* VIP Seat Number Badge */}
                  <text
                    x={cx}
                    y="88"
                    fill="#DFB74A"
                    fillOpacity="0.35"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    A{i + 1}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

      </div>

      {/* High-Resolution Media Reveal Modal */}
      <MediaRevealModal
        isOpen={selectedMedia.isOpen}
        onClose={() => setSelectedMedia((p) => ({ ...p, isOpen: false }))}
        title={selectedMedia.title}
        subtitle={selectedMedia.subtitle}
        mediaType={selectedMedia.mediaType}
        src={selectedMedia.src}
        poster={selectedMedia.poster}
        caption={selectedMedia.caption}
      />

      {/* ── THEATRE & PROSCENIUM KEYFRAME ANIMATIONS ── */}
      <style>{`
        @keyframes theatreBarCountdown {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes theatrePuppetSway {
          0%, 100% {
            transform: translateY(-4px) rotate(0deg) scale(1.05);
          }
          25% {
            transform: translateY(-5px) rotate(2deg) scale(1.05);
          }
          75% {
            transform: translateY(-3px) rotate(-2deg) scale(1.05);
          }
        }

        @keyframes theatreKenBurns {
          0% {
            transform: scale(1.02) translate(0, 0);
          }
          50% {
            transform: scale(1.08) translate(-1.5%, -1%);
          }
          100% {
            transform: scale(1.03) translate(1.5%, 0.5%);
          }
        }

        @keyframes theatreSceneFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.988);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }

        @keyframes theatreChapterFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>
    </section>
  );
};

export default JourneySection;
