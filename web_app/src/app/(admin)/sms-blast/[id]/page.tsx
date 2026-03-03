'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Globe,
  Zap,
  Download
} from 'lucide-react';
import { smsBlastAPI } from '@/lib/sms-blast-api';

interface BlastDetails {
  id: string;
  message: string;
  recipientCount: number;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed' | 'scheduled';
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  completedAt?: string;
  scheduledTime?: string;
  language: 'en' | 'fil';
  priority?: 'critical' | 'high' | 'normal'; // Made optional since API might not return it
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  recipientFilters?: {
    provinces?: string[];
    cities?: string[];
    barangays?: string[];
  };
}

export default function BlastDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const blastId = params.id as string;
  
  const [blast, setBlast] = useState<BlastDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBlastDetails();
    
    // Auto-refresh every 30 seconds if blast is in progress
    const interval = setInterval(() => {
      if (blast && ['queued', 'processing'].includes(blast.status)) {
        loadBlastDetails(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [blastId, blast?.status]);

  const loadBlastDetails = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const data: any = await smsBlastAPI.getBlastDetails(blastId);
      setBlast(data.data);
    } catch (error) {
      console.error('Error loading blast details:', error);
      toast.error('Failed to load blast details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700 border-success-200';
      case 'processing': return 'bg-info-100 text-info-700 border-info-200';
      case 'queued': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'failed': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'normal': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateDuration = () => {
    if (!blast?.createdAt || !blast?.completedAt) return null;
    const start = new Date(blast.createdAt).getTime();
    const end = new Date(blast.completedAt).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getDeliveryRate = () => {
    if (!blast || blast.sentCount === 0) return 0;
    return ((blast.deliveredCount / blast.sentCount) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!blast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">Blast not found</p>
        <button
          onClick={() => router.push('/sms-blast')}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          Back to SMS Blast
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/sms-blast')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SMS Blast Details
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Blast ID: {blast.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 border-2 ${getStatusColor(blast.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <p className="text-2xl font-bold capitalize">{blast.status}</p>
          </div>
          {blast.status === 'processing' && (
            <Loader2 className="w-8 h-8 animate-spin" />
          )}
          {blast.status === 'completed' && (
            <CheckCircle className="w-8 h-8" />
          )}
          {blast.status === 'failed' && (
            <XCircle className="w-8 h-8" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Message</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{blast.message}</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                blast.language === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                <Globe className="w-4 h-4" />
                {blast.language === 'en' ? 'English' : 'Filipino'}
              </span>
              {blast.priority && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(blast.priority)}`}>
                  <Zap className="w-4 h-4" />
                  {blast.priority.charAt(0).toUpperCase() + blast.priority.slice(1)} Priority
                </span>
              )}
            </div>
          </div>

          {/* Delivery Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delivery Statistics
            </h2>
            
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {blast.sentCount} / {blast.recipientCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(blast.sentCount / blast.recipientCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-sm font-medium text-success-900 dark:text-success-100">
                      Delivered
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-success-600">{blast.deliveredCount}</p>
                  <p className="text-xs text-success-700 dark:text-success-300 mt-1">
                    {getDeliveryRate()}% success
                  </p>
                </div>

                <div className="bg-info-50 dark:bg-info-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-info-600" />
                    <span className="text-sm font-medium text-info-900 dark:text-info-100">
                      Pending
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-info-600">{blast.pendingCount || 0}</p>
                </div>

                <div className="bg-emergency-50 dark:bg-emergency-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-emergency-600" />
                    <span className="text-sm font-medium text-emergency-900 dark:text-emergency-100">
                      Failed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emergency-600">{blast.failedCount}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {blast.recipientCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recipient Filters
            </h2>
            <div className="space-y-3">
              {blast.recipientFilters?.provinces && blast.recipientFilters.provinces.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Provinces:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blast.recipientFilters.provinces.map((province, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-full text-sm"
                      >
                        {province}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!blast.recipientFilters && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recipient filter information available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(blast.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {blast.scheduledTime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Scheduled</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(blast.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {blast.completedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(blast.completedAt).toLocaleString()}
                    </p>
                    {calculateDuration() && (
                      <p className="text-xs text-success-600 mt-1">
                        Duration: {calculateDuration()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {blast.estimatedCost.toLocaleString()} credits
                </span>
              </div>
              {blast.actualCost !== undefined && (
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Actual:</span>
                  <span className="text-lg font-bold text-brand-600">
                    {blast.actualCost.toLocaleString()} credits
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Created By */}
          {blast.createdBy && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Created By</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    {blast.createdBy.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {blast.createdBy.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {blast.createdBy.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
