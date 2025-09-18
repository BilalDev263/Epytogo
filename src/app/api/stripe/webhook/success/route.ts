import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { prisma } from '@/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, plan, userId } = body;

    if (!sessionId || !plan) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Mapping des plans vers les types d'abonnement
    const subscriptionTypeMap = {
      business: 'BUSINESS',
      enterprise: 'ENTERPRISE'
    };

    const subscriptionType = subscriptionTypeMap[plan as keyof typeof subscriptionTypeMap];

    if (!subscriptionType) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur avec le nouvel abonnement
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscription: subscriptionType as any,
        subscriptionStatus: 'ACTIVE',
        subscriptionId: sessionId,
        stripeCustomerId: `cus_demo_${Date.now()}`, // En démo
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        subscription: true,
        subscriptionStatus: true
      }
    });

    console.log('Abonnement mis à jour:', {
      user: updatedUser.email,
      subscription: updatedUser.subscription,
      status: updatedUser.subscriptionStatus
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}