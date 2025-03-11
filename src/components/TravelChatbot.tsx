import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, MapPin, Utensils, Hotel, Camera, Sparkles } from 'lucide-react';
import { GeminiGoogleService, ChatMessage } from '@/services/GeminiGoogleService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  recommendations?: {
    hotel?: any;
    restaurant?: any;
    attraction?: any;
    location?: string;
  } | null;
}

interface ChatbotProps {
  onRecommendation?: (recommendations: any) => void;
}

const TravelChatbot: React.FC<ChatbotProps> = ({ onRecommendation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "🐪 Ahlan wa sahlan ! Je suis Anubis, votre guide personnel pour l'Égypte ! Je connais tous les secrets de mes terres : des pyramides de Gizeh aux temples de Louxor, des restaurants cachés du Caire aux hôtels de rêve d'Assouan. Que puis-je vous faire découvrir aujourd'hui ? 🏺✨",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour analyser le type de demande et générer des titres dynamiques
  const analyzeDemandType = (userMessage: string, recommendations: any) => {
    const message = userMessage.toLowerCase();
    
    // Détection du type principal de demande
    const demandTypes = {
      hotel: message.includes('hotel') || message.includes('dormir') || message.includes('hébergement') || message.includes('séjour'),
      restaurant: message.includes('restaurant') || message.includes('manger') || message.includes('dîner') || message.includes('cuisine'),
      attraction: message.includes('visiter') || message.includes('voir') || message.includes('attraction') || message.includes('monument'),
      luxury: message.includes('luxe') || message.includes('haut de gamme') || message.includes('prestige'),
      budget: message.includes('pas cher') || message.includes('budget') || message.includes('économique'),
      seafood: message.includes('poisson') || message.includes('fruits de mer') || message.includes('seafood'),
      history: message.includes('histoire') || message.includes('historique') || message.includes('ancien'),
      family: message.includes('famille') || message.includes('enfant') || message.includes('kids')
    };

    // Génération des titres selon le contexte
    const titles = {
      hotel: demandTypes.luxury ? "👑 Palais de pharaon" : demandTypes.budget ? "🏺 Refuge du voyageur" : "🏨 Demeure recommandée",
      restaurant: demandTypes.seafood ? "🐟 Délices de Neptune" : demandTypes.luxury ? "🍽️ Banquet royal" : demandTypes.budget ? "🥘 Saveurs authentiques" : "🍽️ Table recommandée",
      attraction: demandTypes.history ? "🏛️ Héritage millénaire" : demandTypes.family ? "🎪 Aventure familiale" : "🏺 Trésor à découvrir"
    };

    return {
      hotel: titles.hotel,
      restaurant: titles.restaurant,
      attraction: titles.attraction
    };
  };

  // Simulation d'une API de recommandations (gardée pour le fallback)
  const generateRecommendations = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    const preferences = {
      location: '',
      budget: '',
      hotelType: '',
      interests: []
    };

    if (message.includes('cairo') || message.includes('caire')) {
      preferences.location = 'Le Caire';
    } else if (message.includes('alexandria') || message.includes('alexandrie')) {
      preferences.location = 'Alexandrie';
    } else if (message.includes('luxor') || message.includes('louxor')) {
      preferences.location = 'Luxor';
    } else if (message.includes('aswan') || message.includes('assouan')) {
      preferences.location = 'Assouan';
    } else {
      preferences.location = 'Le Caire';
    }

    if (message.includes('luxe') || message.includes('cher') || message.includes('haut de gamme')) {
      preferences.budget = 'luxe';
    } else if (message.includes('moyen') || message.includes('standard')) {
      preferences.budget = 'moyen';
    } else if (message.includes('budget') || message.includes('économique') || message.includes('pas cher')) {
      preferences.budget = 'budget';
    } else {
      preferences.budget = 'moyen';
    }

    const recommendations = getRecommendations(preferences);
    return recommendations;
  };

  const getRecommendations = (preferences: any) => {
    type BudgetType = 'luxe' | 'moyen' | 'budget';
    type LocationType = 'Le Caire' | 'Alexandrie' | 'Luxor';
    
    const hotels: Record<BudgetType, Record<LocationType, any>> = {
      luxe: {
        'Le Caire': { name: "Four Seasons Hotel Cairo at Nile Plaza", rating: 4.8, price: "300-500€/nuit", description: "Vue sur le Nil, spa luxueux" },
        'Alexandrie': { name: "Four Seasons Hotel Alexandria", rating: 4.7, price: "250-400€/nuit", description: "Vue sur la Méditerranée" },
        'Luxor': { name: "Sofitel Winter Palace Luxor", rating: 4.6, price: "200-350€/nuit", description: "Hôtel historique face au Nil" }
      },
      moyen: {
        'Le Caire': { name: "Steigenberger El Tahrir Cairo", rating: 4.3, price: "80-150€/nuit", description: "Centre-ville, proche du musée" },
        'Alexandrie': { name: "Hilton Alexandria Corniche", rating: 4.2, price: "70-120€/nuit", description: "Sur la corniche d'Alexandrie" },
        'Luxor': { name: "Mercure Luxor Karnak", rating: 4.1, price: "60-100€/nuit", description: "Proche des temples de Karnak" }
      },
      budget: {
        'Le Caire': { name: "Cairo Khan Hotel", rating: 3.8, price: "25-50€/nuit", description: "Quartier Khan el-Khalili" },
        'Alexandrie': { name: "New Capri Hotel", rating: 3.6, price: "20-40€/nuit", description: "Centre-ville d'Alexandrie" },
        'Luxor': { name: "Nefertiti Hotel Luxor", rating: 3.7, price: "15-35€/nuit", description: "Proche de la gare" }
      }
    };

    const restaurants: Record<LocationType, any> = {
      'Le Caire': { name: "Zitouni", cuisine: "Orientale moderne", rating: 4.5, price: "40-60€", description: "Restaurant du Four Seasons, cuisine égyptienne raffinée" },
      'Alexandrie': { name: "Fish Market", cuisine: "Fruits de mer", rating: 4.4, price: "25-40€", description: "Poissons frais de la Méditerranée" },
      'Luxor': { name: "1886 Restaurant", cuisine: "Internationale", rating: 4.3, price: "35-55€", description: "Restaurant historique au Winter Palace" }
    };

    const attractions: Record<LocationType, any> = {
      'Le Caire': { name: "Pyramides de Gizeh", type: "Site historique", rating: 4.9, description: "Les célèbres pyramides et le Sphinx" },
      'Alexandrie': { name: "Bibliothèque d'Alexandrie", type: "Culturel", rating: 4.6, description: "Moderne bibliothèque sur le site antique" },
      'Luxor': { name: "Vallée des Rois", type: "Site archéologique", rating: 4.8, description: "Tombeaux des pharaons du Nouvel Empire" }
    };

    const location = (preferences.location || 'Le Caire') as LocationType;
    const budget = (preferences.budget || 'moyen') as BudgetType;

    return {
      hotel: hotels[budget]?.[location] || hotels.moyen[location],
      restaurant: restaurants[location],
      attraction: attractions[location],
      location: location
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const newConversationHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: inputMessage }
    ];
    setConversationHistory(newConversationHistory);
    
    const currentUserMessage = inputMessage; // Sauvegarder pour l'analyse
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await GeminiGoogleService.sendMessage(newConversationHistory);
      
      setConversationHistory([
        ...newConversationHistory,
        { role: 'assistant' as const, content: aiResponse.message }
      ]);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse.message,
        timestamp: new Date(),
        recommendations: aiResponse.recommendations
      };

      setMessages(prev => [...prev, botResponse]);

      if (onRecommendation && aiResponse.recommendations) {
        onRecommendation(aiResponse.recommendations);
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "🏺 Pardonnez-moi, les vents du désert perturbent ma connexion ! Pouvez-vous répéter ?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton flottant avec pyramide */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-gray-900 text-yellow-400 rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-600"
        >
          <svg 
            className="h-7 w-7" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2L2 22h20L12 2zm0 3.84L19.16 20H4.84L12 5.84z"/>
            <path d="M12 5.84L16.58 18H7.42L12 5.84z" opacity="0.7"/>
          </svg>
        </button>
      )}

      {/* Interface de chat */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-amber-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center border border-yellow-400">
                <svg className="h-6 w-6 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2zm0 3.84L19.16 20H4.84L12 5.84z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Anubis - Guide Égyptien</h3>
                <p className="text-sm text-yellow-100">En ligne • Hiéroglyphes décodés ✨</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((message, index) => {
              // Récupérer le message utilisateur précédent pour l'analyse
              const previousUserMessage = index > 0 && messages[index - 1].type === 'user' 
                ? messages[index - 1].content 
                : '';
              
              // Générer les titres dynamiques
              const dynamicTitles = message.recommendations && previousUserMessage
                ? analyzeDemandType(previousUserMessage, message.recommendations)
                : {
                    hotel: "🏨 Hébergement recommandé",
                    restaurant: "🍽️ Restaurant recommandé", 
                    attraction: "🏺 Attraction recommandée"
                  };

              return (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-yellow-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-md border-l-4 border-yellow-600'
                  } px-4 py-3`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Recommandations avec titres dynamiques */}
                    {message.recommendations && (
                      <div className="mt-4 space-y-3">
                        {/* Hôtel - Affiché seulement si pertinent */}
                        {message.recommendations.hotel && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Hotel className="h-4 w-4 text-yellow-600" />
                              <span className="font-semibold text-yellow-800 dark:text-yellow-300">{dynamicTitles.hotel}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{message.recommendations.hotel?.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{message.recommendations.hotel?.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm font-medium text-green-600">⭐ {message.recommendations.hotel?.rating}</span>
                              <span className="text-sm font-medium text-yellow-600">{message.recommendations.hotel?.price}</span>
                            </div>
                          </div>
                        )}

                        {/* Restaurant - Affiché seulement si pertinent */}
                        {message.recommendations.restaurant && (
                          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Utensils className="h-4 w-4 text-orange-600" />
                              <span className="font-semibold text-orange-800 dark:text-orange-300">{dynamicTitles.restaurant}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{message.recommendations.restaurant?.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{message.recommendations.restaurant?.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm font-medium text-green-600">⭐ {message.recommendations.restaurant?.rating}</span>
                              <span className="text-sm text-gray-500">{message.recommendations.restaurant?.cuisine} • {message.recommendations.restaurant?.price}</span>
                            </div>
                          </div>
                        )}

                        {/* Attraction - Affiché seulement si pertinent */}
                        {message.recommendations.attraction && (
                          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Camera className="h-4 w-4 text-amber-600" />
                              <span className="font-semibold text-amber-800 dark:text-amber-300">{dynamicTitles.attraction}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{message.recommendations.attraction?.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{message.recommendations.attraction?.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm font-medium text-green-600">⭐ {message.recommendations.attraction?.rating}</span>
                              <span className="text-sm text-gray-500">{message.recommendations.attraction?.type}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md shadow-md px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Racontez-moi vos rêves de voyage en Égypte... 🐪"
                className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="self-end bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg p-2 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelChatbot;