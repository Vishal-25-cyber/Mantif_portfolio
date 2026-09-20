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
  const [phase, setPhase] = useState<'entering' | 'showing' | 'exiting'>('showing');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const touchTimeoutRef = useRef<number | null>(null);

  const ENTER_DURATION = 350;
  const HOLD_DURATION = 2800; // Cadence for reading
  const EXIT_DURATION = 300;

  // Preload and GPU-decode all team members and critical images on mount
  useEffect(() => {
    preloadImages(CRITICAL_IMAGES);
  }, []);

  // Viewport trigger & auto-restart from first person when scrolled into view
  useEffect(() => {
    let hasBeenOutOfView = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 0.15) {
            hasBeenOutOfView = true;
          } else if (entry.intersectionRatio >= 0.45 && hasBeenOutOfView) {
            hasBeenOutOfView = false;
            setCurrentIndex(0);
            setPhase('entering');
          }
          if (entry.isIntersecting) {
            setHasEnteredView(true);
          }
        });
      },
      { threshold: [0.1, 0.45] }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // When user clicks to view People from Navbar or URL hash, restart from the first person
  useEffect(() => {
    const handleSectionView = (e: any) => {
      if (e?.detail?.sectionId === 'people') {
        setCurrentIndex(0);
        setPhase('entering');
      }
    };
    window.addEventListener('mantif:section-view', handleSectionView as EventListener);

    const handleHash = () => {
      if (window.location.hash === '#people') {
        setCurrentIndex(0);
        setPhase('entering');
      }
    };
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView as EventListener);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Autoplay loop state machine
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

  const currentPerson = PEOPLE_DATA[currentIndex];

  return (
    <section
      ref={sectionRef}
      id="people"
      className="relative w-full min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] bg-[#FAF8F5] pt-14 sm:pt-16 pb-3 sm:pb-4 px-4 sm:px-8 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes progressLineAnim {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MANTIF BRAND WATERCOLOR WASH BACKGROUND                                   */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <picture className="w-full h-full block">
          <source
            media="(min-width: 768px)"
            srcSet="/images/watercolor_people_mantif_rich_wide.webp"
            type="image/webp"
          />
          <source
            media="(min-width: 768px)"
            srcSet="/images/watercolor_people_mantif_rich_wide.jpg"
            type="image/jpeg"
          />
          <source
            srcSet="/images/watercolor_mantif_rich.webp"
            type="image/webp"
          />
          <img
            src="/images/watercolor_people_mantif_rich_wide.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-75"
            loading="eager"
            decoding="async"
          />
        </picture>

        {/* Soft Radial Vignette: Provides pristine contrast directly on watercolor background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 92% at 42% 50%, rgba(250, 248, 245, 0.85) 0%, rgba(250, 248, 245, 0.55) 55%, rgba(250, 248, 245, 0.15) 100%)',
          }}
        />

        {/* Delicate Top and Bottom Edge Blends into adjoining sections */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#FAF8F5] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#FAF8F5] to-transparent pointer-events-none" />
      </div>

      {/* Ghost big number backdrop */}
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

      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto flex-1 min-h-0 flex flex-col justify-between">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 shrink-0">
          <div>
            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)' }}
            >
              The Minds Shaping MANTIF.
            </h2>
          </div>

          <div className="text-right hidden sm:block pb-0.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#002137]/5 border border-[#002137]/12 font-mono text-[10px] text-[#002137] tracking-wider uppercase font-bold">
              Founder & Engineering Core
            </span>
          </div>
        </div>

        {/* Minimalist Cardless Navigation Bar */}
        <div className="flex items-center justify-between gap-2 py-1.5 mb-2 border-b border-[#002137]/10 shrink-0">
          {/* High-Contrast Nav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                  className={`px-3.5 py-1 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-[#002137] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#002137] hover:bg-[#002137]/5'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? person.accent : '#94A3B8',
                    }}
                  />
                  <span>
                    {person.order} · {person.name}
                  </span>
                  {idx === 0 && (
                    <span className="hidden md:inline text-[#DFB74A] text-[9px] font-semibold">
                      (FOUNDER)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next/prev navigation buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrev}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="w-7 h-7 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all hover:bg-white/40"
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
              className="w-7 h-7 rounded-full border border-[#002137]/15 hover:border-[#DFB74A] flex items-center justify-center text-[#002137] transition-all hover:bg-white/40"
              aria-label="Next person"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress countdown indicator */}
        <div className="w-full h-[2px] bg-[#002137]/6 rounded-full mb-2 shrink-0 overflow-hidden">
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
        {/* EDITORIAL HERO STAGE — CARDLESS, INTEGRATED DIRECTLY WITH BACKGROUND     */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full flex-1 min-h-0 py-1 flex items-center justify-center"
        >
          {/* Symmetrical 2-column layout: Editorial Typography on Left, Cutout on Right */}
          <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16 h-full">
            
            {/* ── WORDS COLUMN: PURE EDITORIAL TYPOGRAPHY (ZERO CARD CONTAINERS) ── */}
            <div
              key={currentPerson.id + '-words'}
              className={`w-full lg:w-auto flex-1 max-w-lg lg:max-w-[490px] xl:max-w-[530px] flex flex-col justify-center transition-all duration-300 ease-out ${
                phase === 'entering'
                  ? 'opacity-100 translate-y-0'
                  : phase === 'exiting'
                  ? 'opacity-0 -translate-y-2'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Category eyebrow badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#004B79]">
                  {currentPerson.eyebrow}
                </span>
                <span className="text-[#DFB74A] text-xs">✦</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-[#64748B]">
                  0{currentIndex + 1} / 03
                </span>
              </div>

              {/* Name */}
              <h3
                className="font-serif font-bold text-[#002137] tracking-tight leading-none mb-1"
                style={{ fontSize: 'clamp(2rem, 3.4vw, 3rem)' }}
              >
                {currentPerson.name}
              </h3>

              {/* Role with Gold Bullet */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: currentPerson.accent }}
                />
                <p className="font-mono text-xs sm:text-[13px] font-bold text-[#004B79] tracking-wide">
                  {currentPerson.role}
                </p>
              </div>

              {/* Authentic Quote if Karunya */}
              {currentPerson.quote && (
                <div
                  className="relative pl-3 py-1 mb-2 border-l-2"
                  style={{ borderColor: currentPerson.accent }}
                >
                  <p className="font-serif italic text-xs sm:text-[13px] text-[#002137] font-medium leading-relaxed">
                    “{currentPerson.quote}”
                  </p>
                </div>
              )}

              {/* Primary Narrative */}
              <p className="font-sans text-xs sm:text-[13px] text-[#0f172a] font-medium leading-relaxed mb-1.5">
                {currentPerson.bioPrimary}
              </p>

              {/* Secondary Narrative */}
              {currentPerson.bioSecondary && (
                <p className="font-sans text-xs sm:text-[13px] text-[#334155] leading-relaxed mb-2.5 line-clamp-2 sm:line-clamp-3">
                  {currentPerson.bioSecondary}
                </p>
              )}

              {/* Real Milestone (Kongu Alma Mater) */}
              {currentPerson.milestone && (
                <div className="py-2 border-y border-[#002137]/10 mb-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#DFB74A]" />
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#946200]">
                      Classroom Heritage
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-[12.5px] text-[#0f172a] font-medium leading-snug">
                    {currentPerson.milestone}
                  </p>
                </div>
              )}

              {/* Real Skills & Core Focus Tags */}
              <div className="mb-3">
                <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block mb-1.5">
                  {currentPerson.specialtyTitle}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPerson.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-[#002137]/[0.05] border border-[#002137]/15 font-mono text-[9px] sm:text-[10px] font-bold text-[#002137] hover:border-[#DFB74A] hover:bg-[#DFB74A]/10 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform Link */}
              <div className="pt-2 border-t border-[#002137]/10 flex items-center justify-between">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#64748B]">
                  Verified MANTIF Leadership
                </span>
                <a
                  href={currentPerson.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#002137] text-white hover:bg-[#003B5C] font-mono text-[10px] sm:text-[11px] font-bold tracking-wider transition-all uppercase shadow-xs hover:shadow-sm"
                >
                  <Globe className="w-3 h-3" style={{ color: currentPerson.accent }} />
                  <span>mantif.com</span>
                  <ArrowUpRight className="w-3 h-3 text-[#DFB74A]" />
                </a>
              </div>
            </div>

            {/* ── MAJESTIC FULL-HEIGHT CUTOUT FIGURE (ON RIGHT) ── */}
            <div
              className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px] xl:max-w-[380px] shrink-0 flex flex-col items-center justify-end h-[360px] sm:h-[440px] lg:h-[480px] xl:h-[510px] relative"
            >
              {/* Soft Ambient Pedestal Floor Shadow */}
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[200px] sm:w-[260px] lg:w-[300px] h-[20px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0, 33, 55, 0.25) 0%, rgba(223, 183, 74, 0.15) 45%, transparent 75%)',
                  filter: 'blur(7px)',
                }}
              />

              {/* Cutout Figures Stack */}
              <div className="relative z-10 w-full h-full flex items-end justify-center">
                {PEOPLE_DATA.map((person, idx) => {
                  const isCurrent = currentIndex === idx;
                  return (
                    <div
                      key={person.id}
                      className={`absolute inset-0 w-full h-full flex items-end justify-center transition-all duration-400 ease-out ${
                        isCurrent
                          ? 'opacity-100 scale-100 pointer-events-auto'
                          : 'opacity-0 scale-98 pointer-events-none'
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
                          className="h-full w-auto max-h-[350px] sm:max-h-[430px] lg:max-h-[470px] xl:max-h-[500px] object-contain object-bottom pointer-events-none select-none transition-transform duration-500 hover:scale-[1.02]"
                          style={{
                            filter:
                              'drop-shadow(0 18px 30px rgba(0, 33, 55, 0.20)) drop-shadow(0 4px 12px rgba(223, 183, 74, 0.16))',
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
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase shadow-md border"
                  style={{
                    background: '#002137',
                    borderColor: `${currentPerson.accent}80`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: currentPerson.accent,
                      boxShadow: `0 0 8px ${currentPerson.accent}`,
                    }}
                  />
                  {currentPerson.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom credentials bar */}
        <div className="pt-2 border-t border-[#002137]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#475569] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A]" />
            <span>MANTIF is an MSME-registered EdTech startup — Tamil Nadu, India.</span>
          </div>
          <a
            href="https://mantif.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#004B79] text-[#002137] font-bold transition-colors flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-[#002137]/10 shadow-2xs"
          >
            <span>mantif.com ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
