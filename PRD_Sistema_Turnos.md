# PRD: Sistema de Turnos Multi-Tenant (SaaS)

## 1. Visión General del Proyecto
Plataforma SaaS (Software as a Service) para la gestión integral de reservas y turnos, orientada a consultorios médicos, clínicas, centros de estética y profesionales independientes. El sistema permite a los negocios gestionar sus agendas y a sus clientes reservar turnos online las 24 horas.

## 2. Stack Tecnológico y Arquitectura
*   **Patrón de Arquitectura:** Multi-tenant con separación lógica (Row-Level Security por `tenant_id`).
*   **Frontend y Backend (Fullstack):** Next.js (App Router) con TypeScript.
*   **Base de Datos:** PostgreSQL.
*   **ORM:** Prisma (recomendado por velocidad de prototipado y tipado estricto) o Drizzle ORM.
*   **Estilos:** Tailwind CSS.
*   **Infraestructura (Hosting):**
    *   **Código:** Vercel.
    *   **Datos y Auth:** Supabase (Provee PostgreSQL, Autenticación, Row Level Security y Storage).
*   **Comunicaciones (Emails):**
    *   *Fase MVP (Desarrollo):* Resend + React Email.
    *   *Fase Producción (Escalado):* Amazon SES o Brevo (para reducir costos a $0 o centavos).

## 3. Componentes y Librerías Pre-implementadas (No reinventar la rueda)
1.  **shadcn/ui:** Interfaz gráfica. Se importarán los componentes: `Button`, `Dialog` (Modales), `Form`, `Input`, `Select`, `Calendar` (DatePicker), `DataTable`, `Toast` (Notificaciones UI).
2.  **react-big-calendar / @fullcalendar/react:** Motor de renderizado visual del calendario para el panel administrativo (vistas de día, semana, mes, drag & drop).
3.  **React Hook Form + Zod:** Gestión de estado de formularios y validación estricta de tipos de datos.
4.  **date-fns:** Manipulación, formato y cálculos matemáticos de fechas y horas (indispensable para las zonas horarias).

---

## 4. Actores y Roles del Sistema (RBAC)
1.  **Superadmin (Desarrollador):** Gestiona las suscripciones, da de alta nuevos "Tenants" (negocios/clínicas) y ve métricas globales.
2.  **Tenant Admin / Dueño:** Tiene acceso total a su clínica. Puede configurar horarios del negocio, agregar servicios, dar de alta profesionales y recepcionistas.
3.  **Recepcionista:** Puede ver y modificar la agenda de todos los profesionales de la clínica. Confirma asistencias, cobra y cancela turnos.
4.  **Profesional (Médico/Estilista):** Solo tiene acceso a su propio calendario. Puede bloquear horarios (feriados/vacaciones) y ver quién es su próximo cliente.
5.  **Cliente / Paciente:** Entra a la vista pública (`tu-app.com/clinica-las-lomas`), selecciona servicio, horario y reserva.

---

## 5. Diseño de Base de Datos (Entidades Core)
Para mantener el multi-tenant seguro, casi todas las tablas llevarán la columna `tenant_id`.

*   `Tenant`: id, nombre, slug (ej: clinica-lomas), logo_url, configuracion_dias.
*   `User`: id, email, rol, tenant_id.
*   `Service`: id, nombre, descripcion, duracion_minutos, precio, tenant_id.
*   `Professional`: id, nombre, user_id (opcional), tenant_id.
*   `Schedule (Horarios)`: id, professional_id, dia_semana (0-6), hora_inicio, hora_fin.
*   `TimeOff (Bloqueos)`: id, professional_id, fecha_inicio, fecha_fin, motivo.
*   `Appointment (Turno)`: id, tenant_id, professional_id, service_id, fecha_hora_inicio, fecha_hora_fin, cliente_nombre, cliente_email, cliente_telefono, estado (pendiente, confirmado, completado, cancelado, ausente).

---

## 6. Detalle de Funcionalidades a Implementar

### Módulo 1: Onboarding y Autenticación (Supabase Auth)
*   **Login/Registro:** Autenticación por Email/Contraseña y enlace mágico (Magic Link) para recepcionistas y profesionales.
*   **Ruteo Multi-tenant:** El sistema detecta a qué clínica pertenece el usuario logueado y carga solo esa información mediante RLS (Row Level Security) en Supabase.

