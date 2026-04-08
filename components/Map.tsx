'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Using the environment variable we set up earlier
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA'; 

export default function CreekMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Toggle States
  const [showCreeks, setShowCreeks] = useState(true);
  const [showFlood, setShowFlood] = useState(false);

  // Layer IDs - Double check these match your Mapbox Studio names
  const CREEK_LAYER_ID = 'creeks-1-6059c4';
  const FLOOD_LAYER_ID = 'flood-layer-id'; // <--- Swap this when your flood upload finishes

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/kaitlinberrymanwebdev/cmnpc2076003w01qo2zxb24pz',
      center: [-75.8, 37.6], 
      zoom: 9,
      pitch: 0, // Keep this flat for the analytical map
    });

    map.current.on('load', () => {
      // 1. Initial Creek Styling
      if (map.current?.getLayer(CREEK_LAYER_ID)) {
        map.current.setPaintProperty(CREEK_LAYER_ID, 'line-width', 3);
        map.current.setPaintProperty(CREEK_LAYER_ID, 'line-color', '#0ea5e9');
      }

      // 2. MAGNETIC CLICK LOGIC (Fixes "hard to click" on mobile)
      map.current?.on('click', (e) => {
        // Create a 20px hit area around the click point
        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - 10, e.point.y - 10],
          [e.point.x + 10, e.point.y + 10]
        ];

        // Search for the creek in that box
        const features = map.current?.queryRenderedFeatures(bbox, {
          layers: [CREEK_LAYER_ID]
        });

        if (!features?.length) return;

        const feature = features[0];
        const props = feature.properties;
        
        // Intelligent naming (checking all variants we fixed earlier)
        const creekName = props?.FULLNAME || props?.fullname || props?.GNIS_Name || props?.NAME || "Eastern Shore Waterway";

        new mapboxgl.Popup({ closeButton: false, offset: 15 })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background-color: #0369a1; color: white; padding: 12px 18px; border-radius: 12px; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
              <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 800; opacity: 0.8;">ESVA Waterway</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900;">${creekName}</p>
            </div>
          `)
          .addTo(map.current!);
      });

      // 3. HOVER FEEDBACK
      map.current?.on('mouseenter', CREEK_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', CREEK_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });

    return () => map.current?.remove();
  }, []);

  // UPDATE VISIBILITY TOGGLES
  useEffect(() => {
    if (!map.current) return;

    const updateLayers = () => {
      if (map.current?.getLayer(CREEK_LAYER_ID)) {
        map.current.setLayoutProperty(CREEK_LAYER_ID, 'visibility', showCreeks ? 'visible' : 'none');
      }
      if (map.current?.getLayer(FLOOD_LAYER_ID)) {
        map.current.setLayoutProperty(FLOOD_LAYER_ID, 'visibility', showFlood ? 'visible' : 'none');
        map.current.setPaintProperty(FLOOD_LAYER_ID, 'fill-opacity', showFlood ? 0.35 : 0);
      }
    };

    if (map.current.isStyleLoaded()) updateLayers();
    else map.current.on('idle', updateLayers);
  }, [showCreeks, showFlood]);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* SIDEBAR UI */}
      <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur p-5 rounded-2xl shadow-2xl border border-white/20 min-w-[220px]">
        <h2 className="text-slate-900 font-black text-[10px] uppercase tracking-widest mb-4 border-b pb-2">Hill Realty Layers</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className={`font-bold text-sm ${showCreeks ? 'text-blue-700' : 'text-slate-400'}`}>Creek Network</span>
            <input type="checkbox" className="sr-only" checked={showCreeks} onChange={() => setShowCreeks(!showCreeks)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showCreeks ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className={`font-bold text-sm ${showFlood ? 'text-red-700' : 'text-slate-400'}`}>Flood Zones</span>
            <input type="checkbox" className="sr-only" checked={showFlood} onChange={() => setShowFlood(!showFlood)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showFlood ? 'bg-red-500' : 'bg-slate-300'}`}></div>
          </label>
        </div>
        <p className="mt-4 text-[9px] text-slate-400 italic">Tap any creek line for details.</p>
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

