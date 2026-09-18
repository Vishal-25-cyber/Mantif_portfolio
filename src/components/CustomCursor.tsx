import React, { useEffect, useRef, useState } from 'react';
import { useCursorMode } from '../hooks/useCursor';

export const CustomCursor: React.FC = () => {
  const { mode } = useCursorMode();
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Two separate tracked positions: dot = exact, trail = lagging
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const trail = useRef({ x: -200, y: -200 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }
    document.body.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      setIsVisible(true);
    };
    const onLeave  = () => setIsVisible(false);
    const onEnter  = () => setIsVisible(true);
    const onDown   = () => setIsClicking(true);
    const onUp     = () => setIsClicking(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let raf: number;
    const tick = () => {
      // Snappy, ultra-fluid tracking (lerp factor 0.28: eliminates lag while preserving silky motion)
      trail.current.x += (mouse.current.x - trail.current.x) * 0.28;
      trail.current.y += (mouse.current.y - trail.current.y) * 0.28;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform =
          `translate3d(${trail.current.x}px, ${trail.current.y}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform =
          `translate3d(${trail.current.x}px, ${trail.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (isTouch) return null;

  const isHoverState = mode === 'hover' || mode === 'view' || mode === 'explore';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      aria-hidden="true"
    >
      {/* ── CORE DOT: sharp, instant, gold ── */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 will-change-transform pointer-events-none"
        style={{
          width: isClicking ? '6px' : isHoverState ? '5px' : '5px',
          height: isClicking ? '6px' : isHoverState ? '5px' : '5px',
          marginLeft: '-2.5px',
          marginTop: '-2.5px',
          borderRadius: '50%',
          background: mode === 'hover'   ? '#DFB74A'
                    : mode === 'view'    ? '#FAF8F5'
                    : mode === 'explore' ? '#DFB74A'
                    : '#002137',
          transition: 'background 0.2s ease, transform 0.1s ease',
          transform: isClicking ? 'scale(0.5)' : 'scale(1)',
          boxShadow: isHoverState ? `0 0 8px ${mode === 'hover' ? '#DFB74A' : '#004B79'}` : 'none',
        }}
      />

      {/* ── TRAILING RING: soft lag, morphs by state ── */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 will-change-transform pointer-events-none"
        style={{
          // Sizes
          width:  mode === 'default' ? '36px'
                : mode === 'hover'   ? '48px'
                : mode === 'view'    ? '64px'
                : '72px',
          height: mode === 'default' ? '36px'
                : mode === 'hover'   ? '48px'
                : mode === 'view'    ? '64px'
                : '72px',
          marginLeft: mode === 'default' ? '-18px'
                    : mode === 'hover'   ? '-24px'
                    : mode === 'view'    ? '-32px'
                    : '-36px',
          marginTop:  mode === 'default' ? '-18px'
                    : mode === 'hover'   ? '-24px'
                    : mode === 'view'    ? '-32px'
                    : '-36px',
          borderRadius: '50%',
          transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1), margin 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease, background 0.25s ease',

          // Default: thin teal ring
          ...(mode === 'default' && {
            border: '1.5px solid rgba(0,75,121,0.45)',
            background: 'transparent',
            transform: isClicking ? 'scale(0.85)' : 'scale(1)',
          }),

          // Hover: gold filled ring + glow
          ...(mode === 'hover' && {
            border: '2px solid #DFB74A',
            background: 'rgba(223,183,74,0.08)',
            boxShadow: '0 0 16px rgba(223,183,74,0.25)',
            transform: isClicking ? 'scale(0.88)' : 'scale(1)',
          }),

          // View: dark filled badge (no border)
          ...(mode === 'view' && {
            border: 'none',
            background: '#002137',
            boxShadow: '0 4px 20px rgba(0,33,55,0.3)',
            transform: isClicking ? 'scale(0.92)' : 'scale(1)',
          }),

          // Explore: teal badge
          ...(mode === 'explore' && {
            border: '1.5px solid rgba(223,183,74,0.4)',
            background: '#004B79',
            boxShadow: '0 4px 24px rgba(0,75,121,0.4)',
            transform: isClicking ? 'scale(0.92)' : 'scale(1)',
          }),
        }}
      />

      {/* ── LABEL OVERLAY: for view + explore states ── */}
      {(mode === 'view' || mode === 'explore') && (
        <div
          ref={labelRef}
          className="fixed top-0 left-0 will-change-transform pointer-events-none flex items-center justify-center"
          style={{
            width: mode === 'view' ? '64px' : '72px',
            height: mode === 'view' ? '64px' : '72px',
            marginLeft: mode === 'view' ? '-32px' : '-36px',
            marginTop:  mode === 'view' ? '-32px' : '-36px',
          }}
        >
          <span
            className="font-mono font-bold uppercase tracking-widest text-[#FAF8F5]"
            style={{ fontSize: '8px', letterSpacing: '0.18em' }}
          >
            {mode === 'view' ? 'VIEW' : 'OPEN'}
          </span>
        </div>
      )}
    </div>
  );
};
