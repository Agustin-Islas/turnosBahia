"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addOrUpdateTenantAction(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) return { error: "Faltan datos requeridos" };

  if (id) {
    await prisma.tenant.update({
      where: { id },
      data: { name, slug }
    });
  } else {
    // Generate a unique slug check here if needed in production
    await prisma.tenant.create({
      data: { name, slug }
    });
  }

  revalidatePath("/superadmin");
  return { success: true };
}

export async function deleteTenantAction(id: string) {
  // En producción, esto debería borrar en cascada (servicios, profesionales, turnos) 
  // o hacer soft-delete. Por ahora usamos transacciones para borrar relaciones.
  await prisma.$transaction([
    prisma.schedule.deleteMany({ where: { professional: { tenantId: id } } }),
    prisma.professional.deleteMany({ where: { tenantId: id } }),
    prisma.appointment.deleteMany({ where: { tenantId: id } }),
    prisma.service.deleteMany({ where: { tenantId: id } }),
    prisma.tenant.delete({ where: { id } })
  ]);
  
  revalidatePath("/superadmin");
}
