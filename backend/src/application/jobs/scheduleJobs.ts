import cron from 'node-cron';
import { expireReservationsJob } from './expireReservations.job';

export function scheduleJobs(): void {
  cron.schedule('0 * * * *', expireReservationsJob);
}
