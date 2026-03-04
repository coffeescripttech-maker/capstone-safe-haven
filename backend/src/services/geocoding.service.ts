// Geocoding Service - Convert addresses to coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)

import axios from 'axios';
import { logger } from '../utils/logger';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'SafeHaven-DisasterApp/1.0';

  /**
   * Geocode an address to get latitude and longitude
   * @param address Full address string
   * @returns Coordinates or null if geocoding fails
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      if (!address || address.trim().length === 0) {
        return null;
      }

      logger.info(`Geocoding address: ${address}`);

      // Try full address first
      let result = await this.tryGeocode(address);
      
      if (!result) {
        // Fallback 1: Try without street address (just barangay, city, province, country)
        const parts = address.split(',').map(p => p.trim());
        if (parts.length > 3) {
          const fallback1 = parts.slice(-4).join(', ');
          logger.info(`Trying fallback without street: ${fallback1}`);
          result = await this.tryGeocode(fallback1);
        }
      }
      
      if (!result) {
        // Fallback 2: Try just city, province, country
        const parts = address.split(',').map(p => p.trim());
        if (parts.length > 2) {
          const fallback2 = parts.slice(-3).join(', ');
          logger.info(`Trying fallback city+province: ${fallback2}`);
          result = await this.tryGeocode(fallback2);
        }
      }
      
      if (!result) {
        // Fallback 3: Try just province and country
        const parts = address.split(',').map(p => p.trim());
        if (parts.length > 1) {
          const fallback3 = parts.slice(-2).join(', ');
          logger.info(`Trying fallback province only: ${fallback3}`);
          result = await this.tryGeocode(fallback3);
        }
      }

      if (result) {
        logger.info(`Geocoding successful: ${result.latitude}, ${result.longitude}`);
        return result;
      }

      logger.warn(`No geocoding results found for: ${address}`);
      return null;
    } catch (error: any) {
      logger.error('Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Try to geocode an address using Nominatim API
   * @param address Address string to geocode
   * @returns Coordinates or null
   */
  private async tryGeocode(address: string): Promise<Coordinates | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'ph', // Limit to Philippines
          addressdetails: 1
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
      }

      return null;
    } catch (error: any) {
      logger.error('Nominatim API error:', error.message);
      return null;
    }
  }

  /**
   * Build a full address string from components
   * @param components Address components
   * @returns Formatted address string
   */
  buildAddress(components: {
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  }): string {
    const parts = [
      components.address,
      components.barangay,
      components.city,
      components.province,
      'Philippines'
    ].filter(part => part && part.trim().length > 0);

    return parts.join(', ');
  }

  /**
   * Reverse geocode coordinates to get address
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns Address string or null
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      logger.info(`Reverse geocoding: ${latitude}, ${longitude}`);

      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 5000
      });

      if (response.data && response.data.display_name) {
        logger.info(`Reverse geocoding successful: ${response.data.display_name}`);
        return response.data.display_name;
      }

      return null;
    } catch (error: any) {
      logger.error('Reverse geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Validate coordinates
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns True if valid
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Check if coordinates are within Philippines bounds
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns True if within Philippines
   */
  isWithinPhilippines(latitude: number, longitude: number): boolean {
    // Philippines approximate bounds
    const bounds = {
      north: 21.5,
      south: 4.5,
      east: 127,
      west: 116
    };

    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }
}

export const geocodingService = new GeocodingService();
