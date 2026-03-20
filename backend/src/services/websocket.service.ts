// WebSocket Service for Real-Time Updates
// Provides instant notifications for alerts, incidents, and SOS updates

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

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
  broadcastNewAlert(alert: any): void {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new alert: ${alert.id}`);
    this.io.emit('new_alert', {
      type: 'alert',
      data: alert
    });
  }

  /**
   * Broadcast alert update to all connected users
   */
  broadcastAlertUpdate(alert: any): void {
    if (!this.io) return;

    logger.info(`📢 Broadcasting alert update: ${alert.id}`);
    this.io.emit('alert_updated', {
      type: 'alert',
      data: alert
    });
  }

  /**
   * Broadcast new incident to relevant users
   */
  broadcastNewIncident(incident: any): void {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new incident: ${incident.id}`);
    
    // Broadcast to all responders and admins
    this.io.emit('new_incident', {
      type: 'incident',
      data: incident
    });
  }

  /**
   * Broadcast new SOS alert to relevant agencies
   */
  broadcastNewSOS(sos: any): void {
    if (!this.io) return;

    logger.info(`📢 Broadcasting new SOS: ${sos.id}`);
    
    // Broadcast to all responders
    this.io.emit('new_sos', {
      type: 'sos',
      data: sos
    });
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
