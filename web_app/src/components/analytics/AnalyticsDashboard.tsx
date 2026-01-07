"use client";

import React, { useState, useEffect } from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { toast } from "sonner";

interface AnalyticsData {
  pageViews: {
    total: number;
    change: number;
  };
  uniqueVisitors: {
    total: number;
    change: number;
  };
  requests: {
    total: number;
    change: number;
  };
  bandwidth: {
    total: number;
    change: number;
  };
  topPages: Array<{ path: string; views: number }>;
  countries: Array<{ country: string; visitors: number }>;
  timeSeries: Array<{ timestamp: string; pageviews: number; uniques: number }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
      
      // Use mock data as fallback
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Portfolio Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Website: dubail-film-maker-website-portfolio.pages.dev
          </p>
          {analytics && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {analytics.pageViews.total > 0 && analytics.timeSeries && analytics.timeSeries.length > 0
                ? 'Real data from Cloudflare Web Analytics'
                : 'Simulated data - Configure Web Analytics for real data'}
            </div>
          )}
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics analytics={analytics} />
          <MonthlySalesChart analytics={analytics} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget analytics={analytics} />
        </div>

        <div className="col-span-12">
          <StatisticsChart analytics={analytics} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard analytics={analytics} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          {/* Top Pages Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top Pages
            </h3>
            <div className="space-y-3">
              {analytics?.topPages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {page.path}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockAnalytics(): AnalyticsData {
  return {
    pageViews: { total: 12543, change: 12.5 },
    uniqueVisitors: { total: 8234, change: 8.3 },
    requests: { total: 45678, change: 15.2 },
    bandwidth: { total: 2.3 * 1024 * 1024 * 1024, change: 5.7 },
    topPages: [
      { path: '/', views: 5234 },
      { path: '/works', views: 3456 },
      { path: '/about', views: 2345 },
      { path: '/contact', views: 1508 },
    ],
    countries: [
      { country: 'United Arab Emirates', visitors: 3456 },
      { country: 'United States', visitors: 2345 },
      { country: 'United Kingdom', visitors: 1234 },
      { country: 'Saudi Arabia', visitors: 987 },
    ],
    timeSeries: [],
  };
}
