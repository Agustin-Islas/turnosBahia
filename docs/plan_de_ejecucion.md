# Plan de Ejecución: Sistema de Turnos Multi-Tenant (SaaS)

## Metodología y Estándares
Este plan se basa en el documento fundacional [PRD_Sistema_Turnos.md](../PRD_Sistema_Turnos.md) e incorpora los estándares de calidad más altos exigidos por las **rules locales** (`frontend-design.md`, `impecable.md`, `ui-pro-max.md`) y las **skills** de diseño UI/UX (ej. `web-design`, `high-end-visual-design`, `stitch-design-taste`). El objetivo es lograr un producto robusto a nivel de sistema y visualmente excepcional.

---

## Fases de Ejecución

### Fase 1: Fundamentos y Arquitectura de Datos
- [x] **1.1 Inicialización del Repositorio:**
  - Crear proyecto Next.js (App Router) + TypeScript.
  - Instalar Tailwind CSS y configurar variables globales orientadas a un diseño premium (referencia a `frontend-design.md`).
  - Instalar dependencias base (`shadcn/ui`, `lucide-react`, `date-fns`, etc.).
- [x] **1.2 Setup de Base de Datos y Autenticación:**
  - Configurar proyecto en Supabase.
  - Habilitar Supabase Auth (Email/Contraseña + Magic Link).
  - Definir esquema en Prisma o Drizzle ORM (Tablas: `Tenant`, `User`, `Service`, `Professional`, `Schedule`, `TimeOff`, `Appointment`).
- [ ] **1.3 Políticas de Seguridad (RLS):**
  - Implementar Row-Level Security (RLS) en Supabase para garantizar el aislamiento de datos por `tenant_id`.
- [ ] **Hito 1:** Validar inicio de sesión y creación de esquema. Documentar estructura en `/docs/database_schema.md`.

### Fase 2: Motor Core de Turnos (Backend)
- [x] **2.1 Endpoints de Gestión de Agendas:**
  - CRUD para Servicios, Profesionales, `Schedule` (disponibilidad estándar) y `TimeOff` (excepciones).
- [x] **2.2 Algoritmo de Disponibilidad (El Core):**
  - Desarrollar la lógica que reciba `(fecha, professional_id, service_id)`.
  - Calcular bloques libres cruzando: `Schedule`, `Appointments` existentes, `TimeOff` y la duración del `Service`.
- [x] **2.3 Gestión de Citas (Appointments):**
  - Endpoints seguros para crear, leer, actualizar estados (confirmar, cancelar, no asistió).
- [ ] **Hito 2:** Pruebas unitarias o de API para verificar el algoritmo anti double-booking.

### Fase 3: Frontend Público (Vista de Pacientes)
*Nota: Aplicar intensivamente las reglas de UI (`ui-pro-max.md`, `impecable.md`).*
- [x] **3.1 Landing de Captación del Tenant:**
  - Desarrollo de UI tipo "Bento Box", con uso de Glassmorphism, jerarquía visual clara y espaciado generoso.
- [x] **3.2 Flujo de Reserva Interactivo:**
  - Paso 1 & 2: Selección de Servicio y Profesional con tarjetas interactivas (estados hover suaves).
  - Paso 3 & 4: Selector de Fecha (Date picker) y Horario (consumiendo el Algoritmo de Disponibilidad).
  - Paso 5: Formulario de contacto (validado con Zod) usando anillos de foco limpios (A11y).
- [ ] **Hito 3:** UI/UX Review. Revisión de animaciones, alineación pixel-perfect y estados de error/carga hermosos.

### Fase 4: Panel de Administración (SaaS Dashboard)
- [x] **4.1 Layout Multi-Tenant Seguro:**
  - Navegación lateral (sidebar) y barra superior. 
  - Manejo de estados de carga con *Skeletons* (no spinners) e ilustraciones de "Empty States".
- [x] **4.2 Integración de Calendario Visual:**
  - Implementar `react-big-calendar` (o equivalente moderno) para la vista diaria/semanal.
  - Habilitar Drag & Drop para reprogramaciones fluidas.
