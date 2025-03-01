// src/services/PlacesImageService.ts
export class PlacesImageService {
  private static readonly BASE_URL = "https://places.googleapis.com/v1";
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  /**
   * Construit l'URL pour récupérer une image de lieu Google Places
   */
  static getImageUrl(
    photoName: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
    } = {}
  ): string {
    const { maxWidth = 400, maxHeight = 400 } = options;
    
    if (!this.API_KEY) {
      console.warn("Google Places API key is missing");
      return "";
    }

    return `${this.BASE_URL}/${photoName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${this.API_KEY}`;
  }

  /**
   * Vérifie si une photo est disponible
   */
  static hasPhoto(place: { photos?: Array<{ name: string }> }): boolean {
    return !!(place.photos && place.photos.length > 0 && place.photos[0].name);
  }

  /**
   * Obtient le nom de la première photo disponible
   */
  static getFirstPhotoName(place: { photos?: Array<{ name: string }> }): string | undefined {
    return this.hasPhoto(place) ? place.photos![0].name : undefined;
  }

  /**
   * Précharge une image pour améliorer les performances
   */
  static preloadImage(photoName: string, options?: { maxWidth?: number; maxHeight?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${photoName}`));
      img.src = this.getImageUrl(photoName, options);
    });
  }
}