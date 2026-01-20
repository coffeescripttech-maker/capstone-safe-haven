// Earthquake Service - USGS API Integration
// Free API, no key required: https://earthquake.usgs.gov

import axios from 'axios';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// Philippines geographic bounds
const PH_BOUNDS = {
  minLatitude: 4,
  maxLatitude: 21,
  minLongitude: 115,
  maxLongitude: 130
};

interface EarthquakeFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
  id: string;
}

interface EarthquakeResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

export const earthquakeService = {
  // Get recent earthquakes in Philippines region
  async getRecentEarthquakes(days: number = 7, minMagnitude: number = 4): Promise<EarthquakeResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const response = await axios.get<EarthquakeResponse>(USGS_BASE_URL, {
        params: {
          format: 'geojson',
          starttime: startDate.toISOString().split('T')[0],
          endtime: endDate.toISOString().split('T')[0],
          minmagnitude: minMagnitude,
          minlatitude: PH_BOUNDS.minLatitude,
          maxlatitude: PH_BOUNDS.maxLatitude,
          minlongitude: PH_BOUNDS.minLongitude,
          maxlongitude: PH_BOUNDS.maxLongitude,
          orderby: 'time-asc'
        },
        timeout: 10000 // 10 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching earthquakes from USGS:', error);
      throw new Error('Failed to fetch earthquake data');
    }
  },

  // Get earthquake statistics
  async getEarthquakeStats(days: number = 30) {
    try {
      const data = await this.getRecentEarthquakes(days, 2); // Include smaller quakes for stats
      const features = data.features || [];

      // Sort by time descending (most recent first)
      const sortedFeatures = features.sort((a, b) => b.properties.time - a.properties.time);

      return {
        total: features.length,
        period: `${days} days`,
        byMagnitude: {
          minor: features.filter(f => f.properties.mag >= 2 && f.properties.mag < 4).length,
          light: features.filter(f => f.properties.mag >= 4 && f.properties.mag < 5).length,
          moderate: features.filter(f => f.properties.mag >= 5 && f.properties.mag < 6).length,
          strong: features.filter(f => f.properties.mag >= 6 && f.properties.mag < 7).length,
          major: features.filter(f => f.properties.mag >= 7).length
        },
        latest: sortedFeatures[0] || null,
        strongest: features.length > 0 
          ? features.reduce((max, f) => f.properties.mag > max.properties.mag ? f : max)
          : null
      };
    } catch (error) {
      console.error('Error calculating earthquake stats:', error);
      throw new Error('Failed to calculate earthquake statistics');
    }
  },

  // Get magnitude description
  getMagnitudeDescription(magnitude: number): string {
    if (magnitude < 3.0) return 'Minor';
    if (magnitude < 4.0) return 'Light';
    if (magnitude < 5.0) return 'Moderate';
    if (magnitude < 6.0) return 'Strong';
    if (magnitude < 7.0) return 'Major';
    if (magnitude < 8.0) return 'Great';
    return 'Extreme';
  },

  // Get magnitude color for UI
  getMagnitudeColor(magnitude: number): string {
    if (magnitude < 3.0) return 'gray';
    if (magnitude < 4.0) return 'green';
    if (magnitude < 5.0) return 'yellow';
    if (magnitude < 6.0) return 'orange';
    if (magnitude < 7.0) return 'red';
    return 'darkred';
  },

  // Format earthquake for display
  formatEarthquake(feature: EarthquakeFeature) {
    return {
      id: feature.id,
      magnitude: feature.properties.mag,
      magnitudeDescription: this.getMagnitudeDescription(feature.properties.mag),
      magnitudeColor: this.getMagnitudeColor(feature.properties.mag),
      place: feature.properties.place,
      time: new Date(feature.properties.time).toISOString(),
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        depth: feature.geometry.coordinates[2]
      },
      url: feature.properties.url,
      tsunami: feature.properties.tsunami === 1,
      alert: feature.properties.alert,
      significance: feature.properties.sig
    };
  }
};
