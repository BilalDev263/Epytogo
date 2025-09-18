"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  Star,
  Crown,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const planDetails = {
  business: {
    name: 'Business',
    icon: Star,
    color: 'amber',
    price: '20€',
    period: 'par mois',
    features: [
      '1 établissement inclus',
      'Aucune publicité',
      'Dashboard propriétaire',
      'Support prioritaire'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    icon: Crown,
    color: 'blue',
    price: '50€',
    period: 'par mois',
    features: [
      'Jusqu\'à 3 établissements',
      'Analytics avancées',
      'API access',
      'Support chat direct'
    ]
  }
};

const SimulatedPaymentPageContent: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get('plan') as keyof typeof planDetails;

  // Simulated payment form data
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/25',
    cvc: '123',
    cardName: '',
    email: session?.user?.email || ''
  });

  useEffect(() => {
    if (session?.user?.name) {
      setPaymentData(prev => ({
        ...prev,
        cardName: session.user.name || ''
      }));
    }
  }, [session]);

  if (!plan || !planDetails[plan]) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Plan non reconnu</h1>
          <Link href="/pricing" className="text-blue-600 hover:text-blue-800">
            Retour aux plans
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Veuillez vous connecter pour continuer
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const planInfo = planDetails[plan];
  const IconComponent = planInfo.icon;

  const handlePayment = async () => {
    if (!paymentData.cardName.trim()) {
      setError('Veuillez remplir le nom sur la carte');
      return;
    }

    setProcessing(true);
    setError(null);

    // Simulation d'un délai de traitement de paiement
    setTimeout(async () => {
      try {
        // Simuler un identifiant de session de paiement
        const simulatedSessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Rediriger vers la page de succès avec les paramètres
        router.push(`/pricing/success?session_id=${simulatedSessionId}&plan=${plan}`);
      } catch (error) {
        console.error('Erreur lors de la simulation de paiement:', error);
        setError('Erreur lors du traitement du paiement');
        setProcessing(false);
      }
    }, 2000); // Délai de 2 secondes pour simuler le traitement
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/pricing"
              className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux plans
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Finaliser votre abonnement
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Mode simulation - Aucun paiement réel ne sera effectué
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Récapitulatif de votre commande
              </h2>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    planInfo.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      planInfo.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Plan {planInfo.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {planInfo.price} {planInfo.period}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {planInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">{planInfo.price}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Facturation mensuelle automatique
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <Lock className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Paiement simulé
                </h2>
              </div>

              {/* Warning Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Mode simulation
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Il s'agit d'une simulation de paiement. Aucun montant ne sera débité de votre carte.
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={paymentData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                    placeholder="votre@email.com"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de carte (simulation)
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      name="cvc"
                      value={paymentData.cvc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                    placeholder="Nom complet"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Simuler le paiement de {planInfo.price}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  En cliquant sur "Simuler le paiement", vous acceptez nos conditions d'utilisation.
                  Aucun paiement réel ne sera effectué en mode simulation.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimulatedPaymentPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    }>
      <SimulatedPaymentPageContent />
    </Suspense>
  );
};

export default SimulatedPaymentPage;