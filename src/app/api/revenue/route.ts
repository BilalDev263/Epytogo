import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // week, month, year
    const source = searchParams.get("source"); // ADVERTISEMENTS, RESERVATIONS, etc.

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateFilter = {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        dateFilter = {
          date: { gte: weekAgo }
        };
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        dateFilter = {
          date: { gte: monthAgo }
        };
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        yearAgo.setHours(0, 0, 0, 0);
        dateFilter = {
          date: { gte: yearAgo }
        };
        break;
    }

    let whereClause = dateFilter;
    if (source) {
      whereClause.source = source;
    }

    const revenues = await prisma.revenue.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Calculer les totaux
    const totals = revenues.reduce((acc, revenue) => ({
      totalRevenue: acc.totalRevenue + revenue.revenue,
      totalImpressions: acc.totalImpressions + revenue.impressions,
      totalClicks: acc.totalClicks + revenue.clicks
    }), {
      totalRevenue: 0,
      totalImpressions: 0,
      totalClicks: 0
    });

    // Grouper par source
    const bySource = revenues.reduce((acc, revenue) => {
      if (!acc[revenue.source]) {
        acc[revenue.source] = {
          source: revenue.source,
          revenue: 0,
          impressions: 0,
          clicks: 0
        };
      }
      acc[revenue.source].revenue += revenue.revenue;
      acc[revenue.source].impressions += revenue.impressions;
      acc[revenue.source].clicks += revenue.clicks;
      return acc;
    }, {} as any);

    // Statistiques des pubs actives
    const activeAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      select: {
        id: true,
        title: true,
        advertiser: true,
        impressions: true,
        clicks: true,
        spent: true,
        budget: true,
        position: true
      }
    });

    return NextResponse.json({
      revenues,
      totals,
      bySource: Object.values(bySource),
      activeAds,
      period
    });

  } catch (error) {
    console.error("Erreur récupération revenus:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}