import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AppError } from '../middleware/errorHandler';
import websocketService from './websocket.service';

export interface Reservation {
  id: number;
  centerId: number;
  userId: number;
  groupSize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'arrived';
  estimatedArrival: Date;
  reservedAt: Date;
  expiresAt: Date;
  confirmedAt?: Date;
  confirmedBy?: number;
  cancelledAt?: Date;
  cancellationReason?: string;
  arrivedAt?: Date;
  notes?: string;
}

export interface ReservationWithDetails extends Reservation {
  centerName: string;
  centerAddress: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export class ReservationService {
  private readonly RESERVATION_TIMEOUT_MINUTES = 30;
  private readonly MAX_GROUP_SIZE = 50;

  constructor() {
    // WebSocket service is already initialized as singleton
  }

  /**
   * Create a new reservation
   */
  async createReservation(
    centerId: number,
    userId: number,
    groupSize: number,
    estimatedArrival: Date,
    notes?: string
  ): Promise<Reservation> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Validate group size
      if (groupSize <= 0 || groupSize > this.MAX_GROUP_SIZE) {
        throw new AppError(`Group size must be between 1 and ${this.MAX_GROUP_SIZE}`, 400);
      }

      // Check if user already has an active reservation for this center
      const [existing] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM center_reservations 
         WHERE user_id = ? AND center_id = ? AND status IN ('pending', 'confirmed')`,
        [userId, centerId]
      );

      if (existing.length > 0) {
        throw new AppError('You already have an active reservation for this center', 400);
      }

      // Check available slots
      const [centerData] = await connection.query<RowDataPacket[]>(
        `SELECT capacity, current_occupancy, reserved_slots, confirmed_slots 
         FROM evacuation_centers WHERE id = ?`,
        [centerId]
      );

      if (centerData.length === 0) {
        throw new AppError('Evacuation center not found', 404);
      }

      const center = centerData[0];
      const availableSlots = center.capacity - center.current_occupancy - center.reserved_slots - center.confirmed_slots;

      if (availableSlots < groupSize) {
        throw new AppError(`Not enough available slots. Only ${availableSlots} slots available`, 400);
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.RESERVATION_TIMEOUT_MINUTES);

      // Create reservation
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO center_reservations 
         (center_id, user_id, group_size, status, estimated_arrival, expires_at, notes)
         VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
        [centerId, userId, groupSize, estimatedArrival, expiresAt, notes || null]
      );

      // Update center reserved slots
      await connection.query(
        `UPDATE evacuation_centers 
         SET reserved_slots = reserved_slots + ? 
         WHERE id = ?`,
        [groupSize, centerId]
      );

      await connection.commit();

      // Broadcast capacity update
      await this.broadcastCapacityUpdate(centerId);

      // Get created reservation
      const reservation = await this.getReservationById(result.insertId);
      
      console.log(`✅ Reservation created: ID ${result.insertId}, Center ${centerId}, User ${userId}, Size ${groupSize}`);
      
      return reservation;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(
    reservationId: number,
    userId: number,
    reason?: string,
    isAdmin: boolean = false
  ): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get reservation
      const [reservations] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM center_reservations WHERE id = ?`,
        [reservationId]
      );

      if (reservations.length === 0) {
        throw new AppError('Reservation not found', 404);
      }

      const reservation = reservations[0];

      // Check authorization
      if (!isAdmin && reservation.user_id !== userId) {
        throw new AppError('Unauthorized to cancel this reservation', 403);
      }

      // Check if already cancelled or expired
      if (['cancelled', 'expired', 'arrived'].includes(reservation.status)) {
        throw new AppError(`Cannot cancel reservation with status: ${reservation.status}`, 400);
      }

      // Update reservation status
      await connection.query(
        `UPDATE center_reservations 
         SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ?
         WHERE id = ?`,
        [reason || null, reservationId]
      );

      // Return slots to available pool
      await connection.query(
        `UPDATE evacuation_centers 
         SET reserved_slots = GREATEST(0, reserved_slots - ?)
         WHERE id = ?`,
        [reservation.group_size, reservation.center_id]
      );

      await connection.commit();

      // Broadcast capacity update
      await this.broadcastCapacityUpdate(reservation.center_id);

