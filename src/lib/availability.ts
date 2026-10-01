import { addMinutes, format, isAfter, isBefore, parse, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export type TimeSlot = {
  time: string;
  available: boolean;
};

type GetAvailabilityParams = {
  date: Date;
  serviceDuration: number;
  schedule: { startTime: string; endTime: string };
  appointments: { startTime: Date; endTime: Date }[];
  timeOffs: { startDate: Date; endDate: Date }[];
  intervalMinutes?: number;
};

/**
 * Motor de Disponibilidad Core
 * Calcula los slots de tiempo disponibles en un día para un profesional.
 */
export function calculateAvailableSlots({
  date,
  serviceDuration,
  schedule,
  appointments,
  timeOffs,
  intervalMinutes = 30,
}: GetAvailabilityParams): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayStart = startOfDay(date);
  
  // Parse schedule start/end time relative to the requested date
  const scheduleStart = parse(schedule.startTime, 'HH:mm', dayStart);
  const scheduleEnd = parse(schedule.endTime, 'HH:mm', dayStart);
  
  let currentSlot = scheduleStart;
  const now = new Date();

  while (isBefore(currentSlot, scheduleEnd)) {
    const slotEnd = addMinutes(currentSlot, serviceDuration);
    
    // Si el turno excede la hora de salida, paramos.
    if (isAfter(slotEnd, scheduleEnd)) {
      break;
    }

    // Comprobar si el turno ya pasó en el tiempo (para el mismo día)
    const isPast = isBefore(currentSlot, now);

    // Comprobar solapamientos con Citas (Appointments) existentes
    const isOverlappingAppointment = appointments.some((appt) => {
      return currentSlot.getTime() < appt.endTime.getTime() && slotEnd.getTime() > appt.startTime.getTime();
    });

    // Comprobar solapamientos con Bloqueos (TimeOffs)
    const isOverlappingTimeOff = timeOffs.some((timeOff) => {
      return currentSlot.getTime() < timeOff.endDate.getTime() && slotEnd.getTime() > timeOff.startDate.getTime();
    });

    const isAvailable = !isPast && !isOverlappingAppointment && !isOverlappingTimeOff;

    slots.push({
      time: format(currentSlot, 'HH:mm'),
      available: isAvailable,
    });

    // Avanzar al siguiente intervalo (ej. cada 30 min)
    currentSlot = addMinutes(currentSlot, intervalMinutes);
  }

  return slots;
}