### Módulo 2: Configuración del Negocio (Panel Admin)
*   **CRUD de Servicios:** Crear, editar y eliminar servicios definiendo su duración exacta (ej: Consulta - 30 min).
*   **Gestión de Equipo:** Agregar profesionales y asignarles qué servicios pueden realizar.
*   **Configuración de Agenda Estándar:** Definir los días y horarios en los que atiende cada profesional.

### Módulo 3: Motor de Disponibilidad (Lógica Backend)
*Esta es la funcionalidad más crítica. Debe ser un endpoint de la API.*
*   **Cálculo de Slots:** El sistema debe recibir una fecha y un profesional, y devolver un array de horarios disponibles (ej: `["10:00", "10:30", "11:00"]`).
*   **Reglas del algoritmo:**
    1. Leer el `Schedule` del profesional para ese día.
    2. Restar (excluir) los turnos ya existentes (`Appointments`).
    3. Restar los bloqueos excepcionales (`TimeOff`).
    4. Considerar la duración del servicio seleccionado para asegurar que "entra" en el bloque de tiempo.

### Módulo 4: Flujo de Reserva Público (Para el Cliente)
*   **Landing del Tenant:** Página pública accesible vía URL única (ej: `/reservar/dr-agustin`).
*   **Paso 1:** Selección de Servicio.
*   **Paso 2:** Selección de Profesional (o asignar el primero disponible).
*   **Paso 3:** Selector de Fecha (Date picker).
*   **Paso 4:** Selector de Horario (solo muestra los calculados por el Motor de Disponibilidad).
*   **Paso 5:** Formulario de contacto (Nombre, Teléfono, Email).
*   **Paso 6:** Pantalla de Éxito.

### Módulo 6: Dashboard y Calendario (Para Recepción/Profesionales)
*   **Vista Calendario:** Integración de `react-big-calendar`. Vista semanal y diaria.
*   **Operaciones Rápidas:**
    *   Drag & drop para reprogramar un turno (actualiza la BD al soltar).
    *   Hacer clic en un turno para cambiar el estado (Confirmó, Llegó, No Asistió).
    *   Botón para "Crear Turno Manual" (si el cliente llama por teléfono).
*   **Filtros:** Ver calendario de "Todos" o filtrar por un profesional específico.

### Módulo 7: Sistema de Notificaciones Automáticas
*   **Trigger en BD:** Cuando se crea un registro en `Appointment`, Supabase gatilla un Webhook o Edge Function.
*   **Envío de Email (Resend -> Amazon SES):**
    *   *Confirmación:* Inmediata al reservar (detalles del turno y dirección).
    *   *Recordatorio:* Un cron job diario que busque turnos de mañana y envíe un email de recordatorio 24h antes.
    *   *Cancelación:* Si la clínica cancela, se avisa al paciente.

---

## 7. Fases de Desarrollo (Roadmap de Ejecución)

*   **Fase 1: Setup y Base de Datos (Días 1-3)**
    *   Inicializar Next.js + Tailwind + shadcn.
    *   Crear proyecto en Supabase, definir tablas (esquema SQL/Prisma) y habilitar RLS.
*   **Fase 2: Lógica de Backend y Motor de Turnos (Días 4-7)**
    *   Programar el algoritmo de "Obtener Horarios Disponibles" (el corazón del sistema).
    *   Crear endpoints para crear, leer y cancelar turnos.
*   **Fase 3: Frontend Público (Días 8-10)**
    *   Armar el flujo de reserva (los 6 pasos).
    *   Conectar el formulario con la API.
*   **Fase 4: Panel de Administración (Días 11-15)**
    *   Integrar Supabase Auth.
    *   Implementar `react-big-calendar`.
    *   Armar CRUD de Servicios y Profesionales.
*   **Fase 5: Emails y Testing (Días 16-18)**
    *   Integrar Resend y diseñar plantillas con React Email.
    *   Pruebas de concurrencia (asegurar que no haya double-booking).
*   **Fase 6: Lanzamiento y Migración de Infraestructura**
    *   Desplegar en Vercel.
    *   A futuro: Cambiar credenciales de Resend por Amazon SES cuando el volumen lo requiera.
