// Test Forecast Monitoring
// This script tests the predictive weather alert system

const { alertAutomationService } = require('./dist/services/alertAutomation.service');
const { weatherService } = require('./dist/services/weather.service');

async function testForecastMonitoring() {
  console.log('🧪 Testing Predictive Weather Alert System\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check forecast API
    console.log('\n📡 Test 1: Fetching forecast data...');
    const forecast = await weatherService.getHourlyForecast(16.0433, 120.3397, 24);
    console.log('✅ Forecast API working');
    console.log(`   Retrieved ${forecast.hourly.time.length} hours of data`);
    
    // Test 2: Analyze forecast
    console.log('\n🔍 Test 2: Analyzing forecast for severe weather...');
    const analysis = await weatherService.analyzeForecast(16.0433, 120.3397, 'Dagupan City');
    
    if (analysis.hasSevereWeather) {
      console.log('⚠️  SEVERE WEATHER DETECTED!');
      console.log(`   Hours until: ${analysis.hoursUntil}`);
      console.log(`   Severity: ${analysis.severity}`);
      console.log(`   Expected time: ${analysis.conditions.time}`);
      console.log(`   Conditions:`);
      console.log(`     • ${analysis.conditions.weatherDescription}`);
      console.log(`     • Rainfall: ${analysis.conditions.precipitation.toFixed(1)}mm`);
      console.log(`     • Wind Speed: ${analysis.conditions.windSpeed.toFixed(1)}km/h`);
      console.log(`     • Probability: ${analysis.conditions.precipProb}%`);
      console.log(`     • Temperature: ${analysis.conditions.temperature.toFixed(1)}°C`);
    } else {
      console.log('✅ No severe weather forecast (this is good!)');
    }
    
    // Test 3: Run full monitoring cycle
    console.log('\n🔄 Test 3: Running full forecast monitoring cycle...');
    const result = await alertAutomationService.monitorWeatherWithForecast();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Results:`);
    console.log(`   Predictive alerts created: ${result}`);
    
    if (result > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Check database for new alerts with advance_notice_hours');
      console.log('   2. Open mobile app to see orange advance notice badge');
      console.log('   3. Check web portal for clock badge next to severity');
    } else {
      console.log('\n💡 No alerts created because:');
      console.log('   • No severe weather forecast in next 24 hours, OR');
      console.log('   • Similar alert already exists within last hour');
      console.log('\n   This is normal! The system only creates alerts when needed.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Make sure backend is compiled: npm run build');
    console.error('   2. Check database connection');
    console.error('   3. Verify Open-Meteo API is accessible');
  }
  
  process.exit(0);
}

// Run test
testForecastMonitoring();
