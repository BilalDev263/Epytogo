// src/services/GeminiGoogleService.ts
import { Service } from './Service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  searchParams?: {
    location: string;
    types: string[];
    query: string;
    budget?: string;
  };
  recommendations?: {
    hotel?: any;
    restaurant?: any;
    attraction?: any;
    location?: string;
  } | null;
  dynamicTitles?: {
    hotel?: string;
    restaurant?: string;
    attraction?: string;
  } | null;
}

export class GeminiGoogleService {
  private static readonly GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private static googleService = new Service("https://places.googleapis.com", "POST");

  private static readonly SYSTEM_PROMPT = `Tu es Anubis, guide touristique égyptien expert et chaleureux. Tu ne traites QUE les demandes concernant l'ÉGYPTE.

RÈGLES STRICTES :
- Si la demande concerne un autre pays : refuse poliment et redirige vers l'Égypte
- Toutes les recherches sont limitées aux villes égyptiennes : Le Caire, Alexandrie, Luxor, Assouan, Hurghada, Sharm el-Sheikh
- Corrige automatiquement les erreurs d'orthographe courantes des villes égyptiennes (ex: "urghada" → "Hurghada")
- Accepte les variations de noms (Cairo/Caire, Alexandria/Alexandrie, etc.)

PERSONNALITÉ :
- Message d'accueil : style égyptien complet avec "Ahlan wa sahlan", emojis 🏺🐪🏛️⚱️🌅👑
- Réponses suivantes : DIRECTES et CONCISES, max 2-3 phrases
- Utilise occasionnellement des références égyptiennes mais reste PRATIQUE

MISSION :
- Analyse précisément chaque demande pour créer des titres de recommandations personnalisés
- Réponds de façon DIRECTE puis ajoute les paramètres de recherche

FORMAT DE RÉPONSE :
[Message direct d'Anubis - MAX 2-3 phrases]

[SEARCH_PARAMS]
{
  "location": "ville égyptienne uniquement",
  "types": ["restaurant", "lodging", "tourist_attraction"],
  "budget": "économique|moyen|luxe",
  "query": "mots-clés pour Google Places Egypt"
}

[DYNAMIC_TITLES]
{
  "hotel": "titre personnalisé basé sur la demande (ex: 'Oasis du désert' pour aventure, 'Palais du Nil' pour luxe)",
  "restaurant": "titre personnalisé basé sur la demande (ex: 'Délices de Neptune' pour fruits de mer, 'Épices du Khan' pour local)",
  "attraction": "titre personnalisé basé sur la demande (ex: 'Secrets des pharaons' pour histoire, 'Merveilles antiques' pour monuments)"
}

EXEMPLES DE TITRES DYNAMIQUES :
- Demande "restaurant fruits de mer Alexandrie" → restaurant: "🐟 Trésors de la Méditerranée"
- Demande "hôtel luxe vue Nil" → hotel: "👑 Palais des rives sacrées"
- Demande "pyramides famille enfants" → attraction: "🏛️ Aventure des petits explorateurs"
- Demande "budget routard Le Caire" → hotel: "🎒 Refuge des aventuriers"

REFUSE POLIMENT si autre pays mentionné : "🏺 Pardonnez-moi, je ne guide qu'en terre d'Égypte ! Puis-je vous aider à découvrir nos merveilles ?"`;

