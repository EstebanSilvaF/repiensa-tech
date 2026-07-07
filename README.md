# Re-Pensa Tech

Marketplace universitario para comprar, vender y donar hardware electrónico dentro de cada institución.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/REACT-19-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TYPESCRIPT-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/VITE-8-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/EXPRESS-5-000000?style=for-the-badge&logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/POSTGRESQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MONGODB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/PRISMA-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  <img alt="Docker Compose" src="https://img.shields.io/badge/DOCKER_COMPOSE-2496ED?style=for-the-badge&logo=docker&logoColor=white">
</p>

<p align="left">
  <img alt="JWT Auth" src="https://img.shields.io/badge/JWT_AUTH-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white">
  <img alt="Swagger UI" src="https://img.shields.io/badge/SWAGGER_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
  <img alt="Socket.IO" src="https://img.shields.io/badge/SOCKET.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white">
  <img alt="Cloudinary" src="https://img.shields.io/badge/CLOUDINARY-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white">
  <img alt="Groq AI" src="https://img.shields.io/badge/GROQ_AI-F55036?style=for-the-badge&logo=openai&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/VITEST-6E9F18?style=for-the-badge&logo=vitest&logoColor=white">
  <img alt="Cypress" src="https://img.shields.io/badge/CYPRESS-69D3A7?style=for-the-badge&logo=cypress&logoColor=black">
  <img alt="Newman" src="https://img.shields.io/badge/NEWMAN-FF6C37?style=for-the-badge&logo=postman&logoColor=white">
  <img alt="k6" src="https://img.shields.io/badge/K6-7D64FF?style=for-the-badge&logo=grafana&logoColor=white">
  <img alt="SonarQube" src="https://img.shields.io/badge/SONARQUBE-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white">
</p>

Los estudiantes publican productos, reservan con un depósito, coordinan la entrega por chat y registran la transacción en su historial.

---

## Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router, Socket.IO client |
| **Backend** | Node.js, Express 5, TypeScript, capas (presentation / application / domain / infrastructure) |
| **Datos** | PostgreSQL 16 + Prisma (negocio), MongoDB 8 + Mongoose (usuarios y auth) |
| **Integraciones** | JWT, Cloudinary (imágenes), Groq (descripción con IA), Socket.IO (chat en vivo) |
| **Calidad** | Vitest, Newman/Postman, k6, Cypress, SonarQube |

## Arquitectura

```
┌─────────────┐     REST + WebSocket     ┌─────────────┐
│   React     │ ◄──────────────────────► │   Express   │
│  (Vite)     │                          │   API       │
└─────────────┘                          └──────┬──────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
             PostgreSQL                     MongoDB                    Cloudinary / Groq
         (productos, chats,              (usuarios, auth)
          reservas, etc.)
```

## Estructura del monorepo

```
repiensa-tech/
├── frontend/                  # React + Vite
├── backend/                   # Express + Prisma + Mongoose
│   └── docs/                  # FRONTEND_API.md, ARCHITECTURE.md, openapi.yaml
├── postman/                   # Entornos, schemas y fixtures para Newman
├── k6/                        # Pruebas de carga
├── scripts/                   # run-api-tests.js, generate-postman-collection.js
├── docs/                      # Guías adicionales (API testing)
├── repensa-postman-collection.json
├── docker-compose.yml
└── package.json
```

## Requisitos

- **Node.js** 20+
- **npm** 10+
- **Docker** y Docker Compose (recomendado para bases de datos y despliegue local)

## Inicio rápido (Docker)

```bash
# 1. Clonar e instalar dependencias
npm run install:all

# 2. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
# Completar: JWT_SECRET, CLOUDINARY_*, GROQ_API_KEY (opcional para IA)

# 3. Levantar servicios
docker compose up -d postgres mongodb backend frontend

# 4. Cargar datos de prueba (solo la primera vez)
cd backend && npm run db:seed
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/health |
| Swagger UI | http://localhost:3000/api/docs |

## Desarrollo local (sin Docker)

```bash
npm run install:all

# Bases de datos (PostgreSQL + MongoDB deben estar corriendo)
docker compose up -d postgres mongodb