      console.log(`✅ Reservation cancelled: ID ${reservationId}, Reason: ${reason || 'User cancelled'}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Confirm arrival (Admin only)
   */
  async confirmArrival(
    reservationId: number,
    adminId: number
  ): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get reservation
      const [reservations] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM center_reservations WHERE id = ?`,
        [reservationId]
      );

      if (reservations.length === 0) {
        throw new AppError('Reservation not found', 404);
      }

      const reservation = reservations[0];

      // Check if can be confirmed
      if (reservation.status === 'expired') {
        throw new AppError('Cannot confirm expired reservation', 400);
      }

      if (reservation.status === 'cancelled') {
        throw new AppError('Cannot confirm cancelled reservation', 400);
      }

      if (reservation.status === 'arrived') {
        throw new AppError('Reservation already confirmed', 400);
      }

      // Update reservation
      await connection.query(
        `UPDATE center_reservations 
         SET status = 'arrived', confirmed_at = NOW(), confirmed_by = ?, arrived_at = NOW()
         WHERE id = ?`,
        [adminId, reservationId]
      );

      // Move from reserved to occupied
      await connection.query(
        `UPDATE evacuation_centers 
         SET reserved_slots = GREATEST(0, reserved_slots - ?),
             current_occupancy = current_occupancy + ?
         WHERE id = ?`,
        [reservation.group_size, reservation.group_size, reservation.center_id]
      );

      await connection.commit();

      // Broadcast capacity update
      await this.broadcastCapacityUpdate(reservation.center_id);

      console.log(`✅ Arrival confirmed: Reservation ${reservationId}, Admin ${adminId}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(userId: number): Promise<ReservationWithDetails[]> {
    const [reservations] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cr.id,
        cr.center_id as centerId,
        cr.user_id as userId,
        cr.group_size as groupSize,
        cr.status,
        cr.estimated_arrival as estimatedArrival,
        cr.reserved_at as reservedAt,
        cr.expires_at as expiresAt,
        cr.confirmed_at as confirmedAt,
        cr.confirmed_by as confirmedBy,
        cr.cancelled_at as cancelledAt,
        cr.cancellation_reason as cancellationReason,
        cr.arrived_at as arrivedAt,
        cr.notes,
        ec.name as centerName,
        ec.address as centerAddress,
        u.first_name as userName,
        u.email as userEmail,
        u.phone as userPhone
       FROM center_reservations cr
       JOIN evacuation_centers ec ON cr.center_id = ec.id
       JOIN users u ON cr.user_id = u.id
       WHERE cr.user_id = ?
       ORDER BY cr.created_at DESC`,
      [userId]
    );

