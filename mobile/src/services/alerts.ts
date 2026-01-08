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

// Transform snake_case to camelCase
const transformAlert = (alert: any): DisasterAlert => {
  console.log('🔄 Transforming alert:', alert.id, 'type:', alert.alert_type);
  
  return {
    id: alert.id,
    alertType: alert.alert_type,
    severity: alert.severity,
    title: alert.title,
    description: alert.description,
    source: alert.source,
    affectedAreas: Array.isArray(alert.affected_areas) ? alert.affected_areas : [],
    latitude: parseFloat(alert.latitude),
    longitude: parseFloat(alert.longitude),
    radiusKm: alert.radius_km,
    startTime: alert.start_time,
    endTime: alert.end_time,
    isActive: Boolean(alert.is_active),
    metadata: alert.metadata,
    createdAt: alert.created_at,
    updatedAt: alert.updated_at,
  };
};

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
    
    // Add cache-busting timestamp
    params.append('_t', Date.now().toString());

    console.log('📡 Fetching alerts from API...');
    const response = await api.get<AlertsResponse>(`/alerts?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    console.log('📦 Raw alerts response:', JSON.stringify(response.data, null, 2));
    
    // Backend returns { data: { alerts: [...], total, page, limit } }
    const responseData = response.data.data!;
    const alertsData = (responseData as any).alerts || [];
    const transformedAlerts = alertsData.map(transformAlert);
    
    console.log('✅ Transformed alerts:', transformedAlerts.length);
    
    return {
      alerts: transformedAlerts,
      total: (responseData as any).total || transformedAlerts.length,
    };
  },

  // Get alert by ID
  getAlertById: async (id: number): Promise<DisasterAlert> => {
    const response = await api.get<AlertResponse>(`/alerts/${id}`);
    return transformAlert(response.data.data!);
  },

  // Search alerts
  searchAlerts: async (params: SearchAlertsRequest): Promise<DisasterAlert[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);

    const response = await api.get<SearchAlertsResponse>(`/alerts/search?${queryParams.toString()}`);
    return (response.data.data! as any[]).map(transformAlert);
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
