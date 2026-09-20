import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  Globe,
  Phone,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Compass,
  Radio,
} from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';
import { GoogleMapsStoryExperience } from '../components/GoogleMapsStoryExperience';
import { FromErodeToWorldGlobe } from '../components/FromErodeToWorldGlobe';

interface StepMeta {
  id: number;
  label: string;
  tag: string;
  durationMs: number;
}

// Exactly 5 steps: Erode -> Tamil Nadu -> India -> Globe -> Connect with Us (Normal, brisk, and fluid timings)
const STEPS: StepMeta[] = [
  {
    id: 1,
    label: 'Erode',
    tag: '📍 Erode, Tamil Nadu · Head Branch',
    durationMs: 2200,
  },
  {
    id: 2,
    label: 'Tamil Nadu',
    tag: '📍 Tamil Nadu · Origin Hub',
    durationMs: 2200,
  },
  {
    id: 3,
    label: 'India',
    tag: '📍 India · Pan-India Reach',
    durationMs: 2400,
  },
  {
    id: 4,
    label: 'Globe',
    tag: '🌐 The World · Global Reach',
    durationMs: 2800,
  },
  {
    id: 5,
    label: 'Connect with Us',
    tag: '💬 Connect with Us · Active Channels',
    durationMs: 0, // Final interactive landing
  },
];

