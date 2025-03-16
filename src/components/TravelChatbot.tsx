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
  dynamicTitles?: {
    hotel?: string;
    restaurant?: string;
    attraction?: string;
  } | null;
}

interface ChatbotProps {
  onRecommendation?: (recommendations: any) => void;
  onPlaceClick?: (placeId: string, placeType: 'hotel' | 'restaurant' | 'attraction') => void;
}

const TravelChatbot: React.FC<ChatbotProps> = ({ onRecommendation, onPlaceClick }) => {
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

  // Fonction pour vérifier si la demande concerne l'Égypte avec correction d'orthographe
  const isEgyptRelated = (message: string): boolean => {
    const egyptKeywords = [
      'egypt', 'égypte', 'cairo', 'caire', 'alexandria', 'alexandrie',
      'luxor', 'louxor', 'aswan', 'assouan', 'hurghada', 'sharm',
      'pyramide', 'pharaon', 'nil', 'sphinx', 'temple', 'karnak',
      'valley', 'vallée', 'roi', 'kings', 'gizeh', 'giza',
      // Erreurs d'orthographe courantes
      'urghada', 'hurgada', 'hourghada', 'charm', 'cayre'
    ];
    
    return egyptKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  // Fonction pour gérer les clics sur les recommandations
  const handlePlaceClick = (place: any, type: 'hotel' | 'restaurant' | 'attraction') => {
    if (onPlaceClick && place.place_id) {
      onPlaceClick(place.place_id, type);
    } else if (place.name) {
      // Fallback : recherche par nom si pas de place_id
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(place.name + ' Egypt')}`, '_blank');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Vérification préalable si la demande concerne l'Égypte
    if (!isEgyptRelated(inputMessage)) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "🏺 Pardonnez-moi, je ne guide qu'en terre d'Égypte ! Puis-je vous aider à découvrir nos merveilles ? Essayez de me parler du Caire, d'Alexandrie, de Luxor ou de nos sites légendaires ! 🐪",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, botResponse]);
      setInputMessage('');
      return;
    }

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
        recommendations: aiResponse.recommendations,
        dynamicTitles: aiResponse.dynamicTitles // Titres générés par Gemini
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

  // Fonction pour obtenir l'icône appropriée basée sur le titre dynamique
  const getIconForTitle = (title: string) => {
    if (title.includes('Neptune') || title.includes('mer') || title.includes('🐟')) {
      return <span className="text-blue-500">🐟</span>;
    }
    if (title.includes('Palais') || title.includes('👑')) {
      return <span className="text-yellow-500">👑</span>;
    }
    if (title.includes('Refuge') || title.includes('🎒')) {
      return <span className="text-green-500">🎒</span>;
    }
    if (title.includes('pharaon') || title.includes('🏛️')) {
      return <span className="text-amber-500">🏛️</span>;
    }
    if (title.includes('aventur') || title.includes('explorateur')) {
      return <span className="text-purple-500">🗺️</span>;
    }
    return null;
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
                <p className="text-sm text-yellow-100">En ligne • Spécialiste Égypte uniquement 🇪🇬</p>
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
            {messages.map((message) => (
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
                  
                  {/* Recommandations avec titres 100% dynamiques de Gemini */}
                  {message.recommendations && message.dynamicTitles && (
                    <div className="mt-4 space-y-3">
                      {/* Hôtel - Titre dynamique de Gemini */}
                      {message.recommendations.hotel && message.dynamicTitles.hotel && (
                        <div 
                          className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
                          onClick={() => handlePlaceClick(message.recommendations!.hotel, 'hotel')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getIconForTitle(message.dynamicTitles.hotel) || <Hotel className="h-4 w-4 text-yellow-600" />}
                            <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                              {message.dynamicTitles.hotel}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">👆 Cliquez pour voir</span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{message.recommendations.hotel?.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{message.recommendations.hotel?.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-green-600">⭐ {message.recommendations.hotel?.rating}</span>
                            <span className="text-sm font-medium text-yellow-600">{message.recommendations.hotel?.price}</span>
                          </div>
                        </div>
                      )}

                      {/* Restaurant - Titre dynamique de Gemini */}
                      {message.recommendations.restaurant && message.dynamicTitles.restaurant && (
                        <div 
                          className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                          onClick={() => handlePlaceClick(message.recommendations!.restaurant, 'restaurant')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getIconForTitle(message.dynamicTitles.restaurant) || <Utensils className="h-4 w-4 text-orange-600" />}
                            <span className="font-semibold text-orange-800 dark:text-orange-300">
                              {message.dynamicTitles.restaurant}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">👆 Cliquez pour voir</span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{message.recommendations.restaurant?.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{message.recommendations.restaurant?.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-green-600">⭐ {message.recommendations.restaurant?.rating}</span>
                            <span className="text-sm text-gray-500">{message.recommendations.restaurant?.cuisine} • {message.recommendations.restaurant?.price}</span>
                          </div>
                        </div>
                      )}

                      {/* Attraction - Titre dynamique de Gemini */}
                      {message.recommendations.attraction && message.dynamicTitles.attraction && (
                        <div 
                          className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-700 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                          onClick={() => handlePlaceClick(message.recommendations!.attraction, 'attraction')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getIconForTitle(message.dynamicTitles.attraction) || <Camera className="h-4 w-4 text-amber-600" />}
                            <span className="font-semibold text-amber-800 dark:text-amber-300">
                              {message.dynamicTitles.attraction}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">👆 Cliquez pour voir</span>
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
            ))}

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
                placeholder="Explorez l'Égypte avec moi ! (Le Caire, Alexandrie, Luxor...) 🐪"
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
            {/* Indication claire que seule l'Égypte est supportée */}
            <p className="text-xs text-gray-500 mt-1 text-center">
              🇪🇬 Guide spécialisé Égypte uniquement
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelChatbot;