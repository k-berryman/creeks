'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA';

const TOWNS = [
  { name: "Greenbackville", coords: [-75.405, 38.001], desc: "The northern gateway to the Eastern Shore, where Maryland meets Virginia's coastal charm." },
  { name: "Chincoteague", coords: [-75.378, 37.933], desc: "Home of the world-famous wild ponies and pristine Atlantic beaches." },
  { name: "Saxis", coords: [-75.720, 37.923], desc: "A true crabbing village out in the Chesapeake Bay with sunset views like no other." },
  { name: "Parksley", coords: [-75.649, 37.790], desc: "A historic railroad town with beautiful Victorian architecture and a classic town square." },
  { name: "Accomac", coords: [-75.666, 37.722], desc: "The historic county seat, filled with 18th-century architecture and deep Virginia heritage." },
  { name: "Onancock", coords: [-75.743, 37.711], desc: "A vibrant port town known for its arts scene, fine dining, and deep-water harbor." },
  { name: "Wachapreague", coords: [-75.688, 37.607], desc: "The 'Little City by the Sea,' a premier destination for world-class offshore fishing." },
  { name: "Exmore", coords: [-75.823, 37.531], desc: "The bustling hub of the shore, perfect for shopping and central access to both bay and sea." },
  { name: "Nassawadox", coords: [-75.861, 37.472], desc: "Quiet residential charm with deep ties to the shore's medical and agricultural history." },
  { name: "Eastville", coords: [-75.945, 37.351], desc: "Home to the oldest continuous court records in the country, dating back to 1632." },
  { name: "Cheriton", coords: [-75.975, 37.288], desc: "A quaint stop just minutes from the bay, surrounded by sprawling farmland." },
  { name: "Cape Charles", coords: [-76.023, 37.267], desc: "The southern jewel. Historic, walkable, and home to the shore's best public beach." }
];

export default function TownTour() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', 
      center: TOWNS[0].coords, 
      zoom: 12, // Starting a bit further out loads fewer tiles
      pitch: 60, // 60 is the "sweet spot" for performance vs 3D look
      bearing: -15, 
      antialias: false, // Disabling this saves a lot of GPU power
      trackResize: false // Prevents constant re-calculations
    });

    map.current.on('style.load', () => {
      // Optimized 3D Terrain
      map.current?.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512, // Standard tile size is faster than 256
      });
      
      map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.2 });

      // Simplified Fog
      map.current?.setFog({
        'range': [1, 10],
        'color': 'white',
        'horizon-blend': 0.1
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const townName = entry.target.getAttribute('data-town');
          const town = TOWNS.find(t => t.name === townName);
          if (town && map.current) {
            map.current.flyTo({
              center: town.coords,
              zoom: 12.5,
              speed: 0.4, // Slower speed gives the map time to load tiles
              curve: 1,
              essential: true
            });
          }
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.town-section').forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
      map.current?.remove();
    };
  }, []);

  return (
    <main className="flex min-h-screen bg-slate-950 overflow-hidden">
      {/* SCROLLING CONTENT */}
      <div className="w-1/3 h-screen overflow-y-scroll snap-y snap-mandatory z-10 bg-slate-950/70 backdrop-blur-sm border-r border-white/5 scrollbar-hide">
        {TOWNS.map((town) => (
          <section 
            key={town.name} 
            data-town={town.name}
            className="town-section h-screen snap-start flex flex-col justify-center px-12"
          >
            <span className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-2">Hill Realty Tour</span>
            <h2 className="text-5xl font-black text-white mb-6">{town.name}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">{town.desc}</p>
          </section>
        ))}
      </div>

      {/* STICKY MAP */}
      <div className="w-2/3 h-screen relative">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </div>
    </main>
  );
}

