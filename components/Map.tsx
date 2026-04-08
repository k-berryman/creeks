'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2FpdGxpbmJlcnJ5bWFud2ViZGV2IiwiYSI6ImNtbnBiZ2Q0eTJmd2gycXE2aDByZTV3NGEifQ.UuYKRnm3UmXWe3-dv-pinA';

export default function CreekMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/kaitlinberrymanwebdev/cmnpc2076003w01qo2zxb24pz',
      center: [-75.83, 37.55], 
      zoom: 9.5,
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // List every layer ID from your Mapbox Studio sidebar
      const creekLayers = [
        'creeks-1-6059c4', 
        'archive-8mqxdd', 
        'archive-dqob0w', 
        'archive-0wjptm', 
        'creeks-1'
      ];

      creekLayers.forEach((layerId) => {
        // Only run if the layer actually exists in the style
        if (map.current?.getLayer(layerId)) {
          
          map.current.on('click', layerId, (e) => {
            if (!e.features || e.features.length === 0) return;
            
            const props = e.features[0].properties;
            // Check for different possible name fields in your various data sources
            const name = props?.FULLNAME || props?.NAME || props?.GNIS_NAME || "Unnamed Creek";
            
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
  <div style="
    padding: 10px; 
    font-family: sans-serif; 
    font-size: 16px; 
    line-height: 1.4;
    color: #1a365d;
  ">
    <span style="display: block; font-size: 12px; color: #718096; text-transform: uppercase;">Creek Name</span>
    <strong style="font-size: 20px; display: block;">${name}</strong>
  </div>
`)
              .addTo(map.current!);
          });

          // Hand cursor on hover
          map.current.on('mouseenter', layerId, () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current.on('mouseleave', layerId, () => {
            map.current!.getCanvas().style.cursor = '';
          });
        }
      });
    });

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} className="w-full h-screen" />;
}

