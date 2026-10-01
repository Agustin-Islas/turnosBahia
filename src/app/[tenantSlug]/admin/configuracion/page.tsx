import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, UserCircle, Stethoscope } from "lucide-react";
import prisma from "@/lib/prisma";
import { ServiceDialog } from "./ServiceDialog";
import { ProfessionalDialog } from "./ProfessionalDialog";
import { deleteServiceAction, deleteProfessionalAction } from "./actions";

export default async function ConfiguracionPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const session = await getSession(tenantSlug);
  if (!session?.tenant) {
    redirect('/');
  }

  const rawServices = await prisma.service.findMany({ 
    where: { tenantId: session.tenant.id } 
  });
  
  const rawProfessionals = await prisma.professional.findMany({
    where: { tenantId: session.tenant.id },
    include: { schedules: true, services: true }
  });

  const services = rawServices.map(s => ({
    ...s,
    price: s.price !== null ? Number(s.price) : null
  }));

  const professionals = rawProfessionals.map(p => ({
    ...p,
    services: p.services.map(ps => ({
      ...ps,
      customPrice: ps.customPrice !== null ? Number(ps.customPrice) : null
    }))
  }));

  const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="max-w-5xl space-y-8 pb-10">
      <div>
         <h1 className="text-3xl font-heading font-bold text-slate-900">Configuración de la Clínica</h1>
         <p className="text-slate-500 mt-1">Administra los detalles de tu clínica, servicios y horarios del equipo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Ajustes Generales */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
              <section className="space-y-4">
                 <h2 className="text-lg font-heading font-semibold text-slate-800">
                   Detalles del Negocio
                 </h2>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenantName">Nombre del Consultorio</Label>
                      <Input id="tenantName" defaultValue="Clínica Las Lomas" className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenantSlug">Identificador Único (URL)</Label>
                      <Input id="tenantSlug" defaultValue="clinica-las-lomas" className="bg-slate-50" disabled />
                    </div>
                 </div>
              </section>
              <Button className="w-full">Guardar Cambios</Button>
           </div>
        </div>

        {/* Columna Derecha: Servicios y Profesionales */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* SECCIÓN DE SERVICIOS */}
           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-lg font-heading font-semibold text-slate-800 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" /> Servicios y Tratamientos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Configura lo que ofreces y su duración.</p>
                 </div>
                 <ServiceDialog tenantId={session.tenant.id} />
              </div>
              <div className="divide-y divide-slate-100">
                 {services.map(service => (
                   <div key={service.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                         <h3 className="font-semibold text-slate-800">{service.name}</h3>
                         <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {service.durationMinutes} min</span>
                            {service.price !== null && (
                               <span className="font-medium text-slate-700">${Number(service.price)}</span>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <ServiceDialog tenantId={session.tenant.id} service={service} />
                         <form action={deleteServiceAction.bind(null, service.id)}>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                             Eliminar
                           </Button>
                         </form>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* SECCIÓN DE PROFESIONALES Y HORARIOS */}
           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-lg font-heading font-semibold text-slate-800 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-blue-600" /> Profesionales y Horarios
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gestiona la agenda de tu equipo médico.</p>
                 </div>
                 <ProfessionalDialog tenantId={session.tenant.id} allServices={services} />
              </div>
              <div className="divide-y divide-slate-100">
                 {professionals.map(prof => (
                   <div key={prof.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-semibold text-slate-900 text-lg">{prof.name}</h3>
                         <div className="flex items-center gap-2">
                           <ProfessionalDialog tenantId={session.tenant.id} professional={prof} allServices={services} />
                           <form action={deleteProfessionalAction.bind(null, prof.id)}>
                             <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                               Eliminar
                             </Button>
                           </form>
                         </div>
                      </div>
                      
                      {/* Grilla de Horarios del Profesional */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {prof.schedules.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(sch => (
                          <div key={sch.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                               {daysMap[sch.dayOfWeek]}
                             </div>
                             <div className="text-sm font-medium text-slate-800">
                               {sch.startTime} - {sch.endTime}
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
