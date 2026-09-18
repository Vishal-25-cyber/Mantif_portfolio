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

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- Soft Ambient Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const goldCornerLight = new THREE.PointLight(0xDFB74A, 2.5, 90);
    goldCornerLight.position.set(22, 16, 12);
    scene.add(goldCornerLight);

    const blueCornerLight = new THREE.PointLight(0x004B79, 2.0, 90);
    blueCornerLight.position.set(-22, -14, 12);
    scene.add(blueCornerLight);

    // Master container for smooth mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. PERIPHERAL 3D LIGHT ORBS (Kept strictly outside the text zone)
    // Soft, luminous floating 3D spheres drifting in corners
    // ─────────────────────────────────────────────────────────────
    const orbGroup = new THREE.Group();
    worldGroup.add(orbGroup);

    const orbData = [
      // Top-Right Corner (Golden warm glow)
      { basePos: new THREE.Vector3(25, 14, -8), radius: 5.2, color: 0xDFB74A, speed: 0.6, phase: 0 },
      // Top-Left Corner (Soft ethereal champagne)
      { basePos: new THREE.Vector3(-26, 15, -12), radius: 4.8, color: 0xE6C975, speed: 0.5, phase: 2.1 },
      // Bottom-Left Corner (Deep sapphire harmony)
      { basePos: new THREE.Vector3(-27, -13, -6), radius: 5.5, color: 0x004B79, speed: 0.55, phase: 4.2 },
      // Bottom-Right Corner (Warm amber gold)
      { basePos: new THREE.Vector3(26, -14, -10), radius: 4.6, color: 0xC99A2C, speed: 0.7, phase: 1.5 },
      // Far Deep Ambient Horizon Orb
      { basePos: new THREE.Vector3(0, -22, -16), radius: 7.0, color: 0xDFB74A, speed: 0.4, phase: 3.3 },
    ];

    const orbs: { mesh: THREE.Mesh; base: THREE.Vector3; speed: number; phase: number }[] = [];

    orbData.forEach((data) => {
      const geo = new THREE.SphereGeometry(data.radius, 32, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.12,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(data.basePos);
      orbGroup.add(mesh);
      orbs.push({ mesh, base: data.basePos, speed: data.speed, phase: data.phase });
    });

    // ─────────────────────────────────────────────────────────────
    // 2. DELICATE PERIPHERAL CELESTIAL ORBITS (Outer Border Only)
    // Ultra-thin, graceful hairline rings outside the text zone
    // ─────────────────────────────────────────────────────────────
    const ringGroup = new THREE.Group();
    worldGroup.add(ringGroup);

    // Large outer hairline ring (radius 22 - far outside text)
    const outerRingGeo = new THREE.TorusGeometry(22, 0.022, 16, 160);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.22,
      roughness: 0.3,
      metalness: 0.8,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.x = Math.PI / 2.8;
    outerRing.rotation.y = Math.PI / 8;
    ringGroup.add(outerRing);

    // Subtle golden satellite node orbiting far outside text
    const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.6,
      metalness: 0.9,
    });
    const satelliteNode = new THREE.Mesh(nodeGeo, nodeMat);
    ringGroup.add(satelliteNode);

    // Secondary subtle sapphire hairline ring
    const innerRingGeo = new THREE.TorusGeometry(26, 0.018, 16, 160);
    const sapphireRingMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      transparent: true,
      opacity: 0.16,
      roughness: 0.4,
      metalness: 0.7,
    });
    const sapphireRing = new THREE.Mesh(innerRingGeo, sapphireRingMat);
    sapphireRing.rotation.x = -Math.PI / 3.1;
    sapphireRing.rotation.z = Math.PI / 6;
    ringGroup.add(sapphireRing);

    // ─────────────────────────────────────────────────────────────
    // 3. AMBIENT PARTICLES (Excluding the central text zone)
    // 50 subtle golden dust motes only around the outer borders
    // ─────────────────────────────────────────────────────────────
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Distribute particles outwards away from center (radius > 16)
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 26;
      particlePositions[idx] = Math.cos(angle) * dist;
      particlePositions[idx + 1] = Math.sin(angle) * (dist * 0.65);
      particlePositions[idx + 2] = (Math.random() - 0.5) * 25;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xDFB74A,
      size: 0.22,
      transparent: true,
      opacity: 0.35,
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      // Soft, tranquil camera rotation with mouse
      worldGroup.rotation.y = mouseRef.current.x * 0.12;
      worldGroup.rotation.x = -mouseRef.current.y * 0.08;

      // 1. Gently float the peripheral 3D light orbs
      orbs.forEach(({ mesh, base, speed, phase }) => {
        mesh.position.x = base.x + Math.sin(elapsed * speed + phase) * 1.8;
        mesh.position.y = base.y + Math.cos(elapsed * (speed * 0.85) + phase) * 1.5;
        mesh.position.z = base.z + Math.sin(elapsed * (speed * 0.6) + phase) * 1.2;
      });

      // 2. Slow rotation of outer hairline orbit
      outerRing.rotation.z = elapsed * 0.04;
      sapphireRing.rotation.z = -elapsed * 0.035;

      // Orbiting satellite bead far outside text
      const beadAngle = elapsed * 0.35;
      satelliteNode.position.set(
        Math.cos(beadAngle) * 22,
        Math.sin(beadAngle) * 11,
        Math.sin(beadAngle) * 8
      );

      // 3. Ambient dust slow drift
      particleSystem.rotation.y = elapsed * 0.012;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      orbs.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      outerRingGeo.dispose();
      ringMat.dispose();
      innerRingGeo.dispose();
      sapphireRingMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
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
      style={{
        // Radial clearing mask: center 40% is completely clear so text is 100% pristine!
        maskImage: 'radial-gradient(ellipse 55% 50% at 50% 50%, transparent 25%, rgba(0,0,0,0.5) 55%, black 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 55% 50% at 50% 50%, transparent 25%, rgba(0,0,0,0.5) 55%, black 85%)',
      }}
      aria-hidden="true"
    />
  );
};
