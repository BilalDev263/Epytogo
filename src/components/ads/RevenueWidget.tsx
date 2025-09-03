"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Eye, MousePointer, Calendar, BarChart3 } from 'lucide-react';

interface RevenueData {
  totals: {
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
  };
  bySource: Array<{
    source: string;
    revenue: number;
    impressions: number;
    clicks: number;
  }>;
  activeAds: Array<{
    id: string;
    title: string;
    advertiser: string;
    impressions: number;
    clicks: number;
    spent: number;
    budget: number;
    position: string;
  }>;
}

const RevenueWidget: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`/api/revenue?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Erreur chargement revenus:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getCTR = (clicks: number, impressions: number): number => {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  };

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'ADVERTISEMENTS': return 'Publicités';
      case 'RESERVATIONS': return 'Réservations';
      case 'AFFILIATE': return 'Affiliation';
      case 'PREMIUM': return 'Premium';
      default: return source;
    }
  };

  const getPeriodLabel = (p: string): string => {
    switch (p) {
      case 'today': return "Aujourd'hui";
      case 'week': return '7 derniers jours';
      case 'month': return '30 derniers jours';
      case 'year': return 'Cette année';
      default: return p;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return null;
  }

  const { totals, bySource, activeAds } = revenueData;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Revenus publicitaires
          </h3>
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">7 jours</option>
          <option value="month">30 jours</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Revenus</span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-200">
            {formatCurrency(totals.totalRevenue)}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Impressions</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
            {formatNumber(totals.totalImpressions)}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Clics</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
            {formatNumber(totals.totalClicks)}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">CTR</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
            {getCTR(totals.totalClicks, totals.totalImpressions).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Revenus par source */}
      {bySource.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenus par source
          </h4>
          <div className="space-y-3">
            {bySource.map((source) => (
              <div
                key={source.source}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {getSourceLabel(source.source)}
                </span>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(source.revenue)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(source.impressions)} vues • {formatNumber(source.clicks)} clics
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pubs actives */}
      {activeAds.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publicités actives ({activeAds.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-900 dark:text-white">Publicité</th>
                  <th className="text-right py-2 text-gray-900 dark:text-white">Impressions</th>
                  <th className="text-right py-2 text-gray-900 dark:text-white">Clics</th>
                  <th className="text-right py-2 text-gray-900 dark:text-white">Dépensé</th>
                  <th className="text-right py-2 text-gray-900 dark:text-white">Budget</th>
                </tr>
              </thead>
              <tbody>
                {activeAds.slice(0, 5).map((ad) => (
                  <tr key={ad.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {ad.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {ad.advertiser} • {ad.position}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-2 text-gray-900 dark:text-white">
                      {formatNumber(ad.impressions)}
                    </td>
                    <td className="text-right py-2 text-gray-900 dark:text-white">
                      {formatNumber(ad.clicks)}
                    </td>
                    <td className="text-right py-2 text-gray-900 dark:text-white">
                      {formatCurrency(ad.spent)}
                    </td>
                    <td className="text-right py-2 text-gray-900 dark:text-white">
                      {formatCurrency(ad.budget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Revenus simulés pour démonstration • CPM: 2,50€ • CPC: 0,25€
      </div>
    </div>
  );
};

export default RevenueWidget;