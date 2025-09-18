import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import prisma from '@/db/prisma';

// Récupérer les réservations de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Construire les filtres
    const whereClause: any = {
      userId: user.id
    };

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    // Récupérer les réservations avec les informations de l'établissement
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
            email: true,
            website: true
          }
        }
      },
      orderBy: {
        reservationDate: 'desc'
      },
      take: limit
    });

    // Statistiques des réservations
    const stats = await prisma.reservation.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: {
        status: true
      }
    });

    const statusCounts = {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase() as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status] = stat._count.status;
      }
      statusCounts.total += stat._count.status;
    });

    return NextResponse.json({
      reservations,
      stats: statusCounts
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Annuler une réservation
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { reservationId, action } = body;

    if (!reservationId || !action) {
      return NextResponse.json(
        { error: 'ID de réservation et action requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de la réservation
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: user.id
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Vérifier si l'action est autorisée selon le statut actuel
    if (action === 'cancel') {
      if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
        return NextResponse.json(
          { error: 'Cette réservation ne peut pas être annulée' },
          { status: 400 }
        );
      }

      // Vérifier si la réservation n'est pas dans le passé
      const reservationDate = new Date(reservation.reservationDate);
      const now = new Date();

      if (reservationDate < now) {
        return NextResponse.json(
          { error: 'Impossible d\'annuler une réservation passée' },
          { status: 400 }
        );
      }

      // Mettre à jour le statut
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        },
        include: {
          establishment: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Réservation annulée avec succès',
        reservation: updatedReservation
      });
    }

    return NextResponse.json(
      { error: 'Action non supportée' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur lors de la modification de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}