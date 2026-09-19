import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';
import { preloadImages, CRITICAL_IMAGES } from '../utils/imagePreloader';

/* ─── Real Authentic Content from MANTIF (No AI generated stats) ─── */
interface PersonData {
  id: string;
  order: string;
  name: string;
  role: string;
  eyebrow: string;
  badge: string;
  accent: string;
  cutoutWebp: string;
  cutoutPng: string;
  fallbackImage: string;
  quote?: string;
  bioPrimary: string;
  bioSecondary?: string;
  milestone?: string;
  specialtyTitle: string;
  tags: string[];
  link: string;
}

const PEOPLE_DATA: PersonData[] = [
  {
    id: 'karunya',
    order: '01',
    name: 'Karunya S',
    role: 'Founder · Digital Marketing Strategist',
    eyebrow: 'FOUNDER & ARCHITECT',
    badge: 'FOUNDER',
    accent: '#DFB74A',
    cutoutWebp: '/images/founder_karunya_clean.webp',
    cutoutPng: '/images/founder_karunya_clean.png',
    fallbackImage: '/images/founder_karunya.webp',
    quote: 'The machine illuminates patterns. The human ignites the soul.',
    bioPrimary:
      'Karunya began with a singular premise: that education is not a passive transfer of notes, but an intimate human conversation.',
    bioSecondary:
      'Starting as the lead educator at Tutoring Hub, she personally tutored students through high-stakes board examinations. As founder of MANTIF, she fuses deep pedagogy with digital marketing strategies and AI intelligence, steering the company from local classrooms to regional scale.',
    milestone:
      'Alumna of Kongu National Matriculation Hr Sec School — returned as Founder to empower her own former teachers with modern AI tools.',
    specialtyTitle: 'Core Focus & Leadership',
    tags: [
      'Founder',
      'Tutoring Hub Lead',
      'Pedagogical Systems',
      'Digital Marketing',
      'MSME Registered',
    ],
    link: 'https://mantif.com',
  },
  {
    id: 'vishal',
    order: '02',
    name: 'Vishal K',
    role: 'Software Developer',
    eyebrow: 'DEVELOPMENT TEAM · FRONTEND',
    badge: 'SOFTWARE DEVELOPER',
    accent: '#004B79',
    cutoutWebp: '/images/team_vishal_clean.webp',
    cutoutPng: '/images/team_vishal_clean.png',
    fallbackImage: '/images/team_vishal.webp',
    bioPrimary:
      'Focused on creating seamless reactive frontend architectures, fluid micro-interactions, and resilient client-side state.',
    bioSecondary:
      'Vishal leads UI motion engineering and component architecture for the MANTIF platform, ensuring that every interface feels responsive, accessible, and extraordinarily fast.',
    specialtyTitle: 'Engineering Specialty',
    tags: [
      'Frontend Architecture',
      'Interactive Motion Systems',
      'React & TypeScript',
      'Tailwind CSS',
      'Component Design',
    ],
    link: 'https://mantif.com',
  },
  {
    id: 'solairaj',
    order: '03',
    name: 'Solairaj R',
    role: 'Software Developer',
    eyebrow: 'DEVELOPMENT TEAM · BACKEND',
    badge: 'SOFTWARE DEVELOPER',
    accent: '#004B79',
    cutoutWebp: '/images/team_solairaj_clean.webp',
    cutoutPng: '/images/team_solairaj_clean.png',
    fallbackImage: '/images/team_solairaj.webp',
    bioPrimary:
      'Architecting robust server infrastructure, database schemas, and AI pipeline orchestration.',
    bioSecondary:
      'Solairaj builds the invisible backend foundation that enables personalized student diagnostics, real-time learning metrics, and high-throughput microservices across MANTIF.',
    specialtyTitle: 'Engineering Specialty',
    tags: [
      'Backend Infrastructure',
      'Cloud Microservices',
      'Database Architecture',
      'AI Pipeline Integration',
      'API Engineering',
    ],
    link: 'https://mantif.com',
  },
];

