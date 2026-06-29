import { reservationRepository } from '../../infrastructure/persistence/repositories/reservation.repository';
import { productRepository } from '../../infrastructure/persistence/repositories/product.repository';
import { validateProductReservation } from '../../domain/validators/reservation.validator';

const RESERVATION_FEE  = 2000;
const RESERVATION_DAYS = 7;

export const reservationService = {
  async getMyReservations(buyerId: string) {
    return reservationRepository.findByBuyer(buyerId);
  },

  async reserve(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    const existing = await reservationRepository.findActiveByProduct(productId);

    validateProductReservation(product, buyerId, !!existing);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RESERVATION_DAYS);

    return reservationRepository.reserveAtomic({
      productId,
      buyerId,
      sellerId: product.seller_id,
      productName: product.name,
      feePaid: RESERVATION_FEE,
      expiresAt,
    });
  },

  async expireOverdue() {
    const count = await reservationRepository.expireOverdue();
    if (count > 0) {
      console.log(`⏰ ${count} reservas expiradas y productos devueltos a disponible`);
    }
  },
};
