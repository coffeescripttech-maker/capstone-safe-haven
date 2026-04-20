import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();
const reservationController = new ReservationController();

// User endpoints (authenticated)
router.post(
  '/centers/:id/reserve',
  authenticate,
  reservationController.createReservation.bind(reservationController)
);

router.get(
  '/centers/reservations/my',
  authenticate,
  reservationController.getMyReservations.bind(reservationController)
);

router.post(
  '/centers/reservations/:id/cancel',
  authenticate,
  reservationController.cancelReservation.bind(reservationController)
);

router.get(
  '/centers/:id/status',
  authenticate,
  reservationController.getCenterStatus.bind(reservationController)
);

router.post(
  '/centers/:id/check-availability',
  authenticate,
  reservationController.checkAvailability.bind(reservationController)
);

// Admin endpoints
router.get(
  '/admin/centers/reservations/all',
  authenticate,
  requirePermission('evacuation_centers', 'read'),
  reservationController.getAllReservations.bind(reservationController)
);

router.get(
  '/admin/centers/:id/reservations',
  authenticate,
  requirePermission('evacuation_centers', 'read'),
  reservationController.getCenterReservations.bind(reservationController)
);

router.post(
  '/admin/centers/reservations/:id/confirm',
  authenticate,
  requirePermission('evacuation_centers', 'update'),
  reservationController.confirmArrival.bind(reservationController)
);

router.post(
  '/admin/centers/reservations/:id/reject',
  authenticate,
  requirePermission('evacuation_centers', 'update'),
  reservationController.rejectReservation.bind(reservationController)
);

export default router;
