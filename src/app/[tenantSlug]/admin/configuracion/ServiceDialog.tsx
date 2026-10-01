"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2 } from "lucide-react";
import { addOrUpdateServiceAction } from "./actions";

type Service = { id: string, name: string, durationMinutes: number, price: any };

export function ServiceDialog({ tenantId, service }: { tenantId: string, service?: Service }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);
    if (service?.id) formData.append("id", service.id);
    
    await addOrUpdateServiceAction(formData);
    
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {service ? (
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setOpen(true)}>
          Editar
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="gap-2 font-semibold" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Nuevo
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{service ? "Editar Servicio" : "Agregar Servicio"}</DialogTitle>
            <DialogDescription>
              {service ? "Modifica los detalles del servicio." : "Crea un nuevo tratamiento o servicio para tu clínica."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Servicio</Label>
                <Input id="name" name="name" defaultValue={service?.name} placeholder="Ej. Consulta Odontológica" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input id="duration" name="duration" type="number" defaultValue={service?.durationMinutes} placeholder="30" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($) - Opcional</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={service?.price != null ? Number(service.price) : ""} placeholder="Dejar vacío si no aplica" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="ghost">Cancelar</Button>} />
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
