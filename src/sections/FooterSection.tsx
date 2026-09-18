import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  Globe,
  Phone,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

export const FooterSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-[#00111D] overflow-hidden select-none"
    >
      {/* Ambient top-fade gradient from dark section */}
      <div
        className="absolute top-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #001A2C, transparent)' }}
      />

      {/* Ambient glowing radial light orbs behind heading */}
      <div
        className="absolute top-1/4 left-10 w-[500px] h-[350px] rounded-full pointer-events-none blur-3xl transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(223, 183, 74, 0.08) 0%, rgba(0, 75, 121, 0.12) 50%, transparent 75%)',
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Dot grid art */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #DFB74A 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main footer body */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-20 sm:pt-28 pb-10">
        {/* ── Official MANTIF Contact Channels (Card-Free Open Editorial Layout) ── */}
        <div className="relative w-full max-w-6xl mx-auto mb-20">
          {/* Ghost big number backdrop with subtle breathing pulse */}
          <div
            className="absolute -top-10 left-0 pointer-events-none select-none transition-all duration-1000"
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
              opacity: isVisible ? 0.03 : 0,
            }}
            aria-hidden="true"
          >
            <span className="font-serif font-bold text-[16vw] text-[#FAF8F5] leading-none">
              06
            </span>
          </div>

          {/* Top editorial metadata strip with live status beacon */}
          <div
            className="flex items-center justify-between mb-10 pb-4 border-b border-white/10 transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 15px, 0)',
            }}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#94A3B8] tracking-[0.25em] uppercase">
                Chapter 06
              </span>
              <span className="w-4 h-[1px] bg-white/20" />
              <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">
                Connect & Inquiries
              </span>
            </div>

            {/* Live active beacon */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[9px] text-emerald-400/90 tracking-wider uppercase hidden sm:block">
                Helplines Active
              </span>
              <span className="font-mono text-[10px] text-[#94A3B8] hidden md:block ml-3 border-l border-white/10 pl-3">
                mantif.com/contact
              </span>
            </div>
          </div>

          {/* Section Header — editorial split layout with smooth entrance */}
          <div
            className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-14 transition-all duration-800"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
              transitionDelay: '100ms',
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-[#DFB74A] transition-all duration-700" style={{ width: isVisible ? '32px' : '0px' }} />
                <span className="font-mono text-xs font-bold tracking-widest text-[#DFB74A] uppercase">
                  06 / REACH OUR TEAM
                </span>
              </div>

              <h2
                className="font-serif font-bold text-[#FAF8F5] tracking-tight hover:text-[#FAF8F5]/90 transition-colors"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Connect with MANTIF.
              </h2>
            </div>

            {/* Illuminated Verified Channels Card */}
            <div
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="group relative border border-[#004B79]/40 hover:border-[#DFB74A]/60 rounded-2xl p-5 max-w-xs bg-[#002137]/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,75,121,0.3)] overflow-hidden"
            >
              {/* Subtle gold corner ambient glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#DFB74A]/10 rounded-full blur-xl group-hover:bg-[#DFB74A]/20 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[#DFB74A] animate-pulse" />
                  <span className="font-mono text-[9px] tracking-[0.2em] text-[#DFB74A] uppercase font-bold">
                    Verified Channels
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              </div>
              <p className="font-sans text-sm text-[#94A3B8] group-hover:text-[#CBD5E1] leading-snug transition-colors">
                Live tutoring, AI pedagogical tools, and academic partnerships for Classes 6–10.
              </p>
            </div>
          </div>

          {/* Open 3-Column Editorial Grid with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1: Helplines with Animated Row Motion */}
            <div
              className="flex flex-col transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 25px, 0)',
                transitionDelay: '150ms',
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#DFB74A] uppercase">
                  01 / Helplines (Voice & WhatsApp)
                </span>
                <span className="font-mono text-[9px] text-[#64748B]">3 Lines</span>
              </div>

              <div className="space-y-3">
                {[
                  { number: '+91 98427 43538', tel: 'tel:+919842743538', wa: 'https://wa.me/919842743538' },
                  { number: '+91 80564 53211', tel: 'tel:+918056453211', wa: 'https://wa.me/918056453211' },
                  { number: '+91 63811 80488', tel: 'tel:+916381180488', wa: 'https://wa.me/916381180488' },
                ].map((h, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => {
                      setCursorMode('hover');
                      soundManager.playHoverTick();
                    }}
                    onMouseLeave={() => setCursorMode('default')}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-[#DFB74A] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                      <a
                        href={h.tel}
                        className="font-mono text-sm sm:text-base font-semibold text-[#FAF8F5] group-hover:text-[#DFB74A] group-hover:translate-x-1 transition-all duration-300"
                      >
                        {h.number}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider pl-6 sm:pl-0">
                      <a
                        href={h.tel}
                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#004B79] text-[#93C5FD]/90 hover:text-white border border-white/10 hover:border-[#004B79] transition-all duration-200"
                      >
                        Call
                      </a>
                      <a
                        href={h.wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-all duration-200 shadow-2xs"
                      >
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span>WhatsApp</span>
                        <ArrowUpRight className="w-2.5 h-2.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Direct Correspondence & Domain with Glowing Micro-Interactions */}
            <div
              className="flex flex-col transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 25px, 0)',
                transitionDelay: '250ms',
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#93C5FD] uppercase">
                  02 / Correspondence & Web
                </span>
                <span className="font-mono text-[9px] text-[#64748B]">Official</span>
              </div>

              <div className="space-y-6">
                {/* Email Interactive Card */}
                <div
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className="group p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent hover:border-white/10"
                >
                  <span className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-[#94A3B8] uppercase mb-1.5">
                    <Mail className="w-3 h-3 text-[#93C5FD]" />
                    <span>Primary Inquiries</span>
                  </span>
                  <a
                    href="mailto:info@mantif.com"
                    className="relative inline-block font-serif text-xl sm:text-2xl text-[#FAF8F5] group-hover:text-[#DFB74A] transition-colors duration-300"
                  >
                    info@mantif.com
                    {/* Animated gold underline beam */}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#DFB74A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                  </a>
                </div>

                {/* Domain Interactive Card */}
                <div
                  onMouseEnter={() => {
                    setCursorMode('hover');
                    soundManager.playHoverTick();
                  }}
                  onMouseLeave={() => setCursorMode('default')}
                  className="group p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent hover:border-white/10"
                >
                  <span className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-[#94A3B8] uppercase mb-1.5">
                    <Globe className="w-3 h-3 text-[#DFB74A] group-hover:rotate-45 transition-transform duration-500" />
                    <span>Official Platform</span>
                  </span>
                  <a
                    href="https://mantif.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm sm:text-base text-[#FAF8F5] group-hover:text-[#DFB74A] transition-colors group"
                  >
                    <span className="font-semibold">mantif.com</span>
                    <ArrowUpRight className="w-4 h-4 text-[#DFB74A] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </a>
                  <p className="font-sans text-xs text-[#64748B] group-hover:text-[#94A3B8] mt-1 transition-colors leading-relaxed">
                    Human × Artificial Intelligence Tutoring Ecosystem
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Social & Accreditation with Slide Badges */}
            <div
              className="flex flex-col transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 25px, 0)',
                transitionDelay: '350ms',
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#DFB74A] uppercase">
                  03 / Community & Verified Channels
                </span>
                <span className="font-mono text-[9px] text-[#64748B]">Socials</span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  {/* Instagram Link with Icon & Animation */}
                  <a
                    href="https://www.instagram.com/mantif.ai?igsi=NHoxb2J2cWdrNG5q"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => {
                      setCursorMode('hover');
                      soundManager.playHoverTick();
                    }}
                    onMouseLeave={() => setCursorMode('default')}
                    className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-[#002137] border border-white/5 hover:border-[#DFB74A]/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#DFB74A] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      <span className="font-mono text-xs font-medium text-[#FAF8F5] group-hover:text-white transition-colors">
                        Instagram
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#94A3B8] group-hover:text-[#DFB74A] transition-colors">
                      <span>@mantif.ai</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </a>

                  {/* LinkedIn Link with Icon & Animation */}
                  <a
                    href="https://www.linkedin.com/in/acuity-learning-hub-871102401/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => {
                      setCursorMode('hover');
                      soundManager.playHoverTick();
                    }}
                    onMouseLeave={() => setCursorMode('default')}
                    className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-[#002137] border border-white/5 hover:border-[#DFB74A]/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#93C5FD] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                      <span className="font-mono text-xs font-medium text-[#FAF8F5] group-hover:text-white transition-colors">
                        LinkedIn
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#94A3B8] group-hover:text-[#DFB74A] transition-colors">
                      <span>MANTIF Hub</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </a>
                </div>

                {/* MSME Accreditation Card */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] font-mono text-[#64748B] leading-relaxed">
                  <div className="flex items-center gap-2 text-[#DFB74A] font-semibold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
                    <span>MSME Registered Startup</span>
                  </div>
                  <p>Acuity / MANTIF Learning Hub</p>
                  <p className="text-[#94A3B8]">Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar with Animated Back-to-Top Button ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#004B79]/20 gap-4 text-[10px] font-mono text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse" />
            <span>MANTIF · Human × Artificial Intelligence Tutoring Ecosystem · Tamil Nadu, India</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white/30">Back to top</span>
            <button
              onClick={scrollToTop}
              onMouseEnter={() => {
                setCursorMode('hover');
                soundManager.playHoverTick();
              }}
              onMouseLeave={() => setCursorMode('default')}
              className="group p-2.5 rounded-full border border-[#004B79]/40 hover:border-[#DFB74A] bg-[#002137]/40 hover:bg-[#DFB74A]/10 text-[#DFB74A] hover:-translate-y-1 hover:shadow-[0_0_16px_rgba(223,183,74,0.35)] transition-all duration-300"
              aria-label="Back to top"
              title="Return to Chapter 01 Intro"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
