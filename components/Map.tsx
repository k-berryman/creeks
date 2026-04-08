'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA'; 

export default function CreekMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // TOGGLE STATES
  const [showCreeks, setShowCreeks] = useState(true);
  const [showFlood, setShowFlood] = useState(false);

  // LAYER IDs - Verify these match exactly in Mapbox Studio
  const CREEK_LAYER_ID = 'creeks-1-6059c4';
  const FLOOD_LAYER_ID = 'Master_Flood_Zones-json'; // <--- Ensure this is your final merged ID

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/kaitlinberrymanwebdev/cmnpc2076003w01qo2zxb24pz',
      center: [-75.8, 37.6], 
      zoom: 9,
      pitch: 0,
    });

    map.current.on('load', () => {
      // 1. Initial Styling
      if (map.current?.getLayer(CREEK_LAYER_ID)) {
        map.current.setPaintProperty(CREEK_LAYER_ID, 'line-width', 3);
        map.current.setPaintProperty(CREEK_LAYER_ID, 'line-color', '#0ea5e9');
      }

      // 2. MAGNETIC CLICK (Bounding Box search for mobile)
      map.current?.on('click', (e) => {
        if (!showCreeks) return; // Ignore clicks if creeks are hidden

        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - 12, e.point.y - 12],
          [e.point.x + 12, e.point.y + 12]
        ];

        const features = map.current?.queryRenderedFeatures(bbox, {
          layers: [CREEK_LAYER_ID]
        });

        if (!features?.length) return;

        const props = features[0].properties;
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
    });

    return () => map.current?.remove();
  }, [showCreeks]);

  // --- THE DEFINITIVE TOGGLE LOGIC ---
  useEffect(() => {
    if (!map.current) return;

    const updateLayers = () => {
      // Toggle Creeks
      if (map.current?.getLayer(CREEK_LAYER_ID)) {
        map.current.setLayoutProperty(
          CREEK_LAYER_ID, 
          'visibility', 
          showCreeks ? 'visible' : 'none'
        );
      }

      // Toggle Flood (Opacity + Visibility for a clean hide)
      if (map.current?.getLayer(FLOOD_LAYER_ID)) {
        map.current.setLayoutProperty(
          FLOOD_LAYER_ID, 
          'visibility', 
          showFlood ? 'visible' : 'none'
        );
        map.current.setPaintProperty(
          FLOOD_LAYER_ID, 
          'fill-opacity', 
          showFlood ? 0.35 : 0
        );
      }
    };

    if (map.current.isStyleLoaded()) {
      updateLayers();
    } else {
      map.current.once('idle', updateLayers);
    }
  }, [showCreeks, showFlood]);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* PROFESSIONAL SIDEBAR */}
      <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur p-5 rounded-2xl shadow-2xl border border-slate-100 min-w-[220px]">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h2 className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Hill Realty Map</h2>
          <div className={`w-2 h-2 rounded-full ${showCreeks ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className={`font-bold text-sm transition-colors ${showCreeks ? 'text-blue-700' : 'text-slate-400'}`}>Creek Network</span>
            <input type="checkbox" className="sr-only" checked={showCreeks} onChange={() => setShowCreeks(!showCreeks)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showCreeks ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className={`font-bold text-sm transition-colors ${showFlood ? 'text-red-700' : 'text-slate-400'}`}>Flood Zones</span>
            <input type="checkbox" className="sr-only" checked={showFlood} onChange={() => setShowFlood(!showFlood)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showFlood ? 'bg-red-500' : 'bg-slate-300'}`}></div>
          </label>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
            {showCreeks ? "Tap any creek line for waterway details." : "Toggle layers to analyze property risk."}
          </p>
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

