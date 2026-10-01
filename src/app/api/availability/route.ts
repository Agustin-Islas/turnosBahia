import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateAvailableSlots } from '@/lib/availability';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const serviceId = searchParams.get('serviceId');
    const dateStr = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!professionalId || !serviceId || !dateStr) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    // Parse YYYY-MM-DD as local date to prevent timezone shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayOfWeek = date.getDay(); // 0 (Dom) - 6 (Sab)

    // 1. Obtener duración del servicio
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });

    // 2. Obtener el horario del profesional para este día
    const schedules = await prisma.schedule.findMany({
      where: { professionalId, dayOfWeek },
    });
    
    // Si no tiene horario, no hay disponibilidad
    if (schedules.length === 0) return NextResponse.json([]); 

    // 3. Obtener citas existentes en este día
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        startTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' } 
      }
    });

    // 4. Obtener bloqueos (TimeOffs)
    const timeOffs = await prisma.timeOff.findMany({
      where: {
        professionalId,
        startDate: { lte: dayEnd },
        endDate: { gte: dayStart }
      }
    });

    // 5. Motor de cálculo (Usamos el primer schedule del día por simplificación del MVP)
    const slots = calculateAvailableSlots({
      date,
      serviceDuration: service.durationMinutes,
      schedule: schedules[0],
      appointments,
      timeOffs,
      intervalMinutes: 30,
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando la disponibilidad' }, { status: 500 });
  }
}
