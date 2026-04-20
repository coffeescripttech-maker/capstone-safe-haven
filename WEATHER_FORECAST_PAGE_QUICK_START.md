# Weather Forecast Page - Quick Start Guide

## ✅ Issue Fixed

The 404 errors are now resolved! I created temporary mock API endpoints so you can see the page working with sample data.

## What Was Created

### 1. Mock API Endpoints
- **`/api/weather/forecasts`** - Returns sample weather forecast data
- **`/api/weather/forecast-alerts`** - Returns sample forecast-triggered alerts

### 2. Files Created
```
MOBILE_APP/web_app/src/app/api/weather/
├── forecasts/
│   └── route.ts          (Mock forecast data)
└── forecast-alerts/
    └── route.ts          (Mock alert data)
```

## How to Test

1. **Start the web app** (if not running):
   ```powershell
   cd MOBILE_APP/web_app
   npm run dev
   ```

2. **Navigate to the page**:
   - Go to: `http://localhost:3000/weather-forecast`
   - Or click "Weather Forecast" in the sidebar

3. **You should see**:
   - 4 weather forecast cards with sample data
   - Statistics showing total forecasts, high risk, alerts triggered
   - Recent forecast-triggered alerts table
   - Filters for location and severity
   - Auto-refresh button

## Sample Data Included

### Weather Forecasts
1. **Manila** - Heavy Rain (85% chance, 2h advance notice) - HIGH severity
2. **Quezon City** - Thunderstorm (70% chance, 1h advance notice) - CRITICAL severity
3. **Makati** - Partly Cloudy (45% chance, 3h advance notice) - MODERATE severity
4. **Pasig** - Cloudy (25% chance, 4h advance notice) - LOW severity

### Forecast-Triggered Alerts
1. Heavy Rain Warning - Manila (2h advance, sent)
2. Severe Thunderstorm Alert - Quezon City (1h advance, sent)
3. Typhoon Warning - Metro Manila (6h advance, sent)
4. Rain Advisory - Makati (3h advance, pending)

## Features You Can Test

### ✅ Working Features
- View weather forecast cards with advance notice hours
- See precipitation probability with color coding
- View temperature, humidity, wind speed
- Filter by location and severity
- View forecast-triggered alerts table
- Refresh button
- Responsive design

### 🔄 Auto-Refresh
- Page automatically refreshes every 5 minutes
- Manual refresh button available

### 🎨 Visual Features
- Color-coded severity (red, orange, yellow, green)
- Weather icons (rain, cloud, wind, thunder)
- Prominent advance notice display
- Statistics cards with gradients

## Next Steps: Real Backend Integration

When you're ready to connect to real data, replace the mock endpoints with actual backend calls:

### Option 1: Connect to Existing Backend
Update the API routes to fetch from your Node.js backend:

```typescript
// In /api/weather/forecasts/route.ts
const response = await fetch(`${process.env.BACKEND_URL}/api/weather/forecasts`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
return NextResponse.json(data);
```

### Option 2: Direct Database Query
Query the weather_forecasts table directly:

```typescript
import { db } from '@/lib/database';

const forecasts = await db.query(`
  SELECT * FROM weather_forecasts 
  WHERE forecast_time > NOW() 
  ORDER BY forecast_time ASC
`);
```

### Option 3: Use Weather Service
Integrate with the existing weather service:

```typescript
import { WeatherService } from '@/backend/src/services/weather.service';

const weatherService = new WeatherService();
const forecasts = await weatherService.getForecasts();
```

## Database Schema Needed

If not yet created, you'll need these tables:

```sql
-- Weather Forecasts Table
CREATE TABLE weather_forecasts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location VARCHAR(255) NOT NULL,
  forecast_time TIMESTAMP NOT NULL,
  temperature DECIMAL(5,2),
  humidity INT,
  wind_speed DECIMAL(5,2),
  precipitation_probability INT,
  weather_condition VARCHAR(100),
  alert_triggered BOOLEAN DEFAULT FALSE,
  advance_notice_hours INT,
  severity ENUM('low', 'moderate', 'high', 'critical'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_forecast_time (forecast_time),
  INDEX idx_location (location)
);

-- Forecast-Triggered Alerts Table
CREATE TABLE forecast_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alert_id INT,
  forecast_id INT,
  alert_title VARCHAR(255),
  alert_type VARCHAR(50),
  severity VARCHAR(50),
  advance_notice_hours INT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'sent', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (alert_id) REFERENCES disaster_alerts(id),
  FOREIGN KEY (forecast_id) REFERENCES weather_forecasts(id)
);
```

## Troubleshooting

### Page shows "No forecast data available"
- Check if the API endpoints are returning data
- Open browser console and check for errors
- Verify the API routes are accessible

### 404 errors in console
- Make sure you created both API route files
- Restart the Next.js dev server
- Clear browser cache

### Data not updating
- Click the refresh button manually
- Check if auto-refresh is working (every 5 minutes)
- Verify API endpoints are responding

## Summary

✅ Weather Forecast page is now working with mock data
✅ No more 404 errors
✅ You can see the UI and test all features
✅ Ready for real backend integration when needed

The page demonstrates:
- Advance notice hours display (e.g., "2 hours advance notice")
- Precipitation probability with color coding
- Weather details (temp, humidity, wind)
- Forecast-triggered alerts
- Filters and auto-refresh
- Professional, modern UI

Perfect for showing how the predictive weather alert system works!
