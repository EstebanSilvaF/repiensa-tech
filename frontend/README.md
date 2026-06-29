# Re-Pensa Tech — Frontend

Frontend de **Re-Pensa Tech**: marketplace universitario para comprar, vender y donar hardware electrónico dentro de cada institución.

Stack: React 19, TypeScript, Vite, React Router.

## Requisitos

- Node.js 20+
- npm 10+
- Backend corriendo en `http://localhost:3000` (ver `docs/FRONTEND_API.md`)

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Desarrollo |
|----------|-------------|------------|
| `VITE_API_URL` | Base URL de la API | `/api` (usa el proxy de Vite) |

En producción, apuntar a la URL real del backend:

```env
VITE_API_URL=https://api.tu-dominio.com/api
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |

## Estructura

```
frontend/
├── docs/FRONTEND_API.md   # Guía de integración con el backend
├── src/
│   ├── api/               # Cliente y servicios HTTP
│   ├── components/
│   ├── context/           # Auth
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── types/
│   └── utils/
├── public/
└── package.json
```

En desarrollo, Vite hace proxy de `/api`, `/health` y `/socket.io` hacia `localhost:3000`.
