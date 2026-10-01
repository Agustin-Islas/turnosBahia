"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addOrUpdateTenantAction } from "./actions";

type Tenant = { id: string, name: string, slug: string };

export function TenantDialog({ tenant }: { tenant?: Tenant }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (tenant?.id) formData.append("id", tenant.id);
    
    await addOrUpdateTenantAction(formData);
    
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {tenant ? (
        <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => setOpen(true)}>
          Editar
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
          <Plus className="w-4 h-4" /> Nueva Clínica
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{tenant ? "Editar Clínica" : "Nueva Clínica"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {tenant ? "Modifica los datos de acceso de esta clínica." : "Registra una nueva clínica en la plataforma SaaS."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nombre de la Clínica</Label>
                <Input id="name" name="name" defaultValue={tenant?.name} placeholder="Ej. Clínica Las Lomas" required className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-300">URL Slug</Label>
                <Input id="slug" name="slug" defaultValue={tenant?.slug} placeholder="ej. clinica-las-lomas" required className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                <p className="text-xs text-slate-500 mt-1">Estará disponible en: /{tenant?.slug || 'slug'}/admin</p>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-800 pt-4 !bg-transparent !mt-6">
              <DialogClose render={<Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">Cancelar</Button>} />
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? "Guardando..." : "Guardar Clínica"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
