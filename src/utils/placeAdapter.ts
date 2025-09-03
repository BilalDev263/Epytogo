import { PlaceResult } from "@/services/ServiceInterface";
import { PlacesImageService } from "@/services/PlacesImageService";

export interface CustomCardPlace {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  photo?: string;
  phoneNumber?: string;
  isOpen?: boolean;
}

export function adaptPlaceForCard(place: PlaceResult): CustomCardPlace {
  return {
    placeId: place.id || '',
    name: place.displayName?.text || 'Nom non disponible',
    address: place.formattedAddress || 'Adresse non disponible',
    rating: place.rating || 0,
    photo: PlacesImageService.getPlaceImageUrl(place, { maxWidth: 400, maxHeight: 300 }),
    phoneNumber: place.internationalPhoneNumber || undefined,
    isOpen: place.currentOpeningHours?.openNow || undefined
  };
}

export function adaptPlacesForCards(places: PlaceResult[]): CustomCardPlace[] {
  return places.map(adaptPlaceForCard);
}