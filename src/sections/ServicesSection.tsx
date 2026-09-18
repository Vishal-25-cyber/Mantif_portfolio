import React from 'react';
import { siteContent } from '../data/content';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesSection: React.FC = () => {
  const { services } = siteContent;

  return (
    <section
      id="services"
      className="relative w-full min-h-screen bg-[#FAF8F5] py-24 sm:py-32 px-4 sm:px-8 overflow-hidden"
    >
      {/* Ghost big number backdrop */}
      <div className="absolute top-8 left-4 sm:left-10 pointer-events-none select-none" aria-hidden="true">
        <span className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
          style={{ opacity: 0.03 }}>02</span>
      </div>

      {/* Decorative top-right cross lines */}
      <div className="absolute top-8 right-8 sm:right-16 opacity-[0.07] pointer-events-none" aria-hidden="true">
        <div className="w-16 h-[1px] bg-[#002137]" />
        <div className="w-[1px] h-16 bg-[#002137] mt-[-1px] ml-auto" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top editorial metadata strip */}
        <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#002137]/10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#64748B] tracking-[0.25em] uppercase">Chapter 02</span>
            <span className="w-4 h-[1px] bg-[#002137]/20" />
            <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">Services & Offerings</span>
          </div>
          <span className="font-mono text-[10px] text-[#64748B] hidden sm:block">mantif.com/services</span>
        </div>

        {/* Section Header — editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#DFB74A]" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#004B79] uppercase">
                {services.eyebrow}
              </span>
            </div>

            <h2 className="font-serif font-bold text-[#002137] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
              {services.heading}
            </h2>
          </div>

          {/* Callout box */}
          <div className="border border-[#002137]/12 rounded-xl p-5 max-w-xs bg-white/50">
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase mb-2">MSME Registered</div>
            <p className="font-sans text-sm text-[#002137] leading-snug">{services.subheading}</p>
            <a href="https://mantif.com" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-[10px] text-[#004B79] hover:text-[#DFB74A] transition-colors underline underline-offset-2">
              mantif.com →
            </a>
          </div>
        </div>

        {/* 3 Physical Illuminated Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.cards.map((card) => (
            <ServiceCard key={card.id} card={card} />
          ))}
        </div>

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
            className="hover:text-[#004B79] text-[#002137] font-semibold transition-colors"
          >
            mantif.com ↗
          </a>
        </div>
      </div>
    </section>
  );
};
