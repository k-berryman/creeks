'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA'; 

export default function HillRealtyMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [showCreeks, setShowCreeks] = useState(true);

  const CREEK_STYLE = 'mapbox://styles/kaitlinberrymanwebdev/cmnpc2076003w01qo2zxb24pz';
  const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: showCreeks ? CREEK_STYLE : SATELLITE_STYLE,
      center: [-75.8, 37.6], // PERFECT CENTER FOR ESVA
      zoom: 8.5,            // SHOWS THE WHOLE SHORE
    });

    map.current.on('style.load', () => {
      const layerId = 'creeks-1-6059c4';

      if (showCreeks && map.current?.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'line-width', 3);
        map.current.setPaintProperty(layerId, 'line-color', '#0ea5e9');

        map.current.on('click', layerId, (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const props = e.features[0].properties; // Target the first feature in the array
          
          // INTELLIGENT NAME FINDER
          let creekName = props?.FULLNAME || props?.fullname || props?.GNIS_Name || props?.NAME;

          if (!creekName) {
            const allValues = Object.values(props || {});
            creekName = allValues.find(val => 
              typeof val === 'string' && 
              (val.includes('Creek') || val.includes('Branch') || val.includes('River'))
            );
          }

          const displayName = creekName || "Eastern Shore Waterway";

          new mapboxgl.Popup({ closeButton: false, offset: 15 })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="background-color: #0369a1; color: white; padding: 15px 20px; border-radius: 12px; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); max-width: 250px; line-height: 1.3;">
                <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; opacity: 0.9;">ESVA Waterway</p>
                <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: 900; word-wrap: break-word;">${displayName}</p>
              </div>
            `)
            .addTo(map.current!);
        });

        map.current.on('mouseenter', layerId, () => {
          map.current!.getCanvas().style.cursor = 'pointer';
          map.current!.setPaintProperty(layerId, 'line-width', 6);
        });
        map.current.on('mouseleave', layerId, () => {
          map.current!.getCanvas().style.cursor = '';
          map.current!.setPaintProperty(layerId, 'line-width', 3);
        });
      }
    });

    return () => map.current?.remove();
  }, [showCreeks]);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      <div className="absolute top-8 left-8 z-20 bg-white/95 backdrop-blur p-6 rounded-2xl shadow-2xl border border-white/20 min-w-[260px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Hill Realty Map</h2>
          <div className={`w-2 h-2 rounded-full ${showCreeks ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
        </div>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className={`font-bold text-sm transition-colors duration-300 ${showCreeks ? 'text-blue-700' : 'text-slate-500'}`}>
            ESVA Creek Network
          </span>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showCreeks} onChange={() => setShowCreeks(!showCreeks)} />
            <div className={`w-12 h-6 rounded-full transition-all duration-300 ${showCreeks ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${showCreeks ? 'translate-x-6' : ''}`}></div>
          </div>
        </label>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">Click a waterway for details.</p>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

