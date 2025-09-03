import db from "./prisma";

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