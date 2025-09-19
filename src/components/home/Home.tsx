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
import { Search, Map, Grid, Filter, Sparkles, Building2, Plus } from "lucide-react";
import { adaptPlacesForCards } from "@/utils/placeAdapter";
import TravelChatbot from "../TravelChatbot";
import { VisitHistory } from "./VisitHistory";
import AdBanner from "@/components/ads/AdBanner";

export function Home() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceResult[]>([]);
  const [searchSource, setSearchSource] = useState<'manual' | 'chatbot'>('manual');
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  const { data: session } = useSession();
  const { currentUser, setCurrentUser } = useStore();
  const router = useRouter();

  const service = useMemo(() => {
    const serviceInstance = new Service("https://places.googleapis.com", "POST");
    serviceInstance.setMaxResults(4); // Limité à 4 résultats
    return serviceInstance;
  }, []);
  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user);
    }
    loadPopularPlaces();
  }, [session]);

  useEffect(() => {
    if (!query.trim() && places.length > 0) {
      console.log('🔄 Application des filtres aux lieux populaires:', selectedTypes.length === 0 ? 'TOUS' : selectedTypes);
      applyFilters(places, selectedTypes);
    }
  }, [selectedTypes, query]);

  useEffect(() => {
    if (places.length > 0 && filteredPlaces.length === 0) {
      console.log('🎯 Premier filtrage des lieux chargés');
      applyFilters(places, selectedTypes);
    }
  }, [places.length]);


