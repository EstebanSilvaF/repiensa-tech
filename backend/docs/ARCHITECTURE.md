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
│   └── persistence/
│       ├── prisma.ts
│       └── repositories/
├── shared/                # Utilidades transversales
│   ├── utils/
│   └── validation/        # Motor assertValid (Specification)
├── app.ts
└── index.ts
```

## Flujo de dependencias

```
routes → controllers → services → repositories → prisma → PostgreSQL
```

Cada capa solo depende de la capa inmediatamente inferior.

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
