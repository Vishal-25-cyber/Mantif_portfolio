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
    }, 9000);

    push(() => {
      setStage('completed');
      onIntroComplete?.();
    }, 9500);
  };

  useEffect(() => {
    startSequence();
    return clearTimers;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'completed' && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  const scrollToNext = () => {
    skipIntro();
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSceneActive = stage === 'walking' || stage === 'handshake';
  const isTitleActive = stage === 'titleReveal' || stage === 'completed';

  return (
    <section
      id="intro"
      className="relative w-full h-screen h-[100dvh] flex flex-col items-center justify-between overflow-hidden select-none bg-[#FAF8F5] px-4 sm:px-8"
    >
      {/* Interactive 3D Background with Neural Topography & Sacred Orbital Rings */}
      <Intro3DBackground stage={stage} />

      {/* Ambient luxury radial vignette spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 52%, rgba(223,183,74,0.07) 0%, rgba(0,75,121,0.05) 50%, transparent 80%)',
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

          <div className="relative w-full max-w-3xl h-80 sm:h-[380px] flex items-end justify-center">

            {/* Human character — Luxury Editorial Tailoring */}
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
              <svg viewBox="0 0 80 150" className="w-32 h-64 sm:w-40 sm:h-80 overflow-visible" fill="none">
                <defs>
                  <linearGradient id="humanJacketGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#002B49" />
                    <stop offset="100%" stopColor="#001424" />
                  </linearGradient>
                  <linearGradient id="humanSkinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7D8BA" />
                    <stop offset="100%" stopColor="#EAB992" />
                  </linearGradient>
                  <linearGradient id="goldAccentGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F5E0B8" />
                    <stop offset="50%" stopColor="#DFB74A" />
                    <stop offset="100%" stopColor="#C49A2B" />
                  </linearGradient>
                  <filter id="humanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#002137" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Soft ground shadow */}
                <ellipse cx="40" cy="142" rx="22" ry="4.5" fill="#002137" opacity="0.12" />

                {/* Left Leg (Back) */}
                <g style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '36px 82px' } : undefined}>
                  <path d="M34 82 L30 114 L28 138" stroke="#001A2C" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Polished Oxford Shoe */}
                  <path d="M22 138 Q28 136 34 138 L36 142 L20 142 Z" fill="#0A0E17" />
                </g>

                {/* Right Leg (Front) */}
                <g style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '44px 82px' } : undefined}>
                  <path d="M44 82 L48 114 L50 138" stroke="#002137" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Polished Oxford Shoe */}
                  <path d="M44 138 Q50 136 56 138 L58 142 L42 142 Z" fill="#0A0E17" />
                </g>

                {/* Left Arm (Swinging / Relaxed) */}
                <g style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '28px 46px' } : undefined}>
                  <path d="M28 46 L18 72 L16 88" stroke="#001F35" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="16" cy="90" r="3.2" fill="url(#humanSkinGrad)" />
                </g>

                {/* Torso & Tailored Blazer */}
                <g filter="url(#humanGlow)">
                  {/* Blazer body */}
                  <path d="M26 44 L54 44 L50 84 L30 84 Z" fill="url(#humanJacketGrad)" />
                  {/* White dress shirt V */}
                  <path d="M35 44 L40 58 L45 44 Z" fill="#FAF8F5" />
                  {/* Royal Gold Lapel Pin & Tie Clip */}
                  <line x1="40" y1="52" x2="40" y2="60" stroke="url(#goldAccentGrad)" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Satin Lapels */}
                  <path d="M30 44 L38 66 L30 68" stroke="#001424" strokeWidth="2.5" fill="none" />
                  <path d="M50 44 L42 66 L50 68" stroke="#001424" strokeWidth="2.5" fill="none" />
                </g>

                {/* Head & Neck */}
                {/* Neck */}
                <rect x="36" y="34" width="8" height="12" fill="url(#humanSkinGrad)" rx="2" />
                {/* Sculpted Head */}
                <path d="M31 22 C31 14 49 14 49 22 C49 32 45 36 40 36 C35 36 31 32 31 22 Z" fill="url(#humanSkinGrad)" />
                {/* Modern Haircut (Sleek Side-Part) */}
                <path d="M29 20 C29 10 42 8 51 12 C52 16 50 22 47 24 C45 20 40 18 35 19 C31 20 29 23 29 20 Z" fill="#1C1008" />
                {/* Gold-Rimmed Augmented Glasses */}
                <rect x="34" y="21" width="5.5" height="4.2" rx="1.5" stroke="url(#goldAccentGrad)" strokeWidth="1.2" fill="#FAF8F5" fillOpacity="0.2" />
                <rect x="42" y="21" width="5.5" height="4.2" rx="1.5" stroke="url(#goldAccentGrad)" strokeWidth="1.2" fill="#FAF8F5" fillOpacity="0.2" />
                <line x1="39.5" y1="23" x2="42" y2="23" stroke="url(#goldAccentGrad)" strokeWidth="1.2" />
                {/* Confident Smile */}
                <path d="M38 29 Q40.5 31.5 43 29" stroke="#002137" strokeWidth="1.4" strokeLinecap="round" fill="none" />

                {/* Right Arm (Reaching for Handshake or Walking) */}
                {stage === 'handshake' ? (
                  <g>
                    {/* Extended Arm */}
                    <path d="M50 46 L72 60 L88 56" stroke="url(#humanJacketGrad)" strokeWidth="6" strokeLinecap="round" />
                    {/* Gold Watch on wrist */}
                    <ellipse cx="86" cy="56" rx="2.5" ry="3.8" fill="url(#goldAccentGrad)" />
                    {/* Reaching Hand with glowing gold aura */}
                    <path d="M88 56 L96 54 L98 57 L93 60 Z" fill="url(#humanSkinGrad)" className="animate-pulse" />
                  </g>
                ) : (
                  <g style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '50px 46px' } : undefined}>
                    <path d="M50 46 L58 70 L60 86" stroke="url(#humanJacketGrad)" strokeWidth="5.5" strokeLinecap="round" />
                    <circle cx="60" cy="88" r="3.2" fill="url(#humanSkinGrad)" />
                    {/* Gold Watch */}
                    <circle cx="59.5" cy="84" r="2.0" fill="url(#goldAccentGrad)" />
                  </g>
                )}
              </svg>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A]" />
                <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-[#002137] uppercase font-bold">
                  HUMAN
                </span>
              </div>
            </div>

            {/* Handshake convergence focal point */}
            {stage === 'handshake' && (
              <div className="absolute bottom-36 sm:bottom-44 z-30 flex items-center justify-center pointer-events-none">
                {/* Pulsing sacred geometry rings */}
                <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-[#DFB74A]/80 animate-ping" style={{ animationDuration: '1.1s' }} />
                <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-[#004B79]/60 animate-ping" style={{ animationDuration: '1.6s' }} />
                {/* High-energy golden core burst */}
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#DFB74A] to-[#F5E0B8] shadow-[0_0_50px_20px_rgba(223,183,74,0.65)] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            )}

            {/* Robot character — Sleek Luxury Cybernetic AI */}
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
              <svg viewBox="0 0 80 150" className="w-32 h-64 sm:w-40 sm:h-80 overflow-visible" fill="none">
                <defs>
                  <linearGradient id="robotChassisGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FAF8F5" />
                    <stop offset="60%" stopColor="#EDE6D8" />
                    <stop offset="100%" stopColor="#DFD6C4" />
                  </linearGradient>
                  <linearGradient id="robotSapphireGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00669E" />
                    <stop offset="100%" stopColor="#003152" />
                  </linearGradient>
                  <linearGradient id="robotVisorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#001A2C" />
                    <stop offset="100%" stopColor="#000D17" />
                  </linearGradient>
                  <filter id="robotGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#004B79" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Ground shadow */}
                <ellipse cx="40" cy="142" rx="22" ry="4.5" fill="#002137" opacity="0.12" />

                {/* Left Leg (Front) */}
                <g style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '35px 82px' } : undefined}>
                  {/* Bionic Upper & Lower Leg */}
                  <rect x="31" y="82" width="7" height="30" rx="3.5" fill="url(#robotSapphireGrad)" />
                  {/* Golden Knee Piston */}
                  <circle cx="34.5" cy="112" r="3.2" fill="url(#goldAccentGrad)" />
                  <rect x="31.5" y="114" width="6" height="24" rx="3" fill="#001F33" />
                  {/* Aerodynamic Foot */}
                  <path d="M25 138 Q34 135 41 138 L42 142 L23 142 Z" fill="url(#goldAccentGrad)" />
                </g>

                {/* Right Leg (Back) */}
                <g style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '45px 82px' } : undefined}>
                  <rect x="42" y="82" width="7" height="30" rx="3.5" fill="#002137" />
                  <circle cx="45.5" cy="112" r="3.2" fill="url(#goldAccentGrad)" />
                  <rect x="42.5" y="114" width="6" height="24" rx="3" fill="#001424" />
                  <path d="M37 138 Q45 135 52 138 L53 142 L35 142 Z" fill="#002137" />
                </g>

                {/* Right Arm (Swinging / Back) */}
                <g style={stage === 'walking' ? { animation: 'legSwingL 0.55s ease-in-out infinite', transformOrigin: '54px 46px' } : undefined}>
                  <rect x="52" y="46" width="6" height="24" rx="3" fill="#002137" />
                  <circle cx="55" cy="71" r="2.8" fill="url(#goldAccentGrad)" />
                  <rect x="52.5" y="73" width="5" height="16" rx="2.5" fill="url(#robotSapphireGrad)" />
                  <circle cx="55" cy="91" r="3" fill="url(#goldAccentGrad)" />
                </g>

                {/* Torso — Sculpted Bionic Chassis */}
                <g filter="url(#robotGlow)">
                  <path d="M26 44 C26 42 54 42 54 44 L50 82 C50 84 30 84 30 82 Z" fill="url(#robotChassisGrad)" stroke="url(#robotSapphireGrad)" strokeWidth="1.5" />
                  {/* Side Sapphire Armor Panels */}
                  <path d="M26 46 L31 46 L33 80 L30 80 Z" fill="url(#robotSapphireGrad)" />
                  <path d="M54 46 L49 46 L47 80 L50 80 Z" fill="url(#robotSapphireGrad)" />
                  {/* Golden Quantum Core Reactor */}
                  <circle cx="40" cy="58" r="6.5" fill="#001A2C" stroke="url(#goldAccentGrad)" strokeWidth="2" />
                  <circle cx="40" cy="58" r="3.2" fill="url(#goldAccentGrad)" className="animate-pulse" />
                  {/* Tech telemetry lines */}
                  <line x1="34" y1="70" x2="46" y2="70" stroke="url(#goldAccentGrad)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="36" y1="74" x2="44" y2="74" stroke="url(#robotSapphireGrad)" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* Aerodynamic Head & Glass Visor */}
                {/* Antenna Beacon */}
                <line x1="40" y1="6" x2="40" y2="16" stroke="url(#goldAccentGrad)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="40" cy="5" r="3" fill="url(#goldAccentGrad)" />
                <circle cx="40" cy="5" r="6" fill="url(#goldAccentGrad)" opacity="0.4" className="animate-ping" style={{ animationDuration: '1.8s' }} />
                {/* Helmet Chassis */}
                <path d="M25 22 C25 12 55 12 55 22 C55 36 51 38 40 38 C29 38 25 36 25 22 Z" fill="url(#robotChassisGrad)" stroke="url(#robotSapphireGrad)" strokeWidth="1.5" />
                {/* Glossy Curved Visor */}
                <rect x="27" y="19" width="26" height="14" rx="7" fill="url(#robotVisorGrad)" />
                {/* Golden Expressive Glowing Eyes */}
                <circle cx="34" cy="25" r="2.5" fill="url(#goldAccentGrad)" className="animate-pulse" />
                <circle cx="46" cy="25" r="2.5" fill="url(#goldAccentGrad)" className="animate-pulse" />
                {/* Visor HUD waveform smile */}
                <path d="M35 30 Q40 32.5 45 30" stroke="url(#goldAccentGrad)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                {/* Ear Sensor Accents */}
                <rect x="23" y="21" width="3" height="9" rx="1.5" fill="url(#goldAccentGrad)" />
                <rect x="54" y="21" width="3" height="9" rx="1.5" fill="url(#goldAccentGrad)" />

                {/* Left Arm (Handshake reach or walking swing) */}
                {stage === 'handshake' ? (
                  <g>
                    {/* Extended Arm */}
                    <path d="M28 46 L8 58 L-8 56" stroke="url(#robotSapphireGrad)" strokeWidth="6" strokeLinecap="round" />
                    {/* Gold Hydraulic Knuckle Joint */}
                    <circle cx="-8" cy="56" r="3.5" fill="url(#goldAccentGrad)" />
                    {/* Reaching Cybernetic Claws / Hand */}
                    <path d="M-8 56 L-16 54 L-18 57 L-13 60 Z" fill="url(#goldAccentGrad)" className="animate-pulse" />
                  </g>
                ) : (
                  <g style={stage === 'walking' ? { animation: 'legSwingR 0.55s ease-in-out infinite', transformOrigin: '26px 46px' } : undefined}>
                    <rect x="22" y="46" width="6" height="24" rx="3" fill="url(#robotSapphireGrad)" />
                    <circle cx="25" cy="71" r="2.8" fill="url(#goldAccentGrad)" />
                    <rect x="22.5" y="73" width="5" height="16" rx="2.5" fill="#002137" />
                    <circle cx="25" cy="91" r="3" fill="url(#goldAccentGrad)" />
                  </g>
                )}
              </svg>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004B79]" />
                <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-[#004B79] uppercase font-bold">
                  AI ASSISTANT
                </span>
              </div>
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

            {/* Standalone 3D Pop-Up Logo (Without Card Background) */}
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
              className="relative flex items-center justify-center cursor-pointer group select-none mt-4 will-change-transform"
              style={{
                perspective: '1000px',
              }}
            >
              {/* Expanding shockwave burst on click */}
              {logoBurst && (
                <div
                  className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full border-2 border-[#DFB74A] animate-ping pointer-events-none"
                  style={{ animationDuration: '0.8s' }}
                />
              )}

              {/* Ambient radial gold backlight */}
              <div
                className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#DFB74A]/25 via-[#004B79]/15 to-[#DFB74A]/20 blur-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  animation: showSubtitle ? 'logoAuraPulse 4s ease-in-out infinite' : undefined,
                  opacity: isLogoHovered ? 0.95 : 0.6,
                }}
              />

              {/* Standalone Logo Image with 3D Pop-Up & Tilt (NO background box) */}
              <div
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center transition-transform duration-150 ease-out"
                style={{
                  animation: showSubtitle ? 'logoPopIn 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
                  transform: isLogoHovered
                    ? `rotateX(${logoTilt.x}deg) rotateY(${logoTilt.y}deg) scale(1.12) translateZ(30px)`
                    : 'rotateX(0deg) rotateY(0deg) scale(1)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src="/images/mantif_icon.png"
                  alt="MANTIF Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,33,55,0.18)] drop-shadow-[0_4px_12px_rgba(223,183,74,0.3)] transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://mantif.com/images/mantif_icon.png';
                  }}
                />
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
