import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { connectMongo, disconnectMongo } from '../persistence/mongo/connection';
import { UserModel } from '../persistence/mongo/models/user.model';

const prisma = new PrismaClient();

const UNIVERSITY_ID = 'cluniempresarial01';
const PRODUCT_1_ID = 'clprodarduino001';
const PRODUCT_2_ID = 'clprodsensor001';

const ADMIN_PASSWORD_HASH = '$2b$10$E1zYbUfaQQr49FfOMSBIe.ossGjfJrhDMvC25yIUOEyHIePqy8zYm';
const STUDENT_PASSWORD_HASH = '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW';

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
      password_hash: ADMIN_PASSWORD_HASH,
      role: 'admin',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'María Rodríguez',
      email: 'maria.rodriguez@uniempresarial.edu.co',
      password_hash: STUDENT_PASSWORD_HASH,
      role: 'student',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'Carlos Mendoza',
      email: 'carlos.mendoza@uniempresarial.edu.co',
      password_hash: STUDENT_PASSWORD_HASH,
      role: 'student',
    },
    {
      university_id: UNIVERSITY_ID,
      full_name: 'Biblioteca Universitaria',
      email: 'biblioteca@uniempresarial.edu.co',
      password_hash: STUDENT_PASSWORD_HASH,
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
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: null,
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
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/d_desert.jpg',
        imagePublicId: null,
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
