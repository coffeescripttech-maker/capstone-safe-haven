// SafeHaven TypeScript Types

export type AlertType = 'typhoon' | 'earthquake' | 'flood' | 'fire' | 'landslide' | 'tsunami' | 'volcanic' | 'other';
export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type IncidentType = 'damage' | 'injury' | 'missing_person' | 'hazard' | 'other';
export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type IncidentStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type UserRole = 'user' | 'admin' | 'lgu' | 'moderator';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: number;
  address?: string;
  bloodType?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface DisasterAlert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedAreas: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: number;
  userId: number;
  incidentType: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy?: number;
  facilities: string;
  contactPerson: string;
  contactNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  category: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isNational: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SOSAlert {
  id: number;
  userId: number;
  latitude: number;
  longitude: number;
  address?: string;
  message?: string;
  status: 'active' | 'responded' | 'resolved';
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
    bloodType?: string;
    medicalConditions?: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalAlerts: number;
  activeAlerts: number;
  totalIncidents: number;
  pendingIncidents: number;
  totalCenters: number;
  activeSOS: number;
  recentAlerts: DisasterAlert[];
  recentIncidents: Incident[];
  activeSOS: SOSAlert[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
