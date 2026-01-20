// Weather Controller - Handle weather API requests

import { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';

// Get weather for major Philippine cities
export const getPhilippinesWeather = async (req: Request, res: Response) => {
  try {
    const weather = await weatherService.getPhilippinesWeather();
    res.json({ 
      success: true, 
      data: weather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getPhilippinesWeather:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch weather data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get weather for specific location
export const getLocationWeather = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    // Validate parameters
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    // Validate numeric values
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Validate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const weather = await weatherService.getCurrentWeather(latitude, longitude);
    
    res.json({ 
      success: true, 
      data: {
        latitude,
        longitude,
        temperature: weather.current.temperature_2m,
        humidity: weather.current.relative_humidity_2m,
        windSpeed: weather.current.wind_speed_10m,
        precipitation: weather.current.precipitation,
        weatherCode: weather.current.weather_code,
        weatherDescription: weatherService.getWeatherDescription(weather.current.weather_code),
        weatherIcon: weatherService.getWeatherIcon(weather.current.weather_code),
        apparentTemperature: weather.current.apparent_temperature
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getLocationWeather:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch weather data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
