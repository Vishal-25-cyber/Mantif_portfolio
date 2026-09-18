import React, { useState, useEffect, useRef } from 'react';
import {
  Quote,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [progress, setProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const touchTimeoutRef = useRef<number | null>(null);

  const AUTOPLAY_DURATION = 5000; // 5 seconds per person
  const activeLeader = CORE_LEADERS[activeIndex];

  // IntersectionObserver to trigger animation when the section scrolls into view
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

  // Autoplay progression loop with smooth progress bar
  useEffect(() => {
    if (!isAutoPlay || isHovered || isTouched || !hasEnteredView) {
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / AUTOPLAY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((curr) => (curr + 1) % CORE_LEADERS.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, isTouched, hasEnteredView]);

  const handleSelectLeader = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    soundManager.playClick();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CORE_LEADERS.length);
    setProgress(0);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CORE_LEADERS.length) % CORE_LEADERS.length);
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
      {/* Dynamic Keyframes for smooth entrance */}
      <style>{`
        @keyframes leaderCutoutEntrance {
          0% {
            opacity: 0;
            transform: translate3d(-70px, 0, 0) scale(0.95);
            filter: blur(4px) drop-shadow(0 10px 20px rgba(0, 33, 55, 0.05));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px) drop-shadow(0 25px 35px rgba(0, 33, 55, 0.20));
          }
        }
        @keyframes leaderTextEntrance {
          0% {
            opacity: 0;
            transform: translate3d(60px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-leader-cutout {
          animation: leaderCutoutEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-leader-text {
          animation: leaderTextEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards;
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-12">
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

          {/* Callout box */}
          <div className="border border-[#002137]/12 rounded-2xl p-5 max-w-sm bg-white/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-bold">
                Leadership & Pedagogy
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DFB74A]/15 border border-[#DFB74A]/30 font-mono text-[8px] font-bold text-[#002137] uppercase">
                FOUNDER × DEV
              </span>
            </div>
            <p className="font-sans text-xs text-[#475569] leading-relaxed">
              From the founder pioneering empathetic learning to software developers engineering
              resilient interactive systems.
            </p>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* LEADER SPOTLIGHT STAGE — CUTOUT WITHOUT BACKGROUND & SIDE ENTRANCE TEXT  */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full rounded-3xl bg-white/85 border border-[#002137]/10 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 mb-12 backdrop-blur-sm"
        >
          {/* Subtle Ambient Radial Glow on the stage */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none transition-all duration-700 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${activeLeader.accent}20 0%, ${activeLeader.secondaryAccent}10 60%, transparent 80%)`,
            }}
          />

          {/* Top Control Bar: Person Switcher Tabs + Playback State */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-[#002137]/8">
            {/* Segmented Leader Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FAF8F5] border border-[#002137]/12 shadow-inner">
              {CORE_LEADERS.map((leader, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={leader.id}
                    onClick={() => handleSelectLeader(idx)}
                    onMouseEnter={() => {
                      setCursorMode('hover');
                      soundManager.playHoverTick();
                    }}
                    onMouseLeave={() => setCursorMode('default')}
                    className={`relative px-3.5 sm:px-4 py-1.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#002137] text-white shadow-md'
                        : 'text-[#475569] hover:text-[#002137] hover:bg-white/60'
                    }`}
                  >
                    {idx === 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A]" />
                    )}
                    <span>
                      {leader.order} · {leader.name}
                    </span>
                    {idx === 0 && (
                      <span className="hidden md:inline px-1.5 py-0.2 rounded-sm bg-[#DFB74A]/25 text-[#DFB74A] text-[7px]">
                        FOUNDER
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Controls + Autoplay Status */}
            <div className="flex items-center gap-3">
              {/* Autoplay Pause/Play Toggle Button */}
              <button
                onClick={() => {
                  setIsAutoPlay((prev) => !prev);
                  soundManager.playClick();
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#002137]/10 font-mono text-[9px] text-[#64748B] hover:text-[#002137] transition-colors"
                title={isAutoPlay ? 'Pause auto progression' : 'Resume auto progression'}
              >
                {isAutoPlay && !isHovered ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Pause className="w-2.5 h-2.5" />
                    <span>Auto</span>
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
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#002137]/12 shadow-xs hover:border-[#DFB74A] hover:bg-white flex items-center justify-center text-[#002137] transition-all"
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
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#002137]/12 shadow-xs hover:border-[#DFB74A] hover:bg-white flex items-center justify-center text-[#002137] transition-all"
                aria-label="Next leader"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Autoplay Progress Line Indicator */}
          <div className="w-full h-[2px] bg-[#002137]/8 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full transition-all duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${activeLeader.accent}, ${activeLeader.secondaryAccent})`,
              }}
            />
          </div>

          {/* ─── The Main Split: Figure (Without Background) + Explanation ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] items-center gap-10 lg:gap-14 min-h-[460px]">
            {/* ───────────────────────────────────────────────────────────── */}
            {/* LEFT: Cutout Image WITHOUT BACKGROUND — Glides in from side    */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative w-full flex flex-col items-center justify-end h-[420px] sm:h-[480px] lg:h-[520px]">
              {/* Subtle Architectural Orbit behind the figure */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] rounded-full border border-dashed border-[#002137]/10 pointer-events-none"
                style={{ animation: 'spin 50s linear infinite' }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[280px] h-[220px] sm:h-[280px] rounded-full blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${activeLeader.accent}25 0%, transparent 70%)`,
                }}
              />

              {/* Pedestal Shadow under the feet */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[260px] sm:w-[300px] h-[26px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(0, 33, 55, 0.22) 0%, rgba(223, 183, 74, 0.15) 45%, transparent 75%)`,
                  filter: 'blur(6px)',
                }}
              />

              {/* The Standing Cutout Figure (KEYED to retrigger entrance animation) */}
              <div
                key={activeLeader.id + '-cutout'}
                className="relative z-10 w-full h-full flex items-end justify-center animate-leader-cutout"
              >
                <img
                  src={activeLeader.cutoutImage}
                  alt={`${activeLeader.name} — ${activeLeader.role}`}
                  className="h-full w-auto max-h-[420px] sm:max-h-[480px] lg:max-h-[520px] object-contain object-bottom pointer-events-none select-none transition-transform duration-500 ease-out hover:scale-[1.03]"
                  style={{
                    filter: 'drop-shadow(0 20px 30px rgba(0, 33, 55, 0.18))',
                  }}
                  onError={(e) => {
                    // Fallback in case of network issue
                    (e.target as HTMLImageElement).src = activeLeader.fallbackImage;
                  }}
                />

                {/* Floating Role Badge pill near bottom */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
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

            {/* ───────────────────────────────────────────────────────────── */}
            {/* RIGHT: Rich Explanation — Glides in simultaneously beside her  */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div
              key={activeLeader.id + '-explanation'}
              className="relative z-10 flex flex-col justify-center animate-leader-text"
            >
              {/* Eyebrow & Category */}
              <div className="flex items-center gap-2 mb-2">
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
              <h3 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#002137] tracking-tight mb-1">
                {activeLeader.name}
              </h3>

              {/* Role Title */}
              <p className="font-mono text-xs sm:text-sm font-semibold text-[#004B79] tracking-wide mb-5">
                {activeLeader.role}
              </p>

              {/* Vision Quote Block */}
              <div
                className="relative p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border mb-5 transition-colors duration-500"
                style={{ borderColor: `${activeLeader.accent}40` }}
              >
                <div
                  className="absolute -top-3 left-6 px-2 bg-white rounded font-serif text-lg leading-none"
                  style={{ color: activeLeader.accent }}
                >
                  “
                </div>
                <p className="font-serif italic text-sm sm:text-base text-[#002137]/90 leading-relaxed">
                  "{activeLeader.quote}"
                </p>
                {activeLeader.subquote && (
                  <p
                    className="font-sans text-[11px] font-semibold mt-2.5"
                    style={{ color: activeLeader.secondaryAccent }}
                  >
                    — {activeLeader.subquote}
                  </p>
                )}
              </div>

              {/* Biography Narrative */}
              <p className="font-sans text-xs sm:text-sm text-[#475569] leading-relaxed mb-6">
                {activeLeader.bio}
              </p>

              {/* Capability & Domain Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {activeLeader.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#002137]/10 font-mono text-[9px] font-semibold text-[#334155]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Milestones & Platform Link */}
              <div className="pt-4 border-t border-[#002137]/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 sm:gap-8">
                  {activeLeader.highlights.map(([val, label]) => (
                    <div key={label}>
                      <div className="font-serif font-bold text-[#002137] text-lg sm:text-xl leading-none">
                        <span style={{ color: activeLeader.accent }}>{val}</span>
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">
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
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE TRIO DOCK — Click any person to load their spotlight stage    */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {CORE_LEADERS.map((leader, idx) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={leader.id}
                onClick={() => handleSelectLeader(idx)}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                  isActive
                    ? 'bg-white border-[#DFB74A] shadow-md -translate-y-1'
                    : 'bg-white/60 border-[#002137]/10 hover:border-[#002137]/25 hover:bg-white/80'
                }`}
              >
                {/* Silhouette preview without background */}
                <div className="w-14 h-16 shrink-0 relative flex items-end justify-center overflow-hidden rounded-xl bg-[#FAF8F5] border border-[#002137]/8">
                  <img
                    src={leader.cutoutImage}
                    alt={leader.name}
                    className="h-full w-auto object-contain object-bottom"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#DFB74A]/10 border border-[#DFB74A]/40 rounded-xl" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[9px] font-bold"
                      style={{ color: leader.accent }}
                    >
                      {leader.order}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-wider text-[#64748B] truncate">
                      {idx === 0 ? 'Founder' : 'Software Dev'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#002137] truncate mt-0.5">
                    {leader.name}
                  </h4>
                  <p className="font-mono text-[9px] text-[#004B79] truncate mt-0.5">
                    {leader.role.split('·')[0]}
                  </p>
                </div>

                {/* Active Indicator Arrow */}
                {isActive ? (
                  <span className="w-6 h-6 rounded-full bg-[#DFB74A] text-[#002137] flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[#64748B] shrink-0 opacity-40">
                    ↗
                  </span>
                )}
              </div>
            );
          })}
        </div>


        {/* Bottom credentials bar */}
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
