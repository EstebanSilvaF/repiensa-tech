import 'dotenv/config';
import { cloudinary, ensureCloudinaryConfig } from '../src/infrastructure/config/cloudinary';

const PRODUCT_FOLDER = 'repensa/products';

async function main(): Promise<void> {
  ensureCloudinaryConfig();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let nextCursor: string | undefined;

  console.log(`Imágenes en Cloudinary (${PRODUCT_FOLDER}):\n`);

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: PRODUCT_FOLDER,
      max_results: 50,
      next_cursor: nextCursor,
    });

    for (const asset of result.resources) {
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${asset.public_id}`;
      console.log(`- ${asset.public_id}`);
      console.log(`  ${url}\n`);
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log('Copia public_id y URL a backend/src/infrastructure/seed/seed-images.ts');
}

main().catch((err) => {
  console.error('Error listando imágenes:', err.message ?? err);
  process.exit(1);
});
