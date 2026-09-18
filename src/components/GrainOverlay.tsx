import React, { useEffect, useRef } from 'react';

/**
 * Full-screen animated film grain overlay.
 * Uses Canvas API for high-performance per-frame noise.
 * GPU-composited via mix-blend-mode: overlay.
 */
export const GrainOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const drawGrain = () => {
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 18; // very low alpha — subtle grain
      }
      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(drawGrain);
    };

    rafRef.current = requestAnimationFrame(drawGrain);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9990] pointer-events-none"
      style={{
        mixBlendMode: 'overlay',
        opacity: 0.55,
      }}
      aria-hidden="true"
    />
  );
};
