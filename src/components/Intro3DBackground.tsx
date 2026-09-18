import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 });

  // Strictly ONLY show once the intro animation is completed
  const isIntroComplete = stage === 'completed';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Fog Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF8F5, 0.0032);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    // Angled top-down perspective to give massive depth across the full screen
    camera.position.set(0, 16, 42);
    camera.lookAt(0, -2, 0);

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

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xDFB74A, 3.5, 90);
    goldLight.position.set(0, 10, 15);
    scene.add(goldLight);

    const sapphireLight = new THREE.DirectionalLight(0x004B79, 1.8);
    sapphireLight.position.set(-25, 30, 20);
    scene.add(sapphireLight);

    // Master container for smooth camera parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. FULL-PAGE 3D NEURAL SILK WAVE FIELD
    // Dense 3D matrix covering the entire screen edge-to-edge
    // ─────────────────────────────────────────────────────────────
    const cols = 72;
    const rows = 52;
    const totalPoints = cols * rows;
    const spacingX = 1.85;
    const spacingZ = 1.45;
    const startX = -(cols * spacingX) / 2;
    const startZ = -(rows * spacingZ) / 2;

    const waveGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPoints * 3);
    const baseCoords = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const sizes = new Float32Array(totalPoints);

    const colorGold = new THREE.Color(0xDFB74A);
    const colorSapphire = new THREE.Color(0x004B79);
    const colorChampagne = new THREE.Color(0xE6C975);
    const colorNavy = new THREE.Color(0x002137);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const i3 = i * 3;

        const x = startX + c * spacingX;
        const y = -8; // Resting floor elevation
        const z = startZ + r * spacingZ;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        baseCoords[i3] = x;
        baseCoords[i3 + 1] = y;
        baseCoords[i3 + 2] = z;

        // Gradient coloring: Golden crests, deep sapphire troughs
        const normZ = r / rows;
        const normX = c / cols;
        const blend = (normX + normZ) * 0.5;

        let ptColor: THREE.Color;
        if (blend < 0.35) {
          ptColor = colorGold.clone().lerp(colorChampagne, blend / 0.35);
        } else if (blend < 0.7) {
          ptColor = colorChampagne.clone().lerp(colorSapphire, (blend - 0.35) / 0.35);
        } else {
          ptColor = colorSapphire.clone().lerp(colorNavy, (blend - 0.7) / 0.3);
        }

        colors[i3] = ptColor.r;
        colors[i3 + 1] = ptColor.g;
        colors[i3 + 2] = ptColor.b;

        // Point size variation based on depth (nearer = slightly larger)
        sizes[i] = (1 - normZ * 0.5) * 0.32;
      }
    }

    waveGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular soft particle texture
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.premultiplyAlpha = true;
      return texture;
    };

    const particleTexture = createCircleTexture();

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.32,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const waveMesh = new THREE.Points(waveGeometry, waveMaterial);
    worldGroup.add(waveMesh);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL HORIZON RINGS (Deep Background Depth)
    // Delicate, giant orbital rings encircling the full scene
    // ─────────────────────────────────────────────────────────────
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, -2, -15);
    worldGroup.add(ringGroup);

    // Giant Golden Horizon Halo
    const horizonRingGeo = new THREE.TorusGeometry(32, 0.04, 16, 180);
    const horizonRingMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.28,
    });
    const horizonRing = new THREE.Mesh(horizonRingGeo, horizonRingMat);
    horizonRing.rotation.x = Math.PI / 2.3;
    horizonRing.rotation.y = Math.PI / 10;
    ringGroup.add(horizonRing);

    // Secondary Sapphire Hairline Counter-Ring
    const subRingGeo = new THREE.TorusGeometry(38, 0.025, 16, 180);
    const subRingMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.75,
      roughness: 0.3,
      transparent: true,
      opacity: 0.2,
    });
    const subRing = new THREE.Mesh(subRingGeo, subRingMat);
    subRing.rotation.x = -Math.PI / 2.5;
    subRing.rotation.z = Math.PI / 6;
    ringGroup.add(subRing);

    // ─────────────────────────────────────────────────────────────
    // 3. GENTLE DRIFTING PARTICLES IN FULL VOLUME
    // 120 subtle golden dust motes scattered across full screen depth
    // ─────────────────────────────────────────────────────────────
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPositions[idx] = (Math.random() - 0.5) * 110;
      dustPositions[idx + 1] = (Math.random() - 0.5) * 55 + 5;
      dustPositions[idx + 2] = (Math.random() - 0.5) * 60;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xDFB74A,
      size: 0.26,
      transparent: true,
      opacity: 0.45,
      map: particleTexture,
      depthWrite: false,
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    worldGroup.add(dustSystem);

    // --- Mouse Movement & Ray Projection ---
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / innerHeight - 0.5) * 2;

      // Project mouse coordinates into approximate 3D world space
      mouseRef.current.worldX = mouseRef.current.targetX * 28;
      mouseRef.current.worldY = mouseRef.current.targetY * 18 - 4;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- Resize Handler ---
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

    // --- Animation Loop ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (LERP)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Gentle camera parallax
      worldGroup.rotation.y = mouseRef.current.x * 0.12;
      worldGroup.rotation.x = -mouseRef.current.y * 0.07;

      // Rotate horizon rings
      horizonRing.rotation.z = elapsed * 0.035;
      subRing.rotation.z = -elapsed * 0.025;

      // ─────────────────────────────────────────────────────────────
      // Full-Page Multi-Harmonic Wave Math with Mouse Ripple Force
      // ─────────────────────────────────────────────────────────────
      const posArr = waveGeometry.attributes.position.array as Float32Array;
      const mX = mouseRef.current.worldX;
      const mZ = mouseRef.current.worldY * 1.5;

      for (let i = 0; i < totalPoints; i++) {
        const i3 = i * 3;
        const bx = baseCoords[i3];
        const bz = baseCoords[i3 + 2];

        // 1. Primary harmonic fluid wave
        const wave1 = Math.sin(bx * 0.11 + elapsed * 1.25) * 2.2;
        const wave2 = Math.cos(bz * 0.14 + elapsed * 0.95) * 1.8;
        const wave3 = Math.sin((bx + bz) * 0.07 + elapsed * 0.8) * 1.1;

        // 2. Interactive mouse fluid ripple
        const dx = bx - mX;
        const dz = bz - mZ;
        const distSq = dx * dx + dz * dz;
        let mouseRipple = 0;
        if (distSq < 400) {
          const dist = Math.sqrt(distSq);
          mouseRipple = Math.cos(dist * 0.35 - elapsed * 3.5) * (1 - dist / 20) * 2.8;
        }

        // Apply synthesized wave displacement
        posArr[i3 + 1] = baseCoords[i3 + 1] + wave1 + wave2 + wave3 + mouseRipple;
      }
      waveGeometry.attributes.position.needsUpdate = true;

      // Slow ambient dust drift
      dustSystem.rotation.y = elapsed * 0.012;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      waveGeometry.dispose();
      waveMaterial.dispose();
      horizonRingGeo.dispose();
      horizonRingMat.dispose();
      subRingGeo.dispose();
      subRingMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      particleTexture?.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1200 ease-out ${
        isIntroComplete
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-98 pointer-events-none invisible'
      }`}
      style={{
        // Full page coverage with subtle bottom & edge fade
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.2) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.2) 100%)',
      }}
      aria-hidden="true"
    />
  );
};
