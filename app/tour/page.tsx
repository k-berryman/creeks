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
      center: TOWNS[0].coords, // Start at the North
      zoom: 13,
      pitch: 45, // Adds a cool 3D perspective
      bearing: -17
    });

    // Intersection Observer to detect which town is on screen
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const townName = entry.target.getAttribute('data-town');
          const town = TOWNS.find(t => t.name === townName);
          if (town && map.current) {
            map.current.flyTo({
              center: town.coords,
              zoom: 13,
              speed: 0.8, // Smooth flight speed
              curve: 1
            });
          }
        }
      });
    }, { threshold: 0.7 });

    document.querySelectorAll('.town-section').forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
      map.current?.remove();
    };
  }, []);

  return (
    <main className="flex min-h-screen bg-slate-950">
      {/* LEFT: THE STORY (Scrolling) */}
      <div className="w-1/3 h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar z-10 bg-slate-950/80 backdrop-blur-md border-r border-white/10">
        {TOWNS.map((town) => (
          <section 
            key={town.name} 
            data-town={town.name}
            className="town-section h-screen snap-start flex flex-col justify-center px-10"
          >
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Hill Realty Tour</span>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">{town.name}</h2>
            <div className="w-12 h-1 bg-blue-600 mb-6" />
            <p className="text-slate-400 text-lg leading-relaxed font-medium italic">
              "{town.desc}"
            </p>
          </section>
        ))}
      </div>

      {/* RIGHT: THE MAP (Fixed) */}
      <div className="w-2/3 h-screen sticky top-0">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      </div>
    </main>
  );
}

