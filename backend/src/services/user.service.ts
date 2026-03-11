import db from '../config/database';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { permissionService } from './permission.service';
import { dataFilterService } from './dataFilter.service';

interface UserFilters {
  role?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  actorRole?: string;
  actorId?: number;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}

export class UserService {
  /**
   * Create new user
   * Validates role hierarchy and uniqueness
   * Requirements: 2.2, 3.3, 11.4
   */
  async createUser(userData: any, actorRole?: string) {
    const { email, phone, password, first_name, last_name, role, jurisdiction, city, province, barangay } = userData;

    // Validate role hierarchy - can't create user with equal or higher privilege
    if (actorRole && actorRole !== 'super_admin') {
      const hierarchy = permissionService.getRoleHierarchy();
      const actorLevel = hierarchy[actorRole as keyof typeof hierarchy];
      const targetLevel = hierarchy[role as keyof typeof hierarchy];

      if (targetLevel >= actorLevel) {
        throw new AppError('Cannot create user with equal or higher privilege level', 403);
      }
    }

    // Validate role is valid
    const validRoles = ['super_admin', 'admin', 'pnp', 'bfp', 'mdrrmo', 'lgu_officer', 'citizen'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    try {
      // Check if email already exists
      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if ((existingEmail as any[]).length > 0) {
        throw new AppError('Email already exists', 400);
      }

      // Check if phone already exists
      const [existingPhone] = await db.query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );
      if ((existingPhone as any[]).length > 0) {
        throw new AppError('Phone number already exists', 400);
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await db.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, jurisdiction, is_verified, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())`,
        [email, phone, password_hash, first_name, last_name, role, jurisdiction || null]
      );

      const userId = (result as any).insertId;

      // Create user profile if location data provided
      if (city || province || barangay) {
        await db.query(
          `INSERT INTO user_profiles (user_id, city, province, barangay)
           VALUES (?, ?, ?, ?)`,
          [userId, city || null, province || null, barangay || null]
        );
      }

      // Fetch and return created user
      return await this.getUserById(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new AppError('Failed to create user', 500);
    }
  }

  /**
   * Get all users with filtering and pagination
   * Apply role hierarchy filtering to prevent viewing higher privilege accounts
   * Requirements: 2.2, 3.3, 11.4
   */
  async getUsers(filters: UserFilters) {
    const {
      role,
      is_active,
      search,
      page = 1,
      limit = 20,
      actorRole,
      actorId
    } = filters;

    let query = `
      SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.role,
             u.is_verified, u.is_active, u.created_at, u.updated_at, u.last_login,
             p.city, p.province
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Apply role hierarchy filtering
    // Requirements: 2.2, 3.3, 11.4
    if (actorRole && actorRole !== 'super_admin') {
      const hierarchy = permissionService.getRoleHierarchy();
      const actorLevel = hierarchy[actorRole as keyof typeof hierarchy];
      
      // Filter out users with equal or higher privilege levels
      const allowedRoles = Object.entries(hierarchy)
        .filter(([_, level]) => level < actorLevel)
        .map(([role, _]) => role);
      
      if (allowedRoles.length > 0) {
        query += ` AND u.role IN (${allowedRoles.map(() => '?').join(',')})`;
        params.push(...allowedRoles);
      } else {
        // If no allowed roles, return empty result
        query += ` AND 1=0`;
      }
    }

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(is_active);
    }

    if (search) {
      query += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY u.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [users] = await db.query(query, params);
      
      // Get total count with same filters
      let countQuery = `SELECT COUNT(*) as total FROM users u WHERE 1=1`;
      const countParams: any[] = [];
      
      // Apply same role hierarchy filtering to count
      if (actorRole && actorRole !== 'super_admin') {
        const hierarchy = permissionService.getRoleHierarchy();
        const actorLevel = hierarchy[actorRole as keyof typeof hierarchy];
        
        const allowedRoles = Object.entries(hierarchy)
          .filter(([_, level]) => level < actorLevel)
          .map(([role, _]) => role);
        
        if (allowedRoles.length > 0) {
          countQuery += ` AND u.role IN (${allowedRoles.map(() => '?').join(',')})`;
          countParams.push(...allowedRoles);
        } else {
          countQuery += ` AND 1=0`;
        }
      }
      
      if (role) {
        countQuery += ` AND u.role = ?`;
        countParams.push(role);
      }
      if (is_active !== undefined) {
        countQuery += ` AND u.is_active = ?`;
        countParams.push(is_active);
      }
      if (search) {
        countQuery += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any)[0].total;

      return {
        users: this.formatUsers(users as any[]),
        total,
        page,
        limit
      };
    } catch (error) {
      throw new AppError('Failed to fetch users', 500);
    }
  }

