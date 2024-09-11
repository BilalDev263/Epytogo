export interface PlaceResult {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  internationalPhoneNumber: string;
  currentOpeningHours: {
    openNow: boolean;
    periods: Array<{
      open: {
        date: { year: number; month: number; day: number };
        day: number;
        hour: number;
        minute: number;
      };
      close: {
        date: { year: number; month: number; day: number };
        day: number;
        hour: number;
        minute: number;
      };
    }>;
    weekdayDescriptions: Array<string>;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  photos?: Array<{
    name: string;
    authorAttributions: Array<{
      displayName: string;
      photoUri: string;
      uri: string;
    }>;
  }>;
}

export interface ServiceInterface {
  searchByText(params: {
    query: string;
    type: string;
    name?: string;
  }): Promise<PlaceResult[]>;
  searchRestaurants(params: { name: string }): Promise<PlaceResult[]>;
  searchHotels(params: { name: string }): Promise<PlaceResult[]>;
  searchRestaurantsAndHotels(params: { name: string }): Promise<PlaceResult[]>;
  searchById(params: { placeId: string }): Promise<PlaceResult>;
}
