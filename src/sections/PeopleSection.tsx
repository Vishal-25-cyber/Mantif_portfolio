import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Play,
  Pause,
} from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

/* ─── 3 Core Leaders Data (Founder + Core Developers) ─── */
interface CoreLeader {
  id: string;
  order: string;
  name: string;
  role: string;
  subtitle: string;
  category: string;
  badge: string;
  accent: string;
  secondaryAccent: string;
  cutoutImage: string;
  fallbackImage: string;
  quote: string;
  subquote?: string;
  bio: string;
  highlights: [string, string][];
  tags: string[];
  link: string;
}

const CORE_LEADERS: CoreLeader[] = [
  {
    id: 'karunya',
    order: '01',
    name: 'Karunya S',
    role: 'Founder · Digital Marketing Strategist',
    subtitle: 'Architect of MANTIF · Est. 2024',
    category: 'FOUNDER & VISIONARY',
    badge: 'FOUNDER & ARCHITECT',
    accent: '#DFB74A',
    secondaryAccent: '#004B79',
    cutoutImage: '/images/founder_karunya_clean.png',
    fallbackImage: '/images/founder_karunya.jpg',
    quote:
      'Education is not a passive transfer of notes, but an intimate human conversation — scaled with artificial intelligence.',
    subquote: 'The machine illuminates patterns. The human ignites the soul.',
    bio: 'Karunya founded MANTIF to pioneer a new pedagogical standard where educators and AI coexist seamlessly — empowering students with hyper-personalized learning without losing the vital warmth of human mentorship.',
    highlights: [
      ['200+', 'Students Mentored'],
      ['5+', 'AI Workshops'],
      ['MSME', 'Registered Startup'],
    ],
    tags: [
      'Venture Leadership',
      'Pedagogical Architecture',
      'Growth Strategy',
      'EdTech AI',
    ],
    link: 'https://mantif.com',
  },
  {
    id: 'vishal',
    order: '02',
    name: 'Vishal K',
    role: 'Software Developer',
    subtitle: 'UI Motion & Interactive Systems Architecture',
    category: 'CORE DEVELOPMENT TEAM',
    badge: 'SOFTWARE DEVELOPER',
    accent: '#DFB74A',
    secondaryAccent: '#002137',
    cutoutImage: '/images/team_vishal_clean.png',
    fallbackImage: '/images/team_vishal.jpg',
    quote: 'Every interface is a stage. Make it worth watching.',
    subquote: 'Fluidity in design reflects precision in engineering.',
    bio: 'Leads UI motion design, component architecture, and frontend performance engineering for the MANTIF platform. Turns complex pedagogical workflows into fluid, intuitive, and responsive human experiences.',
    highlights: [
      ['100%', 'Bespoke Motion Engine'],
      ['React & GSAP', 'Interactive Systems'],
      ['Zero-Lag', 'High-FPS Performance'],
    ],
    tags: [
      'Frontend Architecture',
      'UI Motion Systems',
      'Interaction Design',
      'React & Vite',
    ],
    link: 'https://mantif.com',
  },
  {
    id: 'solairaj',
    order: '03',
    name: 'Solairaj R',
    role: 'Software Developer',
    subtitle: 'Cloud Infrastructure & AI Systems Architecture',
    category: 'CORE DEVELOPMENT TEAM',
    badge: 'SOFTWARE DEVELOPER',
    accent: '#004B79',
    secondaryAccent: '#DFB74A',
    cutoutImage: '/images/team_solairaj_clean.png',
    fallbackImage: '/images/team_solairaj.jpg',
    quote: 'Reliability is the highest form of engineering elegance.',
    subquote: 'Invisible architecture creates visible confidence.',
    bio: 'Architects cloud microservices, database schemas, and AI inference pipelines that power MANTIF at scale. Specializes in zero-cold-start inference, robust security, and distributed backend stability.',
    highlights: [
      ['0-Cold-Start', 'AI Inference Speed'],
      ['Cloud APIs', 'Microservices Architecture'],
      ['Scalable', 'Distributed Stability'],
    ],
    tags: [
      'Cloud Infrastructure',
      'AI Pipeline Integration',
      'Database Schemas',
      'Distributed Systems',
    ],
    link: 'https://mantif.com',
  },
];

