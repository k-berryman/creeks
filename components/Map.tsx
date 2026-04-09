'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA';

export default function CreekMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [showCreeks, setShowCreeks] = useState(true);
  const [showFlood, setShowFlood] = useState(false);

  // IDs from your Mapbox Studio
  const CREEK_LAYER_ID = 'creeks-1-6059c4';
  const FLOOD_LAYER_ID = 'Master_Flood_Zones-json';

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/kaitlinberrymanwebdev/cmnpc2076003w01qo2zxb24pz',
      center: [-75.8, 37.6] as [number, number],
      zoom: 9,
    });

    // Helper function to force visibility
    const syncLayers = () => {
      if (!map.current?.isStyleLoaded()) return;
      
      if (map.current.getLayer(CREEK_LAYER_ID)) {
        map.current.setLayoutProperty(CREEK_LAYER_ID, 'visibility', showCreeks ? 'visible' : 'none');
      }
      if (map.current.getLayer(FLOOD_LAYER_ID)) {
        map.current.setLayoutProperty(FLOOD_LAYER_ID, 'visibility', showFlood ? 'visible' : 'none');
      }
    };

    map.current.on('style.load', syncLayers);
    map.current.on('idle', syncLayers);

    return () => map.current?.remove();
  }, []);

  // FORCE UPDATE ON STATE CHANGE
  useEffect(() => {
    if (!map.current) return;

    // We use a small timeout to let the React state finish before pushing to Mapbox
    const timer = setTimeout(() => {
      if (map.current?.getLayer(CREEK_LAYER_ID)) {
        map.current.setLayoutProperty(CREEK_LAYER_ID, 'visibility', showCreeks ? 'visible' : 'none');
      }
      if (map.current?.getLayer(FLOOD_LAYER_ID)) {
        map.current.setLayoutProperty(FLOOD_LAYER_ID, 'visibility', showFlood ? 'visible' : 'none');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showCreeks, showFlood]);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur p-5 rounded-2xl shadow-2xl border border-slate-200 min-w-[220px]">
        <h2 className="text-slate-900 font-black text-[10px] uppercase tracking-widest mb-4 border-b pb-2 text-center">Hill Realty Map</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`font-bold text-sm ${showCreeks ? 'text-blue-700' : 'text-slate-400'}`}>Creek Network</span>
            <input type="checkbox" className="sr-only" checked={showCreeks} onChange={() => setShowCreeks(!showCreeks)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showCreeks ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`font-bold text-sm ${showFlood ? 'text-red-700' : 'text-slate-400'}`}>Flood Zones</span>
            <input type="checkbox" className="sr-only" checked={showFlood} onChange={() => setShowFlood(!showFlood)} />
            <div className={`w-10 h-5 rounded-full transition-colors ${showFlood ? 'bg-red-500' : 'bg-slate-300'}`}></div>
          </label>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

