// Weather Service - Mobile App

import api from './api';

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  apparentTemperature: number;
}

export const weatherService = {
  // Get weather for current location
  async getLocationWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await api.get('/admin/weather/location', {
        params: { lat, lon }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  },

  // Get weather icon emoji
  getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }
};
