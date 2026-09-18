import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

export const Intro3DBackground: React.FC<Intro3DBackgroundProps> = ({ stage = 'walking' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF8F5, 0.0018);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 5, 42);

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

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xDFB74A, 3.5, 80);
    goldPointLight.position.set(0, 2, 10);
    scene.add(goldPointLight);

    const blueDirLight = new THREE.DirectionalLight(0x004B79, 1.8);
    blueDirLight.position.set(-20, 25, 20);
    scene.add(blueDirLight);

    // Master group for mouse parallax rotation
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // --- 1. Topographic Neural Wave Grid (Floor) ---
    const gridWidth = 90;
    const gridHeight = 70;
    const gridSegmentsX = 48;
    const gridSegmentsY = 36;
    const terrainGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegmentsX, gridSegmentsY);
    terrainGeo.rotateX(-Math.PI / 2.15);
    terrainGeo.translate(0, -14, -6);

    const posAttr = terrainGeo.attributes.position;
    const baseCoords = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count * 3; i++) {
      baseCoords[i] = posAttr.array[i];
    }

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x002137,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      roughness: 0.4,
      metalness: 0.2,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    worldGroup.add(terrainMesh);

    // --- 2. Sacred Geometry 3D Gyroscopic Rings ---
    const ringsGroup = new THREE.Group();
    ringsGroup.position.set(0, 0, 0);
    worldGroup.add(ringsGroup);

    // Outer Golden Celestial Ring
    const outerRingGeo = new THREE.TorusGeometry(13.5, 0.08, 16, 120);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.2,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, goldMat);
    outerRing.rotation.x = Math.PI / 3.2;
    outerRing.rotation.y = Math.PI / 5;
    ringsGroup.add(outerRing);

    // Middle Navy Harmony Ring
    const midRingGeo = new THREE.TorusGeometry(10.5, 0.06, 16, 100);
    const navyMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x002137,
      emissiveIntensity: 0.15,
    });
    const midRing = new THREE.Mesh(midRingGeo, navyMat);
    midRing.rotation.x = -Math.PI / 4;
    midRing.rotation.z = Math.PI / 6;
    ringsGroup.add(midRing);

    // Inner Delicate Orbit Ring with Golden Nodes
    const innerRingGeo = new THREE.TorusGeometry(7.8, 0.04, 16, 90);
    const innerRing = new THREE.Mesh(innerRingGeo, goldMat);
    innerRing.rotation.x = Math.PI / 2.2;
    ringsGroup.add(innerRing);

    // Orbiting Satellite Nodes on Outer Ring
    const nodeGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const satelliteNode = new THREE.Mesh(nodeGeo, goldMat);
    ringsGroup.add(satelliteNode);

    const blueNodeMat = new THREE.MeshStandardMaterial({
      color: 0x002137,
      roughness: 0.2,
      metalness: 0.6,
    });
    const satelliteNode2 = new THREE.Mesh(nodeGeo, blueNodeMat);
    ringsGroup.add(satelliteNode2);

    // --- 3. 3D Floating Mathematical Polyhedra (Floating Crystals) ---
    const polyGroup = new THREE.Group();
    worldGroup.add(polyGroup);

    const icosaGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xFAF8F5,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const crystal1 = new THREE.Mesh(icosaGeo, crystalMat);
    crystal1.position.set(-22, 10, -8);
    polyGroup.add(crystal1);

    const crystal2 = new THREE.Mesh(icosaGeo, crystalMat);
    crystal2.position.set(24, 8, -12);
    crystal2.scale.setScalar(1.3);
    polyGroup.add(crystal2);

    const octaGeo = new THREE.OctahedronGeometry(1.0, 0);
    const crystal3 = new THREE.Mesh(octaGeo, crystalMat);
    crystal3.position.set(-18, -8, -4);
    polyGroup.add(crystal3);

    const crystal4 = new THREE.Mesh(octaGeo, crystalMat);
    crystal4.position.set(20, -10, -6);
    crystal4.scale.setScalar(1.1);
    polyGroup.add(crystal4);

    // --- 4. Celestial 3D Ambient Dust Particles ---
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xDFB74A);
    const colorNavy = new THREE.Color(0x004B79);
    const colorLight = new THREE.Color(0xC99A2C);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePos[idx] = (Math.random() - 0.5) * 80;
      particlePos[idx + 1] = (Math.random() - 0.5) * 50;
      particlePos[idx + 2] = (Math.random() - 0.5) * 45;

      const mixedColor = i % 3 === 0 ? colorGold : i % 3 === 1 ? colorNavy : colorLight;
      particleColors[idx] = mixedColor.r;
      particleColors[idx + 1] = mixedColor.g;
      particleColors[idx + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
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

    // --- Window Resize Handler ---
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
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (LERP)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      // Rotate master group subtly in response to cursor
      worldGroup.rotation.y = mouseRef.current.x * 0.22;
      worldGroup.rotation.x = -mouseRef.current.y * 0.14;

      // 1. Animate Gyroscopic Rings with distinct rotational speeds
      outerRing.rotation.z = elapsed * 0.12;
      outerRing.rotation.y = elapsed * 0.08 + Math.PI / 5;
      midRing.rotation.x = -elapsed * 0.15 - Math.PI / 4;
      midRing.rotation.y = elapsed * 0.1;
      innerRing.rotation.y = elapsed * 0.22;
      innerRing.rotation.z = -elapsed * 0.09;

      // Orbiting satellites
      const orbitAngle = elapsed * 0.45;
      satelliteNode.position.set(
        Math.cos(orbitAngle) * 13.5,
        Math.sin(orbitAngle) * 6.5,
        Math.sin(orbitAngle) * 7.5
      );

      const orbitAngle2 = -elapsed * 0.35 + Math.PI;
      satelliteNode2.position.set(
        Math.cos(orbitAngle2) * 10.5,
        Math.sin(orbitAngle2) * 5.0,
        Math.cos(orbitAngle2) * 6.0
      );

      // 2. Animate Floating Polyhedra
      crystal1.rotation.x = elapsed * 0.3;
      crystal1.rotation.y = elapsed * 0.2;
      crystal1.position.y = 10 + Math.sin(elapsed * 0.8) * 1.2;

      crystal2.rotation.y = -elapsed * 0.25;
      crystal2.rotation.z = elapsed * 0.15;
      crystal2.position.y = 8 + Math.cos(elapsed * 0.7) * 1.4;

      crystal3.rotation.x = -elapsed * 0.35;
      crystal3.position.y = -8 + Math.sin(elapsed * 0.9) * 0.8;

      crystal4.rotation.z = elapsed * 0.4;
      crystal4.position.y = -10 + Math.cos(elapsed * 0.85) * 1.0;

      // 3. Undulate Topographic Wave Mesh
      const posArray = terrainGeo.attributes.position.array as Float32Array;
      const count = terrainGeo.attributes.position.count;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const bx = baseCoords[i3];
        const by = baseCoords[i3 + 1];
        // Mathematical rippling equation
        const wave =
          Math.sin(bx * 0.18 + elapsed * 1.4) * 1.1 +
          Math.cos(by * 0.22 + elapsed * 1.1) * 0.9 +
          Math.sin((bx + by) * 0.12 + elapsed * 0.8) * 0.6;
        posArray[i3 + 2] = baseCoords[i3 + 2] + wave;
      }
      terrainGeo.attributes.position.needsUpdate = true;

      // 4. Subtle particle drift
      particleSystem.rotation.y = elapsed * 0.02;
      particleSystem.rotation.x = Math.sin(elapsed * 0.015) * 0.05;

      // 5. Stage-based scale & opacity modulation
      const isCompleted = stage === 'completed' || stage === 'titleReveal';
      const targetScale = isCompleted ? 1.05 : 0.92;
      ringsGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose geometries & materials
      terrainGeo.dispose();
      terrainMat.dispose();
      outerRingGeo.dispose();
      midRingGeo.dispose();
      innerRingGeo.dispose();
      goldMat.dispose();
      navyMat.dispose();
      blueNodeMat.dispose();
      nodeGeo.dispose();
      icosaGeo.dispose();
      octaGeo.dispose();
      crystalMat.dispose();
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
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden="true"
    />
  );
};
