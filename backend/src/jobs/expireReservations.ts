import cron, { ScheduledTask } from 'node-cron';
import { ReservationService } from '../services/reservation.service';

const reservationService = new ReservationService();

/**
 * Cron job to expire old reservations
 * Runs every 5 minutes
 */
export function startReservationExpirationJob() {
  // Run every 5 minutes: */5 * * * *
  const job = cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Running reservation expiration job...');
      const expiredCount = await reservationService.expireOldReservations();
      
      if (expiredCount > 0) {
        console.log(`✅ Expired ${expiredCount} reservations`);
      } else {
        console.log('✅ No reservations to expire');
      }
    } catch (error) {
      console.error('❌ Error in reservation expiration job:', error);
    }
  });

  console.log('✅ Reservation expiration job started (runs every 5 minutes)');
  
  return job;
}

/**
 * Stop the expiration job
 */
export function stopReservationExpirationJob(job: ScheduledTask) {
  job.stop();
  console.log('🛑 Reservation expiration job stopped');
}
