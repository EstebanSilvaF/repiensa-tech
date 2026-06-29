import { reservationService } from '../services/reservation.service';

export async function expireReservationsJob(): Promise<void> {
  try {
    await reservationService.expireOverdue();
  } catch (err) {
    console.error('Error en cron de reservas:', err);
  }
}
