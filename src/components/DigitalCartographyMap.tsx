import React from 'react';

interface DigitalCartographyMapProps {
  sceneIndex: number; // 1: Erode, 2: Tamil Nadu, 3: India, 4+: fade out
}

export const DigitalCartographyMap: React.FC<DigitalCartographyMapProps> = ({ sceneIndex }) => {
  // SVG Coordinate space: 800 x 900
  // Erode coordinate: x: 281, y: 758

  // Calculate transform for smooth cinematic camera zoom
  const getCameraTransform = () => {
    switch (sceneIndex) {
      case 1:
        // Extreme close-up on Erode (origin)
        // Center around (281, 758)
        return {
          transform: 'scale(7.5) translate(-281px, -758px)',
          opacity: 1,
        };
      case 2:
        // Zoom out to Tamil Nadu
        // Center around (290, 770)
        return {
          transform: 'scale(3.0) translate(-290px, -770px)',
          opacity: 1,
        };
      case 3:
        // Full India reveal
        // Center around (360, 480)
        return {
          transform: 'scale(1.0) translate(-360px, -480px)',
          opacity: 1,
        };
      default:
        // Transitioning to 3D Globe in Scene 4+
        return {
          transform: 'scale(0.85) translate(-360px, -480px)',
          opacity: 0,
        };
    }
  };

  const camera = getCameraTransform();

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none transition-opacity duration-1000 ease-out"
      style={{ opacity: camera.opacity }}
      aria-hidden="true"
    >
      {/* Tactical Cartography Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Coordinate & Telemetry Watermark */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-[#38BDF8]/40 tracking-widest uppercase hidden sm:block">
        GRID LAT 11.3410° N / LON 77.7172° E · SECTOR TN-IND-01
      </div>

      <div
        className="relative w-[800px] h-[900px] transition-transform duration-1000 ease-in-out will-change-transform"
        style={{
          transformOrigin: 'center center',
          transform: camera.transform,
        }}
      >
        <svg
          viewBox="0 0 800 900"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Golden radial beacon glow */}
            <radialGradient id="erodeBeaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DFB74A" stopOpacity="1" />
              <stop offset="40%" stopColor="#DFB74A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#DFB74A" stopOpacity="0" />
            </radialGradient>

            {/* Cyan radial glow for national hubs */}
            <radialGradient id="hubCyanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
              <stop offset="60%" stopColor="#004B79" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00111D" stopOpacity="0" />
            </radialGradient>

            {/* Tamil Nadu regional glow */}
            <linearGradient id="tamilNaduGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={sceneIndex >= 2 ? 0.25 : 0.08} />
              <stop offset="100%" stopColor="#DFB74A" stopOpacity={sceneIndex >= 2 ? 0.18 : 0.04} />
            </linearGradient>

            {/* Animated dashed line filter */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 1. INDIA SUB-CONTINENT LANDMASS OUTLINE                   */}
          {/* ───────────────────────────────────────────────────────── */}
          <path
            d="
              M 240,60
              L 280,75 L 320,130 L 300,180 L 260,210
              L 220,230 L 160,300 L 110,380 L 85,420
              L 125,470 L 155,520 L 175,580 L 195,660
              L 230,760 L 255,815 L 281,850
              L 330,810 L 350,760 L 355,710 L 330,670
              L 365,630 L 410,575 L 465,510 L 530,460
              L 580,410 L 630,340 L 710,280 L 740,310
              L 660,380 L 620,440 L 540,480 L 490,420
              L 440,350 L 360,260 L 300,200 Z
            "
            fill="#01182B"
            stroke={sceneIndex >= 3 ? '#38BDF8' : '#004B79'}
            strokeWidth={sceneIndex >= 3 ? '1.8' : '1.0'}
            strokeOpacity={sceneIndex >= 3 ? '0.85' : '0.4'}
            className="transition-all duration-700"
          />

          {/* Subtle internal territorial graticule lines */}
          <path
            d="M 125,470 Q 280,490 530,460 M 175,580 Q 300,600 410,575 M 240,60 L 281,850"
            fill="none"
            stroke="#004B79"
            strokeWidth="0.75"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
          />

          {/* ───────────────────────────────────────────────────────── */}
          {/* 2. TAMIL NADU TERRITORY HIGHLIGHT                         */}
          {/* ───────────────────────────────────────────────────────── */}
          <path
            d="
              M 281,850
              L 255,815
              L 235,765
              L 260,735
              L 295,720
              L 330,700
              L 355,710
              L 350,760
              L 330,810
              Z
            "
            fill="url(#tamilNaduGrad)"
            stroke={sceneIndex >= 2 ? '#DFB74A' : '#38BDF8'}
            strokeWidth={sceneIndex >= 2 ? '2' : '1'}
            strokeOpacity={sceneIndex >= 2 ? '0.9' : '0.5'}
            filter={sceneIndex >= 2 ? 'url(#glowFilter)' : undefined}
            className="transition-all duration-700"
          />

          {/* ───────────────────────────────────────────────────────── */}
          {/* 3. CONNECTION FILAMENTS (ERODE -> TAMIL NADU -> INDIA)    */}
          {/* ───────────────────────────────────────────────────────── */}
          {sceneIndex >= 2 && (
            <g className="transition-opacity duration-700">
              {/* Erode -> Coimbatore */}
              <line
                x1="281"
                y1="758"
                x2="252"
                y2="770"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                strokeOpacity="0.75"
              />
              {/* Erode -> Chennai */}
              <line
                x1="281"
                y1="758"
                x2="355"
                y2="710"
                stroke="#DFB74A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.8"
              />
              {/* Erode -> Madurai */}
              <line
                x1="281"
                y1="758"
                x2="290"
                y2="805"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                strokeOpacity="0.75"
              />
            </g>
          )}

          {/* Scene 3: National Expansion Filaments */}
          {sceneIndex >= 3 && (
            <g className="transition-opacity duration-700">
              {/* Erode -> Bengaluru */}
              <line
                x1="281"
                y1="758"
                x2="278"
                y2="712"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeOpacity="0.85"
              />
              {/* Bengaluru -> Hyderabad */}
              <line
                x1="278"
                y1="712"
                x2="299"
                y2="591"
                stroke="#38BDF8"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />
              {/* Bengaluru -> Mumbai */}
              <line
                x1="278"
                y1="712"
                x2="166"
                y2="544"
                stroke="#38BDF8"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />
              {/* Hyderabad -> Delhi */}
              <line
                x1="299"
                y1="591"
                x2="268"
                y2="281"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeOpacity="0.85"
              />
              {/* Hyderabad -> Kolkata */}
              <line
                x1="299"
                y1="591"
                x2="533"
                y2="448"
                stroke="#38BDF8"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />

              {/* National Hub Nodes */}
              {[
                { name: 'Bengaluru', x: 278, y: 712 },
                { name: 'Mumbai', x: 166, y: 544 },
                { name: 'Hyderabad', x: 299, y: 591 },
                { name: 'Kolkata', x: 533, y: 448 },
                { name: 'New Delhi', x: 268, y: 281 },
              ].map((hub, idx) => (
                <g key={idx}>
                  <circle cx={hub.x} cy={hub.y} r="8" fill="url(#hubCyanGlow)" />
                  <circle cx={hub.x} cy={hub.y} r="3" fill="#38BDF8" />
                  <text
                    x={hub.x + 8}
                    y={hub.y + 3}
                    fill="#FAF8F5"
                    fontSize="9"
                    fontFamily="monospace"
                    opacity="0.85"
                  >
                    {hub.name}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 4. ERODE GOLDEN ORIGIN PIN & RADAR CONCENTRICS            */}
          {/* ───────────────────────────────────────────────────────── */}
          <g>
            {/* Animated outer radar waves */}
            <circle
              cx="281"
              cy="758"
              r="24"
              fill="none"
              stroke="#DFB74A"
              strokeWidth="0.8"
              strokeOpacity="0.4"
              className="animate-ping"
              style={{ transformOrigin: '281px 758px', animationDuration: '2.5s' }}
            />
            <circle
              cx="281"
              cy="758"
              r="14"
              fill="none"
              stroke="#DFB74A"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            {/* Radiant golden halo */}
            <circle cx="281" cy="758" r="8" fill="url(#erodeBeaconGlow)" />
            {/* Central white-hot dot */}
            <circle cx="281" cy="758" r="3.5" fill="#FFFFFF" />

            {/* Pin Callout Marker */}
            <line
              x1="281"
              y1="758"
              x2="281"
              y2="738"
              stroke="#DFB74A"
              strokeWidth="1.5"
            />
            <line
              x1="281"
              y1="738"
              x2="310"
              y2="738"
              stroke="#DFB74A"
              strokeWidth="1.5"
            />
            <circle cx="310" cy="738" r="2" fill="#DFB74A" />

            {/* Label in close-up or regional view */}
            <text
              x="315"
              y="741"
              fill="#DFB74A"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.1em"
            >
              ERODE · 11.34°N
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
