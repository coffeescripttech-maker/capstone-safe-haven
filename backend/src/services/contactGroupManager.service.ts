/**
 * ContactGroupManager Service
 * 
 * Manages contact groups for SMS blast campaigns.
 * Handles group creation, retrieval, updates, and deletion with jurisdiction restrictions.
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { RecipientFilter, RecipientFilters, User, Recipient } from './recipientFilter.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Contact group input for creation
 */
export interface ContactGroupInput {
  name: string;
  recipientFilters: RecipientFilters;
}

/**
 * Contact group data
 */
export interface ContactGroup {
  id: string;
  name: string;
  createdBy: number;
  recipientFilters: RecipientFilters;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ContactGroupManager {
  private recipientFilter: RecipientFilter;

  constructor() {
    this.recipientFilter = new RecipientFilter();
  }

  /**
   * Create a new contact group
   * Requirements: 17.1, 17.2, 17.3
   * 
   * @param input - Group name and recipient filters
   * @param requestingUser - User creating the group
   * @returns Created group ID and member count
   */
  async createGroup(
    input: ContactGroupInput,
    requestingUser: User
  ): Promise<{ groupId: string; memberCount: number }> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new AppError('Group name is required', 400);
    }

    if (!input.recipientFilters) {
      throw new AppError('Recipient filters are required', 400);
    }

