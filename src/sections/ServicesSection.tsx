import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Globe,
  GraduationCap,
  Sparkles,
  Cpu,
  Compass,
  Zap,
  Users,
  Layers,
  Video,
  Briefcase,
  Play,
  Pause,
  LayoutGrid,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  eyebrow: string;
  badge: string;
  description: string;
  quote?: string;
  features: { title: string; desc: string }[];
  metrics: string[];
  images: string[];
  imageCaptions: string[];
  accent: string;
}

const servicesData: ServiceItem[] = [
  {
    id: '01',
    title: 'Tutoring Hub',
    category: 'FOUNDATION',
    eyebrow: 'CLASSROOM TO DIGITAL',
    badge: 'Classes 6 – 10 Tuition',
    description:
      'Born from physical neighborhood classrooms in 2024, now empowering students across Classes 6 to 10 with intelligent interactive mentoring, school curriculum digitisation, and AI-assisted personalized diagnostic tracking.',
    features: [
      {
        title: 'Live Interactive Mentoring',
        desc: 'Real-time doubt resolution and peer learning clinics for core school subjects.',
      },
      {
        title: 'Curriculum & School Digitisation',
        desc: 'Digitised lesson plans, exam problem sets, and interactive concept modules.',
      },
      {
        title: 'AI-Assisted Diagnostic Tracking',
        desc: 'Diagnostic practice identifying knowledge gaps to tailor individualized study paths.',
      },
    ],
    metrics: ['100+ Students Mentored', 'Classes 6 – 10 Focus', 'Physical + Digital Hybrid'],
    images: ['/images/gallery_1.jpg', '/images/gallery_2.jpg'],
    imageCaptions: [
      'Neighborhood classroom roots — Tutoring Hub 2024',
      'Interactive student group mentoring session',
    ],
    accent: '#DFB74A',
  },
  {
    id: '02',
    title: 'Startup Ideation Guidance',
    category: 'INCUBATION',
    eyebrow: 'COLLABORATIVE ARCHITECTURE',
    badge: 'Enterprise Advisory',
    description:
      'We support emerging and regional startups with strategic product architecture, technical roadmaps, and lean execution models — helping founders build scalable digital platforms from day one.',
    quote: '“We support similar startups with technical guidance and grow together.”',
    features: [
      {
        title: 'Architecture & Technical Roadmapping',
        desc: 'Designing cloud infrastructure, database schemas, and microservice topologies.',
      },
      {
        title: 'Zero-Cold-Start AI Integrations',
        desc: 'Embedding modern language models, computer vision APIs, and custom inference hooks.',
      },
      {
        title: 'Grassroots Market Validation',
        desc: 'Validating value propositions with regional customer cohorts before capital deployment.',
      },
    ],
    metrics: ['Zero Cold Start', 'Regional Startup Advisory', 'Lean MVP Strategy'],
    images: ['/images/ai_seminar_banner.png', '/images/gallery_3.jpg'],
    imageCaptions: [
      'Kongu School AI workshop & technical masterclass',
      'Strategic founder incubation & roadmap consultation',
    ],
    accent: '#004B79',
  },
  {
    id: '03',
    title: 'Freelancing Services',
    category: 'EXECUTION',
    eyebrow: 'FULL-CYCLE CRAFTSMANSHIP',
    badge: 'Studio & Labs',
    description:
      'End-to-end engineering, media production, and hands-on technical capacity development for ambitious brands, educational institutions, and emerging digital enterprises.',
    features: [
      {
        title: 'Full Stack Web & Mobile Engineering',
        desc: 'Production applications built with modern frontend frameworks and robust backend APIs.',
      },
      {
        title: 'Digital Marketing & Growth Funnels',
        desc: 'Organic brand positioning, high-conversion ad campaigns, and user retention roadmaps.',
      },
      {
        title: 'Commercial Shoots & Post-Production',
        desc: 'Promotional cinematography, sound mastering, and corporate video storytelling.',
      },
      {
        title: 'IT Courses & Workforce Upskilling',
        desc: 'Hands-on software development bootcamps and job-ready industry technical training.',
      },
    ],
    metrics: ['Full Stack Web & Mobile', 'Media Production Suite', 'Workforce Training'],
    images: ['/images/gallery_4.jpg', '/images/gallery_5.jpg'],
    imageCaptions: [
      'High-performance engineering & platform architecture team',
      'Commercial video production and multimedia studio suite',
    ],
    accent: '#002137',
  },
];

