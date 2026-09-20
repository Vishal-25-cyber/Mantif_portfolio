import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { soundManager } from '../audio/soundManager';

interface GoogleMapsStoryExperienceProps {
  sceneIndex: number; // 1: Erode, 2: Tamil Nadu, 3: India, 4: Globe, 5: Connect
  onSceneChange: (scene: number) => void;
}

// Geographic Coordinates
const ERODE_COORDS: [number, number] = [11.3410, 77.7172];
const TAMIL_NADU_COORDS: [number, number] = [11.1271, 78.4];
const INDIA_COORDS: [number, number] = [21.5, 78.8];
const WORLD_COORDS: [number, number] = [20.0, 77.0];

// Calibrated Integer Zoom Levels (Essential for reliable tile rendering)
const SCENE_CONFIG: Record<number, { center: [number, number]; zoom: number; duration: number }> = {
  1: { center: ERODE_COORDS, zoom: 11, duration: 1.2 },
  2: { center: TAMIL_NADU_COORDS, zoom: 7, duration: 1.3 },
  3: { center: INDIA_COORDS, zoom: 5, duration: 1.4 },
  4: { center: WORLD_COORDS, zoom: 3, duration: 1.3 },
  5: { center: WORLD_COORDS, zoom: 3, duration: 1.3 },
};

// Regional Hubs for Step 2 (Tamil Nadu)
const TN_HUBS = [
  { name: 'Coimbatore', coords: [11.0168, 76.9558] as [number, number] },
  { name: 'Salem', coords: [11.6643, 78.1460] as [number, number] },
  { name: 'Tirupur', coords: [11.1085, 77.3411] as [number, number] },
  { name: 'Madurai', coords: [9.9252, 78.1198] as [number, number] },
  { name: 'Tiruchirappalli', coords: [10.7905, 78.7047] as [number, number] },
  { name: 'Chennai', coords: [13.0827, 80.2707] as [number, number] },
];

// National Hubs for Step 3 (India)
const NATIONAL_HUBS = [
  { name: 'Bengaluru', coords: [12.9716, 77.5946] as [number, number] },
  { name: 'Hyderabad', coords: [17.3850, 78.4867] as [number, number] },
  { name: 'Mumbai', coords: [19.0760, 72.8777] as [number, number] },
  { name: 'New Delhi', coords: [28.6139, 77.2090] as [number, number] },
  { name: 'Kolkata', coords: [22.5726, 88.3639] as [number, number] },
];

// Tamil Nadu State Boundary Approximation (GeoJSON coordinate list)
const TAMIL_NADU_BORDER: [number, number][] = [
  [8.08, 77.55],
  [8.35, 77.25],
  [8.85, 77.20],
  [9.50, 77.15],
  [9.75, 77.28],
  [10.20, 77.05],
  [10.50, 76.90],
  [11.00, 76.80],
  [11.45, 76.60],
  [11.65, 76.80],
  [11.90, 77.10],
  [12.20, 77.80],
  [12.80, 78.40],
  [13.25, 79.80],
  [13.40, 80.28],
  [13.08, 80.30],
  [12.55, 80.18],
  [12.00, 79.85],
  [11.45, 79.78],
  [11.15, 79.85],
  [10.75, 79.85],
  [10.30, 79.30],
  [9.30, 79.15],
  [9.20, 79.30],
  [8.80, 78.15],
  [8.40, 77.80],
  [8.08, 77.55],
];

// India Subcontinent Boundary Approximation
const INDIA_BORDER: [number, number][] = [
  [8.08, 77.55],
  [10.5, 76.0],
  [12.9, 74.8],
  [15.4, 73.8],
  [18.9, 72.8],
  [20.5, 72.8],
  [22.8, 69.8],
  [23.5, 68.5],
  [24.5, 68.2],
  [27.0, 70.5],
  [29.5, 72.5],
  [31.5, 74.5],
  [33.5, 74.0],
  [35.5, 76.5],
  [34.5, 78.5],
  [32.5, 79.0],
  [30.5, 80.5],
  [28.0, 82.5],
  [26.5, 85.0],
  [26.0, 88.5],
  [27.5, 91.5],
  [28.5, 96.5],
  [26.5, 97.0],
  [24.5, 95.0],
  [23.0, 93.0],
  [21.5, 87.5],
  [19.0, 84.8],
  [17.0, 82.3],
  [15.5, 80.3],
  [13.1, 80.3],
  [11.0, 79.8],
  [9.2, 79.3],
  [8.08, 77.55],
];

