import { logger } from '../utils/logger';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

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
  photos: string[];
  assignedTo?: number;
  createdAt: string | null;
  updatedAt: string | null;
  userName?: string;
  userPhone?: string;
  jurisdiction?: string;
}

interface SOSAlert {
  id: number;
  userId: number;
  latitude?: number;
  longitude?: number;
  message: string;
  userInfo: any;
  status: string;
  priority: string;
  responderId?: number;
  responseTime?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  jurisdiction?: string;
}

interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_person?: string;
  contact_number?: string;
  facilities: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  distance?: number;
  occupancy_percentage?: number;
  is_full?: boolean;
  jurisdiction?: string;
}

interface QueryContext {
  role: Role;
  jurisdiction?: string;
  userId?: number;
}

export class DataFilterService {
  /**
   * Apply role-based filtering to SQL query
   * Returns WHERE clause conditions and parameters
   */
  applyRoleFilter(
    context: QueryContext,
    baseTableAlias: string = ''
  ): { conditions: string[]; params: any[] } {
    const { role, jurisdiction, userId } = context;
    const conditions: string[] = [];
    const params: any[] = [];
    const prefix = baseTableAlias ? `${baseTableAlias}.` : '';

    // Super admin, admin, and mdrrmo: no filtering (access all data)
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return { conditions, params };
    }

    // PNP, BFP: no geographic filtering (system-wide access for emergency coordination)
    if (role === 'pnp' || role === 'bfp') {
      return { conditions, params };
    }

    // LGU Officer: filter by jurisdiction
    if (role === 'lgu_officer') {
      if (jurisdiction) {
        conditions.push(`${prefix}jurisdiction = ?`);
        params.push(jurisdiction);
      } else {
        // If no jurisdiction set, restrict to no results for safety
        conditions.push('1 = 0');
      }
      return { conditions, params };
    }

    // Citizen: filter by visibility (public data or own data)
    if (role === 'citizen') {
      if (userId) {
        conditions.push(`(${prefix}is_public = TRUE OR ${prefix}user_id = ?)`);
        params.push(userId);
      } else {
        // If no userId, only show public data
        conditions.push(`${prefix}is_public = TRUE`);
      }
      return { conditions, params };
    }

