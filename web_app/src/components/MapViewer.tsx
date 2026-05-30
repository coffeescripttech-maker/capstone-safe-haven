'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewerProps {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  title?: string;
  showDirections?: boolean; // Auto-show directions from user's location
  height?: string;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
  }>;
}

export default function MapViewer({ 
  latitude, 
  longitude, 
  radius, 
  title, 
  showDirections = false,
  height = '400px',
  markers 
}: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Convert to numbers if they're strings
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  // Debug logging
  useEffect(() => {
    console.log('🗺️ MapViewer props:', { latitude: lat, longitude: lng, radius, title, showDirections });
  }, [lat, lng, radius, title, showDirections]);

  // Get user's current location
  useEffect(() => {
    if (showDirections) {
      console.log('🔍 Checking for geolocation support...');
      
      if (!('geolocation' in navigator)) {
        const errorMsg = 'Geolocation is not supported by this browser';
        console.error('❌', errorMsg);
        setLocationError(errorMsg);
        return;
      }

      console.log('✅ Geolocation supported, requesting position...');
      setLocationError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 User location obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setUserLocation([position.coords.longitude, position.coords.latitude]);
          setLocationError(null);
        },
        (error) => {
          console.error('❌ Geolocation error:', {
            code: error.code,
            message: error.message
          });
          
          // Show user-friendly error messages
          let errorMsg = 'Could not get your location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location access to see the route.';
              console.warn('⚠️ User denied location permission');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable';
              console.warn('⚠️ Location information unavailable');
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out';
              console.warn('⚠️ Location request timed out');
              break;
          }
          setLocationError(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [showDirections]);

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

  // Function to check if two points are reasonably close (within ~500km)
  const areLocationsReasonablyClose = (loc1: [number, number], loc2: [number, number]): boolean => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2[1] - loc1[1]) * Math.PI / 180;
    const dLon = (loc2[0] - loc1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1[1] * Math.PI / 180) * Math.cos(loc2[1] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    console.log(`📏 Distance between locations: ${distance.toFixed(1)} km`);
    return distance < 500; // Within 500km is reasonable for driving
  };

  // Function to fetch and display route
  const fetchAndDisplayRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) {
      console.error('❌ Map not initialized');
      return;
    }

    console.log('🛣️ Fetching route...', {
      start: { lng: start[0], lat: start[1] },
      end: { lng: end[0], lat: end[1] }
    });

    setIsLoadingRoute(true);
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      console.log('📡 Fetching from:', url);
      
      const query = await fetch(url, { method: 'GET' });
      
      if (!query.ok) {
        throw new Error(`HTTP error! status: ${query.status}`);
      }
      
      const json = await query.json();
      console.log('📦 Route response:', json);
      
      if (!json.routes || json.routes.length === 0) {
        console.error('❌ No routes found in response');
        return;
      }

      const data = json.routes[0];
      const route = data.geometry.coordinates;
      
      console.log('✅ Route data:', {
        distance: `${(data.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(data.duration / 60)} minutes`,
        points: route.length
      });

      const geojson: any = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      // Remove existing route layers if any
      if (map.current.getLayer('route')) {
        console.log('🗑️ Removing existing route layer');
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        console.log('🗑️ Removing existing route source');
        map.current.removeSource('route');
      }

      // Add route layer
      console.log('➕ Adding route to map');
      map.current.addSource('route', {
        type: 'geojson',
        data: geojson
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0038A8',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      console.log('✅ Route layer added successfully');

      // Fit map to show entire route
      const coordinates = route;
      const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 80
      });

      console.log('✅ Map bounds adjusted to show route');

      // Calculate distance and duration
      const distance = (data.distance / 1000).toFixed(1); // km
      const duration = Math.round(data.duration / 60); // minutes

      console.log(`✅ Route displayed: ${distance}km, ~${duration} minutes`);
    } catch (error) {
      console.error('❌ Error fetching route:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setIsLoadingRoute(false);
    }
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

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle multiple markers if provided
    if (markers && markers.length > 0) {
      markers.forEach((marker) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="${marker.color || '#0038A8'}"/>
            <circle cx="15" cy="15" r="5" fill="white"/>
          </svg>
        `;

        const mapMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(map.current!);

        if (marker.title || marker.description) {
          const popupContent = `
            <div style="padding: 8px;">
              ${marker.title ? `<div style="font-weight: 600; margin-bottom: 4px;">${marker.title}</div>` : ''}
              ${marker.description ? `<div style="font-size: 14px; color: #666;">${marker.description}</div>` : ''}
            </div>
          `;
          new mapboxgl.Popup({ offset: 25 })
            .setLngLat([marker.longitude, marker.latitude])
            .setHTML(popupContent)
            .addTo(map.current!);
        }
      });
    } else {
      // Single marker (original behavior)
      const el = document.createElement('div');
      el.innerHTML = `
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="#f97316"/>
          <circle cx="15" cy="15" r="5" fill="white"/>
        </svg>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current);

      if (title) {
        new mapboxgl.Popup({ offset: 25 })
          .setLngLat([lng, lat])
          .setHTML(`<div style="padding: 4px 8px; font-weight: 500;">${title}</div>`)
          .addTo(map.current);
      }
    }

    // Wait for map to load before adding circle or route
    map.current.on('load', () => {
      if (!map.current) return;

      // Add radius circle if provided
      if (radius && radius > 0) {
        console.log('🎯 Adding radius circle:', radius, 'km');
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
      }

      // Add route if showDirections is enabled and user location is available
      if (showDirections && userLocation) {
        console.log('🛣️ User location available, checking if route is feasible...');
        console.log('From:', userLocation, 'To:', [lng, lat]);
        
        // Check if locations are reasonably close for driving directions
        const canDrive = areLocationsReasonablyClose(userLocation, [lng, lat]);
        
        let startLocation = userLocation;
        let usingFallback = false;
        
        if (!canDrive) {
          // Use a fallback location near the incident (e.g., 10km away)
          // This simulates an admin office location in the same region
          const fallbackLat = lat + 0.05; // ~5km north
          const fallbackLng = lng + 0.05; // ~5km east
          startLocation = [fallbackLng, fallbackLat];
          usingFallback = true;
          setIsUsingFallback(true);
          
          console.warn('⚠️ User location too far from incident. Using fallback location for demo.');
          console.log('📍 Fallback location:', startLocation);
        } else {
          setIsUsingFallback(false);
        }
        
        // Add user/start location marker
        const userMarkerEl = document.createElement('div');
        userMarkerEl.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="${usingFallback ? '#3b82f6' : '#10b981'}" stroke="white" stroke-width="3"/>
          </svg>
        `;
        
        const markerLabel = usingFallback ? 'Response Team Location (Demo)' : 'Your Location';
        new mapboxgl.Marker(userMarkerEl)
          .setLngLat(startLocation)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="padding: 4px 8px; font-weight: 500;">${markerLabel}</div>`))
          .addTo(map.current);

        console.log('✅ Start location marker added');

        // Fetch and display route
        fetchAndDisplayRoute(startLocation, [lng, lat]);
      } else if (showDirections && !userLocation) {
        console.warn('⚠️ showDirections is true but userLocation is not available yet');
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, radius, title, markers, showDirections, userLocation]);

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg"
        style={{ height }}
      />
      {isLoadingRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading route...</span>
          </div>
        </div>
      )}
      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-warning-50 border border-warning-300 px-4 py-3 rounded-lg shadow-lg max-w-md z-10">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-warning-900">Location Access Required</p>
              <p className="text-sm text-warning-700 mt-1">{locationError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
