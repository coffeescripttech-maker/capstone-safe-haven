'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  onLocationChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, radius, onLocationChange }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [markerPosition, setMarkerPosition] = useState({
    latitude: latitude || 14.5995, // Default to Manila
    longitude: longitude || 120.9842
  });

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
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [markerPosition.longitude, markerPosition.latitude],
      zoom: 11
    });

    // Create custom marker element
    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="#0038A8"/>
        <circle cx="15" cy="15" r="5" fill="white"/>
      </svg>
    `;
    el.style.cursor = 'pointer';

    // Add marker
    marker.current = new mapboxgl.Marker(el)
      .setLngLat([markerPosition.longitude, markerPosition.latitude])
      .addTo(map.current);

    // Wait for map to load before adding layers
    map.current.on('load', () => {
      if (!map.current) return;

      // Add circle source and layer
      map.current.addSource('radius-circle', createCircleGeoJSON(
        [markerPosition.longitude, markerPosition.latitude],
        radius
      ));

      map.current.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': '#0038A8',
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: 'radius-circle-outline',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': '#0038A8',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    });

    // Handle map clicks
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      // Update marker position
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      }

      // Update circle position
      if (map.current && map.current.getSource('radius-circle')) {
        const source = map.current.getSource('radius-circle') as mapboxgl.GeoJSONSource;
        source.setData(createCircleGeoJSON([lng, lat], radius).data);
      }
      
      // Update state
      setMarkerPosition({ latitude: lat, longitude: lng });
      onLocationChange(lat, lng);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Only run once on mount

  // Update circle when radius changes
  useEffect(() => {
    if (map.current && map.current.getSource('radius-circle')) {
      const source = map.current.getSource('radius-circle') as mapboxgl.GeoJSONSource;
      source.setData(createCircleGeoJSON(
        [markerPosition.longitude, markerPosition.latitude],
        radius
      ).data);
    }
  }, [radius, markerPosition]);

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="rounded-lg overflow-hidden border border-gray-300" 
        style={{ height: '400px' }}
      />
      <div className="mt-2 text-sm text-gray-600">
        Click on the map to select alert location
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Selected: {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)} • Radius: {radius} km
      </div>
    </div>
  );
}
