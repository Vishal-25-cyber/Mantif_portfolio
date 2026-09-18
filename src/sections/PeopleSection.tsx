import React, { useState } from 'react';
import { setCursorMode } from '../hooks/useCursor';
import { Quote } from 'lucide-react';

/* ─── Team data from mantif.com ─── */
const TEAM_MEMBERS = [
  {
    id: 'revathi',
    name: 'Dr. A. Revathi',
    role: 'Educational Mentor',
    sub: 'PhD Chemistry',
    group: 'MENTOR',
    groupColor: '#004B79',
    portrait: '/images/mentor_revathi.jpg',
    fallback: 'https://mantif.com/images/mentor_revathi.jpg',
    quote: 'Chemistry is the poetry of the physical world.',
    bio: 'A senior educator with a PhD in Chemistry, Dr. Revathi brings rigorous scientific thinking and warm mentorship to MANTIF\'s tutoring programs for Classes 6–10.',
    fact: 'PhD Chemistry · Senior Educator · Science Specialist',
  },
  {
    id: 'lavanya',
    name: 'V Lavanya',
    role: 'Educational Mentor',
    sub: 'MSc MPhil Maths',
    group: 'MENTOR',
    groupColor: '#004B79',
    portrait: '/images/mentor_lavanya.jpg',
    fallback: 'https://mantif.com/images/mentor_lavanya.jpg',
    quote: 'Mathematics teaches you how to think, not just calculate.',
    bio: 'With an MSc MPhil in Mathematics, V Lavanya transforms abstract equations into intuitive understanding — making every student feel capable of mastering numbers.',
    fact: 'MSc MPhil Maths · Lead Maths Mentor · Board Exam Expert',
  },
  {
    id: 'vishal',
    name: 'Vishal K',
    role: 'Development Team',
    sub: 'Software Developer',
    group: 'DEV TEAM',
    groupColor: '#DFB74A',
    portrait: '/images/team_vishal.jpg',
    fallback: 'https://mantif.com/images/team_vishal.jpg',
    quote: 'Every interface is a stage. Make it worth watching.',
    bio: 'Leads all UI motion design, component architecture, and frontend performance engineering for the MANTIF platform. Turns complex pedagogical flows into beautiful experiences.',
    fact: 'Software Development · React & GSAP · Interactive Systems',
  },
  {
    id: 'solairaj',
    name: 'Solairaj R',
    role: 'Development Team',
    sub: 'Software Developer',
    group: 'DEV TEAM',
    groupColor: '#DFB74A',
    portrait: '/images/team_solairaj.jpg',
    fallback: 'https://mantif.com/images/team_solairaj.jpg',
    quote: 'Reliability is the highest form of engineering elegance.',
    bio: 'Architects cloud microservices, database schemas, and AI inference pipelines that power MANTIF at scale — ensuring zero-cold-start performance and robust security.',
    fact: 'Software Development · Cloud Systems · AI Integration',
  },
];

