import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/db/prisma';

// Mettre à jour un établissement (notamment la vérification)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth('ADMIN');

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    const body = await request.json();
    const { isVerified, isActive, name, description, phone, email, website } = body;

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: params.id },
      data: {
        ...(isVerified !== undefined && { isVerified }),
        ...(isActive !== undefined && { isActive }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website })
      },
      include: {
        owner: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            reservations: true,
            staff: true
          }
        }
      }
    });

    return NextResponse.json(updatedEstablishment);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un établissement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth('ADMIN');

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true } },
        reservations: { select: { id: true } }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier s'il y a des réservations
    if (establishment.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un établissement avec des réservations existantes' },
        { status: 400 }
      );
    }

    // Supprimer l'établissement et remettre le propriétaire en utilisateur normal
    await prisma.$transaction([
      prisma.establishment.delete({
        where: { id: params.id }
      }),
      prisma.user.update({
        where: { id: establishment.owner.id },
        data: { role: 'USER' }
      })
    ]);

    return NextResponse.json({ message: 'Établissement supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}