    // Requirement 17.2: Apply jurisdiction restrictions for Admin users
    const validation = this.recipientFilter.validateFilters(
      input.recipientFilters,
      requestingUser
    );

    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid recipient filters', 403);
    }

    try {
      // Requirement 17.3: Calculate member count (active users with valid phone numbers)
      const memberCount = await this.recipientFilter.countRecipients(
        input.recipientFilters,
        requestingUser
      );

      // Create group record
      const groupId = uuidv4();
      const query = `
        INSERT INTO contact_groups (id, name, created_by, recipient_filters, member_count)
        VALUES (?, ?, ?, ?, ?)
      `;

      await db.query(query, [
        groupId,
        input.name.trim(),
        requestingUser.id,
        JSON.stringify(input.recipientFilters),
        memberCount
      ]);

      return { groupId, memberCount };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('A contact group with this name already exists', 409);
      }
      throw new AppError('Failed to create contact group', 500);
    }
  }

  /**
   * Get a contact group by ID
   * Requirements: 17.1
   * 
   * @param groupId - Group ID
   * @param requestingUser - User requesting the group
   * @returns Contact group data
   */
  async getGroup(groupId: string, requestingUser: User): Promise<ContactGroup> {
    try {
      const query = `
        SELECT id, name, created_by, recipient_filters, member_count, created_at, updated_at
        FROM contact_groups
        WHERE id = ?
      `;

      const [rows] = await db.query(query, [groupId]);
      const groups = rows as any[];

      if (groups.length === 0) {
        throw new AppError('Contact group not found', 404);
      }

      const group = groups[0];

      // Check if user has access to this group
      // Superadmin can access all groups
      // Admin can only access groups they created or groups within their jurisdiction
      if (requestingUser.role !== 'super_admin') {
        if (group.created_by !== requestingUser.id) {
          // Check if group filters are within user's jurisdiction
          const recipientFilters = JSON.parse(group.recipient_filters) as RecipientFilters;
          const validation = this.recipientFilter.validateFilters(
            recipientFilters,
            requestingUser
          );

          if (!validation.isValid) {
            throw new AppError('Access denied - group outside your jurisdiction', 403);
          }
        }
      }

      return {
        id: group.id,
        name: group.name,
        createdBy: group.created_by,
        recipientFilters: JSON.parse(group.recipient_filters),
        memberCount: group.member_count,
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at)
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch contact group', 500);
    }
  }

  /**
   * List all contact groups accessible to the user
   * Requirements: 17.1, 17.2
   * 
   * @param requestingUser - User requesting the list
   * @returns Array of contact groups
   */
  async listGroups(requestingUser: User): Promise<ContactGroup[]> {
    try {
      let query = `
        SELECT id, name, created_by, recipient_filters, member_count, created_at, updated_at
        FROM contact_groups
      `;
      const params: any[] = [];

      // Requirement 17.2: Admin and MDRRMO users can only see groups they created or within their jurisdiction
      if (requestingUser.role === 'admin' || requestingUser.role === 'mdrrmo') {
        query += ` WHERE created_by = ?`;
        params.push(requestingUser.id);
      }
      // Superadmin can see all groups

      query += ` ORDER BY created_at DESC`;

      const [rows] = await db.query(query, params);
      const groups = rows as any[];

      return groups.map(group => ({
        id: group.id,
        name: group.name,
        createdBy: group.created_by,
        recipientFilters: JSON.parse(group.recipient_filters),
        memberCount: group.member_count,
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at)
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to list contact groups', 500);
    }
  }

  /**
   * Update a contact group
   * Requirements: 17.2, 17.3, 17.5
   * 
   * @param groupId - Group ID to update
   * @param updates - Updated name and/or filters
   * @param requestingUser - User updating the group
   */
  async updateGroup(
    groupId: string,
    updates: Partial<ContactGroupInput>,
    requestingUser: User
  ): Promise<void> {
    // Fetch existing group to verify ownership/access
    const existingGroup = await this.getGroup(groupId, requestingUser);

    // Only the creator or Superadmin can update a group
    if (requestingUser.role !== 'super_admin' && existingGroup.createdBy !== requestingUser.id) {
      throw new AppError('Access denied - you can only update groups you created', 403);
    }

    // Validate updates
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new AppError('Group name cannot be empty', 400);
    }

    // If filters are being updated, validate them
    let newMemberCount = existingGroup.memberCount;
    if (updates.recipientFilters) {
      // Requirement 17.2: Apply jurisdiction restrictions
      const validation = this.recipientFilter.validateFilters(
        updates.recipientFilters,
        requestingUser
      );

      if (!validation.isValid) {
        throw new AppError(validation.error || 'Invalid recipient filters', 403);
      }

      // Requirement 17.3: Recalculate member count
      newMemberCount = await this.recipientFilter.countRecipients(
        updates.recipientFilters,
        requestingUser
      );
    }

    try {
      // Build update query
      const updateFields: string[] = [];
      const params: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        params.push(updates.name.trim());
      }

      if (updates.recipientFilters !== undefined) {
        updateFields.push('recipient_filters = ?');
        params.push(JSON.stringify(updates.recipientFilters));
        updateFields.push('member_count = ?');
        params.push(newMemberCount);
      }

      if (updateFields.length === 0) {
        return; // Nothing to update
      }

      params.push(groupId);

      const query = `
        UPDATE contact_groups
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await db.query(query, params);

      // Requirement 17.5: Log the modification (handled by audit logger in controller)
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update contact group', 500);
    }
  }

  /**
   * Delete a contact group
   * Requirements: 17.1
   * 
   * @param groupId - Group ID to delete
   * @param requestingUser - User deleting the group
   */
  async deleteGroup(groupId: string, requestingUser: User): Promise<void> {
    // Fetch existing group to verify ownership/access
    const existingGroup = await this.getGroup(groupId, requestingUser);

    // Only the creator or Superadmin can delete a group
    if (requestingUser.role !== 'super_admin' && existingGroup.createdBy !== requestingUser.id) {
      throw new AppError('Access denied - you can only delete groups you created', 403);
    }

    try {
      const query = 'DELETE FROM contact_groups WHERE id = ?';
      await db.query(query, [groupId]);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete contact group', 500);
    }
  }

  /**
   * Resolve contact group to current list of recipients
   * Requirements: 17.4, 17.6
   * 
   * Automatically excludes deactivated users and users with invalid phone numbers
   * 
   * @param groupId - Group ID to resolve
   * @returns Array of current recipients in the group
   */
  async resolveGroup(groupId: string): Promise<Recipient[]> {
    try {
      // Fetch group
      const query = `
        SELECT recipient_filters
        FROM contact_groups
        WHERE id = ?
      `;

      const [rows] = await db.query(query, [groupId]);
      const groups = rows as any[];

      if (groups.length === 0) {
        throw new AppError('Contact group not found', 404);
      }

      const group = groups[0];
      const recipientFilters = JSON.parse(group.recipient_filters) as RecipientFilters;

      // Use RecipientFilter to get current active users with valid phone numbers
      // This automatically handles Requirements 17.4 and 17.6
      // We use a superadmin user context to bypass jurisdiction checks during resolution
      const superadminContext: User = {
        id: 0,
        email: 'system@safehaven.ph',
        role: 'super_admin',
        jurisdiction: null
      };

      return await this.recipientFilter.getRecipients(
        recipientFilters,
        superadminContext
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to resolve contact group', 500);
    }
  }
}

// Export singleton instance
export const contactGroupManager = new ContactGroupManager();
