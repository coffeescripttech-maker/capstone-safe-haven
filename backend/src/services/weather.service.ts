// Weather Service - Open-Meteo API Integration
// Free API, no key required: https://open-meteo.com

import axios from 'axios';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface WeatherData {
  name: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  apparentTemperature: number;
}

export const weatherService = {
  // Get current weather for coordinates
  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    try {
      const response = await axios.get(OPEN_METEO_BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
          timezone: 'Asia/Manila'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather from Open-Meteo:', error);
      throw new Error('Failed to fetch weather data');
    }
  },

  // Get weather for major Philippine cities
  async getPhilippinesWeather(): Promise<WeatherData[]> {
    const cities = [
      { name: 'Manila', lat: 14.5995, lon: 120.9842 },
      { name: 'Cebu City', lat: 10.3157, lon: 123.8854 },
      { name: 'Davao City', lat: 7.1907, lon: 125.4553 },
      { name: 'Quezon City', lat: 14.6760, lon: 121.0437 },
      { name: 'Baguio', lat: 16.4023, lon: 120.5960 },
      { name: 'Iloilo City', lat: 10.7202, lon: 122.5621 },
        { name: 'Legazpi City', lat: 13.1391, lon: 123.7438 }
    ];
    
    try {
      const weatherData = await Promise.all(
        cities.map(async (city) => {
          const weather = await this.getCurrentWeather(city.lat, city.lon);
          return { 
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            temperature: weather.current.temperature_2m,
            humidity: weather.current.relative_humidity_2m,
            windSpeed: weather.current.wind_speed_10m,
            precipitation: weather.current.precipitation,
            weatherCode: weather.current.weather_code,
            weatherDescription: this.getWeatherDescription(weather.current.weather_code),
            apparentTemperature: weather.current.apparent_temperature
          };
        })
      );
      

      console.log({weatherData});
      return weatherData;
    } catch (error) {
      console.error('Error fetching Philippines weather:', error);
      throw new Error('Failed to fetch Philippines weather data');
    }
  },

  // Get weather description from WMO code
  getWeatherDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
  },

  // Get weather icon/emoji based on code
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
