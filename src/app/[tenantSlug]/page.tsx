import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { BookingFlow } from "@/components/BookingFlow";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TenantLandingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolvedParams.tenantSlug },
    include: {
      services: true,
      professionals: { include: { services: true, schedules: true } }
    }
  });

  if (!tenant) {
    return notFound();
  }

  const serializedServices = tenant.services.map(s => ({
    ...s,
    price: s.price !== null ? Number(s.price) : null
  }));

  const serializedProfessionals = tenant.professionals.map(p => ({
    ...p,
    services: p.services.map(ps => ({
      ...ps,
      customPrice: ps.customPrice !== null ? Number(ps.customPrice) : null
    }))
  }));

  return (
    <main className="h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6 font-sans relative overflow-hidden flex flex-col">
      
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-6xl w-full mx-auto h-full flex flex-col relative z-10 gap-6">
        {/* Header / Hero */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 mt-2">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">
              {tenant.name}
            </h1>
            <p className="text-base text-slate-600 max-w-xl font-light tracking-wide">
              {tenant.description}
            </p>
          </div>
        </header>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0 pb-2">
          
          {/* Card 1: Main CTA / Booking Flow Placeholder */}
          <div className="md:col-span-2 md:row-span-2 relative overflow-y-auto rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-6 md:p-8 shadow-xl shadow-slate-200/50 flex flex-col group scrollbar-hide">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Calendar className="w-24 h-24" />
            </div>
            
            <div className="space-y-3 relative z-10 shrink-0">
              <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-[10px] tracking-widest uppercase">
                Disponibilidad Inmediata
              </span>
              <h2 className="font-heading text-3xl font-bold text-slate-800 tracking-tight leading-tight">
                Tu salud no puede esperar.
              </h2>
              <p className="text-slate-500 text-sm max-w-sm">
                Elige el profesional, selecciona el servicio y asegura tu turno en menos de 2 minutos.
              </p>
            </div>
            
            <div className="relative z-10 mt-4 pt-4 border-t border-slate-200/50 flex-1">
               <BookingFlow 
                  tenantId={tenant.id} 
                  initialServices={serializedServices} 
                  initialProfessionals={serializedProfessionals} 
               />
            </div>
          </div>

          {/* Card 2: Especialidades */}
          <div className="md:col-span-2 rounded-3xl bg-slate-900 text-white p-6 shadow-xl flex flex-col justify-center">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold tracking-tight">Especialidades</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div> Odontología General
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div> Ortodoncia Estética
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div> Implantes Dentales
                </li>
              </ul>
            </div>
          </div>
          
          {/* Card 3: Info */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-6 shadow-lg shadow-slate-200/50 flex flex-col justify-center">
             <h3 className="font-heading text-lg font-bold text-slate-800 mb-2 tracking-tight">Ubicación</h3>
             <p className="text-slate-500 text-sm leading-relaxed">
               📍 Av. Libertador 1234<br/>
               CABA, Argentina
             </p>
          </div>

          {/* Card 4: Horarios */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-6 shadow-lg shadow-slate-200/50 flex flex-col justify-center">
             <h3 className="font-heading text-lg font-bold text-slate-800 mb-2 tracking-tight">Horarios</h3>
             <p className="text-slate-500 text-sm leading-relaxed">
               Lunes a Viernes<br/>
               09:00 — 18:00
             </p>
          </div>

        </div>
      </div>
    </main>
  );
}