  /**
   * Get single user by ID with full profile
   */
  async getUserById(id: number) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.role, u.jurisdiction,
                u.is_verified, u.is_active, u.created_at, u.updated_at, u.last_login,
                p.address, p.city, p.province, p.barangay, p.blood_type,
                p.medical_conditions, p.emergency_contact_name, p.emergency_contact_phone,
                p.latitude, p.longitude
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = ?`,
        [id]
      );

      if (!Array.isArray(users) || users.length === 0) {
        throw new AppError('User not found', 404);
      }

      return this.formatUser(users[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch user', 500);
    }
  }

  /**
   * Update user information
   * Validates role modification permissions based on role hierarchy
   * Requirements: 1.5, 12.4
   */
  async updateUser(id: number, data: any, actorRole?: string) {
    const targetUser = await this.getUserById(id);

    // If role is being modified, validate permissions
    // Requirements: 1.5, 12.4
    if (data.role && actorRole) {
      const targetRole = targetUser.role;
      
      // Check if actor can modify target user's role
      const canModify = permissionService.canModifyUser(
        actorRole as any,
        targetRole as any
      );

      if (!canModify) {
        throw new AppError(
          'Cannot modify user with equal or higher privilege level',
          403
        );
      }

      // Validate that the new role is also within actor's authority
      const canAssignNewRole = permissionService.canModifyUser(
        actorRole as any,
        data.role as any
      );

      if (!canAssignNewRole) {
        throw new AppError(
          'Cannot assign a role with equal or higher privilege level',
          403
        );
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    // Handle both camelCase and snake_case field names
    if (data.first_name || data.firstName) {
      updates.push('first_name = ?');
      params.push(data.first_name || data.firstName);
    }

    if (data.last_name || data.lastName) {
      updates.push('last_name = ?');
      params.push(data.last_name || data.lastName);
    }

    if (data.phone) {
      updates.push('phone = ?');
      params.push(data.phone);
    }

    if (data.role) {
      updates.push('role = ?');
      params.push(data.role);
    }

    if (data.jurisdiction !== undefined) {
      updates.push('jurisdiction = ?');
      params.push(data.jurisdiction || null);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    // Update profile fields if provided
    const profileUpdates: string[] = [];
    const profileParams: any[] = [];

    if (data.city !== undefined) {
      profileUpdates.push('city = ?');
      profileParams.push(data.city || null);
    }

    if (data.province !== undefined) {
      profileUpdates.push('province = ?');
      profileParams.push(data.province || null);
    }

    if (data.barangay !== undefined) {
      profileUpdates.push('barangay = ?');
      profileParams.push(data.barangay || null);
    }

    if (updates.length === 0 && profileUpdates.length === 0) {
      return this.getUserById(id);
    }

    try {
      // Update user table
      if (updates.length > 0) {
        updates.push('updated_at = NOW()');
        params.push(id);
        await db.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      // Update profile table
      if (profileUpdates.length > 0) {
        // Check if profile exists
        const [existingProfile] = await db.query(
          'SELECT user_id FROM user_profiles WHERE user_id = ?',
          [id]
        );

        if ((existingProfile as any[]).length > 0) {
          // Update existing profile
          profileParams.push(id);
          await db.query(
            `UPDATE user_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?`,
            profileParams
          );
        } else {
          // Create new profile
          await db.query(
            `INSERT INTO user_profiles (user_id, city, province, barangay) VALUES (?, ?, ?, ?)`,
            [id, data.city || null, data.province || null, data.barangay || null]
          );
        }
      }

      return this.getUserById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete user (soft delete or hard delete)
   * Validates role hierarchy permissions
   * Requirements: 2.2, 3.3, 11.4
   */
  async deleteUser(id: number, actorRole?: string, hardDelete: boolean = false) {
    const targetUser = await this.getUserById(id);

    // If actor role is provided, validate permissions
    if (actorRole) {
      const canModify = permissionService.canModifyUser(
        actorRole as any,
        targetUser.role as any
      );

      if (!canModify) {
        throw new AppError(
          'Cannot delete user with equal or higher privilege level',
          403
        );
      }
    }

    const connection = await db.getConnection();
    
    try {
      if (hardDelete) {
        // Start transaction for hard delete
        await connection.beginTransaction();
        
        console.log(`Starting hard delete for user ${id}`);
        
        // First, let's check if there are any groups created by this user
        const [groupCheck] = await connection.query('SELECT COUNT(*) as count FROM `groups` WHERE created_by = ?', [id]);
        const groupCount = (groupCheck as any)[0].count;
        console.log(`User ${id} has created ${groupCount} groups`);
        
        // Helper function to safely delete from table
        const safeDelete = async (table: string, column: string = 'user_id') => {
          try {
            const [result] = await connection.query(`DELETE FROM \`${table}\` WHERE ${column} = ?`, [id]);
            const affectedRows = (result as any).affectedRows;
            console.log(`✓ Deleted from ${table}:`, affectedRows, 'rows');
            return affectedRows;
          } catch (err: any) {
            // Log the actual error for debugging
            console.error(`✗ Error deleting from ${table}:`, err.code, err.message);
            // Don't throw - continue with other deletions
            return 0;
          }
        };

        // Helper function to safely update table
        const safeUpdate = async (table: string, column: string) => {
          try {
            const [result] = await connection.query(`UPDATE ${table} SET ${column} = NULL WHERE ${column} = ?`, [id]);
            console.log(`Updated ${table}:`, (result as any).affectedRows, 'rows');
          } catch (err: any) {
            console.log(`Skip update ${table}:`, err.code);
          }
        };
        
        // Delete related records (order matters for foreign keys)
        // Delete group-related tables first (in correct order)
        await safeDelete('group_alerts'); // Delete alerts that reference user_id
        await safeDelete('location_shares'); // Delete location shares
        await safeDelete('group_members'); // Then delete group members
        await safeDelete('groups', 'created_by'); // Finally delete groups created by user
        
        await safeDelete('user_profiles');
        await safeDelete('user_permissions');
        await safeDelete('token_blacklist');
        await safeDelete('audit_logs');
        await safeDelete('shared_locations');
        await safeDelete('location_history');
        await safeDelete('password_reset_tokens');
        await safeDelete('offline_queue');
        await safeDelete('sms_blast_analytics');
        
        // Update tables with SET NULL constraints
        await safeUpdate('notifications', 'user_id');
        await safeUpdate('sms_queue', 'user_id');
        await safeUpdate('sos_alerts', 'responder_id');
        
        // Delete user-created content
        await safeDelete('sos_alerts');
        await safeDelete('incident_reports'); // Correct table name
        await safeDelete('sms_blasts');
        await safeDelete('sms_templates', 'created_by');
        await safeDelete('contact_groups', 'created_by');
        await safeDelete('disaster_alerts', 'created_by');
        
        // Finally, delete the user
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        console.log(`Deleted user ${id} from users table`);
        
        // Commit transaction
        await connection.commit();
        console.log(`Hard delete completed for user ${id}`);
      } else {
        // Soft delete - just deactivate
        await connection.query(
          'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
          [id]
        );
        console.log(`Soft deleted user ${id}`);
      }
    } catch (error) {
      // Rollback transaction on error
      if (hardDelete) {
        await connection.rollback();
      }
      console.error('Error deleting user:', error);
      throw new AppError('Failed to delete user', 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Get user statistics
   */
  async getStatistics() {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
          SUM(CASE WHEN role = 'lgu_officer' THEN 1 ELSE 0 END) as lgu_users,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
        FROM users
      `);

      return (stats as any)[0];
    } catch (error) {
      throw new AppError('Failed to get statistics', 500);
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(id: number, newPassword: string) {
    await this.getUserById(id);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    try {
      await db.query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [passwordHash, id]
      );
    } catch (error) {
      throw new AppError('Failed to reset password', 500);
    }
  }

  /**
   * Get citizen location data
   * Used by PNP during active emergencies
   * Requirements: 4.4
   */
  async getCitizenLocations(filters: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      latitude,
      longitude,
      radius = 10, // Default 10km radius
      page = 1,
      limit = 50
    } = filters;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.phone,
             p.latitude, p.longitude, p.city, p.province, p.barangay,
             p.emergency_contact_name, p.emergency_contact_phone
      FROM users u
      INNER JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role = 'citizen' 
      AND u.is_active = TRUE
      AND p.latitude IS NOT NULL 
      AND p.longitude IS NOT NULL
    `;
    const params: any[] = [];

    // If coordinates provided, filter by distance
    if (latitude && longitude) {
      query += ` AND (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * 
                 cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * 
                 sin(radians(p.latitude)))) <= ?`;
      params.push(latitude, longitude, latitude, radius);
    }

    query += ` ORDER BY u.last_login DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [users] = await db.query(query, params);
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM users u
        INNER JOIN user_profiles p ON u.id = p.user_id
        WHERE u.role = 'citizen' 
        AND u.is_active = TRUE
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
      `;
      const countParams: any[] = [];
      
      if (latitude && longitude) {
        countQuery += ` AND (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * 
                       cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * 
                       sin(radians(p.latitude)))) <= ?`;
        countParams.push(latitude, longitude, latitude, radius);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any)[0].total;

      return {
        locations: users,
        total,
        page,
        limit
      };
    } catch (error) {
      throw new AppError('Failed to fetch citizen locations', 500);
    }
  }

  /**
   * Format user data
   */
  private formatUser(row: any) {
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
      jurisdiction: row.jurisdiction,
      is_verified: Boolean(row.is_verified),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_login: row.last_login,
      city: row.city,
      province: row.province,
      barangay: row.barangay,
      profile: {
        address: row.address,
        city: row.city,
        province: row.province,
        barangay: row.barangay,
        blood_type: row.blood_type,
        medical_conditions: row.medical_conditions,
        emergency_contact_name: row.emergency_contact_name,
        emergency_contact_phone: row.emergency_contact_phone,
        latitude: row.latitude,
        longitude: row.longitude
      }
    };
  }

  private formatUsers(rows: any[]) {
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
      is_verified: Boolean(row.is_verified),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_login: row.last_login,
      city: row.city,
      province: row.province
    }));
  }
}
