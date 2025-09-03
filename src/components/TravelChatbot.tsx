import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { GeminiGoogleService, ChatMessage } from '@/services/GeminiGoogleService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  onRecommendation?: (recommendations: any) => void;
  onPlaceClick?: (placeId: string, placeType: 'hotel' | 'restaurant' | 'attraction') => void;
  onSearchUpdate?: (searchTerm: string) => void;
}

const TravelChatbot: React.FC<ChatbotProps> = ({ onRecommendation, onPlaceClick, onSearchUpdate }) => {
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

  const egyptianPlaces = [
    'le caire', 'cairo', 'caire',
    'alexandrie', 'alexandria', 
    'luxor', 'louxor',
    'assouan', 'aswan',
    'memphis', 'gizeh', 'giza',
    'sharm el sheikh', 'sharm',
    'hurghada',
    'saqqara', 'karnak'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractSearchTerms = (userMessage: string, botMessage: string): string | null => {
    const fullText = `${userMessage} ${botMessage}`.toLowerCase();
    
    for (const place of egyptianPlaces) {
      if (fullText.includes(place)) {
        console.log('🎯 Ville détectée:', place);
        return place.charAt(0).toUpperCase() + place.slice(1);
      }
    }
    
    const establishmentPattern = /\*\*(.*?)\*\*/g;
    const matches = botMessage.match(establishmentPattern);
    if (matches && matches.length > 0) {
      const establishment = matches[0].replace(/\*\*/g, '');
      console.log('🏨 Établissement détecté:', establishment);
      return establishment;
    }
    
    const keywords = ['hotel', 'restaurant', 'attraction', 'pyramide', 'temple'];
    for (const keyword of keywords) {
      if (fullText.includes(keyword)) {
        for (const place of egyptianPlaces) {
          if (fullText.includes(place)) {
            console.log('🔍 Combinaison détectée:', `${keyword} ${place}`);
            return `${keyword} ${place}`;
          }
        }
        console.log('🔍 Mot-clé détecté:', keyword);
        return keyword;
      }
    }
    
    return null;
  };

  const isEgyptRelated = (message: string): boolean => {
    const basicEgyptKeywords = [
      'egypt', 'égypte', 'pyramide', 'pharaon', 'nil', 'caire', 'alexandrie', 'luxor', 'assouan'
    ];
    
    return basicEgyptKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    ) || message.length > 15;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
    
    const currentUserMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await GeminiGoogleService.sendMessage(newConversationHistory);
      
      console.log('🤖 Réponse GeminiService:', {
        message: aiResponse.message?.substring(0, 100) + '...',
        hasMessage: !!aiResponse.message
      });
      
      setConversationHistory([
        ...newConversationHistory,
        { role: 'assistant' as const, content: aiResponse.message }
      ]);

      const searchTerm = extractSearchTerms(currentUserMessage, aiResponse.message);
      
      if (searchTerm && onSearchUpdate) {
        console.log('🎯 Mise à jour de la recherche avec:', searchTerm);
        setTimeout(() => {
          onSearchUpdate(searchTerm);
        }, 1500);
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse.message,
        timestamp: new Date()
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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-gray-900 text-yellow-400 rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-600 relative"
        >
          <svg 
            className="h-7 w-7" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2L2 22h20L12 2zm0 3.84L19.16 20H4.84L12 5.84z"/>
            <path d="M12 5.84L16.58 18H7.42L12 5.84z" opacity="0.7"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-amber-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center border border-yellow-400">
                <svg className="h-6 w-6 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2zm0 3.84L19.16 20H4.84L12 5.84z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Anubis - Guide Égyptien</h3>
                <p className="text-sm text-yellow-100 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Connecté à la recherche principale
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  message.type === 'user'
                    ? 'bg-yellow-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-md border-l-4 border-yellow-600'
                } px-4 py-3`}>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </div>
                  
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md shadow-md px-4 py-3 border-l-4 border-yellow-600">
                  <div className="flex space-x-1 items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Anubis analyse...</span>
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Demandez-moi des recommandations... 🐪"
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
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Mes recommandations alimentent la recherche automatiquement
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelChatbot;