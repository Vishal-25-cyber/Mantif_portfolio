import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

type CinematicPhase =
  | 'typewriter'       // 1. Plain dark screen, letter-by-letter with printing sound
  | 'transformation'   // 2. Single smooth morph: Ancient Gurukulam → Modern AI Classroom
  | 'pledge';          // 3. Display the pledge separately in all its majesty

// ── FIXED IMMUTABLE MOVIE ENTRY CARD CHARACTERS ──
interface EntryWord {
  word: string;
  isMantif: boolean;
  letters: { char: string; idx: number }[];
}

const PROCESSED_ENTRY_WORDS: EntryWord[] = [
  {
    word: 'What',
    isMantif: false,
    letters: [
      { char: 'W', idx: 0 },
      { char: 'h', idx: 1 },
      { char: 'a', idx: 2 },
      { char: 't', idx: 3 },
    ],
  },
  {
    word: 'is',
    isMantif: false,
    letters: [
      { char: 'i', idx: 4 },
      { char: 's', idx: 5 },
    ],
  },
  {
    word: 'MANTIF',
    isMantif: true,
    letters: [
      { char: 'M', idx: 6 },
      { char: 'A', idx: 7 },
      { char: 'N', idx: 8 },
      { char: 'T', idx: 9 },
      { char: 'I', idx: 10 },
      { char: 'F', idx: 11 },
    ],
  },
  {
    word: 'trying',
    isMantif: false,
    letters: [
      { char: 't', idx: 12 },
      { char: 'r', idx: 13 },
      { char: 'y', idx: 14 },
      { char: 'i', idx: 15 },
      { char: 'n', idx: 16 },
      { char: 'g', idx: 17 },
    ],
  },
  {
    word: 'to',
    isMantif: false,
    letters: [
      { char: 't', idx: 18 },
      { char: 'o', idx: 19 },
    ],
  },
  {
    word: 'do?',
    isMantif: false,
    letters: [
      { char: 'd', idx: 20 },
      { char: 'o', idx: 21 },
      { char: '?', idx: 22 },
    ],
  },
];

const TOTAL_ENTRY_LETTERS = 23;

