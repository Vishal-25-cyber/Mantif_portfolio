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
    scene.fog = new THREE.FogExp2(0xFAF8F5, 0.002);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.set(0, 0, 38);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Studio Luxury Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Golden specular key light
    const goldKeyLight = new THREE.PointLight(0xDFB74A, 3.8, 80);
    goldKeyLight.position.set(15, 14, 16);
    scene.add(goldKeyLight);

    // Sapphire rim fill light
    const sapphireFillLight = new THREE.DirectionalLight(0x004B79, 1.6);
    sapphireFillLight.position.set(-20, -15, 18);
    scene.add(sapphireFillLight);

    // Warm soft backlight
    const backGlow = new THREE.PointLight(0xF5E6C8, 2.2, 90);
    backGlow.position.set(0, -5, -12);
    scene.add(backGlow);

    // Master container for smooth mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. PINTEREST LUXURY: FROSTED GLASS 3D KINETIC RIBBON
    // Translucent frosted glassmorphic torus ribbon with caustics
    // ─────────────────────────────────────────────────────────────
    const glassTorusGeo = new THREE.TorusGeometry(13.8, 0.38, 32, 140);
    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88, // High-end frosted glass transmission
      opacity: 0.95,
      transparent: true,
      roughness: 0.22, // Soft frosted diffusion that softens background without blocking text
      ior: 1.48, // Optical glass index of refraction
      thickness: 1.6,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      attenuationColor: new THREE.Color(0xDFB74A),
      attenuationDistance: 14,
    });
    const glassRibbon = new THREE.Mesh(glassTorusGeo, frostedGlassMat);
    glassRibbon.rotation.x = Math.PI / 3.2;
    glassRibbon.rotation.y = Math.PI / 6;
    worldGroup.add(glassRibbon);

    // ─────────────────────────────────────────────────────────────
    // 2. POLISHED BRUSHED GOLD CELESTIAL ARMATURE
    // Slender, high-precision luxury gold rings
    // ─────────────────────────────────────────────────────────────
    const goldArmatureGroup = new THREE.Group();
    worldGroup.add(goldArmatureGroup);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.94,
      roughness: 0.16,
      emissive: 0x8C6615,
      emissiveIntensity: 0.14,
    });

    // Outer Primary Armature Ring
    const outerArmatureGeo = new THREE.TorusGeometry(18.5, 0.05, 24, 180);
    const outerArmature = new THREE.Mesh(outerArmatureGeo, goldMat);
    outerArmature.rotation.x = -Math.PI / 2.7;
    outerArmature.rotation.y = Math.PI / 8;
    goldArmatureGroup.add(outerArmature);

    // Secondary Sapphire Hairline Orbit
    const sapphireMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.8,
      roughness: 0.25,
      transparent: true,
      opacity: 0.35,
    });
    const sapphireOrbitGeo = new THREE.TorusGeometry(23.0, 0.03, 16, 180);
    const sapphireOrbit = new THREE.Mesh(sapphireOrbitGeo, sapphireMat);
    sapphireOrbit.rotation.x = Math.PI / 4;
    sapphireOrbit.rotation.z = Math.PI / 5;
    goldArmatureGroup.add(sapphireOrbit);

    // ─────────────────────────────────────────────────────────────
    // 3. FLOATING 3D GOLD & LIQUID PEARLS (Subtle Peripheral Spheres)
    // Floating mirror spheres that drift in 3D perspective
    // ─────────────────────────────────────────────────────────────
    const pearlsGroup = new THREE.Group();
    worldGroup.add(pearlsGroup);

    const pearlData = [
      { radius: 0.85, basePos: new THREE.Vector3(22, 11, -4), mat: goldMat, speed: 0.7, phase: 0 },
      { radius: 0.65, basePos: new THREE.Vector3(-24, 12, -8), mat: frostedGlassMat, speed: 0.55, phase: 1.8 },
      { radius: 0.95, basePos: new THREE.Vector3(-22, -11, -6), mat: goldMat, speed: 0.65, phase: 3.2 },
      { radius: 0.55, basePos: new THREE.Vector3(24, -12, -5), mat: sapphireMat, speed: 0.8, phase: 4.5 },
      { radius: 0.42, basePos: new THREE.Vector3(16, -15, -2), mat: goldMat, speed: 0.5, phase: 2.3 },
      { radius: 0.45, basePos: new THREE.Vector3(-17, 14, -3), mat: goldMat, speed: 0.6, phase: 5.1 },
    ];

    const pearls: { mesh: THREE.Mesh; base: THREE.Vector3; speed: number; phase: number }[] = [];

    pearlData.forEach((p) => {
      const geo = new THREE.SphereGeometry(p.radius, 32, 32);
      const mesh = new THREE.Mesh(geo, p.mat);
      mesh.position.copy(p.basePos);
      pearlsGroup.add(mesh);
      pearls.push({ mesh, base: p.basePos, speed: p.speed, phase: p.phase });
    });

    // Orbiting Golden Photon Bead on Primary Armature
    const beadGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 1.0,
    });
    const satelliteBead = new THREE.Mesh(beadGeo, beadMat);
    goldArmatureGroup.add(satelliteBead);

    // ─────────────────────────────────────────────────────────────
    // 4. CELESTIAL STARDUST SPECKS (Floating in full volume)
    // 85 golden micro-photons drifting peacefully in depth
    // ─────────────────────────────────────────────────────────────
    const stardustCount = 85;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPositions = new Float32Array(stardustCount * 3);

    for (let i = 0; i < stardustCount; i++) {
      const idx = i * 3;
      stardustPositions[idx] = (Math.random() - 0.5) * 85;
      stardustPositions[idx + 1] = (Math.random() - 0.5) * 48;
      stardustPositions[idx + 2] = (Math.random() - 0.5) * 40;
    }

    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPositions, 3));
    const stardustMat = new THREE.PointsMaterial({
      color: 0xDFB74A,
      size: 0.28,
      transparent: true,
      opacity: 0.5,
    });
    const stardustSystem = new THREE.Points(stardustGeo, stardustMat);
    worldGroup.add(stardustSystem);

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
      worldGroup.rotation.y = mouseRef.current.x * 0.14;
      worldGroup.rotation.x = -mouseRef.current.y * 0.09;

      // 1. Frosted Glass Ribbon: Slow, hypnotic 3D tumble
      glassRibbon.rotation.z = elapsed * 0.07;
      glassRibbon.rotation.y = Math.PI / 6 + elapsed * 0.05;

      // 2. Gold Armature counter-rotation
      outerArmature.rotation.z = -elapsed * 0.055;
      sapphireOrbit.rotation.z = elapsed * 0.04;

      // Orbiting satellite bead
      const beadAngle = elapsed * 0.45;
      satelliteBead.position.set(
        Math.cos(beadAngle) * 18.5,
        Math.sin(beadAngle) * 8.5,
        Math.sin(beadAngle) * 9.5
      );

      // 3. Floating 3D Pearls in harmonic motion
      pearls.forEach(({ mesh, base, speed, phase }) => {
        mesh.position.x = base.x + Math.sin(elapsed * speed + phase) * 1.5;
        mesh.position.y = base.y + Math.cos(elapsed * (speed * 0.8) + phase) * 1.3;
        mesh.position.z = base.z + Math.sin(elapsed * (speed * 0.6) + phase) * 1.1;
      });

      // 4. Stardust slow drift
      stardustSystem.rotation.y = elapsed * 0.01;

      // 5. Breathing scale modulation
      const breathe = 1 + Math.sin(elapsed * 0.75) * 0.018;
      glassRibbon.scale.set(breathe, breathe, breathe);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      glassTorusGeo.dispose();
      frostedGlassMat.dispose();
      outerArmatureGeo.dispose();
      sapphireOrbitGeo.dispose();
      goldMat.dispose();
      sapphireMat.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      pearls.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      stardustGeo.dispose();
      stardustMat.dispose();
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
      aria-hidden="true"
    />
  );
};
