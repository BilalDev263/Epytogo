import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/db/prisma';

// Script pour lier les réservations existantes aux établissements via placeId
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth('SUPER_ADMIN');

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    // Récupérer toutes les réservations sans establishmentId
    const reservationsWithoutEstablishment = await prisma.reservation.findMany({
      where: {
        establishmentId: null,
        placeId: { not: null }
      },
      select: {
        id: true,
        placeId: true
      }
    });

    let updatedCount = 0;

    // Pour chaque réservation, trouver l'établissement correspondant
    for (const reservation of reservationsWithoutEstablishment) {
      const establishment = await prisma.establishment.findUnique({
        where: { placeId: reservation.placeId },
        select: { id: true }
      });

      if (establishment) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { establishmentId: establishment.id }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `${updatedCount} réservations mises à jour avec succès`,
      totalFound: reservationsWithoutEstablishment.length,
      updated: updatedCount
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}