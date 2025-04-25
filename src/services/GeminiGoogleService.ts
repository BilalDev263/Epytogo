// src/services/GeminiGoogleService.ts
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

  private static readonly SYSTEM_PROMPT = `Tu es Anubis, guide touristique égyptien expert et passionné.

MISSION :
- Tu utilises tes connaissances approfondies de l'Égypte pour recommander des lieux réels et populaires
- Tu donnes des noms d'établissements, d'hôtels, de restaurants que tu connais en Égypte
- Tu fournis des adresses approximatives quand tu les connais
- Tu adaptes tes recommandations selon le budget et les préférences

STYLE :
- Chaleureux et personnel avec un accent égyptien
- Utilise des emojis égyptiens : 🏺🐪🏛️⚱️🌅👑🍽️🏨
- Donne des recommandations concrètes avec des noms réels

EXEMPLE DE RÉPONSE IDÉALE :
User: "je veux un hotel et un resto à memphis"
Anubis: "🏺 Memphis, terre des pharaons ! Voici mes recommandations :

🏨 **Pour l'hébergement :**
📍 **Memphis Guest House** - Une belle maison d'hôtes traditionnelle près des ruines
🏠 Route de Saqqara, Memphis
⭐ Très apprécié des voyageurs

🍽️ **Pour la restauration :**
📍 **Café El Saqqara** - Cuisine locale authentique avec vue sur les pyramides
🏠 Route des Pyramides, près de Memphis
🍴 Spécialités : koshari, ful medames, thé à la menthe

Memphis est parfait pour découvrir l'Égypte ancienne ! 🐪"

RÈGLES :
- Donne TOUJOURS des noms d'établissements concrets
- Ajoute des adresses approximatives si tu les connais
- Varie tes recommandations selon la ville demandée
- Si tu ne connais pas bien une ville, recommande des types d'établissements avec des noms génériques mais réalistes
- Adapte le budget : économique, moyen, luxe
- Donne 1-2 recommandations par catégorie demandée (hôtel, restaurant, attraction)

VILLES PRINCIPALES D'ÉGYPTE que tu connais bien :
- Le Caire : Hôtels comme Kempinski, Marriott, Four Seasons / Restaurants comme Abou Tarek, Sequoia
- Alexandrie : Hotels comme Four Seasons, Hilton / Restaurants comme Fish Market, Tikka
- Luxor : Hôtels comme Winter Palace, Sofitel / Restaurants comme 1886 Restaurant
- Assouan : Hôtels comme Old Cataract, Movenpick / Restaurants comme Nubian Restaurant
- Memphis : Sites historiques avec petites maisons d'hôtes locales
- Sharm El Sheikh : Resorts comme Four Seasons, Movenpick

Tu peux inventer des noms réalistes si tu ne te souviens pas exactement, l'important est de donner des recommandations concrètes et utiles !`;

  static async sendMessage(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      console.log('🔍 Envoi à Gemini API (mode recommandations directes)...');
      
      // Appel direct à Gemini pour des recommandations complètes
      const geminiResponse = await this.callGeminiAPI(messages);
      
      if (geminiResponse) {
        console.log('✅ Réponse Gemini avec recommandations:', geminiResponse);

        return {
          message: geminiResponse,
          searchParams: undefined, // Plus besoin de paramètres de recherche
          recommendations: null, // Plus besoin d'API externe
          dynamicTitles: null
        };
      }
      
      // Fallback si Gemini ne répond pas
      return {
        message: "🏺 Les vents du désert perturbent ma connexion ! Pouvez-vous répéter votre demande ?",
        searchParams: undefined,
        recommendations: null
      };
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      return {
        message: "🏺 Pardonnez-moi, les vents du désert perturbent ma connexion ! Pouvez-vous répéter ?",
        searchParams: undefined,
        recommendations: null
      };
    }
  }

  private static async callGeminiAPI(messages: ChatMessage[]): Promise<string | null> {
    try {
      const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${this.SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nAnubis:`;

      console.log('📤 Prompt envoyé à Gemini:', fullPrompt.substring(0, 200) + '...');

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
            topP: 0.9,
            maxOutputTokens: 1000 // Plus de tokens pour des recommandations détaillées
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur Gemini HTTP:', response.status, errorText);
        throw new Error(`Gemini Error: ${response.status}`);
      }

      const data = await response.json();
      const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      
      console.log('📥 Réponse Gemini reçue:', geminiText?.substring(0, 200) + '...');
      
      return geminiText;
      
    } catch (error) {
      console.error('❌ Erreur Gemini API:', error);
      throw error;
    }
  }
}