- [x] **4.3 Gestión Operativa del Negocio:**
  - Vistas administrativas de recepcionistas/dueños para manipular turnos, servicios y bloqueos de agenda.
- [x] **Hito 4:** Mobile First Review. Asegurar usabilidad del dashboard en dispositivos móviles.

### Fase 5: Notificaciones y Automatizaciones
- [ ] **5.1 Sistema de Emails Transaccionales:**
  - Configurar Resend + React Email.
  - Diseñar templates de Confirmación, Recordatorio y Cancelación.
- [ ] **5.2 Triggers y Cron Jobs:**
  - Edge Functions o Webhooks en Supabase para enviar email post-reserva.
  - Configurar Cron Job diario para buscar turnos de mañana y enviar recordatorio de 24h.
- [ ] **Hito 5:** End-to-End workflow completado y testeado con notificaciones reales.

### Fase 6: Lanzamiento
- [ ] **6.1 Despliegue:**
  - Setup en Vercel.
  - Verificación de variables de entorno de producción.
- [ ] **6.2 Documentación Final:**
  - Actualización del directorio `/docs` con guías de operación o traspaso.

---

## Archivos en la Carpeta `/docs`
Se utilizará este directorio para mantener la organización de la documentación generada durante la ejecución:
1. `plan_de_ejecucion.md` (Este documento, servirá de tracker).
2. `database_schema.md` (Se creará en la Fase 1).
3. `api_endpoints.md` (Se creará en la Fase 2).

---

## Historial de Decisiones Arquitectónicas y Progreso (Actualizado)
En las sesiones más recientes se ha implementado la infraestructura principal del SaaS Multi-Tenant y el Booking Core:

1. **Ruteo Dinámico Multi-Tenant (`/[tenantSlug]`)**:
   - Se migró el panel de administración a `/[tenantSlug]/admin` para aislar contextos.
   - El acceso público por clínica se hace desde la raíz del slug (ej. `localhost:3001/clinica-las-lomas`).
   - El SuperAdmin (raíz `/superadmin`) gestiona N clínicas. La URL raíz `/` es ahora una Landing de presentación del SaaS.

2. **Refactorización de Sesión (`getSession`)**:
   - Se removió el mock hardcodeado por defecto (`clinica-las-lomas`). La sesión ahora depende estrictamente de recibir el `tenantSlug` (extraído dinámicamente de la URL) para inyectar los datos correctos o bloquea el acceso devolviendo 401/404.

3. **Catálogo Maestro + Especialización (Pivot Table)**:
   - Para resolver el hecho de que "no todos los profesionales ofrecen todos los servicios al mismo precio", se implementó el modelo `ProfessionalService`.
   - Se actualizaron los endpoints y UI (Admin > Configuración) para que el administrador pueda asignar qué médico hace qué, permitiendo *overrides* de precio (`customPrice`) y duración (`customDuration`).
   - El flujo público de reserva (`BookingFlow`) filtra interactivamente los profesionales basándose en el servicio seleccionado.

4. **Booking Flow & Motor de Disponibilidad**:
   - Se migró la ingesta de datos públicos (`TenantLandingPage`) a *Server Components* para rendimiento y SEO, pasando la data inicial como props al `BookingFlow`.
   - **Bloqueo Visual de Días:** El `Calendar` ahora desactiva automáticamente los días de la semana (0-6) en los que el médico seleccionado no tiene un horario (`Schedule`) asignado.
   - **Fix Timezones:** Se corrigió un bug en `/api/availability` donde `new Date('YYYY-MM-DD')` generaba fechas en medianoche UTC, lo que localmente desplazaba la consulta al día anterior. Se usa ahora split explícito local (`new Date(year, month-1, day)`).
   - **Anti Double-Booking:** Se incorporó protección contra condición de carrera a nivel de BD en `POST /api/appointments`, validando en milisegundos finales si el slot sigue libre antes de persistir la cita, devolviendo `409 Conflict` en caso de superposición.

**Siguientes pasos recomendados**: Integrar Supabase Auth real para proteger las rutas, y comenzar con la vista de Calendario Interno para el administrador (`react-big-calendar`).
