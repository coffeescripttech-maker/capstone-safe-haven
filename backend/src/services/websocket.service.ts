// WebSocket Service for Real-Time Updates
// Provides instant notifications for alerts, incidents, and SOS updates

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { toPhilippineTime } from '../utils/timezone';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

interface WebSocketMessage {
  type: 'alert' | 'incident' | 'sos' | 'badge_update';
  data: any;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, Set<string>> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Configure based on your needs
        methods: ['GET', 'POST']
      },
      path: '/ws',
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', this.handleConnection.bind(this));
    logger.info('✅ WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    logger.info(`🔌 New WebSocket connection: ${socket.id}`);

    // Check for token in handshake auth (modern socket.io approach)
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      logger.error(`❌ No token provided in handshake for socket ${socket.id}`);
      socket.emit('auth_error', { message: 'Authentication token required' });
      socket.disconnect();
      return;
    }

    // Authenticate user immediately on connection
    try {
      logger.info(`🔐 Attempting to authenticate socket ${socket.id}`);
      logger.info(`   Token (first 50 chars): ${token.substring(0, 50)}...`);
      logger.info(`   JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      logger.info(`✅ Token verified successfully`);
      logger.info(`   Decoded payload:`, decoded);
      
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Track connected user
      if (!this.connectedUsers.has(decoded.id)) {
        this.connectedUsers.set(decoded.id, new Set());
      }
      this.connectedUsers.get(decoded.id)!.add(socket.id);

      socket.emit('authenticated', { userId: decoded.id, user: { id: decoded.id, email: decoded.email, role: decoded.role } });
      logger.info(`✅ User ${decoded.id} (${decoded.email}) authenticated on socket ${socket.id}`);
    } catch (error: any) {
      logger.error('❌ WebSocket authentication failed');
      logger.error(`   Error name: ${error.name}`);
      logger.error(`   Error message: ${error.message}`);
      logger.error(`   Full error:`, error);
      socket.emit('auth_error', { message: 'Authentication failed', error: error.message });
      socket.disconnect();
      return;
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        const userSockets = this.connectedUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(socket.userId);
          }
        }
      }
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  /**
   * Broadcast new alert to all connected users
   */
  async broadcastNewAlert(alert: any): Promise<void> {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new alert: ${alert.id}`);
    
    try {
      // Fetch full alert data with timezone conversion
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM disaster_alerts WHERE id = ?`,
        [alert.id]
      );

      if (rows.length === 0) {
        logger.warn(`Alert ${alert.id} not found for broadcast`);
        return;
      }

      const fullAlert = rows[0];

      // Apply timezone conversion
      const formattedAlert = {
        ...fullAlert,
        created_at: fullAlert.created_at ? toPhilippineTime(fullAlert.created_at) : null,
        updated_at: fullAlert.updated_at ? toPhilippineTime(fullAlert.updated_at) : null,
        effective_from: fullAlert.effective_from ? toPhilippineTime(fullAlert.effective_from) : null,
        effective_until: fullAlert.effective_until ? toPhilippineTime(fullAlert.effective_until) : null,
      };

      this.io.emit('new_alert', {
        type: 'alert',
        data: formattedAlert
      });

      logger.info(`📢 Broadcasted alert ${alert.id} with PH timezone`);
    } catch (error) {
      logger.error('Error broadcasting alert with full data:', error);
      
      // Fallback to basic broadcast
      this.io.emit('new_alert', {
        type: 'alert',
        data: alert
      });
    }
  }

  /**
   * Broadcast alert update to all connected users
   */
  async broadcastAlertUpdate(alert: any): Promise<void> {
    if (!this.io) return;

    logger.info(`📢 Broadcasting alert update: ${alert.id}`);
    
    try {
      // Fetch full alert data with timezone conversion
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM disaster_alerts WHERE id = ?`,
        [alert.id]
      );

      if (rows.length > 0) {
        const fullAlert = rows[0];
        const formattedAlert = {
          ...fullAlert,
          created_at: fullAlert.created_at ? toPhilippineTime(fullAlert.created_at) : null,
          updated_at: fullAlert.updated_at ? toPhilippineTime(fullAlert.updated_at) : null,
          effective_from: fullAlert.effective_from ? toPhilippineTime(fullAlert.effective_from) : null,
          effective_until: fullAlert.effective_until ? toPhilippineTime(fullAlert.effective_until) : null,
        };

        this.io.emit('alert_updated', {
          type: 'alert',
          data: formattedAlert
        });
      } else {
        // Fallback
        this.io.emit('alert_updated', {
          type: 'alert',
          data: alert
        });
      }
    } catch (error) {
      logger.error('Error broadcasting alert update:', error);
      this.io.emit('alert_updated', {
        type: 'alert',
        data: alert
      });
    }
  }

  /**
   * Broadcast new incident to relevant users
   */
  async broadcastNewIncident(incident: any): Promise<void> {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new incident: ${incident.id}`);
    
    try {
      // Fetch full incident data with user info and timezone conversion
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT i.*, 
         u.first_name, u.last_name, u.email, u.phone
         FROM incidents i
         LEFT JOIN users u ON i.user_id = u.id
         WHERE i.id = ?`,
        [incident.id]
      );

      if (rows.length === 0) {
        logger.warn(`Incident ${incident.id} not found for broadcast`);
        return;
      }

      const fullIncident = rows[0];

      // Apply timezone conversion
      const formattedIncident = {
        ...fullIncident,
        created_at: fullIncident.created_at ? toPhilippineTime(fullIncident.created_at) : null,
        updated_at: fullIncident.updated_at ? toPhilippineTime(fullIncident.updated_at) : null,
        incident_date: fullIncident.incident_date ? toPhilippineTime(fullIncident.incident_date) : null,
      };

      // Broadcast to all responders and admins
      this.io.emit('new_incident', {
        type: 'incident',
        data: formattedIncident
      });

      logger.info(`📢 Broadcasted incident ${incident.id} with user data and PH timezone`);
    } catch (error) {
      logger.error('Error broadcasting incident with full data:', error);
      
      // Fallback to basic broadcast
      this.io.emit('new_incident', {
        type: 'incident',
        data: incident
      });
    }
  }

  /**
   * Broadcast new SOS alert to relevant agencies
   */
  async broadcastNewSOS(sos: any): Promise<void> {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new SOS: ${sos.id}`);
    
    try {
      // Fetch full SOS data with user info and timezone conversion
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT sa.*, 
         u.first_name, u.last_name, u.email, u.phone,
         r.first_name as responder_first_name, r.last_name as responder_last_name
         FROM sos_alerts sa
         LEFT JOIN users u ON sa.user_id = u.id
         LEFT JOIN users r ON sa.responder_id = r.id
         WHERE sa.id = ?`,
        [sos.id]
      );

      if (rows.length === 0) {
        logger.warn(`SOS alert ${sos.id} not found for broadcast`);
        return;
      }

      const fullSOS = rows[0];

      // Apply timezone conversion
      const formattedSOS = {
        ...fullSOS,
        created_at: fullSOS.created_at ? toPhilippineTime(fullSOS.created_at) : null,
        updated_at: fullSOS.updated_at ? toPhilippineTime(fullSOS.updated_at) : null,
        response_time: fullSOS.response_time ? toPhilippineTime(fullSOS.response_time) : null,
      };

      // Broadcast to all responders
      this.io.emit('new_sos', {
        type: 'sos',
        data: formattedSOS
      });

      logger.info(`📢 Broadcasted SOS ${sos.id} with user data and PH timezone`);
    } catch (error) {
      logger.error('Error broadcasting SOS with full data:', error);
      
      // Fallback to basic broadcast
      this.io.emit('new_sos', {
        type: 'sos',
        data: sos
      });
    }
  }

  /**
   * Send badge update to specific user
   */
  sendBadgeUpdate(userId: number, badgeCounts: any): void {
    if (!this.io) return;

    const userSockets = this.connectedUsers.get(userId);
    if (!userSockets || userSockets.size === 0) return;

    userSockets.forEach(socketId => {
      this.io!.to(socketId).emit('badge_update', {
        type: 'badge_update',
        data: badgeCounts
      });
    });

    logger.info(`📢 Sent badge update to user ${userId}`);
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: number, notification: any): void {
    if (!this.io) return;

    const userSockets = this.connectedUsers.get(userId);
    if (!userSockets || userSockets.size === 0) return;

    userSockets.forEach(socketId => {
      this.io!.to(socketId).emit('notification', {
        type: 'notification',
        data: notification
      });
    });

    logger.info(`📢 Sent notification to user ${userId}`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
