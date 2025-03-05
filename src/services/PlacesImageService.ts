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
      return "/placeholder-image.svg";
    }

    if (!photoName) {
      return "/placeholder-image.svg";
    }

    // 🔧 CORRECTION : Nettoyer le photoName pour éviter les doublons
    let cleanPhotoName = photoName;
    
    // Si le photoName contient déjà l'URL complète, extraire juste la partie nécessaire
    if (photoName.startsWith('https://places.googleapis.com/v1/')) {
      cleanPhotoName = photoName.replace('https://places.googleapis.com/v1/', '');
    }
    
    // Supprimer "/media" et ses paramètres s'ils sont déjà présents
    if (cleanPhotoName.includes('/media')) {
      cleanPhotoName = cleanPhotoName.split('/media')[0];
    }
    
    // S'assurer qu'on a le bon format
    if (!cleanPhotoName.startsWith('places/')) {
      cleanPhotoName = `places/${cleanPhotoName}`;
    }

    const imageUrl = `${this.BASE_URL}/${cleanPhotoName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${this.API_KEY}`;
    
    // Debug pour voir l'URL générée
    console.log('PlacesImageService - Original photoName:', photoName);
    console.log('PlacesImageService - Clean photoName:', cleanPhotoName);
    console.log('PlacesImageService - Generated URL:', imageUrl);
    
    return imageUrl;
  }

  /**
   * Récupère l'URL de la première photo d'un lieu avec fallback
   */
  static getPlaceImageUrl(
    place: { photos?: Array<{ name: string }> }, 
    options: { maxWidth?: number; maxHeight?: number } = {}
  ): string {
    if (!this.hasPhoto(place)) {
      return "/placeholder-image.svg";
    }
    
    const photoName = this.getFirstPhotoName(place);
    if (!photoName) {
      return "/placeholder-image.svg";
    }
    
    return this.getImageUrl(photoName, options);
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