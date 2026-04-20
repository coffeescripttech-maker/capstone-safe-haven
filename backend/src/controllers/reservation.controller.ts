import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReservationService } from '../services/reservation.service';
import { AppError } from '../middleware/errorHandler';

const reservationService = new ReservationService();

export class ReservationController {
  /**
   * Create a new reservation
   * POST /api/centers/:id/reserve
   */
  async createReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const centerId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { groupSize, estimatedArrival, notes } = req.body;

      // Validation
      if (!groupSize || groupSize <= 0) {
        throw new AppError('Group size is required and must be positive', 400);
      }

      if (!estimatedArrival) {
        throw new AppError('Estimated arrival time is required', 400);
      }

      const reservation = await reservationService.createReservation(
        centerId,
        userId,
        groupSize,
        new Date(estimatedArrival),
        notes
      );

      res.status(201).json({
        status: 'success',
        data: reservation,
        message: 'Reservation created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's reservations
   * GET /api/centers/reservations/my
   */
  async getMyReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const reservations = await reservationService.getUserReservations(userId);

      res.json({
        status: 'success',
        data: reservations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a reservation
   * POST /api/centers/reservations/:id/cancel
   */
  async cancelReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservationId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { reason } = req.body;

      await reservationService.cancelReservation(reservationId, userId, reason);

      res.json({
        status: 'success',
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get center status with availability
   * GET /api/centers/:id/status
   */
  async getCenterStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const centerId = parseInt(req.params.id);
      const userId = req.user?.id;

      // Get center availability
      const availability = await reservationService.checkAvailability(centerId, 1);

      // Get user's reservation for this center if exists
      let myReservation = null;
      if (userId) {
        const userReservations = await reservationService.getUserReservations(userId);
        myReservation = userReservations.find(
          r => r.centerId === centerId && ['pending', 'confirmed'].includes(r.status)
        );
      }

      res.json({
        status: 'success',
        data: {
          centerId,
          ...availability,
          myReservation
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get center reservations (Admin only)
   * GET /api/admin/centers/:id/reservations
   */
  async getCenterReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const centerId = parseInt(req.params.id);
      const { status, date } = req.query;

      const reservations = await reservationService.getCenterReservations(
        centerId,
        status as string,
        date as string
      );

      res.json({
        status: 'success',
        data: reservations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reservations across all centers (Admin only)
   * GET /api/admin/centers/reservations/all
   */
  async getAllReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, date } = req.query;

      const reservations = await reservationService.getAllReservations(
        status as string,
        date as string
      );

      res.json({
        status: 'success',
        data: reservations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm arrival (Admin only)
   * POST /api/admin/centers/reservations/:id/confirm
   */
  async confirmArrival(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservationId = parseInt(req.params.id);
      const adminId = req.user!.id;

      await reservationService.confirmArrival(reservationId, adminId);

      res.json({
        status: 'success',
        message: 'Arrival confirmed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject reservation (Admin only)
   * POST /api/admin/centers/reservations/:id/reject
   */
  async rejectReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservationId = parseInt(req.params.id);
      const adminId = req.user!.id;
      const { reason } = req.body;

      if (!reason) {
        throw new AppError('Rejection reason is required', 400);
      }

      await reservationService.cancelReservation(reservationId, adminId, reason, true);

      res.json({
        status: 'success',
        message: 'Reservation rejected successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check availability for group size
   * POST /api/centers/:id/check-availability
   */
  async checkAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const centerId = parseInt(req.params.id);
      const { groupSize } = req.body;

      if (!groupSize || groupSize <= 0) {
        throw new AppError('Group size is required and must be positive', 400);
      }

      const availability = await reservationService.checkAvailability(centerId, groupSize);

      res.json({
        status: 'success',
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }
}
