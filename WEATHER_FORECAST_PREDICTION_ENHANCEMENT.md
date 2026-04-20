# Weather Forecast Prediction Enhancement

## Current Implementation (Reactive)

Ang current system ay **REACTIVE** lang:
- ✅ Nag-fetch ng **current weather** data only
- ✅ Nag-create ng alert kapag **na-meet na** ang threshold (e.g., 70% rain, 50km/h wind)
- ❌ **Walang advance warning** - alert lang kapag nangyayari na
- ❌ **Walang forecast** - hindi nag-predict ng future conditions

### Example ng Current Behavior:
```
Current: 70mm rain, 60km/h wind → Alert created NOW
Problem: Wala nang time to prepare, nangyayari na!
```

---

## Proposed Enhancement (Predictive)

Ang dapat ay **PREDICTIVE** system:
- ✅ Fetch **hourly forecast** data (next 24-48 hours)
- ✅ Analyze forecast to **predict** severe weather
- ✅ Create **advance alerts** with specific timing
- ✅ Show **"X hours before"** sa notification

### Example ng Improved Behavior:
```
Forecast Analysis:
- Current: 20mm rain, 30km/h wind (Normal)
- In 3 hours: 70mm rain, 60km/h wind (Severe!)

Alert Created:
"⚠️ Heavy Rain Expected in 3 Hours
Dagupan City will experience heavy rainfall (70mm) 
and strong winds (60km/h) starting at 3:00 PM.
Prepare now!"
```

---

## Implementation Plan

### 1. Enhance Weather Service (Add Forecast)

**File**: `MOBILE_APP/backend/src/services/weather.service.ts`

```typescript
// Add hourly forecast method
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
    console.error('Error fetching forecast:', error);
    throw new Error('Failed to fetch forecast data');
  }
},

// Analyze forecast for severe weather
async analyzeForecast(lat: number, lon: number): Promise<{
  hasSevereWeather: boolean;
  hoursUntil: number;
  severity: string;
  conditions: any;
}> {
  const forecast = await this.getHourlyForecast(lat, lon, 24);
  
  // Check each hour for severe conditions
  for (let i = 0; i < forecast.hourly.time.length; i++) {
    const precipitation = forecast.hourly.precipitation[i];
    const windSpeed = forecast.hourly.wind_speed_10m[i];
    const precipProb = forecast.hourly.precipitation_probability[i];
    
    // Severe weather thresholds
    if (precipitation > 50 || windSpeed > 50 || precipProb > 70) {
      return {
        hasSevereWeather: true,
        hoursUntil: i,
        severity: this.calculateSeverity(precipitation, windSpeed, precipProb),
        conditions: {
          time: forecast.hourly.time[i],
          precipitation,
          windSpeed,
          precipProb
        }
      };
    }
  }
  
  return { hasSevereWeather: false, hoursUntil: 0, severity: 'none', conditions: null };
},

calculateSeverity(precip: number, wind: number, prob: number): string {
  if (precip > 100 || wind > 80 || prob > 90) return 'critical';
  if (precip > 70 || wind > 60 || prob > 80) return 'high';
  if (precip > 50 || wind > 50 || prob > 70) return 'moderate';
  return 'low';
}
```

### 2. Update Alert Automation (Use Forecast)

**File**: `MOBILE_APP/backend/src/services/alertAutomation.service.ts`

```typescript
// Enhanced weather monitoring with forecast
async monitorWeatherWithForecast(): Promise<number> {
  try {
    const cities = [
      { name: 'Dagupan City', lat: 16.0433, lon: 120.3397 },
      { name: 'San Carlos City', lat: 15.9294, lon: 120.3417 },
      // ... other cities
    ];
    
    let alertsCreated = 0;
    
    for (const city of cities) {
      // Analyze forecast for next 24 hours
      const analysis = await weatherService.analyzeForecast(city.lat, city.lon);
      
      if (analysis.hasSevereWeather) {
        // Check if alert already exists
        const recentAlert = await this.checkRecentAlert('auto_weather', city.name, 60);
        
        if (!recentAlert) {
          await this.createPredictiveWeatherAlert(city, analysis);
          alertsCreated++;
        }
      }
    }
    
    return alertsCreated;
  } catch (error) {
    console.error('[Alert Automation] Error monitoring forecast:', error);
    return 0;
  }
},

// Create predictive alert with timing
async createPredictiveWeatherAlert(city: any, analysis: any): Promise<number | null> {
  const connection = await pool.getConnection();
  
  try {
    const hoursText = analysis.hoursUntil === 1 ? '1 hour' : `${analysis.hoursUntil} hours`;
    const conditions = analysis.conditions;
    
    const title = `⚠️ Severe Weather Expected in ${hoursText}`;
    const description = `${city.name} will experience severe weather conditions starting at ${new Date(conditions.time).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}.

Expected Conditions:
• Rainfall: ${conditions.precipitation}mm
• Wind Speed: ${conditions.windSpeed}km/h  
• Probability: ${conditions.precipProb}%

