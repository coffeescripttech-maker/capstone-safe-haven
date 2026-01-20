'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { adminApi } from '@/lib/safehaven-api';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

interface EarthquakeData {
  id: string;
  magnitude: number;
  magnitudeDescription: string;
  magnitudeColor: string;
  place: string;
  time: string;
  coordinates: {
    longitude: number;
    latitude: number;
    depth: number;
  };
  url: string;
  tsunami: boolean;
  alert: string | null;
  significance: number;
}

export default function MonitoringPage() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [earthquakeStats, setEarthquakeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [weatherRes, earthquakesRes, statsRes] = await Promise.all([
        adminApi.weather.getPhilippines(),
        adminApi.earthquake.getRecent(7, 4),
        adminApi.earthquake.getStats(30)
      ]);

      if (weatherRes.success) {
        setWeather(weatherRes.data);
      }

      if (earthquakesRes.success) {
        setEarthquakes(earthquakesRes.data.earthquakes.slice(0, 10));
      }

      if (statsRes.success) {
        setEarthquakeStats(statsRes.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number) => {
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
  };

  const getMagnitudeBadgeColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      gray: 'bg-gray-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white',
      darkred: 'bg-red-700 text-white'
    };
    return colorMap[color] || 'bg-gray-500 text-white';
  };

  // Temperature Chart Data
  const temperatureChartOptions: any = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: weather.map(w => w.name),
    },
    yaxis: {
      title: {
        text: 'Temperature (°C)',
      },
    },
    fill: {
      opacity: 1,
      colors: ['#3B82F6', '#EF4444'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => val + '°C',
      },
    },
    colors: ['#3B82F6', '#EF4444'],
  };

  const temperatureChartSeries = [
    {
      name: 'Temperature',
      data: weather.map(w => w.temperature),
    },
    {
      name: 'Feels Like',
      data: weather.map(w => w.apparentTemperature),
    },
  ];

  // Earthquake Magnitude Distribution Chart
  const earthquakeChartOptions: any = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Minor (2-4)', 'Light (4-5)', 'Moderate (5-6)', 'Strong (6-7)', 'Major (7+)'],
    colors: ['#9CA3AF', '#10B981', '#F59E0B', '#F97316', '#EF4444'],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => earthquakeStats?.total || '0',
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => Math.round(val) + '%',
    },
  };

  const earthquakeChartSeries = earthquakeStats
    ? [
        earthquakeStats.byMagnitude.minor,
        earthquakeStats.byMagnitude.light,
        earthquakeStats.byMagnitude.moderate,
        earthquakeStats.byMagnitude.strong,
        earthquakeStats.byMagnitude.major,
      ]
    : [];

  // Weather Conditions Chart (Humidity & Wind)
  const weatherConditionsOptions: any = {
    chart: {
      type: 'radar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    xaxis: {
      categories: weather.map(w => w.name),
    },
    yaxis: {
      show: false,
    },
    colors: ['#3B82F6', '#10B981'],
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    markers: {
      size: 4,
    },
  };

  const weatherConditionsSeries = [
    {
      name: 'Humidity (%)',
      data: weather.map(w => w.humidity),
    },
    {
      name: 'Wind Speed (km/h)',
      data: weather.map(w => w.windSpeed),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Loading environmental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌍 Environmental Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time weather and seismic activity in the Philippines
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="text-sm font-semibold text-gray-700">{lastUpdate.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
          >
            <svg className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Weather Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weather Conditions</h2>
            <p className="text-sm text-gray-600">Current weather across major Philippine cities</p>
          </div>
        </div>

        {/* Weather Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weather.map((city) => (
            <div key={city.name} className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{city.name}</h3>
                  <p className="text-sm text-gray-600">{city.weatherDescription}</p>
                </div>
                <span className="text-5xl">{getWeatherIcon(city.weatherCode)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="text-2xl">🌡️</span>
                    Temperature
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{city.temperature}°C</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Feels like</p>
                    <p className="text-lg font-semibold text-gray-900">{city.apparentTemperature}°C</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="text-lg font-semibold text-gray-900">{city.humidity}%</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Wind Speed</p>
                    <p className="text-lg font-semibold text-gray-900">{city.windSpeed} km/h</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Precipitation</p>
                    <p className="text-lg font-semibold text-blue-600">{city.precipitation} mm</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weather Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Temperature Comparison</h3>
            {typeof window !== 'undefined' && weather.length > 0 && (
              <Chart
                options={temperatureChartOptions}
                series={temperatureChartSeries}
                type="bar"
                height={300}
              />
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weather Conditions Radar</h3>
            {typeof window !== 'undefined' && weather.length > 0 && (
              <Chart
                options={weatherConditionsOptions}
                series={weatherConditionsSeries}
                type="radar"
                height={300}
              />
            )}
          </div>
        </div>
      </div>

      {/* Earthquake Section */}
      {earthquakeStats && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Seismic Activity</h2>
              <p className="text-sm text-gray-600">Earthquake monitoring for the Philippines region</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Total Earthquakes (30 days)</p>
              <div className="text-4xl font-bold">{earthquakeStats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Light (M4-5)</p>
              <div className="text-4xl font-bold">{earthquakeStats.byMagnitude.light}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Moderate (M5-6)</p>
              <div className="text-4xl font-bold">{earthquakeStats.byMagnitude.moderate}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Strong (M6+)</p>
              <div className="text-4xl font-bold">
                {earthquakeStats.byMagnitude.strong + earthquakeStats.byMagnitude.major}
              </div>
            </div>
          </div>

          {/* Earthquake Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Magnitude Distribution (Last 30 Days)</h3>
            {typeof window !== 'undefined' && earthquakeStats && (
              <Chart
                options={earthquakeChartOptions}
                series={earthquakeChartSeries}
                type="donut"
                height={350}
              />
            )}
          </div>

          {/* Recent Earthquakes List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Earthquakes (Last 7 Days, M4+)</h3>
              <p className="text-sm text-gray-600 mt-1">Latest seismic events in the Philippines region</p>
            </div>
            {earthquakes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-semibold text-gray-900">No Significant Earthquakes</p>
                <p className="text-gray-600 mt-1">No earthquakes M4+ detected in the past 7 days</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {earthquakes.map((eq) => (
                  <div key={eq.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMagnitudeBadgeColor(eq.magnitudeColor)}`}>
                            M{eq.magnitude.toFixed(1)}
                          </span>
                          <span className="font-bold text-gray-900">{eq.magnitudeDescription}</span>
                          {eq.tsunami && (
                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white animate-pulse">
                              🌊 Tsunami Warning
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">{eq.place}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {eq.coordinates.latitude.toFixed(2)}°, {eq.coordinates.longitude.toFixed(2)}°
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Depth: {eq.coordinates.depth.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(eq.time).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={eq.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold whitespace-nowrap transition-colors"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