export const GoogleMapsStoryExperience: React.FC<GoogleMapsStoryExperienceProps> = ({
  sceneIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const prevSceneRef = useRef<number>(1);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    // Leaflet map setup with integer zoom levels and reliable canvas rendering
    const map = L.map(container, {
      center: ERODE_COORDS,
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      fadeAnimation: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 8,
      markerZoomAnimation: true,
      preferCanvas: true,
      zoomSnap: 1, // Strict integer zooms to ensure 100% reliable tile matching
      zoomDelta: 1,
    });
    mapInstanceRef.current = map;

    // 1. ESRI World Dark Gray Canvas Base (100% Free, NO API KEY, NO WATERMARK)
    const esriBaseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        minZoom: 1,
        keepBuffer: 3,
        updateWhenZooming: true,
        updateWhenIdle: false,
        crossOrigin: true,
      }
    );
    esriBaseLayer.addTo(map);

    // 2. ESRI World Dark Gray Reference Layer (Crisp English City Labels & Roads)
    const esriLabelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        minZoom: 1,
        keepBuffer: 3,
        updateWhenZooming: true,
        updateWhenIdle: false,
        crossOrigin: true,
      }
    );
    esriLabelsLayer.addTo(map);

    // 3. Fallback: OpenStreetMap with Dark Filter (Open source, zero watermark)
    const osmBackupLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 1,
      className: 'osm-dark-tiles',
    });

    esriBaseLayer.on('tileerror', () => {
      if (map && !map.hasLayer(osmBackupLayer)) {
        osmBackupLayer.addTo(map);
      }
    });

    // Dynamic layer group for vector boundaries, filaments, and hubs
    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    // Golden Erode Marker Pin
    const erodePinIcon = L.divIcon({
      className: 'custom-erode-pin',
      iconSize: [44, 56],
      iconAnchor: [22, 54],
      html: `
        <div class="relative flex flex-col items-center select-none pointer-events-auto">
          <!-- Multi-Ring Golden Radar Beacon -->
          <div class="absolute -top-1 w-12 h-12 rounded-full border-2 border-[#DFB74A] animate-ping pointer-events-none" style="animation-duration: 2.4s;"></div>
          <div class="absolute -top-3 w-16 h-16 rounded-full border border-[#DFB74A]/40 animate-pulse pointer-events-none"></div>

          <!-- Teardrop Pin Marker -->
          <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#001726] to-[#002B47] border-2 border-[#DFB74A] shadow-[0_0_24px_rgba(223,183,74,0.85)] flex items-center justify-center">
            <span class="w-3.5 h-3.5 rounded-full bg-[#DFB74A] shadow-[0_0_12px_#DFB74A]"></span>
            <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#DFB74A]"></div>
          </div>

          <!-- Badge Label -->
          <div class="mt-2.5 px-3 py-1 rounded-md bg-[#00111D] border-2 border-[#DFB74A] shadow-[0_4px_20px_rgba(0,0,0,0.95),0_0_15px_rgba(223,183,74,0.4)] flex items-center gap-1.5 whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A] animate-pulse"></span>
            <span class="font-mono text-[11px] font-extrabold text-[#FAF8F5] tracking-wider uppercase">
              ERODE <span class="text-[#DFB74A]">·</span> MANTIF ORIGIN
            </span>
          </div>
        </div>
      `,
    });

    const marker = L.marker(ERODE_COORDS, { icon: erodePinIcon, zIndexOffset: 1000 }).addTo(map);
    marker.on('click', () => {
      soundManager.playHoverTick();
    });

    // CRITICAL: ResizeObserver guarantees map.invalidateSize() is called
    // whenever container size changes or becomes visible!
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });
    resizeObserver.observe(container);

    // Initial size invalidations to ensure immediate rendering
    map.whenReady(() => {
      map.invalidateSize({ pan: false });
    });
    const t1 = setTimeout(() => map.invalidateSize({ pan: false }), 150);
    const t2 = setTimeout(() => map.invalidateSize({ pan: false }), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Vector Overlays & Camera Position when sceneIndex changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    // Force size check so Leaflet never gets stuck on 0x0
    map.invalidateSize({ pan: false });

    const config = SCENE_CONFIG[sceneIndex] || SCENE_CONFIG[1];
    prevSceneRef.current = sceneIndex;

    // Smooth camera fly-to transition
    map.stop();
    map.flyTo(config.center, config.zoom, {
      duration: config.duration,
      easeLinearity: 0.25,
      animate: true,
    });

    // Clear previous dynamic vector layers (filaments, polygons, hub markers)
    layersGroup.clearLayers();

    // ─────────────────────────────────────────────────────────────
    // STEP 2: TAMIL NADU (Illuminated State Boundary & Regional Filaments)
    // ─────────────────────────────────────────────────────────────
    if (sceneIndex === 2) {
      // 1. Highlighted Tamil Nadu State Polygon
      const tnPolygon = L.polygon(TAMIL_NADU_BORDER, {
        color: '#DFB74A',
        weight: 2.2,
        opacity: 0.95,
        fillColor: '#004B79',
        fillOpacity: 0.18,
        dashArray: '4, 4',
      });
      layersGroup.addLayer(tnPolygon);

      // 2. Regional Route Filaments (Erode -> Coimbatore, Salem, Tirupur, Madurai, Chennai)
      TN_HUBS.forEach((hub) => {
        // Glowing filament polyline
        const line = L.polyline([ERODE_COORDS, hub.coords], {
          color: hub.name === 'Chennai' ? '#DFB74A' : '#38BDF8',
          weight: 2,
          opacity: 0.85,
          dashArray: '3, 4',
        });
        layersGroup.addLayer(line);

        // Small illuminated hub dot
        const hubIcon = L.divIcon({
          className: 'custom-hub-dot',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          html: `
            <div class="relative flex items-center justify-center">
              <span class="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"></span>
              <span class="absolute -top-4 font-mono text-[9px] font-bold text-[#FAF8F5] tracking-wider uppercase bg-[#00111D]/80 px-1 rounded shadow">
                ${hub.name}
              </span>
            </div>
          `,
        });
        const hubMarker = L.marker(hub.coords, { icon: hubIcon });
        layersGroup.addLayer(hubMarker);
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: INDIA (Illuminated National Boundary & Pan-India Network)
    // ─────────────────────────────────────────────────────────────
    if (sceneIndex === 3) {
      // 1. Highlighted India National Boundary Polygon
      const indiaPolygon = L.polygon(INDIA_BORDER, {
        color: '#38BDF8',
        weight: 2.0,
        opacity: 0.9,
        fillColor: '#002B47',
        fillOpacity: 0.16,
      });
      layersGroup.addLayer(indiaPolygon);

      // Also keep Tamil Nadu softly glowing inside India
      const tnPolygon = L.polygon(TAMIL_NADU_BORDER, {
        color: '#DFB74A',
        weight: 1.5,
        opacity: 0.8,
        fillColor: '#DFB74A',
        fillOpacity: 0.12,
      });
      layersGroup.addLayer(tnPolygon);

      // 2. National Route Filaments
      NATIONAL_HUBS.forEach((hub) => {
        const line = L.polyline([ERODE_COORDS, hub.coords], {
          color: '#38BDF8',
          weight: 2.2,
          opacity: 0.9,
          dashArray: '4, 4',
        });
        layersGroup.addLayer(line);

        const hubIcon = L.divIcon({
          className: 'custom-national-hub',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          html: `
            <div class="relative flex flex-col items-center">
              <span class="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-white shadow-[0_0_12px_#38BDF8] animate-pulse"></span>
              <span class="mt-1 font-mono text-[10px] font-extrabold text-[#FAF8F5] tracking-wider uppercase bg-[#001726]/90 px-1.5 py-0.5 rounded border border-[#38BDF8]/40 shadow">
                ${hub.name}
              </span>
            </div>
          `,
        });
        const hubMarker = L.marker(hub.coords, { icon: hubIcon });
        layersGroup.addLayer(hubMarker);
      });
    }

    // Delayed size invalidation after fly-to animation settles
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    }, (config.duration * 1000) + 50);

    return () => clearTimeout(timer);
  }, [sceneIndex]);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at center, #001726 0%, #000B14 100%)',
      }}
    >
      {/* Tactical Cartography Grid Background (Ensures zero-blank guarantee) */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-1" />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0, 11, 20, 0.4) 80%, rgba(0, 11, 20, 0.85) 100%)',
        }}
      />
    </div>
  );
};

export default GoogleMapsStoryExperience;
