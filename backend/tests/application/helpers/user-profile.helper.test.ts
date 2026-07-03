import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findByIds, findById } = vi.hoisted(() => ({
  findByIds: vi.fn(),
  findById: vi.fn(),
}));

vi.mock('../../../src/infrastructure/persistence/repositories/user.repository', () => ({
  userRepository: { findByIds, findById },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/university.repository', () => ({
  universityRepository: { findById },
}));

import {
  enrichChatsWithParticipants,
  enrichProductsWithSeller,
  enrichTransactionsWithParties,
} from '../../../src/application/helpers/user-profile.helper';

describe('user-profile.helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enrichProductsWithSeller agrega seller_name', async () => {
    findByIds.mockResolvedValue([
      {
        id: 'seller-1',
        university_id: 'uni-1',
        full_name: 'María Rodríguez',
        email: 'maria@uni.edu',
        password_hash: 'x',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const products = await enrichProductsWithSeller([
      {
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
        image_url: 'https://example.com/img.jpg',
        image_public_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    expect(products[0].seller_name).toBe('María Rodríguez');
  });
  it('enrichChatsWithParticipants agrega nombres y universidades', async () => {
    findByIds.mockResolvedValue([
      {
        id: 'buyer-1',
        university_id: 'uni-1',
        full_name: 'Carlos',
        email: 'carlos@uni.edu',
        password_hash: 'x',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'seller-1',
        university_id: 'uni-1',
        full_name: 'María',
        email: 'maria@uni.edu',
        password_hash: 'x',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    findById.mockResolvedValue({
      id: 'uni-1',
      name: 'Uni Empresarial',
      email_domain: 'uni.edu',
      subscription_status: 'active',
      subscription_start: new Date(),
      subscription_end: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const chats = await enrichChatsWithParticipants([
      {
        id: 'chat-1',
        product_id: 'prod-1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        status: 'open',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    expect(chats[0].buyer_name).toBe('Carlos');
    expect(chats[0].seller_name).toBe('María');
    expect(chats[0].buyer_university_name).toBe('Uni Empresarial');
    expect(chats[0].seller_university_name).toBe('Uni Empresarial');
  });

  it('enrichTransactionsWithParties agrega buyer_name y seller_name', async () => {
    findByIds.mockResolvedValue([
      {
        id: 'buyer-1',
        university_id: 'uni-1',
        full_name: 'Comprador',
        email: 'buyer@uni.edu',
        password_hash: 'x',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'seller-1',
        university_id: 'uni-1',
        full_name: 'Vendedor',
        email: 'seller@uni.edu',
        password_hash: 'x',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const transactions = await enrichTransactionsWithParties([
      {
        id: 'tx-1',
        product_id: 'prod-1',
        seller_id: 'seller-1',
        buyer_id: 'buyer-1',
        chat_id: 'chat-1',
        reservation_id: null,
        final_price: 5000,
        confirmed_at: new Date(),
        created_at: new Date(),
        product_name: 'Sensor',
        product_image: 'img.jpg',
        product_category: 'sensors',
        buyer_name: '',
        seller_name: '',
        direction: 'purchase',
      },
    ]);

    expect(transactions[0].buyer_name).toBe('Comprador');
    expect(transactions[0].seller_name).toBe('Vendedor');
  });
});
