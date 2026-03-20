"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertOctagon, X, Eye, Clock, MapPin } from 'lucide-react';
import { sosApi } from '@/lib/safehaven-api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';

interface SOSAlert {
  id: number;
  userId: number;
  message: string;
  status: string;
  priority: string;
  target_agency: string;
  created_at: string;
  first_name: string;
  last_name: string;
  latitude: number | null;
  longitude: number | null;
}

export default function SOSNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [newAlerts, setNewAlerts] = useState<SOSAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection with comprehensive logging
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('🔴 [SOS WebSocket] No token found in localStorage');
      return;
    }

    console.log('🔵 [SOS WebSocket] Initializing connection...');
    console.log('🔵 [SOS WebSocket] API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://safe-haven-backend-api.onrender.com');

    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://safe-haven-backend-api.onrender.com', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ [SOS WebSocket] Connected successfully!');
      console.log('✅ [SOS WebSocket] Socket ID:', socket.id);
      setWsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ [SOS WebSocket] Disconnected:', reason);
      setWsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 [SOS WebSocket] Connection error:', error.message);
      console.error('🔴 [SOS WebSocket] Error details:', error);
      setWsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('🔴 [SOS WebSocket] Socket error:', error);
    });

    // Listen for new SOS events
    socket.on('new_sos', (payload: any) => {
      console.log('🚨 [SOS WebSocket] New SOS alert received!');
      console.log('🚨 [SOS WebSocket] Payload:', payload);
      
      const alert = payload.data;
      
      // Add to notifications list
      setNewAlerts(prev => {
        const updated = [alert, ...prev].slice(0, 10);
        console.log('🚨 [SOS WebSocket] Updated alerts list:', updated.length, 'alerts');
        return updated;
      });
      
      setUnreadCount(prev => {
        const newCount = prev + 1;
        console.log('🚨 [SOS WebSocket] Unread count:', newCount);
        return newCount;
      });
      
      // Play notification sound
      console.log('🔊 [SOS WebSocket] Playing notification sound...');
      playNotificationSound();
    });

    // Log all events for debugging
    socket.onAny((eventName, ...args) => {
      console.log(`📡 [SOS WebSocket] Event received: ${eventName}`, args);
    });

    socketRef.current = socket;

    return () => {
      console.log('🔵 [SOS WebSocket] Cleaning up connection...');
      socket.disconnect();
    };
  }, []);

  // POLLING DISABLED - Using WebSocket only for real-time updates
  // Poll for new SOS alerts every 30 seconds (fallback for WebSocket)
  // useEffect(() => {
  //   console.log('🔵 [SOS Polling] Starting polling fallback...');
  //   checkForNewAlerts();
  //   
  //   // Increase polling interval to 30 seconds since WebSocket provides real-time updates
  //   const interval = setInterval(() => {
  //     if (!wsConnected) {
  //       console.log('⚠️ [SOS Polling] WebSocket disconnected, using polling fallback');
  //     }
  //     checkForNewAlerts();
  //   }, 30000); // Check every 30 seconds as fallback
  //
  //   return () => {
  //     console.log('🔵 [SOS Polling] Stopping polling...');
  //     clearInterval(interval);
  //   };
  // }, [lastCheckTime, wsConnected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkForNewAlerts = async () => {
    try {
      console.log('🔍 [SOS Polling] Checking for new alerts...');
      const response = await sosApi.getAll({ status: 'sent' });
      
      if (response.status === 'success' && response.data) {
        const alerts = response.data.alerts || [];
        console.log('🔍 [SOS Polling] Found', alerts.length, 'total alerts');
        
        // Filter alerts created after last check
        const newAlertsFound = alerts.filter((alert: SOSAlert) => {
          const alertTime = new Date(alert.created_at);
          return alertTime > lastCheckTime;
        });

        console.log('🔍 [SOS Polling] Found', newAlertsFound.length, 'new alerts since', lastCheckTime);

        if (newAlertsFound.length > 0) {
          console.log('🚨 [SOS Polling] New alerts found!', newAlertsFound);
          
          // Play notification sound
          playNotificationSound();
          
          // Add new alerts to the list
          setNewAlerts(prev => [...newAlertsFound, ...prev].slice(0, 10)); // Keep last 10
          setUnreadCount(prev => prev + newAlertsFound.length);
        }
      }
    } catch (error) {
      console.error('🔴 [SOS Polling] Error checking for new SOS alerts:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/notification-sound.mp3');
        audioRef.current.volume = 0.5;
      }
      
      // Play sound (fallback to system beep if audio file not found)
      audioRef.current.play().catch(() => {
        // Fallback: Use Web Audio API to create a beep
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as read when opening
      setUnreadCount(0);
      setLastCheckTime(new Date());
    }
  };

  const handleViewAlert = (alertId: number) => {
    setIsOpen(false);
    router.push(`/sos-alerts/${alertId}`);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/sos-alerts');
  };

  const handleClearAll = () => {
    setNewAlerts([]);
    setUnreadCount(0);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-warning-600 bg-warning-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-error-600 bg-error-100'
    };
    return colors[priority] || colors.medium;
  };

  const getAgencyIcon = (agency: string) => {
    const icons: Record<string, string> = {
      all: '🚨',
      barangay: '🏘️',
      lgu: '🏛️',
      bfp: '🚒',
      pnp: '👮',
      mdrrmo: '⚠️'
    };
    return icons[agency] || '🚨';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-error-50 hover:text-error-600 hover:border-error-300 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-error-900/20 dark:hover:text-error-400"
        aria-label="SOS Notifications"
        title={wsConnected ? 'SOS Notifications (WebSocket Connected)' : 'SOS Notifications (Polling Mode)'}
      >
        <Bell className="w-5 h-5" />
        
        {/* WebSocket Connection Indicator */}
        <span 
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`}
          title={wsConnected ? 'Real-time connected' : 'Polling mode'}
        />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-white text-xs font-bold shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            {/* Pulse Animation */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75"></span>
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-error-500 to-error-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-bold text-lg">SOS Alerts</h3>
              {unreadCount > 0 && (
                <span className="bg-white text-error-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {newAlerts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No new SOS alerts</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {newAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => handleViewAlert(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority Indicator */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getPriorityColor(alert.priority)}`}>
                        <AlertOctagon className="w-5 h-5" />
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {alert.first_name} {alert.last_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {getAgencyIcon(alert.target_agency)} {alert.target_agency.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {alert.message || 'Emergency SOS Alert'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(alert.created_at), 'h:mm a')}
                          </div>
                          {alert.latitude && alert.longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAlert(alert.id);
                        }}
                        className="flex-shrink-0 p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {newAlerts.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleViewAll}
                className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium transition-colors shadow-sm hover:shadow-md"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
