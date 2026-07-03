import { describe, expect, it } from 'vitest';
import {
  assertChatAccess,
  formatAcceptedContent,
  formatProposalContent,
  formatRejectedContent,
  validateAppointmentPayload,
  validateConfirmDelivery,
  validateMessageContent,
  validateOpenChat,
  validateSendMessage,
} from '../../../src/domain/validators/chat.validator';
import { Chat } from '../../../src/domain/types/chat.types';
import { Product } from '../../../src/domain/types/product.types';

const now = new Date();

const baseChat = (overrides: Partial<Chat> = {}): Chat => ({
  id: 'chat-1',
  product_id: 'prod-1',
  buyer_id: 'buyer-1',
  seller_id: 'seller-1',
  status: 'open',
  created_at: now,
  updated_at: now,
  ...overrides,
});

const baseProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  seller_id: 'seller-1',
  university_id: 'uni-1',
  name: 'Arduino',
  description: null,
  price: 1000,
  is_donation: false,
  category: 'microcontrollers',
  condition: 'good',
  status: 'available',
  image_url: 'https://res.cloudinary.com/demo/img.jpg',
  image_public_id: null,
  created_at: now,
  updated_at: now,
  ...overrides,
});

describe('chat.validator', () => {
  describe('validateMessageContent', () => {
    it('acepta mensaje con texto', () => {
      expect(() => validateMessageContent('Hola')).not.toThrow();
    });

    it('rechaza mensaje vacío', () => {
      expect(() => validateMessageContent('   ')).toThrow(
        'El mensaje no puede estar vacío'
      );
    });
  });

  describe('validateAppointmentPayload', () => {
    it('acepta cita completa', () => {
      expect(() =>
        validateAppointmentPayload({
          day: 'Lunes',
          time: '10:00',
          location: 'Biblioteca',
        })
      ).not.toThrow();
    });

    it('rechaza campos faltantes', () => {
      expect(() =>
        validateAppointmentPayload({ day: 'Lunes', time: '', location: 'Biblioteca' })
      ).toThrow('Día, hora y lugar son requeridos para el encuentro');
    });
  });

  describe('formatters de cita', () => {
    const appointment = { day: 'Martes', time: '14:00', location: 'Campus norte' };

    it('formatProposalContent', () => {
      expect(formatProposalContent(appointment)).toBe(
        'Propuesta de encuentro · Martes · 14:00 · Campus norte'
      );
    });

    it('formatAcceptedContent', () => {
      expect(formatAcceptedContent(appointment)).toBe(
        'Encuentro acordado · Martes · 14:00 · Campus norte'
      );
    });

    it('formatRejectedContent', () => {
      expect(formatRejectedContent(appointment)).toBe(
        'Propuesta rechazada · Martes · 14:00 · Campus norte'
      );
    });
  });

  describe('validateOpenChat', () => {
    it('acepta producto disponible de otro vendedor', () => {
      expect(() =>
        validateOpenChat(baseProduct(), 'buyer-1')
      ).not.toThrow();
    });

    it('rechaza producto inexistente', () => {
      expect(() => validateOpenChat(null, 'buyer-1')).toThrow('Producto no encontrado');
    });

    it('rechaza producto ya vendido', () => {
      expect(() =>
        validateOpenChat(baseProduct({ status: 'sold' }), 'buyer-1')
      ).toThrow('Este producto ya fue vendido');
    });

    it('rechaza chat sobre producto propio', () => {
      expect(() =>
        validateOpenChat(baseProduct(), 'seller-1')
      ).toThrow('No puedes abrir un chat sobre tu propio producto');
    });
  });

  describe('assertChatAccess', () => {
    it('permite acceso a participante', () => {
      expect(() =>
        assertChatAccess(baseChat(), 'buyer-1')
      ).not.toThrow();
    });

    it('rechaza usuario ajeno al chat', () => {
      expect(() =>
        assertChatAccess(baseChat(), 'outsider-1')
      ).toThrow('No tienes acceso a este chat');
    });
  });

  describe('validateSendMessage', () => {
    it('permite enviar mensaje en chat abierto', () => {
      expect(() =>
        validateSendMessage(baseChat(), 'seller-1')
      ).not.toThrow();
    });

    it('rechaza mensaje en chat con entrega confirmada', () => {
      expect(() =>
        validateSendMessage(baseChat({ status: 'delivery_confirmed' }), 'buyer-1')
      ).toThrow('Este chat ya fue cerrado con entrega confirmada');
    });
  });

  describe('validateConfirmDelivery', () => {
    it('permite confirmar entrega en chat abierto', () => {
      expect(() =>
        validateConfirmDelivery(baseChat(), 'buyer-1')
      ).not.toThrow();
    });

    it('rechaza confirmar entrega ya confirmada', () => {
      expect(() =>
        validateConfirmDelivery(baseChat({ status: 'delivery_confirmed' }), 'buyer-1')
      ).toThrow('La entrega ya fue confirmada');
    });
  });
});
