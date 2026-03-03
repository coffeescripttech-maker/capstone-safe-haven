'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, Calendar, Loader2, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { smsBlastAPI } from '@/lib/sms-blast-api';

interface UsageStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  byUser: Array<{ userId: string; userName: string; credits: number }>;
}

export default function UsagePage() {
  const router = useRouter();
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [balanceData, statsData]: any = await Promise.all([
        smsBlastAPI.getCreditBalance(),
        smsBlastAPI.getUsageStats(dateRange)
      ]);

      setCreditBalance(balanceData.data?.balance || 0);
      setUsageStats(statsData.data || null);
    } catch (error) {
      console.error('Error loading usage data:', error);
      toast.error('Failed to load usage data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credits & Usage</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor your SMS credit balance and usage statistics
            </p>
          </div>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Credit Balance Card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-100 mb-2">Current Balance</p>
            <p className="text-5xl font-bold mb-4">{creditBalance.toLocaleString()}</p>
            <p className="text-sm text-brand-100">SMS Credits Available</p>
          </div>
          <DollarSign className="w-24 h-24 text-brand-200 opacity-50" />
        </div>
        
        {creditBalance < 1000 && (
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm font-medium">⚠️ Low Balance Warning</p>
            <p className="text-xs mt-1">Your credit balance is running low. Consider topping up soon.</p>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">TODAY</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {usageStats?.today.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Credits Used</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">THIS WEEK</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {usageStats?.thisWeek.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Credits Used</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">THIS MONTH</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {usageStats?.thisMonth.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Credits Used</p>
        </div>
      </div>

      {/* Usage by User */}
      {usageStats?.byUser && usageStats.byUser.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usage by User</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {usageStats.byUser.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                        {user.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.userId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
