// Disaster Alerts API Service

import api from './api';
import {
  AlertFilters,
  SearchAlertsRequest,
  AlertsResponse,
  AlertResponse,
  SearchAlertsResponse,
} from '../types/api';
import { DisasterAlert } from '../types/models';

export const alertsService = {
  // Get all alerts with filters
  getAlerts: async (filters?: AlertFilters): Promise<{ alerts: DisasterAlert[]; total: number }> => {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
    if (filters?.lat) params.append('lat', String(filters.lat));
    if (filters?.lng) params.append('lng', String(filters.lng));
    if (filters?.radius) params.append('radius', String(filters.radius));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<AlertsResponse>(`/alerts?${params.toString()}`);
    return {
      alerts: response.data.data!.data,
      total: response.data.data!.total,
    };
  },

  // Get alert by ID
  getAlertById: async (id: number): Promise<DisasterAlert> => {
    const response = await api.get<AlertResponse>(`/alerts/${id}`);
    return response.data.data!;
  },

  // Search alerts
  searchAlerts: async (params: SearchAlertsRequest): Promise<DisasterAlert[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);

    const response = await api.get<SearchAlertsResponse>(`/alerts/search?${queryParams.toString()}`);
    return response.data.data!;
  },

  // Get active alerts for user's location
  getActiveAlertsNearby: async (lat: number, lng: number, radius: number = 50): Promise<DisasterAlert[]> => {
    const { alerts } = await alertsService.getAlerts({
      isActive: true,
      lat,
      lng,
      radius,
    });
    return alerts;
  },
};

export default alertsService;
