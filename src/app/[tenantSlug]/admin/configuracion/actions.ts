"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addOrUpdateServiceAction(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const duration = parseInt(formData.get("duration") as string, 10);
  const priceStr = formData.get("price") as string;
  const price = priceStr ? parseFloat(priceStr) : null;
  const tenantId = formData.get("tenantId") as string;

  if (!name || !duration || !tenantId) return { error: "Faltan datos requeridos" };

  if (id) {
    await prisma.service.update({
      where: { id },
      data: { name, durationMinutes: duration, price }
    });
  } else {
    await prisma.service.create({
      data: { name, durationMinutes: duration, price, tenantId }
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteServiceAction(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function addOrUpdateProfessionalAction(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const tenantId = formData.get("tenantId") as string;
  const schedulesJson = formData.get("schedules") as string;
  const servicesJson = formData.get("services") as string;

  if (!name || !tenantId || !schedulesJson) return { error: "Faltan datos" };

  const schedules = JSON.parse(schedulesJson) as { dayOfWeek: number, startTime: string, endTime: string }[];
  const services = servicesJson ? JSON.parse(servicesJson) as { serviceId: string, customPrice: number | null, customDurationMinutes: number | null }[] : [];

  let profId = id;
  if (id) {
    await prisma.professional.update({
      where: { id },
      data: { name }
    });
    // Limpiamos los horarios y servicios anteriores
    await prisma.schedule.deleteMany({ where: { professionalId: id } });
    await prisma.professionalService.deleteMany({ where: { professionalId: id } });
  } else {
    const prof = await prisma.professional.create({
      data: { name, tenantId }
    });
    profId = prof.id;
  }

  if (schedules.length > 0) {
    await prisma.schedule.createMany({
      data: schedules.map(s => ({
        professionalId: profId as string,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    });
  }

  if (services.length > 0) {
    await prisma.professionalService.createMany({
      data: services.map(s => ({
        professionalId: profId as string,
        serviceId: s.serviceId,
        customPrice: s.customPrice,
        customDurationMinutes: s.customDurationMinutes
      }))
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProfessionalAction(id: string) {
  // Primero borrar horarios (por la foreign key)
  await prisma.schedule.deleteMany({ where: { professionalId: id } });
  // Luego borrar al profesional
  await prisma.professional.delete({ where: { id } });
  revalidatePath("/", "layout");
}
