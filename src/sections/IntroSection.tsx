import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';
import { Intro3DBackground } from '../components/Intro3DBackground';

interface IntroSectionProps {
  onIntroComplete?: () => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({ onIntroComplete }) => {
  const [stage, setStage] = useState<string>('walking');
  const [lettersRevealed, setLettersRevealed] = useState<number[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 3D Logo interaction states
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 });
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [logoBurst, setLogoBurst] = useState(false);

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setLogoTilt({ x: -y * 22, y: x * 22 });
  };

  const handleLogoMouseLeave = () => {
    setLogoTilt({ x: 0, y: 0 });
    setIsLogoHovered(false);
  };

  const handleLogoClick = () => {
    setLogoBurst(true);
    soundManager.playHandshakeChord();
    setTimeout(() => setLogoBurst(false), 800);
  };

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
    }, 2800);

    push(() => setStage('fadeCharacters'), 6500);

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
      {/* 3D Animated Interactive Background */}
      <Intro3DBackground />



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

          <div className="relative w-full max-w-3xl h-80 sm:h-[380px] flex items-end justify-center">

            {/* Human character */}
            <div
              className="absolute bottom-0 flex flex-col items-center will-change-transform"
              style={{
                transition: stage === 'handshake' ? 'transform 0.8s cubic-bezier(0.2,1,0.3,1)' : undefined,
                transform: stage === 'walking'
                  ? 'translateX(-180%)'
                  : 'translateX(var(--human-target, -68px))',
                animation: stage === 'walking' ? 'walkHumanAnim 2.8s cubic-bezier(0.25,1,0.5,1) forwards' : undefined,
              }}
            >
              <svg viewBox="0 0 64 130" className="w-28 h-56 sm:w-36 sm:h-72 overflow-visible" fill="none">
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
                  <line x1="42" y1="35" x2="68" y2="52" stroke="#DFB74A" strokeWidth="5" strokeLinecap="round" className="animate-pulse"/>
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
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-[#64748B] uppercase mt-2 font-bold">HUMAN</span>
            </div>

            {/* Handshake convergence focal point */}
            {stage === 'handshake' && (
              <div className="absolute bottom-32 sm:bottom-40 z-30 flex items-center justify-center pointer-events-none">
                {/* Pulsing rings */}
                <div className="absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-[#DFB74A]/60 animate-ping" style={{ animationDuration: '1.2s' }}/>
                <div className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-[#004B79]/40 animate-ping" style={{ animationDuration: '1.8s' }}/>
                {/* Central glow */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#DFB74A] shadow-[0_0_40px_15px_rgba(223,183,74,0.5)]"/>
              </div>
            )}

            {/* Robot character */}
            <div
              className="absolute bottom-0 flex flex-col items-center will-change-transform"
              style={{
                transition: stage === 'handshake' ? 'transform 0.8s cubic-bezier(0.2,1,0.3,1)' : undefined,
                transform: stage === 'walking'
                  ? 'translateX(180%)'
                  : 'translateX(var(--robot-target, 68px))',
                animation: stage === 'walking' ? 'walkRobotAnim 2.8s cubic-bezier(0.25,1,0.5,1) forwards' : undefined,
              }}
            >
              <svg viewBox="0 0 64 130" className="w-28 h-56 sm:w-36 sm:h-72 overflow-visible" fill="none">
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
                  <line x1="16" y1="46" x2="-6" y2="54" stroke="#DFB74A" strokeWidth="5" strokeLinecap="round" className="animate-pulse"/>
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
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-[#004B79] uppercase mt-2 font-bold">AI ASSISTANT</span>
            </div>
          </div>

          {/* Handshake tagline */}
          <div className={`text-center mt-10 transition-all duration-700 ${stage === 'handshake' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#002137] tracking-tight">
              HUMAN <span className="text-[#DFB74A]">×</span> ARTIFICIAL INTELLIGENCE
            </h2>
          </div>
        </div>

        {/* ============ SCENE 4: MANTIF CINEMATIC TITLE ============ */}
        <div className={`w-full flex flex-col items-center justify-center text-center transition-all duration-1000 ${isTitleActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>


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

            {/* 3D Pop-Up Logo Badge */}
            <div
              onMouseMove={handleLogoMouseMove}
              onMouseEnter={() => {
                setIsLogoHovered(true);
                setCursorMode('hover');
              }}
              onMouseLeave={() => {
                handleLogoMouseLeave();
                setCursorMode('default');
              }}
              onClick={handleLogoClick}
              className="relative flex flex-col items-center cursor-pointer group select-none mt-2"
              style={{
                perspective: '1000px',
              }}
            >
              {/* Expanding shockwave ring on click */}
              {logoBurst && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#DFB74A] animate-ping pointer-events-none"
                  style={{ animationDuration: '0.8s' }}
                />
              )}

              {/* Ambient radial glowing aura */}
              <div
                className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#DFB74A]/30 via-[#004B79]/20 to-[#DFB74A]/25 blur-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  animation: showSubtitle ? 'logoAuraPulse 4s ease-in-out infinite' : undefined,
                  opacity: isLogoHovered ? 0.95 : 0.65,
                }}
              />

              {/* Outer decorative spinning orbital ring */}
              <div
                className="absolute -inset-4 sm:-inset-5 rounded-full border border-dashed border-[#DFB74A]/50 pointer-events-none"
                style={{
                  animation: 'ringSpinSlow 26s linear infinite',
                }}
              />
              <div
                className="absolute -inset-2 rounded-full border border-dotted border-[#002137]/30 pointer-events-none"
                style={{
                  animation: 'ringSpinReverse 20s linear infinite',
                }}
              />

              {/* 3D Pop-Up Medallion Container */}
              <div
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-[#FAF8F5]/95 backdrop-blur-md border-2 border-[#DFB74A]/40 shadow-[0_20px_50px_rgba(0,33,55,0.12),0_6px_24px_rgba(223,183,74,0.22)] flex items-center justify-center p-3 sm:p-4.5 transition-transform duration-150 ease-out"
                style={{
                  animation: showSubtitle ? 'logoPopIn 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
                  transform: isLogoHovered
                    ? `rotateX(${logoTilt.x}deg) rotateY(${logoTilt.y}deg) scale(1.08) translateZ(24px)`
                    : 'rotateX(0deg) rotateY(0deg) scale(1)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src="/images/mantif_icon.png"
                  alt="MANTIF Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,33,55,0.15)] transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://mantif.com/images/mantif_icon.png';
                  }}
                />

                {/* Dynamic 3D specular glare on hover */}
                <div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: 'translateZ(12px)',
                  }}
                />
              </div>

              {/* Micro interactive pill badge */}
              <div
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#002137]/15 shadow-sm text-[9px] sm:text-[10px] font-mono tracking-widest text-[#002137] uppercase transition-all duration-300 group-hover:border-[#DFB74A] group-hover:bg-[#DFB74A]/10 group-hover:text-[#002137]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
                <span className="font-semibold">MANTIF EMBLEM</span>
              </div>
            </div>
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

      {/* Walk and 3D Logo Pop-Up animations */}
      <style>{`
        :root {
          --human-target: -56px;
          --robot-target: 56px;
        }
        @media (min-width: 640px) {
          :root {
            --human-target: -68px;
            --robot-target: 68px;
          }
        }
        @keyframes walkHumanAnim {
          from { transform: translateX(-180%); }
          to   { transform: translateX(var(--human-target)); }
        }
        @keyframes walkRobotAnim {
          from { transform: translateX(180%); }
          to   { transform: translateX(var(--robot-target)); }
        }
        @keyframes legSwingL {
          0%,100% { transform: rotate(-14deg); }
          50%      { transform: rotate(14deg); }
        }
        @keyframes legSwingR {
          0%,100% { transform: rotate(14deg); }
          50%      { transform: rotate(-14deg); }
        }
        @keyframes logoPopIn {
          0% {
            opacity: 0;
            transform: scale(0.15) translateY(60px) rotateX(45deg) rotateZ(-15deg);
          }
          55% {
            opacity: 1;
            transform: scale(1.18) translateY(-10px) rotateX(-8deg) rotateZ(3deg);
          }
          75% {
            transform: scale(0.96) translateY(3px) rotateX(3deg) rotateZ(-1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px) rotateX(0deg) rotateZ(0deg);
          }
        }
        @keyframes logoAuraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.85;
          }
        }
        @keyframes ringSpinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ringSpinReverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
      `}</style>
    </section>
  );
};
