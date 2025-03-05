// src/components/home/Home.tsx (mise à jour)
"use client";

import { Service } from "@/services/Service";
import { PlaceResult } from "@/services/ServiceInterface";
import { useStore } from "@/store/useStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CustomCard } from "./CustomCard";
import { SkeletonCard } from "./SkeletonCard";
import GoogleMapRender from "../GoogleMap";
import { Button } from "../ui/button";
import { Search, Map, Grid, Filter } from "lucide-react";
import { adaptPlacesForCards } from "@/utils/placeAdapter";

export function Home() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceResult[]>([]);

  const { data: session } = useSession();
  const { currentUser, setCurrentUser } = useStore();
  const router = useRouter();

  const service = useMemo(
    () => new Service("https://places.googleapis.com", "POST"),
    []
  );

  // Charger les lieux populaires d'Égypte au démarrage
  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user);
    }
    // Charger les lieux populaires même sans utilisateur connecté
    loadPopularPlaces();
  }, [session]);

  // Fonction pour calculer le nombre max de résultats selon les filtres
  const getMaxResults = () => {
    const selectedCount = selectedTypes.length;
    if (selectedCount === 0) return 8; // Par défaut
    if (selectedCount === 1) return 2; // 2 si un seul type
    if (selectedCount === 2) return 4; // 4 si deux types
    return 6; // 6 si trois types ou plus
  };

  const loadPopularPlaces = async () => {
    setLoading(true);
    try {
      const maxResults = getMaxResults();
      
      // Recherche de lieux populaires en Égypte
      const results = await service.searchText({
        textQuery: "best restaurants hotels attractions Egypt Cairo Alexandria Luxor",
        languageCode: "fr",
        maxResultCount: maxResults,
      });

      if (results.places && results.places.length > 0) {
        setPlaces(results.places);
        setFilteredPlaces(results.places);
      } else {
        // Fallback avec searchNearby si searchText ne donne rien
        const nearbyResults = await service.searchNearby({
          locationRestriction: {
            circle: {
              center: { latitude: 26.8206, longitude: 30.8025 },
              radius: 500000
            }
          },
          includedTypes: ["restaurant", "lodging", "tourist_attraction"],
          maxResultCount: maxResults,
          languageCode: "fr",
        });
        
        if (nearbyResults.places && nearbyResults.places.length > 0) {
          setPlaces(nearbyResults.places);
          setFilteredPlaces(nearbyResults.places);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des lieux :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const maxResults = getMaxResults();
      
      const results = await service.searchText({
        textQuery: `${query} Égypte`,
        languageCode: "fr",
        maxResultCount: maxResults,
      });

      if (results.places && results.places.length > 0) {
        const newPlaces = results.places;
        setPlaces(newPlaces);
        applyFilters(newPlaces);
      } else {
        // Aucun résultat trouvé
        setPlaces([]);
        setFilteredPlaces([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (placesToFilter: PlaceResult[] = places) => {
    let filtered = placesToFilter;

    if (selectedTypes.length > 0) {
      filtered = placesToFilter.filter(place =>
        place.types?.some(type => selectedTypes.includes(type))
      );
    }

    setFilteredPlaces(filtered);
  };

  const handleTypeFilter = (type: string) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    
    // Appliquer les filtres
    let filtered = places;
    if (newSelectedTypes.length > 0) {
      filtered = places.filter(place =>
        place.types?.some(t => newSelectedTypes.includes(t))
      );
    }
    setFilteredPlaces(filtered);
  };

  const handleMarkerClick = (place: PlaceResult) => {
    // Optionnel : comportement lors du clic sur un marqueur
    console.log("Marqueur cliqué :", place.displayName?.text);
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      restaurant: "🍽️ Restaurants",
      lodging: "🏨 Hôtels", 
      tourist_attraction: "🏛️ Attractions"
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec recherche */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Découvrez l'Égypte 🇪🇬
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Restaurants 🍽️, hôtels 🏨 et attractions touristiques 🏛️
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher des restaurants, hôtels..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "..." : "Rechercher"}
              </Button>
            </div>
          </form>

          {/* Filtres et contrôles d'affichage */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {/* Filtres par type */}
            <div className="flex gap-2">
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Filter className="h-4 w-4 mr-1" />
                Filtres :
              </span>
              {["restaurant", "lodging", "tourist_attraction"].map(type => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeFilter(type)}
                  className="text-sm"
                >
                  {getTypeLabel(type)}
                </Button>
              ))}
            </div>

            {/* Bouton carte/grille */}
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              {showMap ? (
                <>
                  <Grid className="h-4 w-4" />
                  Vue Grille
                </>
              ) : (
                <>
                  <Map className="h-4 w-4" />
                  Vue Carte
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Affichage conditionnel : Carte ou Grille */}
        {showMap ? (
          <div className="mb-8">
            <GoogleMapRender
              places={filteredPlaces}
              onMarkerClick={handleMarkerClick}
              className="w-full h-96 lg:h-[500px]"
            />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {filteredPlaces.length} lieu(x) affiché(s) sur la carte
              {selectedTypes.length > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  • Max {getMaxResults()} résultats selon filtres
                </span>
              )}
            </p>
          </div>
        ) : null}

        {/* Grille des résultats */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {query ? `Résultats pour "${query}"` : "Lieux populaires"}
            </h2>
            <span className="text-gray-600 dark:text-gray-400">
              {filteredPlaces.length} résultat(s)
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {adaptPlacesForCards(filteredPlaces).map((place, index) => (
                <CustomCard 
                  key={`${place.placeId}-${index}`} 
                  place={place}
                  onClick={() => {
                    // Navigation vers la page de détails du lieu avec Next.js router
                    router.push(`/places/${place.placeId}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                {query ? "Aucun résultat trouvé" : "Aucun lieu disponible"}
              </div>
              {query && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Essayez avec d'autres mots-clés
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}