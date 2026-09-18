import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Creates a luminous particle sprite texture for the spark between fingertips
 */
function createSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 230, 150, 0.95)');
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
    camera.position.set(0, 0, 34);

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

    const sparkTexture = createSparkTexture();

    // ─────────────────────────────────────────────────────────────
    // 1. LIGHTING SETUP (High Specular Reflections)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFDF5, 1.9);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.6);
    goldKeyLight.position.set(18, 22, 18);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 3.2);
    sapphireRimLight.position.set(-18, -14, 14);
    scene.add(sapphireRimLight);

    const frontLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    frontLight.position.set(0, 10, 20);
    scene.add(frontLight);

    // Dynamic light tracking cursor
    const cursorLight = new THREE.PointLight(0xFFE58F, 4.0, 35);
    cursorLight.position.set(0, 0, 14);
    scene.add(cursorLight);

    // ─────────────────────────────────────────────────────────────
    // 2. LEFT: 3D HUMAN HAND (Organic Sculptural Ivory & Gold)
    // ─────────────────────────────────────────────────────────────
    const humanHand = new THREE.Group();
    humanHand.position.set(-15.5, -0.5, -4);
    scene.add(humanHand);

    const humanSkinMat = new THREE.MeshStandardMaterial({
      color: 0xF3ECE2,
      roughness: 0.28,
      metalness: 0.35,
    });

    const humanGoldMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      roughness: 0.16,
      metalness: 0.95,
    });

    const humanWireMat = new THREE.MeshBasicMaterial({
      color: 0xDFB74A,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // Human Forearm
    const humanForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2.1, 11, 24),
      humanSkinMat
    );
    humanForearm.rotation.z = Math.PI / 2.25;
    humanForearm.position.set(-8.5, -1.8, 0);
    humanHand.add(humanForearm);

    // Golden Bracelet / Interface at wrist
    const humanBracelet = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.18, 16, 32),
      humanGoldMat
    );
    humanBracelet.rotation.y = Math.PI / 2;
    humanBracelet.position.set(-4.8, -0.7, 0);
    humanHand.add(humanBracelet);

    // Human Palm
    const humanPalm = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 3.0, 1.3),
      humanSkinMat
    );
    humanPalm.position.set(-3.0, -0.3, 0);
    humanPalm.rotation.z = 0.12;
    humanHand.add(humanPalm);

    // Subtle golden wireframe overlay on palm
    const humanPalmWire = new THREE.Mesh(
      new THREE.BoxGeometry(4.08, 3.08, 1.38),
      humanWireMat
    );
    humanPalmWire.position.copy(humanPalm.position);
    humanPalmWire.rotation.copy(humanPalm.rotation);
    humanHand.add(humanPalmWire);

    // Helper to generate a human finger
    const buildHumanFinger = (
      baseX: number,
      baseY: number,
      baseZ: number,
      lengths: number[],
      angles: number[],
      rotY: number = 0
    ) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(baseX, baseY, baseZ);
      fingerGroup.rotation.y = rotY;

      let currentParent = fingerGroup;
      lengths.forEach((len, idx) => {
        const phalanx = new THREE.Group();
        const rTop = 0.36 - idx * 0.05;
        const rBot = 0.40 - idx * 0.05;
        const boneMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(rTop, rBot, len, 16),
          humanSkinMat
        );
        boneMesh.position.y = len / 2;
        phalanx.add(boneMesh);

        // Golden knuckle bead
        const jointMesh = new THREE.Mesh(
          new THREE.SphereGeometry(rBot, 12, 12),
          humanGoldMat
        );
        phalanx.add(jointMesh);

        phalanx.rotation.z = angles[idx];
        currentParent.add(phalanx);

        const nextAnchor = new THREE.Group();
        nextAnchor.position.y = len;
        phalanx.add(nextAnchor);
        currentParent = nextAnchor;
      });

      humanHand.add(fingerGroup);
      return fingerGroup;
    };

    // Fingers in Michelangelo's "Creation of Adam" pose: Index points forward, others relaxed
    // Index finger extending towards center
    buildHumanFinger(-1.0, 0.45, 0.15, [2.3, 1.8, 1.4], [Math.PI / 2.05, 0.04, 0.04]);
    // Middle finger (curled slightly back)
    buildHumanFinger(-1.0, 0.1, -0.2, [2.3, 1.7, 1.3], [Math.PI / 2.35, 0.28, 0.35]);
    // Ring finger (curled back)
    buildHumanFinger(-1.1, -0.3, -0.55, [2.0, 1.5, 1.1], [Math.PI / 2.55, 0.38, 0.45]);
    // Pinky finger (curled back)
    buildHumanFinger(-1.2, -0.65, -0.85, [1.6, 1.2, 0.9], [Math.PI / 2.75, 0.45, 0.55]);
    // Thumb (reaching upward and outward)
    buildHumanFinger(-3.6, 0.7, 0.65, [1.7, 1.3], [Math.PI / 3.3, -0.15], 0.35);

    // ─────────────────────────────────────────────────────────────
    // 3. RIGHT: 3D CYBERNETIC ROBOT HAND (Sapphire, Navy & Gold)
    // ─────────────────────────────────────────────────────────────
    const robotHand = new THREE.Group();
    robotHand.position.set(15.5, -0.5, -4);
    scene.add(robotHand);

    const robotSapphireMat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      roughness: 0.15,
      metalness: 0.94,
    });

    const robotNavyMat = new THREE.MeshStandardMaterial({
      color: 0x002137,
      roughness: 0.2,
      metalness: 0.92,
    });

    const robotGoldMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      roughness: 0.12,
      metalness: 0.96,
    });

    const robotCoreMat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      emissive: 0xDFB74A,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.95,
    });

    // Robotic Forearm (Octagonal Arm Sleeve)
    const robotForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.2, 11, 8),
      robotNavyMat
    );
    robotForearm.rotation.z = -Math.PI / 2.25;
    robotForearm.position.set(8.5, -1.8, 0);
    robotHand.add(robotForearm);

    // Hydraulic Gold Pistons along forearm
    const piston1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 9, 12),
      robotGoldMat
    );
    piston1.rotation.z = -Math.PI / 2.25;
    piston1.position.set(8.5, -1.1, 0.9);
    robotHand.add(piston1);

    const piston2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 9, 12),
      robotGoldMat
    );
    piston2.rotation.z = -Math.PI / 2.25;
    piston2.position.set(8.5, -2.5, -0.9);
    robotHand.add(piston2);

    // Wrist Gimbal Joint
    const robotWrist = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.22, 16, 32),
      robotGoldMat
    );
    robotWrist.rotation.y = Math.PI / 2;
    robotWrist.position.set(4.8, -0.7, 0);
    robotHand.add(robotWrist);

    // Robotic Palm (Segmented Sapphire Chassis)
    const robotPalm = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 3.0, 1.3),
      robotSapphireMat
    );
    robotPalm.position.set(3.0, -0.3, 0);
    robotPalm.rotation.z = -0.12;
    robotHand.add(robotPalm);

    // Glowing core reactor in center of robotic palm
    const palmReactor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 1.4, 16),
      robotCoreMat
    );
    palmReactor.rotation.x = Math.PI / 2;
    palmReactor.position.set(3.0, -0.3, 0);
    robotHand.add(palmReactor);

    // Helper to generate an articulated robotic finger
    const buildRobotFinger = (
      baseX: number,
      baseY: number,
      baseZ: number,
      lengths: number[],
      angles: number[],
      rotY: number = 0
    ) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(baseX, baseY, baseZ);
      fingerGroup.rotation.y = rotY;

      let currentParent = fingerGroup;
      lengths.forEach((len, idx) => {
        const phalanx = new THREE.Group();
        const w = 0.72 - idx * 0.08;
        const d = 0.62 - idx * 0.06;

        // Mechanical Armor Segment
        const plateMesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, len, d),
          idx % 2 === 0 ? robotSapphireMat : robotNavyMat
        );
        plateMesh.position.y = len / 2;
        phalanx.add(plateMesh);

        // Cylindrical Knuckle Bolt (Gold)
        const boltMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38 - idx * 0.04, 0.38 - idx * 0.04, w + 0.15, 12),
          robotGoldMat
        );
        boltMesh.rotation.z = Math.PI / 2;
        phalanx.add(boltMesh);

        // Glowing fingertip sensor
        if (idx === lengths.length - 1) {
          const tipSensor = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 12, 12),
            robotCoreMat
          );
          tipSensor.position.y = len;
          phalanx.add(tipSensor);
        }

        phalanx.rotation.z = angles[idx];
        currentParent.add(phalanx);

        const nextAnchor = new THREE.Group();
        nextAnchor.position.y = len;
        phalanx.add(nextAnchor);
        currentParent = nextAnchor;
      });

      robotHand.add(fingerGroup);
      return fingerGroup;
    };

    // Robot Fingers extending left towards human hand
    // Index (Extended forward towards center)
    buildRobotFinger(1.0, 0.45, 0.15, [2.3, 1.8, 1.4], [-Math.PI / 2.05, -0.04, -0.04]);
    // Middle
    buildRobotFinger(1.0, 0.1, -0.2, [2.3, 1.7, 1.3], [-Math.PI / 2.35, -0.28, -0.35]);
    // Ring
    buildRobotFinger(1.1, -0.3, -0.55, [2.0, 1.5, 1.1], [-Math.PI / 2.55, -0.38, -0.45]);
    // Pinky
    buildRobotFinger(1.2, -0.65, -0.85, [1.6, 1.2, 0.9], [-Math.PI / 2.75, -0.45, -0.55]);
    // Thumb
    buildRobotFinger(3.6, 0.7, 0.65, [1.7, 1.3], [-Math.PI / 3.3, 0.15], -0.35);

    // ─────────────────────────────────────────────────────────────
    // 4. CENTRAL TOUCH ENERGY SPARK (Between Fingertips)
    // ─────────────────────────────────────────────────────────────
    const sparkGroup = new THREE.Group();
    sparkGroup.position.set(0, 0.5, -4);
    scene.add(sparkGroup);

    // Glowing core sphere
    const coreSpark = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xDFB74A,
        emissive: 0xDFB74A,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      })
    );
    sparkGroup.add(coreSpark);

    // Ambient floating spark particles around the nexus
    const sparkParticleCount = 28;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkParticleCount * 3);
    for (let i = 0; i < sparkParticleCount; i++) {
      const idx = i * 3;
      const r = 0.6 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      sparkPositions[idx] = Math.cos(theta) * r;
      sparkPositions[idx + 1] = Math.sin(theta) * r * 0.7;
      sparkPositions[idx + 2] = (Math.random() - 0.5) * 2.0;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkPointsMat = new THREE.PointsMaterial({
      size: 0.55,
      map: sparkTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const sparkParticles = new THREE.Points(sparkGeo, sparkPointsMat);
    sparkGroup.add(sparkParticles);

    // ─────────────────────────────────────────────────────────────
    // 5. FLOATING GOLDEN AMBIENT STARDUST
    // ─────────────────────────────────────────────────────────────
    const dustCount = 40;
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
      size: 0.45,
      map: sparkTexture,
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
    // ANIMATION & KINEMATICS LOOP
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      if (mouseRef.current.clickPulse > 0.01) {
        mouseRef.current.clickPulse *= 0.92;
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
      cursorLight.intensity = 4.0 + pulse * 6.0;

      // --- Subtle Hand Gestures & Breathing ---
      // Human Hand (organic breathing)
      humanHand.position.y = -0.5 + Math.sin(elapsed * 1.2) * 0.25 + my * 0.8;
      humanHand.rotation.z = Math.sin(elapsed * 0.9) * 0.03 + mx * 0.06;
      humanHand.rotation.x = Math.cos(elapsed * 1.0) * 0.03 - my * 0.06;

      // Robot Hand (robotic micro-articulation)
      robotHand.position.y = -0.5 + Math.sin(elapsed * 1.2 + 0.8) * 0.25 + my * 0.8;
      robotHand.rotation.z = -Math.sin(elapsed * 0.9 + 0.5) * 0.03 + mx * 0.06;
      robotHand.rotation.x = -Math.cos(elapsed * 1.0 + 0.5) * 0.03 - my * 0.06;

      // Spark nexus breathing & pulse
      const sparkScale = 1.0 + Math.sin(elapsed * 3.0) * 0.15 + pulse * 1.8;
      coreSpark.scale.set(sparkScale, sparkScale, sparkScale);
      sparkParticles.rotation.z = elapsed * 0.4;

      // Floating stardust drift
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

      sparkTexture.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      sparkGeo.dispose();
      sparkPointsMat.dispose();
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
