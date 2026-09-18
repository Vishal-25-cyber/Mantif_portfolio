import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

interface IntroSectionProps {
  onIntroComplete?: () => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({ onIntroComplete }) => {
  const [stage, setStage] = useState<string>('walking');
  const [lettersRevealed, setLettersRevealed] = useState<number[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const letters = [
    { char: 'M', isLambda: false },
    { char: 'Λ', isLambda: true },
    { char: 'N', isLambda: false },
    { char: 'T', isLambda: false },
    { char: 'I', isLambda: false },
    { char: 'F', isLambda: false },
  ];

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const skipIntro = () => {
    if (stage === 'completed') return;
    clearTimers();
    setLettersRevealed([0, 1, 2, 3, 4, 5]);
    setShowSubtitle(true);
    setStage('completed');
    onIntroComplete?.();
  };

  const startSequence = () => {
    clearTimers();
    setStage('walking');
    setLettersRevealed([]);
    setShowSubtitle(false);

    const push = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeoutsRef.current.push(id);
    };

    push(() => {
      setStage('handshake');
      soundManager.playHandshakeChord();
    }, 3200);

    push(() => setStage('fadeCharacters'), 6400);

    push(() => {
      setStage('titleReveal');
      letters.forEach((_, idx) => {
        const id = setTimeout(() => {
          setLettersRevealed((prev) => [...prev, idx]);
          soundManager.playLetterReveal(idx);
        }, idx * 220);
        timeoutsRef.current.push(id);
      });
    }, 7200);

    push(() => {
      setShowSubtitle(true);
      onIntroComplete?.();
    }, 9000);
    push(() => setStage('completed'), 9500);
  };

  useEffect(() => {
    startSequence();
    return clearTimers;
  }, []);

  const scrollToNext = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSceneActive = stage === 'walking' || stage === 'handshake';
  const isTitleActive = stage === 'titleReveal' || stage === 'completed';

  return (
    <section
      id="intro"
      className="relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden select-none bg-[#FAF8F5] px-4 sm:px-8"
    >
      {/* Large ghost editorial MANTIF watermark backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
        <span
          className="font-serif font-bold text-[20vw] sm:text-[22vw] tracking-widest text-[#002137] select-none"
          style={{ opacity: 0.025, lineHeight: 1 }}
        >
          MANTIF
        </span>
      </div>

      {/* Ambient radial gradient spotlight */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(0,75,121,0.07) 0%, transparent 70%)'
        }}
      />



      {/* ── Center Stage ── */}
      <div className="relative w-full max-w-5xl flex flex-col items-center justify-center flex-1 z-10">

