# Pruebas API con Postman y Newman

Guía para ejecutar las pruebas de integración y contrato de la API Re-Pensa Tech.

## Requisitos

- Backend corriendo en `http://localhost:3000`
- Usuarios de prueba cargados **una vez** con `npm run db:seed --prefix backend`
- Newman instalado en la raíz (`npm install` en el monorepo)

No es necesario ejecutar `db:reset` antes de cada corrida: la colección crea datos nuevos (producto, reserva, chat) en cada ejecución.

## Estructura

```
postman/
├── repensa-local.environment.json   # Entorno local (localhost:3000)
├── repensa-docker.environment.json  # Entorno Docker (backend:3000)
├── schemas/                         # JSON Schemas para validación de contrato
├── fixtures/sample.jpg              # Imagen para upload y generate-description
└── results/                         # Reportes JSON (ignorados por git)

repensa-postman-collection.json      # Colección Postman v2.1 (raíz del repo)
scripts/
├── run-api-tests.js                 # Espera /health y ejecuta Newman
└── generate-postman-collection.js   # Regenera la colección desde schemas
```

## Ejecución automatizada (Newman)

Desde la raíz del monorepo:

```bash
# Pruebas completas (espera a que /health responda)
npm run test:api

# Con reporte JSON
npm run test:api:report

# Dentro de Docker (profile api, requiere backend en compose)
npm run test:api:docker
```

## Importar en Postman (manual)

1. Abrir Postman → **Import**
2. Seleccionar `repensa-postman-collection.json` (raíz del repo)
3. Importar el entorno `postman/repensa-local.environment.json`
4. Activar el entorno **Re-Pensa Local**
5. Ejecutar la colección con **Run collection**

El request **Login Student (María)** guarda automáticamente `token` en las variables de colección.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `baseUrl` | URL del backend | `http://localhost:3000` |
| `studentEmail` / `studentPassword` | Usuario María (seed) | Ver README |
| `carlosEmail` / `carlosPassword` | Usuario Carlos (seed) | Ver README |
| `adminEmail` / `adminPassword` | Usuario admin (seed) | Ver README |
| `skipExternal` | Omitir upload a Cloudinary | `false` |
| `skipGroq` | Omitir generate-description (IA) | `true` |

### Flags opcionales

- **`skipExternal=true`**: salta `POST /api/upload/product-image`. Útil en CI sin credenciales Cloudinary.
- **`skipGroq=true`**: salta `POST /api/products/generate-description`. Por defecto activo porque Groq puede devolver 502 si no está configurado.

Para probar la IA, pon `skipGroq` en `false` y configura `GROQ_API_KEY` en `backend/.env`.

## Flujo de la colección

La colección se ejecuta en orden. Cada carpeta encadena variables:

```
01 Health
02 Auth          → token, adminToken, carlosToken, universityId
03 Universities  → newUniversityId
04 Upload        → image_url (si no se omite)
05 Products      → flowProductId (producto nuevo de Carlos)
06 Reservations  → reserva de María sobre flowProductId
07 Chats         → chat, mensajes, appointment, confirm-delivery
08 Transactions
09 Notifications
10 Cleanup       → omitido (producto vendido tras el flujo)
```

### Validación de contrato

Los tests usan `pm.response.to.have.jsonSchema(...)` o assertions equivalentes contra los schemas en `postman/schemas/`. Esto verifica que las respuestas coincidan con el contrato documentado en `backend/docs/openapi.yaml`.

## Regenerar la colección

Si modificas `scripts/generate-postman-collection.js` o los schemas:

```bash
npm run postman:generate
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` en health | Levantar backend: `npm run dev:backend` o `docker compose up -d backend` |
| Login falla (401) | Ejecutar seed una vez: `npm run db:seed --prefix backend` |
| Upload falla | Verificar `CLOUDINARY_*` en `backend/.env` o usar `skipExternal=true` |
| generate-description 502 | Normal sin Groq; dejar `skipGroq=true` |
| POST producto falla sin upload | La URL de imagen debe ser de tu cuenta Cloudinary; corre upload primero o configura Cloudinary |

## Referencias

- [README principal](../README.md)
- [Guía API frontend](../backend/docs/FRONTEND_API.md)
- [OpenAPI](../backend/docs/openapi.yaml)
