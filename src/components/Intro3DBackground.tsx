import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Intro3DBackgroundProps {
  stage?: string; // 'walking' | 'handshake' | 'fadeCharacters' | 'titleReveal' | 'completed'
}

/**
 * Generates an ultra-soft circular glow texture for subtle ambient dust motes
 */
function createSoftGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 245, 215, 0.95)');
    gradient.addColorStop(0.3, 'rgba(223, 183, 74, 0.45)');
    gradient.addColorStop(0.7, 'rgba(223, 183, 74, 0.1)');
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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const softGlowTexture = createSoftGlowTexture();

    // ─────────────────────────────────────────────────────────────
    // REFINED, CLEAN, MINIMALIST 3D LIQUID SILK SHADER
    // Pure, elegant, organic liquid satin without noisy lines or clutter
    // ─────────────────────────────────────────────────────────────
    const silkVertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uRipple;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Broad, slow, graceful rolling waves (calm silk folds, low frequency)
        float t = uTime * 0.45;
        float w1 = sin(pos.x * 0.07 + t * 1.1) * cos(pos.y * 0.08 + t * 0.8) * 2.4;
        float w2 = sin((pos.x + pos.y) * 0.05 + t * 1.2) * 1.4;
        float w3 = cos(length(pos.xy) * 0.04 - t * 0.7) * 0.9;

        // Subtle interactive mouse wake (gentle fluid swell)
        vec2 mouseWorld = uMouse * vec2(28.0, 18.0);
        float distToMouse = length(pos.xy - mouseWorld);
        float mouseWave = sin(distToMouse * 0.28 - uTime * 2.5) * exp(-distToMouse * 0.09) * 1.8;

        // Soft click ripple
        float shockwave = sin(distToMouse * 0.45 - uTime * 5.0) * uRipple * exp(-distToMouse * 0.06) * 3.0;

        // Generous central clearing: keep the title and logo area calm and flat
        float centerDist = length(pos.xy);
        float centerMask = smoothstep(6.0, 26.0, centerDist);

        float elevation = (w1 + w2 + w3 + mouseWave + shockwave) * (centerMask * 0.85 + 0.15);

        pos.z += elevation;
        vElevation = elevation;
        vPosition = pos;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const silkFragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vElevation;

      void main() {
        // Compute normal from screen derivatives for smooth physical lighting
        vec3 fdx = dFdx(vPosition);
        vec3 fdy = dFdy(vPosition);
        vec3 normal = normalize(cross(fdx, fdy));

        // Refined Directional Lights
        vec3 lightDir1 = normalize(vec3(0.5, 0.7, 0.6));   // Warm Royal Gold Key Light
        vec3 lightDir2 = normalize(vec3(-0.5, -0.4, 0.5)); // Celestial Sapphire Fill Light

        // Diffuse
        float diff1 = max(dot(normal, lightDir1), 0.0);
        float diff2 = max(dot(normal, lightDir2), 0.0);

        // Blinn-Phong specular (Molten gold sheen on wave crests)
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(normal, halfDir1), 0.0), 28.0);

        // Soft Fresnel rim glow
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

        // Luxury MANTIF Palette
        vec3 cAlabaster = vec3(0.98, 0.973, 0.961); // #FAF8F5 (Clean Cream Base)
        vec3 cGold      = vec3(0.875, 0.718, 0.290); // #DFB74A (Royal Gold)
        vec3 cChampagne = vec3(0.96, 0.88, 0.72);    // #F5E0B8 (Luminous Champagne)
        vec3 cSapphire  = vec3(0.0, 0.294, 0.475);   // #004B79 (Celestial Sapphire)

        // Smooth, subtle color gradient (NO harsh lines, NO zebra stripes)
        float normElev = clamp((vElevation + 3.0) / 6.0, 0.0, 1.0);
        vec3 baseColor = mix(cAlabaster, cChampagne, normElev * 0.45);
        baseColor = mix(baseColor, cSapphire, (1.0 - normElev) * 0.12);

        // Composite smooth lighting
        vec3 finalColor = baseColor * (0.92 + diff1 * 0.22 + diff2 * 0.15);
        finalColor += cGold * spec1 * 0.35;         // Subtle golden sheen
        finalColor += cChampagne * fresnel * 0.25;  // Velvet rim

        // Center legibility protection: perfectly blend to clean Alabaster cream
        float centerDist = length(vPosition.xy);
        float centerSoft = smoothstep(0.0, 24.0, centerDist);
        finalColor = mix(cAlabaster, finalColor, centerSoft * 0.85);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const silkUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRipple: { value: 0 },
    };

    // Subdivided 3D mesh covering the entire screen
    const silkGeo = new THREE.PlaneGeometry(105, 75, 120, 90);
    const silkMat = new THREE.ShaderMaterial({
      vertexShader: silkVertexShader,
      fragmentShader: silkFragmentShader,
      uniforms: silkUniforms,
      depthWrite: true,
    });
    const silkMesh = new THREE.Mesh(silkGeo, silkMat);
    silkMesh.position.set(0, 0, -6);
    scene.add(silkMesh);

    // ─────────────────────────────────────────────────────────────
    // DELICATE, REFINED FLOATING GOLDEN AMBIENT DUST (30 motes)
    // ─────────────────────────────────────────────────────────────
    const dustCount = 32;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPos[idx] = (Math.random() - 0.5) * 50;
      dustPos[idx + 1] = (Math.random() - 0.5) * 34;
      dustPos[idx + 2] = (Math.random() - 0.5) * 16 + 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.45,
      map: softGlowTexture,
      color: 0xDFB74A,
      transparent: true,
      opacity: 0.5,
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
      mouseRef.current.clickRipple = 0.8;
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
    // CLEAN, SMOOTH ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      if (mouseRef.current.clickRipple > 0.01) {
        mouseRef.current.clickRipple *= 0.95;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ripple = mouseRef.current.clickRipple;

      // Subtle, calm 3D camera parallax
      camera.position.x = mx * 3.2;
      camera.position.y = my * 2.4;
      camera.lookAt(0, 0, 0);

      // Pass uniforms to Liquid Silk
      silkUniforms.uTime.value = elapsed;
      silkUniforms.uMouse.value.set(mx, my);
      silkUniforms.uRipple.value = ripple;

      // Gentle dust drift
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

      softGlowTexture.dispose();
      silkGeo.dispose();
      silkMat.dispose();
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
