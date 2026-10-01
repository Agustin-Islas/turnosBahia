import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide">
          SaaS Multi-tenant
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tight">
          Bienvenido a <span className="text-blue-600">turnosBahía</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          La plataforma marca blanca definitiva para gestionar agendas, profesionales y reservas online.
          Múltiples sucursales, total aislamiento de datos y máxima flexibilidad.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/superadmin">
            <Button size="lg" className="rounded-full px-8 shadow-lg font-semibold bg-slate-900 text-white hover:bg-slate-800">
              Entrar al SuperAdmin
            </Button>
          </Link>
          <Link href="/clinica-las-lomas">
            <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold border-slate-300">
              Ver Demo Pública
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
