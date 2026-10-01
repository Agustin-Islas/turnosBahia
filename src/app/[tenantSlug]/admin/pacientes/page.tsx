import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PacientesPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const session = await getSession(tenantSlug);
  if (!session?.tenant) {
    redirect('/');
  }

  // Traemos todas las citas para listar el historial de pacientes
  const appointments = await prisma.appointment.findMany({
    where: { tenantId: session.tenant.id },
    include: { service: true, professional: true },
    orderBy: { startTime: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-heading font-bold text-slate-900">Historial de Pacientes</h1>
           <p className="text-slate-500 mt-1">Listado completo de reservas y contactos.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <Input placeholder="Buscar paciente..." className="pl-9 w-full sm:w-64 bg-white" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha del Turno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No hay registros de pacientes aún.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <TableRow key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">
                    {apt.clientName}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    <div className="text-sm">{apt.clientEmail || 'Sin email'}</div>
                    <div className="text-xs">{apt.clientPhone || 'Sin teléfono'}</div>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    <div className="font-medium">{apt.service.name}</div>
                    <div className="text-xs text-slate-500">con {apt.professional.name}</div>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {format(apt.startTime, "dd MMM yyyy, HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      apt.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {apt.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