export const FooterSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [isGlobeBlasting, setIsGlobeBlasting] = useState<boolean>(false);
  const isGlobeBlastingRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);
  const blastTimerRef = useRef<number | null>(null);

  const phoneNumbers = [
    {
      number: '+91 98427 43538',
      tel: 'tel:+919842743538',
      wa: 'https://wa.me/919842743538?text=Hello%20MANTIF%2C%20I%20would%20like%20to%20inquire%20about%20your%20learning%20ecosystem.',
    },
    {
      number: '+91 80564 53211',
      tel: 'tel:+918056453211',
      wa: 'https://wa.me/918056453211?text=Hello%20MANTIF%2C%20I%20would%20like%20to%20inquire%20about%20your%20learning%20ecosystem.',
    },
    {
      number: '+91 63811 80488',
      tel: 'tel:+916381180488',
      wa: 'https://wa.me/916381180488?text=Hello%20MANTIF%2C%20I%20would%20like%20to%20inquire%20about%20your%20learning%20ecosystem.',
    },
  ];

  // Sound triggers
  const triggerStepAudio = useCallback((stepNum: number) => {
    switch (stepNum) {
      case 1:
        soundManager.playErodePulse();
        break;
      case 2:
        soundManager.playAtmosphereTransition();
        break;
      case 3:
        soundManager.playSubtleImpact();
        break;
      case 4:
        soundManager.playGlobeHum();
        soundManager.playDigitalChirp();
        break;
      case 5:
        soundManager.playNotificationChime(0);
        soundManager.playClick();
        break;
    }
  }, []);

  // Trigger dramatic unique globe explosion when transitioning to Step 5 (STRICTLY SINGLE BLAST)
  const triggerGlobeBlastAndGoToStep5 = useCallback(() => {
    // If already blasting or already on Step 5, ignore any repeated triggers
    if (isGlobeBlastingRef.current || currentStep === 5) return;
    isGlobeBlastingRef.current = true;

    if (blastTimerRef.current) clearTimeout(blastTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsGlobeBlasting(true);
    soundManager.playCosmicGlobeBlast();

    // After 920ms (peak shockwave expansion & full dissolution), switch smoothly to Step 5
    blastTimerRef.current = window.setTimeout(() => {
      setCurrentStep(5);
      soundManager.playNotificationChime(0);
      soundManager.playClick();

      blastTimerRef.current = window.setTimeout(() => {
        setIsGlobeBlasting(false);
        isGlobeBlastingRef.current = false;
      }, 700);
    }, 920);
  }, [currentStep]);

  // Jump to step
  const goToStep = useCallback(
    (stepNum: number) => {
      const target = Math.max(1, Math.min(5, stepNum));

      // If jumping to Step 5 from Step 4 (Globe), blast the globe!
      if (target === 5 && currentStep === 4) {
        triggerGlobeBlastAndGoToStep5();
        return;
      }

      // If already blasting to Step 5, ignore redundant calls
      if (isGlobeBlastingRef.current && target === 5) return;

      if (blastTimerRef.current) clearTimeout(blastTimerRef.current);
      isGlobeBlastingRef.current = false;
      setIsGlobeBlasting(false);
      setCurrentStep(target);
      triggerStepAudio(target);
    },
    [currentStep, triggerStepAudio, triggerGlobeBlastAndGoToStep5]
  );

  // Restart from step 1 (Origin: Erode)
  const restartFromFirst = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (blastTimerRef.current) clearTimeout(blastTimerRef.current);
    isGlobeBlastingRef.current = false;
    setIsGlobeBlasting(false);
    setCurrentStep(1);
    setIsPlaying(true);
    triggerStepAudio(1);
  }, [triggerStepAudio]);

  // Auto-play loop (only advances when section is actively in view)
  useEffect(() => {
    if (!isPlaying || !isInView) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (currentStep >= 5) return;

    const currentMeta = STEPS[currentStep - 1];
    if (currentMeta && currentMeta.durationMs > 0) {
      timerRef.current = window.setTimeout(() => {
        if (currentStep === 4) {
          triggerGlobeBlastAndGoToStep5();
        } else {
          goToStep(currentStep + 1);
        }
      }, currentMeta.durationMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying, isInView, goToStep, triggerGlobeBlastAndGoToStep5]);

  // IntersectionObserver: Whenever scrolling into Contact/Footer after being out of view, restart from step 1
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let hasBeenOutOfView = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.1) {
            hasBeenOutOfView = true;
            setIsInView(false);
            if (timerRef.current) clearTimeout(timerRef.current);
          } else if (entry.intersectionRatio >= 0.25 && hasBeenOutOfView) {
            hasBeenOutOfView = false;
            setIsInView(true);
            restartFromFirst();
          }
        }
      },
      { threshold: [0.05, 0.25] }
    );

    observer.observe(sectionEl);

    // Initial check if page loaded directly with #contact
    if (window.location.hash === '#contact') {
      setIsInView(true);
      restartFromFirst();
    }

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restartFromFirst]);

  // Handle Navbar click and hash changes to #contact
  useEffect(() => {
    const handleSectionView = (e: Event) => {
      const customEvent = e as CustomEvent<{ sectionId: string }>;
      if (customEvent.detail?.sectionId === 'contact') {
        setIsInView(true);
        restartFromFirst();
      }
    };

    const handleHash = () => {
      if (window.location.hash === '#contact') {
        setIsInView(true);
        restartFromFirst();
      }
    };

    window.addEventListener('mantif:section-view', handleSectionView);
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('mantif:section-view', handleSectionView);
      window.removeEventListener('hashchange', handleHash);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restartFromFirst]);

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentMeta = STEPS[currentStep - 1] || STEPS[0];

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="relative w-full min-h-screen bg-[#000B14] text-[#FAF8F5] overflow-hidden select-none flex flex-col justify-between"
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ACTUAL GOOGLE MAPS EXPERIENCE (Active for Steps 1-3 only) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-700 ${currentStep <= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <GoogleMapsStoryExperience
          sceneIndex={currentStep}
          onSceneChange={(s) => goToStep(s)}
        />
      </div>

      {/* 3D WebGL Globe Overlay: ONLY active in Step 4 Globe and during the blast explosion */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${currentStep === 4 || isGlobeBlasting ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <FromErodeToWorldGlobe
          sceneIndex={currentStep}
          interactive={currentStep === 4 && !isGlobeBlasting}
          isBlasting={isGlobeBlasting}
        />
      </div>

      {/* Clean Simple Blast Effect */}
      {isGlobeBlasting && (
        <div
          key="simple-blast-effect"
          className="absolute inset-0 pointer-events-none z-15 flex items-center justify-center overflow-hidden"
        >
          {/* 1. Soft central flash that expands smoothly */}
          <div
            className="w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(223,183,74,0.5) 30%, transparent 68%)',
              animation: 'simpleBlastCore 0.75s cubic-bezier(0.16, 0.8, 0.25, 1) 1 forwards',
            }}
          />

          {/* 2. Single crisp expanding gold shockwave ring */}
          <div
            className="absolute w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-[#DFB74A] pointer-events-none"
            style={{
              animation: 'simpleBlastRing 0.75s cubic-bezier(0.16, 0.8, 0.25, 1) 1 forwards',
            }}
          />
        </div>
      )}

      {/* Ambient gradient fade */}
      <div
        className="absolute top-0 inset-x-0 h-28 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, #00111D, transparent)' }}
      />

      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#001726]/90 border border-[#DFB74A]/40 backdrop-blur-md shadow-md">
            <Radio className="w-3.5 h-3.5 text-[#DFB74A] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-[#DFB74A] tracking-[0.2em] uppercase">
              MANTIF · FROM ERODE TO THE WORLD
            </span>
          </div>
        </div>

        {/* Clean status pill positioned in header to avoid obscuring the map */}
        {currentStep < 5 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#001726]/90 border border-[#DFB74A]/40 shadow-md backdrop-blur-md animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#DFB74A] animate-ping" />
            <span className="font-mono text-xs font-semibold text-[#FAF8F5]">
              {currentMeta.tag}
            </span>
          </div>
        )}
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. STEP 5: CONNECT WITH US (CARDLESS OPEN ARCHITECTURAL HUB) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-10 py-6 pointer-events-auto w-full max-w-7xl mx-auto animate-fadeIn">
          {/* Hero Heading directly on space without card */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.9)]">
              Connect with Us.
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-[#93C5FD] mt-2 drop-shadow-md">
              "From Erode to the world, we're building the future of learning together."
            </p>
          </div>

          {/* 3 Borderless Columns directly over canvas */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            {/* Column 1: Direct Helplines */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="font-mono text-xs text-[#DFB74A] font-bold tracking-widest uppercase">
                  01 / Helplines
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3 Lines Active
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {phoneNumbers.map((p, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col pb-3 border-b border-white/10 last:border-0 transition-colors"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-[#DFB74A] transition-colors drop-shadow">
                        {p.number}
                      </span>
                      <span className="font-mono text-[10px] text-[#DFB74A] font-medium tracking-wider">
                        Line {idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={p.tel}
                        onClick={() => soundManager.playClick()}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#DFB74A] hover:bg-[#F2C95C] text-[#00111D] font-mono text-xs font-bold text-center transition-all duration-200 hover:shadow-[0_0_15px_rgba(223,183,74,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={p.wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundManager.playClick()}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold text-center transition-all duration-200 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Official Correspondence & Platform */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="font-mono text-xs text-[#38BDF8] font-bold tracking-widest uppercase">
                  02 / Official Inquiries
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8] font-medium tracking-wider uppercase">
                  Primary
                </span>
              </div>

              <div className="space-y-6 pt-1">
                {/* Email */}
                <div>
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest block mb-1">
                    Email Correspondence
                  </span>
                  <a
                    href="mailto:info@mantif.com"
                    onClick={() => soundManager.playClick()}
                    className="font-serif text-2xl sm:text-3xl font-bold text-white hover:text-[#38BDF8] transition-colors block drop-shadow"
                  >
                    info@mantif.com
                  </a>
                  <a
                    href="mailto:info@mantif.com"
                    onClick={() => soundManager.playClick()}
                    className="mt-2.5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#00111D] font-mono text-xs font-bold transition-all duration-200 shadow-md hover:shadow-[0_0_18px_rgba(56,189,248,0.45)] hover:scale-[1.01]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Compose Email</span>
                  </a>
                </div>

                {/* Platform */}
                <div className="pt-2 border-t border-white/10">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest block mb-1">
                    Official Platform
                  </span>
                  <a
                    href="https://mantif.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundManager.playClick()}
                    className="font-mono text-lg sm:text-xl font-bold text-white hover:text-[#DFB74A] transition-colors flex items-center justify-between drop-shadow"
                  >
                    <span>mantif.com</span>
                    <ArrowUpRight className="w-4 h-4 text-[#DFB74A]" />
                  </a>
                  <a
                    href="https://mantif.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundManager.playClick()}
                    className="mt-2.5 inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-[#DFB74A] hover:bg-[#F2C95C] text-[#00111D] font-mono text-xs font-bold transition-all duration-200 shadow-md hover:shadow-[0_0_18px_rgba(223,183,74,0.45)] hover:scale-[1.01]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visit mantif.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Social Channels & MSME Accreditation */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="font-mono text-xs text-[#DFB74A] font-bold tracking-widest uppercase">
                  03 / Socials & MSME
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8] font-medium tracking-wider uppercase">
                  Accredited
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {/* Socials */}
                <div className="space-y-2">
                  <a
                    href="https://www.instagram.com/mantif.ai?igsi=NHoxb2J2cWdrNG5q"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundManager.playClick()}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 border border-white/10 transition-all text-xs sm:text-sm font-mono text-white group"
                  >
                    <span className="group-hover:text-[#DFB74A] transition-colors">
                      Instagram (@mantif.ai)
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#DFB74A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/acuity-learning-hub-871102401/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundManager.playClick()}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 border border-white/10 transition-all text-xs sm:text-sm font-mono text-white group"
                  >
                    <span className="group-hover:text-[#38BDF8] transition-colors">
                      LinkedIn (MANTIF Hub)
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#38BDF8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

                {/* MSME Details */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#DFB74A] font-bold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
                    <span>MSME Registered Startup</span>
                  </div>
                  <p className="text-sm font-serif font-bold text-white">
                    Acuity / MANTIF Learning Hub
                  </p>
                  <p className="text-xs font-mono text-[#94A3B8]">
                    Erode, Tamil Nadu, India
                  </p>
                  <p className="text-[11px] font-mono text-[#64748B] mt-1.5 leading-relaxed">
                    Pioneering AI & human learning ecosystems from Tamil Nadu to global frontiers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. BOTTOM 5-STEP CONTROLLER                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <nav aria-label="Story Progression" className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-6 flex flex-col gap-3 pointer-events-auto">
        <div className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-[#001726]/95 border border-white/15 backdrop-blur-md shadow-2xl overflow-x-auto">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isPassed = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className={`flex-1 min-w-[90px] sm:min-w-[120px] flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-[#DFB74A] text-[#00111D] font-bold shadow-[0_0_15px_rgba(223,183,74,0.4)] scale-102'
                    : isPassed
                      ? 'bg-white/5 text-[#93C5FD] hover:bg-white/10'
                      : 'bg-transparent text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5'
                  }`}
                title={`Step ${step.id}: ${step.label}`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] uppercase">0{step.id}</span>
                  {isActive && <Compass className="w-3 h-3 animate-spin" />}
                </div>
                <span className="font-mono text-[10px] sm:text-xs truncate max-w-[110px]">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-Bar with Prev / Next & Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-white/10 gap-2 text-[10px] font-mono text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
            <span>
              Origin: Erode, Tamil Nadu 638001, India · Connected Worldwide
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goToStep(Math.max(1, currentStep - 1))}
              disabled={currentStep <= 1}
              className="px-3 py-1 rounded bg-[#001726]/80 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all flex items-center gap-1 font-mono text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>
            <button
              onClick={() => goToStep(Math.min(5, currentStep + 1))}
              disabled={currentStep >= 5}
              className="px-3 py-1 rounded bg-[#001726]/80 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all flex items-center gap-1 font-mono text-xs"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full border border-white/10 bg-[#001726]/80 hover:bg-[#DFB74A] text-[#DFB74A] hover:text-[#00111D] transition-all ml-1"
              title="Return to top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes singleSupernovaBlast {
          0% {
            transform: scale(0.25);
            opacity: 1;
            filter: brightness(1.6);
          }
          35% {
            transform: scale(1.1);
            opacity: 0.95;
            filter: brightness(1.3);
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            filter: brightness(1);
          }
        }

        @keyframes anamorphicLaserFlare {
          0% {
            transform: scaleX(0.04) scaleY(3.5);
            opacity: 0;
          }
          18% {
            transform: scaleX(1.1) scaleY(1.8);
            opacity: 1;
          }
          50% {
            transform: scaleX(1.8) scaleY(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scaleX(2.9) scaleY(0.05);
            opacity: 0;
          }
        }

        @keyframes ambientSpaceFlash {
          0% {
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          60% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </footer>
  );
};
