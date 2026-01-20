# Weather & Earthquake Integration Plan

## Overview
Integrate real-time weather and earthquake data into SafeHaven admin dashboard for better disaster monitoring and early warning capabilities.

## APIs to Integrate

### 1. Open-Meteo Weather API (100% FREE, NO API KEY!)
- **Endpoint**: https://api.open-meteo.com/v1/forecast
- **Features**: Current weather, 7-day forecast, historical data
- **Coverage**: Global including Philippines
- **Format**: JSON
- **Cost**: Completely free, no registration needed
- **Limits**: None for reasonable use

### 2. USGS Earthquake API (100% FREE, NO API KEY!)
- **Endpoint**: https://earthquake.usgs.gov/fdsnws/event/1/query
- **Features**: Real-time earthquake data (magnitude, depth, location)
- **Coverage**: Global (filter for Philippines region)
- **Format**: GeoJSON
- **Cost**: Completely free
- **Limits**: None

## Implementation Phases

### Phase 1: Backend API Integration (1-2 days)

#### A. Create External API Services
1. `backend/src/services/weather.service.ts` - MeteoSource integration
2. `backend/src/services/earthquake.service.ts` - USGS integration

#### B. Create Controllers
1. `backend/src/controllers/weather.controller.ts`
2. `backend/src/controllers/earthquake.controller.ts`

#### C. Create Routes
1. `backend/src/routes/weather.routes.ts`
2. `backend/src/routes/earthquake.routes.ts`

#### D. Environment Variables (Optional)
Add to `backend/.env` if you want to customize:
```
# Philippines geographic bounds (optional)
PHILIPPINES_LAT_MIN=4
PHILIPPINES_LAT_MAX=21
PHILIPPINES_LON_MIN=115
PHILIPPINES_LON_MAX=130
```

**Note**: No API keys needed! Both APIs are completely free.


### Phase 2: Admin Dashboard UI (1-2 days)
~
#### A. New Dashboard Sections
1. **Weather Widget** - Current conditions for major PH cities
2. **Earthquake Monitor** - Recent earthquakes (last 7 days)
3. **Weather Alerts** - Severe weather warnings
4. **Seismic Activity Map** - Visual earthquake locations

#### B. New Admin Pages
1. `/admin/weather` - Detailed weather monitoring
2. `/admin/earthquakes` - Earthquake history and analysis

### Phase 3: Mobile App Integration (Optional, 1 day)
- Weather widget on HomeScreen
- Earthquake notifications for nearby events

## Detailed Implementation

### Backend Files to Create

#### 1. Weather Service (`backend/src/services/weather.service.ts`)
```typescript
import axios from 'axios';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const weatherService = {
  // Get current weather for coordinates
  async getCurrentWeather(lat: number, lon: number) {
    const response = await axios.get(OPEN_METEO_BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
        timezone: 'Asia/Manila'
      }
    });
    return response.data;
  },

  // Get weather for major PH cities
  async getPhilippinesWeather() {
    const cities = [
      { name: 'Manila', lat: 14.5995, lon: 120.9842 },
      { name: 'Cebu', lat: 10.3157, lon: 123.8854 },
      { name: 'Davao', lat: 7.1907, lon: 125.4553 },
      { name: 'Quezon City', lat: 14.6760, lon: 121.0437 },
      { name: 'Baguio', lat: 16.4023, lon: 120.5960 }
    ];
    
    const weatherData = await Promise.all(
      cities.map(async (city) => {
        const weather = await this.getCurrentWeather(city.lat, city.lon);
        return { 
          ...city, 
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m,
          windSpeed: weather.current.wind_speed_10m,
          precipitation: weather.current.precipitation,
          weatherCode: weather.current.weather_code
        };
      })
    );
    
    return weatherData;
  },

  // Get weather description from code
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
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
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
  }
};
```


#### 2. Earthquake Service (`backend/src/services/earthquake.service.ts`)
```typescript
import axios from 'axios';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const earthquakeService = {
  // Get recent earthquakes in Philippines region
  async getRecentEarthquakes(days: number = 7, minMagnitude: number = 4) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await axios.get(USGS_BASE_URL, {
      params: {
        format: 'geojson',
        starttime: startDate.toISOString().split('T')[0],
        endtime: endDate.toISOString().split('T')[0],
        minmagnitude: minMagnitude,
        minlatitude: 4,
        maxlatitude: 21,
        minlongitude: 115,
        maxlongitude: 130,
        orderby: 'time'
      }
    });

    return response.data;
  },

  // Get earthquake statistics
  async getEarthquakeStats(days: number = 30) {
    const data = await this.getRecentEarthquakes(days, 2);
    const features = data.features || [];

    return {
      total: features.length,
      byMagnitude: {
        minor: features.filter(f => f.properties.mag < 4).length,
        light: features.filter(f => f.properties.mag >= 4 && f.properties.mag < 5).length,
        moderate: features.filter(f => f.properties.mag >= 5 && f.properties.mag < 6).length,
        strong: features.filter(f => f.properties.mag >= 6).length
      },
      latest: features[0] || null
    };
  }
};
```

#### 3. Weather Controller (`backend/src/controllers/weather.controller.ts`)
```typescript
import { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';

export const getPhilippinesWeather = async (req: Request, res: Response) => {
  try {
    const weather = await weatherService.getPhilippinesWeather();
    res.json({ success: true, data: weather });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
  }
};

export const getLocationWeather = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    const weather = await weatherService.getCurrentWeather(Number(lat), Number(lon));
    res.json({ success: true, data: weather });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
  }
};
```


