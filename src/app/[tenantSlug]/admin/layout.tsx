import { Calendar as CalendarIcon, Users, Settings, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ 
  children,
  params
}: { 
  children: React.ReactNode,
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params;
  const session = await getSession(tenantSlug);

  // (Comentado temporalmente para facilitar la prueba de ambos paneles con el mock)
  // if (session?.user.role !== 'TENANT_ADMIN' || !session?.tenant) {
  //   redirect('/superadmin'); // Si no es admin de tenant, redirigir (para probar)
  // }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-white font-heading font-bold text-lg tracking-wide">
              Turnos SaaS
            </span>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <Link href={`/${tenantSlug}/admin`}>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 font-medium transition-colors">
                <CalendarIcon className="w-5 h-5" /> Agenda
              </span>
            </Link>
            <Link href={`/${tenantSlug}/admin/pacientes`}>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Users className="w-5 h-5" /> Pacientes
              </span>
            </Link>
            <Link href={`/${tenantSlug}/admin/configuracion`}>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5" /> Configuración
              </span>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
           <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-red-400">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-heading font-semibold text-slate-800">
                Clínica Las Lomas
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                Plan Pro
              </span>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
                 <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                 <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-700">Dr. Agustín López</div>
                    <div className="text-xs text-slate-500">Admin</div>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    AL
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
