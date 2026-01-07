'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewerProps {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  title?: string;
}

export default function MapViewer({ latitude, longitude, radius, title }: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Convert to numbers if they're strings
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  // Debug logging
  useEffect(() => {
    console.log('🗺️ MapViewer props:', { latitude: lat, longitude: lng, radius, title });
  }, [lat, lng, radius, title]);

  // Function to create circle GeoJSON
  const createCircleGeoJSON = (center: [number, number], radiusInKm: number) => {
    const points = 64;
    const coords = {
      latitude: center[1],
      longitude: center[0]
    };

    const km = radiusInKm;
    const ret = [];
    const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      type: 'geojson' as const,
      data: {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ret]
        },
        properties: {}
      }
    };
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: radius ? Math.max(8, 13 - Math.log2(radius)) : 12
    });

    // Create custom marker element
    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="#0038A8"/>
        <circle cx="15" cy="15" r="5" fill="white"/>
      </svg>
    `;

    // Add marker
    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Add popup if title provided
    if (title) {
      new mapboxgl.Popup({ offset: 25 })
        .setLngLat([lng, lat])
        .setHTML(`<div style="padding: 4px 8px; font-weight: 500;">${title}</div>`)
        .addTo(map.current);
    }

    // Wait for map to load before adding circle
    if (radius && radius > 0) {
      console.log('🎯 Adding radius circle:', radius, 'km');
      map.current.on('load', () => {
        if (!map.current) return;

        console.log('✅ Map loaded, adding circle layer');

        // Add circle source and layer
        map.current.addSource('radius-circle', createCircleGeoJSON([lng, lat], radius));

        map.current.addLayer({
          id: 'radius-circle-fill',
          type: 'fill',
          source: 'radius-circle',
          paint: {
            'fill-color': '#0038A8',
            'fill-opacity': 0.3
          }
        });

        map.current.addLayer({
          id: 'radius-circle-outline',
          type: 'line',
          source: 'radius-circle',
          paint: {
            'line-color': '#0038A8',
            'line-width': 3,
            'line-opacity': 1
          }
        });

        console.log('✅ Circle layers added successfully');
      });
    } else {
      console.log('⚠️ No radius provided or radius is 0');
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, radius, title]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
