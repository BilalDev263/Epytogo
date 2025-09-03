import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json({ error: "ID pub manquant" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // Récupérer la pub
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId }
    });

    if (!ad) {
      return NextResponse.json({ error: "Pub non trouvée" }, { status: 404 });
    }

    let userId = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      userId = user?.id || null;
    }

    // Vérifier si ce n'est pas un double clic (même IP, même pub, dernières 5 minutes)
    const recentClick = await prisma.adClick.findFirst({
      where: {
        adId,
        ipAddress,
        clickedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        }
      }
    });

    if (recentClick) {
      return NextResponse.json({ message: "Clic déjà enregistré" });
    }

    // Enregistrer le clic
    const adClick = await prisma.adClick.create({
      data: {
        adId,
        userId,
        ipAddress,
        userAgent,
        revenue: ad.cpc
      }
    });

    // Mettre à jour les statistiques de la pub
    await prisma.advertisement.update({
      where: { id: adId },
      data: {
        clicks: { increment: 1 },
        spent: { increment: ad.cpc }
      }
    });

    // Mettre à jour les revenus quotidiens
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.revenue.upsert({
      where: {
        date_source: {
          date: today,
          source: 'ADVERTISEMENTS'
        }
      },
      update: {
        clicks: { increment: 1 },
        revenue: { increment: ad.cpc }
      },
      create: {
        date: today,
        source: 'ADVERTISEMENTS',
        clicks: 1,
        revenue: ad.cpc
      }
    });

    return NextResponse.json({ 
      message: "Clic enregistré",
      revenue: ad.cpc 
    });

  } catch (error) {
    console.error("Erreur enregistrement clic:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}