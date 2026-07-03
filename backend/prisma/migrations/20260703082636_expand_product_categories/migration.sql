-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "product_category" ADD VALUE 'books_notes';
ALTER TYPE "product_category" ADD VALUE 'lab_science';
ALTER TYPE "product_category" ADD VALUE 'art_design';
ALTER TYPE "product_category" ADD VALUE 'tools_hardware';
ALTER TYPE "product_category" ADD VALUE 'sports_fitness';
ALTER TYPE "product_category" ADD VALUE 'clothing_accessories';
ALTER TYPE "product_category" ADD VALUE 'furniture_decor';
ALTER TYPE "product_category" ADD VALUE 'musical_instruments';
ALTER TYPE "product_category" ADD VALUE 'stationery_office';
ALTER TYPE "product_category" ADD VALUE 'home_kitchen';
ALTER TYPE "product_category" ADD VALUE 'services';
