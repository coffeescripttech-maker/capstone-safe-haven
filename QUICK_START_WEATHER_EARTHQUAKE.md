# Quick Start: Weather & Earthquake Monitoring

## ✅ Implementation Complete!

All backend and frontend code has been created. Follow these steps to test:

## Step 1: Start Backend Server

```powershell
cd backend
npm run dev
```

Wait for: `Server running on port 3000`

## Step 2: Get Admin Token

In a new terminal:
```powershell
cd backend
.\test-token.ps1
```

Copy the admin token from the output.

## Step 3: Set Environment Variable

```powershell
$env:ADMIN_TOKEN = "paste_your_token_here"
```

## Step 4: Test Backend APIs

```powershell
cd backend
.\test-weather-earthquake.ps1
```

You should see:
- ✓ Philippines Weather (6 cities)
- ✓ Location Weather (Manila)
- ✓ Recent Earthquakes
- ✓ Earthquake Statistics

## Step 5: Start Frontend

In a new terminal:
```powershell
cd web_app
npm run dev
```

## Step 6: View Monitoring Dashboard

1. Open browser: http://localhost:3001
2. Login as admin
3. Click "Monitoring" in sidebar
4. View real-time weather and earthquake data!

## Features You'll See

### Weather Section
- 6 major Philippine cities
- Current temperature, humidity, wind speed
- Weather conditions with emoji icons
- "Feels like" temperature
- Precipitation data

### Earthquake Section
- 30-day statistics by magnitude
- Recent earthquakes (last 7 days, M4+)
- Magnitude classification with color coding
- Location coordinates and depth
- Links to USGS for details
- Tsunami warnings (if any)

### Auto-Refresh
- Automatically refreshes every 5 minutes
- Manual refresh button available
- Last update timestamp shown

## Troubleshooting

### Backend not starting?
- Check if port 3000 is available
- Ensure MySQL is running
- Check `.env` file exists

### No weather data?
- Check internet connection
- Open-Meteo API is free, no key needed
- Check backend console for errors

### No earthquake data?
- This is normal if no M4+ earthquakes in last 7 days
- Try changing parameters in test script
- USGS API is free, no key needed

### Frontend errors?
- Clear browser cache
- Check if backend is running
- Verify admin token is valid

## API Endpoints

All require admin authentication:

```
GET /api/v1/admin/weather/philippines
GET /api/v1/admin/weather/location?lat=X&lon=Y
GET /api/v1/admin/earthquakes/recent?days=7&minMagnitude=4
GET /api/v1/admin/earthquakes/stats?days=30
```

## Next Steps

1. ✅ Test all features work
2. ✅ Verify auto-refresh
3. ✅ Check mobile responsiveness
4. Consider adding:
   - Weather alerts for severe conditions
   - Earthquake notifications for M5+
   - Historical charts
   - Map visualization
   - Mobile app integration

## Success! 🎉

You now have real-time environmental monitoring integrated into SafeHaven!
