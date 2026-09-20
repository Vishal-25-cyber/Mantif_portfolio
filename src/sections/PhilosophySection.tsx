import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { bulletAudio } from '../audio/bulletAudio';
import { setCursorMode } from '../hooks/useCursor';

type CinematicPhase =
  | 'typewriter'       // 1. Plain dark screen, letter-by-letter with printing sound
  | 'transformation'   // 2. Full-screen smooth morph: Ancient Gurukulam → Modern AI Classroom
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
    word: 'Trying',
    isMantif: false,
    letters: [
      { char: 'T', idx: 12 },
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

  // ── ACT 2: TRANSFORMATION STATE ──
  // morphProgress: 0 = full gurukulam, 1 = full modern
  const [morphProgress, setMorphProgress] = useState<number>(0);
  const [morphLabel, setMorphLabel] = useState<'ancient' | 'modern'>('ancient');
  const [stageFading, setStageFading] = useState<boolean>(false);

  // ── ACT 3: THE PLEDGE SEPARATELY STATE ──
  const [pledgeRevealedStep, setPledgeRevealedStep] = useState<number>(0);

  // Cycle key to guarantee re-running animations from step 1 on every click/view
  const [animCycleKey, setAnimCycleKey] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setPhase('typewriter');
    setTypedCharsCount(0);
    setTypewriterFading(false);
    setMorphProgress(0);
    setMorphLabel('ancient');
    setStageFading(false);
    setPledgeRevealedStep(0);
    setIsPlaying(true);
    setAnimCycleKey((k) => k + 1);
  }, []);

  // Initialize audio
  useEffect(() => {
    soundManager.unlockAudio();
    bulletAudio.unlock();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RESET TO ACT 1 EVERY TIME THE SECTION COMES BACK INTO VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let wasOutOfView = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.1) {
            wasOutOfView = true;
            // Stop all sounds immediately when user scrolls away
            setIsPlaying(false);
          } else if (entry.intersectionRatio >= 0.25 && wasOutOfView) {
            wasOutOfView = false;
            resetAll();
          }
        }
      },
      { threshold: [0.05, 0.25] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [resetAll]);

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

      if (charIdx >= TOTAL_ENTRY_LETTERS) {
        isFinished = true;
        window.clearInterval(interval);

        fadeTimer = window.setTimeout(() => {
          setTypewriterFading(true);
          transTimer = window.setTimeout(() => {
            setPhase('transformation');
          }, 500);
        }, 900);
      }
    }, 105);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(transTimer);
    };
  }, [phase, isPlaying, animCycleKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 2: FULL-SCREEN CINEMATIC CROSS-DISSOLVE TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'transformation') return;

    setMorphProgress(0);
    setMorphLabel('ancient');
    setStageFading(false);

    soundManager.playHistoricalAmbience();

    let animFrame: number;
    let timeoutToPledge: number;
    let timeoutFadeOut: number;
    let timeoutMorphStart: number;

    // Hold Gurukulam for 2s before starting the morph
    timeoutMorphStart = window.setTimeout(() => {
      soundManager.playDigitalMorphSweep();

      const morphStartTime = performance.now();
      const morphDuration = 4200; // 4.2s ultra-smooth dissolve

      const step = (now: number) => {
        if (!isPlaying) return;
        const elapsed = now - morphStartTime;
        const rawProgress = Math.min(1, Math.max(0, elapsed / morphDuration));

        // Quintic ease-in-out for a silky smooth S-curve
        const t = rawProgress;
        const smoothProgress =
          t < 0.5
            ? 16 * t * t * t * t * t
            : 1 - Math.pow(-2 * t + 2, 5) / 2;

        setMorphProgress(smoothProgress);

        // Switch label halfway through
        if (smoothProgress >= 0.5) {
          setMorphLabel('modern');
        }

        if (rawProgress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          // Hold modern classroom for 2.2s then fade to pledge
          timeoutFadeOut = window.setTimeout(() => {
            if (isPlaying) {
              setStageFading(true);
              timeoutToPledge = window.setTimeout(() => {
                setPhase('pledge');
                setStageFading(false);
              }, 700);
            }
          }, 2200);
        }
      };

      animFrame = requestAnimationFrame(step);
    }, 2000);

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
    for (let i = 1; i <= 4; i++) {
      const t = window.setTimeout(() => {
        setPledgeRevealedStep(i);
        soundManager.playChime(340 + i * 45, 'sine', 0.6, 0.05);
      }, 600 + (i - 1) * 950);
      timers.push(t);
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, animCycleKey]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleSkipToPhase = (targetPhase: CinematicPhase) => {
    soundManager.unlockAudio();
    soundManager.playClick();
    if (targetPhase === 'typewriter') {
      setPhase('typewriter');
      setTypedCharsCount(0);
      setTypewriterFading(false);
      setMorphProgress(0);
      setMorphLabel('ancient');
      setAnimCycleKey((k) => k + 1);
    } else if (targetPhase === 'transformation') {
      setPhase('transformation');
      setMorphProgress(0);
      setMorphLabel('ancient');
      setStageFading(false);
      setAnimCycleKey((k) => k + 1);
    } else if (targetPhase === 'pledge') {
      setPhase('pledge');
      setPledgeRevealedStep(0);
      setAnimCycleKey((k) => k + 1);
    }
  };

  // Navbar / hash reset
  useEffect(() => {
    const handleSectionView = (e: any) => {
      if (e?.detail?.sectionId === 'philosophy') resetAll();
    };
    const handleHash = () => {
      if (window.location.hash === '#philosophy') resetAll();
    };
    window.addEventListener('mantif:section-view', handleSectionView as EventListener);
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash === '#philosophy') resetAll();
    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView as EventListener);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [resetAll]);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      onClick={() => soundManager.unlockAudio()}
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#02060D] text-[#FAF8F5] overflow-hidden select-none flex flex-col"
    >
      {/* ─── Injected Keyframes ─── */}
      <style>{`
        @keyframes kenBurnsIn {
          0%   { transform: scale(1.0) translate(0%, 0%); }
          100% { transform: scale(1.1) translate(-1.5%, -1%); }
        }
        @keyframes kenBurnsOut {
          0%   { transform: scale(1.08) translate(-1%, -0.5%); }
          100% { transform: scale(1.18) translate(1%, 1%); }
        }
        @keyframes movieLetterFlyIn {
          0% {
            opacity: 0;
            transform: perspective(900px) translate3d(0, 50px, 180px) scale(2.8) rotateX(-30deg);
            filter: blur(10px) brightness(2.2);
          }
          60% {
            opacity: 1;
            transform: perspective(900px) translate3d(0, -6px, -15px) scale(0.94) rotateX(6deg);
            filter: blur(0px) brightness(1.3);
          }
          85% {
            transform: perspective(900px) translate3d(0, 2px, 4px) scale(1.03) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: perspective(900px) translate3d(0, 0, 0) scale(1) rotateX(0deg);
            filter: blur(0px) brightness(1);
          }
        }
        .anim-movie-letter-fly {
          display: inline-block;
          animation: movieLetterFlyIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, filter;
        }
        @keyframes lightSweep {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
        }
        .sweep-light {
          animation: lightSweep 1.8s ease-in-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes pledgeReveal {
          0%   { opacity: 0; transform: translateY(18px) scale(0.97); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .pledge-reveal {
          animation: pledgeReveal 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes labelCross {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .label-appear {
          animation: labelCross 0.4s ease-out forwards;
        }
      `}</style>

      {/* Ghost section number */}
      <div
        className="absolute top-4 sm:top-8 left-4 sm:left-10 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span
          className="font-serif font-bold text-[18vw] text-[#DFB74A] leading-none"
          style={{ opacity: 0.04 }}
        >
          05
        </span>
      </div>

      {/* ── Top Act Jump Controls ── */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-end shrink-0">
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
                className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase transition-all ${isActive
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CINEMATIC STAGE — flex-1 fills all remaining height                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">

        {/* ═══ ACT 01 — TYPEWRITER ════════════════════════════════════════════ */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-500 ease-out z-20 ${phase === 'typewriter'
              ? typewriterFading
                ? 'opacity-0 scale-95 pointer-events-none'
                : 'opacity-100 scale-100'
              : 'opacity-0 scale-95 pointer-events-none'
            }`}
        >
          <h1
            className="font-serif font-bold tracking-tight leading-snug flex flex-wrap items-center justify-center text-center"
            style={{ fontSize: 'clamp(2.85rem, 6.8vw, 5.6rem)' }}
          >
            {PROCESSED_ENTRY_WORDS.map((wordObj, wordIdx) => (
              <span
                key={wordIdx}
                className="inline-flex whitespace-nowrap mr-3.5 sm:mr-6 mb-2 sm:mb-3"
              >
                {wordObj.letters.map((letter) => {
                  const isRevealed = letter.idx < typedCharsCount;
                  const isNewlyRevealed = letter.idx === typedCharsCount - 1;
                  return (
                    <span
                      key={letter.idx}
                      className={`relative inline-block ${wordObj.isMantif ? 'text-[#DFB74A]' : 'text-[#FAF8F5]'
                        } ${isRevealed
                          ? 'anim-movie-letter-fly'
                          : 'opacity-0 pointer-events-none select-none'
                        }`}
                    >
                      {letter.char}
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
            ))}
          </h1>
        </div>

        {/* ═══ ACT 02 — CONTAINED CARD TRANSFORMATION ════════════════════════ */}
        {/* Always rendered so images are pre-loaded; opacity driven by phase */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-8 transition-all duration-700 ease-in-out ${phase === 'transformation'
              ? stageFading
                ? 'opacity-0 scale-[1.03]'
                : 'opacity-100 scale-100'
              : 'opacity-0 pointer-events-none'
            }`}
        >
          <div className="relative w-full max-w-5xl h-[340px] sm:h-[420px] lg:h-[470px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">

            {/* ── BASE: Ancient Gurukulam ── */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <img
                src="/images/gurukulam.png"
                alt="Ancient Gurukulam"
                className="w-full h-full object-cover object-center"
                style={{
                  animation: phase === 'transformation' ? 'kenBurnsIn 18s ease-out forwards' : 'none',
                  willChange: 'transform',
                  filter: 'contrast(1.18) saturate(1.22) brightness(1.06)',
                }}
              />
              {/* Warm cinematic vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 30%, rgba(5,3,1,0.55) 75%, rgba(2,2,2,0.85) 100%)',
                }}
              />
              {/* Sepia overlay fades out as morph progresses */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                  background: 'linear-gradient(135deg, rgba(90,50,10,0.45) 0%, rgba(30,15,5,0.6) 100%)',
                  opacity: Math.max(0, 1 - morphProgress * 1.6),
                }}
              />
            </div>

            {/* ── OVERLAY: Modern AI Classroom cross-dissolves in ── */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ opacity: morphProgress }}
            >
              <img
                src="/images/modern_classroom.png"
                alt="Modern AI Classroom"
                className="w-full h-full object-cover object-center"
                style={{
                  animation: phase === 'transformation' ? 'kenBurnsOut 18s ease-out forwards' : 'none',
                  willChange: 'transform',
                }}
              />
              {/* Cool digital atmosphere */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 30%, rgba(0,5,20,0.55) 75%, rgba(0,5,20,0.85) 100%)',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  opacity: morphProgress * 0.28,
                  background:
                    'radial-gradient(ellipse at 65% 40%, rgba(56,189,248,0.5) 0%, transparent 60%)',
                }}
              />
            </div>

            {/* ── Light sweep flash at moment of morph start ── */}
            {morphProgress > 0.01 && morphProgress < 0.3 && (
              <div
                key={animCycleKey}
                className="absolute inset-y-0 w-24 sm:w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 pointer-events-none sweep-light"
              />
            )}

            {/* ── Cinematic transition gradient bar (horizontal) ── */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(to right, rgba(2,6,13,${Math.max(0, 0.7 - morphProgress * 2)}) 0%, transparent 25%, transparent 75%, rgba(2,6,13,${Math.max(0, 0.7 - morphProgress * 2)}) 100%)`,
              }}
            />

            {/* ── Floating Era Label ── */}
            <div className="absolute bottom-10 sm:bottom-14 left-0 right-0 flex flex-col items-center z-30 pointer-events-none">
              <div
                key={`${morphLabel}-${animCycleKey}`}
                className="label-appear flex flex-col items-center gap-1"
              >
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-bold text-[#DFB74A] opacity-80">
                  {morphLabel === 'ancient' ? 'Then' : 'Now'}
                </span>
                <span
                  className="font-serif font-bold text-white text-center tracking-wide drop-shadow-xl"
                  style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)' }}
                >
                  {morphLabel === 'ancient'
                    ? 'The Ancient Gurukulam'
                    : 'The Modern AI Classroom'}
                </span>
                <div
                  className="h-0.5 rounded-full mt-1 transition-all duration-700"
                  style={{
                    width: '60px',
                    background:
                      morphLabel === 'ancient'
                        ? 'linear-gradient(to right, #DFB74A, #F5D77F)'
                        : 'linear-gradient(to right, #38BDF8, #7DD3FC)',
                  }}
                />
              </div>
            </div>

            {/* ── Progress shimmer bar at bottom edge ── */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 z-30 bg-white/10">
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${morphProgress * 100}%`,
                  background: 'linear-gradient(to right, #DFB74A, #38BDF8)',
                  boxShadow: '0 0 8px rgba(56,189,248,0.6)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ═══ ACT 03 — THE PLEDGE ════════════════════════════════════════════ */}
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-8 transition-all duration-700 ease-out ${phase === 'pledge'
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
            }`}
        >
          <div className="relative w-full max-w-3xl flex flex-col items-center">
            {/* Header */}
            {phase === 'pledge' && (
              <div
                key={`pledge-header-${animCycleKey}`}
                className="text-center mb-7 sm:mb-9 fade-in-up"
              >
                <h2
                  className="font-serif font-bold text-[#FAF8F5] tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}
                >
                  MANTIF PLEDGE
                </h2>
                <p className="font-serif italic text-xs sm:text-sm text-[#DFB74A] mt-1.5 opacity-80">
                  "Bringing the spirit of personal learning into the digital age."
                </p>
              </div>
            )}

            {/* Statements */}
            <div className="w-full space-y-3 sm:space-y-3.5">
              {[
                'Gurukulam Education believed in knowing and guiding every learner personally.',
                'MANTIF brings that spirit into modern education by combining human knowledge and AI technology.',
                'As the MANTIF Team, we believe our journey is long and our vision is bigger than one launch.',
                'We will keep learning, building, and moving forward towards our dream.',
              ].map((statement, idx) => {
                const isRevealed = pledgeRevealedStep >= idx + 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all duration-300 ${
                      isRevealed
                        ? 'pledge-reveal bg-white/[0.04] border-white/15 shadow-sm hover:border-white/30'
                        : 'opacity-0 bg-transparent border-transparent'
                    }`}
                    style={isRevealed ? { animationDelay: '0ms' } : {}}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DFB74A] shadow-[0_0_8px_#DFB74A]" />
                    </div>
                    <span className="font-serif text-sm sm:text-base text-[#FAF8F5] leading-relaxed">
                      {statement}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MINIMAL FOOTER PLAYBACK BAR ════════════════════════════════════════ */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-4 pt-2 border-t border-white/[0.08] flex items-center justify-between shrink-0 font-mono text-[10px] text-white/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.unlockAudio();
              setIsPlaying((prev) => !prev);
            }}
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
