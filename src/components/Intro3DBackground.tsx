import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates an ultra-crisp circular glow texture for stardust particles
 */
function createCrispGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 230, 160, 0.95)');
    gradient.addColorStop(0.55, 'rgba(223, 183, 74, 0.7)');
    gradient.addColorStop(0.85, 'rgba(0, 75, 121, 0.25)');
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
    clickPulse: 0,
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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const glowTexture = createCrispGlowTexture();

    // ─────────────────────────────────────────────────────────────
    // 1. LIGHTING
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFDF5, 1.8);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.2);
    goldKeyLight.position.set(20, 25, 20);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 2.5);
    sapphireRimLight.position.set(-20, -15, 12);
    scene.add(sapphireRimLight);

    // Interactive cursor light
    const cursorLight = new THREE.PointLight(0xFFE58F, 3.5, 40);
    cursorLight.position.set(0, 0, 14);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL HOROLOGICAL HALO RINGS (Minimal, Elegant, Framing)
    // ─────────────────────────────────────────────────────────────
    const ringsGroup = new THREE.Group();
    ringsGroup.position.set(0, 0, -6);
    scene.add(ringsGroup);

    // Outer Thin Gold Orbit
    const ring1Geo = new THREE.TorusGeometry(21.0, 0.08, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = 1.15;
    ring1.rotation.y = 0.35;
    ringsGroup.add(ring1);

    // Mid Thin Sapphire Orbit
    const ring2Geo = new THREE.TorusGeometry(16.5, 0.065, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -0.75;
    ring2.rotation.y = 0.85;
    ringsGroup.add(ring2);

    // 4 Tiny Gliding Satellites
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    for (let i = 0; i < 4; i++) {
      const parent = i % 2 === 0 ? ring1 : ring2;
      const radius = i % 2 === 0 ? 21.0 : 16.5;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xDFB74A : 0x0088CC,
        emissive: i % 2 === 0 ? 0xDFB74A : 0x004B79,
        emissiveIntensity: 0.9,
        metalness: 0.95,
        roughness: 0.1,
      });
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), satMat);
      parent.add(satMesh);
      satellites.push({
        mesh: satMesh,
        radius,
        speed: (0.35 + i * 0.15) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 4) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. ELEGANT 3D NEURAL CONSTELLATION NODES & SYNAPSES
    // ─────────────────────────────────────────────────────────────
    const nodeCount = 50;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');
    const cNavy = new THREE.Color('#002137');

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      // Periphery distribution: leaving the center open for title & logo
      const angle = Math.random() * Math.PI * 2;
      const dist = 8.5 + Math.random() * 20.0;
      nodePositions[idx] = Math.cos(angle) * dist;
      nodePositions[idx + 1] = Math.sin(angle) * dist * 0.72;
      nodePositions[idx + 2] = (Math.random() - 0.5) * 14.0;

      const col = new THREE.Color();
      if (i % 3 === 0) col.copy(cGold);
      else if (i % 3 === 1) col.copy(cSapphire);
      else col.copy(cNavy);

      nodeColors[idx] = col.r;
      nodeColors[idx + 1] = col.g;
      nodeColors[idx + 2] = col.b;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.65,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // Dynamic Connecting Lines
    const maxLines = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING GOLDEN AMBIENT STARDUST
    // ─────────────────────────────────────────────────────────────
    const dustCount = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 48;
      dustPos[idx + 1] = (Math.random() - 0.5) * 32;
      dustPos[idx + 2] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.4,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.6,
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
      mouseRef.current.clickPulse = 1.0;
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
    // ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      if (mouseRef.current.clickPulse > 0.01) {
        mouseRef.current.clickPulse *= 0.94;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const pulse = mouseRef.current.clickPulse;

      // Authentic 3D Camera Parallax
      camera.position.x = mx * 3.8;
      camera.position.y = my * 2.8;
      camera.lookAt(0, 0, 0);

      // Point light follows cursor
      cursorLight.position.set(mx * 16, my * 12, 10);
      cursorLight.intensity = 3.5 + pulse * 4.0;

      // Rotate celestial rings
      ring1.rotation.z = elapsed * 0.07 + mx * 0.12;
      ring1.rotation.x = 1.15 + my * 0.10;
      ring2.rotation.z = -elapsed * 0.09 - mx * 0.14;
      ring2.rotation.y = 0.85 + my * 0.12;

      // Animate satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.016;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

      // Animate Constellation Nodes
      const nPos = nodeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        nPos[idx] += nodeVelocities[i].x;
        nPos[idx + 1] += nodeVelocities[i].y;
        nPos[idx + 2] += nodeVelocities[i].z;

        if (Math.abs(nPos[idx]) > 24) nodeVelocities[i].x *= -1;
        if (Math.abs(nPos[idx + 1]) > 16) nodeVelocities[i].y *= -1;
        if (Math.abs(nPos[idx + 2]) > 10) nodeVelocities[i].z *= -1;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Update connecting synaptic lines
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

      // Floating dust drift
      dustMesh.rotation.y = elapsed * 0.015 + mx * 0.03;
      dustMesh.rotation.x = elapsed * 0.01 - my * 0.03;

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
      satellites.forEach((sat) => sat.mesh.geometry.dispose());
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