export const PeopleSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const touchTimeoutRef = useRef<number | null>(null);

  const currentPerson = PEOPLE_DATA[currentIndex];

  // Alternating side logic:
  // Step 0 (Karunya): Image on RIGHT, Text on LEFT
  // Step 1 (Vishal): Image on LEFT, Text on RIGHT
  // Step 2 (Solairaj): Image on RIGHT, Text on LEFT
  const isImageOnRight = currentIndex % 2 === 0;

  const ENTER_DURATION = 500;
  const HOLD_DURATION = 2000; // Exact 2-second hold requested by user
  const EXIT_DURATION = 450;

  // Preload and GPU-decode all team members and critical images on mount
  useEffect(() => {
    preloadImages(CRITICAL_IMAGES);
  }, []);

  // Viewport trigger
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

  // 2-Second Hold Loop State Machine (Zero re-renders during hold, GPU handles countdown)
  useEffect(() => {
    if (!isAutoPlay || isHovered || isTouched || !hasEnteredView) {
      return;
    }

    let timer: number;

    if (phase === 'entering') {
      timer = window.setTimeout(() => {
        setPhase('showing');
      }, ENTER_DURATION);
    } else if (phase === 'showing') {
      timer = window.setTimeout(() => {
        setPhase('exiting');
      }, HOLD_DURATION);
    } else if (phase === 'exiting') {
      timer = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PEOPLE_DATA.length);
        setPhase('entering');
      }, EXIT_DURATION);
    }

    return () => window.clearTimeout(timer);
  }, [phase, isAutoPlay, isHovered, isTouched, hasEnteredView]);

  const handleSelectPerson = (index: number) => {
    if (index === currentIndex && phase === 'showing') return;
    setCurrentIndex(index);
    setPhase('entering');
    soundManager.playClick();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PEOPLE_DATA.length);
    setPhase('entering');
    soundManager.playClick();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PEOPLE_DATA.length) % PEOPLE_DATA.length);
    setPhase('entering');
    soundManager.playClick();
  };

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
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#FAF8F5] pt-14 sm:pt-16 pb-3 sm:pb-4 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Dynamic Keyframes for Alternating Sides & GPU-Accelerated Progress Line */}
      <style>{`
        @keyframes progressLineAnim {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translate3d(70px, 0, 0) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes slideOutRight {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(70px, 0, 0) scale(0.98);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translate3d(-70px, 0, 0) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes slideOutLeft {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(-70px, 0, 0) scale(0.98);
          }
        }

        .anim-enter-right {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .anim-exit-right {
          animation: slideOutRight 0.45s cubic-bezier(0.7, 0, 0.84, 0) forwards;
          will-change: transform, opacity;
        }

        .anim-enter-left {
          animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .anim-exit-left {
          animation: slideOutLeft 0.45s cubic-bezier(0.7, 0, 0.84, 0) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Ghost big number backdrop alone */}
      <div
        className="absolute top-4 sm:top-8 left-4 sm:left-10 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span
          className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
          style={{ opacity: 0.05 }}
        >
          03
        </span>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 flex-1 min-h-0 flex flex-col justify-between">
        {/* Section Header (Clean: removed the two redundant strips, kept heading + watermark number) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 sm:mb-3 shrink-0">
          <div>
            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              The Minds Shaping MANTIF.
            </h2>
          </div>

          <div className="text-right hidden sm:block pb-1">
            <span className="font-mono text-[10px] text-[#64748B] tracking-wider uppercase font-bold">
              Founder & Engineering Core
            </span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CARD-FREE MINIMALIST NAV BAR (TIGHT & BALANCED)                          */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-1.5 mb-2 border-b border-[#002137]/10 shrink-0">
          {/* Minimalist Tabs */}
          <div className="flex items-center gap-1.5">
            {PEOPLE_DATA.map((person, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(idx)}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`px-3.5 py-1 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#002137] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#002137] hover:bg-[#002137]/5'
                  }`}
                >
                  {idx === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A]" />
                  )}
                  <span>
                    {person.order} · {person.name}
                  </span>
                  {idx === 0 && (
                    <span className="hidden md:inline text-[#DFB74A] text-[8px] font-normal">
                      (FOUNDER)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next/prev navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-7 h-7 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all"
              aria-label="Previous person"
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
              aria-label="Next person"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Second Hold Countdown Progress Line (100% GPU Composited, Zero React Re-renders) */}
        <div className="w-full h-[2px] bg-[#002137]/6 rounded-full mb-3 sm:mb-4 overflow-hidden shrink-0">
          <div
            key={`progress-${currentIndex}-${phase}-${isAutoPlay && !isHovered && !isTouched}`}
            className="h-full origin-left will-change-transform"
            style={{
              backgroundColor: currentPerson.accent,
              transform: phase === 'exiting' ? 'scaleX(1)' : phase === 'entering' ? 'scaleX(0)' : undefined,
              animation:
                phase === 'showing' && isAutoPlay && !isHovered && !isTouched
                  ? `progressLineAnim ${HOLD_DURATION}ms linear forwards`
                  : 'none',
              width: '100%',
            }}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CARD-FREE OPEN STAGE — FULL VIEWPORT COVERAGE                            */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-5xl mx-auto flex-1 min-h-0 py-1 flex items-center justify-center"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none transition-all duration-700 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${currentPerson.accent}15 0%, transparent 70%)`,
            }}
          />

          {/* Symmetrical, tight-gap flex layout with alternating sides */}
          <div
            className={`relative z-10 w-full flex flex-col ${
              isImageOnRight ? 'lg:flex-row' : 'lg:flex-row-reverse'
            } items-center justify-center gap-6 lg:gap-10`}
          >
            {/* ── WORDS CONTAINER (Snug, authentic MANTIF content) ── */}
            <div
              key={currentPerson.id + '-words'}
              className={`flex-1 max-w-xl flex flex-col justify-center ${
                phase === 'entering'
                  ? isImageOnRight
                    ? 'anim-enter-left'
                    : 'anim-enter-right'
                  : phase === 'exiting'
                  ? isImageOnRight
                    ? 'anim-exit-left'
                    : 'anim-exit-right'
                  : 'opacity-100'
              }`}
            >
              {/* Category eyebrow */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase"
                  style={{ color: currentPerson.accent }}
                >
                  {currentPerson.eyebrow}
                </span>
                <span className="text-[#002137]/25">✦</span>
                <span className="font-mono text-[10px] tracking-wider text-[#64748B]">
                  0{currentIndex + 1} of 03
                </span>
              </div>

              {/* Name */}
              <h3 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#002137] tracking-tight mb-0.5">
                {currentPerson.name}
              </h3>

              {/* Role */}
              <p className="font-mono text-xs sm:text-sm font-semibold text-[#004B79] tracking-wide mb-2.5">
                {currentPerson.role}
              </p>

              {/* Authentic Quote if Karunya */}
              {currentPerson.quote && (
                <div
                  className="relative pl-3.5 py-1 border-l-2 mb-2.5"
                  style={{ borderColor: currentPerson.accent }}
                >
                  <p className="font-serif italic text-xs sm:text-sm text-[#002137]/90 leading-relaxed">
                    "{currentPerson.quote}"
                  </p>
                </div>
              )}

              {/* Primary Narrative */}
              <p className="font-sans text-xs sm:text-[13px] text-[#334155] leading-relaxed mb-2 line-clamp-3 sm:line-clamp-4">
                {currentPerson.bioPrimary}
              </p>

              {/* Secondary Narrative */}
              {currentPerson.bioSecondary && (
                <p className="font-sans text-xs sm:text-[13px] text-[#475569] leading-relaxed mb-2.5 line-clamp-2 hidden sm:block">
                  {currentPerson.bioSecondary}
                </p>
              )}

              {/* Real Milestone (Kongu Alma Mater) */}
              {currentPerson.milestone && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#002137]/5 border border-[#002137]/8 mb-2.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#C49326] block mb-0.5">
                    Classroom Heritage
                  </span>
                  <p className="font-sans text-xs text-[#334155] leading-snug">
                    {currentPerson.milestone}
                  </p>
                </div>
              )}

              {/* Real Skills & Core Focus Tags */}
              <div className="mb-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                  {currentPerson.specialtyTitle}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPerson.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-[#002137]/5 border border-[#002137]/10 font-mono text-[9px] font-semibold text-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform Link */}
              <div className="pt-2 border-t border-[#002137]/10 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#64748B]">
                  Verified MANTIF Leadership
                </span>
                <a
                  href={currentPerson.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#002137] text-white hover:bg-[#004B79] font-mono text-[10px] font-semibold tracking-wider transition-all uppercase shadow-xs"
                >
                  <Globe className="w-3 h-3" style={{ color: currentPerson.accent }} />
                  <span>mantif.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* ── STANDING CUTOUT IMAGE (WITHOUT BACKGROUND, ALTERNATING SIDE ENTRANCE) ── */}
            <div
              className={`w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[310px] shrink-0 flex flex-col items-center justify-end h-[340px] sm:h-[390px] lg:h-[430px] relative`}
            >
              {/* Soft Ambient Pedestal Floor Shadow */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[220px] sm:w-[260px] h-[20px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(0, 33, 55, 0.22) 0%, rgba(223, 183, 74, 0.15) 45%, transparent 75%)`,
                  filter: 'blur(6px)',
                }}
              />

              {/* Cutout Figures Persistent Multi-DOM Stack (0ms Switch, Zero-Flicker) */}
              <div className="relative z-10 w-full h-full flex items-end justify-center">
                {PEOPLE_DATA.map((person, idx) => {
                  const isCurrent = currentIndex === idx;
                  return (
                    <div
                      key={person.id}
                      className={`absolute inset-0 w-full h-full flex items-end justify-center ${
                        isCurrent
                          ? phase === 'entering'
                            ? isImageOnRight
                              ? 'anim-enter-right pointer-events-auto'
                              : 'anim-enter-left pointer-events-auto'
                            : phase === 'exiting'
                            ? isImageOnRight
                              ? 'anim-exit-right pointer-events-auto'
                              : 'anim-exit-left pointer-events-auto'
                            : 'opacity-100 pointer-events-auto'
                          : 'opacity-0 pointer-events-none'
                      }`}
                      style={{
                        visibility: isCurrent ? 'visible' : 'hidden',
                      }}
                      aria-hidden={!isCurrent}
                    >
                      <picture className="h-full w-auto flex items-end justify-center">
                        <source srcSet={person.cutoutWebp} type="image/webp" />
                        <img
                          src={person.cutoutPng}
                          alt={`${person.name} — ${person.role}`}
                          loading="eager"
                          decoding="async"
                          className="h-full w-auto max-h-[340px] sm:max-h-[390px] lg:max-h-[430px] object-contain object-bottom pointer-events-none select-none transition-transform duration-500 ease-out hover:scale-[1.02]"
                          style={{
                            filter: 'drop-shadow(0 20px 30px rgba(0, 33, 55, 0.20))',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = person.fallbackImage;
                          }}
                        />
                      </picture>
                    </div>
                  );
                })}
              </div>

              {/* Floating Role Badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white font-mono text-[9px] font-bold tracking-[0.2em] uppercase shadow-md border transition-all duration-300"
                  style={{
                    background: '#002137',
                    borderColor: `${currentPerson.accent}60`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: currentPerson.accent,
                      boxShadow: `0 0 6px ${currentPerson.accent}`,
                    }}
                  />
                  {currentPerson.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom credentials bar */}
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
