// src/app/api/auth/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le compte est déjà activé
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Compte déjà activé' },
        { status: 200 }
      );
    }

    // Activer le compte
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() }
    });

    return NextResponse.json(
      { message: 'Compte activé avec succès' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur activation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}