"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

// @ts-ignore
import TimeGrid from "react-big-calendar/lib/TimeGrid";

// Configuración de Localizer para Date-fns (Español)
const locales = {
  "es": es,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// VISTA CUSTOM: Próximos 5 días (Desde hoy hacia adelante)
function CustomRollingWeek(props: any) {
  const { date } = props;
  const range = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(date, i));
  }, [date]);
  return <TimeGrid {...props} range={range} eventOffset={15} />;
}
CustomRollingWeek.range = (date: Date) => {
  return Array.from({ length: 5 }, (_, i) => addDays(date, i));
};
CustomRollingWeek.navigate = (date: Date, action: string) => {
  switch (action) {
    case "PREV": return addDays(date, -5);
    case "NEXT": return addDays(date, 5);
    default: return date;
  }
};
CustomRollingWeek.title = (date: Date) => {
  return `${format(date, "d MMM", { locale: es })} – ${format(addDays(date, 4), "d MMM", { locale: es })}`;
};

type EventData = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  professionalId: string;
  professionalName: string;
  status: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceName?: string;
};

type Props = {
  events: EventData[];
  professionals: { id: string; name: string }[];
};

// Toolbar personalizada para reemplazar la predeterminada
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToToday = () => toolbar.onNavigate('TODAY');
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
         <button onClick={goToToday} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700">Hoy</button>
         <div className="flex items-center rounded-lg overflow-hidden border border-slate-200">
           <button onClick={goToBack} className="p-1.5 bg-slate-50 hover:bg-slate-100 border-r border-slate-200"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
           <button onClick={goToNext} className="p-1.5 bg-slate-50 hover:bg-slate-100"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
         </div>
      </div>
      <div className="text-lg font-heading font-bold text-slate-800 capitalize">
         {toolbar.label}
      </div>
      <div className="flex items-center rounded-lg overflow-hidden border border-slate-200">
        {toolbar.views.map((viewName: string) => (
           <button 
             key={viewName}
             onClick={() => toolbar.onView(viewName)}
             className={`px-4 py-1.5 text-sm font-semibold transition-colors ${toolbar.view === viewName ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200 last:border-0'}`}
           >
             {toolbar.localizer.messages[viewName] || viewName}
           </button>
        ))}
      </div>
    </div>
  );
};

export function CalendarView({ events, professionals }: Props) {
  const [selectedProf, setSelectedProf] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  
  // Estados controlados para el calendario
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("rolling_week" as View);

  // Filtro local de eventos por profesional
  const filteredEvents = selectedProf === "ALL" 
    ? events 
    : events.filter(e => e.professionalId === selectedProf);

  // Custom component para el evento (Optimizado para turnos cortos de 30m)
  const EventComponent = ({ event }: { event?: EventData }) => {
    if (!event) return null;
    return (
      <div className="w-full h-full px-1.5 flex items-center gap-1.5 overflow-hidden text-white font-sans">
         <span className="font-semibold text-[11px] truncate leading-none">{event.title}</span>
         <span className="opacity-80 text-[10px] truncate leading-none hidden sm:inline-block">- {event.professionalName}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      
      {/* Barra de Filtros */}
      <div className="flex items-center gap-4 mb-4">
         <span className="text-sm font-medium text-slate-500">Filtrar por:</span>
         <select 
           value={selectedProf} 
           onChange={e => setSelectedProf(e.target.value)}
           className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
         >
           <option value="ALL">Todos los profesionales</option>
           {professionals.map(p => (
             <option key={p.id} value={p.id}>{p.name}</option>
           ))}
         </select>
      </div>

      {/* Calendario (h-full para que ocupe todo el espacio) */}
      <div className="flex-1 bg-white rounded-xl overflow-hidden [&_.rbc-calendar]:font-sans [&_.rbc-event]:rounded-md [&_.rbc-event]:bg-blue-600 [&_.rbc-event]:border-none [&_.rbc-event]:shadow-sm [&_.rbc-event:hover]:bg-blue-700 transition-colors [&_.rbc-today]:bg-blue-50/50 [&_.rbc-time-header-content]:border-slate-100">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          culture="es"
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          view={view}
          onView={(newView) => setView(newView)}
          defaultView={"rolling_week" as View}
          views={{ rolling_week: CustomRollingWeek as any, day: true, agenda: true }}
          min={new Date(0, 0, 0, 8, 0, 0)} // Empieza a las 8 AM
          max={new Date(0, 0, 0, 20, 0, 0)} // Termina a las 8 PM
          formats={{
            eventTimeRangeFormat: () => "", // Ocultamos el label de tiempo por defecto para evitar overlap
          }}
          components={{
             event: EventComponent,
             toolbar: CustomToolbar
          }}
          onSelectEvent={(event) => setSelectedEvent(event as EventData)}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            rolling_week: "Próximos 5 Días",
            day: "Día",
            agenda: "Agenda",
            noEventsInRange: "No hay turnos programados en este rango.",
          }}
        />
      </div>

      {/* MODAL DETALLES DEL TURNO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-heading font-bold text-lg text-slate-800">Detalles del Turno</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm border border-slate-100"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                   <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Paciente</div>
                   <div className="text-lg font-medium text-slate-900">{selectedEvent.clientName || 'Sin Nombre'}</div>
                   {(selectedEvent.clientEmail || selectedEvent.clientPhone) && (
                      <div className="text-sm text-slate-500 mt-1">
                        {selectedEvent.clientEmail && <span>{selectedEvent.clientEmail}</span>}
                        {selectedEvent.clientEmail && selectedEvent.clientPhone && <span> • </span>}
                        {selectedEvent.clientPhone && <span>{selectedEvent.clientPhone}</span>}
                      </div>
                   )}
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Servicio</div>
                      <div className="font-medium text-slate-800">{selectedEvent.serviceName || selectedEvent.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Profesional</div>
                      <div className="font-medium text-slate-800">{selectedEvent.professionalName}</div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Fecha</div>
                      <div className="font-medium text-slate-800">{format(selectedEvent.start, "dd MMM yyyy", { locale: es })}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Horario</div>
                      <div className="font-medium text-slate-800">{format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}</div>
                    </div>
                 </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                         selectedEvent.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                         selectedEvent.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                         'bg-slate-200 text-slate-800'
                 }`}>
                   {selectedEvent.status}
                 </span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
