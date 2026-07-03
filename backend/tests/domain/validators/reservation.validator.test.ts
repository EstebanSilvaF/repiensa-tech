import { describe, expect, it } from 'vitest';
import { validateProductReservation } from '../../../src/domain/validators/reservation.validator';
import { Product } from '../../../src/domain/types/product.types';

const now = new Date();

const baseProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  seller_id: 'seller-1',
  university_id: 'uni-1',
  name: 'Sensor',
  description: null,
  price: 5000,
  is_donation: false,
  category: 'sensors',
  condition: 'good',
  status: 'available',
  image_url: 'https://res.cloudinary.com/demo/img.jpg',
  image_public_id: null,
  created_at: now,
  updated_at: now,
  ...overrides,
});

describe('reservation.validator', () => {
  describe('validateProductReservation', () => {
    it('acepta reserva válida', () => {
      expect(() =>
        validateProductReservation(baseProduct(), 'buyer-1', false)
      ).not.toThrow();
    });

    it('rechaza producto inexistente', () => {
      expect(() =>
        validateProductReservation(null, 'buyer-1', false)
      ).toThrow('Producto no encontrado');
    });

    it('rechaza producto no disponible', () => {
      expect(() =>
        validateProductReservation(baseProduct({ status: 'reserved' }), 'buyer-1', false)
      ).toThrow('Este producto no está disponible para reservar');
    });

    it('rechaza reservar producto propio', () => {
      expect(() =>
        validateProductReservation(baseProduct(), 'seller-1', false)
      ).toThrow('No puedes reservar tu propio producto');
    });

    it('rechaza producto con reserva activa', () => {
      expect(() =>
        validateProductReservation(baseProduct(), 'buyer-1', true)
      ).toThrow('Este producto ya está reservado');
    });
  });
});
