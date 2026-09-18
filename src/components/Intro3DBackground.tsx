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
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotY = x * 0.5; // Up to ~28 deg
      targetRotX = -y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 3D Polyhedra (Floating Architectural Crystals) ──
    interface Polyhedron {
      cx: number;
      cy: number;
      cz: number;
      size: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      isGold: boolean;
    }

    const polyhedra: Polyhedron[] = [
      {
        cx: -320,
        cy: -110,
        cz: 160,
        size: 55,
        rotX: 0.2,
        rotY: 0.5,
        rotZ: 0.1,
        rotSpeedX: 0.008,
        rotSpeedY: 0.012,
        rotSpeedZ: 0.006,
        isGold: true,
      },
      {
        cx: 340,
        cy: -90,
        cz: 210,
        size: 65,
        rotX: 0.8,
        rotY: 0.3,
        rotZ: 0.4,
        rotSpeedX: 0.007,
        rotSpeedY: 0.01,
        rotSpeedZ: 0.005,
        isGold: false,
      },
      {
        cx: 0,
        cy: 160,
        cz: 380,
        size: 45,
        rotX: 0.4,
        rotY: 0.9,
        rotZ: 0.2,
        rotSpeedX: 0.009,
        rotSpeedY: 0.006,
        rotSpeedZ: 0.011,
        isGold: true,
      },
    ];

    // Octahedron base vertices (6 vertices)
    const baseOctaVerts = [
      [0, -1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [0, 0, -1],
      [0, 0, 1],
    ];

    // Octahedron edges (12 edges)
    const octaEdges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];

    // ── 3D Constellation Nodes (Human Synapses × AI Nodes) ──
    const NODE_COUNT = 52;
    interface Node3D {
      baseX: number;
      baseY: number;
      baseZ: number;
      phase: number;
      radius: number;
      isGold: boolean;
    }

    const nodes: Node3D[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 180 + Math.random() * 320;

      const bx = r * Math.sin(phi) * Math.cos(theta);
      const by = (r * Math.sin(phi) * Math.sin(theta)) * 0.65 - 20;
      const bz = r * Math.cos(phi);

      nodes.push({
        baseX: bx,
        baseY: by,
        baseZ: bz,
        phase: Math.random() * Math.PI * 2,
        radius: 2.2 + Math.random() * 2.5,
        isGold: Math.random() > 0.35,
      });
    }

    // Traveling light packets
    interface Impulse {
      nodeA: number;
      nodeB: number;
      progress: number;
      speed: number;
    }
    const impulses: Impulse[] = [
      { nodeA: 2, nodeB: 8, progress: 0.1, speed: 0.014 },
      { nodeA: 11, nodeB: 18, progress: 0.4, speed: 0.016 },
      { nodeA: 24, nodeB: 31, progress: 0.7, speed: 0.012 },
      { nodeA: 5, nodeB: 29, progress: 0.2, speed: 0.018 },
      { nodeA: 36, nodeB: 42, progress: 0.5, speed: 0.015 },
    ];

    let time = 0;
    let gridOffset = 0;

    // ── Main 3D Render Loop ──
    const render = () => {
      time += 0.016;
      gridOffset = (gridOffset + 0.6) % 36;

      // Smooth camera interpolation
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 480;

      // ============================================================
      // LAYER 1: 3D TOPOGRAPHIC UNDULATING WAVE MESH (KINETIC FLOOR)
      // ============================================================
      ctx.save();
      const cols = 26;
      const rows = 18;
      const xSpan = width * 1.5;
      const zNear = 45;
      const zFar = 580;
      const zStep = (zFar - zNear) / rows;
      const xStep = xSpan / cols;

      const horizonY = cy + 110;

      // Calculate 3D projected grid vertices
      const gridPoints: { px: number; py: number; scale: number; alpha: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        gridPoints[r] = [];
        const z = zNear + r * zStep - gridOffset;
        if (z < 10) continue;

        for (let c = 0; c <= cols; c++) {
          const rawX = -xSpan / 2 + c * xStep;

          // 3D Undulating wave height
          const waveHeight =
            Math.sin(rawX * 0.007 + time * 1.4) * 16 +
            Math.cos(z * 0.014 + time * 1.1) * 14 +
            Math.sin(rawX * 0.003 + z * 0.009 + time * 0.7) * 8;

          // Camera rotation
          const rotX_X = rawX * Math.cos(currentRotY) - z * Math.sin(currentRotY);
          const rotX_Z = rawX * Math.sin(currentRotY) + z * Math.cos(currentRotY);
          const rotY_Y = (waveHeight + 70) * Math.cos(currentRotX) - rotX_Z * Math.sin(currentRotX);
          const rotY_Z = (waveHeight + 70) * Math.sin(currentRotX) + rotX_Z * Math.cos(currentRotX);

          const depth = rotY_Z + 120;
          const scale = fov / (fov + depth);
          const px = cx + rotX_X * scale;
          const py = horizonY + rotY_Y * scale;

          const depthFactor = Math.max(0, Math.min(1, 1 - (depth / (zFar + 100))));
          const alpha = depthFactor * 0.42;

          gridPoints[r][c] = { px, py, scale, alpha };
        }
      }

      // Draw longitudinal lines (depth rails)
      for (let c = 0; c <= cols; c += 2) {
        ctx.beginPath();
        let started = false;
        for (let r = 0; r <= rows; r++) {
          const pt = gridPoints[r]?.[c];
          if (!pt) continue;
          if (!started) {
            ctx.moveTo(pt.px, pt.py);
            started = true;
          } else {
            ctx.lineTo(pt.px, pt.py);
          }
        }
        const isCenterAccent = Math.abs(c - cols / 2) <= 3;
        ctx.strokeStyle = isCenterAccent
          ? 'rgba(223, 183, 74, 0.38)'
          : 'rgba(0, 33, 55, 0.22)';
        ctx.lineWidth = isCenterAccent ? 1.4 : 1;
        ctx.stroke();
      }

      // Draw transverse wave lines (horizontal waves)
      for (let r = 0; r <= rows; r += 2) {
        ctx.beginPath();
        let started = false;
        for (let c = 0; c <= cols; c++) {
          const pt = gridPoints[r]?.[c];
          if (!pt) continue;
          if (!started) {
            ctx.moveTo(pt.px, pt.py);
            started = true;
          } else {
            ctx.lineTo(pt.px, pt.py);
          }
        }
        const rowAlpha = Math.max(0.08, Math.min(0.48, (1 - r / rows) * 0.48));
        ctx.strokeStyle = r % 4 === 0
          ? `rgba(223, 183, 74, ${rowAlpha * 1.1})`
          : `rgba(0, 75, 121, ${rowAlpha * 0.85})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Floating wave grid node dots at intersections
      for (let r = 0; r <= rows; r += 3) {
        for (let c = 0; c <= cols; c += 3) {
          const pt = gridPoints[r]?.[c];
          if (!pt) continue;
          ctx.fillStyle = c % 2 === 0 ? '#DFB74A' : '#004B79';
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 1.6 * pt.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // ============================================================
      // LAYER 2: 3D CELESTIAL / ARCHITECTURAL GYROSCOPE RINGS
      // ============================================================
      ctx.save();
      const ringConfig = [
        { radius: 290, rotSpeed: 0.18, tilt: 1.25, isDashed: false, color: 'rgba(223, 183, 74, 0.32)' },
        { radius: 380, rotSpeed: -0.14, tilt: 1.15, isDashed: true, color: 'rgba(0, 75, 121, 0.26)' },
        { radius: 460, rotSpeed: 0.1, tilt: 1.35, isDashed: true, color: 'rgba(0, 33, 55, 0.18)' },
      ];

      ringConfig.forEach((ring) => {
        const rot = time * ring.rotSpeed + currentRotY * 0.6;
        const tilt = ring.tilt + currentRotX * 0.4;

        ctx.beginPath();
        ctx.ellipse(cx, cy - 30, ring.radius, ring.radius * Math.cos(tilt), rot, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        if (ring.isDashed) {
          ctx.setLineDash([8, 12]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      // ============================================================
      // LAYER 3: FLOATING 3D WIREFRAME POLYHEDRA (KNOWLEDGE CRYSTALS)
      // ============================================================
      polyhedra.forEach((poly) => {
        poly.rotX += poly.rotSpeedX;
        poly.rotY += poly.rotSpeedY;
        poly.rotZ += poly.rotSpeedZ;

        const totalRotX = poly.rotX + currentRotX * 0.5;
        const totalRotY = poly.rotY + currentRotY * 0.5;

        // Transform vertices
        const cosX = Math.cos(totalRotX);
        const sinX = Math.sin(totalRotX);
        const cosY = Math.cos(totalRotY);
        const sinY = Math.sin(totalRotY);
        const cosZ = Math.cos(poly.rotZ);
        const sinZ = Math.sin(poly.rotZ);

        const transformedVerts: { px: number; py: number; pz: number }[] = [];

        baseOctaVerts.forEach(([vx, vy, vz]) => {
          // Scale
          let x = vx * poly.size;
          let y = vy * poly.size;
          let z = vz * poly.size;

          // Rotate Z
          let x1 = x * cosZ - y * sinZ;
          let y1 = x * sinZ + y * cosZ;
          let z1 = z;

          // Rotate X
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;

          // Rotate Y
          let x3 = x1 * cosY + z2 * sinY;
          let z3 = -x1 * sinY + z2 * cosY;

          // Translate to poly position + mouse parallax
          const worldX = poly.cx + x3 + currentRotY * 90;
          const worldY = poly.cy + y2 + Math.sin(time * 1.8 + poly.cx) * 12 - currentRotX * 60;
          const worldZ = poly.cz + z3;

          const depth = worldZ + 420;
          const scale = fov / (fov + depth);
          const px = cx + worldX * scale;
          const py = cy + worldY * scale;

          transformedVerts.push({ px, py, pz: depth });
        });

        // Draw edges
        ctx.save();
        ctx.lineWidth = 1.3;
        octaEdges.forEach(([i, j]) => {
          const vA = transformedVerts[i];
          const vB = transformedVerts[j];
          if (!vA || !vB) return;

          ctx.strokeStyle = poly.isGold
            ? 'rgba(223, 183, 74, 0.48)'
            : 'rgba(0, 75, 121, 0.42)';

          ctx.beginPath();
          ctx.moveTo(vA.px, vA.py);
          ctx.lineTo(vB.px, vB.py);
          ctx.stroke();
        });

        // Draw vertex glowing dots
        transformedVerts.forEach((v) => {
          ctx.fillStyle = poly.isGold ? '#DFB74A' : '#004B79';
          ctx.beginPath();
          ctx.arc(v.px, v.py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // ============================================================
      // LAYER 4: 3D CONSTELLATION NODES & SYNAPTIC CONNECTIONS
      // ============================================================
      const projectedNodes: { x: number; y: number; z: number; scale: number; alpha: number; isGold: boolean; radius: number }[] = [];

      const autoRotY = time * 0.14;
      const totalRotY = autoRotY + currentRotY;
      const totalRotX = currentRotX + Math.sin(time * 0.3) * 0.08;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      nodes.forEach((node) => {
        const curY = node.baseY + Math.sin(time * 1.6 + node.phase) * 14;

        let x1 = node.baseX * cosY - node.baseZ * sinY;
        let z1 = node.baseX * sinY + node.baseZ * cosY;

        let y2 = curY * cosX - z1 * sinX;
        let z2 = curY * sinX + z1 * cosX;

        const depth = z2 + 420;
        if (depth > 20) {
          const scale = fov / (fov + depth);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          const alpha = Math.max(0.25, Math.min(0.9, (depth / 550)));

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

      // Sort by depth
      projectedNodes.sort((a, b) => b.z - a.z);

      // Draw connection lines with high visibility
      ctx.lineWidth = 1;
      const maxDist = 145;

      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.55;
            ctx.strokeStyle = p1.isGold || p2.isGold
              ? `rgba(223, 183, 74, ${lineAlpha})`
              : `rgba(0, 75, 121, ${lineAlpha * 0.9})`;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Traveling energetic impulses
      impulses.forEach((imp) => {
        imp.progress += imp.speed;
        if (imp.progress >= 1) {
          imp.progress = 0;
          imp.nodeA = Math.floor(Math.random() * projectedNodes.length);
          imp.nodeB = (imp.nodeA + 1 + Math.floor(Math.random() * 6)) % projectedNodes.length;
        }

        const pA = projectedNodes[imp.nodeA];
        const pB = projectedNodes[imp.nodeB];
        if (pA && pB) {
          const ix = pA.x + (pB.x - pA.x) * imp.progress;
          const iy = pA.y + (pB.y - pA.y) * imp.progress;
          const rad = 3.2 * ((pA.scale + pB.scale) / 2);

          ctx.fillStyle = '#DFB74A';
          ctx.shadowColor = 'rgba(223, 183, 74, 0.9)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ix, iy, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw constellation nodes
      projectedNodes.forEach((p) => {
        if (p.isGold) {
          ctx.fillStyle = `rgba(223, 183, 74, ${p.alpha})`;
          ctx.shadowColor = 'rgba(223, 183, 74, 0.6)';
          ctx.shadowBlur = 8 * p.scale;
        } else {
          ctx.fillStyle = `rgba(0, 75, 121, ${p.alpha})`;
          ctx.shadowColor = 'rgba(0, 75, 121, 0.4)';
          ctx.shadowBlur = 6 * p.scale;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, p.radius * 1.2), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shiny center core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });

      // Soft vignette around edges to blend with light theme
      const vignette = ctx.createRadialGradient(cx, cy, 140, cx, cy, width * 0.75);
      vignette.addColorStop(0, 'rgba(250, 248, 245, 0)');
      vignette.addColorStop(0.65, 'rgba(250, 248, 245, 0.08)');
      vignette.addColorStop(0.92, 'rgba(250, 248, 245, 0.55)');
      vignette.addColorStop(1, 'rgba(250, 248, 245, 0.85)');

      ctx.fillStyle = vignette;
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
