import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

const sampleAds = [
  {
    title: "Hôtel Pyramids View - Le Caire",
    description: "Vue imprenable sur les pyramides. Réservez maintenant et économisez 30%!",
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73982?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/pyramids-hotel",
    advertiser: "Pyramids View Hotel",
    position: "HEADER_BANNER",
    budget: 500,
    cpm: 2.5,
    cpc: 0.25
  },
  {
    title: "Restaurant Abu El Sid - Cuisine Authentique",
    description: "Découvrez les saveurs authentiques de l'Égypte dans une ambiance traditionnelle.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/abu-el-sid",
    advertiser: "Abu El Sid Restaurant",
    position: "SIDEBAR_TOP",
    budget: 300,
    cpm: 2.0,
    cpc: 0.30
  },
  {
    title: "Croisière sur le Nil - 3 jours/2 nuits",
    description: "Vivez une expérience inoubliable sur le mythique fleuve du Nil. Tout inclus!",
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73982?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/nile-cruise",
    advertiser: "Nile Dreams Tours",
    position: "CONTENT_TOP",
    budget: 750,
    cpm: 3.0,
    cpc: 0.40
  },
  {
    title: "Assurance Voyage Égypte",
    description: "Voyagez l'esprit tranquille avec notre assurance voyage complète.",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/travel-insurance",
    advertiser: "TravelSafe Insurance",
    position: "SIDEBAR_BOTTOM",
    budget: 200,
    cpm: 1.8,
    cpc: 0.22
  },
  {
    title: "Excursion Louxor - Vallée des Rois",
    description: "Explorez les tombes des pharaons avec un guide égyptologue professionnel.",
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73982?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/luxor-tour",
    advertiser: "Egypt Adventure Tours",
    position: "PLACE_DETAILS",
    budget: 400,
    cpm: 2.2,
    cpc: 0.28
  },
  {
    title: "Vol Paris-Le Caire dès 299€",
    description: "Réservez votre vol pour l'Égypte au meilleur prix. Offre limitée!",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
    targetUrl: "https://example.com/flights-egypt",
    advertiser: "EgyptAir",
    position: "CONTENT_BOTTOM",
    budget: 600,
    cpm: 2.8,
    cpc: 0.35
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Insertion des publicités d'exemple...");

    // Supprimer les anciennes pubs d'exemple
    await prisma.advertisement.deleteMany({
      where: {
        advertiser: {
          in: sampleAds.map(ad => ad.advertiser)
        }
      }
    });

    // Insérer les nouvelles pubs
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 jours

    for (const adData of sampleAds) {
      await prisma.advertisement.create({
        data: {
          ...adData,
          startDate,
          endDate,
          isActive: true
        }
      });
    }

    // Créer quelques revenus d'exemple pour les derniers jours
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const baseRevenue = Math.random() * 50 + 10; // 10-60€ par jour
      const impressions = Math.floor(Math.random() * 2000 + 500); // 500-2500 impressions
      const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR

      await prisma.revenue.upsert({
        where: {
          date_source: {
            date,
            source: 'ADVERTISEMENTS'
          }
        },
        update: {
          revenue: baseRevenue,
          impressions,
          clicks
        },
        create: {
          date,
          source: 'ADVERTISEMENTS',
          revenue: baseRevenue,
          impressions,
          clicks,
          details: `Revenus simulés pour le ${date.toLocaleDateString('fr-FR')}`
        }
      });
    }

    return NextResponse.json({
      message: `${sampleAds.length} publicités insérées avec succès!`,
      ads: sampleAds.length,
      revenue_days: 7
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'insertion des publicités", details: error },
      { status: 500 }
    );
  }
}