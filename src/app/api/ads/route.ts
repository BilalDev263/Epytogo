import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const limit = parseInt(searchParams.get("limit") || "3");

    const now = new Date();
    
    let whereClause: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    };

    if (position) {
      whereClause.position = position;
    }

    const ads = await prisma.advertisement.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { clicks: 'asc' }, // Prioriser les pubs avec moins de clics
        { impressions: 'asc' }
      ]
    });

    // Mettre à jour le compteur d'impressions
    if (ads.length > 0) {
      await Promise.all(
        ads.map(ad => 
          prisma.advertisement.update({
            where: { id: ad.id },
            data: { 
              impressions: { increment: 1 },
              spent: { increment: ad.cpm / 1000 } // Coût par impression
            }
          })
        )
      );

      // Enregistrer les revenus quotidiens
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
          impressions: { increment: ads.length },
          revenue: { increment: ads.reduce((sum, ad) => sum + (ad.cpm / 1000), 0) }
        },
        create: {
          date: today,
          source: 'ADVERTISEMENTS',
          impressions: ads.length,
          revenue: ads.reduce((sum, ad) => sum + (ad.cpm / 1000), 0)
        }
      });
    }

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Erreur récupération pubs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      targetUrl,
      advertiser,
      position,
      budget,
      cpm,
      cpc,
      startDate,
      endDate
    } = body;

    const ad = await prisma.advertisement.create({
      data: {
        title,
        description,
        imageUrl,
        targetUrl,
        advertiser,
        position,
        budget: parseFloat(budget) || 0,
        cpm: parseFloat(cpm) || 2.5,
        cpc: parseFloat(cpc) || 0.25,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Erreur création pub:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}