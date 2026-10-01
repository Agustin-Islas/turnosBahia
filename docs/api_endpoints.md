# Documentación de Endpoints API (Fase 2)

Todos los endpoints están protegidos por el sistema de sesión simulada en `src/lib/auth.ts`, el cual valida el acceso e inyecta el `tenantId` para el aislamiento de datos (Row Level Security lógico).

## 1. Endpoints Base (CRUD)

### `GET /api/services`
Retorna todos los servicios pertenecientes al Tenant actual.
### `POST /api/services`
Crea un nuevo servicio. Requiere: `name`, `durationMinutes`, `price`.

### `GET /api/professionals`
Retorna todos los profesionales del Tenant, incluyendo sus horarios base (`schedules`) y excepciones (`timeOffs`).
### `POST /api/professionals`
Crea un profesional. Requiere: `name`.

---

## 2. Motor de Turnos

### `GET /api/availability`
Es el puente entre el cliente frontend y el Algoritmo de Disponibilidad.
- **Parámetros (Query):**
  - `professionalId`: (UUID)
  - `serviceId`: (UUID) 
  - `date`: (YYYY-MM-DD)
- **Comportamiento:** Busca el servicio, el horario base del profesional, sus citas del día, sus ausencias, y devuelve el listado de `slots` (ej: `[{ time: "09:00", available: true }, ...]`).

### `GET /api/appointments`
Lista todas las citas del negocio, útil para el Panel de Administración. Devuelve también datos anidados del profesional y del servicio.
### `POST /api/appointments`
Registra un nuevo turno.
- **Body:** `professionalId`, `serviceId`, `startTime`, `endTime`, `clientName`, `clientEmail`, `clientPhone`.
- **Estado Inicial:** `PENDING`.
