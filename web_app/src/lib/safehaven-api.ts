// SafeHaven API Client - Connect to Express Backend

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
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
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
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
      start_time: new Date().toISOString(),
      end_time: null,
      metadata: data.actionRequired ? { action_required: data.actionRequired } : null,
    };
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
    const response = await api.get('/incidents', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/incidents/${id}`, { status });
    return response.data;
  },
};

// Centers API
export const centersApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/centers', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/centers/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/centers', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/centers/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/centers/${id}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
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

// SOS API
export const sosApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/sos', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/sos/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/sos/${id}/status`, { status });
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

export default api;