# Variables de entorno
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Migraciones y seed (primera vez)
npm run db:migrate
npm run db:seed --prefix backend

# En terminales separadas
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:5173
```

## Variables de entorno

| Archivo | Variables clave |
|---------|-----------------|
| [`backend/.env.example`](backend/.env.example) | `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `GROQ_API_KEY` |
| [`frontend/.env.example`](frontend/.env.example) | `VITE_API_URL` |

No subas archivos `.env` al repositorio.

## Scripts disponibles

Ejecutar desde la **raíz** del monorepo salvo donde se indique lo contrario.

### Desarrollo y build

| Comando | Descripción |
|---------|-------------|
| `npm run install:all` | Instala dependencias de frontend y backend |
| `npm run dev:frontend` | Servidor de desarrollo del frontend |
| `npm run dev:backend` | Servidor de desarrollo del backend |
| `npm run build` | Build de producción del frontend |
| `npm run build:backend` | Compila el backend (`tsc`) |
| `npm run lint` | ESLint del frontend |

### Base de datos

| Comando | Descripción |
|---------|-------------|
| `npm run db:migrate` | Migraciones de Prisma |
| `npm run db:seed` | Seed coordinado (Mongo + PostgreSQL) |

### Pruebas

| Comando | Descripción |
|---------|-------------|
| `npm test --prefix backend` | Tests unitarios (Vitest) |
| `npm run test:coverage --prefix backend` | Cobertura Vitest |
| `npm run test:api` | Pruebas API con Newman (sin `db:reset`) |
| `npm run test:api:report` | Newman + reporte JSON en `postman/results/` |
| `npm run test:api:docker` | Newman dentro de Docker (profile `api`) |
| `npm run postman:generate` | Regenera `repensa-postman-collection.json` |
| `npm run test:load:smoke` | Smoke test de carga con k6 |
| `npm run test:load` | Prueba de carga completa con k6 |
| `npm run test:e2e` | E2E del frontend con Cypress |

### Calidad (SonarQube)

| Comando | Descripción |
|---------|-------------|
| `npm run sonar:up` | Levanta SonarQube (profile `sonar`) |
| `npm run sonar` | Cobertura + análisis estático |

## Pruebas

### Unitarias (Vitest)

```bash
npm test --prefix backend
```

### API y contrato (Newman / Postman)

Requiere el backend en marcha y usuarios de prueba cargados **una vez** con `db:seed`. No hace falta `db:reset` en cada ejecución: la colección crea datos nuevos en cada corrida.

```bash
npm run test:api
```

Guía detallada: [`docs/API_TESTING.md`](docs/API_TESTING.md).

### Carga (k6)

```bash
docker compose up -d backend
npm run test:load:smoke
```

### E2E (Cypress)

```bash
npm run test:e2e
```

## Documentación

| Recurso | Descripción |
|---------|-------------|
| [`backend/docs/FRONTEND_API.md`](backend/docs/FRONTEND_API.md) | Guía de integración API para el frontend |
| [`backend/docs/ARCHITECTURE.md`](backend/docs/ARCHITECTURE.md) | Arquitectura por capas del backend |
| [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) | Contrato OpenAPI 3 |
| [`frontend/README.md`](frontend/README.md) | Setup y estructura del frontend |
| [`docs/API_TESTING.md`](docs/API_TESTING.md) | Pruebas API con Postman y Newman |
| [`repensa-postman-collection.json`](repensa-postman-collection.json) | Colección Postman importable |
| Swagger UI | http://localhost:3000/api/docs (con backend en marcha) |

## Datos de prueba (seed)

Cargar una vez con `npm run db:seed --prefix backend`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Estudiante | `maria.rodriguez@uniempresarial.edu.co` | `Estudiante1!` |
| Estudiante | `carlos.mendoza@uniempresarial.edu.co` | `Estudiante1!` |
| Admin | `admin@uniempresarial.edu.co` | `Admin1!` |

Universidad demo: **Universitaria Empresarial** (`uniempresarial.edu.co`).

## Licencia

Proyecto privado — ver repositorio para detalles.
