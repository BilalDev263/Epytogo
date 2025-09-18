import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    firstname?: string;
    lastname?: string;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Vérifies if the current user is authenticated and has admin privileges
 */
export async function verifyAdminAuth(requiredRole: 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN'): Promise<AdminAuthResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Non authentifié',
        statusCode: 401
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true
      }
    });

    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
        statusCode: 404
      };
    }

    // Vérifier les permissions
    const hasPermission =
      user.role === 'SUPER_ADMIN' ||
      (requiredRole === 'ADMIN' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));

    if (!hasPermission) {
      return {
        success: false,
        error: 'Accès refusé - Permissions insuffisantes',
        statusCode: 403
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstname: user.firstname || undefined,
        lastname: user.lastname || undefined
      }
    };

  } catch (error) {
    console.error('Erreur lors de la vérification des permissions admin:', error);
    return {
      success: false,
      error: 'Erreur interne du serveur',
      statusCode: 500
    };
  }
}

/**
 * Checks if a user can perform actions on another user based on roles
 */
export function canModifyUser(currentUserRole: string, targetUserRole: string): boolean {
  // SUPER_ADMIN peut tout modifier
  if (currentUserRole === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN ne peut pas modifier SUPER_ADMIN
  if (currentUserRole === 'ADMIN' && targetUserRole === 'SUPER_ADMIN') {
    return false;
  }

  // ADMIN peut modifier USER et ADMIN
  if (currentUserRole === 'ADMIN' && (targetUserRole === 'USER' || targetUserRole === 'ADMIN')) {
    return true;
  }

  return false;
}

/**
 * Checks if a user can assign a specific role
 */
export function canAssignRole(currentUserRole: string, targetRole: string): boolean {
  // SUPER_ADMIN peut assigner n'importe quel rôle
  if (currentUserRole === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN ne peut pas assigner SUPER_ADMIN
  if (currentUserRole === 'ADMIN' && targetRole === 'SUPER_ADMIN') {
    return false;
  }

  // ADMIN peut assigner USER et ADMIN
  if (currentUserRole === 'ADMIN' && (targetRole === 'USER' || targetRole === 'ADMIN')) {
    return true;
  }

  return false;
}