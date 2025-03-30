// src/db/visit.ts - VERSION SIMPLE
import db from "./prisma";

// Enregistrer une visite (remplace si existe déjà)
export async function recordVisit(userId: string, placeId: string, placeName: string) {
  try {
    await db.visit.upsert({
      where: {
        userId_placeId: { userId, placeId }
      },
      update: {
        visitedAt: new Date()
      },
      create: {
        userId,
        placeId,
        placeName,
        visitedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Erreur enregistrement visite:", error);
  }
}

// Récupérer les 5 dernières visites
export async function getLastVisits(userId: string) {
  try {
    return await db.visit.findMany({
      where: { userId },
      orderBy: { visitedAt: 'desc' },
      take: 5
    });
  } catch (error) {
    console.error("Erreur récupération visites:", error);
    return [];
  }
}