import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createProfessionalSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const professionals = await prisma.professional.findMany({
    where: { tenantId: session.tenant.id },
    include: { schedules: true, timeOffs: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(professionals);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const json = await request.json();
    const body = createProfessionalSchema.parse(json);

    const newProfessional = await prisma.professional.create({
      data: {
        name: body.name,
        tenantId: session.tenant.id,
      },
    });

    return NextResponse.json(newProfessional, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error Interno del Servidor' }, { status: 500 });
  }
}