/* ─── MAIN PEOPLE SECTION ─── */
export const PeopleSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [progress, setProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const touchTimeoutRef = useRef<number | null>(null);

  const activeLeader = CORE_LEADERS[currentIndex];
  const ENTER_DURATION = 550; // Entrance glide time
  const HOLD_DURATION = 2000;  // User requested: "wait for 2 sec"
  const EXIT_DURATION = 450;  // Exit glide time

  // Trigger when section scrolls into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Main animation loop state machine:
  // entering (550ms) -> showing (wait for 2 sec) -> exiting (450ms) -> next person -> loop!
  useEffect(() => {
    if (!isAutoPlay || isHovered || isTouched || !hasEnteredView) {
      return;
    }

    let timer: number;

    if (phase === 'entering') {
      setProgress(0);
      timer = window.setTimeout(() => {
        setPhase('showing');
      }, ENTER_DURATION);
    } else if (phase === 'showing') {
      const stepInterval = 40;
      const stepPercent = (stepInterval / HOLD_DURATION) * 100;
      const progressTimer = setInterval(() => {
        setProgress((prev) => Math.min(100, prev + stepPercent));
      }, stepInterval);

      timer = window.setTimeout(() => {
        clearInterval(progressTimer);
        setPhase('exiting');
      }, HOLD_DURATION);

      return () => {
        window.clearTimeout(timer);
        clearInterval(progressTimer);
      };
    } else if (phase === 'exiting') {
      timer = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % CORE_LEADERS.length);
        setPhase('entering');
      }, EXIT_DURATION);
    }

    return () => window.clearTimeout(timer);
  }, [phase, isAutoPlay, isHovered, isTouched, hasEnteredView]);

  const handleSelectLeader = (index: number) => {
    if (index === currentIndex && phase === 'showing') return;
    setCurrentIndex(index);
    setPhase('entering');
    setProgress(0);
    soundManager.playClick();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CORE_LEADERS.length);
    setPhase('entering');
    setProgress(0);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CORE_LEADERS.length) % CORE_LEADERS.length);
    setPhase('entering');
    setProgress(0);
    soundManager.playClick();
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    setIsTouched(true);
    if (touchTimeoutRef.current) {
      window.clearTimeout(touchTimeoutRef.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      window.clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = window.setTimeout(() => {
      setIsTouched(false);
    }, 3500);
  };

  return (
    <section
      ref={sectionRef}
      id="people"
      className="relative w-full bg-[#FAF8F5] pt-20 sm:pt-28 pb-16 sm:pb-24 overflow-hidden select-none"
    >
      {/* Dynamic Keyframes: Image and words come from the RIGHT, hold 2s, exit, and loop */}
      <style>{`
        @keyframes personComeFromRight {
          0% {
            opacity: 0;
            transform: translate3d(140px, 0, 0) scale(0.96);
            filter: blur(4px) drop-shadow(0 10px 20px rgba(0, 33, 55, 0.05));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px) drop-shadow(0 25px 35px rgba(0, 33, 55, 0.20));
          }
        }

        @keyframes personGoExit {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px) drop-shadow(0 25px 35px rgba(0, 33, 55, 0.20));
          }
          100% {
            opacity: 0;
            transform: translate3d(-120px, 0, 0) scale(0.95);
            filter: blur(4px) drop-shadow(0 10px 20px rgba(0, 33, 55, 0.05));
          }
        }

        @keyframes wordsComeFromRight {
          0% {
            opacity: 0;
            transform: translate3d(80px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes wordsGoExit {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(-80px, 0, 0);
          }
        }

        .anim-person-enter {
          animation: personComeFromRight 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-person-exit {
          animation: personGoExit 0.45s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        .anim-words-enter {
          animation: wordsComeFromRight 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.04s forwards;
        }
        .anim-words-exit {
          animation: wordsGoExit 0.45s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
      `}</style>

      {/* Ghost big number backdrop */}
      <div
        className="absolute top-8 left-4 sm:left-10 pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
          style={{ opacity: 0.03 }}
        >
          03
        </span>
      </div>

      {/* Decorative top-right architectural cross lines */}
      <div
        className="absolute top-8 right-8 sm:right-16 opacity-[0.07] pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-16 h-[1px] bg-[#002137]" />
        <div className="w-[1px] h-16 bg-[#002137] mt-[-1px] ml-auto" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top editorial metadata strip */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#002137]/10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#64748B] tracking-[0.25em] uppercase">
              Chapter 03
            </span>
            <span className="w-4 h-[1px] bg-[#002137]/20" />
            <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">
              People & Leadership
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
            <span className="font-mono text-[10px] text-[#64748B] hidden sm:block">
              mantif.com/people
            </span>
          </div>
        </div>

        {/* Section Header — editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#004B79] uppercase">
                03 / BUILT BY PEOPLE
              </span>
            </div>

            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
            >
              The Minds Shaping MANTIF.
            </h2>
          </div>

          {/* Minimalist Subtitle */}
          <div className="max-w-sm">
            <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#C49326] uppercase mb-1">
              Founder & Engineering
            </div>
            <p className="font-sans text-xs text-[#475569] leading-relaxed">
              From the founder pioneering empathetic learning to software developers engineering
              resilient interactive systems.
            </p>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CARD-FREE ARCHITECTURAL CONTROL BAR (HAIRLINE MINIMALIST DESIGN)          */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mb-6 border-b border-[#002137]/10">
          {/* Segmented Leader Selector Tabs (Floating, Card-Free) */}
          <div className="flex items-center gap-2">
            {CORE_LEADERS.map((leader, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={leader.id}
                  onClick={() => handleSelectLeader(idx)}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`relative px-4 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#002137] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#002137] hover:bg-[#002137]/5'
                  }`}
                >
                  {idx === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A]" />
                  )}
                  <span>
                    {leader.order} · {leader.name}
                  </span>
                  {idx === 0 && (
                    <span className="hidden md:inline px-1.5 py-0.2 rounded-sm bg-[#DFB74A]/25 text-[#DFB74A] text-[8px]">
                      FOUNDER
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Autoplay & Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={() => {
                setIsAutoPlay((prev) => !prev);
                soundManager.playClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] text-[#64748B] hover:text-[#002137] transition-colors"
              title={isAutoPlay ? 'Pause auto progression' : 'Resume auto progression'}
            >
              {isAutoPlay && !isHovered ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Pause className="w-2.5 h-2.5" />
                  <span>2s Loop</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <Play className="w-2.5 h-2.5" />
                  <span>Paused</span>
                </>
              )}
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-8 h-8 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all"
              aria-label="Previous leader"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-8 h-8 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all"
              aria-label="Next leader"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Second Hold Progress Line */}
        <div className="w-full h-[2px] bg-[#002137]/6 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full transition-all duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(to right, ${activeLeader.accent}, ${activeLeader.secondaryAccent})`,
            }}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* OPEN ARCHITECTURAL STAGE (WITHOUT CARD) — COMES FROM RIGHT & 2 SEC LOOP  */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full py-4 lg:py-8 min-h-[520px] lg:min-h-[580px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-16"
        >
          {/* Subtle Ambient Radial Glow on the background canvas */}
          <div
            className="absolute top-1/2 right-12 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none transition-all duration-700 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${activeLeader.accent}18 0%, ${activeLeader.secondaryAccent}08 55%, transparent 75%)`,
            }}
          />

          {/* ───────────────────────────────────────────────────────────── */}
          {/* LEFT: The Words (Arrive with photo, hold 2s, then go)         */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div
            key={activeLeader.id + '-words'}
            className={`relative z-10 flex flex-col justify-center ${
              phase === 'entering'
                ? 'anim-words-enter'
                : phase === 'exiting'
                ? 'anim-words-exit'
                : 'opacity-100'
            }`}
          >
            {/* Eyebrow & Category */}
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: activeLeader.accent }}
              >
                {activeLeader.category}
              </span>
              <span className="text-[#002137]/25">✦</span>
              <span className="font-mono text-[10px] tracking-wider text-[#004B79]">
                {activeLeader.subtitle}
              </span>
            </div>

            {/* Name */}
            <h3 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#002137] tracking-tight mb-1.5">
              {activeLeader.name}
            </h3>

            {/* Role Title */}
            <p className="font-mono text-xs sm:text-sm font-semibold text-[#004B79] tracking-wide mb-6">
              {activeLeader.role}
            </p>

            {/* Open Editorial Quote (Card-Free) */}
            <div
              className="relative pl-5 py-2 border-l-2 mb-6"
              style={{ borderColor: activeLeader.accent }}
            >
              <p className="font-serif italic text-base sm:text-lg text-[#002137]/90 leading-relaxed">
                "{activeLeader.quote}"
              </p>
              {activeLeader.subquote && (
                <p
                  className="font-sans text-xs font-semibold mt-2"
                  style={{ color: activeLeader.secondaryAccent }}
                >
                  — {activeLeader.subquote}
                </p>
              )}
            </div>

            {/* Biography Narrative */}
            <p className="font-sans text-xs sm:text-sm text-[#475569] leading-relaxed mb-6 max-w-xl">
              {activeLeader.bio}
            </p>

            {/* Capability & Domain Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {activeLeader.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-md bg-[#002137]/5 border border-[#002137]/10 font-mono text-[9px] font-semibold text-[#334155]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Key Milestones & Platform Link */}
            <div className="pt-6 border-t border-[#002137]/10 flex flex-wrap items-center justify-between gap-6 max-w-xl">
              <div className="flex items-center gap-8 sm:gap-10">
                {activeLeader.highlights.map(([val, label]) => (
                  <div key={label}>
                    <div className="font-serif font-bold text-[#002137] text-xl sm:text-2xl leading-none">
                      <span style={{ color: activeLeader.accent }}>{val}</span>
                    </div>
                    <div className="font-mono text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={activeLeader.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#002137] text-white hover:bg-[#004B79] font-mono text-[10px] font-semibold tracking-wider transition-all uppercase shadow-sm"
              >
                <Globe className="w-3 h-3" style={{ color: activeLeader.accent }} />
                <span>mantif.com</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* RIGHT: Cutout Image WITHOUT BACKGROUND — Comes from RIGHT     */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="relative w-full flex flex-col items-center lg:items-end justify-end h-[440px] sm:h-[500px] lg:h-[560px]">
            {/* Subtle Architectural Orbit behind the figure */}
            <div
              className="absolute top-1/2 left-1/2 lg:left-auto lg:right-16 -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] rounded-full border border-dashed border-[#002137]/10 pointer-events-none"
              style={{ animation: 'spin 50s linear infinite' }}
            />

            {/* Soft Ambient Pedestal Floor Shadow */}
            <div
              className="absolute bottom-2 left-1/2 lg:left-auto lg:right-16 -translate-x-1/2 lg:translate-x-0 w-[260px] sm:w-[320px] h-[28px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, rgba(0, 33, 55, 0.22) 0%, rgba(223, 183, 74, 0.15) 45%, transparent 75%)`,
                filter: 'blur(6px)',
              }}
            />

            {/* Standing Cutout Figure (Comes from RIGHT side, waits 2 sec, then goes) */}
            <div
              key={activeLeader.id + '-cutout'}
              className={`relative z-10 w-full h-full flex items-end justify-center lg:justify-end ${
                phase === 'entering'
                  ? 'anim-person-enter'
                  : phase === 'exiting'
                  ? 'anim-person-exit'
                  : 'opacity-100'
              }`}
            >
              <img
                src={activeLeader.cutoutImage}
                alt={`${activeLeader.name} — ${activeLeader.role}`}
                className="h-full w-auto max-h-[440px] sm:max-h-[500px] lg:max-h-[560px] object-contain object-bottom pointer-events-none select-none transition-transform duration-500 ease-out hover:scale-[1.02]"
                style={{
                  filter: 'drop-shadow(0 25px 35px rgba(0, 33, 55, 0.20))',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = activeLeader.fallbackImage;
                }}
              />

              {/* Floating Role Badge pill */}
              <div className="absolute -bottom-3 left-1/2 lg:left-auto lg:right-28 -translate-x-1/2 lg:translate-x-0 z-20 whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white font-mono text-[9px] font-bold tracking-[0.2em] uppercase shadow-lg border"
                  style={{
                    background: '#002137',
                    borderColor: `${activeLeader.accent}60`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: activeLeader.accent,
                      boxShadow: `0 0 6px ${activeLeader.accent}`,
                    }}
                  />
                  {activeLeader.badge}
                </span>
              </div>
            </div>
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
