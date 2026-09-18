import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates a soft, circular luminous glow sprite texture
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 230, 160, 0.95)');
    gradient.addColorStop(0.5, 'rgba(223, 183, 74, 0.45)');
    gradient.addColorStop(0.8, 'rgba(0, 75, 121, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, clickRipple: 0 });

  // Strictly ONLY show once the intro animation is completed
  const isIntroComplete = stage === 'completed';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Perspective Setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 42);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const glowTexture = createGlowTexture();

    // ─────────────────────────────────────────────────────────────
    // 1. DYNAMIC 3D NEURAL WAVE TERRAIN (Grid of glowing points)
    // ─────────────────────────────────────────────────────────────
    const waveCols = 60;
    const waveRows = 60;
    const waveCount = waveCols * waveRows;
    const waveGeometry = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveCount * 3);
    const waveColors = new Float32Array(waveCount * 3);

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');
    const cChampagne = new THREE.Color('#F5E0B8');

    const waveSpacing = 0.95;
    const xOffset = ((waveCols - 1) * waveSpacing) / 2;
    const zOffset = ((waveRows - 1) * waveSpacing) / 2;

    for (let i = 0; i < waveCols; i++) {
      for (let j = 0; j < waveRows; j++) {
        const idx = (i * waveRows + j) * 3;
        wavePositions[idx] = i * waveSpacing - xOffset;
        wavePositions[idx + 1] = 0; // calculated in render loop
        wavePositions[idx + 2] = j * waveSpacing - zOffset;

        // Radial color mix: golden center fading to celestial sapphire edges
        const distFromCenter = Math.sqrt(
          Math.pow((i - waveCols / 2) / (waveCols / 2), 2) +
          Math.pow((j - waveRows / 2) / (waveRows / 2), 2)
        );
        const col = new THREE.Color();
        if (distFromCenter < 0.45) {
          col.lerpColors(cGold, cChampagne, distFromCenter / 0.45);
        } else {
          col.lerpColors(cGold, cSapphire, Math.min(1, (distFromCenter - 0.45) / 0.55));
        }

        waveColors[idx] = col.r;
        waveColors[idx + 1] = col.g;
        waveColors[idx + 2] = col.b;
      }
    }

    waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.52,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const waveMesh = new THREE.Points(waveGeometry, waveMaterial);
    // Position terrain tilted in dramatic 3D perspective below & into the depth
    waveMesh.rotation.x = -Math.PI / 2.7;
    waveMesh.position.set(0, -9.5, -4);
    scene.add(waveMesh);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL SACRED ARMILLARY RINGS (3D Tourbillon Kinematics)
    // ─────────────────────────────────────────────────────────────
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);
    ringsGroup.position.set(0, 0.5, -6);

    // Outer Armillary Ring (Fine Gold Torus)
    const ring1Geo = new THREE.TorusGeometry(17.5, 0.045, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.45,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = 1.15;
    ring1Mesh.rotation.y = 0.35;
    ringsGroup.add(ring1Mesh);

    // Mid Armillary Ring (Sapphire & Gold Harmonic)
    const ring2Geo = new THREE.TorusGeometry(14.0, 0.038, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.38,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -0.75;
    ring2Mesh.rotation.y = 0.85;
    ringsGroup.add(ring2Mesh);

    // Inner Armillary Ring (Fine Golden Compass Ring)
    const ring3Geo = new THREE.TorusGeometry(10.8, 0.032, 16, 90);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xF5E0B8,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.32,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.x = 0.5;
    ring3Mesh.rotation.z = 0.65;
    ringsGroup.add(ring3Mesh);

    // Orbiting Satellite Gem Beads along the outer rings
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    const satGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const satMatGold = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const satMatSapphire = new THREE.MeshStandardMaterial({
      color: 0x0088CC,
      emissive: 0x004B79,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.1,
    });

    for (let i = 0; i < 6; i++) {
      const parent = i % 2 === 0 ? ring1Mesh : ring2Mesh;
      const radius = i % 2 === 0 ? 17.5 : 14.0;
      const mesh = new THREE.Mesh(satGeo, i % 2 === 0 ? satMatGold : satMatSapphire);
      parent.add(mesh);
      satellites.push({
        mesh,
        radius,
        speed: (0.4 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 6) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. 3D CONSTELLATION NODES & DYNAMIC SYNAPTIC FILAMENTS
    // ─────────────────────────────────────────────────────────────
    const nodeCount = 42;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      // Distribute nodes around the edges and background
      const angle = Math.random() * Math.PI * 2;
      const rad = 8 + Math.random() * 16;
      nodePositions[idx] = Math.cos(angle) * rad;
      nodePositions[idx + 1] = (Math.random() - 0.5) * 18;
      nodePositions[idx + 2] = (Math.random() - 0.5) * 14;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.65,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // Dynamic Connecting Lines between nearby nodes
    const maxLines = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING GOLDEN STARDUST / MICRO-PHOTONS
    // ─────────────────────────────────────────────────────────────
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 44;
      dustPos[idx + 1] = (Math.random() - 0.5) * 32;
      dustPos[idx + 2] = (Math.random() - 0.5) * 20;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.32,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustMesh = new THREE.Points(dustGeo, dustMat);
    scene.add(dustMesh);

    // ─────────────────────────────────────────────────────────────
    // 5. LIGHTING ARCHITECTURE
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFDF7, 1.4);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.2);
    goldKeyLight.position.set(20, 25, 20);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 2.4);
    sapphireRimLight.position.set(-20, -15, 10);
    scene.add(sapphireRimLight);

    // Interactive cursor-following point light
    const cursorLight = new THREE.PointLight(0xFFE599, 4.0, 35);
    cursorLight.position.set(0, 0, 15);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // INTERACTION & LISTENERS
    // ─────────────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleClick = () => {
      mouseRef.current.clickRipple = 1.0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // ─────────────────────────────────────────────────────────────
    // MAIN RENDER & PHYSICS LOOP
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (Damping)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      // Ripple decay
      if (mouseRef.current.clickRipple > 0.01) {
        mouseRef.current.clickRipple *= 0.94;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ripple = mouseRef.current.clickRipple;

      // Dynamic 3D Camera Parallax
      camera.position.x = mx * 4.5;
      camera.position.y = my * 3.5;
      camera.lookAt(0, 0, 0);

      // Cursor light coordinates
      cursorLight.position.set(mx * 16, my * 12, 10);

      // --- 1. Animate Wave Mesh ---
      const positions = waveGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < waveCols; i++) {
        for (let j = 0; j < waveRows; j++) {
          const idx = (i * waveRows + j) * 3;
          const x = positions[idx];
          const z = positions[idx + 2];

          // Compound harmonic waves
          const wave1 = Math.sin(x * 0.22 + elapsed * 1.6) * 1.5;
          const wave2 = Math.cos(z * 0.2 + elapsed * 1.3) * 1.4;
          const wave3 = Math.sin((x + z) * 0.12 + elapsed * 0.9) * 0.9;

          // Interactive cursor gravity wave
          const dx = x - mx * 18;
          const dz = z - (my * 14 - 4);
          const distToCursor = Math.sqrt(dx * dx + dz * dz);
          const mouseDisplace = Math.sin(distToCursor * 0.5 - elapsed * 3.5) * Math.max(0, 3.5 - distToCursor * 0.25) * 0.45;

          // Click shockwave pulse
          const clickWave = Math.sin(distToCursor * 0.8 - elapsed * 6.0) * ripple * 3.0;

          // Center dip: gently depress wave under central text so letters stay 100% readable
          const distFromOrig = Math.sqrt(x * x + z * z);
          const centerAttenuation = Math.min(1.0, distFromOrig / 14);

          positions[idx + 1] = (wave1 + wave2 + wave3 + mouseDisplace + clickWave) * centerAttenuation;
        }
      }
      waveGeometry.attributes.position.needsUpdate = true;

      // --- 2. Animate Armillary Rings ---
      ring1Mesh.rotation.z = elapsed * 0.08 + mx * 0.2;
      ring1Mesh.rotation.x = 1.15 + my * 0.15;

      ring2Mesh.rotation.z = -elapsed * 0.11 - mx * 0.25;
      ring2Mesh.rotation.y = 0.85 + my * 0.2;

      ring3Mesh.rotation.y = elapsed * 0.14 + mx * 0.18;
      ring3Mesh.rotation.x = 0.5 - my * 0.12;

      // Subtle group breathing
      ringsGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.08 + mx * 0.15;
      ringsGroup.rotation.x = Math.cos(elapsed * 0.18) * 0.06 - my * 0.15;

      // Animate satellites along rings
      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.015;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

      // --- 3. Animate Constellation Nodes & Connecting Lines ---
      const nPos = nodeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        nPos[idx] += nodeVelocities[i].x;
        nPos[idx + 1] += nodeVelocities[i].y;
        nPos[idx + 2] += nodeVelocities[i].z;

        // Bounce boundaries
        if (Math.abs(nPos[idx]) > 22) nodeVelocities[i].x *= -1;
        if (Math.abs(nPos[idx + 1]) > 14) nodeVelocities[i].y *= -1;
        if (Math.abs(nPos[idx + 2]) > 10) nodeVelocities[i].z *= -1;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Update connecting line segments
      let lineIdx = 0;
      const maxConnectDist = 6.5;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const idxI = i * 3;
          const idxJ = j * 3;

          const dx = nPos[idxI] - nPos[idxJ];
          const dy = nPos[idxI + 1] - nPos[idxJ + 1];
          const dz = nPos[idxI + 2] - nPos[idxJ + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDist) {
            const alpha = (1.0 - dist / maxConnectDist) * 0.45;

            // Point A
            linePositions[lineIdx] = nPos[idxI];
            linePositions[lineIdx + 1] = nPos[idxI + 1];
            linePositions[lineIdx + 2] = nPos[idxI + 2];
            lineColors[lineIdx] = cGold.r * alpha;
            lineColors[lineIdx + 1] = cGold.g * alpha;
            lineColors[lineIdx + 2] = cGold.b * alpha;

            // Point B
            linePositions[lineIdx + 3] = nPos[idxJ];
            linePositions[lineIdx + 4] = nPos[idxJ + 1];
            linePositions[lineIdx + 5] = nPos[idxJ + 2];
            lineColors[lineIdx + 3] = cSapphire.r * alpha;
            lineColors[lineIdx + 4] = cSapphire.g * alpha;
            lineColors[lineIdx + 5] = cSapphire.b * alpha;

            lineIdx += 6;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx / 3);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // --- 4. Animate Stardust ---
      dustMesh.rotation.y = elapsed * 0.02 + mx * 0.05;
      dustMesh.rotation.x = elapsed * 0.015 - my * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      glowTexture.dispose();
      waveGeometry.dispose();
      waveMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satGeo.dispose();
      satMatGold.dispose();
      satMatSapphire.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-1200 ease-out ${
        isIntroComplete
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-98 pointer-events-none invisible'
      }`}
      aria-hidden="true"
    />
  );
};
