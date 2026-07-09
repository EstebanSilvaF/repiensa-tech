-- RE-PENSA TECH — SEED (legacy SQL, solo referencia)
-- Los usuarios viven en MongoDB. Usar: npm run db:seed (prisma/seed.ts)
-- Contraseñas: Estudiante1! (estudiantes) | Admin1! (admin) | biblioteca123 (biblioteca)
-- NOTA: La tabla users ya no existe en PostgreSQL. Los usuarios se insertan en MongoDB vía prisma/seed.ts.

INSERT INTO universities (
  id, name, email_domain, subscription_status, subscription_start, subscription_end
) VALUES (
  'cluniempresarial01',
  'FundaciónUniversitaria Empresarial de Colombia',
  'uniempresarial.edu.co',
  'active',
  '2026-01-01',
  '2026-12-31'
);

INSERT INTO users (id, university_id, full_name, email, password_hash, role) VALUES
(
  'cladminrepensa001',
  'cluniempresarial01',
  'Admin Repensa',
  'admin@uniempresarial.edu.co',
  '$2b$10$E1zYbUfaQQr49FfOMSBIe.ossGjfJrhDMvC25yIUOEyHIePqy8zYm',
  'admin'
),
(
  'clmariaestud001',
  'cluniempresarial01',
  'María Rodríguez',
  'maria.rodriguez@uniempresarial.edu.co',
  '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
  'student'
),
(
  'clcarlosestud001',
  'cluniempresarial01',
  'Carlos Mendoza',
  'carlos.mendoza@uniempresarial.edu.co',
  '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
  'student'
),
(
  'clbiblioteca001',
  'cluniempresarial01',
  'Biblioteca Universitaria',
  'biblioteca@uniempresarial.edu.co',
  '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
  'library'
);

INSERT INTO products (
  id, seller_id, university_id, name, description, price, is_donation,
  category, condition, status, image_url, image_public_id
) VALUES
(
  'clprodarduino001',
  'clmariaestud001',
  'cluniempresarial01',
  'Arduino Uno R3',
  'Placa Arduino Uno R3 original. Usada un semestre en robótica. Incluye cable USB.',
  18000,
  FALSE,
  'microcontrollers',
  'good',
  'available',
  'https://res.cloudinary.com/dqlvczepf/image/upload/repensa/products/tarsamrlj3u8r6db8knk',
  'repensa/products/tarsamrlj3u8r6db8knk'
),
(
  'clprodsensor001',
  'clmariaestud001',
  'cluniempresarial01',
  'Sensor HC-SR04',
  'Sensor ultrasónico de distancia. Funciona correctamente.',
  8000,
  FALSE,
  'sensors',
  'good',
  'available',
  'https://res.cloudinary.com/dqlvczepf/image/upload/repensa/products/q729ruf8yahsnok5cbg2',
  'repensa/products/q729ruf8yahsnok5cbg2'
);
