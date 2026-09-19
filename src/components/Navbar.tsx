import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { setCursorMode } from '../hooks/useCursor';

interface NavbarProps {
  hidden?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hidden = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Auto-hide when scrolling down past 150px, show when scrolling up or at top
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY && !mobileMenuOpen) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Identify active section
      const sections = ['intro', 'services', 'people', 'journey', 'philosophy'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    try {
      sessionStorage.setItem('mantif_last_active_section', id);
      if (window.location.hash !== '#' + id) {
        history.replaceState(null, '', '#' + id);
      }
    } catch {
      // ignore
    }
    const element = document.getElementById(id);
    if (element) {
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(element, { duration: 0.6 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { id: 'intro', num: '01', title: 'Intro' },
    { id: 'services', num: '02', title: 'What We Do' },
    { id: 'people', num: '03', title: 'People' },
    { id: 'journey', num: '04', title: 'Journey' },
    { id: 'philosophy', num: '05', title: 'Philosophy' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out will-change-transform ${
          !hidden && isVisible && !mobileMenuOpen
            ? 'translate-y-0 opacity-100 visible'
            : '-translate-y-full opacity-0 pointer-events-none invisible'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">


          {/* Logo — top left */}
          <button
            onClick={() => scrollToSection('intro')}
            className="flex items-center gap-3 group text-left transition-opacity hover:opacity-80 focus:outline-none shrink-0"
            aria-label="MANTIF Home"
          >
            <div className="w-8 h-8 rounded-full border border-[#002137]/20 flex items-center justify-center bg-[#FAF8F5]/80 backdrop-blur-sm group-hover:border-[#004B79] transition-colors">
              <picture>
                <source srcSet="/images/mantif_icon.webp" type="image/webp" />
                <img
                  src="/images/mantif_icon.png"
                  alt="MANTIF"
                  loading="eager"
                  decoding="async"
                  className="w-5 h-5 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://mantif.com/images/mantif_icon.png'; }}
                />
              </picture>
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-widest text-base font-bold text-[#002137]">
                M<span className="text-[#DFB74A]">Λ</span>NTIF
              </span>
              <span className="font-mono text-[8px] tracking-wider text-[#64748B] uppercase hidden sm:inline">
                HUMAN × AI
              </span>
            </div>
          </button>


          <nav className="hidden md:flex items-center gap-1 bg-[#FAF8F5]/70 backdrop-blur-md px-5 py-2 rounded-full border border-[#002137]/10 shadow-sm">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className={`px-3.5 py-1 text-xs font-mono tracking-wide rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#002137] text-[#FAF8F5] font-semibold shadow-xs'
                      : 'text-[#002137]/70 hover:text-[#002137] hover:bg-[#002137]/5'
                  }`}
                >
                  {item.num} {item.title}
                </button>
              );
            })}
          </nav>

          {/* Actions on Right (Sound Toggle + Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Ambience Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all backdrop-blur-sm ${
                !isMuted
                  ? 'bg-[#004B79] text-[#FAF8F5] border-[#004B79] shadow-md shadow-[#004B79]/30'
                  : 'bg-[#FAF8F5]/80 text-[#002137]/70 border-[#002137]/15 hover:border-[#002137]/40 hover:text-[#002137]'
              }`}
              title={!isMuted ? 'Sound active (Click to mute)' : 'Click to enable audio'}
              aria-label="Toggle Sound"
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#DFB74A]" />
                  <span className="text-[10px] hidden sm:inline font-bold tracking-wider">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">AUDIO OFF</span>
                </>
              )}
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#002137]/15 bg-[#FAF8F5]/80 backdrop-blur-sm hover:border-[#002137]/40 text-[#002137] text-xs font-mono font-medium transition-all"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="text-[11px] hidden sm:inline">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile / Flyout Menu Overlay (z-[60] clean takeover, navbar hidden) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#FAF8F5] flex flex-col justify-between p-6 sm:p-12 md:p-16 animate-fadeIn overflow-y-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={() => scrollToSection('intro')}
              className="flex items-center gap-3 group text-left focus:outline-none"
              aria-label="MANTIF Home"
            >
              <div className="w-8 h-8 rounded-full border border-[#002137]/20 flex items-center justify-center bg-[#FAF8F5] group-hover:border-[#004B79] transition-colors">
                <picture>
                  <source srcSet="/images/mantif_icon.webp" type="image/webp" />
                  <img
                    src="/images/mantif_icon.png"
                    alt="MANTIF"
                    loading="eager"
                    decoding="async"
                    className="w-5 h-5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://mantif.com/images/mantif_icon.png'; }}
                  />
                </picture>
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-base font-bold text-[#002137]">
                  M<span className="text-[#DFB74A]">Λ</span>NTIF
                </span>
                <span className="font-mono text-[8px] tracking-wider text-[#64748B] uppercase hidden sm:inline">
                  HUMAN × AI
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Audio Ambience Synthesizer Toggle */}
              <button
                onClick={toggleSound}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
                  !isMuted
                    ? 'bg-[#004B79] text-[#FAF8F5] border-[#004B79] shadow-md shadow-[#004B79]/30'
                    : 'bg-[#FAF8F5] text-[#002137]/70 border-[#002137]/15 hover:border-[#002137]/40 hover:text-[#002137]'
                }`}
                title={!isMuted ? 'Sound active (Click to mute)' : 'Click to enable audio'}
                aria-label="Toggle Sound"
              >
                {!isMuted ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#DFB74A]" />
                    <span className="text-[10px] hidden sm:inline font-bold tracking-wider">AUDIO ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">AUDIO OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={() => setCursorMode('hover')}
                onMouseLeave={() => setCursorMode('default')}
                className="w-9 h-9 rounded-full border border-[#002137]/20 flex items-center justify-center text-[#002137] hover:bg-[#002137]/5 transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-6 my-auto py-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                onMouseEnter={() => {
                  setCursorMode('hover');
                  soundManager.playHoverTick();
                }}
                onMouseLeave={() => setCursorMode('default')}
                className="group flex items-baseline justify-between text-left border-b border-[#002137]/10 pb-4 transition-colors"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="font-mono text-xs sm:text-sm text-[#DFB74A] font-bold">{item.num}</span>
                  <span className="font-serif text-3xl sm:text-5xl text-[#002137] group-hover:text-[#004B79] transition-colors">
                    {item.title}
                  </span>
                </div>
                <ArrowUpRight className="w-6 h-6 text-[#64748B] group-hover:text-[#004B79] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-mono text-[#64748B] gap-4 pt-6 border-t border-[#002137]/10">
            <span>HUMAN × ARTIFICIAL INTELLIGENCE</span>
            <div className="flex gap-4">
              <a href="mailto:info@mantif.com" className="hover:text-[#002137] transition-colors">
                info@mantif.com
              </a>
              <a href="https://mantif.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#002137] transition-colors">
                mantif.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
