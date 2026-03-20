// SafeHaven API Client - Connect to Express Backend

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('safehaven_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token attached to request:', config.method?.toUpperCase(), config.url);
      } else {
        console.warn('⚠️ No token found for request:', config.method?.toUpperCase(), config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Log the error for debugging
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers?.Authorization ? 'Token present' : 'No token',
    });

    if (error.response?.status === 401) {
      // Unauthorized - but DON'T auto-redirect, let the component handle it
      console.error('🚫 401 Unauthorized - Token may be invalid or expired');
      
      // Only clear and redirect if this is a persistent auth failure
      // Don't redirect on every 401 to avoid logout loops
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('safehaven_token');
        if (token) {
          console.log('Token exists but was rejected. Checking token age...');
          const tokenTime = localStorage.getItem('safehaven_token_time');
          const tokenAge = tokenTime ? Date.now() - parseInt(tokenTime) : 0;
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          
          if (tokenAge > sevenDays) {
            console.log('Token is older than 7 days, clearing...');
            localStorage.removeItem('safehaven_token');
            localStorage.removeItem('safehaven_user');
            localStorage.removeItem('safehaven_token_time');
            if (!window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login';
            }
          } else {
            console.log('Token age is OK, but server rejected it. May need to re-login.');
          }
        }
      }
    }
    
    if (error.response?.status === 403) {
      console.error('403 Forbidden - User does not have permission');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.data?.errors) {
      return Array.isArray(axiosError.response.data.errors)
        ? axiosError.response.data.errors.join(', ')
        : axiosError.response.data.errors;
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: { name: string; email: string; password: string; phone: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile');
    return response.data;
  },
};

