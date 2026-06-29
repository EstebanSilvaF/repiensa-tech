import type { Reservation, ReserveProductRequest } from '../types/api'
import { apiClient } from './client'

export const reservationService = {
  getReservations: () =>
    apiClient.get<Reservation[]>('/reservations'),

  reserveProduct: (body: ReserveProductRequest) =>
    apiClient.post<Reservation>('/reservations', { body }),
}
