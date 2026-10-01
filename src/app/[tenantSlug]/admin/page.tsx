import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CalendarView } from "@/components/CalendarView";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const session = await getSession(tenantSlug);
  if (!session?.tenant) {
    redirect('/');
  }

  // 1. Traemos las citas de la DB para este tenant
  const appointmentsData = await prisma.appointment.findMany({
    where: { tenantId: session.tenant.id },
    include: { professional: true, service: true }
  });

  // Mapeamos los datos de la DB al formato que requiere `react-big-calendar`
  const events = appointmentsData.map((apt) => ({
    id: apt.id,
    title: apt.service.name,
    start: apt.startTime,
    end: apt.endTime,
    professionalId: apt.professionalId,
    professionalName: apt.professional.name,
    status: apt.status,
    clientName: apt.clientName,
    clientEmail: apt.clientEmail,
    clientPhone: apt.clientPhone,
    serviceName: apt.service.name
  }));

  // 2. Traemos los profesionales para poder filtrar en el calendario
  const professionals = await prisma.professional.findMany({
    where: { tenantId: session.tenant.id },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-heading font-bold text-slate-900">Agenda Principal</h1>
           <p className="text-slate-500 mt-1">Gestiona los turnos de todos tus profesionales.</p>
        </div>
      </div>
      
      {/* Wrapper del Calendario ocupando el resto del alto */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-4">
         <CalendarView events={events} professionals={professionals} />
      </div>
    </div>
  );
}