  static async sendMessage(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      console.log('🔍 Test Gemini API Key:', this.GEMINI_API_KEY ? 'Présente ✅' : 'Manquante ❌');
      
      const geminiResponse = await this.callGeminiAPI(messages);
      
      if (geminiResponse) {
        console.log('✅ Réponse Gemini reçue:', geminiResponse.substring(0, 100) + '...');
        const searchParams = this.parseSearchParams(geminiResponse);
        const dynamicTitles = this.parseDynamicTitles(geminiResponse);
        let recommendations = null;
        
        if (searchParams && this.isEgyptLocation(searchParams.location)) {
          recommendations = await this.searchWithGooglePlaces(searchParams);
        }

        return {
          message: geminiResponse.replace(/\[SEARCH_PARAMS\][\s\S]*/, '').replace(/\[DYNAMIC_TITLES\][\s\S]*/, '').trim(),
          searchParams,
          recommendations,
          dynamicTitles
        };
      }
      
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
      
    } catch (error) {
      console.error('❌ Erreur Gemini:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private static async callGeminiAPI(messages: ChatMessage[]): Promise<string | null> {
    try {
      const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${this.SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nAnubis:`;

      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 600 // Augmenté pour inclure les titres dynamiques
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || null;
      
    } catch (error) {
      console.warn('Gemini non disponible:', error);
      return null;
    }
  }

  private static parseSearchParams(geminiResponse: string): any {
    try {
      const match = geminiResponse.match(/\[SEARCH_PARAMS\]\s*(\{[\s\S]*?\})/);
      if (match) {
        const params = JSON.parse(match[1]);
        // Vérification stricte : seules les villes égyptiennes sont acceptées
        if (this.isEgyptLocation(params.location)) {
          return params;
        }
      }
    } catch (error) {
      console.error('Erreur parsing search params:', error);
    }
    return null;
  }

  private static parseDynamicTitles(geminiResponse: string): any {
    try {
      const match = geminiResponse.match(/\[DYNAMIC_TITLES\]\s*(\{[\s\S]*?\})/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (error) {
      console.error('Erreur parsing dynamic titles:', error);
    }
    return null;
  }

  private static isEgyptLocation(location: string): boolean {
    const egyptCities = [
      'Le Caire', 'Cairo', 'Caire',
      'Alexandrie', 'Alexandria', 
      'Luxor', 'Louxor',
      'Assouan', 'Aswan',
      'Hurghada', 'Hourghada',
      'Sharm el-Sheikh', 'Sharm', 'Sharm El Sheikh'
    ];
    
    return egyptCities.some(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Fonction de correction automatique pour les villes égyptiennes
  private static correctEgyptLocation(input: string): string {
    const corrections: { [key: string]: string } = {
      // Hurghada variations
      'urghada': 'Hurghada',
      'hurgheda': 'Hurghada',
      'hurgada': 'Hurghada',
      'hourghada': 'Hurghada',
      'ghardaia': 'Hurghada', // erreur commune
      
      // Le Caire variations
      'cairo': 'Le Caire',
      'cayre': 'Le Caire',
      'kayro': 'Le Caire',
      
      // Alexandrie variations
      'alexandria': 'Alexandrie',
      'alexandri': 'Alexandrie',
      'alexendrie': 'Alexandrie',
      
      // Luxor variations
      'louxor': 'Luxor',
      'luxour': 'Luxor',
      'louqsor': 'Luxor',
      
      // Assouan variations
      'aswan': 'Assouan',
      'asswan': 'Assouan',
      'assouan': 'Assouan',
      
      // Sharm variations
      'sharm': 'Sharm el-Sheikh',
      'charm': 'Sharm el-Sheikh',
      'sharm el sheikh': 'Sharm el-Sheikh'
    };

    const lowercaseInput = input.toLowerCase();
    
    // Recherche exacte d'abord
    if (corrections[lowercaseInput]) {
      return corrections[lowercaseInput];
    }
    
    // Recherche partielle avec similarité
    for (const [typo, correct] of Object.entries(corrections)) {
      if (lowercaseInput.includes(typo) || typo.includes(lowercaseInput)) {
        return correct;
      }
    }
    
    return input; // Retourne l'input original si aucune correction trouvée
  }

  private static async searchWithGooglePlaces(searchParams: any): Promise<any | null> {
    try {
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'Le Caire': { lat: 30.0444, lng: 31.2357 },
        'Cairo': { lat: 30.0444, lng: 31.2357 },
        'Caire': { lat: 30.0444, lng: 31.2357 },
        'Alexandrie': { lat: 31.2001, lng: 29.9187 },
        'Alexandria': { lat: 31.2001, lng: 29.9187 },
        'Luxor': { lat: 25.6872, lng: 32.6396 },
        'Louxor': { lat: 25.6872, lng: 32.6396 },
        'Assouan': { lat: 24.0889, lng: 32.8998 },
        'Aswan': { lat: 24.0889, lng: 32.8998 },
        'Hurghada': { lat: 27.2574, lng: 33.8129 },
        'Hourghada': { lat: 27.2574, lng: 33.8129 },
        'Sharm el-Sheikh': { lat: 27.9158, lng: 34.3300 },
        'Sharm': { lat: 27.9158, lng: 34.3300 }
      };

      const location = searchParams.location || 'Le Caire';
      const coords = cityCoordinates[location] || cityCoordinates['Le Caire'];

      const results = await this.googleService.searchNearby({
        locationRestriction: {
          circle: {
            center: { latitude: coords.lat, longitude: coords.lng },
            radius: 25000
          }
        },
        includedTypes: searchParams.types || ["restaurant", "lodging", "tourist_attraction"],
        maxResultCount: 8,
        languageCode: "fr"
      });

      if (results.places && results.places.length > 0) {
        const organized = this.organizeResultsByType(results.places);
        return {
          location: location,
          hotel: organized.hotels[0],
          restaurant: organized.restaurants[0], 
          attraction: organized.attractions[0],
          allResults: organized
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur Google Places:', error);
      return null;
    }
  }

  private static organizeResultsByType(places: any[]): any {
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

  private static getFallbackResponse(userMessage: string): AIResponse {
    const message = userMessage.toLowerCase();
    
    // Correction automatique des erreurs d'orthographe
    const correctedMessage = message;
    let correctedLocation = '';
    
    // Essayer de corriger les noms de villes
    const words = message.split(' ');
    for (const word of words) {
      const corrected = this.correctEgyptLocation(word);
      if (corrected !== word) {
        correctedLocation = corrected;
        break;
      }
    }
    
    // Vérifier si la demande concerne l'Égypte (avec correction)
    const isEgyptRelated = this.isEgyptLocation(message) || 
                          correctedLocation !== '' ||
                          message.includes('egypt') || 
                          message.includes('égypte') ||
                          message.includes('pyramide') ||
                          message.includes('pharaon') ||
                          message.includes('nil');

    if (!isEgyptRelated) {
      return {
        message: "🏺 Pardonnez-moi, je ne guide qu'en terre d'Égypte ! Puis-je vous aider à découvrir nos merveilles ?",
        searchParams: undefined,
        recommendations: null,
        dynamicTitles: null
      };
    }
    
    let location = correctedLocation || 'Le Caire';
    let types = ['restaurant', 'lodging', 'tourist_attraction'];
    let budget = 'moyen';
    
    // Détection de ville avec correction
    if (message.includes('alexandria') || message.includes('alexandrie')) location = 'Alexandrie';
    else if (message.includes('luxor') || message.includes('louxor')) location = 'Luxor';
    else if (message.includes('aswan') || message.includes('assouan')) location = 'Assouan';
    else if (message.includes('hurghada') || message.includes('urghada') || message.includes('hurgada')) location = 'Hurghada';
    else if (message.includes('sharm') || message.includes('charm')) location = 'Sharm el-Sheikh';
    
    if (message.includes('restaurant') || message.includes('manger')) types = ['restaurant'];
    else if (message.includes('hotel') || message.includes('dormir')) types = ['lodging'];
    else if (message.includes('visiter') || message.includes('attraction')) types = ['tourist_attraction'];
    
    if (message.includes('pas cher') || message.includes('budget')) budget = 'économique';
    else if (message.includes('luxe') || message.includes('cher')) budget = 'luxe';

    // Titres dynamiques basiques pour le fallback
    const fallbackTitles = {
      hotel: budget === 'luxe' ? "👑 Palais des pharaons" : budget === 'économique' ? "🏺 Refuge du voyageur" : "🏨 Demeure du Nil",
      restaurant: message.includes('poisson') ? "🐟 Délices de la mer" : "🍽️ Saveurs d'Égypte",
      attraction: message.includes('histoire') ? "🏛️ Héritage millénaire" : "🏺 Merveilles antiques"
    };

    // Message avec correction si nécessaire
    let responseMessage = '';
    if (correctedLocation !== '') {
      responseMessage = `Parfait ! ${correctedLocation} vous attend avec ses merveilles 🏺`;
    } else {
      const shortResponses = [
        `Parfait ! Voici mes recommandations pour ${location} 🏺`,
        `Excellent choix ! ${location} vous attend 🐪`,
        `Trouvé ! Les meilleures options à ${location} 👑`
      ];
      responseMessage = shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }

    return {
      message: responseMessage,
      searchParams: { location, types, query: `${types.join(' ')} ${location} Egypt`, budget },
      recommendations: null,
      dynamicTitles: fallbackTitles
    };
  }
}