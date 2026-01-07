import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

// Generate random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface Group extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupMember extends RowDataPacket {
  id: number;
  group_id: number;
  user_id: number;
  role: string;
  status: string;
  location_sharing_enabled: boolean;
  joined_at: string;
  last_seen?: string;
}

class GroupService {
  async createGroup(userId: number, name: string, description?: string): Promise<any> {
    const inviteCode = generateInviteCode();
    
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO \`groups\` (name, description, created_by, invite_code)
       VALUES (?, ?, ?, ?)`,
      [name, description, userId, inviteCode]
    );

    const groupId = result.insertId;

    // Add creator as admin
    await pool.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [groupId, userId]
    );

    return this.getGroupById(groupId, userId);
  }

  async joinGroup(userId: number, inviteCode: string): Promise<any> {
    // Find group by invite code
    const [groups] = await pool.query<Group[]>(
      'SELECT * FROM `groups` WHERE invite_code = ? AND is_active = TRUE',
      [inviteCode]
    );

    if (groups.length === 0) {
      throw new Error('Invalid invite code');
    }

    const group = groups[0];

    // Check if already a member
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group.id, userId]
    );

    if (existing.length > 0) {
      throw new Error('Already a member of this group');
    }

    // Add as member
    await pool.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [group.id, userId]
    );

    return this.getGroupById(group.id, userId);
  }


  async getUserGroups(userId: number): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        g.*,
        COUNT(gm.id) as member_count,
        (SELECT role FROM group_members WHERE group_id = g.id AND user_id = ?) as user_role
       FROM \`groups\` g
       LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
       WHERE g.id IN (
         SELECT group_id FROM group_members WHERE user_id = ? AND status = 'active'
       ) AND g.is_active = TRUE
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [userId, userId]
    );

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdBy: row.created_by,
      inviteCode: row.invite_code,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      memberCount: row.member_count,
      isAdmin: row.user_role === 'admin',
    }));
  }

  async getGroupById(groupId: number, userId: number): Promise<any> {
    const [groups] = await pool.query<Group[]>(
      'SELECT * FROM `groups` WHERE id = ? AND is_active = TRUE',
      [groupId]
    );

    if (groups.length === 0) {
      throw new Error('Group not found');
    }

    const [members] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND status = \'active\'',
      [groupId, userId]
    );

    if (members.length === 0) {
      throw new Error('Not a member of this group');
    }

    const [memberCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND status = \'active\'',
      [groupId]
    );

    const group = groups[0];
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      inviteCode: group.invite_code,
      isActive: group.is_active,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
      memberCount: memberCount[0].count,
      isAdmin: members[0].role === 'admin',
    };
  }

  async getGroupMembers(groupId: number, userId: number): Promise<any[]> {
    // Verify user is member
    const [membership] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = \'active\'',
      [groupId, userId]
    );

    if (membership.length === 0) {
      throw new Error('Not a member of this group');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        gm.*,
        u.first_name, u.last_name, u.email, u.phone,
        ls.latitude, ls.longitude, ls.accuracy, ls.battery_level, 
        ls.is_moving, ls.shared_at as location_updated_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       LEFT JOIN (
         SELECT user_id, group_id, latitude, longitude, accuracy, 
                battery_level, is_moving, shared_at,
                ROW_NUMBER() OVER (PARTITION BY user_id, group_id ORDER BY shared_at DESC) as rn
         FROM location_shares
         WHERE group_id = ? AND shared_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ) ls ON gm.user_id = ls.user_id AND gm.group_id = ls.group_id AND ls.rn = 1
       WHERE gm.group_id = ? AND gm.status = 'active'
       ORDER BY gm.role DESC, u.first_name`,
      [groupId, groupId]
    );

    return rows.map(row => ({
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      role: row.role,
      status: row.status,
      locationSharingEnabled: row.location_sharing_enabled,
      joinedAt: row.joined_at,
      lastSeen: row.last_seen,
      userName: `${row.first_name} ${row.last_name}`,
      userEmail: row.email,
      userPhone: row.phone,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      accuracy: row.accuracy,
      batteryLevel: row.battery_level,
      isMoving: row.is_moving,
      locationUpdatedAt: row.location_updated_at,
    }));
  }

  async shareLocation(userId: number, groupId: number, data: any): Promise<void> {
    // Verify user is member with sharing enabled
    const [members] = await pool.query<RowDataPacket[]>(
      `SELECT location_sharing_enabled FROM group_members 
       WHERE group_id = ? AND user_id = ? AND status = 'active'`,
      [groupId, userId]
    );

    if (members.length === 0) {
      throw new Error('Not a member of this group');
    }

    if (!members[0].location_sharing_enabled) {
      throw new Error('Location sharing is disabled');
    }

    await pool.query(
      `INSERT INTO location_shares 
       (user_id, group_id, latitude, longitude, accuracy, battery_level, is_moving)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, groupId, data.latitude, data.longitude, data.accuracy, data.batteryLevel, data.isMoving || false]
    );

    // Update last_seen
    await pool.query(
      'UPDATE group_members SET last_seen = NOW() WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
  }

  async sendGroupAlert(userId: number, groupId: number, data: any): Promise<any> {
    // Verify user is member
    const [members] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = \'active\'',
      [groupId, userId]
    );

    if (members.length === 0) {
      throw new Error('Not a member of this group');
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO group_alerts 
       (group_id, user_id, alert_type, message, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [groupId, userId, data.alertType, data.message, data.latitude, data.longitude]
    );

    const [alerts] = await pool.query<RowDataPacket[]>(
      `SELECT ga.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM group_alerts ga
       JOIN users u ON ga.user_id = u.id
       WHERE ga.id = ?`,
      [result.insertId]
    );

    const alert = alerts[0];
    return {
      id: alert.id,
      groupId: alert.group_id,
      userId: alert.user_id,
      alertType: alert.alert_type,
      message: alert.message,
      latitude: alert.latitude,
      longitude: alert.longitude,
      createdAt: alert.created_at,
      userName: alert.user_name,
    };
  }

  async getGroupAlerts(groupId: number, userId: number): Promise<any[]> {
    // Verify user is member
    const [members] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = \'active\'',
      [groupId, userId]
    );

    if (members.length === 0) {
      throw new Error('Not a member of this group');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ga.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM group_alerts ga
       JOIN users u ON ga.user_id = u.id
       WHERE ga.group_id = ? AND ga.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY ga.created_at DESC
       LIMIT 50`,
      [groupId]
    );

    return rows.map(row => ({
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      alertType: row.alert_type,
      message: row.message,
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.created_at,
      userName: row.user_name,
    }));
  }

  async updateMember(groupId: number, userId: number, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.locationSharingEnabled !== undefined) {
      updates.push('location_sharing_enabled = ?');
      values.push(data.locationSharingEnabled);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (updates.length === 0) {
      return;
    }

    values.push(groupId, userId);

    await pool.query(
      `UPDATE group_members SET ${updates.join(', ')} 
       WHERE group_id = ? AND user_id = ?`,
      values
    );
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    // Check if user is the only admin
    const [admins] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND role = \'admin\' AND status = \'active\'',
      [groupId]
    );

    const [userRole] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (userRole.length > 0 && userRole[0].role === 'admin' && admins[0].count === 1) {
      throw new Error('Cannot leave group as the only admin. Transfer admin role first or delete the group.');
    }

    await pool.query(
      'UPDATE group_members SET status = \'inactive\' WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
  }

  async removeMember(groupId: number, adminId: number, targetUserId: number): Promise<void> {
    // Verify admin
    const [admins] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND status = \'active\'',
      [groupId, adminId]
    );

    if (admins.length === 0 || admins[0].role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    if (adminId === targetUserId) {
      throw new Error('Cannot remove yourself');
    }

    await pool.query(
      'UPDATE group_members SET status = \'inactive\' WHERE group_id = ? AND user_id = ?',
      [groupId, targetUserId]
    );
  }
}

export default new GroupService();