    // Default: no access
    conditions.push('1 = 0');
    return { conditions, params };
  }

  /**
   * Apply evacuation center-specific filtering
   * Returns WHERE clause and parameters for SQL query
   * Requirements: 6.2, 7.3, 8.4, 11.3
   */
  applyEvacuationCenterFilter(
    role: string,
    jurisdiction?: string | null
  ): { whereClause: string; params: any[] } {
    const params: any[] = [];

    // Super admin, admin, and mdrrmo: no filtering (access all data)
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return { whereClause: '', params };
    }

    // PNP, BFP: system-wide access
    // Requirements: 6.2, 11.3
    if (role === 'pnp' || role === 'bfp') {
      return { whereClause: '', params };
    }

    // LGU Officer: filter by jurisdiction (city/province/barangay)
    // Requirements: 7.3, 11.3
    if (role === 'lgu_officer') {
      if (jurisdiction) {
        return { 
          whereClause: '(city = ? OR province = ? OR barangay = ?)', 
          params: [jurisdiction, jurisdiction, jurisdiction] 
        };
      } else {
        // If no jurisdiction set, restrict to no results for safety
        return { whereClause: '1 = 0', params: [] };
      }
    }

    // Citizen: all active evacuation centers (public information)
    // Requirements: 8.4
    if (role === 'citizen') {
      return { whereClause: 'is_active = TRUE', params: [] };
    }

    // Default: no access
    return { whereClause: '1 = 0', params: [] };
  }

  /**
   * Apply SOS alert-specific filtering
   * Returns WHERE clause and parameters for SQL query
   * Requirements: 4.1, 7.4, 8.2, 11.2
   */
  applySOSAlertFilter(
    role: string,
    jurisdiction?: string | null
  ): { whereClause: string; params: any[] } {
    const params: any[] = [];

    // Super admin, admin, and mdrrmo: no filtering (access all data)
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return { whereClause: '', params };
    }

    // PNP: only see SOS alerts assigned to PNP or 'all'
    // Requirements: 4.1, 11.2
    if (role === 'pnp') {
      return { 
        whereClause: "(sa.target_agency = 'pnp' OR sa.target_agency = 'all')", 
        params: [] 
      };
    }

    // BFP: only see SOS alerts assigned to BFP or 'all'
    // Requirements: 4.1, 11.2
    if (role === 'bfp') {
      return { 
        whereClause: "(sa.target_agency = 'bfp' OR sa.target_agency = 'all')", 
        params: [] 
      };
    }

    // LGU Officer: filter by jurisdiction
    // Requirements: 7.4, 11.2
    if (role === 'lgu_officer') {
      if (jurisdiction) {
        return { 
          whereClause: 'sa.jurisdiction = ?', 
          params: [jurisdiction] 
        };
      } else {
        // If no jurisdiction set, restrict to no results for safety
        return { whereClause: '1 = 0', params: [] };
      }
    }

    // Citizen: only own SOS alerts
    // Note: This should be handled at controller level with userId filter
    // For now, no additional filtering at query level
    return { whereClause: '', params };
  }

  /**
   * Apply incident-specific filtering
   * Returns WHERE clause and parameters for SQL query
   * Requirements: 4.1, 5.1, 7.2, 11.1
   */
  applyIncidentFilter(
    role: string,
    jurisdiction?: string | null
  ): { whereClause: string; params: any[] } {
    const params: any[] = [];

    // Super admin, admin, and mdrrmo: no filtering (access all data)
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return { whereClause: '', params };
    }

    // PNP, BFP: no geographic filtering (system-wide access for emergency coordination)
    // Requirements: 4.1, 11.1
    if (role === 'pnp' || role === 'bfp') {
      return { whereClause: '', params };
    }

    // LGU Officer: filter by jurisdiction
    // Requirements: 7.2, 11.1
    if (role === 'lgu_officer') {
      if (jurisdiction) {
        return { 
          whereClause: 'ir.jurisdiction = ?', 
          params: [jurisdiction] 
        };
      } else {
        // If no jurisdiction set, restrict to no results for safety
        return { whereClause: '1 = 0', params: [] };
      }
    }

    // Citizen: only own incidents
    // Note: This should be handled at controller level with userId filter
    // For now, no additional filtering at query level
    return { whereClause: '', params };
  }

  /**
   * Filter incidents based on role
   */
  filterIncidents(
    incidents: Incident[],
    role: Role,
    jurisdiction?: string,
    userId?: number
  ): Incident[] {
    // Super admin, admin, and mdrrmo: no filtering
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return incidents;
    }

    // PNP: system-wide access
    if (role === 'pnp') {
      return incidents;
    }

    // BFP: full access to fire incidents, basic info for others
    if (role === 'bfp') {
      return incidents.map(incident => {
        if (incident.incidentType === 'fire') {
          return incident;
        } else {
          // Return only basic information for non-fire incidents
          return {
            id: incident.id,
            userId: incident.userId,
            incidentType: incident.incidentType,
            title: incident.title,
            description: '', // Hide detailed description
            latitude: incident.latitude,
            longitude: incident.longitude,
            address: incident.address,
            severity: incident.severity,
            status: incident.status,
            photos: [], // Hide photos
            createdAt: incident.createdAt,
            updatedAt: incident.updatedAt
          } as Incident;
        }
      });
    }

    // LGU Officer: filter by jurisdiction
    if (role === 'lgu_officer') {
      if (!jurisdiction) {
        return [];
      }
      return incidents.filter(incident => 
        incident.jurisdiction === jurisdiction
      );
    }

    // Citizen: only own incidents or public incidents
    if (role === 'citizen') {
      return incidents.filter(incident => 
        incident.userId === userId
      );
    }

    // Default: no access
    return [];
  }

  /**
   * Filter SOS alerts based on role
   */
  filterSOSAlerts(
    alerts: SOSAlert[],
    role: Role,
    jurisdiction?: string,
    userId?: number
  ): SOSAlert[] {
    // Super admin, admin, and mdrrmo: no filtering
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return alerts;
    }

    // PNP: only see SOS alerts assigned to PNP or 'all'
    if (role === 'pnp') {
      return alerts.filter(alert => 
        (alert as any).targetAgency === 'pnp' || (alert as any).targetAgency === 'all'
      );
    }

    // BFP: only see SOS alerts assigned to BFP or 'all'
    if (role === 'bfp') {
      return alerts.filter(alert => 
        (alert as any).targetAgency === 'bfp' || (alert as any).targetAgency === 'all'
      );
    }

    // LGU Officer: filter by jurisdiction
    if (role === 'lgu_officer') {
      if (!jurisdiction) {
        return [];
      }
      return alerts.filter(alert => 
        alert.jurisdiction === jurisdiction
      );
    }

    // Citizen: only own SOS alerts
    if (role === 'citizen') {
      return alerts.filter(alert => 
        alert.userId === userId
      );
    }

    // Default: no access
    return [];
  }

  /**
   * Filter evacuation centers based on role
   */
  filterEvacuationCenters(
    centers: EvacuationCenter[],
    role: Role,
    jurisdiction?: string
  ): EvacuationCenter[] {
    // Super admin, admin, and mdrrmo: no filtering
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return centers;
    }

    // PNP, BFP: system-wide access
    if (role === 'pnp' || role === 'bfp') {
      return centers;
    }

    // LGU Officer: filter by jurisdiction (city/province/barangay)
    if (role === 'lgu_officer') {
      if (!jurisdiction) {
        return [];
      }
      return centers.filter(center => 
        center.city === jurisdiction || 
        center.province === jurisdiction ||
        center.barangay === jurisdiction ||
        center.jurisdiction === jurisdiction
      );
    }

    // Citizen: all active evacuation centers (public information)
    if (role === 'citizen') {
      return centers.filter(center => center.is_active);
    }

    // Default: no access
    return [];
  }

  /**
   * Build SQL WHERE clause for role-based filtering
   * This is a helper method for constructing queries
   */
  buildWhereClause(
    context: QueryContext,
    baseTableAlias: string = ''
  ): string {
    const { conditions, params } = this.applyRoleFilter(context, baseTableAlias);
    
    if (conditions.length === 0) {
      return '';
    }

    return conditions.join(' AND ');
  }

  /**
   * Get filter parameters for parameterized queries
   */
  getFilterParams(
    context: QueryContext,
    baseTableAlias: string = ''
  ): any[] {
    const { params } = this.applyRoleFilter(context, baseTableAlias);
    return params;
  }

  /**
   * Check if user has access to specific resource
   */
  hasAccessToResource(
    resourceOwnerId: number,
    resourceJurisdiction: string | undefined,
    context: QueryContext
  ): boolean {
    const { role, jurisdiction, userId } = context;

    // Super admin, admin, and mdrrmo: always have access
    if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
      return true;
    }

    // PNP, BFP: system-wide access
    if (role === 'pnp' || role === 'bfp') {
      return true;
    }

    // LGU Officer: check jurisdiction match
    if (role === 'lgu_officer') {
      return jurisdiction === resourceJurisdiction;
    }

    // Citizen: check ownership
    if (role === 'citizen') {
      return userId === resourceOwnerId;
    }

    return false;
  }

  /**
   * Log filtering action for audit purposes
   */
  private logFilterAction(
    role: Role,
    resourceType: string,
    originalCount: number,
    filteredCount: number
  ): void {
    if (originalCount !== filteredCount) {
      logger.debug(
        `Data filtered for ${role}: ${resourceType} - ${originalCount} -> ${filteredCount} records`
      );
    }
  }
}

// Export singleton instance
export const dataFilterService = new DataFilterService();
