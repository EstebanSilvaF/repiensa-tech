import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const UNIVERSITY_ID = 'cluniempresarial01';
const ADMIN_ID = 'cladminrepensa001';
const MARIA_ID = 'clmariaestud001';
const CARLOS_ID = 'clcarlosestud001';
const PRODUCT_1_ID = 'clprodarduino001';
const PRODUCT_2_ID = 'clprodsensor001';

async function main(): Promise<void> {
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

  await prisma.user.createMany({
    data: [
      {
        id: ADMIN_ID,
        universityId: UNIVERSITY_ID,
        fullName: 'Admin Repensa',
        email: 'admin@uniempresarial.edu.co',
        passwordHash: '$2b$10$E1zYbUfaQQr49FfOMSBIe.ossGjfJrhDMvC25yIUOEyHIePqy8zYm',
        role: 'admin',
      },
      {
        id: MARIA_ID,
        universityId: UNIVERSITY_ID,
        fullName: 'María Rodríguez',
        email: 'maria.rodriguez@uniempresarial.edu.co',
        passwordHash: '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
        role: 'student',
      },
      {
        id: CARLOS_ID,
        universityId: UNIVERSITY_ID,
        fullName: 'Carlos Mendoza',
        email: 'carlos.mendoza@uniempresarial.edu.co',
        passwordHash: '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
        role: 'student',
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        id: PRODUCT_1_ID,
        sellerId: MARIA_ID,
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
        sellerId: MARIA_ID,
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
}

main()
  .catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
