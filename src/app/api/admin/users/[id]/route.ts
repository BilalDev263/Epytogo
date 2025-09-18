import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, canModifyUser, canAssignRole } from '@/lib/admin-auth';
import { prisma } from '@/db/prisma';

// Mettre à jour un utilisateur
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

    const currentUser = authResult.user!;

    const body = await request.json();
    const { firstname, lastname, email, role } = body;

    // Vérifier que l'utilisateur à modifier existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true }
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions de modification
    if (!canModifyUser(currentUser.role, userToUpdate.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Vérifier les permissions d'assignation de rôle
    if (role && !canAssignRole(currentUser.role, role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes pour ce rôle' }, { status: 403 });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(firstname !== undefined && { firstname }),
        ...(lastname !== undefined && { lastname }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role })
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);

    // Gestion de l'erreur de duplication d'email
    if (error instanceof Error && error.message.includes('email')) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur
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

    const currentUser = authResult.user!;

    // Empêcher l'auto-suppression
    if (currentUser.id === params.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous supprimer vous-même' }, { status: 400 });
    }

    // Vérifier que l'utilisateur à supprimer existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions de suppression
    if (!canModifyUser(currentUser.role, userToDelete.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Supprimer l'utilisateur (en cascade grâce au schema Prisma)
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}