// Alerts API
export const alertsApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/alerts', { params });
    // Transform snake_case to camelCase
    if (response.data.status === 'success' && response.data.data) {
      const alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.alerts || [];
      
      response.data.data = alerts.map((alert: any) => {
        // Parse affected_areas safely
        let affectedAreas = [];
        try {
          if (typeof alert.affected_areas === 'string') {
            // Try to parse as JSON first
            try {
              affectedAreas = JSON.parse(alert.affected_areas);
            } catch {
              // If not JSON, split by comma
              affectedAreas = alert.affected_areas.split(',').map((s: string) => s.trim());
            }
          } else if (Array.isArray(alert.affected_areas)) {
            affectedAreas = alert.affected_areas;
          }
        } catch (e) {
          console.error('Error parsing affected_areas:', e);
          affectedAreas = [];
        }

        return {
          id: alert.id,
          type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          location: Array.isArray(affectedAreas) ? affectedAreas.join(', ') : '',
          affectedAreas: affectedAreas,
          latitude: alert.latitude,
          longitude: alert.longitude,
          radius: alert.radius_km,
          isActive: alert.is_active,
          createdBy: alert.created_by,
          createdAt: alert.created_at,
          updatedAt: alert.updated_at,
        };
      });
    }
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/alerts/${id}`);
    // Transform snake_case to camelCase
    if (response.data.status === 'success' && response.data.data) {
      const alert = response.data.data;
      
      // Parse affected_areas safely
      let affectedAreas = [];
      try {
        if (typeof alert.affected_areas === 'string') {
          try {
            affectedAreas = JSON.parse(alert.affected_areas);
          } catch {
            affectedAreas = alert.affected_areas.split(',').map((s: string) => s.trim());
          }
        } else if (Array.isArray(alert.affected_areas)) {
          affectedAreas = alert.affected_areas;
        }
      } catch (e) {
        console.error('Error parsing affected_areas:', e);
        affectedAreas = [];
      }

      response.data.data = {
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        location: Array.isArray(affectedAreas) ? affectedAreas.join(', ') : '',
        affectedAreas: affectedAreas,
        latitude: alert.latitude,
        longitude: alert.longitude,
        radius: alert.radius_km,
        isActive: alert.is_active,
        createdBy: alert.created_by,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
      };
    }
    return response.data;
  },
  
  create: async (data: any) => {
    // Use current timestamp - database will store as-is
    // Mobile app will calculate relative time correctly
    const now = new Date();
    
    // Transform camelCase to snake_case for backend
    const backendData = {
      alert_type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      source: 'LGU',
      affected_areas: data.location ? [data.location] : [],
      latitude: data.latitude,
      longitude: data.longitude,
      radius_km: data.radius,
      start_time: now.toISOString(),
      end_time: null,
      metadata: data.actionRequired ? { action_required: data.actionRequired } : null,
    };
    
    console.log('Creating alert with start_time:', backendData.start_time);
    
    const response = await api.post('/alerts', backendData);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    // Transform camelCase to snake_case for backend
    const backendData = {
      alert_type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      affected_areas: data.location ? [data.location] : undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      radius_km: data.radius,
    };
    const response = await api.put(`/alerts/${id}`, backendData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  broadcast: async (id: number) => {
    const response = await api.post(`/alerts/${id}/broadcast`);
    return response.data;
  },

  getStatistics: async (id: number) => {
    const response = await api.get(`/alerts/${id}/statistics`);
    return response.data;
  },
};

// Incidents API
export const incidentsApi = {
  getAll: async (params?: any) => {
    console.log('📡 Fetching incidents with params:', params);
    const response = await api.get('/incidents', { params });
    console.log('📦 Raw incidents response:', response.data);
    
    // Backend returns: { status: 'success', data: { data: [...], total, page, limit } }
    // Transform to match frontend expectations
    if (response.data.status === 'success' && response.data.data) {
      const paginatedData = response.data.data;
      
      // If data has nested data array (paginated response)
      if (paginatedData.data && Array.isArray(paginatedData.data)) {
        console.log('✅ Found paginated data:', paginatedData.data.length, 'incidents');
        return {
          status: 'success',
          data: paginatedData, // Keep the full pagination structure
        };
      }
      
      // If data is already an array
      if (Array.isArray(paginatedData)) {
        console.log('✅ Found array data:', paginatedData.length, 'incidents');
        return {
          status: 'success',
          data: { data: paginatedData, total: paginatedData.length, page: 1, limit: paginatedData.length },
        };
      }
    }
    
    console.warn('⚠️ Unexpected response structure:', response.data);
    return response.data;
  },
  
  getById: async (id: number) => {
    console.log('📡 Fetching incident:', id);
    const response = await api.get(`/incidents/${id}`);
    console.log('📦 Incident response:', response.data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    console.log('📡 Updating incident status:', id, status);
    const response = await api.patch(`/incidents/${id}/status`, { status });
    console.log('📦 Update response:', response.data);
    return response.data;
  },
};

// Centers API
export const centersApi = {
  getAll: async (params?: any) => {
    console.log('📡 Fetching evacuation centers with params:', params);
    const response = await api.get('/evacuation-centers', { params });
    console.log('📦 Raw centers response:', response.data);
    return response.data;
  },
  
  getById: async (id: number) => {
    console.log('📡 Fetching evacuation center:', id);
    const response = await api.get(`/evacuation-centers/${id}`);
    console.log('📦 Center response:', response.data);
    return response.data;
  },
  
  create: async (data: any) => {
    console.log('📡 Creating evacuation center:', data);
    const response = await api.post('/evacuation-centers', data);
    console.log('📦 Create response:', response.data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    console.log('📡 Updating evacuation center:', id, data);
    const response = await api.put(`/evacuation-centers/${id}`, data);
    console.log('📦 Update response:', response.data);
    return response.data;
  },
  
  delete: async (id: number) => {
    console.log('📡 Deleting evacuation center:', id);
    const response = await api.delete(`/evacuation-centers/${id}`);
    console.log('📦 Delete response:', response.data);
    return response.data;
  },
};

// Contacts API
export const contactsApi = {
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: any) => {
    console.log('📡 Fetching users with params:', params);
    const response = await api.get('/users', { params });
    console.log('📦 Raw users response:', response.data);
    return response.data;
  },
  
  create: async (userData: any) => {
    console.log('📡 Creating user:', userData);
    const response = await api.post('/users', userData);
    console.log('📦 Create user response:', response.data);
    return response.data;
  },
  
  getById: async (id: number) => {
    console.log('📡 Fetching user:', id);
    const response = await api.get(`/users/${id}`);
    console.log('📦 User response:', response.data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    console.log('📡 Updating user:', id, data);
    const response = await api.put(`/users/${id}`, data);
    console.log('📦 Update response:', response.data);
    return response.data;
  },
  
  delete: async (id: number, hardDelete: boolean = false) => {
    console.log('📡 Deleting user:', id, 'Hard delete:', hardDelete);
    const response = await api.delete(`/users/${id}${hardDelete ? '?hard=true' : ''}`);
    console.log('📦 Delete response:', response.data);
    return response.data;
  },

  getStatistics: async () => {
    console.log('📡 Fetching user statistics');
    const response = await api.get('/users/statistics');
    console.log('📦 Statistics response:', response.data);
    return response.data;
  },

  resetPassword: async (id: number, password: string) => {
    console.log('📡 Resetting password for user:', id);
    const response = await api.post(`/users/${id}/reset-password`, { password });
    console.log('📦 Reset password response:', response.data);
    return response.data;
  },
};

// SOS API
export const sosApi = {
  getAll: async (params?: any) => {
    console.log('📡 Fetching SOS alerts with params:', params);
    const response = await api.get('/sos', { params });
    console.log('📦 Raw SOS response:', response.data);
    return response.data;
  },
  
  getById: async (id: number) => {
    console.log('📡 Fetching SOS alert:', id);
    const response = await api.get(`/sos/${id}`);
    console.log('📦 SOS alert response:', response.data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string, notes?: string) => {
    console.log('📡 Updating SOS status:', id, status);
    const response = await api.patch(`/sos/${id}/status`, { status, notes });
    console.log('📦 Update status response:', response.data);
    return response.data;
  },

  getStatistics: async () => {
    console.log('📡 Fetching SOS statistics');
    const response = await api.get('/sos/statistics');
    console.log('📦 Statistics response:', response.data);
    return response.data;
  },
};

// Emergency Contacts API
export const emergencyContactsApi = {
  getAll: async (params?: any) => {
    console.log('📡 Fetching emergency contacts with params:', params);
    const response = await api.get('/emergency-contacts', { params });
    console.log('📦 Contacts response:', response.data);
    return response.data;
  },
  
  getById: async (id: number) => {
    console.log('📡 Fetching contact:', id);
    const response = await api.get(`/emergency-contacts/${id}`);
    console.log('📦 Contact response:', response.data);
    return response.data;
  },
  
  getCategories: async () => {
    console.log('📡 Fetching contact categories');
    const response = await api.get('/emergency-contacts/categories');
    console.log('📦 Categories response:', response.data);
    return response.data;
  },
  
  create: async (data: any) => {
    console.log('📡 Creating contact:', data);
    const response = await api.post('/emergency-contacts', data);
    console.log('📦 Create response:', response.data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    console.log('📡 Updating contact:', id, data);
    const response = await api.put(`/emergency-contacts/${id}`, data);
    console.log('📦 Update response:', response.data);
    return response.data;
  },
  
  delete: async (id: number) => {
    console.log('📡 Deleting contact:', id);
    const response = await api.delete(`/emergency-contacts/${id}`);
    console.log('📦 Delete response:', response.data);
    return response.data;
  },
};

// Stats API (for dashboard)
export const statsApi = {
  getDashboard: async () => {
    // This endpoint needs to be created in backend
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    console.log('📡 Fetching admin dashboard stats');
    const response = await api.get('/admin/stats');
    console.log('📦 Stats response:', response.data);
    return response.data;
  },
  
  getAnalytics: async (days: number = 30) => {
    console.log('📡 Fetching admin analytics for', days, 'days');
    const response = await api.get('/admin/analytics', { params: { days } });
    console.log('📦 Analytics response:', response.data);
    return response.data;
  },
  
  getActivity: async (limit: number = 20, offset: number = 0) => {
    console.log('📡 Fetching admin activity feed');
    const response = await api.get('/admin/activity', { params: { limit, offset } });
    console.log('📦 Activity response:', response.data);
    return response.data;
  },
  
  getHealth: async () => {
    console.log('📡 Fetching system health');
    const response = await api.get('/admin/health');
    console.log('📦 Health response:', response.data);
    return response.data;
  },

  // Weather API
  weather: {
    getPhilippines: async () => {
      console.log('📡 Fetching Philippines weather');
      const response = await api.get('/admin/weather/philippines');
      console.log('📦 Weather response:', response.data);
      return response.data;
    },
    
    getLocation: async (lat: number, lon: number) => {
      console.log('📡 Fetching weather for location:', lat, lon);
      const response = await api.get('/admin/weather/location', { params: { lat, lon } });
      console.log('📦 Location weather response:', response.data);
      return response.data;
    },
  },

  // Earthquake API
  earthquake: {
    getRecent: async (days: number = 7, minMagnitude: number = 4) => {
      console.log('📡 Fetching recent earthquakes:', days, 'days, M', minMagnitude, '+');
      const response = await api.get('/admin/earthquakes/recent', { 
        params: { days, minMagnitude } 
      });
      console.log('📦 Earthquakes response:', response.data);
      return response.data;
    },
    
    getStats: async (days: number = 30) => {
      console.log('📡 Fetching earthquake statistics:', days, 'days');
      const response = await api.get('/admin/earthquakes/stats', { params: { days } });
      console.log('📦 Earthquake stats response:', response.data);
      return response.data;
    },
  },

  // Alert Automation API
  alertAutomation: {
    getPendingAlerts: async (limit: number = 20) => {
      console.log('📡 Fetching pending auto-generated alerts');
      const response = await api.get('/admin/alert-automation/pending', { params: { limit } });
      console.log('📦 Pending alerts response:', response.data);
      return response.data;
    },

    approveAlert: async (alertId: number) => {
      console.log('📡 Approving alert:', alertId);
      const response = await api.post(`/admin/alert-automation/alerts/${alertId}/approve`);
      console.log('📦 Approve response:', response.data);
      return response.data;
    },

    rejectAlert: async (alertId: number, reason: string) => {
      console.log('📡 Rejecting alert:', alertId, reason);
      const response = await api.post(`/admin/alert-automation/alerts/${alertId}/reject`, { reason });
      console.log('📦 Reject response:', response.data);
      return response.data;
    },

    getLogs: async (limit: number = 50, offset: number = 0) => {
      console.log('📡 Fetching automation logs');
      const response = await api.get('/admin/alert-automation/logs', { params: { limit, offset } });
      console.log('📦 Logs response:', response.data);
      return response.data;
    },

    triggerMonitoring: async () => {
      console.log('📡 Manually triggering monitoring cycle');
      const response = await api.post('/admin/alert-automation/trigger');
      console.log('📦 Trigger response:', response.data);
      return response.data;
    },

    getRules: async (type?: 'weather' | 'earthquake') => {
      console.log('📡 Fetching alert rules');
      const response = await api.get('/admin/alert-automation/rules', { params: { type } });
      console.log('📦 Rules response:', response.data);
      return response.data;
    },

    getRuleById: async (ruleId: number) => {
      console.log('📡 Fetching rule:', ruleId);
      const response = await api.get(`/admin/alert-automation/rules/${ruleId}`);
      console.log('📦 Rule response:', response.data);
      return response.data;
    },

    createRule: async (ruleData: any) => {
      console.log('📡 Creating rule:', ruleData);
      const response = await api.post('/admin/alert-automation/rules', ruleData);
      console.log('📦 Create rule response:', response.data);
      return response.data;
    },

    updateRule: async (ruleId: number, updates: any) => {
      console.log('📡 Updating rule:', ruleId, updates);
      const response = await api.put(`/admin/alert-automation/rules/${ruleId}`, updates);
      console.log('📦 Update rule response:', response.data);
      return response.data;
    },

    toggleRule: async (ruleId: number, isActive: boolean) => {
      console.log('📡 Toggling rule:', ruleId, isActive);
      const response = await api.patch(`/admin/alert-automation/rules/${ruleId}/toggle`, { is_active: isActive });
      console.log('📦 Toggle rule response:', response.data);
      return response.data;
    },

    deleteRule: async (ruleId: number) => {
      console.log('📡 Deleting rule:', ruleId);
      const response = await api.delete(`/admin/alert-automation/rules/${ruleId}`);
      console.log('📦 Delete rule response:', response.data);
      return response.data;
    },
  },
};

export default api;
