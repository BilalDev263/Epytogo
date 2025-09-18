"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';

const EstablishmentRequestPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'upgrade' | ''>('');
  const [subscriptionError, setSubscriptionError] = useState<any>(null);

  const [formData, setFormData] = useState({
    placeId: '',
    placeName: '',
    placeType: 'RESTAURANT' as 'RESTAURANT' | 'HOTEL' | 'ATTRACTION',
    description: '',
    phone: '',
    email: '',
    website: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.placeId || !formData.placeName) {
      setMessage('Veuillez remplir tous les champs obligatoires');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/establishments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Demande soumise avec succès ! Vous recevrez une notification une fois votre établissement vérifié.');
        setMessageType('success');

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          router.push('/establishment/dashboard');
        }, 3000);
      } else {
        if (data.upgradeRequired) {
          setSubscriptionError(data);
          setMessageType('upgrade');
          setMessage(data.error || 'Mise à niveau d\'abonnement requise');
        } else {
          setMessage(data.error || 'Erreur lors de la soumission');
          setMessageType('error');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: value,
          types: ['establishment'],
          language: 'fr',
          componentRestrictions: { country: 'eg' } // Restriction à l'Égypte
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.predictions || []);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const handlePlaceSelect = async (place: any) => {
    setSelectedPlace(place);
    setSearchQuery(place.description || place.structured_formatting?.main_text || '');

    // Mettre à jour les données de base
    setFormData(prev => ({
      ...prev,
      placeId: place.place_id,
      placeName: place.description || place.structured_formatting?.main_text || ''
    }));

    setShowSuggestions(false);
    setSuggestions([]);

    // Récupérer les détails de l'établissement pour auto-remplir les champs
    setIsLoadingDetails(true);
    try {
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: place.place_id
        }),
      });

      if (response.ok) {
        const details = await response.json();
        const fieldsToFill = [];

        // Auto-remplir les champs disponibles
        setFormData(prev => {
          const newData = { ...prev };

          if (details.phone && !prev.phone) {
            newData.phone = details.phone;
            fieldsToFill.push('phone');
          }

          if (details.website && !prev.website) {
            newData.website = details.website;
            fieldsToFill.push('website');
          }

          if (!prev.description && details.address) {
            newData.description = `Établissement situé à ${details.address}`;
            fieldsToFill.push('description');
          }

          return newData;
        });

        setAutoFilledFields(fieldsToFill);

        // Effacer les indicateurs après 3 secondes
        setTimeout(() => {
          setAutoFilledFields([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // Ne pas bloquer si l'API échoue, continuer avec les données de base
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearSelection = () => {
    setSelectedPlace(null);
    setSearchQuery('');
    setAutoFilledFields([]);
    setFormData(prev => ({
      ...prev,
      placeId: '',
      placeName: '',
      phone: '',
      website: '',
      description: ''
    }));
  };

  // Fermer les suggestions en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Building2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être connecté pour demander l'accès à votre établissement.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 transition-colors duration-300">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Demander l'accès à votre établissement
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les réservations et les informations de votre restaurant, hôtel ou attraction.
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recherche d'établissement */}
              <div ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher votre établissement *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tapez le nom de votre restaurant, hôtel ou attraction..."
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                    autoComplete="off"
                  />
                  {selectedPlace && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.place_id || index}
                        type="button"
                        onClick={() => handlePlaceSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </div>
                            {suggestion.structured_formatting?.secondary_text && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.structured_formatting.secondary_text}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Établissement sélectionné */}
                {selectedPlace && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          Établissement sélectionné
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {selectedPlace.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Tapez au moins 3 caractères pour rechercher votre établissement en Égypte
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'établissement *
                </label>
                <select
                  name="placeType"
                  value={formData.placeType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                >
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="HOTEL">Hôtel</option>
                  <option value="ATTRACTION">Attraction touristique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                  {autoFilledFields.includes('description') && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      ✓ Auto-rempli
                    </span>
                  )}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Décrivez votre établissement..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400 ${
                      autoFilledFields.includes('description')
                        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
              </div>

              {/* Informations de contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                    {autoFilledFields.includes('phone') && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                        ✓ Auto-rempli
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400 ${
                        autoFilledFields.includes('phone')
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {isLoadingDetails && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@restaurant.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site web
                  {autoFilledFields.includes('website') && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      ✓ Auto-rempli
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.restaurant.com"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400 ${
                      autoFilledFields.includes('website')
                        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
              </div>

              {/* Message de résultat */}
              {message && (
                <div className={`border rounded-lg p-4 ${
                  messageType === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : messageType === 'upgrade'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start">
                    {messageType === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    ) : messageType === 'upgrade' ? (
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        messageType === 'success'
                          ? 'text-green-800 dark:text-green-200'
                          : messageType === 'upgrade'
                          ? 'text-amber-800 dark:text-amber-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {message}
                      </p>

                      {/* Détails de l'abonnement et options de mise à niveau */}
                      {messageType === 'upgrade' && subscriptionError && (
                        <div className="mt-4 space-y-3">
                          <div className="text-xs text-amber-700 dark:text-amber-300">
                            <p><strong>Plan actuel :</strong> {subscriptionError.currentPlan}</p>
                            <p><strong>Établissements :</strong> {subscriptionError.currentCount}/{subscriptionError.maxAllowed}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              href="/pricing"
                              className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              Voir les plans
                            </Link>
                            {subscriptionError.currentPlan === 'FREEMIUM' && (
                              <Link
                                href="/pricing?plan=business"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                Passer au Business (20€/mois)
                              </Link>
                            )}
                            {subscriptionError.currentPlan === 'BUSINESS' && (
                              <Link
                                href="/pricing?plan=enterprise"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                Passer à Enterprise (50€/mois)
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note :</strong> Votre demande sera examinée par notre équipe.
                  Vous recevrez une notification par email une fois votre établissement vérifié et approuvé.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4" />
                      Soumettre la demande
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentRequestPage;