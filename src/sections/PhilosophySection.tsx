import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

type CinematicPhase =
  | 'typewriter'       // 1. Plain dark screen, letter-by-letter with printing sound
  | 'gurukulam'         // 2. Gurukulam image appears from darkness, Ken Burns, historical text
  | 'transformation'   // 3. Smooth morph: Guru & students transform into AI teacher & laptop learners
  | 'closing'          // 4. Totally close the screen with cinematic curtains/shutters
  | 'pledge';          // 5. Display the pledge separately in all its majesty

// ── MOVIE ENTRY CARD FLY-IN CONFIGURATION ──
const MOVIE_ENTRY_WORDS = [
  { text: 'What', isMantif: false },
  { text: 'is', isMantif: false },
  { text: 'MANTIF', isMantif: true },
  { text: 'trying', isMantif: false },
  { text: 'to', isMantif: false },
  { text: 'do?', isMantif: false },
];

let globalCharCounter = 0;
const PROCESSED_ENTRY_WORDS = MOVIE_ENTRY_WORDS.map((wordObj) => {
  const letters = wordObj.text.split('').map((char) => {
    const idx = globalCharCounter++;
    return { char, idx };
  });
  // Inter-word space step
  globalCharCounter++;
  return { ...wordObj, letters };
});
const TOTAL_ENTRY_STEPS = globalCharCounter;

export const PhilosophySection: React.FC = () => {
  const [phase, setPhase] = useState<CinematicPhase>('typewriter');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // ── ACT 1: LETTER-BY-LETTER MOVIE ENTRY STATE ──
  const [typedCharsCount, setTypedCharsCount] = useState<number>(0);
  const [typewriterFading, setTypewriterFading] = useState<boolean>(false);

  // ── ACT 2: GURUKULAM REVEAL STATE ──
  const [gurukulamStep, setGurukulamStep] = useState<number>(0);

  // ── ACT 3: TRANSFORMATION STATE ──
  const [morphProgress, setMorphProgress] = useState<number>(0); // 0 (Ancient) to 1 (Modern AI)
  const [transformTextStep, setTransformTextStep] = useState<number>(0);

  // ── ACT 4: TOTALLY CLOSE STATE ──
  const [curtainClosed, setCurtainClosed] = useState<boolean>(false);

  // ── ACT 5: THE PLEDGE SEPARATELY STATE ──
  const [pledgeRevealedStep, setPledgeRevealedStep] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync mute state with soundManager
  useEffect(() => {
    setIsMuted(soundManager.getMuted());
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1: MOVIE ENTRY CARD LETTER-BY-LETTER FLY-IN WITH PRINTING SOUND
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'typewriter') return;

    setTypedCharsCount(0);
    setTypewriterFading(false);

    let charIdx = 0;
    const interval = window.setInterval(() => {
      if (!isPlaying) return;

      charIdx++;
      setTypedCharsCount(charIdx);

      // Check if current step corresponds to a real letter (not inter-word space)
      const isLetter = PROCESSED_ENTRY_WORDS
        .flatMap((w) => w.letters)
        .some((l) => l.idx === charIdx - 1);

      if (isLetter) {
        soundManager.playTypewriterKey(charIdx);
      }

      if (charIdx >= TOTAL_ENTRY_STEPS) {
        window.clearInterval(interval);

        // Pause for 1.8 seconds after all letters have landed, then fade out
        window.setTimeout(() => {
          setTypewriterFading(true);

          window.setTimeout(() => {
            setPhase('gurukulam');
          }, 950);
        }, 1800);
      }
    }, 110); // 110ms per letter: deliberate, grand, movie trailer entry cadence

    return () => window.clearInterval(interval);
  }, [phase, isPlaying]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 2: GURUKULAM REVEALS
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'gurukulam') return;

    setGurukulamStep(0);
    soundManager.playHistoricalAmbience();

    const t1 = window.setTimeout(() => setGurukulamStep(1), 1200);
    const t2 = window.setTimeout(() => setGurukulamStep(2), 3200);
    const t3 = window.setTimeout(() => setGurukulamStep(3), 5200);

    // Auto advance into smooth transformation after user has experienced the ancient scene
    const advanceTimer = window.setTimeout(() => {
      if (isPlaying) {
        setPhase('transformation');
      }
    }, 7200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(advanceTimer);
    };
  }, [phase, isPlaying]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 3: SMOOTH TRANSFORMATION (GURU & STUDENTS → AI & LAPTOP LEARNERS)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'transformation') return;

    setMorphProgress(0);
    setTransformTextStep(0);
    soundManager.playDigitalMorphSweep();

    // Smooth continuous morph from 0.0 to 1.0 over 5.5s
    const startTime = Date.now();
    const duration = 5500;

    const morphInterval = window.setInterval(() => {
      if (!isPlaying) return;
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      setMorphProgress(p);

      if (p >= 1) {
        window.clearInterval(morphInterval);
      }
    }, 30);

    const t1 = window.setTimeout(() => setTransformTextStep(1), 800);
    const t2 = window.setTimeout(() => setTransformTextStep(2), 2600);
    const t3 = window.setTimeout(() => setTransformTextStep(3), 4200);

    // After transformation finishes and is held, trigger the screen closing!
    const closeTrigger = window.setTimeout(() => {
      if (isPlaying) {
        setPhase('closing');
      }
    }, 7600);

    return () => {
      window.clearInterval(morphInterval);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(closeTrigger);
    };
  }, [phase, isPlaying]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 4: TOTALLY CLOSE THAT
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'closing') return;

    setCurtainClosed(false);
    soundManager.playCurtainClose();

    // Animate shutters / curtains to slide closed over 1.2s
    const tClose = window.setTimeout(() => {
      setCurtainClosed(true);
    }, 100);

    // After screen is totally closed and dark, transition to the Pledge separately
    const tPledge = window.setTimeout(() => {
      setPhase('pledge');
    }, 1600);

    return () => {
      window.clearTimeout(tClose);
      window.clearTimeout(tPledge);
    };
  }, [phase]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 5: DISPLAY THE PLEDGE SEPARATELY
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
  }, [phase]);

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
    setIsPlaying(true);
    soundManager.playClick();
  };

  const handleSkipToPhase = (targetPhase: CinematicPhase) => {
    setPhase(targetPhase);
    soundManager.playClick();
  };

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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MINIMAL TOP UTILITIES (SOUND TOGGLE & CLEAN CHAPTER INDICATOR)          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between shrink-0">
        {/* Discreet Chapter Stamp */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_8px_#DFB74A]" />
          <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#DFB74A] uppercase">
            CHAPTER 05 · HISTORICAL EVOLUTION
          </span>
        </div>

        {/* Minimal Audio & Progress Navigation */}
        <div className="flex items-center gap-3">
          {/* Quick Act Jump Dots */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            {[
              { id: 'typewriter', label: 'Prologue' },
              { id: 'gurukulam', label: 'Gurukulam' },
              { id: 'transformation', label: 'Transformation' },
              { id: 'pledge', label: 'The Pledge' },
            ].map((item, idx) => {
              const isActive = phase === item.id || (phase === 'closing' && item.id === 'transformation');
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

          {/* Sound Toggle (🔊 / 🔇) */}
          <button
            onClick={handleToggleMute}
            onMouseEnter={() => {
              setCursorMode('hover');
              soundManager.playHoverTick();
            }}
            onMouseLeave={() => setCursorMode('default')}
            className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 backdrop-blur-md ${
              !isMuted
                ? 'bg-[#DFB74A]/15 border-[#DFB74A]/50 text-[#DFB74A]'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            aria-label={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
            title={isMuted ? 'Turn Sound ON for Typewriter & Ambience' : 'Mute Sound'}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{!isMuted ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
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
        {/* 2 & 3. GURUKULAM & SMOOTH TRANSFORMATION INTO AI & STUDENTS         */}
        {/* =================================================================== */}
        {(phase === 'gurukulam' || phase === 'transformation' || phase === 'closing') && (
          <div className="relative w-full max-w-5xl h-[360px] sm:h-[430px] lg:h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#080D14] flex items-center justify-center">
            {/* ── BASE LAYER: HISTORICAL GURUKULAM IMAGE ── */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-1000 ease-out"
              style={{
                animation: 'kenBurnsHistorical 14s ease-out forwards',
                filter:
                  phase === 'gurukulam'
                    ? 'sepia(0.18) contrast(1.05) brightness(0.96)'
                    : 'contrast(1.1) brightness(0.9)',
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

            {/* ── OVERLAY LAYER: MODERN AI CLASSROOM (SMOOTH MORPH TRANSFORMATION) ── */}
            {(phase === 'transformation' || phase === 'closing') && (
              <div
                className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300 ease-out"
                style={{
                  opacity: morphProgress, // Smooth 0 to 1 progressive dissolve
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
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-35"
                  style={{
                    background:
                      'radial-gradient(ellipse at 75% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 65%)',
                  }}
                />
              </div>
            )}

            {/* ── GURUKULAM TEXT REVEAL (ACT 2) ── */}
            {phase === 'gurukulam' && (
              <div className="absolute inset-x-0 bottom-6 sm:bottom-10 z-20 px-6 max-w-2xl mx-auto text-center">
                <div className="p-4 sm:p-5 rounded-2xl bg-black/75 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5">
                  <p
                    className={`font-serif italic text-lg sm:text-xl text-[#FAF8F5] transition-all duration-700 ${
                      gurukulamStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    "Once, learning was personal."
                  </p>

                  <p
                    className={`font-sans text-xs sm:text-sm text-[#DFB74A] transition-all duration-700 ${
                      gurukulamStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    Knowledge was passed from one generation to another.
                  </p>

                  <div
                    className={`mt-2 pt-2 border-t border-white/15 flex items-center justify-center gap-3 font-mono text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-widest transition-all duration-700 ${
                      gurukulamStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    <span>Teacher</span>
                    <span className="text-[#DFB74A]">✦</span>
                    <span>Student</span>
                    <span className="text-[#DFB74A]">✦</span>
                    <span>Time</span>
                    <span className="text-[#DFB74A]">✦</span>
                    <span>Experience</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TRANSFORMATION TEXT REVEAL (ACT 3) ── */}
            {phase === 'transformation' && (
              <div className="absolute inset-x-0 bottom-6 sm:bottom-10 z-20 px-6 max-w-2xl mx-auto text-center">
                <div className="p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#DFB74A]" />
                    <span className="font-mono text-[9px] tracking-[0.25em] text-[#38BDF8] uppercase font-bold">
                      {morphProgress < 0.5 ? 'ANCIENT GURU → AI MENTOR' : 'STUDENTS → DIGITAL LEARNING'}
                    </span>
                  </div>

                  <p
                    className={`font-serif text-xl sm:text-2xl text-[#FAF8F5] transition-all duration-700 ${
                      transformTextStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    "Education didn't disappear."
                  </p>

                  <p
                    className={`font-serif font-bold text-2xl sm:text-4xl text-[#DFB74A] transition-all duration-700 ${
                      transformTextStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                  >
                    "It evolved."
                  </p>

                  {transformTextStep >= 3 && (
                    <span className="font-mono text-[9px] tracking-[0.2em] text-[#38BDF8] uppercase animate-fadeIn">
                      Interactive Intelligence · Personalized Pacing · Boundless Classrooms
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── CINEMATIC SHUTTERS / CURTAINS: TOTALLY CLOSE THAT (ACT 4) ── */}
            {phase === 'closing' && (
              <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex">
                {/* Left Shutter Door */}
                <div
                  className="h-full bg-[#02060D] border-r-2 border-[#DFB74A]/80 transition-transform duration-1000 ease-in-out shadow-2xl"
                  style={{
                    width: '50.5%',
                    transform: curtainClosed ? 'translateX(0%)' : 'translateX(-100%)',
                  }}
                />
                {/* Right Shutter Door */}
                <div
                  className="h-full bg-[#02060D] border-l-2 border-[#DFB74A]/80 transition-transform duration-1000 ease-in-out shadow-2xl"
                  style={{
                    width: '50.5%',
                    transform: curtainClosed ? 'translateX(0%)' : 'translateX(100%)',
                  }}
                />

                {/* Center Golden Meeting Seal */}
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-500 ${
                    curtainClosed ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="px-3.5 py-1.5 rounded-full bg-black/90 border border-[#DFB74A] text-[#DFB74A] font-mono text-[9px] font-bold tracking-[0.25em] uppercase shadow-2xl">
                    ✦ TRANSFORMATION COMPLETE ✦
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. ACT 5 — THE PLEDGE DISPLAYED SEPARATELY IN ALL ITS MAJESTY       */}
        {/* =================================================================== */}
        {phase === 'pledge' && (
          <div className="relative z-30 w-full max-w-3xl px-4 py-2 flex flex-col items-center animate-fadeIn">
            {/* Standalone Majestic Header */}
            <div className="text-center mb-6 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB74A]/10 border border-[#DFB74A]/30 text-[#DFB74A] text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.25em] uppercase mb-2 shadow-[0_0_20px_rgba(223,183,74,0.2)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MANTIF CORE MANIFESTO</span>
              </div>

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

            {/* Replay Entire Historical Evolution Experience Button */}
            <div className="mt-6">
              <button
                onClick={handleRestartAll}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/20 hover:border-[#DFB74A] hover:bg-white/10 text-white font-mono text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#DFB74A]" />
                <span>REPLAY HISTORICAL EVOLUTION</span>
              </button>
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
              : phase === 'gurukulam'
              ? 'ACT 02 · GURUKULAM'
              : phase === 'transformation'
              ? 'ACT 03 · TRANSFORMATION'
              : phase === 'closing'
              ? 'ACT 04 · CLOSING STAGE'
              : 'ACT 05 · THE PLEDGE'}
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
