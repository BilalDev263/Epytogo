"use client";

import React from 'react';
import RevenueWidget from '@/components/ads/RevenueWidget';
import AdBanner from '@/components/ads/AdBanner';
import { DollarSign, TrendingUp, Eye, MousePointer } from 'lucide-react';

const RevenueAdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <DollarSign className="h-10 w-10 text-green-600" />
            Tableau de bord publicitaire
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Suivez vos revenus publicitaires et performances en temps réel
          </p>
        </div>

        {/* Widget principal des revenus */}
        <div className="mb-8">
          <RevenueWidget />
        </div>

        {/* Exemples de publicités en action */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            Aperçu des publicités en cours
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Bannière Header</h4>
              <AdBanner position="HEADER_BANNER" />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sidebar Top</h4>
              <AdBanner position="SIDEBAR_TOP" />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contenu Top</h4>
              <AdBanner position="CONTENT_TOP" />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Détails Lieu</h4>
              <AdBanner position="PLACE_DETAILS" />
            </div>
          </div>
        </div>

        {/* Informations sur le système publicitaire */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
            Système publicitaire automatisé
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">CPM</div>
              <div className="text-lg font-bold text-green-600">2,50€</div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <MousePointer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">CPC</div>
              <div className="text-lg font-bold text-blue-600">0,25€</div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">CTR Moyen</div>
              <div className="text-lg font-bold text-purple-600">2,5%</div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Positions</div>
              <div className="text-lg font-bold text-yellow-600">8 types</div>
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p><strong>🎯 Ciblage intelligent :</strong> Les publicités sont affichées selon la position et rotent automatiquement</p>
            <p><strong>📊 Tracking automatique :</strong> Impressions et clics suivis en temps réel avec protection anti-spam</p>
            <p><strong>💰 Revenus simulés :</strong> Génération automatique de revenus basée sur CPM/CPC réalistes</p>
            <p><strong>🔄 Rotation des pubs :</strong> Système de rotation équitable basé sur le budget et les performances</p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          💡 Cette page démontre un système publicitaire complet avec suivi des revenus
        </div>
      </div>
    </div>
  );
};

export default RevenueAdminPage;