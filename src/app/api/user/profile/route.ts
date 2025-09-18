import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import prisma from '@/db/prisma';

// Force la route à être dynamique
export const dynamic = 'force-dynamic';

// Récupérer les informations du profil utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec ses informations d'abonnement
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        subscription: true,
        subscriptionStatus: true,
        subscriptionId: true,
        currentPeriodEnd: true,
        createdAt: true,
        _count: {
          select: {
            reservations: true,
            ownedEstablishments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        memberSince: user.createdAt
      },
      subscription: user.subscription || 'FREEMIUM',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionId: user.subscriptionId,
      currentPeriodEnd: user.currentPeriodEnd,
      stats: {
        totalReservations: user._count.reservations,
        totalEstablishments: user._count.ownedEstablishments
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}