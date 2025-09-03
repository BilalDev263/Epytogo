import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

export async function POST(request: NextRequest) {
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
    const {
      placeId,
      placeName,
      placeType,
      reservationDate,
      timeSlot,
      roomNumber,
      numberOfGuests,
      specialRequests,
      totalPrice
    } = body;

    // Validation des données
    if (!placeId || !placeName || !placeType || !reservationDate) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const reservationDateTime = new Date(reservationDate);
    
    // Vérification des conflits selon le type de lieu
    let conflictCheck;
    
    if (placeType === "HOTEL") {
      // Pour les hôtels : même chambre, même date
      conflictCheck = await prisma.reservation.findFirst({
        where: {
          placeId,
          roomNumber,
          reservationDate: {
            gte: new Date(reservationDateTime.setHours(0, 0, 0, 0)),
            lt: new Date(reservationDateTime.setHours(23, 59, 59, 999))
          },
          status: {
            in: ["PENDING", "CONFIRMED"]
          }
        }
      });
    } else {
      // Pour restaurants/attractions : même lieu, même créneaux
      conflictCheck = await prisma.reservation.findFirst({
        where: {
          placeId,
          timeSlot,
          reservationDate: {
            gte: new Date(reservationDateTime.setHours(0, 0, 0, 0)),
            lt: new Date(reservationDateTime.setHours(23, 59, 59, 999))
          },
          status: {
            in: ["PENDING", "CONFIRMED"]
          }
        }
      });
    }

    if (conflictCheck) {
      return NextResponse.json({ 
        error: "Créneau déjà réservé" 
      }, { status: 409 });
    }

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        placeId,
        placeName,
        placeType,
        reservationDate: reservationDateTime,
        timeSlot,
        roomNumber,
        numberOfGuests: parseInt(numberOfGuests) || 1,
        specialRequests,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null
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

    return NextResponse.json(reservation);

  } catch (error) {
    console.error("Erreur création réservation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    let whereClause: any = {};
    
    if (placeId) {
      whereClause.placeId = placeId;
    } else {
      whereClause.userId = user.id;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        }
      },
      orderBy: {
        reservationDate: "desc"
      }
    });

    return NextResponse.json(reservations);

  } catch (error) {
    console.error("Erreur récupération réservations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}