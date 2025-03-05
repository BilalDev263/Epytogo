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

  private maxResults = 1; // ← Change à 40 pour la présentation

  constructor(public baseUrl: string, public method: Method) {
    this.baseUrl = baseUrl;
    this.method = method;
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
    return {
      places: result.places || []
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
    return {
      places: result.places || []
    };
  }

  // Méthodes existantes (inchangées)
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
      maxResultCount: this.maxResults, // ← Utilise la limite définie
    });

    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "places.displayName,places.formattedAddress,places.location,places.rating,places.photos,places.currentOpeningHours,places.internationalPhoneNumber,places.id"
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
    return result.places || [];
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

    return [...restaurants, ...hotels];
  }

  async searchById({ placeId }: { placeId: string }): Promise<PlaceResult> {
    const url = `${this.baseUrl}/v1/places/${placeId}`;
    const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("X-Goog-Api-Key", this.apiKey);
    requestHeaders.set(
      "X-Goog-FieldMask",
      "id,displayName,photos,formattedAddress,rating,internationalPhoneNumber,currentOpeningHours"
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