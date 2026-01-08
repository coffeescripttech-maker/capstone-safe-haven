import db from '../config/database';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

interface UserFilters {
  role?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
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
   * Get all users with filtering and pagination
   */
  async getUsers(filters: UserFilters) {
    const {
      role,
      is_active,
      search,
      page = 1,
      limit = 20
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
      
      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM users u WHERE 1=1`;
      const countParams: any[] = [];
      
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
        `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.role,
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
   */
  async updateUser(id: number, data: UpdateUserData) {
    await this.getUserById(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.firstName) {
      updates.push('first_name = ?');
      params.push(data.firstName);
    }

    if (data.lastName) {
      updates.push('last_name = ?');
      params.push(data.lastName);
    }

    if (data.phone) {
      updates.push('phone = ?');
      params.push(data.phone);
    }

    if (data.role) {
      updates.push('role = ?');
      params.push(data.role);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    try {
      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return this.getUserById(id);
    } catch (error) {
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(id: number) {
    await this.getUserById(id);

    try {
      await db.query(
        'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new AppError('Failed to delete user', 500);
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
      is_verified: Boolean(row.is_verified),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_login: row.last_login,
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
