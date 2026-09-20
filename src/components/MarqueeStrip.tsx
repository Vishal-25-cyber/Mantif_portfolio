import React from 'react';

interface MarqueeStripProps {
  text?: string;
  dark?: boolean;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

const DEFAULT_ITEMS = [
  'HUMAN × ARTIFICIAL INTELLIGENCE',
  '✦',
  'LEARNING',
  '·',
  'BUILDING',
  '·',
  'EVOLVING',
  '✦',
  'MΛ​NTIF',
  '·',
  'HUMAN × ARTIFICIAL INTELLIGENCE',
  '✦',
];

export const MarqueeStrip: React.FC<MarqueeStripProps> = ({
  dark = false,
  reverse = false,
  className = '',
}) => {
  const items = [...DEFAULT_ITEMS, ...DEFAULT_ITEMS, ...DEFAULT_ITEMS];

  return (
    <div
      className={`relative w-full overflow-hidden py-4 sm:py-5 my-10 sm:my-16 lg:my-20 border-y ${
        dark
          ? 'bg-[#002137] border-[#004B79]/40 text-[#DFB74A]'
          : 'bg-[#EDE7DA] border-[#002137]/10 text-[#002137]'
      } ${className}`}
      aria-hidden="true"
    >
      <div
        className={`flex whitespace-nowrap gap-0 ${
          reverse ? 'animate-marqueeReverse' : 'animate-marquee'
        }`}
        style={{ width: 'max-content' }}
      >
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`inline-block px-6 sm:px-8 font-mono text-xs sm:text-[13px] font-bold tracking-[0.22em] uppercase ${
              item === '✦'
                ? dark
                  ? 'text-[#DFB74A]'
                  : 'text-[#DFB74A]'
                : item === '·'
                ? 'opacity-30'
                : ''
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
