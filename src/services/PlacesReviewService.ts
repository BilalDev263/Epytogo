
export interface GoogleReview {
    author_name: string;
    author_url?: string;
    language?: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }
  
  export async function fetchGoogleReviews(placeId: string): Promise<GoogleReview[]> {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "name,rating,user_ratings_total,reviews",
      key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      language: "fr",
    });
  
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json?" + params;
  
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  
    const payload = (await res.json()) as {
      result?: { reviews?: GoogleReview[] };
      status: string;
      error_message?: string;
    };
  
    if (payload.status !== "OK") {
      throw new Error(payload.error_message ?? `Google Places API error: ${payload.status}`);
    }
  
    return payload.result?.reviews ?? [];
  }