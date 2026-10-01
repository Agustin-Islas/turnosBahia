import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { calculateAvailableSlots } from '@/lib/availability';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const createAppointmentSchema = z.object({
  professionalId: z.string().uuid(),
  serviceId: z.string().uuid(),
  tenantId: z.string().uuid(),
  startTime: z.string().datetime(), // ISO datetime
  endTime: z.string().datetime(),   // ISO datetime
  clientName: z.string().min(1, "El nombre del cliente es obligatorio"),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { tenantId: session.tenant.id },
    include: { professional: true, service: true },
    orderBy: { startTime: 'asc' }
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createAppointmentSchema.parse(json);

    // Validación de integridad: el tenant es dueño del servicio y del profesional
    const service = await prisma.service.findFirst({
      where: { id: body.serviceId, tenantId: body.tenantId }
    });
    if (!service) return NextResponse.json({ error: 'Servicio inválido' }, { status: 400 });

    const professional = await prisma.professional.findFirst({
      where: { id: body.professionalId, tenantId: body.tenantId }
    });
    if (!professional) return NextResponse.json({ error: 'Profesional inválido' }, { status: 400 });

    // Validación Anti-Solapamiento (Double-booking protection)
    const overlapping = await prisma.appointment.findFirst({
      where: {
        professionalId: body.professionalId,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: new Date(body.endTime) } },
          { endTime: { gt: new Date(body.startTime) } }
        ]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: 'El turno ya fue ocupado por otra persona.' }, { status: 409 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        ...body,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error Interno del Servidor' }, { status: 500 });
  }
}
