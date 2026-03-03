'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { smsBlastAPI } from '@/lib/sms-blast-api';

interface SMSBlast {
  id: string;
  message: string;
  recipientCount: number;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed' | 'scheduled';
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  scheduledTime?: string;
  language: 'en' | 'fil';
}

interface CreditBalance {
  balance: number;
  lastUpdated: string;
}

export default function SMSBlastPage() {
  const router = useRouter();
  const [blasts, setBlasts] = useState<SMSBlast[]>([]);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | SMSBlast['status']>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Load SMS blast history from backend
      const historyData: any = await smsBlastAPI.getBlastHistory();
      setBlasts(historyData.data || []);

      // Load credit balance from backend
      const balanceData: any = await smsBlastAPI.getCreditBalance();
      setCreditBalance(balanceData.data);

    } catch (error) {
      console.error('Error loading SMS blast data:', error);
      toast.error('Failed to load SMS blast data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: SMSBlast['status']) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700 border-success-200';
      case 'processing': return 'bg-info-100 text-info-700 border-info-200';
      case 'queued': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'failed': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: SMSBlast['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredBlasts = blasts.filter(blast => 
    statusFilter === 'all' || blast.status === statusFilter
  );

  const stats = {
    totalSent: blasts.reduce((sum, b) => sum + b.sentCount, 0),
    totalDelivered: blasts.reduce((sum, b) => sum + b.deliveredCount, 0),
    totalFailed: blasts.reduce((sum, b) => sum + b.failedCount, 0),
    totalCost: blasts.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SMS Blast Emergency Alerts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send emergency notifications via SMS to users during disasters
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push('/sms-blast/send')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg hover:from-brand-700 hover:to-brand-800 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New SMS Blast
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Credit Balance */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-100">Credit Balance</p>
              <p className="mt-2 text-3xl font-bold">
                {creditBalance?.balance.toLocaleString() || '0'}
              </p>
              <p className="mt-1 text-xs text-brand-100">
                Last updated: {creditBalance?.lastUpdated ? new Date(creditBalance.lastUpdated).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-brand-200" />
          </div>
        </div>

        {/* Total Sent */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalSent.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">SMS messages</p>
            </div>
            <Send className="w-12 h-12 text-info-500" />
          </div>
        </div>

        {/* Total Delivered */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalDelivered.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-success-600">
                {stats.totalSent > 0 ? `${((stats.totalDelivered / stats.totalSent) * 100).toFixed(1)}% success rate` : 'N/A'}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-success-500" />
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalCost.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">Credits used</p>
            </div>
            <DollarSign className="w-12 h-12 text-warning-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'completed', 'processing', 'queued', 'failed', 'scheduled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Blast History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            SMS Blast History
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your SMS blast campaigns
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBlasts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No SMS blasts found. Create your first SMS blast to get started.
                    </p>
                    <button
                      onClick={() => router.push('/sms-blast/send')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
                    >
                      <Plus className="w-4 h-4" />
                      Create SMS Blast
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBlasts.map((blast) => (
                  <tr key={blast.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {blast.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              blast.language === 'en' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {blast.language === 'en' ? 'English' : 'Filipino'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {blast.recipientCount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(blast.status)}`}>
                        {getStatusIcon(blast.status)}
                        {blast.status.charAt(0).toUpperCase() + blast.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-success-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {blast.deliveredCount} delivered
                          </span>
                        </div>
                        {blast.failedCount > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <XCircle className="w-3 h-3 text-emergency-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {blast.failedCount} failed
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {(blast.actualCost || blast.estimatedCost).toLocaleString()} credits
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(blast.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(blast.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/sms-blast/${blast.id}`)}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/sms-blast/templates')}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
        >
          <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-brand-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Manage Templates
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and edit SMS templates for common emergencies
          </p>
        </button>

        <button
          onClick={() => router.push('/sms-blast/contact-groups')}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
        >
          <Users className="w-8 h-8 text-gray-400 group-hover:text-brand-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Contact Groups
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage recipient groups for faster targeting
          </p>
        </button>

        <button
          onClick={() => router.push('/sms-blast/usage')}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
        >
          <DollarSign className="w-8 h-8 text-gray-400 group-hover:text-brand-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Credits & Usage
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View credit balance and usage statistics
          </p>
        </button>
      </div>
    </div>
  );
}
