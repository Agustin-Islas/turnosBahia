"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2 } from "lucide-react";
import { addOrUpdateProfessionalAction } from "./actions";

type Schedule = { dayOfWeek: number, startTime: string, endTime: string };
type ProfessionalService = { serviceId: string, customDurationMinutes: number | null, customPrice: any };
type Professional = { id: string, name: string, schedules: Schedule[], services: ProfessionalService[] };
type Service = { id: string, name: string, durationMinutes: number, price: any };

const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function ProfessionalDialog({ tenantId, professional, allServices }: { tenantId: string, professional?: Professional, allServices: Service[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize schedule state based on existing or defaults
  const [schedules, setSchedules] = useState<{ active: boolean, dayOfWeek: number, startTime: string, endTime: string }[]>(
    [0, 1, 2, 3, 4, 5, 6].map(day => {
      const existing = professional?.schedules?.find(s => s.dayOfWeek === day);
      return {
        active: !!existing || (day >= 1 && day <= 5 && !professional), // Default Mon-Fri for new
        dayOfWeek: day,
        startTime: existing?.startTime || "09:00",
        endTime: existing?.endTime || "18:00"
      };
    })
  );

  // Initialize services state
  const [assignedServices, setAssignedServices] = useState<{ active: boolean, serviceId: string, customPrice: string, customDuration: string }[]>(
    allServices.map(service => {
      const existing = professional?.services?.find(s => s.serviceId === service.id);
      return {
        active: !!existing,
        serviceId: service.id,
        customPrice: existing?.customPrice !== null && existing?.customPrice !== undefined ? String(existing.customPrice) : "",
        customDuration: existing?.customDurationMinutes ? String(existing.customDurationMinutes) : ""
      };
    })
  );

  const toggleDay = (day: number) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === day ? { ...s, active: !s.active } : s));
  };

  const updateTime = (day: number, field: "startTime" | "endTime", value: string) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s));
  };

  const toggleService = (id: string) => {
    setAssignedServices(prev => prev.map(s => s.serviceId === id ? { ...s, active: !s.active } : s));
  };

  const updateService = (id: string, field: "customPrice" | "customDuration", value: string) => {
    setAssignedServices(prev => prev.map(s => s.serviceId === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);
    if (professional?.id) formData.append("id", professional.id);

    // Filter only active schedules
    const activeSchedules = schedules.filter(s => s.active).map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    // Filter active services
    const activeServices = assignedServices.filter(s => s.active).map(s => ({
      serviceId: s.serviceId,
      customPrice: s.customPrice ? parseFloat(s.customPrice) : null,
      customDurationMinutes: s.customDuration ? parseInt(s.customDuration, 10) : null
    }));

    formData.append("schedules", JSON.stringify(activeSchedules));
    formData.append("services", JSON.stringify(activeServices));
    
    await addOrUpdateProfessionalAction(formData);
    
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {professional ? (
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setOpen(true)}>
          Editar Horarios y Servicios
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="gap-2 font-semibold" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{professional ? "Editar Profesional" : "Agregar Profesional"}</DialogTitle>
            <DialogDescription>
              Añade o modifica los datos, días laborables y servicios del profesional.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" name="name" defaultValue={professional?.name} placeholder="Ej. Dr. Juan Pérez" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-4 mt-2">
                 
                 {/* HORARIOS */}
                 <div>
                   <h4 className="text-sm font-semibold text-slate-800 mb-4">Días Laborables y Horarios</h4>
                   <div className="space-y-3">
                     {schedules.map((s, idx) => (
                       <div key={s.dayOfWeek} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                         <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={s.active} 
                             onChange={() => toggleDay(s.dayOfWeek)}
                             className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                           />
                           <span className="text-sm font-medium text-slate-700 w-16">{daysMap[s.dayOfWeek]}</span>
                         </label>
                         
                         {s.active ? (
                           <div className="flex items-center gap-2">
                             <Input 
                               type="time" 
                               value={s.startTime} 
                               onChange={e => updateTime(s.dayOfWeek, "startTime", e.target.value)} 
                               className="w-24 h-8 text-xs px-2" 
                               required 
                             />
                             <span className="text-slate-400">-</span>
                             <Input 
                               type="time" 
                               value={s.endTime} 
                               onChange={e => updateTime(s.dayOfWeek, "endTime", e.target.value)} 
                               className="w-24 h-8 text-xs px-2" 
                               required 
                             />
                           </div>
                         ) : (
                           <span className="text-sm text-slate-400 italic">No laborable</span>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* SERVICIOS */}
                 <div>
                   <h4 className="text-sm font-semibold text-slate-800 mb-4">Servicios que Ofrece</h4>
                   {allServices.length === 0 ? (
                     <p className="text-sm text-slate-500">No hay servicios creados en la clínica.</p>
                   ) : (
                     <div className="space-y-3">
                       {allServices.map(service => {
                         const state = assignedServices.find(s => s.serviceId === service.id)!;
                         return (
                           <div key={service.id} className="p-3 border rounded-lg bg-slate-50 space-y-3">
                             <label className="flex items-center gap-3 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={state.active} 
                                 onChange={() => toggleService(service.id)}
                                 className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                               />
                               <span className="text-sm font-medium text-slate-700">{service.name}</span>
                             </label>
                             {state.active && (
                               <div className="grid grid-cols-2 gap-2 pl-7">
                                 <div>
                                   <Label className="text-[10px] uppercase text-slate-500">Precio especial</Label>
                                   <Input 
                                     type="number"
                                     step="0.01"
                                     placeholder={`Base: ${service.price !== null ? '$' + Number(service.price) : '-'}`}
                                     value={state.customPrice}
                                     onChange={e => updateService(service.id, "customPrice", e.target.value)}
                                     className="h-8 text-xs mt-1"
                                   />
                                 </div>
                                 <div>
                                   <Label className="text-[10px] uppercase text-slate-500">Tiempo especial</Label>
                                   <Input 
                                     type="number"
                                     placeholder={`Base: ${service.durationMinutes}m`}
                                     value={state.customDuration}
                                     onChange={e => updateService(service.id, "customDuration", e.target.value)}
                                     className="h-8 text-xs mt-1"
                                   />
                                 </div>
                               </div>
                             )}
                           </div>
                         )
                       })}
                     </div>
                   )}
                 </div>

              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="ghost">Cancelar</Button>} />
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Profesional"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
