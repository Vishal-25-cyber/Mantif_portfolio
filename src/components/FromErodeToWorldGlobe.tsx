import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FromErodeToWorldGlobeProps {
  sceneIndex: number; // 1 to 9
  interactive?: boolean;
  isBlasting?: boolean;
}

interface HubCoordinate {
  name: string;
  lat: number;
  lon: number;
  color?: string;
  isOrigin?: boolean;
}

// Actual Geographic Coordinates
const ERODE_ORIGIN: HubCoordinate = {
  name: 'Erode, Tamil Nadu',
  lat: 11.3410,
  lon: 77.7172,
  color: '#DFB74A',
  isOrigin: true,
};

const GLOBAL_HUBS: HubCoordinate[] = [
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, color: '#38BDF8' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, color: '#38BDF8' },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, color: '#38BDF8' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#38BDF8' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, color: '#38BDF8' },
  { name: 'London', lat: 51.5074, lon: -0.1278, color: '#38BDF8' },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194, color: '#38BDF8' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: '#38BDF8' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#38BDF8' },
  { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, color: '#38BDF8' },
];

/**
 * Spherical coordinate projection
 */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Procedurally generate a high-definition digital Earth texture
 * with dark navy ocean, illuminated land continents, and golden/cyan city light clusters.
 */
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Deep space ocean base (rich illuminated midnight blue)
    ctx.fillStyle = '#061D36';
    ctx.fillRect(0, 0, width, height);

    // 2. Latitude & Longitude graticule lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += width / 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += height / 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Equator & Prime Meridian highlight
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 3. Procedural realistic continent landmasses (illuminated vibrant teal/slate)
    ctx.fillStyle = '#0D4876';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;

    const toX = (lon: number) => ((lon + 180) / 360) * width;
    const toY = (lat: number) => ((90 - lat) / 180) * height;

    // Approximate continent polygons for high-end digital cartography
    const continents: [number, number][][] = [
      // Indian Subcontinent (Detailed)
      [
        [8, 77.5], [11.34, 77.7], [13, 80.2], [17, 83.3], [21, 87], [22, 89],
        [26, 92], [28, 96], [28, 88], [31, 79], [34, 76], [32, 74],
        [28, 70], [24, 69], [22, 70], [20, 73], [15, 74], [11, 75.8], [8, 77.5]
      ],
      // Asia Main
      [
        [28, 96], [22, 105], [12, 108], [6, 102], [22, 115], [30, 122],
        [40, 128], [55, 135], [68, 175], [72, 130], [70, 75], [60, 60],
        [45, 50], [35, 60], [28, 70], [28, 96]
      ],
      // Europe
      [
        [36, -6], [43, -9], [48, -4], [52, 2], [58, 6], [62, 10],
        [70, 25], [68, 40], [55, 40], [45, 30], [40, 25], [38, 15],
        [36, -6]
      ],
      // Africa
      [
        [36, -6], [32, 25], [30, 32], [12, 44], [-12, 40], [-26, 33],
        [-34, 18], [-20, 12], [5, 2], [5, -10], [15, -17], [28, -13], [36, -6]
      ],
      // North America
      [
        [15, -92], [25, -80], [30, -82], [42, -70], [48, -65], [60, -64],
        [72, -90], [70, -140], [60, -165], [52, -130], [36, -122], [22, -105], [15, -92]
      ],
      // South America
      [
        [12, -72], [6, -55], [-5, -35], [-22, -41], [-54, -68],
        [-45, -75], [-20, -70], [-5, -80], [7, -78], [12, -72]
      ],
      // Australia
      [
        [-12, 130], [-15, 145], [-28, 153], [-38, 145], [-35, 115],
        [-22, 114], [-12, 130]
      ]
    ];

    continents.forEach((poly) => {
      ctx.beginPath();
      poly.forEach(([lat, lon], idx) => {
        const px = toX(lon);
        const py = toY(lat);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 4. Dot matrix micro-constellations across landmasses (glowing golden & cyan hubs)
    for (let i = 0; i < 3200; i++) {
      const lon = Math.random() * 360 - 180;
      const lat = Math.random() * 140 - 60;
      const px = toX(lon);
      const py = toY(lat);
      const size = Math.random() < 0.2 ? 2.5 : 1.5;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(223, 183, 74, 0.85)' : 'rgba(56, 189, 248, 0.75)';
      ctx.fillRect(px, py, size, size);
    }

    // 5. Bright golden beacon pinpoint at Erode
    const erodePx = toX(ERODE_ORIGIN.lon);
    const erodePy = toY(ERODE_ORIGIN.lat);

    // Concentric golden rings around Erode
    ctx.strokeStyle = '#DFB74A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(erodePx, erodePy, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(223, 183, 74, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(erodePx, erodePy, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(erodePx, erodePy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#DFB74A';
    ctx.fillText('ERODE · ORIGIN', erodePx + 14, erodePy + 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export const FromErodeToWorldGlobe: React.FC<FromErodeToWorldGlobeProps> = ({
  sceneIndex,
  interactive = true,
  isBlasting = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.002 });
  const globeGroupRef = useRef<THREE.Group | null>(null);

  const isBlastingRef = useRef(isBlasting);
  const wasBlastingRef = useRef(false);
  useEffect(() => {
    isBlastingRef.current = isBlasting;
  }, [isBlasting]);

  const interactiveRef = useRef(interactive);
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  const sceneIndexRef = useRef(sceneIndex);
  useEffect(() => {
    sceneIndexRef.current = sceneIndex;
  }, [sceneIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group containing entire earth + arcs
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. EARTH SPHERE
    // ─────────────────────────────────────────────────────────────
    const globeRadius = 4.2;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthTexture = createEarthCanvasTexture();

    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.55,
      metalness: 0.25,
      emissive: new THREE.Color(0x062444),
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 1,
    });

    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // ─────────────────────────────────────────────────────────────
    // 2. ATMOSPHERE FRESNEL GLOW
    // ─────────────────────────────────────────────────────────────
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity * 0.9 * uOpacity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // ─────────────────────────────────────────────────────────────
    // 3. ERODE GOLDEN ORIGIN PIN & BEACON
    // ─────────────────────────────────────────────────────────────
    const erodePos = latLonToVector3(ERODE_ORIGIN.lat, ERODE_ORIGIN.lon, globeRadius);

    // Golden core sphere
    const erodeCoreGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const erodeCoreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const erodeCoreMesh = new THREE.Mesh(erodeCoreGeo, erodeCoreMat);
    erodeCoreMesh.position.copy(erodePos);
    globeGroup.add(erodeCoreMesh);

    // Golden radar pulse ring
    const ringGeo = new THREE.RingGeometry(0.18, 0.42, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xDFB74A,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(erodePos);
    ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
    globeGroup.add(ringMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. GLOBAL CONNECTION ARCS & TRAVELING PHOTONS
    // ─────────────────────────────────────────────────────────────
    interface ArcData {
      curve: THREE.CubicBezierCurve3;
      photon: THREE.Mesh;
      progress: number;
      speed: number;
    }
    const arcs: ArcData[] = [];

    const photonGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
    });

    GLOBAL_HUBS.forEach((hub, idx) => {
      const hubPos = latLonToVector3(hub.lat, hub.lon, globeRadius);

      // Add small destination node
      const destGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const destMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
      const destMesh = new THREE.Mesh(destGeo, destMat);
      destMesh.position.copy(hubPos);
      globeGroup.add(destMesh);

      // Compute midpoint lifted into stratosphere for parabolic trajectory
      const mid = new THREE.Vector3().addVectors(erodePos, hubPos).multiplyScalar(0.5);
      const dist = erodePos.distanceTo(hubPos);
      const liftFactor = 1.0 + Math.min(dist / globeRadius, 1.2) * 0.45;
      mid.normalize().multiplyScalar(globeRadius * liftFactor);

      // Control points
      const cp1 = new THREE.Vector3().lerpVectors(erodePos, mid, 0.55).normalize().multiplyScalar(globeRadius * (liftFactor * 0.95));
      const cp2 = new THREE.Vector3().lerpVectors(mid, hubPos, 0.55).normalize().multiplyScalar(globeRadius * (liftFactor * 0.95));

      const curve = new THREE.CubicBezierCurve3(erodePos, cp1, cp2, hubPos);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      // Gradient arc material (gold near Erode, cyan towards destination)
      const arcMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0xDFB74A : 0x38BDF8,
        transparent: true,
        opacity: 0.55,
        linewidth: 1.5,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);

      // Photon light pulse traveling along arc
      const photon = new THREE.Mesh(photonGeo, photonMat.clone());
      globeGroup.add(photon);

      arcs.push({
        curve,
        photon,
        progress: (idx * 0.12) % 1,
        speed: 0.004 + (idx % 3) * 0.0015,
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 4.5. UNIQUE MULTI-DIMENSIONAL SUPERNOVA BLAST SYSTEM
    // ─────────────────────────────────────────────────────────────
    // A. Primary Gold Equatorial Shockwave Ring
    const goldShockwaveGeo = new THREE.RingGeometry(0.6, 1.8, 64);
    const goldShockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xDFB74A,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const goldShockwaveMesh = new THREE.Mesh(goldShockwaveGeo, goldShockwaveMat);
    scene.add(goldShockwaveMesh);

    // B. Secondary Cyan Quantum Orbital Shockwave Ring (Angled Gyroscopic Warp)
    const cyanShockwaveGeo = new THREE.RingGeometry(0.5, 1.6, 64);
    const cyanShockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cyanShockwaveMesh = new THREE.Mesh(cyanShockwaveGeo, cyanShockwaveMat);
    cyanShockwaveMesh.rotation.x = Math.PI * 0.38;
    cyanShockwaveMesh.rotation.z = Math.PI * 0.22;
    scene.add(cyanShockwaveMesh);

    // C. White-Hot Core Supernova Plasma Shell
    const coreNovaGeo = new THREE.RingGeometry(0.3, 1.2, 48);
    const coreNovaMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreNovaMesh = new THREE.Mesh(coreNovaGeo, coreNovaMat);
    scene.add(coreNovaMesh);

    // D. Radiant 3D Volumetric Spark Shards (Dynamically animated on blast)
    const sparkCount = 96;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkInitialPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      // Uniform spherical direction
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);

      // Initial positions on globe surface
      sparkInitialPositions[i * 3] = dx * globeRadius;
      sparkInitialPositions[i * 3 + 1] = dy * globeRadius;
      sparkInitialPositions[i * 3 + 2] = dz * globeRadius;

      sparkPositions[i * 3] = sparkInitialPositions[i * 3];
      sparkPositions[i * 3 + 1] = sparkInitialPositions[i * 3 + 1];
      sparkPositions[i * 3 + 2] = sparkInitialPositions[i * 3 + 2];

      // Explosive radial velocities with natural variance
      const speed = 14 + Math.random() * 22;
      sparkVelocities[i * 3] = dx * speed;
      sparkVelocities[i * 3 + 1] = dy * speed;
      sparkVelocities[i * 3 + 2] = dz * speed;

      // Color: alternating luminous Gold and Cyan
      if (i % 2 === 0) {
        sparkColors[i * 3] = 0.95;     // R (Gold)
        sparkColors[i * 3 + 1] = 0.78; // G
        sparkColors[i * 3 + 2] = 0.32; // B
      } else {
        sparkColors[i * 3] = 0.22;     // R (Cyan)
        sparkColors[i * 3 + 1] = 0.74; // G
        sparkColors[i * 3 + 2] = 0.98; // B
      }
    }

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPoints.visible = false;
    scene.add(sparkPoints);

    // ─────────────────────────────────────────────────────────────
    // 5. LIGHTING SETUP
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x60A5FA, 1.4);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xFFE082, 3.0);
    goldKeyLight.position.set(12, 10, 15);
    scene.add(goldKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38BDF8, 2.5);
    cyanRimLight.position.set(-15, -5, -10);
    scene.add(cyanRimLight);

    // Orient globe so India / Erode faces slightly forward towards camera
    globeGroup.rotation.y = -Math.PI * 0.42;
    globeGroup.rotation.x = 0.28;

    // ─────────────────────────────────────────────────────────────
    // 6. INTERACTIVE DRAG HANDLING
    // ─────────────────────────────────────────────────────────────
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactiveRef.current) return;
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      rotationVelocityRef.current = {
        x: deltaY * 0.004,
        y: deltaX * 0.004,
      };

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x += deltaY * 0.005;
      }

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // ─────────────────────────────────────────────────────────────
    // 7. ANIMATION LOOP WITH SCENE-RESPONSIVE INTERPOLATION
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    // Visibility observer to pause RAF when offscreen
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    });
    observer.observe(container);

    let blastElapsedTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Golden ring pulse at Erode
      const ringScale = 1.0 + Math.sin(elapsed * 4) * 0.35;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = 0.5 + Math.cos(elapsed * 4) * 0.4;

      // Animate traveling photons along arcs
      arcs.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1;
        const pt = arc.curve.getPointAt(arc.progress);
        arc.photon.position.copy(pt);
      });

      // Track start of blast for clean state initialization (blows strictly once)
      const isNowBlasting = isBlastingRef.current;
      if (isNowBlasting && !wasBlastingRef.current) {
        blastElapsedTime = 0;
        goldShockwaveMesh.scale.set(0.5, 0.5, 0.5);
        cyanShockwaveMesh.scale.set(0.4, 0.4, 0.4);
        coreNovaMesh.scale.set(0.2, 0.2, 0.2);
        goldShockwaveMat.opacity = 0;
        cyanShockwaveMat.opacity = 0;
        coreNovaMat.opacity = 0;

        // Reset spark positions
        const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        for (let i = 0; i < sparkCount * 3; i++) {
          posArr[i] = sparkInitialPositions[i];
        }
        posAttr.needsUpdate = true;
        sparkPoints.visible = true;

        if (globeGroupRef.current) {
          globeGroupRef.current.scale.set(1, 1, 1);
        }
      }
      wasBlastingRef.current = isNowBlasting;

      const clampedDelta = Math.min(delta, 0.033);

      // Supernova explosion & particle dynamics
      if (sceneIndexRef.current <= 3) {
        // Steps 1-3: Hide 3D globe completely
        if (globeGroupRef.current) {
          globeGroupRef.current.visible = false;
        }
        goldShockwaveMat.opacity = 0;
        cyanShockwaveMat.opacity = 0;
        coreNovaMat.opacity = 0;
        sparkPoints.visible = false;
      } else if (isNowBlasting) {
        // Active explosion phase: Unique multi-phase cosmic supernova detonation
        blastElapsedTime += clampedDelta;
        const progress = Math.min(1.0, blastElapsedTime / 0.80);

        if (globeGroupRef.current) {
          globeGroupRef.current.visible = true;
        }

        if (progress < 0.15) {
          // Phase 1: Kinetic Implosion & Energy Surge (Anticipation)
          const tensionT = progress / 0.15;
          const anticipation = Math.sin(tensionT * Math.PI) * 0.12;
          if (globeGroupRef.current) {
            globeGroupRef.current.scale.setScalar(1.0 - anticipation);
          }
          atmosphereMat.uniforms.uOpacity.value = 1.0 + tensionT * 2.5;
          sphereMat.emissiveIntensity = 0.75 + tensionT * 2.2;
          sparkPoints.visible = false;
        } else {
          // Phase 2: Supernova Detonation & 3D Deconstruction
          const detonateT = (progress - 0.15) / 0.85;
          const ease = 1.0 - Math.pow(1.0 - detonateT, 3); // Smooth cubic ease-out

          // Globe hyper-expansion & ether dissolve
          if (globeGroupRef.current) {
            globeGroupRef.current.scale.setScalar(0.88 + ease * 2.2);
          }
          sphereMat.opacity = Math.max(0, 1.0 - detonateT * 1.5);
          atmosphereMat.uniforms.uOpacity.value = Math.max(0, 3.5 * (1.0 - detonateT * 1.7));
          ringMat.opacity = Math.max(0, 1.0 - detonateT * 2.5);

          // Equatorial Golden Shockwave
          goldShockwaveMesh.scale.setScalar(0.5 + ease * 46);
          goldShockwaveMat.opacity = Math.max(0, Math.sin(detonateT * Math.PI) * (1.0 - detonateT * 0.4));

          // Cyan Quantum Orbital Shockwave (Warp Ring)
          cyanShockwaveMesh.scale.setScalar(0.4 + ease * 40);
          cyanShockwaveMesh.rotation.z += clampedDelta * 1.8;
          cyanShockwaveMat.opacity = Math.max(0, Math.sin(detonateT * Math.PI) * (1.0 - detonateT * 0.5));

          // White-Hot Core Plasma Energy Flash
          coreNovaMesh.scale.setScalar(0.3 + ease * 26);
          coreNovaMat.opacity = Math.max(0, Math.pow(1.0 - detonateT, 2) * 1.6);

          // Volumetric 3D Radiant Sparks
          sparkPoints.visible = true;
          const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
          const posArr = posAttr.array as Float32Array;
          for (let i = 0; i < sparkCount; i++) {
            posArr[i * 3] = sparkInitialPositions[i * 3] + sparkVelocities[i * 3] * (ease * 1.15);
            posArr[i * 3 + 1] = sparkInitialPositions[i * 3 + 1] + sparkVelocities[i * 3 + 1] * (ease * 1.15);
            posArr[i * 3 + 2] = sparkInitialPositions[i * 3 + 2] + sparkVelocities[i * 3 + 2] * (ease * 1.15);
          }
          posAttr.needsUpdate = true;
          sparkMat.opacity = Math.max(0, Math.sin(detonateT * Math.PI) * (1.0 - detonateT * 0.35));
        }
      } else if (sceneIndexRef.current === 5) {
        // Step 5: Completely remove the globe group, circle, arcs, rings, and sparks
        if (globeGroupRef.current) {
          globeGroupRef.current.visible = false;
        }
        goldShockwaveMat.opacity = 0;
        cyanShockwaveMat.opacity = 0;
        coreNovaMat.opacity = 0;
        sparkPoints.visible = false;
      } else {
        // Step 4: Full, solid, brilliant 3D Earth Globe
        if (globeGroupRef.current) {
          globeGroupRef.current.visible = true;
          globeGroupRef.current.scale.set(1, 1, 1);
        }
        sphereMat.opacity = 1;
        sphereMat.emissiveIntensity = 0.75;
        atmosphereMat.uniforms.uOpacity.value = 1;
        ringMat.opacity = 0.85;
        goldShockwaveMat.opacity = 0;
        cyanShockwaveMat.opacity = 0;
        coreNovaMat.opacity = 0;
        sparkPoints.visible = false;
      }

      // Smooth inertia & continuous gentle rotation
      if (globeGroupRef.current) {
        if (!isDraggingRef.current) {
          // Slow down inertia back to ambient rotation
          rotationVelocityRef.current.y = THREE.MathUtils.lerp(
            rotationVelocityRef.current.y,
            0.0022,
            0.04
          );
          rotationVelocityRef.current.x = THREE.MathUtils.lerp(
            rotationVelocityRef.current.x,
            0,
            0.04
          );
          globeGroupRef.current.rotation.y += rotationVelocityRef.current.y;
          globeGroupRef.current.rotation.x += rotationVelocityRef.current.x;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      earthTexture.dispose();
      erodeCoreGeo.dispose();
      erodeCoreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      photonGeo.dispose();
      photonMat.dispose();
      goldShockwaveGeo.dispose();
      goldShockwaveMat.dispose();
      cyanShockwaveGeo.dispose();
      cyanShockwaveMat.dispose();
      coreNovaGeo.dispose();
      coreNovaMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, []);

  // Adjust Globe scale / position based on sceneIndex
  const getStageTransform = () => {
    if (isBlasting) {
      return {
        opacity: 1,
        scale: 1,
        pointerEvents: 'none' as const,
      };
    }

    switch (sceneIndex) {
      case 1:
      case 2:
      case 3:
        // Flat map stage: globe can sit faded in deep background
        return {
          opacity: 0,
          scale: 0.65,
          pointerEvents: 'none' as const,
        };
      case 4:
        // Scene 4: The World emerges center stage
        return {
          opacity: 1,
          scale: 1,
          pointerEvents: 'auto' as const,
        };
      case 5:
        // Scene 5: Connect with Us — globe circle is completely removed!
        return {
          opacity: 0,
          scale: 1,
          pointerEvents: 'none' as const,
        };
      case 6:
        // Scene 6: MANTIF reveal — globe softens into background
        return {
          opacity: 0.45,
          scale: 0.9,
          pointerEvents: 'none' as const,
        };
      case 7:
      case 8:
      case 9:
        // Faintly visible ambient background during contact reveals & final screen
        return {
          opacity: 0.28,
          scale: 0.85,
          pointerEvents: 'none' as const,
        };
      default:
        return {
          opacity: 1,
          scale: 1,
          pointerEvents: 'auto' as const,
        };
    }
  };

  const transform = getStageTransform();

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full transition-all duration-1000 ease-out"
      style={{
        opacity: transform.opacity,
        transform: `scale(${transform.scale})`,
        pointerEvents: transform.pointerEvents,
      }}
      aria-label="Interactive 3D Planetary Map"
    />
  );
};
