# Re-Pensa Tech

Monorepo del marketplace universitario **Re-Pensa Tech**.

## Estructura

```
repiensa-tech/
├── frontend/   # React + Vite
├── backend/    # Express + Prisma + PostgreSQL
└── package.json
```

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL (para el backend)

## Instalación

```bash
npm run install:all
```

Configura las variables de entorno:

- `frontend/.env` — copia desde `frontend/.env.example`
- `backend/.env` — copia desde `backend/.env.example`

## Desarrollo

Desde la raíz del monorepo:

```bash
# Solo frontend (http://localhost:5173)
npm run dev:frontend

# Solo backend (http://localhost:3000)
npm run dev:backend
```

También puedes entrar a cada carpeta y usar `npm run dev` directamente.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:frontend` | Servidor de desarrollo del frontend |
| `npm run dev:backend` | Servidor de desarrollo del backend |
| `npm run build` | Build de producción del frontend |
| `npm run lint` | ESLint del frontend |
| `npm run db:migrate` | Migraciones de Prisma |
| `npm run db:seed` | Seed de la base de datos |
