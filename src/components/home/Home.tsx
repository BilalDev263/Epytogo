// src/components/home/Home.tsx (mise à jour avec intégration chatbot)
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
import { Search, Map, Grid, Filter, Sparkles } from "lucide-react";
import { adaptPlacesForCards } from "@/utils/placeAdapter";
import TravelChatbot from "../TravelChatbot";
import { VisitHistory } from "./VisitHistory";

export function Home() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceResult[]>([]);
  const [searchSource, setSearchSource] = useState<'manual' | 'chatbot'>('manual'); // Source de la recherche
  
  // États pour l'autocomplétion
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

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

  // Appliquer les filtres quand selectedTypes change et qu'on n'a pas de recherche active
  useEffect(() => {
    if (!query.trim() && places.length > 0) {
      console.log('🔄 Application des filtres aux lieux populaires:', selectedTypes.length === 0 ? 'TOUS' : selectedTypes);
      applyFilters(places, selectedTypes);
    }
  }, [selectedTypes, query]); // Surveiller selectedTypes et query, mais pas places pour éviter les boucles

  // Appliquer les filtres quand les places sont chargés pour la première fois
  useEffect(() => {
    if (places.length > 0 && filteredPlaces.length === 0) {
      console.log('🎯 Premier filtrage des lieux chargés');
      applyFilters(places, selectedTypes);
    }
  }, [places.length]); // Seulement quand le nombre de places change

  // Dans Home.tsx - REMPLACER la fonction handleQueryChange par celle-ci :

