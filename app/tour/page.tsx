'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA';

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
      center: TOWNS[0].coords as [number, number], 
      zoom: 12,
      pitch: 70, 
      bearing: -15,
      antialias: true
    });

    map.current.on('style.load', () => {
      // 3D TERRAIN
      map.current?.addSource('mapbox-dem', { 'type': 'raster-dem', 'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 'tileSize': 512 });
      map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // DYNAMIC TOWN LABEL LAYER (Starts empty)
      map.current?.addSource('town-labels', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current?.addLayer({
        id: 'town-label-layer',
        type: 'symbol',
        source: 'town-labels',
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 32, // BOLDER & LARGER
          'text-anchor': 'center', // HORIZONTALLY CENTERED
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2.5
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const townName = entry.target.getAttribute('data-town');
          const town = TOWNS.find(t => t.name === townName);
          
          if (town && map.current) {
            // REFRESH THE CENTERED LABEL
            const source = map.current.getSource('town-labels') as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData({
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: town.coords },
                  properties: { title: town.name }
                }]
              });
            }

            map.current.flyTo({
              center: town.coords as [number, number],
              zoom: 13.8, // Slightly tighter zoom for town centers
              pitch: 70,
              speed: 0.6,
              essential: true
            });
          }
        }
      });
    }, { threshold: [0.5] });

    document.querySelectorAll('.town-section').forEach(section => observer.observe(section));
    return () => { observer.disconnect(); map.current?.remove(); };
  }, []);

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-slate-950 overflow-hidden">
      {/* MAP VIEW */}
      <div className="w-full h-[55vh] md:h-screen md:w-2/3 md:order-2 fixed top-0 md:relative z-0">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_-120px_100px_rgba(2,6,23,1)]" />
      </div>

      {/* STORY CONTENT */}
      <div className="w-full md:w-1/3 h-screen overflow-y-scroll snap-y snap-mandatory z-10 no-scrollbar md:order-1 relative mt-[55vh] md:mt-0 pb-[45vh]">
        {TOWNS.map((town) => (
          <section key={town.name} data-town={town.name} className="town-section h-[45vh] md:h-screen snap-center flex flex-col justify-start pt-12 px-8 md:px-12 bg-slate-950/90 backdrop-blur-sm md:bg-transparent" >
            <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest mb-1">Hill Realty Tour</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-none">{town.name}</h2>
            <div className="w-10 h-1 bg-blue-600 mb-4" />
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-md italic">"{town.desc}"</p>
          </section>
        ))}
      </div>
    </main>
  );
}

