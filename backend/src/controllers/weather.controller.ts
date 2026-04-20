import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { weatherService } from '../services/weather.service';
import db from '../config/database';
import { RowDataPacket } from 'mysql2';

export class WeatherController {
  /**
   * Get weather forecasts with advance notice
   */
  async getForecasts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get current weather data for Philippine cities
      const weatherData = await weatherService.getPhilippinesWeather();
      
      // Transform to forecast format with advance notice calculation
      const forecasts = await Promise.all(weatherData.map(async (weather) => {
        // Analyze forecast for severe weather
        const analysis = await weatherService.analyzeForecast(
          weather.lat,
          weather.lon,
          weather.name
        );
        
        // Calculate precipitation probability based on weather code
        const precipProb = this.calculatePrecipitationProbability(weather.weatherCode);
        
        // Determine if alert should be triggered
        const alertTriggered = analysis.hasSevereWeather;
        
        // Calculate severity
        const severity = analysis.severity !== 'none' ? analysis.severity : 
                        precipProb >= 70 ? 'high' :
                        precipProb >= 50 ? 'moderate' : 'low';
        
        return {
          id: Math.floor(Math.random() * 10000), // Temporary ID
          location: weather.name,
          forecast_time: analysis.conditions?.time || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          temperature: Math.round(weather.temperature),
          humidity: weather.humidity,
          wind_speed: Math.round(weather.windSpeed),
          precipitation_probability: precipProb,
          weather_condition: weather.weatherDescription,
          alert_triggered: alertTriggered,
          advance_notice_hours: analysis.hoursUntil || 0,
          severity: severity,
          created_at: new Date().toISOString()
        };
      }));
      
      res.json({
        status: 'success',
        data: forecasts
      });
    } catch (error) {
      console.error('Error fetching weather forecasts:', error);
      next(error);
    }
  }

  /**
   * Get forecast-triggered alerts
   */
  async getForecastAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get alerts that were auto-generated from weather forecasts
      // These are alerts with source = 'auto_weather' and have advance_notice_hours
      const [alerts] = await db.query<RowDataPacket[]>(
        `SELECT 
          id,
          id as alert_id,
          0 as forecast_id,
          title as alert_title,
          alert_type,
          severity,
          advance_notice_hours,
          created_at as triggered_at,
          CASE 
            WHEN is_active = 1 THEN 'sent'
            ELSE 'cancelled'
          END as status
        FROM disaster_alerts
        WHERE source = 'auto_weather'
          AND advance_notice_hours > 0
        ORDER BY created_at DESC
        LIMIT 20`
      );
      
      res.json({
        status: 'success',
        data: alerts
      });
    } catch (error) {
      console.error('Error fetching forecast alerts:', error);
      next(error);
    }
  }

  /**
   * Calculate precipitation probability based on weather code
   */
  private calculatePrecipitationProbability(weatherCode: number): number {
    // WMO Weather interpretation codes
    if (weatherCode === 0) return 0; // Clear
    if (weatherCode <= 3) return 10; // Partly cloudy
    if (weatherCode <= 48) return 30; // Fog
    if (weatherCode <= 57) return 60; // Drizzle
    if (weatherCode <= 67) return 80; // Rain
    if (weatherCode <= 77) return 70; // Snow
    if (weatherCode <= 82) return 85; // Rain showers
    if (weatherCode <= 86) return 75; // Snow showers
    if (weatherCode >= 95) return 95; // Thunderstorm
    return 50;
  }

  /**
   * Get current weather for all monitored cities (Mobile)
   */
  async getCurrentWeather(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const weatherData = await weatherService.getPhilippinesWeather();
      
      res.json({
        status: 'success',
        data: weatherData
      });
    } catch (error) {
      console.error('Error fetching current weather:', error);
      next(error);
    }
  }

  /**
   * Get hourly forecast for specific location (Mobile)
   */
  async getHourlyForecast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { lat, lon, hours = 24 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({
          status: 'error',
          message: 'Latitude and longitude are required'
        });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const forecastHours = parseInt(hours as string);

      // Get hourly forecast from Open-Meteo
      const forecastData = await weatherService.getHourlyForecast(latitude, longitude, forecastHours);
      
      // Transform to mobile-friendly format
      const hourly = forecastData.hourly.time.map((time: string, index: number) => ({
        time,
        temperature: forecastData.hourly.temperature_2m[index],
        precipitation: forecastData.hourly.precipitation[index] || 0,
        windSpeed: forecastData.hourly.wind_speed_10m[index],
        weatherCode: forecastData.hourly.weather_code[index],
        precipitationProbability: forecastData.hourly.precipitation_probability?.[index] || 0
      }));

      res.json({
        status: 'success',
        data: {
          cityName: 'Selected Location',
          lat: latitude,
          lon: longitude,
          hourly
        }
      });
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      next(error);
    }
  }
}

