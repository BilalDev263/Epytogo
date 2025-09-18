"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  advertiser: string;
  position: string;
}

interface AdBannerProps {
  position: 'HEADER_BANNER' | 'SIDEBAR_LEFT' | 'SIDEBAR_RIGHT' | 'SIDEBAR_TOP' | 'SIDEBAR_BOTTOM' | 'CONTENT_TOP' | 'CONTENT_BOTTOM' | 'MOBILE_BOTTOM' | 'PLACE_DETAILS' | 'SEARCH_RESULTS';
  className?: string;
  limit?: number;
}

const sampleAds: Ad[] = [
  {
    id: "1",
    title: "Vols pas chers - Skyscanner ✈️",
    description: "Comparez des millions de vols, trouvez les meilleures offres et réservez en toute confiance.",
    imageUrl: "https://static.air-indemnite.com/www/storage/images/W1siZiIsIjIwMjQvMDIvMDcvMTQvNTMvMTkvZTY0Y2MxMGItZTYzNi00ZTJiLTlhMjItYjk0ZDg0Yzk4NzYwL3NreXNjYW5uZXIuanBnIl0sWyJwIiwidGh1bWIiLCI4NTB4MzUwIyJdXQ/skyscanner.jpg?sha=64e8368baff0705b",
    targetUrl: "https://skyscanner.fr",
    advertiser: "Skyscanner",
    position: "SIDEBAR_LEFT"
  },
  {
    id: "2", 
    title: "Vols pas chers - Skyscanner ✈️",
    description: "Comparez des millions de vols, trouvez les meilleures offres et réservez en toute confiance.",
    imageUrl: "https://static.air-indemnite.com/www/storage/images/W1siZiIsIjIwMjQvMDIvMDcvMTQvNTMvMTkvZTY0Y2MxMGItZTYzNi00ZTJiLTlhMjItYjk0ZDg0Yzk4NzYwL3NreXNjYW5uZXIuanBnIl0sWyJwIiwidGh1bWIiLCI4NTB4MzUwIyJdXQ/skyscanner.jpg?sha=64e8368baff0705b",
    targetUrl: "https://skyscanner.fr",
    advertiser: "Skyscanner",
    position: "SIDEBAR_RIGHT"
  }
];

const AdBanner: React.FC<AdBannerProps> = ({ position, className = '', limit = 1 }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filteredAds = sampleAds
      .filter(ad => ad.position === position)
      .filter(ad => !dismissedAds.has(ad.id))
      .slice(0, limit);
    
    setAds(filteredAds);
  }, [position, limit, dismissedAds]);

  const handleAdClick = (ad: Ad) => {
    console.log('🎯 Clic sur annonce:', ad.advertiser, 'URL:', ad.targetUrl);
    try {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Erreur ouverture lien:', error);
      // Fallback: utiliser window.location
      window.location.href = ad.targetUrl;
    }
  };


  const getAdStyles = () => {
    switch (position) {
      case 'SIDEBAR_LEFT':
        return 'w-full max-w-[280px] h-[500px]';
      case 'SIDEBAR_RIGHT':
        return 'w-full max-w-[280px] h-[500px]';
      case 'HEADER_BANNER':
        return 'w-full h-24 md:h-32';
      case 'SIDEBAR_TOP':
      case 'SIDEBAR_BOTTOM':
        return 'w-full max-w-sm h-48';
      case 'CONTENT_TOP':
      case 'CONTENT_BOTTOM':
        return 'w-full h-32 md:h-40';
      case 'MOBILE_BOTTOM':
        return 'fixed bottom-0 left-0 right-0 h-16 z-40 md:hidden';
      case 'PLACE_DETAILS':
        return 'w-full h-36';
      case 'SEARCH_RESULTS':
        return 'w-full h-20 md:h-24';
      default:
        return 'w-full h-32';
    }
  };

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {ads.map((ad, index) => (
        <div
          key={ad.id}
          className={`${getAdStyles()} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-700 rounded-xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${index > 0 ? 'mt-4' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Clic détecté sur:', ad.advertiser);
            handleAdClick(ad);
          }}
        >
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
            Sponsorisé
          </div>

          <div className="flex flex-col h-full">
            {ad.imageUrl && (
              <div className="h-[60%] relative">
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-3">
                  {ad.title}
                </h4>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 mb-4">
                  {ad.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {ad.advertiser}
                </span>
                
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Découvrir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdBanner;