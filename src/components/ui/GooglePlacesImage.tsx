// src/components/ui/GooglePlacesImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { PlacesImageService } from "@/services/PlacesImageService";

interface GooglePlacesImageProps {
  photoName?: string;
  alt: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  fallbackGradient?: string;
}

export const GooglePlacesImage = ({
  photoName,
  alt,
  className = "",
  maxWidth = 400,
  maxHeight = 400,
  fallbackGradient = "from-yellow-400 via-orange-400 to-red-400"
}: GooglePlacesImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Si pas de photo ou erreur, afficher le gradient avec icône
  if (!photoName || imageError) {
    return (
      <div className={`relative bg-gradient-to-br ${fallbackGradient} overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = PlacesImageService.getImageUrl(photoName, { maxWidth, maxHeight });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton pendant le chargement */}
      {imageLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} animate-pulse z-10`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
      )}
      
      {/* Image réelle */}
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-opacity duration-500"
        style={{ opacity: imageLoading ? 0 : 1 }}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          console.warn(`Failed to load Google Places image: ${photoName}`);
          setImageError(true);
          setImageLoading(false);
        }}
      />
      
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 z-5"></div>
    </div>
  );
};