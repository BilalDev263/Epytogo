import prisma from "@/db/prisma";
import { sampleAds } from "@/data/sampleAds";

async function seedAds() {
  console.log("🚀 Insertion des publicités d'exemple...");

  try {
    // Supprimer les anciennes pubs d'exemple
    await prisma.advertisement.deleteMany({
      where: {
        advertiser: {
          in: sampleAds.map(ad => ad.advertiser)
        }
      }
    });

    // Insérer les nouvelles pubs
    for (const adData of sampleAds) {
      await prisma.advertisement.create({
        data: {
          ...adData,
          isActive: true
        }
      });
    }

    console.log(`✅ ${sampleAds.length} publicités insérées avec succès!`);

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

    console.log("✅ Revenus d'exemple créés pour les 7 derniers jours!");

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exporter pour utilisation en API ou script
export default seedAds;

// Si exécuté directement
if (require.main === module) {
  seedAds();
}