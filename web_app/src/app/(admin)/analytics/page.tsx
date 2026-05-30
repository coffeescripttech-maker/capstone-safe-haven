'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  alerts: {
    total: number;
    thisMonth: number;
    bySeverity: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
    };
  };
  incidents: {
    total: number;
    thisMonth: number;
    byStatus: {
      pending: number;
      in_progress: number;
      resolved: number;
    };
  };
  activity: {
    daily: Array<{ date: string; alerts: number; incidents: number; users: number }>;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response = await adminApi.getStats();
      
      if (response.success) {
        // Transform the stats data into analytics format
        const stats = response.data;
        
        setAnalytics({
          users: {
            total: stats.users?.total || 0,
            active: stats.users?.total || 0,
            newThisMonth: stats.today?.users || 0,
            growth: 12.5 // Mock growth percentage
          },
          alerts: {
            total: stats.alerts?.total || 0,
            thisMonth: stats.today?.alerts || 0,
            bySeverity: {
              critical: Math.floor((stats.alerts?.total || 0) * 0.1),
              high: Math.floor((stats.alerts?.total || 0) * 0.2),
              moderate: Math.floor((stats.alerts?.total || 0) * 0.4),
              low: Math.floor((stats.alerts?.total || 0) * 0.3)
            }
          },
          incidents: {
            total: stats.incidents?.total || 0,
            thisMonth: stats.today?.incidents || 0,
            byStatus: {
              pending: stats.incidents?.pending || 0,
              in_progress: stats.incidents?.in_progress || 0,
              resolved: stats.incidents?.resolved || 0
            }
          },
          activity: {
            daily: generateMockDailyData(timeRange)
          }
        });
      }
      
      setLastUpdated(new Date());
      
      if (silent) {
        toast.success('Analytics refreshed', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      if (!silent) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const generateMockDailyData = (range: '7d' | '30d' | '90d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        alerts: Math.floor(Math.random() * 10) + 1,
        incidents: Math.floor(Math.random() * 15) + 2,
        users: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return data;
  };

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const activityChartOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: analytics?.activity.daily.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }) || [],
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    colors: ['#EF4444', '#F59E0B', '#3B82F6'],
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    grid: {
      borderColor: '#E5E7EB'
    }
  };

  const activityChartSeries = [
    {
      name: 'Alerts',
      data: analytics?.activity.daily.map(d => d.alerts) || []
    },
    {
      name: 'Incidents',
      data: analytics?.activity.daily.map(d => d.incidents) || []
    },
    {
      name: 'Active Users',
      data: analytics?.activity.daily.map(d => d.users) || []
    }
  ];

  const severityChartOptions: any = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif'
    },
    labels: ['Critical', 'High', 'Moderate', 'Low'],
    colors: ['#DC2626', '#F59E0B', '#3B82F6', '#10B981'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Alerts',
              formatter: () => analytics?.alerts.total.toString() || '0'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => Math.round(val) + '%'
    }
  };

  const severityChartSeries = analytics ? [
    analytics.alerts.bySeverity.critical,
    analytics.alerts.bySeverity.high,
    analytics.alerts.bySeverity.moderate,
    analytics.alerts.bySeverity.low
  ] : [];

  const statusChartOptions: any = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetX: 30,
      style: {
        fontSize: '12px',
        colors: ['#374151']
      }
    },
    xaxis: {
      categories: ['Pending', 'In Progress', 'Resolved']
    },
    colors: ['#F59E0B', '#3B82F6', '#10B981'],
    grid: {
      borderColor: '#E5E7EB'
    }
  };

  const statusChartSeries = [{
    name: 'Incidents',
    data: analytics ? [
      analytics.incidents.byStatus.pending,
      analytics.incidents.byStatus.in_progress,
      analytics.incidents.byStatus.resolved
    ] : []
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-brand-50/10 to-gray-50 p-6">
      {/* Header with Glass Morphism */}
      <div className="mb-8 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-info-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 animate-pulse-slow">
                <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent mb-1">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-500" />
                  System performance and usage statistics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-white/50">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                  className="border-0 bg-transparent text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-white/50">
                <Activity className="w-4 h-4" />
                <span className="font-semibold">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 font-semibold disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={analytics?.users.total || 0}
          change={`+${analytics?.users.growth || 0}%`}
          changePositive={true}
          icon={<Users className="w-6 h-6" />}
          gradient="from-blue-500 to-blue-600"
          onClick={() => router.push('/users')}
        />
        <MetricCard
          title="Active Alerts"
          value={analytics?.alerts.thisMonth || 0}
          change={`${analytics?.alerts.total || 0} total`}
          changePositive={false}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-red-500 to-red-600"
          onClick={() => router.push('/alerts')}
        />
        <MetricCard
          title="Incidents"
          value={analytics?.incidents.thisMonth || 0}
          change={`${analytics?.incidents.total || 0} total`}
          changePositive={false}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-orange-500 to-orange-600"
          onClick={() => router.push('/incidents')}
        />
        <MetricCard
          title="New Users"
          value={analytics?.users.newThisMonth || 0}
          change="This month"
          changePositive={true}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-green-500 to-green-600"
          onClick={() => router.push('/users')}
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50 hover:shadow-xl transition-all duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" />
          Activity Overview
        </h2>
        {typeof window !== 'undefined' && analytics && (
          <Chart
            options={activityChartOptions}
            series={activityChartSeries}
            type="area"
            height={350}
          />
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Severity Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-500" />
            Alert Severity Distribution
          </h2>
          {typeof window !== 'undefined' && analytics && (
            <Chart
              options={severityChartOptions}
              series={severityChartSeries}
              type="donut"
              height={350}
            />
          )}
        </div>

        {/* Incident Status */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            Incident Status
          </h2>
          {typeof window !== 'undefined' && analytics && (
            <Chart
              options={statusChartOptions}
              series={statusChartSeries}
              type="bar"
              height={350}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, changePositive, icon, gradient, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/50 overflow-hidden group cursor-pointer hover:scale-105"
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">{value.toLocaleString()}</p>
        <p className={`text-xs font-semibold ${changePositive ? 'text-success-600' : 'text-gray-600'}`}>
          {change}
        </p>
      </div>
      
      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`}></div>
    </div>
  );
}
