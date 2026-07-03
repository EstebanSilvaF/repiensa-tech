import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findById, findActiveByProduct, reserveAtomic } = vi.hoisted(() => ({
  findById: vi.fn(),
  findActiveByProduct: vi.fn(),
  reserveAtomic: vi.fn(),
}));

vi.mock('../../../src/infrastructure/persistence/repositories/product.repository', () => ({
  productRepository: { findById },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/reservation.repository', () => ({
  reservationRepository: {
    findActiveByProduct,
    reserveAtomic,
  },
}));

import { reservationService } from '../../../src/application/services/reservation.service';

const now = new Date();

describe('reservation.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reserve', () => {
    const product = {
      id: 'prod-1',
      seller_id: 'seller-1',
      university_id: 'uni-1',
      name: 'Arduino Uno',
      description: null,
      price: 30000,
      is_donation: false,
      category: 'microcontrollers' as const,
      condition: 'good' as const,
      status: 'available' as const,
      image_url: 'https://res.cloudinary.com/demo/img.jpg',
      image_public_id: null,
      created_at: now,
      updated_at: now,
    };

    it('crea reserva cuando el producto es válido', async () => {
      findById.mockResolvedValue(product);
      findActiveByProduct.mockResolvedValue(null);
      reserveAtomic.mockResolvedValue({
        id: 'res-1',
        product_id: 'prod-1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        fee_paid: 2000,
        expires_at: new Date(),
        created_at: now,
      });

      const result = await reservationService.reserve('prod-1', 'buyer-1');

      expect(findById).toHaveBeenCalledWith('prod-1');
      expect(findActiveByProduct).toHaveBeenCalledWith('prod-1');
      expect(reserveAtomic).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          productName: 'Arduino Uno',
          feePaid: 2000,
        })
      );
      expect(result.id).toBe('res-1');
    });

    it('rechaza reservar producto propio', async () => {
      findById.mockResolvedValue(product);
      findActiveByProduct.mockResolvedValue(null);

      await expect(
        reservationService.reserve('prod-1', 'seller-1')
      ).rejects.toThrow('No puedes reservar tu propio producto');
      expect(reserveAtomic).not.toHaveBeenCalled();
    });

    it('rechaza producto con reserva activa', async () => {
      findById.mockResolvedValue(product);
      findActiveByProduct.mockResolvedValue({ id: 'res-existing' });

      await expect(
        reservationService.reserve('prod-1', 'buyer-1')
      ).rejects.toThrow('Este producto ya está reservado');
      expect(reserveAtomic).not.toHaveBeenCalled();
    });
  });
});