    return reservations as ReservationWithDetails[];
  }

  /**
   * Get center reservations (Admin)
   */
  async getCenterReservations(
    centerId: number,
    status?: string,
    date?: string
  ): Promise<ReservationWithDetails[]> {
    let query = `
      SELECT 
        cr.id,
        cr.center_id as centerId,
        cr.user_id as userId,
        cr.group_size as groupSize,
        cr.status,
        cr.estimated_arrival as estimatedArrival,
        cr.reserved_at as reservedAt,
        cr.expires_at as expiresAt,
        cr.confirmed_at as confirmedAt,
        cr.confirmed_by as confirmedBy,
        cr.cancelled_at as cancelledAt,
        cr.cancellation_reason as cancellationReason,
        cr.arrived_at as arrivedAt,
        cr.notes,
        ec.name as centerName,
        ec.address as centerAddress,
        u.first_name as userName,
        u.email as userEmail,
        u.phone as userPhone
      FROM center_reservations cr
      JOIN evacuation_centers ec ON cr.center_id = ec.id
      JOIN users u ON cr.user_id = u.id
      WHERE cr.center_id = ?
    `;

    const params: any[] = [centerId];

    if (status) {
      query += ` AND cr.status = ?`;
      params.push(status);
    }

    if (date) {
      query += ` AND DATE(cr.estimated_arrival) = ?`;
      params.push(date);
    }

    query += ` ORDER BY cr.estimated_arrival ASC`;

    const [reservations] = await pool.query<RowDataPacket[]>(query, params);

    return reservations as ReservationWithDetails[];
  }

  /**
   * Get all reservations across all centers (Admin)
   */
  async getAllReservations(
    status?: string,
    date?: string
  ): Promise<ReservationWithDetails[]> {
    let query = `
      SELECT 
        cr.id,
        cr.center_id as centerId,
        cr.user_id as userId,
        cr.group_size as groupSize,
        cr.status,
        cr.estimated_arrival as estimatedArrival,
        cr.reserved_at as reservedAt,
        cr.expires_at as expiresAt,
        cr.confirmed_at as confirmedAt,
        cr.confirmed_by as confirmedBy,
        cr.cancelled_at as cancelledAt,
        cr.cancellation_reason as cancellationReason,
        cr.arrived_at as arrivedAt,
        cr.notes,
        ec.name as centerName,
        ec.address as centerAddress,
        u.first_name as userName,
        u.email as userEmail,
        u.phone as userPhone
      FROM center_reservations cr
      JOIN evacuation_centers ec ON cr.center_id = ec.id
      JOIN users u ON cr.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ` AND cr.status = ?`;
      params.push(status);
    }

    if (date) {
      query += ` AND DATE(cr.estimated_arrival) = ?`;
      params.push(date);
    }

    query += ` ORDER BY cr.reserved_at DESC`;

    const [reservations] = await pool.query<RowDataPacket[]>(query, params);

    return reservations as ReservationWithDetails[];
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: number): Promise<Reservation> {
    const [reservations] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        center_id as centerId,
        user_id as userId,
        group_size as groupSize,
        status,
        estimated_arrival as estimatedArrival,
        reserved_at as reservedAt,
        expires_at as expiresAt,
        confirmed_at as confirmedAt,
        confirmed_by as confirmedBy,
        cancelled_at as cancelledAt,
        cancellation_reason as cancellationReason,
        arrived_at as arrivedAt,
        notes
       FROM center_reservations 
       WHERE id = ?`,
      [id]
    );

    if (reservations.length === 0) {
      throw new AppError('Reservation not found', 404);
    }

    return reservations[0] as Reservation;
  }

  /**
   * Expire old reservations (Cron job)
   */
  async expireOldReservations(): Promise<number> {
    const connection = await pool.getConnection();
    let expiredCount = 0;

    try {
      await connection.beginTransaction();

      // Find expired reservations
      const [expired] = await connection.query<RowDataPacket[]>(
        `SELECT id, center_id, group_size 
         FROM center_reservations 
         WHERE status = 'pending' AND expires_at < NOW()`
      );

      for (const reservation of expired) {
        // Update status
        await connection.query(
          `UPDATE center_reservations 
           SET status = 'expired' 
           WHERE id = ?`,
          [reservation.id]
        );

        // Return slots
        await connection.query(
          `UPDATE evacuation_centers 
           SET reserved_slots = GREATEST(0, reserved_slots - ?)
           WHERE id = ?`,
          [reservation.group_size, reservation.center_id]
        );

        // Broadcast update
        await this.broadcastCapacityUpdate(reservation.center_id);

        expiredCount++;
      }

      await connection.commit();

      if (expiredCount > 0) {
        console.log(`⏰ Expired ${expiredCount} reservations`);
      }

      return expiredCount;
    } catch (error) {
      await connection.rollback();
      console.error('Error expiring reservations:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check availability
   */
  async checkAvailability(centerId: number, groupSize: number): Promise<{
    available: boolean;
    availableSlots: number;
    statusLevel: string;
  }> {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM center_availability WHERE id = ?`,
      [centerId]
    );

    if (result.length === 0) {
      throw new AppError('Center not found', 404);
    }

    const center = result[0];

    return {
      available: center.available_slots >= groupSize,
      availableSlots: center.available_slots,
      statusLevel: center.status_level
    };
  }

  /**
   * Broadcast capacity update via WebSocket
   */
  private async broadcastCapacityUpdate(centerId: number): Promise<void> {
    try {
      const [result] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM center_availability WHERE id = ?`,
        [centerId]
      );

      if (result.length > 0) {
        const data = result[0];
        
        // Broadcast to all connected users
        if (websocketService && (websocketService as any).io) {
          (websocketService as any).io.emit('capacity_updated', {
            type: 'capacity_update',
            data: {
              centerId,
              availableSlots: data.available_slots,
              statusLevel: data.status_level,
              occupancyPercentage: data.occupancy_percentage,
              reservedSlots: data.reserved_slots
            }
          });
          
          console.log(`📢 Broadcasted capacity update for center ${centerId}`);
        }
      }
    } catch (error) {
      console.error('Error broadcasting capacity update:', error);
    }
  }
}
