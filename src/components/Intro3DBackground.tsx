import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates a crisp circular glowing sprite texture for points with high opacity
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 235, 170, 0.95)');
    gradient.addColorStop(0.55, 'rgba(223, 183, 74, 0.8)');
    gradient.addColorStop(0.85, 'rgba(0, 75, 121, 0.35)');
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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const glowTexture = createGlowTexture();

    // ─────────────────────────────────────────────────────────────
    // 1. LIGHTING ARCHITECTURE (Luxury Gold & Sapphire Speculars)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFBF2, 1.8);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.8);
    goldKeyLight.position.set(22, 28, 20);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 3.0);
    sapphireRimLight.position.set(-22, -18, 14);
    scene.add(sapphireRimLight);

    const topSun = new THREE.DirectionalLight(0xFFFFFF, 1.6);
    topSun.position.set(0, 30, 10);
    scene.add(topSun);

    // Interactive cursor-following 3D Point Light
    const cursorLight = new THREE.PointLight(0xFFE58F, 5.5, 45);
    cursorLight.position.set(0, 0, 16);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL HALO ORBITAL RINGS (Framing Full Screen)
    // ─────────────────────────────────────────────────────────────
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 0, -12);
    scene.add(haloGroup);

    // Outer Celestial Orbit
    const halo1Geo = new THREE.TorusGeometry(26, 0.1, 16, 120);
    const haloMatGold = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const halo1 = new THREE.Mesh(halo1Geo, haloMatGold);
    halo1.rotation.x = 1.12;
    halo1.rotation.y = 0.28;
    haloGroup.add(halo1);

    // Mid Celestial Orbit
    const halo2Geo = new THREE.TorusGeometry(20, 0.08, 16, 100);
    const haloMatSapphire = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const halo2 = new THREE.Mesh(halo2Geo, haloMatSapphire);
    halo2.rotation.x = -0.85;
    halo2.rotation.y = 0.65;
    haloGroup.add(halo2);

    // Inner Delicate Orbit
    const halo3Geo = new THREE.TorusGeometry(15, 0.06, 16, 80);
    const haloMatChampagne = new THREE.MeshStandardMaterial({
      color: 0xF5E0B8,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.5,
    });
    const halo3 = new THREE.Mesh(halo3Geo, haloMatChampagne);
    halo3.rotation.x = 0.45;
    halo3.rotation.z = 0.55;
    haloGroup.add(halo3);

    // Orbiting Satellites on Halos
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    for (let i = 0; i < 8; i++) {
      const parent = i % 2 === 0 ? halo1 : halo2;
      const radius = i % 2 === 0 ? 26 : 20;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xDFB74A : 0x0088CC,
        emissive: i % 2 === 0 ? 0xDFB74A : 0x004B79,
        emissiveIntensity: 0.85,
        metalness: 0.95,
        roughness: 0.1,
      });
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), satMat);
      parent.add(satMesh);
      satellites.push({
        mesh: satMesh,
        radius,
        speed: (0.35 + (i % 3) * 0.25) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 8) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TOP-LEFT: 3D DUAL-LAYER ICOSAHEDRON & SAPPHIRE CORE
    // ─────────────────────────────────────────────────────────────
    const icoGroup = new THREE.Group();
    icoGroup.position.set(-22, 11, -8);
    scene.add(icoGroup);

    // Outer Wireframe Cage
    const icoGeo = new THREE.IcosahedronGeometry(4.2, 0);
    const icoWireMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      wireframe: true,
      metalness: 0.95,
      roughness: 0.12,
      transparent: true,
      opacity: 0.85,
    });
    const icoWire = new THREE.Mesh(icoGeo, icoWireMat);
    icoGroup.add(icoWire);

    // Inner Glowing Solid Gem
    const innerGemGeo = new THREE.OctahedronGeometry(2.3, 0);
    const innerGemMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      emissive: 0x002137,
      emissiveIntensity: 0.4,
      metalness: 0.92,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    const innerGem = new THREE.Mesh(innerGemGeo, innerGemMat);
    icoGroup.add(innerGem);

    // ─────────────────────────────────────────────────────────────
    // 4. TOP-RIGHT: 3D HOROLOGICAL GIMBAL / ARMILLARY SPHERE
    // ─────────────────────────────────────────────────────────────
    const gimbalGroup = new THREE.Group();
    gimbalGroup.position.set(22, 11, -8);
    scene.add(gimbalGroup);

    const gRingMatGold = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    });

    const gRingMatSapphire = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.85,
    });

    const gRing1 = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.14, 16, 64), gRingMatGold);
    gimbalGroup.add(gRing1);

    const gRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.11, 16, 64), gRingMatSapphire);
    gRing2.rotation.x = Math.PI / 2;
    gimbalGroup.add(gRing2);

    const gRing3 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.09, 16, 64), gRingMatGold);
    gRing3.rotation.y = Math.PI / 2;
    gimbalGroup.add(gRing3);

    // Central Sphere Core
    const gCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xDFB74A,
        emissive: 0x8C6B18,
        emissiveIntensity: 0.5,
        metalness: 0.98,
        roughness: 0.1,
      })
    );
    gimbalGroup.add(gCore);

    // ─────────────────────────────────────────────────────────────
    // 5. BOTTOM-LEFT: 3D METALLIC GOLD TORUS KNOT
    // ─────────────────────────────────────────────────────────────
    const knotGroup = new THREE.Group();
    knotGroup.position.set(-21, -11, -7);
    scene.add(knotGroup);

    const knotGeo = new THREE.TorusKnotGeometry(3.2, 0.55, 96, 16, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.94,
      roughness: 0.18,
      transparent: true,
      opacity: 0.85,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotGroup.add(knotMesh);

    // ─────────────────────────────────────────────────────────────
    // 6. BOTTOM-RIGHT: 3D GEOMETRIC DODECAHEDRON CRYSTAL
    // ─────────────────────────────────────────────────────────────
    const dodecaGroup = new THREE.Group();
    dodecaGroup.position.set(21, -11, -7);
    scene.add(dodecaGroup);

    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.9,
      roughness: 0.18,
      transparent: true,
      opacity: 0.85,
    });
    const dodecaMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5, 0), dodecaMat);
    dodecaGroup.add(dodecaMesh);

    const dodecaWireMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      wireframe: true,
      metalness: 0.95,
      roughness: 0.1,
    });
    const dodecaWire = new THREE.Mesh(new THREE.DodecahedronGeometry(3.9, 0), dodecaWireMat);
    dodecaGroup.add(dodecaWire);

    // ─────────────────────────────────────────────────────────────
    // 7. 3D NEURAL CONSTELLATION NETWORK (Crisp NormalBlending)
    // ─────────────────────────────────────────────────────────────
    const nodeCount = 75;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');
    const cNavy = new THREE.Color('#002137');

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      // Distribute across screen periphery so center text remains clear
      const angle = Math.random() * Math.PI * 2;
      const dist = 7.5 + Math.random() * 22;
      nodePositions[idx] = Math.cos(angle) * dist;
      nodePositions[idx + 1] = Math.sin(angle) * dist * 0.72;
      nodePositions[idx + 2] = (Math.random() - 0.5) * 16;

      const col = new THREE.Color();
      if (i % 3 === 0) col.copy(cGold);
      else if (i % 3 === 1) col.copy(cSapphire);
      else col.copy(cNavy);

      nodeColors[idx] = col.r;
      nodeColors[idx + 1] = col.g;
      nodeColors[idx + 2] = col.b;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.016,
        y: (Math.random() - 0.5) * 0.016,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.75,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
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
      opacity: 0.5,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─────────────────────────────────────────────────────────────
    // 8. 3D UNDULATING WAVE TOPOGRAPHY (Lower Horizon Perspective)
    // ─────────────────────────────────────────────────────────────
    const waveCols = 46;
    const waveRows = 46;
    const waveCount = waveCols * waveRows;
    const waveGeo = new THREE.BufferGeometry();
    const wavePos = new Float32Array(waveCount * 3);
    const waveColsArr = new Float32Array(waveCount * 3);

    const spacing = 1.35;
    const xOff = ((waveCols - 1) * spacing) / 2;
    const zOff = ((waveRows - 1) * spacing) / 2;

    for (let i = 0; i < waveCols; i++) {
      for (let j = 0; j < waveRows; j++) {
        const idx = (i * waveRows + j) * 3;
        wavePos[idx] = i * spacing - xOff;
        wavePos[idx + 1] = 0;
        wavePos[idx + 2] = j * spacing - zOff;

        const col = new THREE.Color();
        if ((i + j) % 2 === 0) col.copy(cGold);
        else col.copy(cSapphire);

        waveColsArr[idx] = col.r;
        waveColsArr[idx + 1] = col.g;
        waveColsArr[idx + 2] = col.b;
      }
    }
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
    waveGeo.setAttribute('color', new THREE.BufferAttribute(waveColsArr, 3));

    const wavePointsMat = new THREE.PointsMaterial({
      size: 0.6,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const wavePoints = new THREE.Points(waveGeo, wavePointsMat);
    wavePoints.rotation.x = -Math.PI / 2.75;
    wavePoints.position.set(0, -11.5, -6);
    scene.add(wavePoints);

    // ─────────────────────────────────────────────────────────────
    // 9. AMBIENT GOLDEN STARDUST / MICRO-PHOTONS
    // ─────────────────────────────────────────────────────────────
    const dustCount = 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 50;
      dustPos[idx + 1] = (Math.random() - 0.5) * 36;
      dustPos[idx + 2] = (Math.random() - 0.5) * 24;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.38,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.65,
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (mouseRef.current.clickRipple > 0.01) {
        mouseRef.current.clickRipple *= 0.94;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ripple = mouseRef.current.clickRipple;

      // Dynamic 3D Camera Parallax
      camera.position.x = mx * 5.2;
      camera.position.y = my * 4.2;
      camera.lookAt(0, 0, 0);

      // Cursor light tracking
      cursorLight.position.set(mx * 18, my * 14, 12);
      cursorLight.intensity = 5.0 + ripple * 8.0;

      // --- Animate Corner 3D Sculptures ---
      // Top-Left Icosahedron
      icoGroup.rotation.y = elapsed * 0.35 + mx * 0.4;
      icoGroup.rotation.x = elapsed * 0.22 + my * 0.35;
      innerGem.rotation.y = -elapsed * 0.6;
      innerGem.rotation.z = elapsed * 0.4;

      // Top-Right Gimbal
      gimbalGroup.rotation.y = -elapsed * 0.45 - mx * 0.4;
      gimbalGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.2 + my * 0.35;
      gRing1.rotation.z = elapsed * 0.7;
      gRing2.rotation.y = -elapsed * 0.8;
      gRing3.rotation.x = elapsed * 0.6;

      // Bottom-Left Torus Knot
      knotGroup.rotation.x = elapsed * 0.3 + my * 0.3;
      knotGroup.rotation.y = elapsed * 0.4 + mx * 0.3;
      knotMesh.rotation.z = elapsed * 0.2;

      // Bottom-Right Dodecahedron
      dodecaGroup.rotation.y = elapsed * 0.3 - mx * 0.4;
      dodecaGroup.rotation.x = elapsed * 0.22 + my * 0.3;
      dodecaWire.rotation.y = -elapsed * 0.4;
      dodecaWire.rotation.z = elapsed * 0.25;

      // --- Animate Celestial Halos & Satellites ---
      halo1.rotation.z = elapsed * 0.07;
      halo2.rotation.z = -elapsed * 0.1;
      halo3.rotation.y = elapsed * 0.12;

      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.016;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

      // --- Animate Wave Topography ---
      const wPositions = waveGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < waveCols; i++) {
        for (let j = 0; j < waveRows; j++) {
          const idx = (i * waveRows + j) * 3;
          const x = wPositions[idx];
          const z = wPositions[idx + 2];

          const wave1 = Math.sin(x * 0.24 + elapsed * 1.5) * 1.4;
          const wave2 = Math.cos(z * 0.22 + elapsed * 1.2) * 1.3;
          const wave3 = Math.sin((x + z) * 0.12 + elapsed * 0.8) * 0.8;

          // Interactive cursor ripple
          const dx = x - mx * 18;
          const dz = z - (my * 14 - 4);
          const distToCursor = Math.sqrt(dx * dx + dz * dz);
          const mouseDisplace = Math.sin(distToCursor * 0.5 - elapsed * 3.2) * Math.max(0, 3.5 - distToCursor * 0.25) * 0.5;

          // Click shockwave
          const clickWave = Math.sin(distToCursor * 0.8 - elapsed * 6.0) * ripple * 3.2;

          // Center clearing so text is crisp
          const distFromOrig = Math.sqrt(x * x + z * z);
          const centerAttenuation = Math.min(1.0, distFromOrig / 14);

          wPositions[idx + 1] = (wave1 + wave2 + wave3 + mouseDisplace + clickWave) * centerAttenuation;
        }
      }
      waveGeo.attributes.position.needsUpdate = true;

      // --- Animate Constellation Nodes & Synapses ---
      const nPos = nodeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        nPos[idx] += nodeVelocities[i].x;
        nPos[idx + 1] += nodeVelocities[i].y;
        nPos[idx + 2] += nodeVelocities[i].z;

        if (Math.abs(nPos[idx]) > 26) nodeVelocities[i].x *= -1;
        if (Math.abs(nPos[idx + 1]) > 17) nodeVelocities[i].y *= -1;
        if (Math.abs(nPos[idx + 2]) > 12) nodeVelocities[i].z *= -1;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Update dynamic connecting lines
      let lineIdx = 0;
      const maxConnectDist = 6.8;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const idxI = i * 3;
          const idxJ = j * 3;

          const dx = nPos[idxI] - nPos[idxJ];
          const dy = nPos[idxI + 1] - nPos[idxJ + 1];
          const dz = nPos[idxI + 2] - nPos[idxJ + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDist) {
            const alpha = (1.0 - dist / maxConnectDist) * 0.55;

            linePositions[lineIdx] = nPos[idxI];
            linePositions[lineIdx + 1] = nPos[idxI + 1];
            linePositions[lineIdx + 2] = nPos[idxI + 2];
            lineColors[lineIdx] = cGold.r * alpha;
            lineColors[lineIdx + 1] = cGold.g * alpha;
            lineColors[lineIdx + 2] = cGold.b * alpha;

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

      // --- Animate Stardust ---
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
      halo1Geo.dispose();
      haloMatGold.dispose();
      halo2Geo.dispose();
      haloMatSapphire.dispose();
      halo3Geo.dispose();
      haloMatChampagne.dispose();
      icoGeo.dispose();
      icoWireMat.dispose();
      innerGemGeo.dispose();
      innerGemMat.dispose();
      gRingMatGold.dispose();
      gRingMatSapphire.dispose();
      gRing1.geometry.dispose();
      gRing2.geometry.dispose();
      gRing3.geometry.dispose();
      gCore.geometry.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      dodecaMesh.geometry.dispose();
      dodecaMat.dispose();
      dodecaWire.geometry.dispose();
      dodecaWireMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      waveGeo.dispose();
      wavePointsMat.dispose();
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