// Gestion de l'autocomplétion avec Google Places API
const handleQueryChange = async (value: string) => {
  setQuery(value);
  
  // Si l'utilisateur tape manuellement, on remet en mode manual
  if (searchSource === 'chatbot') {
    setSearchSource('manual');
  }

  // Réinitialiser la sélection
  setSelectedSuggestionIndex(-1);

  // Autocomplétion après 3 caractères avec Google Places API
  if (value.length >= 3) {
    setIsLoadingSuggestions(true);
    
    try {
      // Construire les types à inclure basés sur les filtres sélectionnés
      let includedTypes: string[] = [];
      if (selectedTypes.length > 0) {
        includedTypes = selectedTypes;
      } else {
        // Si aucun filtre, inclure tous les types principaux
        includedTypes = ["restaurant", "lodging", "tourist_attraction", "museum", "park"];
      }

      // Utiliser l'API Google Places Autocomplete
      const autocompleteResults = await service.autocomplete({
        input: value,
        locationBias: {
          circle: {
            center: { latitude: 26.8206, longitude: 30.8025 }, // Centre de l'Égypte
            radius: 50000// 500km de rayon
          }
        },
        includedTypes: includedTypes,
        languageCode: "fr"      });

      if (autocompleteResults?.suggestions && autocompleteResults.suggestions.length > 0) {
        // Extraire les textes des suggestions
        const suggestionTexts = autocompleteResults.suggestions
          .map((suggestion: any) => {
            // Prioriser le texte principal (displayName)
            if (suggestion.placePrediction?.text?.text) {
              return suggestion.placePrediction.text.text;
            }
            // Fallback sur structuredFormat si disponible
            if (suggestion.placePrediction?.structuredFormat?.mainText?.text) {
              return suggestion.placePrediction.structuredFormat.mainText.text;
            }
            return null;
          })
          .filter(Boolean) // Supprimer les valeurs null
          .slice(0, 5); // Limiter à 5 suggestions

        setSuggestions(suggestionTexts);
        setShowSuggestions(suggestionTexts.length > 0);
      } else {
        // Si pas de résultats de l'API, suggestions vides
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erreur autocomplétion Google Places:", error);
      
      // En cas d'erreur, utiliser un fallback simple basé sur les filtres
      const fallbackSuggestions = getFallbackSuggestions(value);
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(fallbackSuggestions.length > 0);
    } finally {
      setIsLoadingSuggestions(false);
    }
  } else {
    setShowSuggestions(false);
    setSuggestions([]);
  }
};

// Fonction de fallback en cas d'erreur API
const getFallbackSuggestions = (value: string): string[] => {
  const fallbackData: { [key: string]: string[] } = {
    restaurant: [
      "restaurants au Caire", "restaurants à Alexandrie", "restaurants à Luxor",
      "Sequoia", "Abou Tarek", "Fish Market Alexandria", "restaurants égyptiens"
    ],
    lodging: [
      "hôtels au Caire", "hôtels à Alexandrie", "hôtels à Luxor",
      "Four Seasons Cairo", "Winter Palace Luxor", "hôtels de luxe Égypte"
    ],
    tourist_attraction: [
      "Pyramides de Gizeh", "Temple de Karnak", "Vallée des Rois",
      "Bibliothèque d'Alexandrie", "Khan el-Khalili", "attractions touristiques"
    ]
  };

  let relevantSuggestions: string[] = [];

  if (selectedTypes.length > 0) {
    // Utiliser les suggestions basées sur les filtres sélectionnés
    selectedTypes.forEach(type => {
      if (fallbackData[type]) {
        relevantSuggestions.push(...fallbackData[type]);
      }
    });
  } else {
    // Si aucun filtre, utiliser toutes les suggestions
    relevantSuggestions = Object.values(fallbackData).flat();
  }

  // Filtrer par le texte saisi et limiter à 5
  return relevantSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5);
};

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    // Optionnel : lancer automatiquement la recherche
    // performSearch(suggestion, 'manual');
  };

  // Gestion des touches clavier pour les suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour calculer le nombre max de résultats selon les filtres
  const getMaxResults = () => {
    const selectedCount = selectedTypes.length;
    if (selectedCount === 0) return 20; // Tous types, demander plus
    if (selectedCount === 1) return 8; // 1 type, bon nombre
    if (selectedCount === 2) return 12; // 2 types, 6 par type
    return 15; // 3 types, 5 par type
  };

  const loadPopularPlaces = async () => {
    setLoading(true);
    try {
      const maxResults = 20; // Demander plus de lieux populaires pour avoir de la variété
      
      // Recherche de lieux populaires en Égypte avec tous les types
      const results = await service.searchText({
        textQuery: "popular places restaurants hotels tourist attractions museums Egypt Cairo Alexandria Luxor",
        languageCode: "fr",
        maxResultCount: maxResults,
      });

      if (results.places && results.places.length > 0) {
        console.log('🏺 Lieux populaires chargés:', results.places.length, 'résultats');
        console.log('🔍 Types trouvés:', Array.from(new Set(results.places.flatMap(p => p.types || []))));
        setPlaces(results.places);
        applyFilters(results.places, selectedTypes);
      } else {
        // Fallback avec searchNearby si searchText ne donne rien
        const nearbyResults = await service.searchNearby({
          locationRestriction: {
            circle: {
              center: { latitude: 26.8206, longitude: 30.8025 },
              radius: 500000
            }
          },
          includedTypes: ["restaurant", "lodging", "tourist_attraction", "museum", "park", "zoo"],
          maxResultCount: maxResults,
          languageCode: "fr",
        });
        
        if (nearbyResults.places && nearbyResults.places.length > 0) {
          console.log('🏺 Lieux proches chargés:', nearbyResults.places.length, 'résultats');
          setPlaces(nearbyResults.places);
          applyFilters(nearbyResults.places, selectedTypes);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des lieux :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche unifiée
  const performSearch = async (searchQuery: string, source: 'manual' | 'chatbot' = 'manual') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchSource(source);
    
    try {
      const maxResults = getMaxResults();
      
      // Construire la requête en fonction des filtres sélectionnés
      let enhancedQuery = searchQuery;
      
      // Si des filtres sont sélectionnés, on enrichit la requête
      if (selectedTypes.length > 0) {
        const typeLabels = selectedTypes.map(type => {
          if (type === 'restaurant') return 'restaurants';
          if (type === 'lodging') return 'hotels';
          if (type === 'tourist_attraction') return 'attractions';
          return type;
        }).join(' ');
        
        enhancedQuery = `${typeLabels} ${searchQuery}`;
        console.log('🔍 Requête enrichie avec filtres sélectionnés:', enhancedQuery);
      } else {
        // Aucun filtre sélectionné = recherche tous types de lieux
        console.log('🔍 Recherche tous types (aucun filtre sélectionné):', enhancedQuery);
      }
      
      const results = await service.searchText({
        textQuery: `${enhancedQuery} Égypte`,
        languageCode: "fr",
        maxResultCount: maxResults,
      });

      if (results.places && results.places.length > 0) {
        const newPlaces = results.places;
        setPlaces(newPlaces);
        applyFilters(newPlaces);
        
        // Si la recherche vient du chatbot, faire défiler vers les résultats
        if (source === 'chatbot') {
          setTimeout(() => {
            const resultsSection = document.getElementById('search-results');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
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

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await performSearch(query, 'manual');
  };

  const applyFilters = (placesToFilter: PlaceResult[] = places, newSelectedTypes?: string[]) => {
    let filtered = placesToFilter;

    if (selectedTypes.length > 0) {
      filtered = placesToFilter.filter(place =>
        place.types?.some(type => selectedTypes.includes(type))
      );
    }

    setFilteredPlaces(filtered);
  };

  const handleTypeFilter = async (type: string) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    
    // Si on a une requête de recherche active, relancer la recherche avec les nouveaux filtres
    if (query.trim()) {
      console.log('🔄 Relance de la recherche avec nouveaux filtres:', newSelectedTypes);
      
      // Utiliser les nouveaux filtres pour la recherche
      await performSearchWithTypes(query, newSelectedTypes, searchSource);
    } else {
      // Sinon, juste filtrer les résultats actuels (lieux populaires)
      applyFilters(places, newSelectedTypes);
    }
  };


  const handlePlaceClick = async (place: any) => {
    // D'abord naviguer vers la page de détails
    router.push(`/places/${place.placeId}`);
    
    // Puis enregistrer la visite (seulement si l'utilisateur est connecté)
    if (session?.user?.id) {
      try {
        await fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            placeId: place.placeId,
            placeName: place.name || place.displayName?.text || 'Lieu inconnu'
          }),
        });
        
        console.log('✅ Visite enregistrée:', place.name || place.displayName?.text);
      } catch (error) {
        console.error('❌ Erreur enregistrement visite:', error);
        // On ne fait pas planter l'app si l'enregistrement échoue
      }
    }
  };
  // Nouvelle fonction pour rechercher avec des types spécifiques
  const performSearchWithTypes = async (searchQuery: string, types: string[], source: 'manual' | 'chatbot' = 'manual') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchSource(source);
    
    try {
      const maxResults = getMaxResults();
      
      // Construire la requête en fonction des types fournis
      let enhancedQuery = searchQuery;
      
      // Si des types sont fournis, on enrichit la requête
      if (types.length > 0) {
        const typeLabels = types.map(type => {
          if (type === 'restaurant') return 'restaurants';
          if (type === 'lodging') return 'hotels';
          if (type === 'tourist_attraction') return 'tourist attractions museums';
          return type;
        }).join(' ');
        
        enhancedQuery = `${typeLabels} ${searchQuery}`;
        console.log('🔍 Requête avec types spécifiés:', enhancedQuery, 'Types:', types);
      } else {
        // Aucun type spécifié = recherche TOUS types de lieux
        enhancedQuery = `restaurants hotels tourist attractions museums parks ${searchQuery}`;
        console.log('🔍 Recherche TOUS types:', enhancedQuery);
      }
      
      const results = await service.searchText({
        textQuery: `${enhancedQuery} Égypte`,
        languageCode: "fr",
        maxResultCount: Math.max(20, types.length * 5), // Plus de résultats pour avoir de la variété
      });

      if (results.places && results.places.length > 0) {
        console.log('📊 Résultats trouvés:', results.places.length);
        console.log('🏷️ Types dans les résultats:', Array.from(new Set(results.places.flatMap(p => p.types || []))));
        
        const newPlaces = results.places;
        setPlaces(newPlaces);
        applyFilters(newPlaces, types);
        
        // Si la recherche vient du chatbot, faire défiler vers les résultats
        if (source === 'chatbot') {
          setTimeout(() => {
            const resultsSection = document.getElementById('search-results');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      } else {
        console.log('❌ Aucun résultat trouvé');
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

  const handleMarkerClick = (place: PlaceResult) => {
    // Optionnel : comportement lors du clic sur un marqueur
    console.log("Marqueur cliqué :", place.displayName?.text);
  };

  const handleChatbotRecommendation = (recommendations: any) => {
    // Optionnel : Mise à jour de la recherche basée sur les recommandations du chatbot
    console.log('Recommandations du chatbot:', recommendations);
  };

  // NOUVELLE FONCTION : Gestion des mises à jour de recherche depuis le chatbot
  const handleChatbotSearchUpdate = (searchTerm: string) => {
    console.log('🤖 Chatbot a suggéré une recherche:', searchTerm);
    
    // Mettre à jour seulement la barre de recherche principale (pas de recherche automatique)
    setQuery(searchTerm);
    setSearchSource('chatbot');
    
    // Fermer les suggestions d'autocomplétion
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Pas de recherche automatique - l'utilisateur doit cliquer sur "Rechercher"
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
            Découvrez l'Égypte 🐪🏺
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Restaurants 🍽️, Hôtels 🏨 et Attractions Touristiques 🏛️
          </p>

          {/* Barre de recherche avec effet chatbot */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="search-container relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Rechercher..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      searchSource === 'chatbot' 
                        ? 'border-yellow-400 focus:ring-yellow-500 shadow-yellow-200 shadow-md' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } ${showSuggestions ? 'rounded-b-none' : ''}`}
                    autoComplete="off"
                  />
                  {searchSource === 'chatbot' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={`px-6 py-3 text-white transition-all duration-300 ${
                    searchSource === 'chatbot'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? "..." : "Rechercher"}
                </Button>
              </div>

              {/* Suggestions d'autocomplétion */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-l border-r border-b border-gray-300 dark:border-gray-600 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      Recherche via Google Places...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectSuggestion(suggestion)}
                          className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3 transition-colors ${
                            index === selectedSuggestionIndex
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <Search className={`h-4 w-4 ${
                            index === selectedSuggestionIndex 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-400'
                          }`} />
                          <span>{suggestion}</span>
                          {/* Indicateur Google Places */}
                          <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                            🌍 Places API
                          </span>
                        </button>
                      ))}
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} Google Places
                        {selectedTypes.length > 0 && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            • Filtré sur {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''}
                          </span>
                        )}
                        <br />
                        <span className="ml-1">↑↓ pour naviguer • ↵ pour sélectionner • ⎋ pour fermer</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                      <div className="mb-2">🔍 Aucune suggestion Google Places</div>
                      {selectedTypes.length > 0 ? (
                        <div className="text-xs">
                          Filtres actifs : {selectedTypes.map(t => getTypeLabel(t)).join(', ')}
                        </div>
                      ) : (
                        <div className="text-xs">Essayez un terme plus spécifique</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div> {/* 👈 FERMETURE de search-container */}

            {searchSource === 'chatbot' && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center justify-center gap-1 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Suggestion d'Anubis • Cliquez "Rechercher" pour lancer
                {selectedTypes.length === 0 ? (
                  <span className="ml-1 text-xs">(tous types de lieux)</span>
                ) : (
                  <span className="ml-1 text-xs">({selectedTypes.length} type(s) sélectionné(s))</span>
                )}
              </p>
            )}
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
              {selectedTypes.length === 0 ? (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center ml-2">
                  (tous types actifs)
                </span>
              ) : (
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center ml-2">
                  ({selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} sélectionné{selectedTypes.length > 1 ? 's' : ''})
                </span>
              )}
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
              {selectedTypes.length === 0 ? (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  • Tous types de lieux • Max {getMaxResults()} résultats
                </span>
              ) : (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  • Filtré sur {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} • Max {getMaxResults()} résultats
                </span>
              )}
            </p>
          </div>
        ) : null}

                  {/* Grille des résultats */}
        <div className="mb-8" id="search-results">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {query ? `Résultats pour "${query}"` : "Lieux populaires"}
              {searchSource === 'chatbot' && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 text-lg">🤖</span>
              )}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                {filteredPlaces.length} résultat(s)
              </span>
            </div>
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
                  onClick={() => handlePlaceClick(place)}  // 👈 CHANGEMENT ICI
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
        {/* 🎯 AJOUTER ICI LE BLOC VISITHISTORY - JUSTE APRÈS LA SECTION RÉSULTATS */}
        {session?.user && (
          <div className="mb-8">
            <VisitHistory />
          </div>
        )}

      </div>  {/* 👈 Cette div ferme probablement le container principal */}   
      {/* Chatbot de recommandations avec intégration */}
      <TravelChatbot 
        onRecommendation={handleChatbotRecommendation}
        onSearchUpdate={handleChatbotSearchUpdate}
      />
    </div>
  );
}