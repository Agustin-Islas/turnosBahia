import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * Mock Auth Session para desarrollo (Fases tempranas)
 * En la fase de integración, esto será reemplazado por la autenticación real 
 * usando el servidor o los headers de Supabase.
 */
export async function getSession(requestOrSlug?: NextRequest | string) {
  // SIMULACIÓN: Usamos el header x-invoke-path para saber en qué ruta estamos
  // y simular la sesión correspondiente. En producción, la sesión viene del token JWT.
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '';

  // Si estamos en superadmin, devolvemos rol SUPERADMIN
  if (currentPath.startsWith('/superadmin')) {
    return {
      user: { id: 'superadmin-123', role: 'SUPERADMIN' },
      tenant: null
    };
  }

  let slug = null;
  if (typeof requestOrSlug === 'string') {
    slug = requestOrSlug;
  }

  if (!slug) return null;

  // De lo contrario, simulamos un administrador de clínica (Tenant)
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) return null;

  return {
    user: {
      id: 'mock-user-123',
      role: 'TENANT_ADMIN',
    },
    tenant: {
      id: tenant.id, 
    }
  };
}

