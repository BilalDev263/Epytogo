"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  ArrowRight,
  Calendar,
  Building2
} from 'lucide-react';
import Link from 'next/link';

const planDetails = {
  business: {
    name: 'Business',
    icon: Star,
    color: 'amber',
    price: '20€',
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
    features: [
      'Jusqu\'à 3 établissements',
      'Analytics avancées',
      'API access',
      'Support chat direct'
    ]
  }
};

const PaymentSuccessPage: React.FC = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') as keyof typeof planDetails;

  useEffect(() => {
    if (!session || !sessionId || !plan) {
      setError('Paramètres manquants');
      setProcessing(false);
      return;
    }

    // Simulation de la mise à jour de l'abonnement
    const updateSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/webhook/success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            plan,
            userId: session.user.id
          }),
        });

        if (response.ok) {
          // Mettre à jour la session NextAuth
          await update();
        } else {
          throw new Error('Erreur lors de la mise à jour');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de l\'activation de l\'abonnement');
      } finally {
        setProcessing(false);
      }
    };

    // Simuler un délai de traitement
    setTimeout(updateSubscription, 2000);
  }, [session, sessionId, plan, update]);

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

  const planInfo = planDetails[plan];
  const IconComponent = planInfo.icon;

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Activation en cours...
          </h1>
          <p className="text-amber-700 dark:text-amber-300">
            Nous activons votre abonnement {planInfo.name}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <X className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur de paiement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Réessayer
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-6 mx-auto mb-8 w-24 h-24 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            Paiement réussi ! 🎉
          </h1>
          <p className="text-xl text-amber-700 dark:text-amber-300 mb-8">
            Bienvenue dans le plan <strong>{planInfo.name}</strong>
          </p>

          {/* Plan Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`p-4 rounded-2xl ${
                planInfo.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
              }`}>
                <IconComponent className={`h-8 w-8 ${
                  planInfo.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Plan {planInfo.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {planInfo.price} par mois
            </p>

            <div className="space-y-3">
              {planInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Prochaines étapes
            </h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-2 mr-4 mt-1">
                  <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Enregistrez votre établissement
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Ajoutez votre restaurant, hôtel ou attraction à la plateforme
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-2 mr-4 mt-1">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Gérez vos réservations
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Accédez au dashboard pour voir et gérer vos réservations
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-2 mr-4 mt-1">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Profitez d'une expérience sans pub
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Naviguez sur la plateforme sans aucune publicité
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/establishment/request"
              className="inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Enregistrer mon établissement
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Besoin d'aide ? Contactez notre support à{' '}
              <a href="mailto:support@epytogo.com" className="text-amber-600 hover:text-amber-700">
                support@epytogo.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;