"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, Clock, ArrowLeft, Loader2 } from "lucide-react";

type Schedule = { dayOfWeek: number, startTime: string, endTime: string };
type ProfessionalService = { serviceId: string; customDurationMinutes: number | null; customPrice: number | null };
type Service = { id: string; name: string; durationMinutes: number; price: number | null };
type Professional = { id: string; name: string; role?: string; services: ProfessionalService[], schedules: Schedule[] };

export function BookingFlow({ 
  tenantId, 
  initialServices, 
  initialProfessionals 
}: { 
  tenantId: string, 
  initialServices: Service[], 
  initialProfessionals: Professional[] 
}) {
  const [step, setStep] = useState(1);
  const [services] = useState<Service[]>(initialServices);
  const [professionals] = useState<Professional[]>(initialProfessionals);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Derivar profesionales disponibles para el servicio seleccionado
  const availableProfessionals = professionals.filter(prof => 
    prof.services.some(s => s.serviceId === selectedService)
  );

  const currentProfessional = professionals.find(p => p.id === selectedProfessional);
  const activeDaysOfWeek = currentProfessional?.schedules?.map(s => s.dayOfWeek) || [];

  // Cargar disponibilidad dinámica al cambiar la fecha o las selecciones
  useEffect(() => {
    if (selectedProfessional && selectedService && selectedDate) {
      setIsLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      fetch(`/api/availability?tenantId=${tenantId}&professionalId=${selectedProfessional}&serviceId=${selectedService}&date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
               setTimeSlots(data.filter((slot: any) => slot.available).map((s: any) => s.time));
            } else {
               setTimeSlots([]);
            }
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedProfessional, selectedService, selectedDate, tenantId]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const [hours, minutes] = selectedTime!.split(':');
      const startTime = new Date(selectedDate!);
      startTime.setHours(Number(hours), Number(minutes), 0, 0);
      
      const service = services.find(s => s.id === selectedService);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (service?.durationMinutes || 30));

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: selectedProfessional,
          serviceId: selectedService,
          tenantId: tenantId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
        })
      });
      
      if (res.ok) {
        setStep(6);
      } else {
        const err = await res.json();
        alert("No se pudo reservar: " + (err.error || "Error desconocido"));
      }
    } catch (error) {
       alert("Error de conexión al reservar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mt-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header / Stepper Progress */}
      {step < 6 && (
        <div className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400">
          <span className={step >= 1 ? "text-blue-600" : ""}>Servicio</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 2 ? "text-blue-600" : ""}>Profesional</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 3 ? "text-blue-600" : ""}>Fecha y Hora</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 5 ? "text-blue-600" : ""}>Tus Datos</span>
        </div>
      )}

      <div className="relative min-h-[350px]">
        
        {/* Paso 1: Servicio */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-heading text-slate-800">¿Qué servicio necesitas?</h3>
            <div className="grid gap-3 mt-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    selectedService === service.id
                      ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">{service.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {service.durationMinutes} min
                    </div>
                  </div>
                  <div className="font-medium text-slate-700">
                    {service.price !== null ? `$${service.price}` : ""}
                  </div>
                </button>
              ))}
              {services.length === 0 && <p className="text-slate-500 italic">Cargando servicios...</p>}
            </div>
            <div className="pt-6 flex justify-end">
              <Button onClick={handleNext} disabled={!selectedService} className="rounded-full px-8 shadow-lg hover:shadow-blue-500/25 transition-all">
                Siguiente Paso
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Profesional */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-heading text-slate-800">Elige un profesional</h3>
            <div className="grid gap-3 mt-4">
              {availableProfessionals.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  No hay profesionales que ofrezcan este servicio.
                </div>
              )}
              {availableProfessionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setSelectedProfessional(prof.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    selectedProfessional === prof.id
                      ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {prof.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">{prof.name}</div>
                    <div className="text-sm text-slate-500">{prof.role || 'Especialista'}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={handleBack} className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2"/> Volver</Button>
              <Button onClick={handleNext} disabled={!selectedProfessional} className="rounded-full px-8 shadow-lg hover:shadow-blue-500/25 transition-all">
                Siguiente Paso
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3 & 4: Calendario y Horas */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-heading text-slate-800">Selecciona fecha y hora</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  locale={es}
                  disabled={(date) => {
                    // Disable past dates
                    if (date < new Date(new Date().setHours(0,0,0,0))) return true;
                    // Disable days the professional does not work
                    return !activeDaysOfWeek.includes(date.getDay());
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-500">
                  {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
                </div>
                
                {isLoadingSlots ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Calculando disponibilidad...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.length > 0 ? timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-sm font-medium rounded-xl border transition-all duration-300 ${
                          selectedTime === time
                            ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/30"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {time}
                      </button>
                    )) : (
                      <div className="col-span-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                        No hay turnos disponibles para este día.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={handleBack} className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2"/> Volver</Button>
              <Button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="rounded-full px-8 shadow-lg hover:shadow-blue-500/25 transition-all">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 5: Formulario de Contacto */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold font-heading text-slate-800">Tus Datos</h3>
            <p className="text-slate-500 text-sm mb-6">Completa tus datos para confirmar la reserva.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input 
                  id="name" 
                  placeholder="Juan Pérez" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl h-12 bg-white/50 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="juan@ejemplo.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="rounded-xl h-12 bg-white/50 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+54 11 1234 5678" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="rounded-xl h-12 bg-white/50 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button type="button" variant="ghost" onClick={handleBack} className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2"/> Volver</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                {isSubmitting ? (
                   <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirmando...</>
                ) : (
                   "Confirmar Reserva"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Paso 6: Pantalla de Éxito */}
        {step === 6 && (
          <div className="text-center py-12 space-y-6 animate-in zoom-in-75 duration-700">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold font-heading text-slate-800">¡Turno Confirmado!</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
              Te hemos enviado un correo a <span className="font-medium text-slate-800">{formData.email}</span> con los detalles de tu cita.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-2xl inline-block mt-8 text-left border border-slate-100">
               <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-2">Resumen</div>
               <div className="font-medium text-slate-800">{selectedDate && format(selectedDate, "dd/MM/yyyy")} a las {selectedTime} hs</div>
               <div className="text-slate-600">{professionals.find(p => p.id === selectedProfessional)?.name}</div>
               <div className="text-slate-600 text-sm mt-1">{services.find(s => s.id === selectedService)?.name}</div>
            </div>

            <div className="pt-8 flex justify-center gap-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">
                Hacer otra reserva
              </Button>
              <Button onClick={() => window.location.href = '/admin'} className="rounded-full px-8 bg-slate-900 text-white">
                Ir al Panel Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
