import db from '../config/database';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

interface Permission {
  resource: string;
  action: Action;
}

interface RoleHierarchy {
  super_admin: number;
  admin: number;
  mdrrmo: number;
  pnp: number;
  bfp: number;
  lgu_officer: number;
  citizen: number;
}

interface PermissionRow extends RowDataPacket {
  id: number;
  role: Role;
  resource: string;
  action: Action;
  created_at: Date;
}

export class PermissionService {
  private permissionCache: Map<string, boolean> = new Map();
  private rolePermissionsCache: Map<Role, Permission[]> = new Map();
  private cacheTimestamp: number = Date.now();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a role has permission for a specific resource and action
   */
  async hasPermission(role: Role, resource: string, action: Action): Promise<boolean> {
    const cacheKey = `${role}:${resource}:${action}`;
    
    // Check cache
    if (this.isCacheValid() && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    try {
      const [rows] = await db.query<PermissionRow[]>(
        `SELECT id FROM role_permissions 
         WHERE role = ? AND resource = ? AND action = ?`,
        [role, resource, action]
      );

      const hasPermission = rows.length > 0;
      
      // Update cache
      this.permissionCache.set(cacheKey, hasPermission);
      
      return hasPermission;
    } catch (error) {
      logger.error('Error checking permission:', error);
      // Fail closed - deny permission on error
      return false;
    }
  }

  /**
   * Get all permissions for a specific role
   */
  async getPermissions(role: Role): Promise<Permission[]> {
    // Check cache
    if (this.isCacheValid() && this.rolePermissionsCache.has(role)) {
      return this.rolePermissionsCache.get(role)!;
    }

    try {
      const [rows] = await db.query<PermissionRow[]>(
        `SELECT resource, action FROM role_permissions WHERE role = ?`,
        [role]
      );

      const permissions: Permission[] = rows.map(row => ({
        resource: row.resource,
        action: row.action
      }));

      // Update cache
      this.rolePermissionsCache.set(role, permissions);
      
      return permissions;
    } catch (error) {
      logger.error('Error getting permissions:', error);
      return [];
    }
  }

  /**
   * Add a new permission for a role (super_admin only)
   */
  async addPermission(role: Role, resource: string, action: Action): Promise<void> {
    try {
      await db.query(
        `INSERT INTO role_permissions (role, resource, action) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE role = role`,
        [role, resource, action]
      );

      // Invalidate cache
      this.invalidateCache();
      
      logger.info(`Permission added: ${role} can ${action} ${resource}`);
    } catch (error) {
      logger.error('Error adding permission:', error);
      throw error;
    }
  }

  /**
   * Remove a permission from a role (super_admin only)
   */
  async removePermission(role: Role, resource: string, action: Action): Promise<void> {
    try {
      await db.query(
        `DELETE FROM role_permissions 
         WHERE role = ? AND resource = ? AND action = ?`,
        [role, resource, action]
      );

      // Invalidate cache
      this.invalidateCache();
      
      logger.info(`Permission removed: ${role} can no longer ${action} ${resource}`);
    } catch (error) {
      logger.error('Error removing permission:', error);
      throw error;
    }
  }

  /**
   * Get role hierarchy with privilege levels
   */
  getRoleHierarchy(): RoleHierarchy {
    return {
      super_admin: 7,  // Highest privilege
      admin: 6,
      mdrrmo: 5,
      pnp: 4,
      bfp: 4,
      lgu_officer: 3,
      citizen: 1       // Lowest privilege
    };
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  /**
   * Invalidate all caches
   */
  private invalidateCache(): void {
    this.permissionCache.clear();
    this.rolePermissionsCache.clear();
    this.cacheTimestamp = Date.now();
    logger.debug('Permission cache invalidated');
  }

  /**
   * Manually invalidate cache (for external use)
   */
  public clearCache(): void {
    this.invalidateCache();
  }

  /**
   * Check if an actor role can modify a target user's role
   * Based on role hierarchy: super_admin > admin > mdrrmo > pnp = bfp > lgu_officer > citizen
   * Requirements: 2.2, 3.3, 3.6, 11.4
   */
  canModifyUser(actorRole: Role, targetRole: Role): boolean {
    const hierarchy = this.getRoleHierarchy();
    const actorLevel = hierarchy[actorRole];
    const targetLevel = hierarchy[targetRole];

    // Super admin can modify anyone
    if (actorRole === 'super_admin') {
      return true;
    }

    // Admin can modify anyone except super_admin
    if (actorRole === 'admin' && targetRole !== 'super_admin') {
      return true;
    }

    // Other roles can only modify users with lower privilege levels
    return actorLevel > targetLevel;
  }

  /**
   * Check if a role can access a specific resource
   * This is a simplified check - for detailed permission checking, use hasPermission()
   * Requirements: 2.2, 3.3, 3.6, 11.4
   */
  canAccessResource(role: Role, resource: string): boolean {
    // Super admin has universal access
    if (role === 'super_admin') {
      return true;
    }

    // Admin has access to most resources except super_admin management
    if (role === 'admin') {
      return resource !== 'super_admin_config';
    }

    // For other roles, this is a basic check
    // Detailed permission checking should use hasPermission()
    return true; // Delegate to hasPermission for specific action checks
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
