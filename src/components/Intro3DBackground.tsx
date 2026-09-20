import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates an ultra-crisp circular glow texture for synaptic data pulses
 */
function createGlowTexture(): THREE.CanvasTexture {
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

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);

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
    // 1. LIGHTING SETUP (High Specular for Metallic Pop)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFDF5, 1.8);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.8);
    goldKeyLight.position.set(18, 22, 18);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 3.2);
    sapphireRimLight.position.set(-18, -14, 14);
    scene.add(sapphireRimLight);

    const frontSun = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    frontSun.position.set(0, 10, 20);
    scene.add(frontSun);

    // Dynamic point light tracking cursor
    const cursorLight = new THREE.PointLight(0xFFE58F, 4.5, 35);
    cursorLight.position.set(0, 0, 14);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // 2. THE 3D COLLABORATION CORE: HUMAN BRAIN × ROBOT AI MATRIX
    // ─────────────────────────────────────────────────────────────
    const collaborationModel = new THREE.Group();
    collaborationModel.position.set(0, 0, -5);
    scene.add(collaborationModel);

    // Shared Materials
    const goldBrainMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.88,
      roughness: 0.22,
      transparent: true,
      opacity: 0.85,
    });

    const goldWireMat = new THREE.MeshBasicMaterial({
      color: 0xF5E0B8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    const robotSapphireMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.94,
      roughness: 0.16,
      transparent: true,
      opacity: 0.85,
    });

    const robotNavyMat = new THREE.MeshStandardMaterial({
      color: 0x002137,
      metalness: 0.92,
      roughness: 0.20,
      transparent: true,
      opacity: 0.85,
    });

    const goldPistonMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.96,
      roughness: 0.12,
    });

    const coreGlowMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 1.0,
      metalness: 0.9,
      roughness: 0.1,
    });

    // ── LEFT HEMISPHERE: ORGANIC HUMAN BRAIN ──
    const humanBrain = new THREE.Group();
    humanBrain.position.set(-0.2, 0, 0);
    collaborationModel.add(humanBrain);

    // Frontal Lobe (Organic curved ellipsoid)
    const frontalLobe = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 24), goldBrainMat);
    frontalLobe.scale.set(0.95, 1.2, 0.9);
    frontalLobe.position.set(-2.2, 1.2, 0.5);
    humanBrain.add(frontalLobe);

    const frontalWire = new THREE.Mesh(new THREE.SphereGeometry(3.65, 16, 16), goldWireMat);
    frontalWire.scale.copy(frontalLobe.scale);
    frontalWire.position.copy(frontalLobe.position);
    humanBrain.add(frontalWire);

    // Parietal & Occipital Lobes
    const parietalLobe = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 24), goldBrainMat);
    parietalLobe.scale.set(0.9, 1.15, 1.0);
    parietalLobe.position.set(-2.0, -1.0, -0.4);
    humanBrain.add(parietalLobe);

    const parietalWire = new THREE.Mesh(new THREE.SphereGeometry(3.45, 16, 16), goldWireMat);
    parietalWire.scale.copy(parietalLobe.scale);
    parietalWire.position.copy(parietalLobe.position);
    humanBrain.add(parietalWire);

    // Temporal Lobe
    const temporalLobe = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 20), goldBrainMat);
    temporalLobe.scale.set(1.0, 0.85, 1.1);
    temporalLobe.position.set(-3.2, -0.6, 0.6);
    humanBrain.add(temporalLobe);

    // Cerebellum
    const cerebellum = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16), goldBrainMat);
    cerebellum.scale.set(1.1, 0.7, 0.9);
    cerebellum.position.set(-2.2, -2.8, -0.8);
    humanBrain.add(cerebellum);

    // Luminous Neural Synaptic Points along the Human Brain
    const synCount = 32;
    const synGeo = new THREE.BufferGeometry();
    const synPositions = new Float32Array(synCount * 3);
    for (let i = 0; i < synCount; i++) {
      const idx = i * 3;
      const angle = (i / synCount) * Math.PI * 2;
      const rad = 2.4 + Math.random() * 2.2;
      synPositions[idx] = -1.0 - Math.cos(angle) * rad * 0.9;
      synPositions[idx + 1] = Math.sin(angle) * rad * 1.1;
      synPositions[idx + 2] = (Math.random() - 0.5) * 3.2;
    }
    synGeo.setAttribute('position', new THREE.BufferAttribute(synPositions, 3));
    const synMat = new THREE.PointsMaterial({
      size: 0.55,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const synPoints = new THREE.Points(synGeo, synMat);
    humanBrain.add(synPoints);

    // ── RIGHT HEMISPHERE: CYBERNETIC ROBOT CHASSIS & AI CORE ──
    const robotChassis = new THREE.Group();
    robotChassis.position.set(0.2, 0, 0);
    collaborationModel.add(robotChassis);

    // Upper Cranial Shield (Geometric beveled sapphire plates)
    const upperShield = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 3.4), robotSapphireMat);
    upperShield.position.set(2.0, 1.1, 0.3);
    upperShield.rotation.z = -0.15;
    robotChassis.add(upperShield);

    // Lower Mechanical Chassis Plate
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.8, 3.2), robotNavyMat);
    lowerChassis.position.set(2.2, -1.2, -0.2);
    lowerChassis.rotation.z = 0.12;
    robotChassis.add(lowerChassis);

    // Cybernetic Optical Sensor / Visor Ring
    const visorTorus = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 16, 32), goldPistonMat);
    visorTorus.position.set(3.4, 0.6, 1.2);
    visorTorus.rotation.y = Math.PI / 3.5;
    robotChassis.add(visorTorus);

    // Glowing Optical AI Lens inside visor
    const opticalCore = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 20), coreGlowMat);
    opticalCore.position.set(3.3, 0.6, 1.1);
    robotChassis.add(opticalCore);

    // Mechanical Hydraulic Actuators & Cooling Ribs
    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.25), goldPistonMat);
      rib.position.set(3.8, -0.8 - i * 0.6, -0.4 + i * 0.3);
      robotChassis.add(rib);
    }

    // ── CENTRAL COLLABORATION ZONE: SYNAPTIC DATA BRIDGES ──
    const bridgeGroup = new THREE.Group();
    collaborationModel.add(bridgeGroup);

    // Center Core Reactor bridging Human & AI
    const fusionCore = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), coreGlowMat);
    fusionCore.position.set(0, 0, 0.2);
    bridgeGroup.add(fusionCore);

    // Connecting Synaptic Bridges (Golden and Sapphire Arcs)
    const bridgeCount = 10;
    const bridgeLinesGeo = new THREE.BufferGeometry();
    const bridgePositions = new Float32Array(bridgeCount * 6);
    const bridgeColors = new Float32Array(bridgeCount * 6);

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');

    for (let i = 0; i < bridgeCount; i++) {
      const idx = i * 6;
      const yPos = -2.5 + (i / (bridgeCount - 1)) * 5.0;

      // Left Human anchor
      bridgePositions[idx] = -1.2;
      bridgePositions[idx + 1] = yPos;
      bridgePositions[idx + 2] = (Math.random() - 0.5) * 1.5;
      bridgeColors[idx] = cGold.r;
      bridgeColors[idx + 1] = cGold.g;
      bridgeColors[idx + 2] = cGold.b;

      // Right Robot anchor
      bridgePositions[idx + 3] = 1.2;
      bridgePositions[idx + 4] = yPos + (Math.random() - 0.5) * 0.4;
      bridgePositions[idx + 5] = bridgePositions[idx + 2];
      bridgeColors[idx + 3] = cSapphire.r;
      bridgeColors[idx + 4] = cSapphire.g;
      bridgeColors[idx + 5] = cSapphire.b;
    }

    bridgeLinesGeo.setAttribute('position', new THREE.BufferAttribute(bridgePositions, 3));
    bridgeLinesGeo.setAttribute('color', new THREE.BufferAttribute(bridgeColors, 3));

    const bridgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const bridgeLines = new THREE.LineSegments(bridgeLinesGeo, bridgeMat);
    bridgeGroup.add(bridgeLines);

    // ─────────────────────────────────────────────────────────────
    // 3. CELESTIAL SACRED GIMBAL RINGS (Orbiting the Brain-Robot Model)
    // ─────────────────────────────────────────────────────────────
    const haloGroup = new THREE.Group();
    collaborationModel.add(haloGroup);

    // Outer Thin Gold Orbit
    const ring1Geo = new THREE.TorusGeometry(8.5, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = 1.15;
    ring1.rotation.y = 0.35;
    haloGroup.add(ring1);

    // Mid Sapphire Orbit
    const ring2Geo = new THREE.TorusGeometry(6.8, 0.06, 16, 90);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -0.75;
    ring2.rotation.y = 0.85;
    haloGroup.add(ring2);

    // Orbiting Satellites on the Halos
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    for (let i = 0; i < 4; i++) {
      const parent = i % 2 === 0 ? ring1 : ring2;
      const radius = i % 2 === 0 ? 8.5 : 6.8;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xDFB74A : 0x0088CC,
        emissive: i % 2 === 0 ? 0xDFB74A : 0x004B79,
        emissiveIntensity: 0.9,
        metalness: 0.95,
        roughness: 0.1,
      });
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), satMat);
      parent.add(satMesh);
      satellites.push({
        mesh: satMesh,
        radius,
        speed: (0.4 + i * 0.15) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 4) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING GOLDEN STARDUST (Ambient Micro-Photons)
    // ─────────────────────────────────────────────────────────────
    const dustCount = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 44;
      dustPos[idx + 1] = (Math.random() - 0.5) * 28;
      dustPos[idx + 2] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.42,
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
      camera.position.x = mx * 3.5;
      camera.position.y = my * 2.5;
      camera.lookAt(0, 0, 0);

      // Point light follows cursor
      cursorLight.position.set(mx * 16, my * 12, 10);
      cursorLight.intensity = 4.5 + pulse * 5.0;

      // --- Model Kinematics (Human × Robot Collaboration) ---
      // Gentle floating rotation and mouse tilt
      collaborationModel.rotation.y = elapsed * 0.25 + mx * 0.45;
      collaborationModel.rotation.x = Math.sin(elapsed * 0.3) * 0.06 - my * 0.35;
      collaborationModel.position.y = Math.sin(elapsed * 1.2) * 0.35;

      // Fusion Core Breathing & Click Pulse
      const coreScale = 1.0 + Math.sin(elapsed * 3.5) * 0.12 + pulse * 1.6;
      fusionCore.scale.set(coreScale, coreScale, coreScale);

      // Orbiting rings animation
      ring1.rotation.z = elapsed * 0.08;
      ring2.rotation.z = -elapsed * 0.11;

      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.018;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

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
      dustGeo.dispose();
      dustMat.dispose();
      synGeo.dispose();
      synMat.dispose();
      bridgeLinesGeo.dispose();
      bridgeMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-1200 ease-out ${isIntroComplete
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-98 pointer-events-none invisible'
        }`}
      aria-hidden="true"
    />
  );
};
