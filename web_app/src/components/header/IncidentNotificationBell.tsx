"use client";

import { useState, useEffect, useRef } from 'react';
import { FileText, AlertTriangle, X, Eye, Clock, MapPin } from 'lucide-react';
import { incidentsApi } from '@/lib/safehaven-api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';

interface Incident {
  id: number;
  userId: number;
  incidentType: string;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address?: string;
  severity: string;
  status: string;
  createdAt: string;
  userName?: string;
  userPhone?: string;
}

export default function IncidentNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [newIncidents, setNewIncidents] = useState<Incident[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection with comprehensive logging
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [Incident WebSocket] INITIALIZATION STARTED');
    console.log('═══════════════════════════════════════════════════════');
    
    const token = localStorage.getItem('safehaven_token');
    console.log('🔍 [Incident WebSocket] Token check:', token ? `Found (${token.substring(0, 20)}...)` : '❌ NOT FOUND');
    
    if (!token) {
      console.error('🔴 [Incident WebSocket] CRITICAL: No authentication token found in localStorage');
      console.error('🔴 [Incident WebSocket] Please login first to establish WebSocket connection');
      return;
    }

    // Get WebSocket URL (remove /api/v1 suffix if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://safe-haven-backend-api.onrender.com';
    const wsUrl = apiUrl.replace('/api/v1', '');
    
    console.log('🔍 [Incident WebSocket] Environment Configuration:');
    console.log('   📍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using default)');
    console.log('   📍 Raw API URL:', apiUrl);
    console.log('   📍 WebSocket URL:', wsUrl);
    console.log('   📍 Protocol:', wsUrl.startsWith('https') ? 'WSS (Secure)' : 'WS (Insecure)');
    console.log('   📍 Transports:', ['websocket', 'polling']);
    console.log('   📍 Reconnection:', 'Enabled (5 attempts, 1s delay)');

    // Connect to WebSocket server
    console.log('🔵 [Incident WebSocket] Attempting connection to:', wsUrl);
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
      console.log('✅ [Incident WebSocket] CONNECTION SUCCESSFUL!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ Socket ID:', socket.id);
      console.log('✅ Transport:', socket.io.engine.transport.name);
      console.log('✅ Connected to:', wsUrl);
      console.log('✅ Listening for events: new_incident');
      console.log('═══════════════════════════════════════════════════════');
      setWsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ [Incident WebSocket] DISCONNECTED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ Reason:', reason);
      console.log('❌ Will reconnect:', socket.active ? 'Yes' : 'No');
      console.log('═══════════════════════════════════════════════════════');
      setWsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('═══════════════════════════════════════════════════════');
      console.error('🔴 [Incident WebSocket] CONNECTION ERROR');
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
      console.error('🔴 [Incident WebSocket] Socket error:', error);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Incident WebSocket] Reconnection attempt ${attemptNumber}/5...`);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔴 [Incident WebSocket] Reconnection failed after 5 attempts');
      console.error('🔴 [Incident WebSocket] Please refresh the page or check your connection');
    });

    // Listen for new incident events
    socket.on('new_incident', (payload: any) => {
      console.log('🔔 [Incident WebSocket] New incident received!');
      console.log('🔔 [Incident WebSocket] Payload:', payload);
      
      const incident = payload.data;
      
      // Add to notifications list
      setNewIncidents(prev => {
        const updated = [incident, ...prev].slice(0, 10);
        console.log('🔔 [Incident WebSocket] Updated incidents list:', updated.length, 'incidents');
        return updated;
      });
      
      setUnreadCount(prev => {
        const newCount = prev + 1;
        console.log('🔔 [Incident WebSocket] Unread count:', newCount);
        return newCount;
      });
      
      // Play notification sound
      console.log('🔊 [Incident WebSocket] Playing notification sound...');
      playNotificationSound();
    });

    // Log all events for debugging
    socket.onAny((eventName, ...args) => {
      console.log(`📡 [Incident WebSocket] Event received: ${eventName}`, args);
    });

    socketRef.current = socket;

    return () => {
      console.log('🔵 [Incident WebSocket] Cleaning up connection...');
      socket.disconnect();
    };
  }, []);

  // Initial fetch of pending incidents on mount
  useEffect(() => {
    const fetchInitialIncidents = async () => {
      try {
        console.log('🔍 [Incident Bell] Fetching initial pending incidents...');
        
        const response = await incidentsApi.getAll({ 
          status: 'pending',
          limit: 50
        });
        
        if (response.status === 'success' && response.data) {
          const paginatedData = response.data;
          const incidents = paginatedData.data || [];
          
          console.log(`🔍 [Incident Bell] Found ${incidents.length} pending incidents`);
          
          // Set initial incidents and count
          setNewIncidents(incidents.slice(0, 10)); // Show last 10
          setUnreadCount(incidents.length);
        }
      } catch (error) {
        console.error('🔴 [Incident Bell] Error fetching initial incidents:', error);
      }
    };

    fetchInitialIncidents();
  }, []);

  // Poll for new incident reports - DISABLED (using WebSocket only)
  // Polling is commented out to rely entirely on WebSocket for real-time updates
  /*
  useEffect(() => {
    checkForNewIncidents();
    
    const interval = setInterval(() => {
      checkForNewIncidents();
    }, 30000);

    return () => clearInterval(interval);
  }, [lastCheckTime, wsConnected]);
  */

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

  const checkForNewIncidents = async () => {
    try {
      // Only log if WebSocket is disconnected (using polling as fallback)
      if (!wsConnected) {
        console.log('🔍 [Incident Polling] Checking for new incidents (WebSocket disconnected)...');
      }
      
      // Fetch pending incidents (all severities - responders need to see everything)
      const response = await incidentsApi.getAll({ 
        status: 'pending',
        limit: 50
      });
      
      if (response.status === 'success' && response.data) {
        const paginatedData = response.data;
        const incidents = paginatedData.data || [];
        
        if (!wsConnected) {
          console.log('🔍 [Incident Polling] Found', incidents.length, 'total incidents');
        }
        
        // Filter incidents created after last check
        // Show ALL severity levels - responders need to be aware of all reports
        const newIncidentsFound = incidents.filter((incident: Incident) => {
          const incidentTime = new Date(incident.createdAt);
          const isNew = incidentTime > lastCheckTime;
          return isNew; // No severity filter - show all
        });

        if (!wsConnected && newIncidentsFound.length > 0) {
          console.log('🔍 [Incident Polling] Found', newIncidentsFound.length, 'new incidents since', lastCheckTime);
        }

        if (newIncidentsFound.length > 0) {
          if (!wsConnected) {
            console.log('� [Incident Polling] New incidents found!', newIncidentsFound);
          }
          
          // Play notification sound
          playNotificationSound();
          
          // Add new incidents to the list
          setNewIncidents(prev => [...newIncidentsFound, ...prev].slice(0, 10)); // Keep last 10
          setUnreadCount(prev => prev + newIncidentsFound.length);
        }
      }
    } catch (error) {
      console.error('🔴 [Incident Polling] Error checking for new incidents:', error);
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
        
        oscillator.frequency.value = 600;
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

  const handleViewIncident = (incidentId: number) => {
    setIsOpen(false);
    router.push(`/incidents/${incidentId}`);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/incidents');
  };

  const handleClearAll = () => {
    setNewIncidents([]);
    setUnreadCount(0);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'text-success-600 bg-success-100',
      moderate: 'text-warning-600 bg-warning-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-emergency-600 bg-emergency-100'
    };
    return colors[severity] || colors.moderate;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      damage: '🏚️',
      injury: '🚑',
      missing_person: '🔍',
      hazard: '⚠️',
      fire: '🔥',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
        aria-label="Incident Notifications"
        title={wsConnected ? 'Incident Notifications (WebSocket Connected)' : 'Incident Notifications (Polling Mode)'}
      >
        <FileText className="w-5 h-5" />
        
        {/* WebSocket Connection Indicator */}
        <span 
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`}
          title={wsConnected ? 'Real-time connected' : 'Polling mode'}
        />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            {/* Pulse Animation */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-lg">Incident Reports</h3>
              {unreadCount > 0 && (
                <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
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

          {/* Incidents List */}
          <div className="max-h-96 overflow-y-auto">
            {newIncidents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No new incident reports</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {newIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => handleViewIncident(incident.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Severity Indicator */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(incident.severity || 'moderate')}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      {/* Incident Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {incident.title || 'Untitled Incident'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex-shrink-0">
                            {getTypeIcon(incident.incidentType || 'other')} {(incident.incidentType || 'other').replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {incident.description || 'No description provided'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {incident.createdAt && !isNaN(new Date(incident.createdAt).getTime()) 
                              ? format(new Date(incident.createdAt), 'h:mm a')
                              : 'Just now'
                            }
                          </div>
                          {incident.latitude && incident.longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location available
                            </div>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(incident.severity || 'moderate')}`}>
                            {incident.severity || 'moderate'}
                          </span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewIncident(incident.id);
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
          {newIncidents.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleViewAll}
                className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm hover:shadow-md"
              >
                View All Incidents
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
