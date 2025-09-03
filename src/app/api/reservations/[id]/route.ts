import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { status, specialRequests } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    });

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    if (reservation.userId !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(specialRequests && { specialRequests }),
        updatedAt: new Date()
      },
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

    return NextResponse.json(updatedReservation);

  } catch (error) {
    console.error("Erreur mise à jour réservation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    });

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    if (reservation.userId !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.reservation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Réservation supprimée" });

  } catch (error) {
    console.error("Erreur suppression réservation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}