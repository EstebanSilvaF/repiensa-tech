import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { Reservation, ReservationStatus } from '../../../domain/types/shared.types';
import { decimalToNumber } from '../../../shared/utils/prisma-mappers';

function mapReservation(
  row: {
    id: string;
    productId: string;
    buyerId: string;
    feePaid: Prisma.Decimal;
    status: ReservationStatus;
    expiresAt: Date;
    createdAt: Date;
  },
  extras?: {
    product_name?: string;
    product_image?: string;
    product_price?: number;
  }
): Reservation & { product_name?: string; product_image?: string; product_price?: number } {
  const reservation: Reservation & {
    product_name?: string;
    product_image?: string;
    product_price?: number;
  } = {
    id: row.id,
    product_id: row.productId,
    buyer_id: row.buyerId,
    fee_paid: decimalToNumber(row.feePaid),
    status: row.status,
    expires_at: row.expiresAt,
    created_at: row.createdAt,
  };

  if (extras?.product_name) reservation.product_name = extras.product_name;
  if (extras?.product_image) reservation.product_image = extras.product_image;
  if (extras?.product_price !== undefined) reservation.product_price = extras.product_price;

  return reservation;
}

export const reservationRepository = {
  async findActiveByProduct(productId: string): Promise<Reservation | null> {
    const row = await prisma.reservation.findFirst({
      where: { productId, status: 'active' },
    });
    return row ? mapReservation(row) : null;
  },

  async findByBuyer(buyerId: string): Promise<Reservation[]> {
    const rows = await prisma.reservation.findMany({
      where: { buyerId },
      include: {
        product: { select: { name: true, imageUrl: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) =>
      mapReservation(row, {
        product_name: row.product.name,
        product_image: row.product.imageUrl,
        product_price: decimalToNumber(row.product.price),
      })
    );
  },

  async findLatestByProductAndBuyer(
    productId: string,
    buyerId: string
  ): Promise<Reservation | null> {
    const row = await prisma.reservation.findFirst({
      where: { productId, buyerId },
      orderBy: { createdAt: 'desc' },
    });
    return row ? mapReservation(row) : null;
  },

  async create(
    productId: string,
    buyerId: string,
    feePaid: number,
    expiresAt: Date
  ): Promise<Reservation> {
    const row = await prisma.reservation.create({
      data: {
        productId,
        buyerId,
        feePaid,
        expiresAt,
      },
    });
    return mapReservation(row);
  },

  async reserveAtomic(params: {
    productId: string;
    buyerId: string;
    sellerId: string;
    productName: string;
    feePaid: number;
    expiresAt: Date;
  }): Promise<Reservation> {
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.reservation.create({
        data: {
          productId: params.productId,
          buyerId: params.buyerId,
          feePaid: params.feePaid,
          expiresAt: params.expiresAt,
        },
      });

      await tx.product.update({
        where: { id: params.productId },
        data: { status: 'reserved' },
      });

      await tx.notification.create({
        data: {
          userId: params.sellerId,
          type: 'reservation_confirmed',
          title: 'Tu producto fue reservado',
          description: `Alguien reservó "${params.productName}". Tiene 7 días para completar la compra.`,
          referenceId: created.id,
          referenceType: 'reservation',
        },
      });

      return created;
    });

    return mapReservation(row);
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<void> {
    await prisma.reservation.update({
      where: { id },
      data: { status },
    });
  },

  async expireOverdue(): Promise<number> {
    const result = await prisma.$executeRaw`
      WITH expired AS (
        UPDATE reservations
        SET status = 'expired'
        WHERE status = 'active' AND expires_at < NOW()
        RETURNING product_id
      )
      UPDATE products
      SET status = 'available'
      WHERE id IN (SELECT product_id FROM expired)
        AND status = 'reserved'
    `;
    return Number(result);
  },
};