/* ─── Flip Card ─── */
interface FlipCardProps { member: (typeof TEAM_MEMBERS)[0]; }
const FlipCard: React.FC<FlipCardProps> = ({ member }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      style={{ perspective: '1200px' }}
      className="cursor-pointer select-none"
      onClick={() => setFlipped(f => !f)}
      onMouseEnter={() => setCursorMode('hover')}
      onMouseLeave={() => setCursorMode('default')}
    >
      <div
        className="relative w-full transition-transform duration-700 ease-out"
        style={{
          height: 'clamp(300px, 35vw, 420px)',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <img src={member.portrait} alt={member.name}
            className="w-full h-full object-cover object-[center_10%]"
            onError={(e) => { (e.target as HTMLImageElement).src = member.fallback; }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,17,29,0.88) 0%, rgba(0,17,29,0.10) 55%, transparent 100%)' }} />
          {/* Group pill */}
          <div className="absolute top-4 left-4">
            <span className="font-mono text-[9px] font-bold tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: member.groupColor, color: '#FAF8F5' }}>
              {member.group}
            </span>
          </div>
          {/* Name */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="font-serif font-bold text-[#FAF8F5] leading-tight text-xl sm:text-2xl">{member.name}</div>
            <div className="font-mono text-[10px] font-bold tracking-wider mt-1" style={{ color: '#93C5FD' }}>{member.sub}</div>
            <div className="font-mono text-[8px] text-[#FAF8F5]/35 mt-3 uppercase tracking-wider">Click to view profile</div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #001A2C 0%, #002D47 100%)',
            border: `1px solid ${member.groupColor}50`,
          }}>
          <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
            style={{ background: `linear-gradient(to right, ${member.groupColor}, transparent)` }} />
          <div>
            <span className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase"
              style={{ color: member.groupColor === '#004B79' ? '#93C5FD' : member.groupColor }}>
              {member.group}
            </span>
            <h3 className="font-serif font-bold text-[#FAF8F5] mt-2 leading-tight text-2xl">{member.name}</h3>
            <p className="font-mono text-[10px] font-semibold mt-1"
              style={{ color: member.groupColor === '#004B79' ? '#93C5FD' : member.groupColor }}>{member.sub}</p>
          </div>
          <div className="border-y border-[#004B79]/25 py-4 my-3">
            <p className="font-serif italic text-sm text-[#FAF8F5]/90 leading-snug">"{member.quote}"</p>
          </div>
          <p className="font-sans text-xs text-[#94A3B8] leading-relaxed line-clamp-3 flex-1 mb-3">{member.bio}</p>
          <div className="pt-3 border-t border-[#004B79]/20">
            <div className="font-mono text-[8px] tracking-[0.2em] text-[#475569] uppercase mb-1">Key credentials</div>
            <p className="font-mono text-[10px] font-semibold"
              style={{ color: member.groupColor === '#004B79' ? '#93C5FD' : member.groupColor }}>{member.fact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ─── */
export const PeopleSection: React.FC = () => (
  <section id="people" className="relative w-full bg-[#FAF8F5] pt-24 sm:pt-32 overflow-hidden">
    {/* Ghost big number backdrop */}
    <div className="absolute top-8 left-4 sm:left-10 pointer-events-none select-none" aria-hidden="true">
      <span className="font-serif font-bold text-[18vw] text-[#002137] leading-none"
        style={{ opacity: 0.03 }}>03</span>
    </div>

    {/* Decorative top-right cross lines */}
    <div className="absolute top-8 right-8 sm:right-16 opacity-[0.07] pointer-events-none" aria-hidden="true">
      <div className="w-16 h-[1px] bg-[#002137]" />
      <div className="w-[1px] h-16 bg-[#002137] mt-[-1px] ml-auto" />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 mb-12">
      {/* Top editorial metadata strip */}
      <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#002137]/10">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-[#64748B] tracking-[0.25em] uppercase">Chapter 03</span>
          <span className="w-4 h-[1px] bg-[#002137]/20" />
          <span className="font-mono text-[10px] text-[#DFB74A] font-bold tracking-[0.25em] uppercase">People & Leadership</span>
        </div>
        <span className="font-mono text-[10px] text-[#64748B] hidden sm:block">mantif.com/people</span>
      </div>

      {/* Section Header — editorial split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#DFB74A]" />
            <span className="font-mono text-xs font-bold tracking-widest text-[#004B79] uppercase">
              03 / BUILT BY PEOPLE
            </span>
          </div>

          <h2 className="font-serif font-bold text-[#002137] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
            The Minds Shaping MANTIF.
          </h2>
        </div>

        {/* Callout box */}
        <div className="border border-[#002137]/12 rounded-xl p-5 max-w-xs bg-white/50">
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#64748B] uppercase mb-2">Leadership & Pedagogy</div>
          <p className="font-sans text-sm text-[#002137] leading-snug">
            From classroom mentors with advanced degrees to engineers crafting modern learning systems.
          </p>
        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════════════
        FOUNDER — Luxury Light Editorial Gallery Card
        ══════════════════════════════════════════════ */}
    <div className="relative w-full pb-16 px-4 sm:px-8">
      <div className="relative z-10 max-w-4xl mx-auto">

        {/* The Card: Luxury Light Porcelain & Gold Frame */}
        <div
          className="relative w-full rounded-3xl bg-white border-2 border-[#DFB74A]/35 overflow-hidden transition-all duration-300 hover:border-[#DFB74A]/60"
          style={{
            boxShadow: `
              0 30px 70px -20px rgba(0, 33, 55, 0.10),
              0 0 0 1px rgba(223, 183, 74, 0.15),
              0 1px 3px rgba(0, 0, 0, 0.05)
            `,
          }}
          onMouseEnter={() => setCursorMode('view')}
          onMouseLeave={() => setCursorMode('default')}
        >
          {/* Subtle Ambient Warmth & Watermark */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(223, 183, 74, 0.09) 0%, rgba(0, 75, 121, 0.02) 50%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Faint Architectural Monogram in Background */}
          <div className="absolute right-6 bottom-4 pointer-events-none select-none font-serif font-light text-[120px] text-[#002137]/[0.025] leading-none">
            KS
          </div>

          <div className="flex flex-col md:flex-row items-stretch p-6 sm:p-8 lg:p-10 gap-8 sm:gap-10">

            {/* ── LEFT: Sculptural Arched Portrait Frame ── */}
            <div className="relative w-full md:w-[280px] lg:w-[320px] shrink-0 flex flex-col items-center">
              {/* Arched Photo Frame with Golden Accent Ring */}
              <div className="relative w-full max-w-[280px] md:max-w-none h-[340px] sm:h-[380px] rounded-2xl sm:rounded-t-[120px] sm:rounded-b-2xl overflow-hidden shadow-lg p-1.5 bg-gradient-to-b from-[#DFB74A]/40 via-[#DFB74A]/10 to-[#002137]/10">
                <div className="w-full h-full rounded-xl sm:rounded-t-[114px] sm:rounded-b-xl overflow-hidden bg-[#F0EBE1] relative">
                  <img
                    src="/images/founder_karunya.jpg"
                    alt="Karunya S — Founder of MANTIF"
                    className="w-full h-full object-cover object-[center_15%] transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://mantif.com/images/founder_karunya.jpg';
                    }}
                  />
                  {/* Subtle Light Gradient at Base */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#002137]/30 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Pill: Founder Tag */}
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#002137] text-white shadow-md border border-[#DFB74A]/40 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A]" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-[#FAF8F5] uppercase">
                    FOUNDER & STRATEGIST
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Editorial Bio & Vision ── */}
            <div className="flex-1 flex flex-col justify-between pt-2 sm:pt-0">
              <div>
                {/* Micro Category */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#C49326] uppercase">
                    Architect of MANTIF
                  </span>
                  <span className="text-[#002137]/20">✦</span>
                  <span className="font-mono text-[10px] tracking-wider text-[#004B79]">
                    Est. 2024
                  </span>
                </div>

                {/* Name */}
                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#002137] tracking-tight mb-1">
                  Karunya S
                </h2>

                {/* Role */}
                <p className="font-mono text-xs font-semibold text-[#004B79] tracking-wide mb-5">
                  Founder · Digital Marketing Strategist
                </p>

                {/* Vision Quote Box (Light Editorial Style) */}
                <div className="relative p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFB74A]/30 mb-5">
                  <div className="absolute -top-3 left-6 px-2 bg-white rounded font-serif text-lg text-[#C49326] leading-none">
                    “
                  </div>
                  <p className="font-serif italic text-sm sm:text-[15px] text-[#002137]/90 leading-relaxed">
                    Education is not a passive transfer of notes, but an intimate human conversation — scaled with artificial intelligence.
                  </p>
                  <p className="font-sans text-[11px] text-[#004B79] font-medium mt-2">
                    — The machine illuminates patterns. The human ignites the soul.
                  </p>
                </div>

                {/* Biography Text */}
                <p className="font-sans text-xs sm:text-[13px] text-[#475569] leading-relaxed mb-6">
                  Karunya founded MANTIF to pioneer a new pedagogical standard where educators and AI coexist seamlessly — empowering students with hyper-personalized learning without losing the vital warmth of human mentorship.
                </p>
              </div>

              {/* ── Bottom Key Milestones & Direct Link ── */}
              <div className="pt-4 border-t border-[#002137]/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 sm:gap-8">
                  {[
                    ['200+', 'Students Mentored'],
                    ['5+', 'AI Workshops'],
                    ['MSME', 'Registered Startup'],
                  ].map(([val, label]) => (
                    <div key={label}>
                      <div className="font-serif font-bold text-[#002137] text-lg leading-none">
                        <span className="text-[#C49326]">{val}</span>
                      </div>
                      <div className="font-mono text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="https://mantif.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#002137]/15 hover:border-[#DFB74A] text-[#002137] hover:text-[#004B79] font-mono text-[10px] font-semibold tracking-wider transition-all uppercase shadow-xs hover:shadow-sm"
                >
                  <span>mantif.com</span>
                  <span className="text-[#C49326]">↗</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    {/* ══════════════════════════════════════════════
        TEAM MEMBERS — Flip card grid
        ══════════════════════════════════════════════ */}
    <div className="w-full bg-[#F3EFE6] py-20 sm:py-24 px-5 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">

        {/* Sub-header — Centered */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#DFB74A]" />
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#004B79] uppercase">
              Mentors & Development Team
            </span>
            <span className="w-8 h-[1px] bg-[#DFB74A]" />
          </div>
          <p className="font-mono text-[10px] text-[#94A3B8] mt-2 tracking-wider">
            Click any card to view profile
          </p>
        </div>

        {/* 4 flip cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM_MEMBERS.map((m) => (
            <FlipCard key={m.id} member={m} />
          ))}
        </div>

        {/* Bottom legend — Centered */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-[#002137]/10">
          {[['#004B79', 'Educational Mentor'], ['#DFB74A', 'Development Team']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748B]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>

  </section>
);
