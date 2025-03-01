// src/components/home/Home.tsx - Version modernisée
"use client";

import { Navigation } from "@/components/navigation/HomeNav";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { useNavigation } from "@/hooks/useNavigation";
import { Service } from "@/services/Service";
import { PlaceResult } from "@/services/ServiceInterface";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CustomCard } from "./CustomCard";

export const Home = () => {
  const { navItemsHomePage } = useNavigation();
  const [query, setQuery] = useState("");
  const { itemId } = useStore();
  const router = useRouter();

  const service = useMemo(
    () => new Service("https://places.googleapis.com", "POST"),
    []
  );

  const fetchPlaces = useCallback(async () => {
    if (itemId === "restaurant") {
      return service.searchRestaurants({ name: query });
    } else if (itemId === "hotel") {
      return service.searchHotels({ name: query });
    } else {
      return service.searchRestaurantsAndHotels({ name: query });
    }
  }, [itemId, query, service]);

  const {
    data: places = [],
    error,
    isLoading,
    refetch,
  } = useQuery<PlaceResult[], Error>({
    queryKey: ["places", query, itemId],
    queryFn: fetchPlaces,
    enabled: false,
  });

  const handleSubmit = (e?: FormEvent<HTMLFormElement> | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handlePlaceClick = (placeId: string) => {
    router.push(`/places/${placeId}`);
  };

  useEffect(() => {
    refetch();
  }, [refetch, itemId]);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-gray-950 dark:to-black transition-all duration-500">
      {/* Hero Section moderne */}
      <Container>
        <div className="text-center py-16">
          {/* Titre principal avec gradient */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 epytogo-gradient-text leading-tight">
            Découvrez L'Égypte
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Explorez les merveilles de l'Égypte antique. Des pyramides majestueuses aux temples sacrés, 
            trouvez les meilleurs restaurants et hôtels pour votre voyage inoubliable.
          </p>

          {/* Navigation moderne */}
          <div className="flex justify-center gap-2 p-6">
            {navItemsHomePage.map((item) => (
              <button
                key={item.id}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                  transform hover:scale-105 hover:shadow-lg
                  ${item.id === itemId 
                    ? 'epytogo-gradient text-gray-900 shadow-xl' 
                    : 'bg-gray-100 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                  }
                `}
                onClick={item.handleClick}
              >
                {item.icon}
                <span className="hidden md:inline">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Barre de recherche moderne */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="relative">
              <div className="relative bg-white/95 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center">
                  <Search className="absolute left-6 w-6 h-6 text-gray-500 dark:text-gray-500" />
                  <input
                    className="w-full h-16 pl-16 pr-40 bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 text-lg focus:outline-none"
                    name="search"
                    placeholder="Rechercher un restaurant, un hôtel..."
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    onClick={handleSubmit}
                    className="absolute right-2 h-12 px-8 epytogo-gradient text-gray-900 font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
            
            {/* Suggestions populaires */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['Pyramides de Gizeh', 'Temple de Karnak', 'Vallée des Rois', 'Alexandrie'].map((suggestion) => (
                <button 
                  key={suggestion}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 border border-gray-200 dark:border-white/10"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section des résultats */}
        <div className="pb-16">
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 rounded-xl text-red-400 dark:text-red-300 text-center">
              {error.message}
            </div>
          )}

          {places.length > 0 && (
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Résultats de recherche ({places.length})
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 border border-gray-200 dark:border-white/10">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          )}
          
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100 dark:border-slate-700">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              : places.map((place) => (
                  <CustomCard
                    key={place.id}
                    className="min-h-[300px] w-full"
                    place={{
                      placeId: place.id,
                      name: place.displayName.text,
                      address: place.formattedAddress,
                      rating: place.rating || 0,
                      photo: place.photos?.[0]?.name,
                      phoneNumber: place.internationalPhoneNumber,
                      isOpen: place.currentOpeningHours?.openNow
                    }}
                    onClick={() => handlePlaceClick(place.id)}
                  />
                ))
            }
          </div>

          {/* Message d'état vide */}
          {!isLoading && places.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/10 dark:to-orange-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-200 dark:border-yellow-400/20">
                <Search className="w-12 h-12 text-yellow-600 dark:text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Commencez votre exploration</h3>
              <p className="text-gray-600 dark:text-gray-500 max-w-md mx-auto">
                Utilisez la barre de recherche ci-dessus pour découvrir les meilleurs restaurants et hôtels d'Égypte.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};