import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { prisma } from '@/db/prisma';

// Mettre à jour une réservation
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

    const body = await request.json();
    const { status, timeSlot, roomNumber, specialRequests, totalPrice } = body;

    // Vérifier que la réservation existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        establishment: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cette réservation
    if (!reservation.establishment) {
      return NextResponse.json(
        { error: 'Cette réservation n\'est pas liée à un établissement' },
        { status: 400 }
      );
    }

    const hasAccess = await prisma.establishment.findFirst({
      where: {
        id: reservation.establishment.id,
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
      }
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès refusé pour modifier cette réservation' },
        { status: 403 }
      );
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(timeSlot !== undefined && { timeSlot }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(specialRequests !== undefined && { specialRequests }),
        ...(totalPrice !== undefined && { totalPrice })
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            image: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(updatedReservation);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Supprimer une réservation (annulation)
export async function DELETE(
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

    // Vérifier que la réservation existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        establishment: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cette réservation
    if (!reservation.establishment) {
      return NextResponse.json(
        { error: 'Cette réservation n\'est pas liée à un établissement' },
        { status: 400 }
      );
    }

    const hasAccess = await prisma.establishment.findFirst({
      where: {
        id: reservation.establishment.id,
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
      }
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès refusé pour supprimer cette réservation' },
        { status: 403 }
      );
    }

    // Marquer la réservation comme annulée plutôt que de la supprimer
    const cancelledReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    });

    return NextResponse.json({
      message: 'Réservation annulée avec succès',
      reservation: cancelledReservation
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}