import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { soundManager } from '../audio/soundManager';

interface GoogleMapsStoryExperienceProps {
  sceneIndex: number; // 1: Erode, 2: Tamil Nadu, 3: India, 4: Globe, 5: Connect
  onSceneChange: (scene: number) => void;
}

// Coordinates
const ERODE_COORDS: [number, number] = [11.3410, 77.7172];
const TAMIL_NADU_COORDS: [number, number] = [11.1271, 78.3];
const INDIA_COORDS: [number, number] = [21.5, 78.8];
const WORLD_COORDS: [number, number] = [20.0, 77.0];

// Target zoom levels per scene (Normal, fluid, responsive speed)
const SCENE_CONFIG: Record<number, { center: [number, number]; zoom: number; duration: number }> = {
  1: { center: ERODE_COORDS, zoom: 11, duration: 1.1 },
  2: { center: TAMIL_NADU_COORDS, zoom: 7.2, duration: 1.3 },
  3: { center: INDIA_COORDS, zoom: 4.4, duration: 1.4 },
  4: { center: WORLD_COORDS, zoom: 2.8, duration: 1.3 },
  5: { center: WORLD_COORDS, zoom: 2.8, duration: 1.3 },
};

export const GoogleMapsStoryExperience: React.FC<GoogleMapsStoryExperienceProps> = ({
  sceneIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const prevSceneRef = useRef<number>(1);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
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
      zoomAnimationThreshold: 12, // allow animation across large zoom differences
      markerZoomAnimation: true,
      preferCanvas: true,
      // Fractional zooming for smooth intermediate steps
      zoomSnap: 0.1,
      zoomDelta: 0.5,
    });
    mapInstanceRef.current = map;

    // Generous buffer — pre-renders tiles in all directions so zoom-out never shows black
    const tileOptions: L.TileLayerOptions = {
      maxZoom: 19,
      minZoom: 1,
      keepBuffer: 16,           // pre-load 16 extra tile rows/cols in every direction
      updateWhenZooming: false, // don't re-request tiles during animation
      updateWhenIdle: true,
      crossOrigin: true,
    };

    // Esri Dark Gray Base
    const baseLayer = L.tileLayer(
      'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      tileOptions
    );
    baseLayer.addTo(map);
    baseLayerRef.current = baseLayer;

    // Labels Overlay
    const labelsLayer = L.tileLayer(
      'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      tileOptions
    );
    labelsLayer.addTo(map);
    labelsLayerRef.current = labelsLayer;

    // Golden Erode marker
    const googlePinIcon = L.divIcon({
      className: 'custom-google-pin',
      iconSize: [44, 56],
      iconAnchor: [22, 54],
      popupAnchor: [0, -48],
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer select-none">
          <!-- Animated Golden Radar Rings -->
          <div class="absolute -top-1 w-12 h-12 rounded-full border-2 border-[#DFB74A]/90 animate-ping pointer-events-none" style="animation-duration: 2.2s;"></div>
          <div class="absolute -top-3 w-16 h-16 rounded-full border border-[#DFB74A]/40 animate-pulse pointer-events-none"></div>

          <!-- Google Maps Teardrop Shape -->
          <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#001726] to-[#002B47] border-2 border-[#DFB74A] shadow-[0_4px_24px_rgba(223,183,74,0.75)] flex items-center justify-center transition-transform duration-300 hover:scale-110">
            <span class="w-3.5 h-3.5 rounded-full bg-[#DFB74A] shadow-[0_0_12px_#DFB74A]"></span>
            <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#DFB74A]"></div>
          </div>

          <!-- High-Contrast Origin Label Badge -->
          <div class="mt-2.5 px-3 py-1 rounded-md bg-[#00111D] border-2 border-[#DFB74A] shadow-[0_4px_20px_rgba(0,0,0,0.95),0_0_15px_rgba(223,183,74,0.4)] flex items-center gap-1.5 whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-[#DFB74A] shadow-[0_0_6px_#DFB74A] animate-pulse"></span>
            <span class="font-mono text-[11px] font-extrabold text-[#FAF8F5] tracking-wider uppercase">
              ERODE <span class="text-[#DFB74A]">·</span> MANTIF ORIGIN
            </span>
          </div>
        </div>
      `,
    });

    const marker = L.marker(ERODE_COORDS, { icon: googlePinIcon }).addTo(map);

    marker.on('click', () => {
      soundManager.playHoverTick();
    });

    // Pre-warm tiles at all zoom levels before any transitions happen
    // by briefly panning to each zoom level silently
    setTimeout(() => {
      if (!mapInstanceRef.current) return;
      // Set tile layer to load tiles at target zoom levels in background
      baseLayer.options.keepBuffer = 20;
      labelsLayer.options.keepBuffer = 20;
    }, 500);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Smooth camera transitions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const config = SCENE_CONFIG[sceneIndex] || SCENE_CONFIG[1];
    const prevConfig = SCENE_CONFIG[prevSceneRef.current] || SCENE_CONFIG[1];
    const isSameTarget =
      config.zoom === prevConfig.zoom &&
      config.center[0] === prevConfig.center[0] &&
      config.center[1] === prevConfig.center[1];

    prevSceneRef.current = sceneIndex;

    // If coordinates & zoom are already identical (e.g. Globe -> Connect with Us), no animation needed
    if (isSameTarget) return;

    // Stop any ongoing animation cleanly
    map.stop();

    // Silky smooth parabolic flight directly to target coordinates & zoom
    map.flyTo(config.center, config.zoom, {
      duration: config.duration,
      easeLinearity: 0.22,
      animate: true,
    });
  }, [sceneIndex]);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ background: '#1a1a2e' }} // Matches dark map tile color — no black flash
    >
      {/* Leaflet map canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,12,25,0.45) 100%)',
        }}
      />
    </div>
  );
};
