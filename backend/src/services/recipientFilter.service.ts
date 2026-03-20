/**
 * RecipientFilter Service
 * 
 * Filters and retrieves recipients for SMS blast campaigns based on location filters.
 * Enforces jurisdiction restrictions for Admin users and validates phone numbers.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import db from '../config/database';
import { PhoneValidator } from './phoneValidator.service';
import { AppError } from '../middleware/errorHandler';

/**
 * User information from authentication
 */
export interface User {
  id: number;
  email: string;
  role: 'super_admin' | 'admin' | 'pnp' | 'bfp' | 'mdrrmo' | 'lgu_officer' | 'lgu' | 'citizen';
  jurisdiction?: string | null;
}

/**
 * Location filters for recipient selection
 */
export interface RecipientFilters {
  provinces?: string[];
  cities?: string[];
  barangays?: string[];
  contactGroupIds?: string[];
  userStatus?: 'active' | 'inactive' | 'all';
}

/**
 * Recipient information
 */
export interface Recipient {
  userId: number;
  phoneNumber: string;
  name: string;
  location: {
    province: string;
    city: string;
    barangay: string;
  };
}

/**
 * Validation result for filters
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class RecipientFilter {
  private phoneValidator: PhoneValidator;

  constructor() {
    this.phoneValidator = new PhoneValidator();
  }

  /**
   * Get recipients matching the specified filters
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
   * 
   * @param filters - Location and status filters
   * @param requestingUser - User making the request (for jurisdiction checking)
   * @returns Array of recipients matching all filters
   */
  async getRecipients(
    filters: RecipientFilters,
    requestingUser: User
  ): Promise<Recipient[]> {
    // Validate filters against user jurisdiction
    const validation = this.validateFilters(filters, requestingUser);
    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid filters', 403);
    }

    // Build query with filters
    let query = `
      SELECT 
        u.id,
        u.phone,
        u.first_name,
        u.last_name,
        p.province,
        p.city,
        p.barangay
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Requirement 2.4: Filter only active users with valid phone numbers
    const userStatus = filters.userStatus || 'active';
    if (userStatus === 'active') {
      query += ` AND u.is_active = TRUE`;
    } else if (userStatus === 'inactive') {
      query += ` AND u.is_active = FALSE`;
    }
    // If 'all', don't add status filter

    // Filter users with phone numbers
    query += ` AND u.phone IS NOT NULL AND u.phone != ''`;

    // Apply location filters with AND logic (Requirement 2.6)
    if (filters.provinces && filters.provinces.length > 0) {
      query += ` AND p.province IN (${filters.provinces.map(() => '?').join(',')})`;
      params.push(...filters.provinces);
    }

    if (filters.cities && filters.cities.length > 0) {
      query += ` AND p.city IN (${filters.cities.map(() => '?').join(',')})`;
      params.push(...filters.cities);
    }

    if (filters.barangays && filters.barangays.length > 0) {
      query += ` AND p.barangay IN (${filters.barangays.map(() => '?').join(',')})`;
      params.push(...filters.barangays);
    }

    // Apply jurisdiction restrictions for Admin and MDRRMO users (Requirement 2.2)
    if ((requestingUser.role === 'admin' || requestingUser.role === 'mdrrmo') && requestingUser.jurisdiction) {
      const jurisdictionParts = requestingUser.jurisdiction.split(':');
      const userProvince = jurisdictionParts[0] || null;
      const userCity = jurisdictionParts[1] || null;
      const userBarangay = jurisdictionParts[2] || null;

      if (userProvince) {
        query += ` AND p.province = ?`;
        params.push(userProvince);
      }

      if (userCity) {
        query += ` AND p.city = ?`;
        params.push(userCity);
      }

      if (userBarangay) {
        query += ` AND p.barangay = ?`;
        params.push(userBarangay);
      }
    }

    query += ` ORDER BY u.id`;

    try {
      const [rows] = await db.query(query, params);
      const users = rows as any[];

      // Process contact groups if specified
      let groupRecipients: Recipient[] = [];
      if (filters.contactGroupIds && filters.contactGroupIds.length > 0) {
        for (const groupId of filters.contactGroupIds) {
          const groupUsers = await this.resolveContactGroup(groupId);
          groupRecipients.push(...groupUsers);
        }
      }

      // Combine direct filter results with contact group results
      const allRecipients = [...users.map(this.formatRecipient), ...groupRecipients];

      // Remove duplicates based on userId
      const uniqueRecipients = Array.from(
        new Map(allRecipients.map(r => [r.userId, r])).values()
      );

      // Validate phone numbers and filter out invalid ones (Requirement 2.4)
      const validRecipients = uniqueRecipients.filter(recipient => {
        const validation = this.phoneValidator.validate(recipient.phoneNumber);
        return validation.isValid;
      });

      // Normalize phone numbers
      const normalizedRecipients = validRecipients.map(recipient => ({
        ...recipient,
        phoneNumber: this.phoneValidator.normalize(recipient.phoneNumber)
      }));

      return normalizedRecipients;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch recipients', 500);
    }
  }

  /**
   * Count recipients without fetching full data
   * Requirements: 2.3, 2.4
   * 
   * @param filters - Location and status filters
   * @param requestingUser - User making the request
   * @returns Count of matching recipients
   */
  async countRecipients(
    filters: RecipientFilters,
    requestingUser: User
  ): Promise<number> {
    // Validate filters against user jurisdiction
    const validation = this.validateFilters(filters, requestingUser);
    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid filters', 403);
    }

    // Build count query with same filters
    let query = `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter active users with valid phone numbers
    const userStatus = filters.userStatus || 'active';
    if (userStatus === 'active') {
      query += ` AND u.is_active = TRUE`;
    } else if (userStatus === 'inactive') {
      query += ` AND u.is_active = FALSE`;
    }

    query += ` AND u.phone IS NOT NULL AND u.phone != ''`;

    // Apply location filters
    if (filters.provinces && filters.provinces.length > 0) {
      query += ` AND p.province IN (${filters.provinces.map(() => '?').join(',')})`;
      params.push(...filters.provinces);
    }

    if (filters.cities && filters.cities.length > 0) {
      query += ` AND p.city IN (${filters.cities.map(() => '?').join(',')})`;
      params.push(...filters.cities);
    }

    if (filters.barangays && filters.barangays.length > 0) {
      query += ` AND p.barangay IN (${filters.barangays.map(() => '?').join(',')})`;
      params.push(...filters.barangays);
    }

    // Apply jurisdiction restrictions for Admin and MDRRMO users
    if ((requestingUser.role === 'admin' || requestingUser.role === 'mdrrmo') && requestingUser.jurisdiction) {
      const jurisdictionParts = requestingUser.jurisdiction.split(':');
      const userProvince = jurisdictionParts[0] || null;
      const userCity = jurisdictionParts[1] || null;
      const userBarangay = jurisdictionParts[2] || null;

      if (userProvince) {
        query += ` AND p.province = ?`;
        params.push(userProvince);
      }

      if (userCity) {
        query += ` AND p.city = ?`;
        params.push(userCity);
      }

      if (userBarangay) {
        query += ` AND p.barangay = ?`;
        params.push(userBarangay);
      }
    }

    try {
      const [rows] = await db.query(query, params);
      let count = (rows as any)[0].count;

      // Add contact group members if specified
      if (filters.contactGroupIds && filters.contactGroupIds.length > 0) {
        for (const groupId of filters.contactGroupIds) {
          const groupUsers = await this.resolveContactGroup(groupId);
          count += groupUsers.length;
        }
      }

      return count;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to count recipients', 500);
    }
  }

  /**
   * Resolve contact group to list of recipients
   * Requirements: 17.4, 17.6
   * 
   * @param groupId - Contact group ID
   * @returns Array of recipients in the group
   */
  async resolveContactGroup(groupId: string): Promise<Recipient[]> {
    try {
      // Fetch contact group
      const [groups] = await db.query(
        'SELECT recipient_filters FROM contact_groups WHERE id = ?',
        [groupId]
      );

      if (!Array.isArray(groups) || groups.length === 0) {
        throw new AppError('Contact group not found', 404);
      }

      const group = (groups as any)[0];
      const recipientFilters = JSON.parse(group.recipient_filters) as RecipientFilters;

      // Build query based on group filters
      let query = `
        SELECT 
          u.id,
          u.phone,
          u.first_name,
          u.last_name,
          p.province,
          p.city,
          p.barangay
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.is_active = TRUE
        AND u.phone IS NOT NULL 
        AND u.phone != ''
      `;
      const params: any[] = [];

      // Apply location filters from group
      if (recipientFilters.provinces && recipientFilters.provinces.length > 0) {
        query += ` AND p.province IN (${recipientFilters.provinces.map(() => '?').join(',')})`;
        params.push(...recipientFilters.provinces);
      }

      if (recipientFilters.cities && recipientFilters.cities.length > 0) {
        query += ` AND p.city IN (${recipientFilters.cities.map(() => '?').join(',')})`;
        params.push(...recipientFilters.cities);
      }

      if (recipientFilters.barangays && recipientFilters.barangays.length > 0) {
        query += ` AND p.barangay IN (${recipientFilters.barangays.map(() => '?').join(',')})`;
        params.push(...recipientFilters.barangays);
      }

      const [rows] = await db.query(query, params);
      const users = rows as any[];

      // Validate phone numbers and filter out invalid ones
      const validRecipients = users
        .map(this.formatRecipient)
        .filter(recipient => {
          const validation = this.phoneValidator.validate(recipient.phoneNumber);
          return validation.isValid;
        });

      // Normalize phone numbers
      return validRecipients.map(recipient => ({
        ...recipient,
        phoneNumber: this.phoneValidator.normalize(recipient.phoneNumber)
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to resolve contact group', 500);
    }
  }

  /**
   * Validate filters against user jurisdiction
   * Requirements: 9.2, 9.4
   * 
   * @param filters - Filters to validate
   * @param user - User making the request
   * @returns Validation result
   */
  validateFilters(
    filters: RecipientFilters,
    user: User
  ): ValidationResult {
    // Requirement 2.5: Check if filters would result in empty recipient list
    if (!filters.provinces && !filters.cities && !filters.barangays && 
        (!filters.contactGroupIds || filters.contactGroupIds.length === 0)) {
      // No filters specified - this is valid for Superadmin (all users)
      if (user.role !== 'super_admin') {
        return {
          isValid: false,
          error: 'At least one location filter or contact group must be specified'
        };
      }
    }

    // Superadmin has unrestricted access (Requirement 9.3)
    if (user.role === 'super_admin') {
      return { isValid: true };
    }

    // Admin, MDRRMO, PNP, BFP, LGU Officer, and LGU users must have jurisdiction restrictions (Requirement 9.2)
    if (user.role === 'admin' || user.role === 'mdrrmo' || user.role === 'pnp' || user.role === 'bfp' || user.role === 'lgu_officer' || user.role === 'lgu') {
      if (!user.jurisdiction) {
        return {
          isValid: false,
          error: 'User has no jurisdiction assigned'
        };
      }

      // Parse jurisdiction
      const jurisdictionParts = user.jurisdiction.split(':');
      const userProvince = jurisdictionParts[0] || null;
      const userCity = jurisdictionParts[1] || null;
      const userBarangay = jurisdictionParts[2] || null;

      // Validate province filters
      if (filters.provinces && filters.provinces.length > 0) {
        const hasAccess = filters.provinces.every(province => 
          userProvince === province
        );
        if (!hasAccess) {
          return {
            isValid: false,
            error: 'Access denied - province outside your jurisdiction'
          };
        }
      }

      // Validate city filters
      if (filters.cities && filters.cities.length > 0) {
        if (!userCity) {
          // User has province-level jurisdiction, can access any city in their province
          return { isValid: true };
        }
        const hasAccess = filters.cities.every(city => 
          userCity === city
        );
        if (!hasAccess) {
          return {
            isValid: false,
            error: 'Access denied - city outside your jurisdiction'
          };
        }
      }

      // Validate barangay filters
      if (filters.barangays && filters.barangays.length > 0) {
        if (!userBarangay) {
          // User has city or province-level jurisdiction, can access any barangay
          return { isValid: true };
        }
        const hasAccess = filters.barangays.every(barangay => 
          userBarangay === barangay
        );
        if (!hasAccess) {
          return {
            isValid: false,
            error: 'Access denied - barangay outside your jurisdiction'
          };
        }
      }

      return { isValid: true };
    }

    // Citizens don't have SMS blast access
    return {
      isValid: false,
      error: 'Insufficient permissions - SMS blast access restricted to government agencies only'
    };
  }

  /**
   * Format database row to Recipient object
   */
  private formatRecipient(row: any): Recipient {
    return {
      userId: row.id,
      phoneNumber: row.phone || '',
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      location: {
        province: row.province || '',
        city: row.city || '',
        barangay: row.barangay || ''
      }
    };
  }
}

// Export singleton instance
export const recipientFilter = new RecipientFilter();
