import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Strictly ONLY show once the intro animation is completed
  const isIntroComplete = stage === 'completed';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF8F5, 0.0025);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

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

    const goldenCoreLight = new THREE.PointLight(0xDFB74A, 3.2, 70);
    goldenCoreLight.position.set(0, 0, 12);
    scene.add(goldenCoreLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 1.6);
    sapphireRimLight.position.set(-18, 16, 20);
    scene.add(sapphireRimLight);

    // Master container for smooth mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. THE 3D INFINITY KNOT (Human Intuition × Machine Reason)
    // A clean, hypnotic, sculptural gold ribbon intertwining in 3D
    // ─────────────────────────────────────────────────────────────
    const knotGroup = new THREE.Group();
    worldGroup.add(knotGroup);

    const knotGeometry = new THREE.TorusKnotGeometry(9.2, 0.28, 180, 32, 2, 3);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xDFB74A,
      emissive: 0x8C6615,
      emissiveIntensity: 0.14,
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.75,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });
    const infinityKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    knotGroup.add(infinityKnot);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL SAPPHIRE HARMONY RING
    // An ethereal, slender orbit ring embracing the infinity knot
    // ─────────────────────────────────────────────────────────────
    const orbitRingGeo = new THREE.TorusGeometry(15.5, 0.04, 24, 160);
    const orbitRingMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.75,
      roughness: 0.25,
      transparent: true,
      opacity: 0.35,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 3.2;
    orbitRing.rotation.y = Math.PI / 5;
    knotGroup.add(orbitRing);

    // Gliding golden photon bead on the orbit ring
    const beadGeo = new THREE.SphereGeometry(0.26, 20, 20);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.95,
    });
    const satelliteBead = new THREE.Mesh(beadGeo, beadMat);
    knotGroup.add(satelliteBead);

    // ─────────────────────────────────────────────────────────────
    // 3. GENTLE FLOATING CELESTIAL PARTICLES
    // 45 soft ambient golden specks drifting in deep perspective
    // ─────────────────────────────────────────────────────────────
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 60;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 36;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xDFB74A,
      size: 0.28,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particleSystem);

    // --- Mouse Movement Handler ---
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Silky parallax response
      worldGroup.rotation.y = mouseRef.current.x * 0.18;
      worldGroup.rotation.x = -mouseRef.current.y * 0.12;

      // Hypnotic slow tumble of the 3D infinity knot
      infinityKnot.rotation.x = elapsed * 0.14;
      infinityKnot.rotation.y = elapsed * 0.18;
      infinityKnot.rotation.z = Math.sin(elapsed * 0.25) * 0.15;

      // Orbit ring and satellite bead motion
      orbitRing.rotation.z = -elapsed * 0.08;
      orbitRing.rotation.x = Math.PI / 3.2 + Math.sin(elapsed * 0.3) * 0.08;

      const beadAngle = elapsed * 0.5;
      satelliteBead.position.set(
        Math.cos(beadAngle) * 15.5,
        Math.sin(beadAngle) * 7.5,
        Math.sin(beadAngle) * 8.2
      );

      // Ambient particle slow rotation
      particleSystem.rotation.y = elapsed * 0.015;

      // Breathing pulse on the knot
      const scale = 1 + Math.sin(elapsed * 0.9) * 0.02;
      knotGroup.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      knotGeometry.dispose();
      knotMaterial.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-out ${
        isIntroComplete
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-95 pointer-events-none invisible'
      }`}
      aria-hidden="true"
    />
  );
};