const handleQueryChange = async (value: string) => {
  setQuery(value);
  
  if (searchSource === 'chatbot') {
    setSearchSource('manual');
  }

  setSelectedSuggestionIndex(-1);

  if (value.length >= 3) {
    setIsLoadingSuggestions(true);
    
    try {
      let includedTypes: string[] = [];
      if (selectedTypes.length > 0) {
        includedTypes = selectedTypes;
      } else {
        includedTypes = ["restaurant", "lodging", "tourist_attraction", "museum", "park"];
      }

      const autocompleteResults = await service.autocomplete({
        input: value,
        locationBias: {
          circle: {
            center: { latitude: 26.8206, longitude: 30.8025 },
            radius: 50000
          }
        },
        includedTypes: includedTypes,
        languageCode: "fr"      });

      if (autocompleteResults?.suggestions && autocompleteResults.suggestions.length > 0) {
        const suggestionTexts = autocompleteResults.suggestions
          .map((suggestion: any) => {
            if (suggestion.placePrediction?.text?.text) {
              return suggestion.placePrediction.text.text;
            }
            if (suggestion.placePrediction?.structuredFormat?.mainText?.text) {
              return suggestion.placePrediction.structuredFormat.mainText.text;
            }
            return null;
          })
          .filter(Boolean)
          .slice(0, 5);

        setSuggestions(suggestionTexts);
        setShowSuggestions(suggestionTexts.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erreur autocomplétion Google Places:", error);
      
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
      selectedTypes.forEach(type => {
      if (fallbackData[type]) {
        relevantSuggestions.push(...fallbackData[type]);
      }
    });
  } else {
    relevantSuggestions = Object.values(fallbackData).flat();
  }

  return relevantSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5);
};

  const selectSuggestion = async (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Déclencher la recherche automatiquement après sélection
    await performSearch(suggestion, 'manual');
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
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
          await selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          // Si aucune suggestion n'est sélectionnée, faire une recherche avec le query actuel
          if (query.trim()) {
            e.preventDefault();
            setShowSuggestions(false);
            await performSearch(query, 'manual');
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

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

  const getMaxResults = () => {
    const selectedCount = selectedTypes.length;
    if (selectedCount === 0) return 20;
    if (selectedCount === 1) return 8;
    if (selectedCount === 2) return 12;
    return 15;
  };

  const loadPopularPlaces = async () => {
    setLoading(true);
    try {
      const maxResults = 20;
      
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

  const performSearch = async (searchQuery: string, source: 'manual' | 'chatbot' = 'manual') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchSource(source);
    
    try {
      const maxResults = getMaxResults();
      
      let enhancedQuery = searchQuery;
      
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
        console.log('🔍 Recherche tous types (aucun filtre sélectionné):', enhancedQuery);
      }
      
      const finalQuery = `${enhancedQuery} Égypte`;
      console.log('🚀 Lancement recherche avec query:', finalQuery);
      console.log('📊 Paramètres de recherche:', { 
        textQuery: finalQuery, 
        languageCode: "fr", 
        maxResultCount: maxResults 
      });

      // Essayer d'abord sans "Égypte" pour voir si on obtient des résultats
      let results = await service.searchText({
        textQuery: enhancedQuery,
        languageCode: "fr",
        maxResultCount: maxResults,
      });

      // Si pas de résultats, essayer avec "Égypte"
      if (!results?.places || results.places.length === 0) {
        console.log('🔄 Tentative avec "Égypte" ajouté...');
        results = await service.searchText({
          textQuery: finalQuery,
          languageCode: "fr",
          maxResultCount: maxResults,
        });
      }

      console.log('📦 Résultats bruts reçus:', results);
      console.log('📍 Nombre de lieux trouvés:', results?.places?.length || 0);

      if (results?.places && results.places.length > 0) {
        const newPlaces = results.places;
        console.log('✅ Places à afficher:', newPlaces.length);
        setPlaces(newPlaces);
        applyFilters(newPlaces);
        
        if (source === 'chatbot') {
          setTimeout(() => {
            const resultsSection = document.getElementById('search-results');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      } else {
        console.log('❌ Aucun résultat trouvé pour:', finalQuery);
        setPlaces([]);
        setFilteredPlaces([]);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la recherche :", error);
      console.error("❌ Détails de l'erreur:", error.message || 'Erreur inconnue');
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
    
    if (query.trim()) {
      console.log('🔄 Relance de la recherche avec nouveaux filtres:', newSelectedTypes);
      
      await performSearchWithTypes(query, newSelectedTypes, searchSource);
    } else {
      applyFilters(places, newSelectedTypes);
    }
  };


  const handlePlaceClick = async (place: any) => {
    router.push(`/places/${place.placeId}`);
    
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
      }
    }
  };
  const performSearchWithTypes = async (searchQuery: string, types: string[], source: 'manual' | 'chatbot' = 'manual') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchSource(source);
    
    try {
      const maxResults = getMaxResults();
      
      let enhancedQuery = searchQuery;
      
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
        enhancedQuery = `restaurants hotels tourist attractions museums parks ${searchQuery}`;
        console.log('🔍 Recherche TOUS types:', enhancedQuery);
      }
      
      const results = await service.searchText({
        textQuery: `${enhancedQuery} Égypte`,
        languageCode: "fr",
        maxResultCount: Math.max(20, types.length * 5),
      });

      if (results.places && results.places.length > 0) {
        console.log('📊 Résultats trouvés:', results.places.length);
        console.log('🏷️ Types dans les résultats:', Array.from(new Set(results.places.flatMap(p => p.types || []))));
        
        const newPlaces = results.places;
        setPlaces(newPlaces);
        applyFilters(newPlaces, types);
        
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
    console.log("Marqueur cliqué :", place.displayName?.text);
  };

  const handleChatbotRecommendation = (recommendations: any) => {
    console.log('Recommandations du chatbot:', recommendations);
  };

  const handleChatbotSearchUpdate = (searchTerm: string) => {
    console.log('🤖 Chatbot a suggéré une recherche:', searchTerm);
    
    setQuery(searchTerm);
    setSearchSource('chatbot');
    
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Découvrez l'Égypte 🐪🏺
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Restaurants 🍽️, Hôtels 🏨 et Attractions Touristiques 🏛️
          </p>

          {/* Bouton pour enregistrer un établissement */}
          {session?.user && (
            <div className="mb-4 sm:mb-6">
              <Button
                onClick={() => router.push('/establishment/request')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 sm:gap-2 mx-auto text-xs sm:text-sm"
              >
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Enregistrer mon établissement</span>
                <span className="sm:hidden">Mon établissement</span>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 px-2">
                Vous êtes propriétaire d'un restaurant, hôtel ou attraction ? Rejoignez-nous !
              </p>
            </div>
          )}

          {/* Bannière publicitaire header */}
          <div className="mb-4 sm:mb-6 hidden sm:block">
            <AdBanner position="HEADER_BANNER" className="mx-auto" />
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4 sm:mb-6 px-2 sm:px-0">
            <div className="search-container relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 z-10" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Rechercher..."
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:border-transparent transition-all duration-300 ${
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
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white transition-all duration-300 ${
                    searchSource === 'chatbot'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? "..." : "Rechercher"}
                </Button>
              </div>

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
            </div>

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

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-2">
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
              <span className="flex items-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Filtres :</span>
              </span>
              {["restaurant", "lodging", "tourist_attraction"].map(type => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeFilter(type)}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <span className="sm:hidden">{getTypeLabel(type).split(' ')[0]}</span>
                  <span className="hidden sm:inline">{getTypeLabel(type)}</span>
                </Button>
              ))}
              {selectedTypes.length === 0 ? (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center ml-1 sm:ml-2 hidden sm:inline-flex">
                  (tous types actifs)
                </span>
              ) : (
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center ml-1 sm:ml-2">
                  <span className="sm:hidden">({selectedTypes.length})</span>
                  <span className="hidden sm:inline">({selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} sélectionné{selectedTypes.length > 1 ? 's' : ''})</span>
                </span>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              {showMap ? (
                <>
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Vue Grille</span>
                  <span className="sm:hidden">Grille</span>
                </>
              ) : (
                <>
                  <Map className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Vue Carte</span>
                  <span className="sm:hidden">Carte</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {showMap ? (
          <div className="mb-4 sm:mb-8 px-2 sm:px-0">
            <GoogleMapRender
              places={filteredPlaces}
              onMarkerClick={handleMarkerClick}
              className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] rounded-lg"
            />
            <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span className="sm:hidden">{filteredPlaces.length} lieu(x)</span>
              <span className="hidden sm:inline">{filteredPlaces.length} lieu(x) affiché(s) sur la carte</span>
              {selectedTypes.length === 0 ? (
                <span className="ml-1 sm:ml-2 text-green-600 dark:text-green-400">
                  <span className="hidden sm:inline">• Tous types de lieux • Max {getMaxResults()} résultats</span>
                  <span className="sm:hidden">• Tous</span>
                </span>
              ) : (
                <span className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400">
                  <span className="hidden sm:inline">• Filtré sur {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} • Max {getMaxResults()} résultats</span>
                  <span className="sm:hidden">• Filtré({selectedTypes.length})</span>
                </span>
              )}
            </p>
          </div>
        ) : null}

        {/* Pub avant les résultats */}
        <div className="mb-4 sm:mb-8 hidden sm:block">
          <AdBanner position="CONTENT_TOP" />
        </div>

        <div className="mb-4 sm:mb-8" id="search-results">
          <div className="flex justify-between items-center mb-3 sm:mb-4 px-2 sm:px-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
              <span className="hidden sm:inline">{query ? `Résultats pour "${query}"` : "Lieux populaires"}</span>
              <span className="sm:hidden">{query ? `"${query.substring(0, 20)}${query.length > 20 ? '...' : ''}"` : "Populaires"}</span>
              {searchSource === 'chatbot' && (
                <span className="ml-1 sm:ml-2 text-yellow-600 dark:text-yellow-400 text-base sm:text-lg">🤖</span>
              )}
            </h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="sm:hidden">{filteredPlaces.length}</span>
                <span className="hidden sm:inline">{filteredPlaces.length} résultat(s)</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
             {adaptPlacesForCards(filteredPlaces).map((place, index) => (
                <CustomCard
                  key={`${place.placeId}-${index}`}
                  place={place}
                  onClick={() => handlePlaceClick(place)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                {query ? "Aucun résultat trouvé" : "Aucun lieu disponible"}
              </div>
              {query && (
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Essayez avec d'autres mots-clés
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pub après les résultats */}
        <div className="mb-4 sm:mb-8 hidden sm:block">
          <AdBanner position="CONTENT_BOTTOM" />
        </div>

        {session?.user && (
          <div className="mb-4 sm:mb-8 px-2 sm:px-0">
            <VisitHistory />
          </div>
        )}

      </div>   
      <TravelChatbot 
        onRecommendation={handleChatbotRecommendation}
        onSearchUpdate={handleChatbotSearchUpdate}
      />
    </div>
  );
}