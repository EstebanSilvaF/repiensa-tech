import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { connectMongo, disconnectMongo } from '../persistence/mongo/connection';
import { UserModel } from '../persistence/mongo/models/user.model';
import { DEFAULT_UNIVERSITY_ID } from './default-university';
import { hashSeedPassword, SEED_ENV_KEYS } from './seed-credentials';
import { SEED_IMAGE_ARDUINO, SEED_IMAGE_SENSOR } from './seed-images';

const prisma = new PrismaClient();

const UNIVERSITY_ID = DEFAULT_UNIVERSITY_ID;
const PRODUCT_1_ID = 'clprodarduino001';
const PRODUCT_2_ID = 'clprodsensor001';

async function clearPostgresSeedData(): Promise<void> {
  await prisma.transaction.deleteMany({ where: { product: { universityId: UNIVERSITY_ID } } });
  await prisma.message.deleteMany({ where: { chat: { product: { universityId: UNIVERSITY_ID } } } });
  await prisma.chat.deleteMany({ where: { product: { universityId: UNIVERSITY_ID } } });
  await prisma.reservation.deleteMany({ where: { product: { universityId: UNIVERSITY_ID } } });
  await prisma.product.deleteMany({ where: { universityId: UNIVERSITY_ID } });
  await prisma.university.deleteMany({ where: { id: UNIVERSITY_ID } });
}

async function main(): Promise<void> {
  await connectMongo();

  const [adminPasswordHash, studentPasswordHash, libraryPasswordHash] = await Promise.all([
    hashSeedPassword(SEED_ENV_KEYS.admin),
    hashSeedPassword(SEED_ENV_KEYS.student),
    hashSeedPassword(SEED_ENV_KEYS.library),
  ]);

  await UserModel.deleteMany({});
  await clearPostgresSeedData();

  await prisma.university.create({
    data: {
      id: UNIVERSITY_ID,
      name: 'FundaciónUniversitaria Empresarial de Colombia',
      emailDomain: 'uniempresarial.edu.co',
      subscriptionStatus: 'active',
      subscriptionStart: new Date('2026-01-01'),
      subscriptionEnd: new Date('2026-12-31'),
    },
  });

  const [admin, maria, carlos, biblioteca] = await UserModel.create([
    {
      university_id: UNIVERSITY_ID,
      full_name: 'Admin Repensa',
      email: 'admin@uniempresarial.edu.co',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'María Rodríguez',
      email: 'maria.rodriguez@uniempresarial.edu.co',
      password_hash: studentPasswordHash,
      role: 'student',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'Carlos Mendoza',
      email: 'carlos.mendoza@uniempresarial.edu.co',
      password_hash: studentPasswordHash,
      role: 'student',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'Biblioteca Universitaria',
      email: 'biblioteca@uniempresarial.edu.co',
      password_hash: libraryPasswordHash,
      role: 'library',
    },
  ]);

  const mariaId = maria._id.toString();

  await prisma.product.createMany({
    data: [
      {
        id: PRODUCT_1_ID,
        sellerId: mariaId,
        universityId: UNIVERSITY_ID,
        name: 'Arduino Uno R3',
        description: 'Placa Arduino Uno R3 original. Usada un semestre en robótica. Incluye cable USB.',
        price: 18000,
        isDonation: false,
        category: 'microcontrollers',
        condition: 'good',
        status: 'available',
        imageUrl: SEED_IMAGE_ARDUINO.imageUrl,
        imagePublicId: SEED_IMAGE_ARDUINO.imagePublicId,
      },
      {
        id: PRODUCT_2_ID,
        sellerId: mariaId,
        universityId: UNIVERSITY_ID,
        name: 'Sensor HC-SR04',
        description: 'Sensor ultrasónico de distancia. Funciona correctamente.',
        price: 8000,
        isDonation: false,
        category: 'sensors',
        condition: 'good',
        status: 'available',
        imageUrl: SEED_IMAGE_SENSOR.imageUrl,
        imagePublicId: SEED_IMAGE_SENSOR.imagePublicId,
      },
    ],
  });

  console.log('Seed aplicado correctamente.');
  console.log(`Admin ID (MongoDB): ${admin._id.toString()}`);
  console.log(`María ID (MongoDB): ${mariaId}`);
  console.log(`Carlos ID (MongoDB): ${carlos._id.toString()}`);
  console.log(`Biblioteca ID (MongoDB): ${biblioteca._id.toString()}`);
}

main()
  .catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await disconnectMongo();
  });
