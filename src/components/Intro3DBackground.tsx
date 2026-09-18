import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates a high-contrast circular glow texture for particles (NormalBlending)
 */
function createCrispGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 230, 150, 0.95)');
    gradient.addColorStop(0.55, 'rgba(223, 183, 74, 0.85)');
    gradient.addColorStop(0.85, 'rgba(0, 75, 121, 0.45)');
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
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    clickRipple: 0,
  });

  // Strictly ONLY show once the intro animation is completed
  const isIntroComplete = stage === 'completed';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Camera Setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const glowTexture = createCrispGlowTexture();

    // ─────────────────────────────────────────────────────────────
    // 1. LIGHTING SETUP (High Specular for Metallic Pop)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFBF2, 1.8);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.8);
    goldKeyLight.position.set(20, 25, 20);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 3.0);
    sapphireRimLight.position.set(-20, -15, 12);
    scene.add(sapphireRimLight);

    // Interactive point light following cursor
    const cursorLight = new THREE.PointLight(0xFFE599, 4.5, 40);
    cursorLight.position.set(0, 0, 15);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL SACRED ARMILLARY RINGS (Clearly Visible & Elegant)
    // ─────────────────────────────────────────────────────────────
    const ringsGroup = new THREE.Group();
    ringsGroup.position.set(0, 0, -4);
    scene.add(ringsGroup);

    // Outer Armillary Ring (Rich Metallic Royal Gold)
    const ring1Geo = new THREE.TorusGeometry(18.5, 0.12, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = 1.15;
    ring1.rotation.y = 0.35;
    ringsGroup.add(ring1);

    // Mid Armillary Ring (Deep Celestial Sapphire)
    const ring2Geo = new THREE.TorusGeometry(14.0, 0.10, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.8,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -0.75;
    ring2.rotation.y = 0.85;
    ringsGroup.add(ring2);

    // Inner Armillary Ring (Fine Warm Gold)
    const ring3Geo = new THREE.TorusGeometry(10.2, 0.08, 16, 80);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xF5E0B8,
      metalness: 0.94,
      roughness: 0.14,
      transparent: true,
      opacity: 0.75,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = 0.45;
    ring3.rotation.z = 0.65;
    ringsGroup.add(ring3);

    // Orbiting Satellite Jewels
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    for (let i = 0; i < 6; i++) {
      const parent = i % 2 === 0 ? ring1 : ring2;
      const radius = i % 2 === 0 ? 18.5 : 14.0;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xDFB74A : 0x0088CC,
        emissive: i % 2 === 0 ? 0xDFB74A : 0x004B79,
        emissiveIntensity: 0.85,
        metalness: 0.95,
        roughness: 0.1,
      });
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), satMat);
      parent.add(satMesh);
      satellites.push({
        mesh: satMesh,
        radius,
        speed: (0.35 + (i % 3) * 0.2) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 6) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. 3D UNDULATING WAVE TERRAIN (Lower Depth Horizon)
    // ─────────────────────────────────────────────────────────────
    const waveCols = 50;
    const waveRows = 50;
    const waveCount = waveCols * waveRows;
    const waveGeo = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveCount * 3);
    const waveColors = new Float32Array(waveCount * 3);

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');
    const cNavy = new THREE.Color('#002137');

    const spacing = 1.2;
    const xOff = ((waveCols - 1) * spacing) / 2;
    const zOff = ((waveRows - 1) * spacing) / 2;

    for (let i = 0; i < waveCols; i++) {
      for (let j = 0; j < waveRows; j++) {
        const idx = (i * waveRows + j) * 3;
        wavePositions[idx] = i * spacing - xOff;
        wavePositions[idx + 1] = 0;
        wavePositions[idx + 2] = j * spacing - zOff;

        // Rich contrasting colors: Gold & Sapphire alternating with Navy
        const col = new THREE.Color();
        if ((i + j) % 3 === 0) col.copy(cGold);
        else if ((i + j) % 3 === 1) col.copy(cSapphire);
        else col.copy(cNavy);

        waveColors[idx] = col.r;
        waveColors[idx + 1] = col.g;
        waveColors[idx + 2] = col.b;
      }
    }

    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    waveGeo.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));

    const waveMat = new THREE.PointsMaterial({
      size: 0.62,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending, // 100% visible on light cream!
      depthWrite: false,
    });

    const waveMesh = new THREE.Points(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.75;
    waveMesh.position.set(0, -10.5, -4);
    scene.add(waveMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING GOLDEN STARDUST (Ambient Micro-Photons)
    // ─────────────────────────────────────────────────────────────
    const dustCount = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 48;
      dustPos[idx + 1] = (Math.random() - 0.5) * 32;
      dustPos[idx + 2] = (Math.random() - 0.5) * 18;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.45,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.7,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const dustMesh = new THREE.Points(dustGeo, dustMat);
    scene.add(dustMesh);

    // ─────────────────────────────────────────────────────────────
    // INTERACTION LISTENERS
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
    // ANIMATION & PHYSICS LOOP
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      if (mouseRef.current.clickRipple > 0.01) {
        mouseRef.current.clickRipple *= 0.94;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ripple = mouseRef.current.clickRipple;

      // Authentic 3D Camera Parallax
      camera.position.x = mx * 4.2;
      camera.position.y = my * 3.2;
      camera.lookAt(0, 0, 0);

      // Point light follows cursor in 3D
      cursorLight.position.set(mx * 16, my * 12, 12);
      cursorLight.intensity = 4.5 + ripple * 6.0;

      // --- Animate Armillary Rings ---
      ring1.rotation.z = elapsed * 0.08 + mx * 0.15;
      ring1.rotation.x = 1.15 + my * 0.12;

      ring2.rotation.z = -elapsed * 0.11 - mx * 0.18;
      ring2.rotation.y = 0.85 + my * 0.15;

      ring3.rotation.y = elapsed * 0.14 + mx * 0.12;
      ring3.rotation.x = 0.45 - my * 0.10;

      // Subtle group breathing
      ringsGroup.rotation.y = Math.sin(elapsed * 0.22) * 0.08;
      ringsGroup.rotation.x = Math.cos(elapsed * 0.18) * 0.06;

      // Animate satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.016;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

      // --- Animate Wave Terrain ---
      const positions = waveGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < waveCols; i++) {
        for (let j = 0; j < waveRows; j++) {
          const idx = (i * waveRows + j) * 3;
          const x = positions[idx];
          const z = positions[idx + 2];

          // Harmonic compound waves
          const wave1 = Math.sin(x * 0.22 + elapsed * 1.5) * 1.4;
          const wave2 = Math.cos(z * 0.20 + elapsed * 1.2) * 1.3;
          const wave3 = Math.sin((x + z) * 0.12 + elapsed * 0.8) * 0.8;

          // Interactive cursor ripple
          const dx = x - mx * 18;
          const dz = z - (my * 14 - 4);
          const distToCursor = Math.sqrt(dx * dx + dz * dz);
          const mouseDisplace = Math.sin(distToCursor * 0.5 - elapsed * 3.2) * Math.max(0, 3.5 - distToCursor * 0.25) * 0.45;

          // Click shockwave
          const clickWave = Math.sin(distToCursor * 0.8 - elapsed * 6.0) * ripple * 3.0;

          // Center dip: keep center calm so typography is 100% crisp
          const distFromOrig = Math.sqrt(x * x + z * z);
          const centerAttenuation = Math.min(1.0, distFromOrig / 14);

          positions[idx + 1] = (wave1 + wave2 + wave3 + mouseDisplace + clickWave) * centerAttenuation;
        }
      }
      waveGeo.attributes.position.needsUpdate = true;

      // --- Animate Stardust ---
      dustMesh.rotation.y = elapsed * 0.018 + mx * 0.04;
      dustMesh.rotation.x = elapsed * 0.012 - my * 0.04;

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
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satellites.forEach((sat) => sat.mesh.geometry.dispose());
      waveGeo.dispose();
      waveMat.dispose();
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
