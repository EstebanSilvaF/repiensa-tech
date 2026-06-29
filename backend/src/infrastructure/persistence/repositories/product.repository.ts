import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { Product, CreateProductDTO, ProductFilters } from '../../../domain/types/product.types';
import { decimalToNumber } from '../../../shared/utils/prisma-mappers';

function mapProduct(
  row: {
    id: string;
    sellerId: string;
    universityId: string;
    name: string;
    description: string | null;
    price: Prisma.Decimal;
    isDonation: boolean;
    category: Product['category'];
    condition: Product['condition'];
    status: Product['status'];
    imageUrl: string;
    imagePublicId: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  extras?: { seller_name?: string; seller_email?: string }
): Product {
  const product: Product = {
    id: row.id,
    seller_id: row.sellerId,
    university_id: row.universityId,
    name: row.name,
    description: row.description,
    price: decimalToNumber(row.price),
    is_donation: row.isDonation,
    category: row.category,
    condition: row.condition,
    status: row.status,
    image_url: row.imageUrl,
    image_public_id: row.imagePublicId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };

  if (extras?.seller_name) {
    (product as Product & { seller_name: string }).seller_name = extras.seller_name;
  }
  if (extras?.seller_email) {
    (product as Product & { seller_email: string }).seller_email = extras.seller_email;
  }

  return product;
}

export const productRepository = {
  async findAll(universityId: string, filters: ProductFilters): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {
      universityId,
      status: 'available',
    };

    if (filters.category) where.category = filters.category;
    if (filters.condition) where.condition = filters.condition;
    if (filters.is_donation !== undefined) where.isDonation = filters.is_donation;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.product.findMany({
      where,
      include: { seller: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) =>
      mapProduct(row, { seller_name: row.seller.fullName })
    );
  },

  async findById(id: string): Promise<(Product & { seller_name?: string; seller_email?: string }) | null> {
    const row = await prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { fullName: true, email: true } } },
    });
    if (!row) return null;
    return mapProduct(row, {
      seller_name: row.seller.fullName,
      seller_email: row.seller.email,
    });
  },

  async findBySeller(sellerId: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => mapProduct(row));
  },

  async create(
    sellerId: string,
    universityId: string,
    data: CreateProductDTO
  ): Promise<Product> {
    const row = await prisma.product.create({
      data: {
        sellerId,
        universityId,
        name: data.name,
        description: data.description ?? null,
        price: data.is_donation ? 0 : data.price,
        isDonation: data.is_donation,
        category: data.category,
        condition: data.condition,
        imageUrl: data.image_url,
        imagePublicId: data.image_public_id ?? null,
      },
    });
    return mapProduct(row);
  },

  async updateStatus(id: string, status: Product['status']): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { status },
    });
  },

  async delete(id: string, sellerId: string): Promise<boolean> {
    const result = await prisma.product.deleteMany({
      where: { id, sellerId },
    });
    return result.count > 0;
  },
};
