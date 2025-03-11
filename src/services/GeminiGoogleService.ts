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
}

export class GeminiGoogleService {
  private static readonly GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private static googleService = new Service("https://places.googleapis.com", "POST");

  private static readonly SYSTEM_PROMPT = `Tu es Anubis, guide touristique égyptien expert et chaleureux.

PERSONNALITÉ :
- Pour le message d'accueil : style égyptien complet avec "Ahlan wa sahlan", emojis 🏺🐪🏛️⚱️🌅👑
- Pour les réponses suivantes : DIRECTES et CONCISES, max 2-3 phrases
- Utilise occasionnellement des références égyptiennes mais reste PRATIQUE

MISSION :
- Aide à planifier des séjours en Égypte
- Analyse les demandes pour extraire localisation, budget, types de lieux
- Réponds de façon DIRECTE puis ajoute les paramètres de recherche

STYLE DE RÉPONSE :
- Si c'est le premier message : style égyptien complet
- Sinon : réponse courte et efficace avec 1-2 emojis max
- Exemple court : "Parfait ! Voici les meilleurs restaurants de fruits de mer à Alexandrie 🐟"

FORMAT DE RÉPONSE :
[Message direct d'Anubis - MAX 2-3 phrases]

[SEARCH_PARAMS]
{
  "location": "ville égyptienne",
  "types": ["restaurant", "lodging", "tourist_attraction"],
  "budget": "économique|moyen|luxe",
  "query": "mots-clés pour Google Places"
}

EXEMPLE :
User: "Je veux un restaurant de poisson à Alexandrie"
Réponse: "Parfait ! Alexandrie offre d'excellents restaurants de fruits de mer 🐟"

[SEARCH_PARAMS]
{
  "location": "Alexandrie",
  "types": ["restaurant"],
  "budget": "moyen", 
  "query": "seafood restaurant Alexandria Egypt"
}`;

  static async sendMessage(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      console.log('🔍 Test Gemini API Key:', this.GEMINI_API_KEY ? 'Présente ✅' : 'Manquante ❌');
      
      const geminiResponse = await this.callGeminiAPI(messages);
      
      if (geminiResponse) {
        console.log('✅ Réponse Gemini reçue:', geminiResponse.substring(0, 100) + '...');
        const searchParams = this.parseSearchParams(geminiResponse);
        let recommendations = null;
        
        if (searchParams) {
          recommendations = await this.searchWithGooglePlaces(searchParams);
        }

        return {
          message: geminiResponse.replace(/\[SEARCH_PARAMS\][\s\S]*/, '').trim(),
          searchParams,
          recommendations
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
      // Construire le prompt pour Gemini
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
            temperature: 0.7, // Réduit pour des réponses plus directes
            topP: 0.8,
            maxOutputTokens: 400 // Réduit pour forcer la concision
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
        return JSON.parse(match[1]);
      }
    } catch (error) {
      console.error('Erreur parsing:', error);
    }
    return null;
  }

  private static async searchWithGooglePlaces(searchParams: any): Promise<any | null> {
    try {
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'Le Caire': { lat: 30.0444, lng: 31.2357 },
        'Cairo': { lat: 30.0444, lng: 31.2357 },
        'Alexandrie': { lat: 31.2001, lng: 29.9187 },
        'Alexandria': { lat: 31.2001, lng: 29.9187 },
        'Luxor': { lat: 25.6872, lng: 32.6396 },
        'Louxor': { lat: 25.6872, lng: 32.6396 },
        'Assouan': { lat: 24.0889, lng: 32.8998 },
        'Aswan': { lat: 24.0889, lng: 32.8998 }
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
        languageCode: "fr",
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
    
    let location = 'Le Caire';
    let types = ['restaurant', 'lodging', 'tourist_attraction'];
    let budget = 'moyen';
    
    if (message.includes('alexandria') || message.includes('alexandrie')) location = 'Alexandrie';
    else if (message.includes('luxor') || message.includes('louxor')) location = 'Luxor';
    else if (message.includes('aswan') || message.includes('assouan')) location = 'Assouan';
    
    if (message.includes('restaurant') || message.includes('manger')) types = ['restaurant'];
    else if (message.includes('hotel') || message.includes('dormir')) types = ['lodging'];
    else if (message.includes('visiter') || message.includes('attraction')) types = ['tourist_attraction'];
    
    if (message.includes('pas cher') || message.includes('budget')) budget = 'économique';
    else if (message.includes('luxe') || message.includes('cher')) budget = 'luxe';

    // Réponses courtes et directes
    const shortResponses = [
      `Parfait ! Voici mes recommandations pour ${location} 🏺`,
      `Excellent choix ! ${location} vous attend 🐪`,
      `Trouvé ! Les meilleures options à ${location} 👑`
    ];

    return {
      message: shortResponses[Math.floor(Math.random() * shortResponses.length)],
      searchParams: { location, types, query: `${types.join(' ')} ${location}`, budget },
      recommendations: null
    };
  }
}