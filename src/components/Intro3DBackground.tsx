import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Generates an ultra-crisp circular glow texture for stardust particles
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 235, 170, 0.95)');
    gradient.addColorStop(0.55, 'rgba(223, 183, 74, 0.8)');
    gradient.addColorStop(0.85, 'rgba(0, 75, 121, 0.3)');
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
    worldX: 0,
    worldY: 0,
    clickRipple: 0,
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

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 0, 38);

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
    // 1. SOTA AWWWARDS / PINTEREST: 3D KINETIC LIQUID SILK & TOPOGRAPHY SHADER
    // ─────────────────────────────────────────────────────────────
    const silkVertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uRipple;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vElevation;
      varying vec3 vWorldNormal;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Compound multi-frequency harmonic wave displacement
        float t = uTime * 0.85;
        float w1 = sin(pos.x * 0.12 + t * 1.2) * cos(pos.y * 0.14 + t * 0.9) * 3.8;
        float w2 = sin((pos.x + pos.y) * 0.1 + t * 1.4) * 2.2;
        float w3 = cos(length(pos.xy) * 0.08 - t * 0.8) * 1.6;

        // Interactive mouse wake wave
        vec2 mouseWorld = uMouse * vec2(30.0, 20.0);
        float distToMouse = length(pos.xy - mouseWorld);
        float mouseWave = sin(distToMouse * 0.35 - uTime * 3.5) * exp(-distToMouse * 0.08) * 3.2;

        // Interactive click shockwave
        float shockwave = sin(distToMouse * 0.55 - uTime * 7.0) * uRipple * exp(-distToMouse * 0.05) * 5.0;

        // Central clearing mask: keep center calm for crystal-clear typography
        float centerDist = length(pos.xy);
        float centerMask = smoothstep(5.0, 24.0, centerDist);

        float elevation = (w1 + w2 + w3 + mouseWave + shockwave) * (centerMask * 0.82 + 0.18);

        pos.z += elevation;
        vElevation = elevation;
        vPosition = pos;

        // Approximate normal
        vec3 displacedPos = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
      }
    `;

    const silkFragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vElevation;

      void main() {
        // High-precision normal via screen-space derivatives
        vec3 fdx = dFdx(vPosition);
        vec3 fdy = dFdy(vPosition);
        vec3 normal = normalize(cross(fdx, fdy));

        // Light sources
        vec3 lightDir1 = normalize(vec3(0.5, 0.8, 0.6));   // Royal Gold Key Light
        vec3 lightDir2 = normalize(vec3(-0.6, -0.4, 0.5)); // Celestial Sapphire Fill Light

        // Diffuse components
        float diff1 = max(dot(normal, lightDir1), 0.0);
        float diff2 = max(dot(normal, lightDir2), 0.0);

        // Specular reflections (Molten metallic sheen)
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(normal, halfDir1), 0.0), 32.0);

        // Fresnel edge sheen
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);

        // Luxury MANTIF Color Palette
        vec3 cAlabaster = vec3(0.98, 0.973, 0.961); // #FAF8F5
        vec3 cGold      = vec3(0.875, 0.718, 0.290); // #DFB74A
        vec3 cChampagne = vec3(0.96, 0.88, 0.72);    // #F5E0B8
        vec3 cSapphire  = vec3(0.0, 0.294, 0.475);   // #004B79
        vec3 cNavy      = vec3(0.0, 0.129, 0.216);   // #002137

        // Dynamic elevation color gradient
        float normElev = clamp((vElevation + 5.0) / 10.0, 0.0, 1.0);
        vec3 baseColor = mix(cSapphire, cAlabaster, smoothstep(0.1, 0.55, normElev));
        baseColor = mix(baseColor, cGold, smoothstep(0.5, 0.92, normElev) * 0.75);

        // Architectural Topographical Contour Lines (Pinterest signature aesthetic)
        float contour = abs(fract(vElevation * 0.28) - 0.5);
        float contourLine = smoothstep(0.08, 0.02, contour);
        vec3 contourColor = mix(cGold, cNavy, smoothstep(0.0, 0.7, normElev));

        // Composite shading
        vec3 finalColor = baseColor * (0.85 + diff1 * 0.35 + diff2 * 0.25);
        finalColor += cGold * spec1 * 0.55;             // Golden specular gleam
        finalColor += cChampagne * fresnel * 0.4;       // Velvet Fresnel rim
        finalColor = mix(finalColor, contourColor, contourLine * 0.45); // Golden contours

        // Center legibility protection: smoothly fade towards alabaster cream in middle
        float centerDist = length(vPosition.xy);
        float centerSoft = smoothstep(0.0, 22.0, centerDist);
        finalColor = mix(cAlabaster, finalColor, centerSoft * 0.82 + 0.18);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const silkUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRipple: { value: 0 },
    };

    // Subdivided 3D mesh that fills the full camera frustum
    const silkGeo = new THREE.PlaneGeometry(105, 75, 160, 120);
    const silkMat = new THREE.ShaderMaterial({
      vertexShader: silkVertexShader,
      fragmentShader: silkFragmentShader,
      uniforms: silkUniforms,
      wireframe: false,
      depthWrite: true,
    });
    const silkMesh = new THREE.Mesh(silkGeo, silkMat);
    silkMesh.position.set(0, 0, -8);
    scene.add(silkMesh);

    // ─────────────────────────────────────────────────────────────
    // 2. CELESTIAL SACRED ORBITS (Floating Golden Armillary Halo)
    // ─────────────────────────────────────────────────────────────
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 0, 4);
    scene.add(haloGroup);

    // Outer Thin Golden Orbit
    const ring1Geo = new THREE.TorusGeometry(23.0, 0.07, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xDFB74A,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = 1.15;
    ring1.rotation.y = 0.3;
    haloGroup.add(ring1);

    // Mid Sapphire Orbit
    const ring2Geo = new THREE.TorusGeometry(17.5, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x004B79,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -0.85;
    ring2.rotation.y = 0.7;
    haloGroup.add(ring2);

    // Orbiting Satellites along the rings
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; parent: THREE.Mesh }[] = [];
    for (let i = 0; i < 6; i++) {
      const parent = i % 2 === 0 ? ring1 : ring2;
      const radius = i % 2 === 0 ? 23.0 : 17.5;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xDFB74A : 0x0088CC,
        emissive: i % 2 === 0 ? 0xDFB74A : 0x004B79,
        emissiveIntensity: 0.9,
        metalness: 0.95,
        roughness: 0.1,
      });
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), satMat);
      parent.add(satMesh);
      satellites.push({
        mesh: satMesh,
        radius,
        speed: (0.4 + (i % 3) * 0.2) * (i % 2 === 0 ? 1 : -1),
        angle: (i / 6) * Math.PI * 2,
        parent,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. FLOATING 3D NEURAL CONSTELLATION & SYNAPTIC FILAMENTS
    // ─────────────────────────────────────────────────────────────
    const nodeCount = 55;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];

    const cGold = new THREE.Color('#DFB74A');
    const cSapphire = new THREE.Color('#004B79');
    const cNavy = new THREE.Color('#002137');

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const dist = 9.0 + Math.random() * 20.0;
      nodePositions[idx] = Math.cos(angle) * dist;
      nodePositions[idx + 1] = Math.sin(angle) * dist * 0.75;
      nodePositions[idx + 2] = 2.0 + (Math.random() - 0.5) * 12.0;

      const col = new THREE.Color();
      if (i % 3 === 0) col.copy(cGold);
      else if (i % 3 === 1) col.copy(cSapphire);
      else col.copy(cNavy);

      nodeColors[idx] = col.r;
      nodeColors[idx + 1] = col.g;
      nodeColors[idx + 2] = col.b;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.8,
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
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING GOLDEN STARDUST / MICRO-PHOTONS
    // ─────────────────────────────────────────────────────────────
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 55;
      dustPos[idx + 1] = (Math.random() - 0.5) * 38;
      dustPos[idx + 2] = (Math.random() - 0.5) * 20;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.45,
      map: glowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const dustMesh = new THREE.Points(dustGeo, dustMat);
    scene.add(dustMesh);

    // ─────────────────────────────────────────────────────────────
    // 5. LIGHTING FOR RINGS & SATELLITES
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xFFFDF5, 2.0);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xDFB74A, 3.8);
    goldKeyLight.position.set(20, 25, 20);
    scene.add(goldKeyLight);

    const sapphireRimLight = new THREE.DirectionalLight(0x004B79, 2.8);
    sapphireRimLight.position.set(-20, -15, 12);
    scene.add(sapphireRimLight);

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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.055;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.055;

      if (mouseRef.current.clickRipple > 0.01) {
        mouseRef.current.clickRipple *= 0.94;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ripple = mouseRef.current.clickRipple;

      // Dynamic 3D Camera Parallax
      camera.position.x = mx * 4.8;
      camera.position.y = my * 3.8;
      camera.lookAt(0, 0, 0);

      // Pass uniforms to Liquid Silk shader
      silkUniforms.uTime.value = elapsed;
      silkUniforms.uMouse.value.set(mx, my);
      silkUniforms.uRipple.value = ripple;

      // Animate Celestial Halos
      ring1.rotation.z = elapsed * 0.08 + mx * 0.15;
      ring1.rotation.x = 1.15 + my * 0.12;
      ring2.rotation.z = -elapsed * 0.11 - mx * 0.18;
      ring2.rotation.y = 0.7 + my * 0.15;

      haloGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.06;
      haloGroup.rotation.x = Math.cos(elapsed * 0.22) * 0.05;

      // Animate satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed * 0.018;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle) * sat.radius;
      });

      // Animate Constellation Nodes & Synaptic lines
      const nPos = nodeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        nPos[idx] += nodeVelocities[i].x;
        nPos[idx + 1] += nodeVelocities[i].y;
        nPos[idx + 2] += nodeVelocities[i].z;

        if (Math.abs(nPos[idx]) > 26) nodeVelocities[i].x *= -1;
        if (Math.abs(nPos[idx + 1]) > 17) nodeVelocities[i].y *= -1;
        if (Math.abs(nPos[idx + 2]) > 10) nodeVelocities[i].z *= -1;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Update dynamic connecting line segments
      let lineIdx = 0;
      const maxConnectDist = 7.0;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const idxI = i * 3;
          const idxJ = j * 3;

          const dx = nPos[idxI] - nPos[idxJ];
          const dy = nPos[idxI + 1] - nPos[idxJ + 1];
          const dz = nPos[idxI + 2] - nPos[idxJ + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDist) {
            const alpha = (1.0 - dist / maxConnectDist) * 0.6;

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

      // Animate Stardust
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
      silkGeo.dispose();
      silkMat.dispose();
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
