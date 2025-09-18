import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API pour promouvoir le premier utilisateur en SUPER_ADMIN (pour l'initialisation)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier s'il y a déjà un SUPER_ADMIN
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Un super administrateur existe déjà' },
        { status: 400 }
      );
    }

    // Promouvoir l'utilisateur actuel en SUPER_ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true
      }
    });

    return NextResponse.json({
      message: 'Utilisateur promu en super administrateur avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la promotion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}