        {/* ============ SCENES 1-3: WALK & HANDSHAKE ============ */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${isSceneActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

          {/* Ground horizon line */}
          <div className="absolute bottom-[22%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#002137]/12 to-transparent pointer-events-none" />

          {/* Subtle grid lines - editorial touch */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#002137 1px, transparent 1px), linear-gradient(90deg, #002137 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />

          <div className="relative w-full max-w-2xl h-72 flex items-end justify-center">

            {/* Human character */}
            <div
              className="absolute bottom-0 flex flex-col items-center will-change-transform"
              style={{
                transition: stage === 'handshake' ? 'transform 0.8s cubic-bezier(0.2,1,0.3,1)' : undefined,
                transform: stage === 'walking'
                  ? 'translateX(-160%)'
                  : stage === 'handshake'
                  ? 'translateX(-52px)'
                  : 'translateX(-52px)',
                animation: stage === 'walking' ? 'walkHumanAnim 3.2s cubic-bezier(0.25,1,0.5,1) forwards' : undefined,
              }}
            >
              <svg viewBox="0 0 64 130" className="w-16 h-32 sm:w-20 sm:h-40 overflow-visible" fill="none">
                {/* Head with warm skin tone */}
                <ellipse cx="32" cy="19" rx="11" ry="12" fill="#F5CBA7" stroke="#002137" strokeWidth="2"/>
                {/* Hair */}
                <path d="M21 16 Q32 6 43 16" fill="#1A0800" />
                {/* Smile */}
                <path d="M28 22 Q32 26 36 22" stroke="#002137" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Eyes */}
                <circle cx="28" cy="18" r="1.5" fill="#002137"/>
                <circle cx="36" cy="18" r="1.5" fill="#002137"/>
                {/* Collar / Jacket */}
                <path d="M22 31 L32 31 L42 31" stroke="#FAF8F5" strokeWidth="2.5"/>
                {/* Torso / dark jacket */}
                <rect x="22" y="31" width="20" height="34" rx="4" fill="#002137"/>
                {/* White shirt collar */}
                <path d="M28 31 L32 37 L36 31" fill="#FAF8F5"/>
                {/* Left arm (back) */}
                <line x1="22" y1="35" x2="14" y2="62" stroke="#002137" strokeWidth="5" strokeLinecap="round"/>
                {/* Right arm — reaching for handshake */}
                {stage === 'handshake' ? (
                  <line x1="42" y1="35" x2="60" y2="52" stroke="#DFB74A" strokeWidth="4" strokeLinecap="round" className="animate-pulse"/>
                ) : (
                  <line x1="42" y1="35" x2="50" y2="60" stroke="#002137" strokeWidth="5" strokeLinecap="round"/>
                )}
                {/* Legs */}
                <line x1="29" y1="65" x2="24" y2="110" stroke="#1E293B" strokeWidth="7" strokeLinecap="round"
                  style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '29px 65px' } : undefined}/>
                <line x1="35" y1="65" x2="40" y2="110" stroke="#1E293B" strokeWidth="7" strokeLinecap="round"
                  style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '35px 65px' } : undefined}/>
                {/* Shoes */}
                <ellipse cx="22" cy="112" rx="6" ry="3" fill="#0F172A"/>
                <ellipse cx="40" cy="112" rx="6" ry="3" fill="#0F172A"/>
                {/* Shadow */}
                <ellipse cx="32" cy="118" rx="16" ry="3.5" fill="#002137" opacity="0.08"/>
              </svg>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase mt-1 font-semibold">HUMAN</span>
            </div>

            {/* Handshake convergence focal point */}
            {stage === 'handshake' && (
              <div className="absolute bottom-20 z-30 flex items-center justify-center">
                {/* Pulsing rings */}
                <div className="absolute w-24 h-24 rounded-full border border-[#DFB74A]/60 animate-ping" style={{ animationDuration: '1.2s' }}/>
                <div className="absolute w-16 h-16 rounded-full border border-[#004B79]/40 animate-ping" style={{ animationDuration: '1.8s' }}/>
                {/* Central glow */}
                <div className="w-6 h-6 rounded-full bg-[#DFB74A] shadow-[0_0_30px_10px_rgba(223,183,74,0.4)]"/>
              </div>
            )}

            {/* Robot character */}
            <div
              className="absolute bottom-0 flex flex-col items-center will-change-transform"
              style={{
                transition: stage === 'handshake' ? 'transform 0.8s cubic-bezier(0.2,1,0.3,1)' : undefined,
                transform: stage === 'walking'
                  ? 'translateX(160%)'
                  : stage === 'handshake'
                  ? 'translateX(52px)'
                  : 'translateX(52px)',
                animation: stage === 'walking' ? 'walkRobotAnim 3.2s cubic-bezier(0.25,1,0.5,1) forwards' : undefined,
              }}
            >
              <svg viewBox="0 0 64 130" className="w-16 h-32 sm:w-20 sm:h-40 overflow-visible" fill="none">
                {/* Antenna */}
                <line x1="32" y1="0" x2="32" y2="10" stroke="#DFB74A" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="32" cy="0" r="3" fill="#DFB74A"/>
                <circle cx="32" cy="0" r="5" fill="#DFB74A" opacity="0.3" className="animate-ping" style={{ animationDuration: '2s' }}/>
                {/* Rounded head */}
                <rect x="16" y="10" width="32" height="24" rx="10" fill="#FAF8F5" stroke="#004B79" strokeWidth="2"/>
                {/* Visor */}
                <rect x="20" y="16" width="24" height="11" rx="5" fill="#002137"/>
                {/* Warm eyes */}
                <circle cx="27" cy="21.5" r="2.5" fill="#DFB74A" className="animate-pulse"/>
                <circle cx="37" cy="21.5" r="2.5" fill="#DFB74A" className="animate-pulse"/>
                {/* Smile indicator */}
                <path d="M26 28 Q32 31 38 28" stroke="#004B79" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Body */}
                <rect x="16" y="38" width="32" height="30" rx="7" fill="#F3EFE6" stroke="#004B79" strokeWidth="2"/>
                {/* Chest core */}
                <circle cx="32" cy="50" r="5" stroke="#DFB74A" strokeWidth="2" fill="none"/>
                <circle cx="32" cy="50" r="2" fill="#DFB74A" className="animate-pulse"/>
                {/* Chest accent bars */}
                <line x1="23" y1="60" x2="41" y2="60" stroke="#004B79" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Left arm — reaching for handshake */}
                {stage === 'handshake' ? (
                  <line x1="16" y1="46" x2="-2" y2="56" stroke="#DFB74A" strokeWidth="5" strokeLinecap="round" className="animate-pulse"/>
                ) : (
                  <line x1="16" y1="46" x2="8" y2="68" stroke="#004B79" strokeWidth="5" strokeLinecap="round"/>
                )}
                {/* Right arm */}
                <line x1="48" y1="46" x2="56" y2="68" stroke="#004B79" strokeWidth="5" strokeLinecap="round"/>
                {/* Legs */}
                <rect x="24" y="70" width="6" height="38" rx="3" fill="#002137"
                  style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '27px 70px' } : undefined}/>
                <rect x="34" y="70" width="6" height="38" rx="3" fill="#002137"
                  style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '37px 70px' } : undefined}/>
                {/* Feet */}
                <ellipse cx="27" cy="112" rx="7" ry="3.5" fill="#001A2C"/>
                <ellipse cx="37" cy="112" rx="7" ry="3.5" fill="#001A2C"/>
                {/* Shadow */}
                <ellipse cx="32" cy="118" rx="16" ry="3.5" fill="#002137" opacity="0.08"/>
              </svg>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#004B79] uppercase mt-1 font-semibold">AI ASSISTANT</span>
            </div>
          </div>

          {/* Handshake tagline */}
          <div className={`text-center mt-10 transition-all duration-700 ${stage === 'handshake' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#002137]">
              HUMAN <span className="text-[#DFB74A]">×</span> ARTIFICIAL INTELLIGENCE
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#64748B] mt-3 tracking-wider">
              Where empathetic teaching converges with intelligent systems.
            </p>
          </div>
        </div>

        {/* ============ SCENE 4: MANTIF CINEMATIC TITLE ============ */}
        <div className={`w-full flex flex-col items-center justify-center text-center transition-all duration-1000 ${isTitleActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

          {/* Issue number — editorial magazine detail */}
          <div className="flex items-center gap-4 mb-8">
            <span className="h-[1px] w-8 sm:w-16 bg-[#002137]/20" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#64748B] uppercase">Est. 2024 · MANTIF Education</span>
            <span className="h-[1px] w-8 sm:w-16 bg-[#002137]/20" />
          </div>

          {/* Giant 3D-depth letters */}
          <div className="flex items-center justify-center gap-0 sm:gap-1 md:gap-2 relative">
            {letters.map((item, idx) => {
              const isRevealed = lettersRevealed.includes(idx);
              return (
                <div
                  key={idx}
                  className="transition-all duration-600 ease-out will-change-transform"
                  style={{
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed
                      ? 'translateY(0px) scale(1) rotateX(0deg)'
                      : 'translateY(60px) scale(0.6) rotateX(-45deg)',
                    transitionDelay: `${idx * 30}ms`,
                    perspective: '800px',
                  }}
                >
                  <span
                    className={`block font-serif font-bold leading-none tracking-tight select-none ${
                      item.isLambda ? 'text-[#DFB74A]' : 'text-[#002137]'
                    }`}
                    style={{
                      fontSize: 'clamp(4rem, 12vw, 9.5rem)',
                      textShadow: item.isLambda
                        ? '0 8px 40px rgba(223,183,74,0.25)'
                        : '0 8px 40px rgba(0,33,55,0.08)',
                    }}
                  >
                    {item.char}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Subtitle reveal */}
          <div className={`flex flex-col items-center mt-8 transition-all duration-800 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 sm:gap-5 mb-4">
              <span className="w-10 sm:w-20 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-[#002137] uppercase">
                Human × Artificial Intelligence
              </span>
              <span className="w-10 sm:w-20 h-[1px] bg-[#DFB74A]" />
            </div>

            <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#004B79] font-light">
              "Learning. Building. Evolving."
            </p>

          </div>
        </div>
      </div>

      {/* Scroll prompt — fades in when title appears */}
      <div
        className={`w-full flex flex-col items-center pb-8 z-20 transition-all duration-700 ${
          isTitleActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToNext}
          onMouseEnter={() => setCursorMode('hover')}
          onMouseLeave={() => setCursorMode('default')}
          className="group flex flex-col items-center gap-2 text-[#64748B] hover:text-[#002137] transition-colors"
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase">Continue</span>
          <div className="w-8 h-8 rounded-full border border-[#002137]/20 flex items-center justify-center group-hover:border-[#002137] group-hover:translate-y-1 transition-all">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Walk animations */}
      <style>{`
        @keyframes walkHumanAnim {
          from { transform: translateX(-160%); }
          to   { transform: translateX(-52px); }
        }
        @keyframes walkRobotAnim {
          from { transform: translateX(160%); }
          to   { transform: translateX(52px); }
        }
        @keyframes legSwingL {
          0%,100% { transform: rotate(-12deg); }
          50%      { transform: rotate(12deg); }
        }
        @keyframes legSwingR {
          0%,100% { transform: rotate(12deg); }
          50%      { transform: rotate(-12deg); }
        }
      `}</style>
    </section>
  );
};