export const ServicesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
  });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const activeService = servicesData[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % servicesData.length);
    soundManager.playClick();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + servicesData.length) % servicesData.length);
    soundManager.playClick();
  };

  const handleSelectService = (index: number) => {
    setActiveIndex(index);
    soundManager.playClick();
  };

  const togglePhoto = (serviceIndex: number, photoIndex: number) => {
    setActivePhotoIndices((prev) => ({ ...prev, [serviceIndex]: photoIndex }));
    soundManager.playHoverTick();
  };

  // Auto-play management
  useEffect(() => {
    if (isAutoPlay && viewMode === 'carousel') {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % servicesData.length);
      }, 5500);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, viewMode]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Helper icons for features
  const getFeatureIcon = (serviceId: string, idx: number) => {
    if (serviceId === '01') {
      if (idx === 0) return <GraduationCap className="w-4 h-4 text-[#DFB74A]" />;
      if (idx === 1) return <Sparkles className="w-4 h-4 text-[#DFB74A]" />;
      return <Cpu className="w-4 h-4 text-[#DFB74A]" />;
    }
    if (serviceId === '02') {
      if (idx === 0) return <Compass className="w-4 h-4 text-[#004B79]" />;
      if (idx === 1) return <Zap className="w-4 h-4 text-[#004B79]" />;
      return <Users className="w-4 h-4 text-[#004B79]" />;
    }
    if (idx === 0) return <Layers className="w-4 h-4 text-[#002137]" />;
    if (idx === 1) return <Sparkles className="w-4 h-4 text-[#002137]" />;
    if (idx === 2) return <Video className="w-4 h-4 text-[#002137]" />;
    return <Briefcase className="w-4 h-4 text-[#002137]" />;
  };

  return (
    <section
      id="services"
      className="relative w-full min-h-screen bg-[#FAF8F5] py-20 sm:py-28 px-4 sm:px-8 overflow-hidden select-none"
    >
      {/* Ghost chapter number watermark */}
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#004B79] uppercase">
                02 / WHAT MANTIF BUILDS
              </span>
            </div>

            <h2
              className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
            >
              More Than One Beginning.
            </h2>
          </div>

          {/* MSME Callout box */}
          <div className="border border-[#002137]/12 rounded-2xl p-5 max-w-sm bg-white/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-bold">
                MSME Registered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DFB74A]/15 border border-[#DFB74A]/30 font-mono text-[8px] font-bold text-[#002137] uppercase">
                TN-GOV
              </span>
            </div>
            <p className="font-sans text-xs text-[#475569] leading-relaxed">
              Physical learning roots evolved into digital systems, enterprise ideation, and digital craftsmanship.
            </p>
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
        {/* CAROUSEL CONTROLS BAR: CATEGORY TABS, VIEW SWITCHER, & ARROW CONTROLS   */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#002137]/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {servicesData.map((item, idx) => {
              const isActive = activeIndex === idx && viewMode === 'carousel';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewMode('carousel');
                    handleSelectService(idx);
                  }}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-full font-mono text-xs tracking-wider transition-all duration-300 shrink-0 border ${
                    isActive
                      ? 'bg-[#002137] text-white border-[#002137] shadow-md'
                      : 'bg-white/70 text-[#475569] border-[#002137]/12 hover:border-[#DFB74A] hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-[#DFB74A] scale-125 animate-pulse' : 'bg-[#64748B]/40'
                    }`}
                  />
                  <span className="font-bold">{item.id}</span>
                  <span className="hidden sm:inline text-[11px] opacity-70">/</span>
                  <span className="font-semibold">{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Counter, Autoplay, Prev/Next, & Grid Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            {/* Slide Index Counter */}
            {viewMode === 'carousel' && (
              <div className="font-mono text-xs text-[#64748B] tracking-widest px-2">
                <span className="font-bold text-[#002137]">0{activeIndex + 1}</span>
                <span className="opacity-40 mx-1">/</span>
                <span>0{servicesData.length}</span>
              </div>
            )}

            {/* Auto-play toggle */}
            {viewMode === 'carousel' && (
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className={`p-2 rounded-full border transition-colors ${
                  isAutoPlay
                    ? 'bg-[#DFB74A]/20 border-[#DFB74A] text-[#002137]'
                    : 'bg-white/60 border-[#002137]/15 text-[#64748B] hover:text-[#002137]'
                }`}
                title={isAutoPlay ? 'Pause Auto-slide' : 'Start Auto-slide'}
                aria-label="Toggle auto play"
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Navigation Arrows */}
            {viewMode === 'carousel' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className="w-9 h-9 rounded-full bg-white border border-[#002137]/15 flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:bg-[#FAF8F5] transition-all shadow-sm active:scale-95"
                  aria-label="Previous service"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className="w-9 h-9 rounded-full bg-white border border-[#002137]/15 flex items-center justify-center text-[#002137] hover:border-[#DFB74A] hover:bg-[#FAF8F5] transition-all shadow-sm active:scale-95"
                  aria-label="Next service"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Mode Toggle Button */}
            <button
              onClick={() => {
                setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel');
                soundManager.playClick();
              }}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#002137]/15 bg-white/70 hover:bg-white text-xs font-mono text-[#002137] font-semibold transition-colors"
            >
              {viewMode === 'carousel' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-[#DFB74A]" />
                  <span className="hidden sm:inline">Grid View</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#004B79]" />
                  <span className="hidden sm:inline">Carousel View</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: CINEMATIC CAROUSEL SHOWCASE (NEW STYLE ARCHITECTURE)               */}
        {/* ========================================================================= */}
        {viewMode === 'carousel' && (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full"
          >
            {/* The Active Featured Card */}
            <div className="relative rounded-3xl bg-white border border-[#002137]/12 shadow-[0_20px_60px_-15px_rgba(0,33,55,0.08)] overflow-hidden transition-all duration-500">
              {/* Top ambient color edge accent */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: `linear-gradient(to right, ${activeService.accent}, transparent)`,
                }}
              />

              <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* ── LEFT COLUMN (7 COLS): Editorial Story, Features, & Action ── */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    {/* Header line: ID + Eyebrow + Badge */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className="font-mono text-3xl sm:text-4xl font-bold leading-none"
                        style={{ color: activeService.accent }}
                      >
                        {activeService.id}
                      </span>
                      <div className="h-4 w-[1px] bg-[#002137]/20" />
                      <span className="font-mono text-[10px] tracking-[0.25em] text-[#64748B] uppercase font-bold">
                        {activeService.category} · {activeService.eyebrow}
                      </span>
                      <span
                        className="ml-auto px-3 py-1 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase border"
                        style={{
                          color: activeService.accent,
                          borderColor: activeService.accent + '40',
                          backgroundColor: activeService.accent + '10',
                        }}
                      >
                        {activeService.badge}
                      </span>
                    </div>

                    {/* Display Title */}
                    <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002137] tracking-tight mb-4">
                      {activeService.title}
                    </h3>

                    {/* Narrative Description */}
                    <p className="font-sans text-sm sm:text-base text-[#475569] leading-relaxed mb-6">
                      {activeService.description}
                    </p>

                    {/* Optional Quote Callout (for Startup Ideation) */}
                    {activeService.quote && (
                      <div
                        className="mb-6 p-4 rounded-2xl border-l-4 font-serif italic text-sm text-[#002137] leading-relaxed"
                        style={{
                          borderColor: activeService.accent,
                          backgroundColor: activeService.accent + '0A',
                        }}
                      >
                        {activeService.quote}
                      </div>
                    )}

                    {/* Architectural Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {activeService.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-[#002137]/8 bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getFeatureIcon(activeService.id, idx)}
                            <h4 className="font-sans text-xs font-bold text-[#002137]">
                              {feat.title}
                            </h4>
                          </div>
                          <p className="font-sans text-[11px] text-[#64748B] leading-snug pl-6">
                            {feat.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Metrics Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-8">
                      {activeService.metrics.map((metric, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#002137]/5 font-mono text-[10px] text-[#002137] font-semibold"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#DFB74A]" />
                          <span>{metric}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link Row */}
                  <div className="pt-6 border-t border-[#002137]/10 flex flex-wrap items-center justify-between gap-4">
                    <a
                      href="https://mantif.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center gap-3 px-6 py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-white transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                      style={{
                        backgroundColor: activeService.accent === '#DFB74A' ? '#002137' : activeService.accent,
                      }}
                    >
                      <Globe className="w-4 h-4 text-[#DFB74A]" />
                      <span>Explore mantif.com</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeService.accent }} />
                      <span>Verified Division</span>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN (5 COLS): Photographic Showcase & Proof ── */}
                <div className="lg:col-span-5 flex flex-col">
                  {/* Primary Large Image Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#002137]/12 shadow-md group/img aspect-[4/3] bg-[#002137]/5">
                    <img
                      src={activeService.images[activePhotoIndices[activeIndex] || 0]}
                      alt={activeService.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                    />

                    {/* Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002137]/80 via-transparent to-transparent pointer-events-none" />

                    {/* Top Status Tag */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 font-mono text-[9px] font-bold tracking-wider text-[#002137] uppercase shadow-sm">
                      {activeService.category} · STUDY
                    </div>

                    {/* Bottom Caption Pill */}
                    <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-[#002137]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-between gap-3">
                      <p className="font-sans text-[11px] leading-tight text-white/90 line-clamp-2">
                        {activeService.imageCaptions[activePhotoIndices[activeIndex] || 0]}
                      </p>
                      <span className="shrink-0 font-mono text-[9px] text-[#DFB74A] font-bold tracking-widest uppercase">
                        FIG. 0{activePhotoIndices[activeIndex] + 1}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Switcher Strip */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {activeService.images.map((img, photoIdx) => {
                        const isPhotoActive = (activePhotoIndices[activeIndex] || 0) === photoIdx;
                        return (
                          <button
                            key={photoIdx}
                            onClick={() => togglePhoto(activeIndex, photoIdx)}
                            onMouseEnter={() => setCursorMode('hover')}
                            onMouseLeave={() => setCursorMode('default')}
                            className={`group/thumb relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                              isPhotoActive
                                ? 'border-[#DFB74A] ring-2 ring-[#DFB74A]/30 scale-105'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>

                    <span className="font-mono text-[10px] text-[#64748B]">
                      Click thumbnail to toggle archival study
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Thumbnail Cards Strip (Direct Switcher) ── */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {servicesData.map((item, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectService(idx)}
                    onMouseEnter={() => {
                      setCursorMode('hover');
                      soundManager.playHoverTick();
                    }}
                    onMouseLeave={() => setCursorMode('default')}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-white border-[#DFB74A] shadow-md ring-1 ring-[#DFB74A]/40'
                        : 'bg-white/50 border-[#002137]/10 hover:bg-white hover:border-[#002137]/20 opacity-80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#002137]/10">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: item.accent }}>
                          {item.id}
                        </span>
                        <span className="font-serif font-bold text-xs text-[#002137] truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-[#64748B] tracking-wider uppercase block mt-0.5">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ARCHITECTURAL 3-COLUMN GRID (PANORAMIC COMPARISON)                 */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {servicesData.map((card, cardIdx) => (
              <div
                key={card.id}
                className="group relative rounded-3xl bg-white border border-[#002137]/12 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between"
              >
                {/* Top color edge accent */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(to right, ${card.accent}, transparent)`,
                  }}
                />

                <div className="p-7 sm:p-8 flex flex-col flex-1">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-mono text-2xl font-bold leading-none"
                      style={{ color: card.accent }}
                    >
                      {card.id}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase border"
                      style={{
                        color: card.accent,
                        borderColor: card.accent + '40',
                        backgroundColor: card.accent + '0D',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold text-[#002137] mb-2 leading-snug">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs text-[#475569] leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {/* Image showcase */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-5 border border-[#002137]/10">
                    <img
                      src={card.images[0]}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#002137]/80 backdrop-blur-sm text-[8px] font-mono text-white tracking-widest uppercase">
                      {card.category}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-6">
                    {card.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-[#334155]">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: card.accent }} />
                        <span className="leading-snug">{feat.title}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-[#002137]/10 flex items-center justify-between">
                    <a
                      href="https://mantif.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#64748B] hover:text-[#004B79] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" style={{ color: card.accent }} />
                      <span>mantif.com</span>
                    </a>
                    <a
                      href="https://mantif.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full border border-[#002137]/20 flex items-center justify-center hover:bg-[#002137] hover:text-white transition-colors"
                      aria-label="Visit mantif.com"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
