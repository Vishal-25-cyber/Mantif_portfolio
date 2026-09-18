import React from 'react';
import { ArrowUp, Mail, Globe } from 'lucide-react';
import { setCursorMode } from '../hooks/useCursor';

export const FooterSection: React.FC = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer
      id="contact"
      className="relative w-full bg-[#00111D] overflow-hidden select-none"
    >
      {/* Ambient top-fade gradient from dark section */}
      <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #001A2C, transparent)' }}
      />

      {/* Ghost MANTIF watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="font-serif font-bold text-[22vw] text-[#FAF8F5] select-none"
          style={{ opacity: 0.02, lineHeight: 1 }}>MANTIF</span>
      </div>

      {/* Dot grid art */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #DFB74A 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main footer body */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-28 pb-10">

        {/* ── Top: Huge MANTIF wordmark ── */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="flex-1 max-w-xs h-[1px] bg-[#DFB74A]/25" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-[#475569] uppercase">Est. 2024 · Tamil Nadu, India</span>
            <span className="flex-1 max-w-xs h-[1px] bg-[#DFB74A]/25" />
          </div>

          <h2 className="font-serif font-bold text-[#FAF8F5] tracking-tight leading-none"
            style={{ fontSize: 'clamp(4rem, 14vw, 12rem)' }}>
            M<span className="text-[#DFB74A]">Λ</span>NTIF
          </h2>

          {/* Shimmer line */}
          <div className="w-full max-w-2xl mx-auto h-[2px] my-8 rounded-full overflow-hidden bg-[#004B79]/20">
            <div className="h-full rounded-full animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, #DFB74A, #004B79, transparent)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>

          <p className="font-mono text-sm sm:text-base font-bold tracking-[0.28em] text-[#475569] uppercase">
            Human × Artificial Intelligence
          </p>
          <p className="font-serif italic text-2xl sm:text-3xl text-[#94A3B8] mt-4 font-light">
            "Learning. Building. Evolving."
          </p>
        </div>

        {/* ── Official MANTIF Contact Channels (Card-Free Open Editorial Layout) ── */}
        <div className="relative w-full max-w-6xl mx-auto mb-20">
          {/* Ghost big number backdrop */}
          <div className="absolute -top-10 left-0 pointer-events-none select-none" aria-hidden="true">
            <span className="font-serif font-bold text-[16vw] text-[#FAF8F5] leading-none"
              style={{ opacity: 0.02 }}>06</span>
          </div>

          {/* Top editorial metadata strip */}
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#94A3B8] tracking-[0.25em] uppercase">Chapter 06</span>
              <span className="w-4 h-[1px] bg-white/20" />
              <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">Connect & Inquiries</span>
            </div>
            <span className="font-mono text-[10px] text-[#94A3B8] hidden sm:block">mantif.com/contact</span>
          </div>

          {/* Section Header — editorial split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-[#DFB74A]" />
                <span className="font-mono text-xs font-bold tracking-widest text-[#DFB74A] uppercase">
                  06 / REACH OUR TEAM
                </span>
              </div>

              <h2 className="font-serif font-bold text-[#FAF8F5] tracking-tight"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}>
                Connect with MANTIF.
              </h2>
            </div>

            <div className="border border-[#004B79]/40 rounded-xl p-5 max-w-xs bg-[#002137]/60 backdrop-blur-sm">
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#DFB74A] uppercase mb-2">Verified Channels</div>
              <p className="font-sans text-sm text-[#94A3B8] leading-snug">
                Live tutoring, AI pedagogical tools, and academic partnerships for Classes 6–10.
              </p>
            </div>
          </div>

          {/* Open 3-Column Editorial Grid (No Cards, Pure Architecture) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">

            {/* Column 1: Helplines */}
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#DFB74A] uppercase mb-4 pb-2 border-b border-white/10">
                01 / Helplines (Voice & WhatsApp)
              </span>

              <div className="space-y-4">
                {[
                  { number: '+91 98427 43538', tel: 'tel:+919842743538', wa: 'https://wa.me/919842743538' },
                  { number: '+91 80564 53211', tel: 'tel:+918056453211', wa: 'https://wa.me/918056453211' },
                  { number: '+91 63811 80488', tel: 'tel:+916381180488', wa: 'https://wa.me/916381180488' },
                ].map((h, i) => (
                  <div key={i} className="group flex items-baseline justify-between gap-3 pb-3 border-b border-white/5">
                    <a
                      href={h.tel}
                      className="font-mono text-sm sm:text-base font-medium text-[#FAF8F5] hover:text-[#DFB74A] transition-colors"
                    >
                      {h.number}
                    </a>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <a
                        href={h.tel}
                        className="text-[#93C5FD]/70 hover:text-[#93C5FD] transition-colors"
                      >
                        Call
                      </a>
                      <span className="text-white/20">/</span>
                      <a
                        href={h.wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400/80 hover:text-emerald-300 transition-colors"
                      >
                        WhatsApp ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Direct Correspondence & Domain */}
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#93C5FD] uppercase mb-4 pb-2 border-b border-white/10">
                02 / Correspondence & Web
              </span>

              <div className="space-y-6">
                <div>
                  <span className="block font-mono text-[9px] tracking-wider text-[#94A3B8] uppercase mb-1">
                    Primary Inquiries
                  </span>
                  <a
                    href="mailto:info@mantif.com"
                    className="font-serif text-xl sm:text-2xl text-[#FAF8F5] hover:text-[#DFB74A] transition-colors underline decoration-[#DFB74A]/40 underline-offset-4"
                  >
                    info@mantif.com
                  </a>
                </div>

                <div className="pt-2">
                  <span className="block font-mono text-[9px] tracking-wider text-[#94A3B8] uppercase mb-1">
                    Official Platform
                  </span>
                  <a
                    href="https://mantif.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm sm:text-base text-[#FAF8F5] hover:text-[#DFB74A] transition-colors group"
                  >
                    <span>mantif.com</span>
                    <span className="text-[#DFB74A] group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                  <p className="font-sans text-xs text-[#64748B] mt-1">
                    Human × Artificial Intelligence Tutoring Ecosystem
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Social & Accreditation */}
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#DFB74A] uppercase mb-4 pb-2 border-b border-white/10">
                03 / Community & Verified Channels
              </span>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <a
                    href="https://www.instagram.com/mantif.ai?igsi=NHoxb2J2cWdrNG5q"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 border-b border-white/5 font-mono text-xs text-[#FAF8F5] hover:text-[#DFB74A] transition-colors group"
                  >
                    <span>Instagram</span>
                    <span className="text-[#94A3B8] group-hover:text-white transition-colors">@mantif.ai ↗</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/acuity-learning-hub-871102401/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 border-b border-white/5 font-mono text-xs text-[#FAF8F5] hover:text-[#DFB74A] transition-colors group"
                  >
                    <span>LinkedIn</span>
                    <span className="text-[#94A3B8] group-hover:text-white transition-colors">MANTIF Learning Hub ↗</span>
                  </a>
                </div>

                <div className="pt-2 text-[11px] font-mono text-[#64748B] leading-relaxed">
                  <p>MSME Registered EdTech Startup</p>
                  <p>Tamil Nadu, India</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#004B79]/15 gap-4 text-[10px] font-mono text-[#334155]">
          <div className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFB74A] animate-pulse"/>
            <span>MANTIF · MSME Registered EdTech Startup · Tamil Nadu, India</span>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={scrollToTop}
              onMouseEnter={() => setCursorMode('hover')}
              onMouseLeave={() => setCursorMode('default')}
              className="p-2.5 rounded-full border border-[#004B79]/30 hover:border-[#DFB74A]/50 hover:bg-[#DFB74A]/10 text-[#DFB74A] hover:translate-y-[-2px] transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmerAnim {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmerAnim 3s linear infinite;
        }
      `}</style>
    </footer>
  );
};
