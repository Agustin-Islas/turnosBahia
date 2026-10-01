import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // Limpiar datos anteriores para evitar duplicados
  await prisma.appointment.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.service.deleteMany()

  // 1. Crear el Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-las-lomas' },
    update: {},
    create: {
      name: 'Clínica Las Lomas',
      slug: 'clinica-las-lomas',
      configuracionDias: {
        workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes
      },
    },
  })
  console.log(`Tenant creado: ${tenant.name}`)

  // 2. Crear Servicios
  const s1 = await prisma.service.create({
    data: {
      name: 'Consulta General',
      durationMinutes: 30,
      price: 50.00,
      tenantId: tenant.id
    }
  })
  const s2 = await prisma.service.create({
    data: {
      name: 'Tratamiento Especializado',
      durationMinutes: 60,
      price: 120.00,
      tenantId: tenant.id
    }
  })
  console.log('Servicios creados.')

  // 3. Crear Profesionales
  const prof1 = await prisma.professional.create({
    data: {
      name: 'Dr. Agustín López',
      tenantId: tenant.id
    }
  })
  const prof2 = await prisma.professional.create({
    data: {
      name: 'Dra. María González',
      tenantId: tenant.id
    }
  })
  console.log(`Profesionales creados: ${prof1.name}, ${prof2.name}`)

  // 4. Crear Horario Base (Lunes a Viernes de 09:00 a 18:00) para ambos
  for (let i = 1; i <= 5; i++) {
    await prisma.schedule.create({
      data: { professionalId: prof1.id, dayOfWeek: i, startTime: '09:00', endTime: '18:00' }
    })
    await prisma.schedule.create({
      data: { professionalId: prof2.id, dayOfWeek: i, startTime: '09:00', endTime: '18:00' }
    })
  }
  console.log('Horarios creados.')

  // 5. Crear citas de prueba para ver en el calendario (Para mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 30);

  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      professionalId: prof1.id,
      serviceId: s1.id,
      clientName: "Juan Pérez",
      clientEmail: "juan@ejemplo.com",
      clientPhone: "1122334455",
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: "CONFIRMED",
    }
  })

  const tomorrow2 = new Date(tomorrow);
  tomorrow2.setHours(15, 0, 0, 0);
  const tomorrowEnd2 = new Date(tomorrow2);
  tomorrowEnd2.setMinutes(tomorrowEnd2.getMinutes() + 60);

  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      professionalId: prof2.id,
      serviceId: s2.id,
      clientName: "Laura Gómez",
      clientEmail: "laura@ejemplo.com",
      startTime: tomorrow2,
      endTime: tomorrowEnd2,
      status: "PENDING",
    }
  })
  console.log('Citas de prueba creadas.')

  console.log('✅ Seed finalizado exitosamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
