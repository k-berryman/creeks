'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA';

const TOWNS = [
  { name: "Greenbackville", coords: [-75.405, 38.001], desc: "The northern gateway where Maryland meets Virginia's coastal charm.", attractions: ["Captain's Cove Golf", "Bayside Marina", "Quiet Kayak Launches"] },
  { name: "Chincoteague", coords: [-75.378, 37.933], desc: "Home of the wild ponies and pristine Atlantic beaches.", attractions: ["Assateague Lighthouse", "Wild Pony Viewing", "Misty Museum"] },
  { name: "Saxis", coords: [-75.720, 37.923], desc: "A crabbing village with sunset views like no other.", attractions: ["Saxis Island Museum", "Wildlife Area", "Seafood Dining"] },
  { name: "Parksley", coords: [-75.649, 37.790], desc: "A historic railroad town with beautiful architecture.", attractions: ["Railway Museum", "Historic Five-and-Dime", "Town Square"] },
  { name: "Accomac", coords: [-75.666, 37.722], desc: "The historic county seat, filled with 18th-century heritage.", attractions: ["Ker Place Museum", "Historic Court Green", "Federal Mansions"] },
  { name: "Onancock", coords: [-75.743, 37.711], desc: "A vibrant port town known for arts and fine dining.", attractions: ["Tangier Ferry", "Historic Wharf District", "North Street Playhouse"] },
  { name: "Wachapreague", coords: [-75.688, 37.607], desc: "The 'Little City by the Sea,' a premier fishing destination.", attractions: ["Charter Fishing", "Island House Restaurant", "Marine Center"] },
  { name: "Exmore", coords: [-75.823, 37.531], desc: "The bustling retail hub of the shore, perfect for shopping.", attractions: ["Antique Malls", "Exmore Town Park", "Retail District"] },
  { name: "Nassawadox", coords: [-75.861, 37.472], desc: "Quiet residential charm with deep ties to shore history.", attractions: ["Brownsville Preserve", "Vineyards", "Birding Trails"] },
  { name: "Eastville", coords: [-75.945, 37.351], desc: "Home to the oldest continuous court records in the country.", attractions: ["1632 Court Records", "Eyre Hall Gardens", "Historic Prison"] },
  { name: "Cheriton", coords: [-75.975, 37.288], desc: "A quaint stop minutes from the bay, surrounded by farmland.", attractions: ["Artisan Shops", "Chatham Vineyards", "Coastal Access"] },
  { name: "Cape Charles", coords: [-76.023, 37.267], desc: "The southern jewel. Historic, walkable, and beachfront.", attractions: ["Public Beach & Pier", "Bay Creek Golf", "Boutique Main St"] }
];

export default function TownTour() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const updateMapLabel = (town: any) => {
    const source = map.current?.getSource('town-labels') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: town.coords }, properties: { title: town.name } }]
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', 
      center: TOWNS[0].coords as [number, number], 
      zoom: 13,
      pitch: 70, 
      bearing: -15,
      antialias: true
    });

    map.current.on('style.load', () => {
      map.current?.addSource('mapbox-dem', { 'type': 'raster-dem', 'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 'tileSize': 512 });
      map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      map.current?.addSource('town-labels', { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: TOWNS[0].coords }, properties: { title: TOWNS[0].name } }] } });
      map.current?.addLayer({ id: 'town-label-layer', type: 'symbol', source: 'town-labels', layout: { 'text-field': ['get', 'title'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 28, 'text-anchor': 'center' }, paint: { 'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 2.5 } });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const townName = entry.target.getAttribute('data-town');
          const town = TOWNS.find(t => t.name === townName);
          if (town && map.current) {
            updateMapLabel(town);
            map.current.flyTo({ center: town.coords as [number, number], zoom: 13.5, speed: 0.6, essential: true });
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.town-section').forEach(section => observer.observe(section));
    return () => { observer.disconnect(); map.current?.remove(); };
  }, []);

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-slate-950 overflow-hidden">
      {/* BRANDING BADGE */}
      <div className="fixed top-4 left-4 z-50 bg-blue-600/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-blue-400/50">
        <span className="text-white font-black text-[9px] uppercase tracking-widest">Hill Realty Tour</span>
      </div>

      {/* MAP VIEW: 70% Height on mobile for that "Big" feel */}
      <div className="w-full h-[70vh] md:h-screen md:w-2/3 md:order-2 fixed top-0 md:relative z-0">
        <div ref={mapContainer} className="w-full h-full" />
        {/* Deeper shadow to blend the text area into the map */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_-150px_120px_rgba(2,6,23,1)]" />
      </div>

      {/* STORY CONTENT: Overlaps the bottom of the map */}
      <div className="w-full md:w-1/3 h-screen overflow-y-scroll snap-y snap-mandatory z-10 no-scrollbar md:order-1 relative mt-[60vh] md:mt-0 pb-[100vh]">
        {TOWNS.map((town) => (
          <section key={town.name} data-town={town.name} className="town-section h-[40vh] md:h-screen snap-start flex flex-col justify-end pb-8 px-8 md:px-12 md:bg-transparent" >
            <div className="bg-slate-950/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl">
              <h2 className="text-3xl font-black text-white mb-1 leading-none">{town.name}</h2>
              <div className="w-8 h-0.5 bg-blue-600 mb-3" />
              <p className="text-slate-300 text-xs leading-relaxed italic mb-4">"{town.desc}"</p>
              
              <div className="space-y-1">
                <span className="text-blue-500 font-bold text-[8px] uppercase tracking-widest">Attractions</span>
                <div className="flex flex-wrap gap-2">
                  {town.attractions.map(attr => (
                    <span key={attr} className="text-slate-400 text-[10px] bg-white/5 px-2 py-1 rounded-md border border-white/5">
                       {attr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
        {/* SPACER FOR CAPE CHARLES */}
        <div className="h-[100vh] pointer-events-none" />
      </div>
    </main>
  );
}

