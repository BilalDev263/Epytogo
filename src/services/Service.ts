// src/services/Service.ts - Version complète avec nouvelles méthodes
import { 
  PlaceResult, 
  ServiceInterface, 
  SearchNearbyParams, 
  SearchTextParams, 
  GooglePlacesResponse 
} from "./ServiceInterface";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export class Service implements ServiceInterface {
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  private maxResults = 1;// ← Change à 40 pour la présentation

  constructor(public baseUrl: string, public method: Method) {
    this.baseUrl = baseUrl;
    this.method = method;
  }

  // 🆕 Nouvelles méthodes pour gérer maxResults
  getMaxResults(): number {
    return this.maxResults;
  }

  setMaxResults(max: number): void {
    this.maxResults = max;
  }

  // 🆕 Méthodes privées pour organiser et limiter par catégorie
  private organizeByType(places: PlaceResult[]): any {
    const hotels = places.filter(place => 
      place.types?.some((type: string) => ['lodging', 'hotel', 'motel', 'resort'].includes(type))
    );
    
    const restaurants = places.filter(place =>
      place.types?.some((type: string) => ['restaurant', 'food', 'meal_takeaway', 'cafe'].includes(type))
    );
    
    const attractions = places.filter(place =>
      place.types?.some((type: string) => ['tourist_attraction', 'museum', 'park', 'zoo'].includes(type))
    );

    return { hotels, restaurants, attractions };
  }

  private limitByMaxResults(organized: any): any {
    return {
      hotels: organized.hotels.slice(0, this.maxResults),
      restaurants: organized.restaurants.slice(0, this.maxResults),
      attractions: organized.attractions.slice(0, this.maxResults)
    };
  }

  private applyMaxResultsFilter(places: PlaceResult[]): PlaceResult[] {
    if (this.maxResults <= 0 || places.length === 0) {
      return places;
    }

    const organized = this.organizeByType(places);
    const limited = this.limitByMaxResults(organized);
    
    // Recombiner les résultats limités
    return [...limited.hotels, ...limited.restaurants, ...limited.attractions];
  }

  // 🆕 Nouvelle méthode : Recherche par proximité pour la carte
  async searchNearby(params: SearchNearbyParams): Promise<GooglePlacesResponse> {
    const url = `${this.baseUrl}/v1/places:searchNearby`;
    
    const body = JSON.stringify({
      locationRestriction: params.locationRestriction,
      includedTypes: params.includedTypes,
      maxResultCount: Math.min(params.maxResultCount, 20), // Google limite à 20
      languageCode: params.languageCode,
    });

    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.photos,places.types,places.currentOpeningHours,places.internationalPhoneNumber"
    );

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Appliquer la limitation maxResults par catégorie
    const filteredPlaces = this.applyMaxResultsFilter(result.places || []);
    
    return {
      places: filteredPlaces
    };
  }

  // 🆕 Nouvelle méthode : Recherche par texte pour la carte
  async searchText(params: SearchTextParams): Promise<GooglePlacesResponse> {
    const url = `${this.baseUrl}/v1/places:searchText`;
    
    const body = JSON.stringify({
      textQuery: params.textQuery,
      maxResultCount: Math.min(params.maxResultCount, 20), // Google limite à 20
      languageCode: params.languageCode,
    });

    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.photos,places.types,places.currentOpeningHours,places.internationalPhoneNumber"
    );

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Appliquer la limitation maxResults par catégorie
    const filteredPlaces = this.applyMaxResultsFilter(result.places || []);
    
    return {
      places: filteredPlaces
    };
  }

  // Méthodes existantes (avec application des limites)
  async searchByText({
    query,
    type,
    name = "",
  }: {
    query: string;
    type: string;
    name?: string;
  }): Promise<PlaceResult[]> {
    let textQuery = `${type} in ${query}`;

    if (name) {
      textQuery = `${name} ${type} in ${query}`;
    }

    const url = `${this.baseUrl}/v1/places:searchText`;
    const body = JSON.stringify({
      textQuery,
      includedType: type,
      maxResultCount: Math.max(this.maxResults * 3, 20), // Demander plus pour avoir le choix
    });

    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "places.displayName,places.formattedAddress,places.location,places.rating,places.photos,places.currentOpeningHours,places.internationalPhoneNumber,places.id,places.types"
    );

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const places = result.places || [];
    
    // Appliquer la limitation selon le type recherché
    if (type === 'restaurant') {
      return places.slice(0, this.maxResults);
    } else if (type === 'lodging') {
      return places.slice(0, this.maxResults);
    } else {
      return this.applyMaxResultsFilter(places);
    }
  }

  async searchRestaurants({
    name = "",
  }: {
    name?: string;
  }): Promise<PlaceResult[]> {
    return this.searchByText({
      query: "Egypt",
      type: "restaurant",
      name,
    });
  }

  async searchHotels({ name = "" }: { name?: string }): Promise<PlaceResult[]> {
    return this.searchByText({
      query: "Egypt",
      type: "lodging",
      name,
    });
  }

  async searchRestaurantsAndHotels({
    name = "",
  }: {
    name?: string;
  }): Promise<PlaceResult[]> {
    const restaurants = await this.searchRestaurants({
      name,
    });

    const hotels = await this.searchHotels({
      name,
    });

    // Limiter chaque catégorie selon maxResults
    const limitedRestaurants = restaurants.slice(0, this.maxResults);
    const limitedHotels = hotels.slice(0, this.maxResults);

    return [...limitedRestaurants, ...limitedHotels];
  }

  async searchById({ placeId }: { placeId: string }): Promise<PlaceResult> {
    const url = `${this.baseUrl}/v1/places/${placeId}`;
    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "id,displayName,photos,formattedAddress,rating,internationalPhoneNumber,currentOpeningHours,types"
    );

    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }
}