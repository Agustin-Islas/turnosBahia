# Esquema de Base de Datos (PostgreSQL + Prisma)

Este documento describe la estructura central para soportar un SaaS multi-tenant con Supabase.

## Arquitectura Multi-Tenant
Todas las entidades clave (`Service`, `Professional`, `Appointment`) están aisladas mediante la foreign key `tenantId`. En Supabase, esto se complementará con políticas **Row-Level Security (RLS)** que verificarán que el `auth.uid()` pertenezca al `tenant_id` en cuestión.

## Modelos Principales

### 1. `Tenant`
Representa a las clínicas, consultorios o negocios.
- Campos: `id`, `name`, `slug` (único para la URL), `logoUrl`, `configuracionDias`.

### 2. `User`
Administra el RBAC (Role-Based Access Control). Su `id` mapea directamente al User ID de Supabase Auth.
- Roles: `SUPERADMIN`, `TENANT_ADMIN`, `RECEPTIONIST`, `PROFESSIONAL`, `CLIENT`.
- Campos críticos: `email`, `role`, `tenantId`.

### 3. `Service`
Los servicios que ofrece un Tenant.
- Campos: `durationMinutes` (usado por el motor de cálculo), `price`, `tenantId`.

### 4. `Professional`
Médicos, estilistas, etc. Pueden (o no) tener un usuario en el sistema.
- Relaciona a: `User` (1:1 opcional), `Tenant` (1:N).

### 5. `Schedule`
Horario recurrente de cada profesional.
- Campos: `dayOfWeek` (0 a 6), `startTime` ("09:00"), `endTime` ("18:00").

### 6. `TimeOff`
Bloqueos o ausencias excepcionales del profesional.
- Campos: `startDate`, `endDate`, `reason`.

### 7. `Appointment` (Citas)
La entidad transaccional. Cruza todas las demás tablas.
- Referencias: `tenantId`, `professionalId`, `serviceId`.
- Estados: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
