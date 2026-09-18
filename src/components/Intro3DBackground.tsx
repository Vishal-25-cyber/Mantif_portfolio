import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string;
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF8F5, 0.0035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 38);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const goldenHaloLight = new THREE.PointLight(0xDFB74A, 2.8, 65);
    goldenHaloLight.position.set(0, 0, 8);
    scene.add(goldenHaloLight);

    const softNavyLight = new THREE.DirectionalLight(0x004B79, 1.2);
    softNavyLight.position.set(-15, 20, 15);
    scene.add(softNavyLight);

    // Master container for smooth mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. ELEGANT 3D MINIMALIST GOLDEN HALO RING
    // A single, refined, high-end metallic ring framing the center
    // ─────────────────────────────────────────────────────────────
    const haloGroup = new THREE.Group();
    worldGroup.add(haloGroup);

    const ringGeometry = new THREE.TorusGeometry(12.8, 0.055, 32, 160);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.15,
    });
    const mainRing = new THREE.Mesh(ringGeometry, ringMaterial);
    mainRing.rotation.x = Math.PI / 3.4;
    mainRing.rotation.y = Math.PI / 6;
    haloGroup.add(mainRing);

    // Subtle golden satellite bead on the halo
    const beadGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 1.0,
    });
    const satelliteBead = new THREE.Mesh(beadGeo, beadMat);
    haloGroup.add(satelliteBead);

    // Secondary ultra-thin hairline navy ellipse (counter-rotation)
    const hairlineGeo = new THREE.TorusGeometry(15.2, 0.025, 24, 160);
    const hairlineMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      transparent: true,
      opacity: 0.28,
      metalness: 0.8,
      roughness: 0.2,
    });
    const hairlineRing = new THREE.Mesh(hairlineGeo, hairlineMat);
    hairlineRing.rotation.x = -Math.PI / 3.8;
    hairlineRing.rotation.z = Math.PI / 4;
    haloGroup.add(hairlineRing);

    // ─────────────────────────────────────────────────────────────
    // 2. SMOOTH FLUID SILK RIBBON WAVE
    // A continuous, organic, floating ribbon of translucent silk
    // ─────────────────────────────────────────────────────────────
    const ribbonWidth = 65;
    const ribbonHeight = 35;
    const ribbonSegX = 64;
    const ribbonSegY = 32;
    const ribbonGeo = new THREE.PlaneGeometry(ribbonWidth, ribbonHeight, ribbonSegX, ribbonSegY);
    ribbonGeo.rotateX(-Math.PI / 2.3);
    ribbonGeo.translate(0, -6, -4);

    const posAttr = ribbonGeo.attributes.position;
    const baseCoords = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count * 3; i++) {
      baseCoords[i] = posAttr.array[i];
    }

    // High-end satin sheen material
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xFAF8F5,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.06,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    worldGroup.add(ribbonMesh);

    // Delicate secondary wave (sapphire tone) underneath
    const subWaveGeo = ribbonGeo.clone();
    subWaveGeo.translate(0, -2, -6);
    const subWaveMat = new THREE.MeshPhysicalMaterial({
      color: 0xFAF8F5,
      emissive: 0x004B79,
      emissiveIntensity: 0.08,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const subWaveMesh = new THREE.Mesh(subWaveGeo, subWaveMat);
    worldGroup.add(subWaveMesh);

    // ─────────────────────────────────────────────────────────────
    // 3. MINIMAL CELESTIAL SPECKS (Gentle Stardust)
    // Only 80 soft ambient points drifting in the background
    // ─────────────────────────────────────────────────────────────
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 65;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 42;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 35;
      particleScales[i] = Math.random() * 0.4 + 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xDFB74A,
      size: 0.22,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particleSystem);

    // --- Mouse Parallax Handler ---
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / innerHeight - 0.5) * 2;
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.035;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.035;

      // Soft, tranquil camera rotation with mouse
      worldGroup.rotation.y = mouseRef.current.x * 0.16;
      worldGroup.rotation.x = -mouseRef.current.y * 0.1;

      // 1. Halo Ring Motion: Gentle, elegant tumble
      mainRing.rotation.z = elapsed * 0.08;
      mainRing.rotation.y = Math.PI / 6 + elapsed * 0.05;
      hairlineRing.rotation.z = -elapsed * 0.06;

      // Orbiting satellite bead
      const beadAngle = elapsed * 0.45;
      satelliteBead.position.set(
        Math.cos(beadAngle) * 12.8,
        Math.sin(beadAngle) * 6.2,
        Math.sin(beadAngle) * 6.8
      );

      // 2. Animate Fluid Silk Wave (Smooth Harmonic Ripples)
      const count = posAttr.count;
      const posArr = ribbonGeo.attributes.position.array as Float32Array;
      const subPosArr = subWaveGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const bx = baseCoords[i3];
        const by = baseCoords[i3 + 1];

        // Smooth wave function with calm flow
        const wave =
          Math.sin(bx * 0.12 + elapsed * 1.1) * 1.6 +
          Math.cos(by * 0.15 + elapsed * 0.8) * 1.2;

        posArr[i3 + 2] = baseCoords[i3 + 2] + wave;
        subPosArr[i3 + 2] = baseCoords[i3 + 2] + wave * 0.85 - 1.5;
      }
      ribbonGeo.computeVertexNormals();
      subWaveGeo.computeVertexNormals();
      ribbonGeo.attributes.position.needsUpdate = true;
      subWaveGeo.attributes.position.needsUpdate = true;

      // 3. Ambient dust slow drift
      particleSystem.rotation.y = elapsed * 0.015;

      // 4. Subtle breathing pulse on halo scale
      const breath = 1 + Math.sin(elapsed * 0.8) * 0.02;
      haloGroup.scale.set(breath, breath, breath);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      ringGeometry.dispose();
      ringMaterial.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      hairlineGeo.dispose();
      hairlineMat.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      subWaveGeo.dispose();
      subWaveMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stage]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        opacity: stage === 'completed' || stage === 'titleReveal' ? 1 : 0.85,
        transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden="true"
    />
  );
};
