// Check Weather Forecast
// View forecast data without creating alerts

const { weatherService } = require('./dist/services/weather.service');

const cities = [
  { name: 'Libertad, Tayug', lat: 16.0305, lon: 120.7442 },
  { name: 'Dagupan City', lat: 16.0433, lon: 120.3397 },
  { name: 'San Carlos City', lat: 15.9294, lon: 120.3417 },
  { name: 'Urdaneta City', lat: 15.9761, lon: 120.5711 },
  { name: 'Alaminos City', lat: 16.1581, lon: 119.9819 },
  { name: 'Lingayen', lat: 16.0194, lon: 120.2286 }
];

async function checkForecast() {
  console.log('🌦️  Weather Forecast Check - Next 24 Hours\n');
  console.log('='.repeat(80));
  
  for (const city of cities) {
    console.log(`\n📍 ${city.name}`);
    console.log('-'.repeat(80));
    
    try {
      const analysis = await weatherService.analyzeForecast(city.lat, city.lon, city.name);
      
      if (analysis.hasSevereWeather) {
        console.log(`⚠️  SEVERE WEATHER ALERT!`);
        console.log(`   Time until: ${analysis.hoursUntil} hour(s)`);
        console.log(`   Severity: ${analysis.severity.toUpperCase()}`);
        console.log(`   Expected at: ${new Date(analysis.conditions.time).toLocaleString('en-PH')}`);
        console.log(`   Conditions:`);
        console.log(`     • ${analysis.conditions.weatherDescription}`);
        console.log(`     • Rainfall: ${analysis.conditions.precipitation.toFixed(1)}mm`);
        console.log(`     • Wind Speed: ${analysis.conditions.windSpeed.toFixed(1)}km/h`);
        console.log(`     • Probability: ${analysis.conditions.precipProb}%`);
        console.log(`     • Temperature: ${analysis.conditions.temperature.toFixed(1)}°C`);
        console.log(`   🚨 Alert would be created with ${analysis.hoursUntil}h advance notice`);
      } else {
        console.log(`✅ No severe weather forecast`);
        
        // Show current conditions
        const current = await weatherService.getCurrentWeather(city.lat, city.lon);
        console.log(`   Current conditions:`);
        console.log(`     • Temperature: ${current.current.temperature_2m}°C`);
        console.log(`     • ${weatherService.getWeatherDescription(current.current.weather_code)}`);
        console.log(`     • Wind: ${current.current.wind_speed_10m}km/h`);
        console.log(`     • Humidity: ${current.current.relative_humidity_2m}%`);
      }
    } catch (error) {
      console.log(`❌ Error checking forecast: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Legend:');
  console.log('   ⚠️  = Severe weather detected in forecast');
  console.log('   ✅ = No severe weather forecast');
  console.log('\n📊 Severity Thresholds:');
  console.log('   Critical: >100mm rain OR >80km/h wind OR >90% probability OR thunderstorm');
  console.log('   High:     >70mm rain OR >60km/h wind OR >80% probability');
  console.log('   Moderate: >50mm rain OR >50km/h wind OR >70% probability');
  console.log('\n🔄 This check runs automatically every 15 minutes in the background');
  
  process.exit(0);
}

checkForecast();
