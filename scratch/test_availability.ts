import { calculateAvailableSlots } from '../src/lib/availability';
import { addDays, setHours, setMinutes } from 'date-fns';

// 1. Simular datos
const today = new Date();
const tomorrow = addDays(today, 1);

// Horario del profesional: 09:00 a 14:00
const schedule = { startTime: '09:00', endTime: '14:00' };

// Citas existentes: una cita mañana de 10:00 a 10:30
const appointments = [
  {
    startTime: setMinutes(setHours(tomorrow, 10), 0),
    endTime: setMinutes(setHours(tomorrow, 10), 30),
  }
];

// Bloqueos (almuerzo o vacaciones): mañana de 12:00 a 13:00
const timeOffs = [
  {
    startDate: setMinutes(setHours(tomorrow, 12), 0),
    endDate: setMinutes(setHours(tomorrow, 13), 0),
  }
];

// 2. Ejecutar Algoritmo (Servicio dura 30 mins)
const slots = calculateAvailableSlots({
  date: tomorrow,
  serviceDuration: 30, // en minutos
  schedule,
  appointments,
  timeOffs,
  intervalMinutes: 30,
});

// 3. Imprimir resultados en consola para validar
console.log(`Disponibilidad calculada para: ${tomorrow.toDateString()}`);
console.log('---');
slots.forEach(slot => {
  console.log(`[${slot.time}] - ${slot.available ? '✅ Libre' : '❌ Ocupado'}`);
});