export const PhilosophySection: React.FC = () => {
  const [phase, setPhase] = useState<CinematicPhase>('typewriter');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // ── ACT 1: TYPEWRITER FLY-IN LETTERS STATE ──
  const [typedCharsCount, setTypedCharsCount] = useState<number>(0);
  const [typewriterFading, setTypewriterFading] = useState<boolean>(false);

  // ── ACT 2: SINGLE SMOOTH TRANSFORMATION STATE ──
  const [morphProgress, setMorphProgress] = useState<number>(0); // 0 (Ancient Gurukulam) to 1 (Modern AI)
  const [stageFading, setStageFading] = useState<boolean>(false);

  // ── ACT 3: THE PLEDGE SEPARATELY STATE ──
  const [pledgeRevealedStep, setPledgeRevealedStep] = useState<number>(0);

  // Cycle key to guarantee re-running animations from step 1 on every click/view
  const [animCycleKey, setAnimCycleKey] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and unlock audio graph by default
  useEffect(() => {
    soundManager.unlockAudio();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1: MOVIE ENTRY CARD LETTER-BY-LETTER FLY-IN WITH PRINTING SOUND
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'typewriter') return;

    setTypedCharsCount(0);
    setTypewriterFading(false);

    let charIdx = 0;
    let isFinished = false;
    let fadeTimer: number;
    let transTimer: number;

    const interval = window.setInterval(() => {
      if (!isPlaying || isFinished) return;

      charIdx++;
      setTypedCharsCount(charIdx);

      // Play mechanical sound only while printing valid letters (1 to 23)
      if (charIdx <= TOTAL_ENTRY_LETTERS) {
        soundManager.playTypewriterKey(charIdx);
      }

      // The exact moment the '?' symbol lands (character 23), stop typing completely and bring the image!
      if (charIdx >= TOTAL_ENTRY_LETTERS) {
        isFinished = true;
        window.clearInterval(interval);

        // Right after '?' symbol, smoothly reveal the image without delay
        fadeTimer = window.setTimeout(() => {
          setTypewriterFading(true);

          transTimer = window.setTimeout(() => {
            setPhase('transformation');
          }, 250);
        }, 300);
      }
    }, 105);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(transTimer);
    };
  }, [phase, isPlaying, animCycleKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 2: SINGLE SMOOTH CONTINUOUS TRANSFORMATION (GURUKULAM → MODERN AI)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'transformation') return;

    setMorphProgress(0);
    setStageFading(false);
    soundManager.playHistoricalAmbience();

    let animFrame: number;
    let timeoutToPledge: number;
    let timeoutFadeOut: number;
    let timeoutMorphStart: number;

    // 1. Brief 700ms opening breath showing ancient Gurukulam in all its purity
    timeoutMorphStart = window.setTimeout(() => {
      soundManager.playDigitalMorphSweep();

      const morphStartTime = performance.now();
      const morphDuration = 3200; // 3.2s single unbroken smooth dissolve

      const step = (now: number) => {
        if (!isPlaying) return;
        const elapsed = now - morphStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / morphDuration));
        setMorphProgress(progress);

        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          // 2. Hold the transformed modern AI classroom for 1.8s, then smoothly transition directly to the pledge
          timeoutFadeOut = window.setTimeout(() => {
            if (isPlaying) {
              setStageFading(true);

              timeoutToPledge = window.setTimeout(() => {
                setPhase('pledge');
                setStageFading(false);
              }, 700);
            }
          }, 1800);
        }
      };

      animFrame = requestAnimationFrame(step);
    }, 700);

    return () => {
      window.clearTimeout(timeoutMorphStart);
      window.clearTimeout(timeoutFadeOut);
      window.clearTimeout(timeoutToPledge);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [phase, isPlaying, animCycleKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 3: DISPLAY THE PLEDGE SEPARATELY
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'pledge') return;

    setPledgeRevealedStep(0);
    soundManager.playCinematicImpact();

    const timers: number[] = [];
    for (let i = 1; i <= 6; i++) {
      const t = window.setTimeout(() => {
        setPledgeRevealedStep(i);
        soundManager.playChime(320 + i * 45, 'sine', 0.6, 0.05);
      }, 700 + (i - 1) * 1100);
      timers.push(t);
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, animCycleKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOATING PARTICLE CANVAS (Cybernetic Light Grid during transformation)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ['#DFB74A', '#004B79', '#38BDF8', '#F5D77F'];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.7 - 0.1,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (phase === 'transformation') {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.save();
          ctx.globalAlpha = p.alpha * morphProgress;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, morphProgress]);

  const handleRestartAll = () => {
    setPhase('typewriter');
    setTypedCharsCount(0);
    setTypewriterFading(false);
    setMorphProgress(0);
    setStageFading(false);
    setPledgeRevealedStep(0);
    setIsPlaying(true);
    setAnimCycleKey((k) => k + 1);
  };

  const handleSkipToPhase = (targetPhase: CinematicPhase) => {
    soundManager.playClick();
    if (targetPhase === 'typewriter') {
      setPhase('typewriter');
      setTypedCharsCount(0);
      setTypewriterFading(false);
      setAnimCycleKey((k) => k + 1);
    } else if (targetPhase === 'transformation') {
      setPhase('transformation');
      setMorphProgress(0);
      setStageFading(false);
      setAnimCycleKey((k) => k + 1);
    } else if (targetPhase === 'pledge') {
      setPhase('pledge');
      setPledgeRevealedStep(0);
      setAnimCycleKey((k) => k + 1);
    }
  };

  // When user clicks to view Philosophy from Navbar or URL hash, start animation from the first
  useEffect(() => {
    const handleSectionView = (e: any) => {
      if (e?.detail?.sectionId === 'philosophy') {
        handleRestartAll();
      }
    };
    window.addEventListener('mantif:section-view', handleSectionView as EventListener);

    const handleHash = () => {
      if (window.location.hash === '#philosophy') {
        handleRestartAll();
      }
    };
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView as EventListener);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // When scrolling into Philosophy after being out of view, automatically start from the first
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
            handleRestartAll();
          }
        }
      },
      { threshold: [0.1, 0.45] }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#02060D] text-[#FAF8F5] overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes kenBurnsHistorical {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.08) translate3d(-1%, -1%, 0);
          }
        }
        @keyframes movieLetterFlyIn {
          0% {
            opacity: 0;
            transform: perspective(900px) translate3d(0, 50px, 180px) scale(2.8) rotateX(-30deg);
            filter: blur(10px) brightness(2.2);
            text-shadow: 0 0 30px rgba(223, 183, 74, 0.9);
          }
          60% {
            opacity: 1;
            transform: perspective(900px) translate3d(0, -6px, -15px) scale(0.94) rotateX(6deg);
            filter: blur(0px) brightness(1.3);
            text-shadow: 0 0 16px rgba(223, 183, 74, 0.5);
          }
          85% {
            transform: perspective(900px) translate3d(0, 2px, 4px) scale(1.03) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: perspective(900px) translate3d(0, 0, 0) scale(1) rotateX(0deg);
            filter: blur(0px) brightness(1);
            text-shadow: 0 0 0px transparent;
          }
        }
        .anim-movie-letter-fly {
          display: inline-block;
          animation: movieLetterFlyIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, filter;
        }
      `}</style>

      {/* Ghost big number backdrop alone */}
      <div
        className="absolute top-4 sm:top-8 left-4 sm:left-10 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span
          className="font-serif font-bold text-[18vw] text-[#DFB74A] leading-none"
          style={{ opacity: 0.05 }}
        >
          05
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MINIMAL TOP UTILITIES (SOUND TOGGLE & QUICK ACT CONTROLS)               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between shrink-0">
        <div />

        {/* Minimal Audio & Progress Navigation */}
        <div className="flex items-center gap-3">
          {/* Quick Act Jump Dots */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            {[
              { id: 'typewriter', label: 'Prologue' },
              { id: 'transformation', label: 'Transformation' },
              { id: 'pledge', label: 'The Pledge' },
            ].map((item, idx) => {
              const isActive = phase === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSkipToPhase(item.id as CinematicPhase)}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-[#DFB74A] text-[#002137]'
                      : 'text-white/40 hover:text-white'
                  }`}
                  title={item.label}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CINEMATIC THEATRE STAGE                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 flex-1 min-h-0 flex items-center justify-center">
        {/* Floating Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
        />

        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(2, 6, 13, 0.8) 85%, #02060D 100%)',
          }}
        />

        {/* =================================================================== */}
        {/* 1. SCENE 1 — PURE DARK SCREEN: MOVIE ENTRY CARD FLY-IN REVEAL       */}
        {/* =================================================================== */}
        {phase === 'typewriter' && (
          <div
            className={`relative z-20 max-w-4xl text-center px-4 transition-all duration-1000 ease-out flex flex-col items-center justify-center ${
              typewriterFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* The Movie Entry Card Flying Letters */}
            <h1
              className="font-serif font-bold tracking-tight leading-snug flex flex-wrap items-center justify-center"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)' }}
            >
              {PROCESSED_ENTRY_WORDS.map((wordObj, wordIdx) => {
                return (
                  <span
                    key={wordIdx}
                    className="inline-flex whitespace-nowrap mr-3 sm:mr-5 mb-2"
                  >
                    {wordObj.letters.map((letter) => {
                      const isRevealed = letter.idx < typedCharsCount;
                      const isNewlyRevealed = letter.idx === typedCharsCount - 1;

                      return (
                        <span
                          key={letter.idx}
                          className={`relative inline-block ${
                            wordObj.isMantif ? 'text-[#DFB74A]' : 'text-[#FAF8F5]'
                          } ${
                            isRevealed
                              ? 'anim-movie-letter-fly'
                              : 'opacity-0 pointer-events-none select-none'
                          }`}
                        >
                          {letter.char}

                          {/* Brief glowing movie entry card flash upon landing */}
                          {isNewlyRevealed && (
                            <span
                              className="absolute -inset-1 rounded-sm bg-[#DFB74A]/40 blur-md pointer-events-none animate-ping"
                              style={{ animationDuration: '0.35s' }}
                            />
                          )}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </h1>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. ACT 02 — SINGLE SMOOTH TRANSFORMATION (GURUKULAM → MODERN AI)    */}
        {/* =================================================================== */}
        {phase === 'transformation' && (
          <div
            className={`relative w-full max-w-5xl h-[360px] sm:h-[430px] lg:h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#080D14] flex items-center justify-center transition-all duration-700 ease-out ${
              stageFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* ── BASE LAYER: HISTORICAL GURUKULAM IMAGE ── */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                animation: 'kenBurnsHistorical 14s ease-out forwards',
                filter: 'contrast(1.05) brightness(0.96)',
              }}
            >
              <picture className="w-full h-full">
                <source srcSet="/images/gurukulam.webp" type="image/webp" />
                <img
                  src="/images/gurukulam.png"
                  alt="Ancient Gurukulam with Guru and Students"
                  className="w-full h-full object-cover object-center"
                />
              </picture>

              {/* Warm Historical Paper Texture & Vignette */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25"
                style={{
                  background:
                    'radial-gradient(circle at center, #DFB74A 0%, #3B1B06 70%, #000000 100%)',
                }}
              />
            </div>

            {/* ── OVERLAY LAYER: MODERN AI CLASSROOM (SINGLE CONTINUOUS SMOOTH MORPH) ── */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                opacity: morphProgress, // Silky 60fps unbroken dissolve driven directly by RAF
              }}
            >
              <picture className="w-full h-full">
                <source srcSet="/images/modern_classroom.webp" type="image/webp" />
                <img
                  src="/images/modern_classroom.png"
                  alt="Modern Connected Classroom with AI Teacher and Laptop Students"
                  className="w-full h-full object-cover object-center"
                />
              </picture>

              {/* Subtle Digital Holographic Cyan & Gold Atmosphere */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  opacity: morphProgress * 0.35,
                  background:
                    'radial-gradient(ellipse at 75% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 65%)',
                }}
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. ACT 5 — THE PLEDGE DISPLAYED SEPARATELY IN ALL ITS MAJESTY       */}
        {/* =================================================================== */}
        {phase === 'pledge' && (
          <div className="relative z-30 w-full max-w-3xl px-4 py-2 flex flex-col items-center animate-fadeIn">
            {/* Standalone Majestic Header */}
            <div className="text-center mb-6 shrink-0">
              <h2
                className="font-serif font-bold text-[#FAF8F5] tracking-tight leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}
              >
                MANTIF PLEDGE
              </h2>

              <p className="font-serif italic text-xs sm:text-sm text-[#DFB74A] mt-1">
                "Bringing the spirit of personal learning into the digital age."
              </p>
            </div>

            {/* The 6 Statements Revealed One-by-One Separately */}
            <div className="w-full space-y-2.5 sm:space-y-3">
              {[
                'Learning should remain human.',
                'Technology should make education more accessible.',
                'Every student deserves the opportunity to learn.',
                'Every teacher deserves better tools to teach.',
                'Education should evolve without losing its soul.',
              ].map((statement, idx) => {
                const isRevealed = pledgeRevealedStep >= idx + 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl border transition-all duration-600 ${
                      isRevealed
                        ? 'bg-white/[0.04] border-white/15 opacity-100 translate-y-0 shadow-sm'
                        : 'bg-transparent border-transparent opacity-0 translate-y-3'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_8px_#DFB74A] shrink-0" />
                    <span className="font-serif text-sm sm:text-base text-[#FAF8F5] leading-snug">
                      {statement}
                    </span>
                  </div>
                );
              })}

              {/* Climax Statement 6 (Visually Emphasized) */}
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#004B79]/80 via-[#002137]/90 to-[#DFB74A]/25 border border-[#DFB74A]/60 shadow-2xl transition-all duration-700 text-center ${
                  pledgeRevealedStep >= 6
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-4'
                }`}
              >
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#DFB74A] uppercase block mb-1 font-bold">
                  THE FOUNDATIONAL TRUTH
                </span>
                <p className="font-serif font-bold text-lg sm:text-2xl text-white tracking-wide">
                  "MANTIF exists to move learning forward."
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MINIMAL FOOTER PLAYBACK BAR                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-4 pt-2 border-t border-white/[0.08] flex items-center justify-between shrink-0 font-mono text-[10px] text-white/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            onMouseEnter={() => {
              setCursorMode('hover');
              soundManager.playHoverTick();
            }}
            onMouseLeave={() => setCursorMode('default')}
            className="w-7 h-7 rounded-full bg-[#DFB74A] text-[#002137] hover:bg-white flex items-center justify-center transition-all shadow-md active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>

          <span className="text-white/80 font-semibold uppercase">
            {phase === 'typewriter'
              ? 'ACT 01 · THE QUESTION'
              : phase === 'transformation'
              ? 'ACT 02 · TRANSFORMATION'
              : 'ACT 03 · THE PLEDGE'}
          </span>
        </div>

        <a
          href="https://mantif.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#DFB74A] text-white/70 font-semibold transition-colors flex items-center gap-1"
        >
          <span>mantif.com ↗</span>
        </a>
      </div>
    </section>
  );
};
