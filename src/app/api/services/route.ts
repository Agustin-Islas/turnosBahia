import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive("La duración debe ser positiva"),
  price: z.number().nonnegative("El precio no puede ser negativo"),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { tenantId: session.tenant.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const json = await request.json();
    const body = createServiceSchema.parse(json);

    const newService = await prisma.service.create({
      data: {
        ...body,
        tenantId: session.tenant.id,
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error Interno del Servidor' }, { status: 500 });
  }
}
