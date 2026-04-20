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

  // Get hourly forecast for next X hours
  async getHourlyForecast(lat: number, lon: number, hours: number = 24): Promise<any> {
    try {
      const response = await axios.get(OPEN_METEO_BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,precipitation,wind_speed_10m,weather_code,precipitation_probability',
          forecast_hours: hours,
          timezone: 'Asia/Manila'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast from Open-Meteo:', error);
      throw new Error('Failed to fetch forecast data');
    }
  },

  // Analyze forecast for severe weather conditions
  async analyzeForecast(lat: number, lon: number, cityName: string): Promise<{
    hasSevereWeather: boolean;
    hoursUntil: number;
    severity: string;
    conditions: any;
    cityName: string;
  }> {
    try {
      const forecast = await this.getHourlyForecast(lat, lon, 24);
      
      // Check each hour for severe conditions
      for (let i = 0; i < forecast.hourly.time.length; i++) {
        const precipitation = forecast.hourly.precipitation[i] || 0;
        const windSpeed = forecast.hourly.wind_speed_10m[i] || 0;
        const precipProb = forecast.hourly.precipitation_probability[i] || 0;
        const weatherCode = forecast.hourly.weather_code[i] || 0;
        
        // Severe weather thresholds
        const isSevere = precipitation > 50 || windSpeed > 50 || precipProb > 70 || weatherCode >= 95;
        
        if (isSevere && i > 0) { // Only alert if at least 1 hour in advance
          return {
            hasSevereWeather: true,
            hoursUntil: i,
            severity: this.calculateSeverity(precipitation, windSpeed, precipProb, weatherCode),
            conditions: {
              time: forecast.hourly.time[i],
              precipitation,
              windSpeed,
              precipProb,
              weatherCode,
              weatherDescription: this.getWeatherDescription(weatherCode),
              temperature: forecast.hourly.temperature_2m[i]
            },
            cityName
          };
        }
      }
      
      return { 
        hasSevereWeather: false, 
        hoursUntil: 0, 
        severity: 'none', 
        conditions: null,
        cityName 
      };
    } catch (error) {
      console.error(`Error analyzing forecast for ${cityName}:`, error);
      return { 
        hasSevereWeather: false, 
        hoursUntil: 0, 
        severity: 'none', 
        conditions: null,
        cityName 
      };
    }
  },

  // Calculate severity based on multiple factors
  calculateSeverity(precip: number, wind: number, prob: number, weatherCode: number): string {
    // Critical: Thunderstorm or extreme conditions
    if (weatherCode >= 95 || precip > 100 || wind > 80 || prob > 90) return 'critical';
    // High: Heavy rain/wind
    if (precip > 70 || wind > 60 || prob > 80) return 'high';
    // Moderate: Significant rain/wind
    if (precip > 50 || wind > 50 || prob > 70) return 'moderate';
    return 'low';
  },

  // Get weather for major Philippine cities
  async getPhilippinesWeather(): Promise<WeatherData[]> {
    const cities = [
      // { name: 'Manila', lat: 14.5995, lon: 120.9842 },
      // { name: 'Cebu City', lat: 10.3157, lon: 123.8854 },
      // { name: 'Davao City', lat: 7.1907, lon: 125.4553 },
      // { name: 'Quezon City', lat: 14.6760, lon: 121.0437 },
      // { name: 'Baguio', lat: 16.4023, lon: 120.5960 },
      // { name: 'Iloilo City', lat: 10.7202, lon: 122.5621 },
      // { name: 'Legazpi City', lat: 13.1391, lon: 123.7438 },
      // Pangasinan cities for environmental monitoring
   
   { name: 'Libertad, Tayug', lat: 16.0305, lon: 120.7442 },
      { name: 'Dagupan City', lat: 16.0433, lon: 120.3397 },
{ name: 'San Carlos City', lat: 15.9294, lon: 120.3417 },
{ name: 'Urdaneta City', lat: 15.9761, lon: 120.5711 },
{ name: 'Alaminos City', lat: 16.1581, lon: 119.9819 },
{ name: 'Lingayen', lat: 16.0194, lon: 120.2286 }

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
