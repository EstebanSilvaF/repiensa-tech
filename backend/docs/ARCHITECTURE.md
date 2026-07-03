# Arquitectura por Capas — backend-repensatech

## Estructura

```
src/
├── presentation/          # Capa de presentación (HTTP)
│   ├── routes/
│   ├── controllers/
│   └── middlewares/
├── application/           # Capa de aplicación / negocio
│   ├── services/
│   └── jobs/              # Tareas programadas (cron)
├── domain/                # Contratos y tipos del dominio
│   ├── types/
│   └── validators/        # Reglas de negocio (Specification)
│       └── shared/        # Reglas reutilizables entre módulos
├── infrastructure/        # Capa de infraestructura
│   ├── config/
│   │   ├── cors.ts
│   │   ├── env.ts
│   │   └── swagger.ts     # Swagger UI (lee docs/openapi.yaml)
│   └── persistence/
│       ├── prisma.ts
│       ├── mongo/
│       │   ├── connection.ts
│       │   └── models/
│       │       └── user.model.ts
│       └── repositories/
├── shared/                # Utilidades transversales
│   ├── utils/
│   └── validation/        # Motor assertValid (Specification)
├── app.ts
└── index.ts
```

## Flujo de dependencias

```
routes → controllers → services → repositories → prisma / mongoose → PostgreSQL / MongoDB
```

Cada capa solo depende de la capa inmediatamente inferior.

### Persistencia dual

| Datos | Motor | Acceso |
|-------|-------|--------|
| Usuarios y autenticación | MongoDB | `userRepository` (Mongoose) |
| Resto del dominio | PostgreSQL | Repositorios Prisma |

```
services → userRepository → MongoDB
services → otros repositories → PostgreSQL (Prisma)
services → user-profile.helper → une datos en memoria
```

Los IDs de usuario en PostgreSQL (`seller_id`, `buyer_id`, `user_id`, `sender_id`) son strings que referencian documentos MongoDB. No hay FKs cruzadas; el enriquecimiento (nombres, emails) se hace en la capa de aplicación.

## Responsabilidades

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| Presentación | `presentation/` | HTTP, auth, validación de formato, `asyncHandler`, `errorHandler` |
| Aplicación | `application/` | Reglas de negocio y orquestación |
| Dominio | `domain/` | DTOs, tipos, contratos |
| Infraestructura | `infrastructure/` | BD, config, servicios externos |
| Compartido | `shared/` | Helpers sin lógica de negocio |

## Patrones aplicados

- **Layered Architecture** — separación en capas horizontales
- **Repository** — abstracción del acceso a datos
- **Service Layer** — lógica de negocio centralizada
- **DTO** — tipos de entrada/salida en `domain/types/`
- **Specification (validación)** — reglas de dominio en `domain/validators/` con `assertValid()` en `shared/validation/`

## Convención de validators

| Ubicación | Qué va aquí |
|-----------|-------------|
| `domain/validators/shared/` | Reglas reutilizables: producto existe, acceso al chat, campos requeridos |
| `domain/validators/*.validator.ts` | Reglas de caso de uso específico que componen las shared |

Ejemplo: `chat.validator.ts` importa `chatExistsRule` y `productExistsRule` de `shared/` y agrega solo reglas propias del flujo (estado del chat, entrega confirmada).

## Documentación de la API (Swagger / OpenAPI)

La especificación vive en **`docs/openapi.yaml`** (formato OpenAPI 3). No se mezcla con controllers ni routes para mantener la capa de presentación limpia.

| Pieza | Ubicación | Rol |
|-------|-----------|-----|
| Especificación | `docs/openapi.yaml` | Contrato de endpoints, schemas y seguridad |
| Guía frontend | `docs/FRONTEND_API.md` | Flujos de negocio, ejemplos React, WebSockets |
| UI interactiva | `infrastructure/config/swagger.ts` | Sirve Swagger UI en `/api/docs` |

### Cómo ver la documentación

Con el backend en desarrollo:

```
http://localhost:3000/api/docs
```

En producción Swagger está **desactivado por defecto**. Para habilitarlo:

```env
ENABLE_SWAGGER=true
```

### Cómo mantenerla al día

1. Agregar o modificar un endpoint en `presentation/routes/`.
2. Actualizar el path correspondiente en `docs/openapi.yaml`.
3. Si cambian DTOs, actualizar `components/schemas` en el mismo archivo.
4. Opcional: reflejar el cambio en `FRONTEND_API.md` si afecta al frontend.

### Probar endpoints autenticados

1. Ejecutar `POST /api/auth/login` desde Swagger UI.
2. Copiar el `token` de la respuesta.
3. Clic en **Authorize** y pegar: `Bearer <token>` (Swagger agrega el prefijo si solo pegas el token en algunos casos — usar el formato `Bearer eyJ...`).

