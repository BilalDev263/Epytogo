"use client";

import { cn } from "@/lib/utils";
import { MapPin, Star, Clock, Phone } from "lucide-react";
import { GooglePlacesImage } from "../ui/GooglePlacesImage";

interface CustomCardProps {
  className?: string;
  place: {
    placeId: string;
    name: string;
    address: string;
    rating: number;
    photo?: string; // photoName de Google Places
    phoneNumber?: string;
    isOpen?: boolean;
  };
  onClick: () => void;
}

export const CustomCard = ({ className, place, onClick }: CustomCardProps) => {
  return (
    <div 
      className={cn(
        "group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100 dark:border-slate-700",
        className
      )}
      onClick={onClick}
    >
      <div className="relative h-48">
        <GooglePlacesImage
          photoName={place.photo}
          alt={place.name}
          className="h-full w-full"
          maxWidth={400}
          maxHeight={300}
        />
        
        {place.rating > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-800">{place.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
            place.isOpen 
              ? "bg-green-500/20 text-green-700 border border-green-300/50" 
              : "bg-red-500/20 text-red-700 border border-red-300/50"
          )}>
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                place.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
              )}></div>
              {place.isOpen ? "Ouvert" : "Fermé"}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
          {place.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{place.address}</span>
          </p>
          
          {place.phoneNumber && (
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span>{place.phoneNumber}</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {place.rating > 0 ? (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(place.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ({place.rating.toFixed(1)})
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">Pas de notes</span>
            )}
          </div>
          
          <button 
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium text-sm hover:underline transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Voir détails →
          </button>
        </div>
      </div>
    </div>
  );
};