⏰ Time to prepare: ${hoursText}
🏠 Secure your home and belongings
📱 Stay updated with alerts`;
    
    // Calculate start_time (when severe weather begins)
    const startTime = new Date(conditions.time);
    
    const [result] = await connection.query<any>(
      `INSERT INTO disaster_alerts 
      (alert_type, severity, title, description, source, source_data, affected_areas, 
       latitude, longitude, radius_km, start_time, is_active, created_by, auto_approved, 
       advance_notice_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?)`,
      [
        'typhoon', // or 'storm_surge' based on conditions
        analysis.severity,
        title,
        description,
        'auto_weather',
        JSON.stringify({ forecast: conditions, analysis }),
        JSON.stringify([city.name]),
        city.lat,
        city.lon,
        50,
        startTime,
        analysis.hoursUntil
      ]
    );
    
    const alertId = result.insertId;
    
    // Target users
    const usersTargeted = await alertTargetingService.targetUsersByCity(city.name, alertId, title);
    
    console.log(`[Alert Automation] Created predictive alert #${alertId} for ${city.name} (${hoursText} advance notice), targeted ${usersTargeted} users`);
    
    return alertId;
  } catch (error) {
    console.error('[Alert Automation] Error creating predictive alert:', error);
    return null;
  } finally {
    connection.release();
  }
}
```

### 3. Add Database Column for Advance Notice

**File**: `MOBILE_APP/database/migrations/014_add_advance_notice_hours.sql`

```sql
-- Add column to track advance notice hours
ALTER TABLE disaster_alerts 
ADD COLUMN advance_notice_hours INT DEFAULT NULL COMMENT 'Hours of advance notice given (for predictive alerts)';

-- Add index for querying predictive alerts
CREATE INDEX idx_advance_notice ON disaster_alerts(advance_notice_hours);
```

### 4. Update Mobile App Display

**File**: `MOBILE_APP/mobile/src/components/alerts/AlertCard.tsx`

```typescript
// Show advance notice prominently
{alert.advance_notice_hours && (
  <View style={styles.advanceNotice}>
    <Ionicons name="time-outline" size={16} color={COLORS.warning} />
    <Text style={styles.advanceNoticeText}>
      ⏰ {alert.advance_notice_hours} hour{alert.advance_notice_hours > 1 ? 's' : ''} advance notice
    </Text>
  </View>
)}
```

---

## Key Differences: Weather vs Earthquake

### 🌦️ Weather/Typhoon (PREDICTABLE)
- ✅ Can fetch **forecast data** (next 24-48 hours)
- ✅ Can **predict** severe conditions in advance
- ✅ Can give **X hours warning** before event
- ✅ Users have **time to prepare**
- Example: "Heavy rain in 3 hours - prepare now!"

### 🌍 Earthquake (UNPREDICTABLE)
- ❌ **Cannot predict** when/where it will happen
- ❌ **No forecast** data available
- ✅ Can only **detect** after it happens
- ✅ Alert sent **immediately** after detection
- Example: "M5.2 earthquake detected 50km away - aftershocks possible"

---

## Benefits of Predictive Weather Alerts

1. **Early Warning** - Users get advance notice (1-6 hours)
2. **Time to Prepare** - Secure homes, evacuate if needed
3. **Better Response** - LGUs can mobilize resources
4. **Reduced Panic** - Calm, organized preparation vs sudden alert
5. **Accurate Timing** - "Expected at 3:00 PM" vs "Happening now!"

---

## API Used: Open-Meteo

**Current**: Only using `current` weather
```
https://api.open-meteo.com/v1/forecast?
  latitude=16.0433&
  longitude=120.3397&
  current=temperature_2m,precipitation,wind_speed_10m
```

**Enhanced**: Add `hourly` forecast
```
https://api.open-meteo.com/v1/forecast?
  latitude=16.0433&
  longitude=120.3397&
  hourly=temperature_2m,precipitation,wind_speed_10m,precipitation_probability&
  forecast_hours=24
```

---

## Implementation Priority

1. ✅ **Phase 1**: Add forecast fetching to weather service
2. ✅ **Phase 2**: Add forecast analysis logic
3. ✅ **Phase 3**: Update alert automation to use forecast
4. ✅ **Phase 4**: Add database column for advance notice
5. ✅ **Phase 5**: Update mobile/web UI to show advance notice

---

## Testing Scenarios

### Scenario 1: Heavy Rain Forecast
```
Current: 10mm rain (Normal)
Forecast (3 hours): 80mm rain (Severe)
→ Alert: "Heavy rain expected in 3 hours"
```

### Scenario 2: Strong Winds Forecast
```
Current: 20km/h wind (Normal)
Forecast (5 hours): 70km/h wind (Severe)
→ Alert: "Strong winds expected in 5 hours"
```

### Scenario 3: Typhoon Approach
```
Current: Cloudy (Normal)
Forecast (6 hours): 100mm rain + 90km/h wind (Critical)
→ Alert: "Typhoon conditions expected in 6 hours - EVACUATE NOW"
```

---

## Conclusion

**Tama ka!** Ang current system ay reactive lang. Dapat i-enhance para maging **predictive** with:
- ✅ Hourly forecast data
- ✅ Advance warning (X hours before)
- ✅ Specific timing ("Expected at 3:00 PM")
- ✅ Time to prepare

Unlike earthquakes na hindi ma-predict, ang weather/typhoon ay may forecast data kaya pwede mag-advance warning! 🌦️⏰