#### 4. Earthquake Controller (`backend/src/controllers/earthquake.controller.ts`)
```typescript
import { Request, Response } from 'express';
import { earthquakeService } from '../services/earthquake.service';

export const getRecentEarthquakes = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days) || 7;
    const minMagnitude = Number(req.query.minMagnitude) || 4;
    const data = await earthquakeService.getRecentEarthquakes(days, minMagnitude);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch earthquake data' });
  }
};

export const getEarthquakeStats = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const stats = await earthquakeService.getEarthquakeStats(days);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching earthquake stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch earthquake statistics' });
  }
};
```

#### 5. Routes (`backend/src/routes/weather.routes.ts`)
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import * as weatherController from '../controllers/weather.controller';

const router = Router();

router.get('/philippines', authenticate, authorize('admin'), weatherController.getPhilippinesWeather);
router.get('/location', authenticate, authorize('admin'), weatherController.getLocationWeather);

export default router;
```

#### 6. Routes (`backend/src/routes/earthquake.routes.ts`)
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import * as earthquakeController from '../controllers/earthquake.controller';

const router = Router();

router.get('/recent', authenticate, authorize('admin'), earthquakeController.getRecentEarthquakes);
router.get('/stats', authenticate, authorize('admin'), earthquakeController.getEarthquakeStats);

export default router;
```


### Frontend Implementation

#### 1. Update API Client (`web_app/src/lib/safehaven-api.ts`)
```typescript
// Add to existing adminApi object
weather: {
  getPhilippines: () => api.get('/admin/weather/philippines'),
  getLocation: (lat: number, lon: number) => 
    api.get(`/admin/weather/location?lat=${lat}&lon=${lon}`)
},
earthquake: {
  getRecent: (days = 7, minMagnitude = 4) => 
    api.get(`/admin/earthquakes/recent?days=${days}&minMagnitude=${minMagnitude}`),
  getStats: (days = 30) => 
    api.get(`/admin/earthquakes/stats?days=${days}`)
}
```

#### 2. Dashboard Widgets (`web_app/src/app/(admin)/dashboard/page.tsx`)
Add new sections to existing dashboard:

```typescript
// Weather Widget Component
const WeatherWidget = () => {
  const [weather, setWeather] = useState([]);
  
  useEffect(() => {
    adminApi.weather.getPhilippines().then(res => setWeather(res.data));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        {weather.map(city => (
          <div key={city.name} className="flex justify-between items-center mb-2">
            <span>{city.name}</span>
            <span>{city.weather.current.temperature}°C</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Earthquake Widget Component
const EarthquakeWidget = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  
  useEffect(() => {
    adminApi.earthquake.getRecent(7, 4).then(res => {
      setEarthquakes(res.data.features.slice(0, 5));
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Earthquakes</CardTitle>
      </CardHeader>
      <CardContent>
        {earthquakes.map(eq => (
          <div key={eq.id} className="mb-2">
            <div className="font-semibold">M{eq.properties.mag}</div>
            <div className="text-sm text-gray-600">{eq.properties.place}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
```


## Step-by-Step Implementation Guide

### Step 1: Setup (2 minutes)
**No API keys needed!** Both APIs are completely free and open.

1. Ensure axios is installed: `cd backend && npm install axios`
2. That's it! Ready to code.

### Step 2: Backend Implementation (30-45 minutes)
1. Create `backend/src/services/weather.service.ts`
2. Create `backend/src/services/earthquake.service.ts`
3. Create `backend/src/controllers/weather.controller.ts`
4. Create `backend/src/controllers/earthquake.controller.ts`
5. Create `backend/src/routes/weather.routes.ts`
6. Create `backend/src/routes/earthquake.routes.ts`
7. Update `backend/src/routes/index.ts` to include new routes:
   ```typescript
   import weatherRoutes from './weather.routes';
   import earthquakeRoutes from './earthquake.routes';
   
   router.use('/admin/weather', weatherRoutes);
   router.use('/admin/earthquakes', earthquakeRoutes);
   ```

### Step 3: Test Backend (10 minutes)
Create `backend/test-weather-earthquake.ps1`:
```powershell
$token = "your_admin_token"
$headers = @{ "Authorization" = "Bearer $token" }

Write-Host "Testing Weather API..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/weather/philippines" -Headers $headers

Write-Host "`nTesting Earthquake API..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/earthquakes/recent?days=7" -Headers $headers
```

### Step 4: Frontend Implementation (45-60 minutes)
1. Update `web_app/src/lib/safehaven-api.ts` with new API methods
2. Create weather widget component
3. Create earthquake widget component
4. Add widgets to dashboard
5. Optional: Create dedicated pages for detailed views

### Step 5: Polish & Testing (30 minutes)
1. Add loading states
2. Add error handling
3. Add auto-refresh (every 5-10 minutes)
4. Test with real data
5. Add icons and better styling

## Benefits

✅ **100% Free** - No API keys, no registration, no limits
✅ **Real-time Monitoring** - Live weather and seismic data
✅ **Early Warning** - Detect potential disasters early
✅ **Better Decision Making** - Data-driven emergency responses
✅ **No Database Required** - Direct API integration
✅ **Philippines-Focused** - Filtered for local relevance
✅ **Open Source** - Reliable and transparent data sources

## Next Steps

Would you like me to:
1. **Start implementing now** - I'll create all backend files first
2. **Create a dedicated monitoring page** - Full-screen weather/earthquake dashboard
3. **Add mobile app integration** - Show weather on mobile HomeScreen
4. **Add automated alerts** - Notify admins of significant earthquakes

Let me know and I'll get started! 🚀
