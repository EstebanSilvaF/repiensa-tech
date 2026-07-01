# Backend - Re-Pensa Tech

Este proyecto contiene el backend de la plataforma Re-Pensa Tech, una aplicación universitaria para intercambiar, reservar y vender componentes electrónicos de forma segura y organizada.

## Características principales

- Autenticación y autorización con JWT
- Gestión de usuarios, productos, reservas, chats y transacciones
- Notificaciones internas para eventos del sistema
- Integración con Prisma y PostgreSQL
- WebSockets para chats en tiempo real
- Generación de descripciones de productos con IA (Groq)
- Documentación de API con Swagger / OpenAPI

## Requisitos

- Node.js 20 o superior
- npm
- PostgreSQL

## Instalación

1. Entrar al directorio del backend:

```bash
cd backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` con las variables de entorno necesarias:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/repensa-tech?schema=public"
JWT_SECRET="cambia-esta-clave"
GROQ_API_KEY="tu-api-key"
ENABLE_SWAGGER=true
CORS_ORIGIN="http://localhost:5173"
```

4. Ejecutar las migraciones de la base de datos:

```bash
npm run db:deploy
```

5. (Opcional) Cargar datos iniciales:

```bash
npm run db:seed
```

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Compilar para producción:

```bash
npm run build
```

Iniciar versión compilada:

```bash
npm start
```

## Scripts disponibles

- `npm run dev` — inicia el servidor en modo desarrollo
- `npm run build` — genera la build de TypeScript
- `npm start` — inicia la aplicación compilada
- `npm run test` — ejecuta las pruebas con Vitest
- `npm run db:migrate` — crea y aplica migraciones de Prisma
- `npm run db:deploy` — aplica migraciones existentes
- `npm run db:seed` — carga datos iniciales
- `npm run db:reset` — reinicia la base de datos y vuelve a aplicar migraciones
- `npm run cloudinary:check` — valida la configuración de Cloudinary

## Estructura del proyecto

```text
src/
├── app.ts
├── index.ts
├── application/       # Servicios y jobs de negocio
├── domain/            # Tipos y validaciones del dominio
├── infrastructure/    # Configuración, Prisma, WebSockets y servicios externos
├── presentation/      # Rutas, controladores y middlewares HTTP
├── shared/            # Utilidades compartidas
prisma/                # Esquema de Prisma y seed
Docs/                  # Documentación OpenAPI y referencias del frontend
```

## Documentación de la API

La especificación OpenAPI se encuentra en:

- [docs/openapi.yaml](docs/openapi.yaml)

La documentación interactiva queda disponible en:

```text
http://localhost:3000/api/docs
```

## Notas importantes

- El backend sigue una arquitectura por capas para separar presentación, negocio, dominio e infraestructura.
- Si cambias rutas o contratos de la API, actualiza también la documentación en [docs/openapi.yaml](docs/openapi.yaml).
- Para usar la generación de descripciones con IA, es necesario contar con una clave válida de Groq.
