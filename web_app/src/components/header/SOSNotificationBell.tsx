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
    console.log('═══════════════════════════════════════════════════════');
    console.log('� [SOS WebSocket] INITIALIZATION STARTED');
    console.log('═══════════════════════════════════════════════════════');
    
    const token = localStorage.getItem('safehaven_token');
    console.log('� [SOS WebSocket] Token check:', token ? `Found (${token.substring(0, 20)}...)` : '❌ NOT FOUND');
    
    if (!token) {
      console.error('🔴 [SOS WebSocket] CRITICAL: No authentication token found in localStorage');
      console.error('🔴 [SOS WebSocket] Please login first to establish WebSocket connection');
      return;
    }

    // Get WebSocket URL (remove /api/v1 suffix if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://safe-haven-backend-api.onrender.com';
    const wsUrl = apiUrl.replace('/api/v1', '');
    
    console.log('🔍 [SOS WebSocket] Environment Configuration:');
    console.log('   📍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using default)');
    console.log('   📍 Raw API URL:', apiUrl);
    console.log('   📍 WebSocket URL:', wsUrl);
    console.log('   📍 Protocol:', wsUrl.startsWith('https') ? 'WSS (Secure)' : 'WS (Insecure)');
    console.log('   📍 Transports:', ['websocket', 'polling']);
    console.log('   📍 Reconnection:', 'Enabled (5 attempts, 1s delay)');

    // Connect to WebSocket server
    console.log('🔵 [SOS WebSocket] Attempting connection to:', wsUrl);
    console.log('   📍 WebSocket Path: /ws');
    const socket = io(wsUrl, {
      path: '/ws',  // Backend WebSocket path
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ [SOS WebSocket] CONNECTION SUCCESSFUL!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ Socket ID:', socket.id);
      console.log('✅ Transport:', socket.io.engine.transport.name);
      console.log('✅ Connected to:', wsUrl);
      console.log('✅ Listening for events: new_sos');
      console.log('═══════════════════════════════════════════════════════');
      setWsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ [SOS WebSocket] DISCONNECTED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ Reason:', reason);
      console.log('❌ Will reconnect:', socket.active ? 'Yes' : 'No');
      console.log('═══════════════════════════════════════════════════════');
      setWsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('═══════════════════════════════════════════════════════');
      console.error('🔴 [SOS WebSocket] CONNECTION ERROR');
      console.log('═══════════════════════════════════════════════════════');
      console.error('🔴 Error Type:', error.constructor.name);
      console.error('🔴 Error Message:', error.message);
      console.error('🔴 Error Details:', error);
      console.error('🔴 Attempted URL:', wsUrl);
      console.error('🔴 Transport:', socket.io.engine?.transport?.name || 'Unknown');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔧 TROUBLESHOOTING TIPS:');
      console.log('   1. Check if backend server is running');
      console.log('   2. Verify NEXT_PUBLIC_API_URL in .env.local');
      console.log('   3. Check CORS settings on backend');
      console.log('   4. Verify JWT token is valid');
      console.log('   5. Check network/firewall settings');
      console.log('═══════════════════════════════════════════════════════');
      setWsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('🔴 [SOS WebSocket] Socket error:', error);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [SOS WebSocket] Reconnection attempt ${attemptNumber}/5...`);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔴 [SOS WebSocket] Reconnection failed after 5 attempts');
      console.error('🔴 [SOS WebSocket] Please refresh the page or check your connection');
    });

    // Listen for new SOS events
    socket.on('new_sos', (payload: any) => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚨 [SOS WebSocket] NEW SOS ALERT RECEIVED!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚨 [SOS WebSocket] Full Payload:', JSON.stringify(payload, null, 2));
      console.log('🚨 [SOS WebSocket] Payload Type:', payload.type);
      console.log('🚨 [SOS WebSocket] Alert Data:', payload.data);
      console.log('═══════════════════════════════════════════════════════');
      
      const alert = payload.data;
      
      // STRICT role-based filtering: Only show alerts targeted to user's role or 'all'
      const userStr = localStorage.getItem('safehaven_user');
      let shouldShow = false;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userRole = user.role;
          const targetAgency = alert.target_agency || 'all';
          
          console.log(`🔍 [SOS WebSocket] Checking visibility - User Role: ${userRole} | Target Agency: ${targetAgency}`);
          
          // ONLY super_admin sees ALL alerts
          if (userRole === 'super_admin') {
            shouldShow = true;
            console.log(`✅ [SOS WebSocket] Super admin - showing all alerts`);
          }
          // Each agency (including MDRRMO/admin) ONLY sees alerts targeted to them or 'all'
          else if (userRole === 'mdrrmo' || userRole === 'admin' ) {
            shouldShow = targetAgency === 'mdrrmo' || targetAgency === 'admin' || targetAgency === 'all';
            console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] MDRRMO/Admin - ${shouldShow ? 'showing' : 'hiding'} alert`);
          }
          else if (userRole === 'pnp') {
            shouldShow = targetAgency === 'pnp' || targetAgency === 'all';
            console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] PNP - ${shouldShow ? 'showing' : 'hiding'} alert`);
          }
          else if (userRole === 'bfp') {
            shouldShow = targetAgency === 'bfp' || targetAgency === 'all';
            console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] BFP - ${shouldShow ? 'showing' : 'hiding'} alert`);
          }
          else if (userRole === 'lgu_officer') {
            shouldShow = targetAgency === 'barangay' || targetAgency === 'lgu' || targetAgency === 'all';
            console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] LGU Officer - ${shouldShow ? 'showing' : 'hiding'} alert`);
          }
          else {
            shouldShow = false;
            console.log(`❌ [SOS WebSocket] Role ${userRole} - hiding alert`);
          }
        } catch (e) {
          console.error('🔴 [SOS WebSocket] Error parsing user data:', e);
        }
      }
      
      if (!shouldShow) {
        console.log('⚠️ [SOS WebSocket] Alert not relevant to user role, skipping notification');
        return;
      }
      
      // Only add if status is 'sent' (pending)
      if (alert.status === 'sent') {
        // Add to notifications list (prepend to show newest first)
        setNewAlerts(prev => {
          const updated = [alert, ...prev].slice(0, 10);
          console.log('🚨 [SOS WebSocket] Updated alerts list:', updated.length, 'alerts');
          return updated;
        });
        
        // Increment badge count
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log('🚨 [SOS WebSocket] Badge count incremented to:', newCount);
          return newCount;
        });
        
        // Play notification sound
        console.log('🔊 [SOS WebSocket] Playing notification sound...');
        playNotificationSound();
      } else {
        console.log(`ℹ️ [SOS WebSocket] Alert status is '${alert.status}', not incrementing badge (only 'sent' alerts count)`);
      }
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

  // Initial fetch of pending SOS alerts on mount (simplified like /sos-alerts page)
  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔍 [SOS Bell] INITIAL FETCH STARTED');
        console.log('═══════════════════════════════════════════════════════');
        
        // Fetch all 'sent' status alerts (backend filters by role automatically)
        // No "last viewed" filtering - just show count of pending alerts
        const response = await sosApi.getAll({ 
          status: 'sent',
          limit: 50
        });
        
        if (response.status === 'success' && response.data) {
          const paginatedData = response.data;
          const alerts = paginatedData.alerts || paginatedData.data || [];
          
          console.log(`✅ [SOS Bell] Found ${alerts.length} pending SOS alerts (status='sent')`);
          console.log(`   These are role-filtered by backend automatically`);
          
          // Show ALL pending alerts in the list (last 10)
          setNewAlerts(alerts.slice(0, 10));
          
          // Badge count = total number of pending alerts
          setUnreadCount(alerts.length);
          
          console.log(`✅ [SOS Bell] Badge count: ${alerts.length}`);
          console.log(`✅ [SOS Bell] Showing ${Math.min(alerts.length, 10)} alerts in dropdown`);
          console.log('═══════════════════════════════════════════════════════');
          
          // Update last check time to now
          setLastCheckTime(new Date());
        }
      } catch (error) {
        console.error('🔴 [SOS Bell] Error fetching initial alerts:', error);
      }
    };

    fetchInitialAlerts();
    
    // Auto-refresh every 15 seconds (like /sos-alerts page)
    const interval = setInterval(() => {
      fetchInitialAlerts();
    }, 15000);

    return () => clearInterval(interval);
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
      console.log('🔊 [SOS Bell] Attempting to play notification sound...');
      
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/notification-sound.mp3');
        audioRef.current.volume = 0.5;
      }
      
      // Try to play audio file first
      audioRef.current.play()
        .then(() => {
          console.log('✅ [SOS Bell] Audio file played successfully');
        })
        .catch(() => {
          console.log('⚠️ [SOS Bell] Audio file not found, using Web Audio API fallback...');
          
          // Fallback: Use Web Audio API to create a two-tone beep
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // First beep (880Hz - A5 note)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            
            // Second beep (1046Hz - C6 note) after 250ms
            setTimeout(() => {
              const oscillator2 = audioContext.createOscillator();
              const gainNode2 = audioContext.createGain();
              
              oscillator2.connect(gainNode2);
              gainNode2.connect(audioContext.destination);
              
              oscillator2.frequency.value = 1046;
              oscillator2.type = 'sine';
              
              gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
              
              oscillator2.start(audioContext.currentTime);
              oscillator2.stop(audioContext.currentTime + 0.2);
            }, 250);
            
            console.log('✅ [SOS Bell] Web Audio API beep played successfully');
          } catch (beepError) {
            console.error('❌ [SOS Bell] Failed to play Web Audio API beep:', beepError);
          }
        });
    } catch (error) {
      console.error('❌ [SOS Bell] Error in playNotificationSound:', error);
    }
  };

  const handleBellClick = () => {
    console.log('🔔 [SOS Bell] Bell clicked, toggling dropdown');
    setIsOpen(!isOpen);
    // Don't clear badge count or save "last viewed" - badge shows pending alerts count
    // Badge will only decrease when alerts are actually resolved (status changes from 'sent')
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
