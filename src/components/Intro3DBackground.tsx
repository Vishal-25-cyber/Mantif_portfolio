import React, { useEffect, useRef } from 'react';

export const Intro3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotY = x * 0.45; // Max ~25 deg tilt
      targetRotX = -y * 0.35;
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 3D Nodes (Neural & AI Synaptic Network) ──
    const NODE_COUNT = 48;
    interface Node3D {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      speed: number;
      phase: number;
      radius: number;
      isGold: boolean;
    }

    const nodes: Node3D[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 220 + Math.random() * 320;

      const bx = r * Math.sin(phi) * Math.cos(theta);
      const by = (r * Math.sin(phi) * Math.sin(theta)) * 0.55 - 40; // Flattened ellipsoid
      const bz = r * Math.cos(phi);

      nodes.push({
        x: bx,
        y: by,
        z: bz,
        baseX: bx,
        baseY: by,
        baseZ: bz,
        speed: 0.0006 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2,
        radius: 2 + Math.random() * 2.5,
        isGold: Math.random() > 0.4, // 60% gold, 40% sapphire
      });
    }

    // Traveling impulses along connections
    interface Impulse {
      nodeA: number;
      nodeB: number;
      progress: number;
      speed: number;
    }
    const impulses: Impulse[] = [
      { nodeA: 0, nodeB: 4, progress: 0.1, speed: 0.01 },
      { nodeA: 7, nodeB: 12, progress: 0.4, speed: 0.012 },
      { nodeA: 15, nodeB: 22, progress: 0.7, speed: 0.009 },
      { nodeA: 3, nodeB: 18, progress: 0.2, speed: 0.015 },
    ];

    // 3D Perspective Plane Grid variables
    let gridOffset = 0;
    let time = 0;

    // ── Render Loop ──
    const render = () => {
      time += 0.015;
      gridOffset = (gridOffset + 0.4) % 40;

      // Smooth camera interpolation
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 420;

      // ── Layer 1: 3D Perspective Rolling Ground Matrix ──
      const horizonY = cy + 90;
      const gridW = width * 1.4;
      const gridDepth = 600;
      const stepZ = 35;
      const cols = 22;

      ctx.save();
      ctx.lineWidth = 1;

      // Longitudinal perspective lines
      for (let i = -cols / 2; i <= cols / 2; i++) {
        const xOffset = (i / (cols / 2)) * (gridW / 2);
        
        // Near point (z = 40)
        const nearZ = 45;
        const nearScale = fov / (fov + nearZ);
        const pNearX = cx + (xOffset + currentRotY * 120) * nearScale;
        const pNearY = horizonY + (160 + currentRotX * 80) * nearScale;

        // Far point (horizon)
        const farZ = gridDepth;
        const farScale = fov / (fov + farZ);
        const pFarX = cx + (xOffset * 0.12 + currentRotY * 120) * farScale;
        const pFarY = horizonY;

        const grad = ctx.createLinearGradient(pFarX, pFarY, pNearX, pNearY);
        grad.addColorStop(0, 'rgba(0, 33, 55, 0)');
        grad.addColorStop(0.3, 'rgba(0, 75, 121, 0.04)');
        grad.addColorStop(0.8, 'rgba(223, 183, 74, 0.1)');
        grad.addColorStop(1, 'rgba(223, 183, 74, 0)');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pFarX, pFarY);
        ctx.lineTo(pNearX, pNearY);
        ctx.stroke();
      }

      // Transverse rolling lines (moving forward in 3D)
      for (let z = 50; z < gridDepth; z += stepZ) {
        const dynamicZ = z - gridOffset;
        if (dynamicZ < 20) continue;

        const scale = fov / (fov + dynamicZ);
        const y = horizonY + (170 + currentRotX * 90) * scale;
        const halfWidth = (gridW / 2) * scale;
        const x1 = cx - halfWidth + currentRotY * 60;
        const x2 = cx + halfWidth + currentRotY * 60;

        const alpha = Math.max(0, Math.min(0.12, (1 - dynamicZ / gridDepth) * 0.14));
        ctx.strokeStyle = `rgba(0, 33, 55, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
      ctx.restore();

      // ── Layer 2: 3D Orbiting Perspective Rings (Horizon Gyroscope) ──
      ctx.save();
      const ringAngles = [time * 0.25, -time * 0.18, time * 0.12];
      const ringRadii = [280, 360, 440];

      ringRadii.forEach((radius, idx) => {
        const rot = ringAngles[idx] + currentRotY * 0.5;
        const tilt = 1.15 + currentRotX * 0.4;

        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, radius, radius * Math.cos(tilt), rot, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 
          ? 'rgba(223, 183, 74, 0.07)' 
          : idx === 1 
          ? 'rgba(0, 75, 121, 0.04)' 
          : 'rgba(0, 33, 55, 0.03)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 1 ? [8, 12] : [4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      // ── Layer 3: 3D Constellation Nodes & Neural Synapses ──
      const projectedNodes: { x: number; y: number; z: number; scale: number; alpha: number; isGold: boolean; radius: number }[] = [];

      // Global slow continuous 3D rotation + mouse tilt
      const autoRotY = time * 0.15;
      const totalRotY = autoRotY + currentRotY;
      const totalRotX = currentRotX + Math.sin(time * 0.3) * 0.08;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      nodes.forEach((node) => {
        // Subtle floating oscillation
        const curY = node.baseY + Math.sin(time * 1.5 + node.phase) * 12;

        // Rotate Y
        let x1 = node.baseX * cosY - node.baseZ * sinY;
        let z1 = node.baseX * sinY + node.baseZ * cosY;

        // Rotate X
        let y2 = curY * cosX - z1 * sinX;
        let z2 = curY * sinX + z1 * cosX;

        // Perspective projection
        const depth = z2 + 380;
        if (depth > 20) {
          const scale = fov / (fov + depth);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          const alpha = Math.max(0.08, Math.min(0.85, (depth / 600)));

          projectedNodes.push({
            x: px,
            y: py,
            z: depth,
            scale,
            alpha,
            isGold: node.isGold,
            radius: node.radius * scale,
          });
        }
      });

      // Sort by depth for correct 3D occlusion
      projectedNodes.sort((a, b) => b.z - a.z);

      // Draw 3D connection lines
      ctx.lineWidth = 0.8;
      const maxDist = 135;

      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.28;
            ctx.strokeStyle = p1.isGold || p2.isGold
              ? `rgba(223, 183, 74, ${lineAlpha})`
              : `rgba(0, 75, 121, ${lineAlpha * 0.8})`;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw traveling 3D impulses
      impulses.forEach((imp) => {
        imp.progress += imp.speed;
        if (imp.progress >= 1) {
          imp.progress = 0;
          imp.nodeA = Math.floor(Math.random() * projectedNodes.length);
          imp.nodeB = (imp.nodeA + 1 + Math.floor(Math.random() * 5)) % projectedNodes.length;
        }

        const pA = projectedNodes[imp.nodeA];
        const pB = projectedNodes[imp.nodeB];
        if (pA && pB) {
          const ix = pA.x + (pB.x - pA.x) * imp.progress;
          const iy = pA.y + (pB.y - pA.y) * imp.progress;
          const rad = 2.5 * ((pA.scale + pB.scale) / 2);

          ctx.fillStyle = '#DFB74A';
          ctx.shadowColor = 'rgba(223, 183, 74, 0.8)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(ix, iy, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw 3D nodes
      projectedNodes.forEach((p) => {
        // Node outer glow
        if (p.isGold) {
          ctx.fillStyle = `rgba(223, 183, 74, ${p.alpha * 0.85})`;
          ctx.shadowColor = 'rgba(223, 183, 74, 0.4)';
          ctx.shadowBlur = 6 * p.scale;
        } else {
          ctx.fillStyle = `rgba(0, 75, 121, ${p.alpha * 0.75})`;
          ctx.shadowColor = 'rgba(0, 75, 121, 0.3)';
          ctx.shadowBlur = 4 * p.scale;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Fine center core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Vignette & Radial Spotlight Gradient ──
      // Keeps center stage high-contrast and text 100% legible
      const radial = ctx.createRadialGradient(cx, cy, 60, cx, cy, width * 0.65);
      radial.addColorStop(0, 'rgba(250, 248, 245, 0.05)');
      radial.addColorStop(0.5, 'rgba(250, 248, 245, 0.25)');
      radial.addColorStop(0.85, 'rgba(250, 248, 245, 0.75)');
      radial.addColorStop(1, 'rgba(250, 248, 245, 0.95)');

      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
