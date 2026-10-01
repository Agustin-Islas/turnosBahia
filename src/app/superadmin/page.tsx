import prisma from "@/lib/prisma";
import Link from "next/link";
import { TenantDialog } from "./TenantDialog";
import { deleteTenantAction } from "./actions";

export default async function SuperAdminDashboard() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: { professionals: true, appointments: true }
      }
    }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-heading font-bold text-white">Vista General</h1>
            <p className="text-slate-400 mt-1">Métricas de alto nivel de tu plataforma SaaS.</p>
         </div>
         <TenantDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-400 font-medium text-sm">Total Clínicas</h3>
            <p className="text-3xl font-bold text-white mt-2">{tenants.length}</p>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-400 font-medium text-sm">MRR Estimado</h3>
            <p className="text-3xl font-bold text-indigo-400 mt-2">$0 <span className="text-sm text-slate-500 font-normal">USD/mo</span></p>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-400 font-medium text-sm">Turnos Procesados</h3>
            <p className="text-3xl font-bold text-white mt-2">
               {tenants.reduce((acc, t) => acc + t._count.appointments, 0)}
            </p>
         </div>
      </div>

      {/* Tenants List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-8">
         <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Clínicas Registradas</h2>
         </div>
         <div className="divide-y divide-slate-800">
            {tenants.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No hay clínicas registradas.</div>
            ) : null}
            {tenants.map(tenant => (
               <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div>
                     <h3 className="font-medium text-white">{tenant.name}</h3>
                     <p className="text-sm text-slate-400 mt-0.5">slug: /{tenant.slug}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                     <div className="text-slate-400 text-right">
                        <span className="block text-white font-medium">{tenant._count.professionals}</span>
                        Profesionales
                     </div>
                     <div className="text-slate-400 text-right">
                        <span className="block text-white font-medium">{tenant._count.appointments}</span>
                        Turnos
                     </div>
                     <div className="flex items-center gap-3">
                        <Link href={`/${tenant.slug}/admin`} target="_blank">
                           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors text-sm border border-slate-700">
                              Visitar Panel
                           </button>
                        </Link>
                        <TenantDialog tenant={tenant} />
                        <form action={deleteTenantAction.bind(null, tenant.id)}>
                           <button type="submit" className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-lg transition-colors text-sm border border-red-500/20">
                              Eliminar
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
