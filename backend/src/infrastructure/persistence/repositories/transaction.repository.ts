import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { Transaction } from '../../../domain/types/shared.types';
import { decimalToNumber } from '../../../shared/utils/prisma-mappers';

export type TransactionWithDetails = Transaction & {
  product_name: string;
  product_image: string;
  product_category: string;
  buyer_name: string;
  seller_name: string;
  direction: 'purchase' | 'sale';
};

function mapTransaction(
  row: {
    id: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    chatId: string;
    reservationId: string | null;
    finalPrice: Prisma.Decimal;
    confirmedAt: Date;
    createdAt: Date;
  }
): Transaction {
  return {
    id: row.id,
    product_id: row.productId,
    seller_id: row.sellerId,
    buyer_id: row.buyerId,
    chat_id: row.chatId,
    reservation_id: row.reservationId,
    final_price: decimalToNumber(row.finalPrice),
    confirmed_at: row.confirmedAt,
    created_at: row.createdAt,
  };
}

export interface CompleteSaleParams {
  chatId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  finalPrice: number;
  reservationId: string | null;
}

export const transactionRepository = {
  async findByUser(userId: string): Promise<TransactionWithDetails[]> {
    const rows = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: { select: { name: true, imageUrl: true, category: true } },
      },
      orderBy: { confirmedAt: 'desc' },
    });

    return rows.map((row) => ({
      ...mapTransaction(row),
      product_name: row.product.name,
      product_image: row.product.imageUrl,
      product_category: row.product.category,
      buyer_name: '',
      seller_name: '',
      direction: row.buyerId === userId ? 'purchase' : 'sale',
    }));
  },

  async completeSale(params: CompleteSaleParams): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.chat.update({
        where: { id: params.chatId },
        data: { status: 'delivery_confirmed' },
      });

      await tx.product.update({
        where: { id: params.productId },
        data: { status: 'sold' },
      });

      await tx.transaction.create({
        data: {
          productId: params.productId,
          sellerId: params.sellerId,
          buyerId: params.buyerId,
          chatId: params.chatId,
          reservationId: params.reservationId,
          finalPrice: params.finalPrice,
        },
      });
    });
  },
};
