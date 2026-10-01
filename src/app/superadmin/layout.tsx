import { LayoutDashboard, Building2, CreditCard, Settings, LogOut, Activity } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  // Verificamos que sea SUPERADMIN (Comentado temporalmente para facilitar la prueba de ambos paneles)
  // if (session?.user.role !== 'SUPERADMIN') {
  //   redirect('/admin'); // Si no es superadmin, probamos mandarlo a su admin local o login
  // }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
             <div className="flex items-center gap-2">
               <Activity className="w-6 h-6 text-indigo-500" />
               <span className="text-white font-heading font-bold text-lg tracking-wide">
                 SaaS HQ
               </span>
             </div>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <Link href="/superadmin">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium transition-colors">
                <LayoutDashboard className="w-5 h-5" /> Overview
              </span>
            </Link>
            <Link href="/superadmin/clinicas">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Building2 className="w-5 h-5" /> Clínicas (Tenants)
              </span>
            </Link>
            <Link href="/superadmin/billing">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <CreditCard className="w-5 h-5" /> Suscripciones
              </span>
            </Link>
            <Link href="/superadmin/settings">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5" /> Ajustes Globales
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
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-heading font-semibold text-white">
                Superadmin Dashboard
              </h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                 <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-200">SaaS Owner</div>
                    <div className="text-xs text-indigo-400">Superadmin</div>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    SO
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
