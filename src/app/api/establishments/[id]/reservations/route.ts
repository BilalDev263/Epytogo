import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { prisma } from '@/db/prisma';

// Récupérer les réservations d'un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cet établissement
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: user.id },
          {
            staff: {
              some: {
                userId: user.id,
                isActive: true,
                permissions: {
                  has: 'VIEW_RESERVATIONS'
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        placeId: true,
        name: true,
        type: true
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Accès refusé à cet établissement' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';

    const skip = (page - 1) * limit;

    // Construire les filtres - utiliser placeId de l'établissement déjà récupéré
    const where: any = {
      placeId: establishment.placeId
    };

    if (status) {
      where.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      where.reservationDate = {
        gte: selectedDate,
        lt: nextDay
      };
    }

    // Récupérer les réservations avec pagination
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { reservationDate: 'asc' },
        skip,
        take: limit
      }),
      prisma.reservation.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      establishment: {
        id: establishment.id,
        placeId: establishment.placeId,
        name: establishment.name,
        type: establishment.type
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour le statut d'une réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cet établissement
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: user.id },
          {
            staff: {
              some: {
                userId: user.id,
                isActive: true,
                permissions: {
                  has: 'MANAGE_RESERVATIONS'
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        placeId: true
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Accès refusé à cet établissement' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reservationId, status } = body;

    if (!reservationId || !status) {
      return NextResponse.json(
        { error: 'ID de réservation et statut requis' },
        { status: 400 }
      );
    }

    // Vérifier que la réservation appartient à cet établissement
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        placeId: establishment.placeId
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Statut de réservation mis à jour avec succès',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}