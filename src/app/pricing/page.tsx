"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  X,
  Star,
  Crown,
  Zap,
  Shield,
  Mail,
  Phone,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    period: 'Gratuit',
    description: 'Parfait pour découvrir la plateforme',
    icon: Building2,
    color: 'gray',
    features: [
      'Accès complet au site',
      'Consultation des établissements',
      'Système de réservation',
      'Évaluations et avis',
      'Support par email'
    ],
    limitations: [
      'Avec publicités',
      'Pas de gestion d\'établissement',
      'Support standard'
    ],
    cta: 'Gratuit',
    current: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 20,
    period: 'par mois',
    description: 'Idéal pour un établissement',
    icon: Star,
    color: 'amber',
    popular: true,
    features: [
      'Tout du plan Freemium',
      '1 établissement inclus',
      'Aucune publicité',
      'Dashboard propriétaire',
      'Gestion des réservations',
      'Analytics de base',
      'Support prioritaire'
    ],
    limitations: [],
    cta: 'Choisir Business'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 50,
    period: 'par mois',
    description: 'Pour plusieurs établissements',
    icon: Crown,
    color: 'blue',
    features: [
      'Tout du plan Business',
      'Jusqu\'à 3 établissements',
      'Analytics avancées',
      'Rapports détaillés',
      'API access basique',
      'Gestion multi-établissements',
      'Support chat en direct'
    ],
    limitations: [],
    cta: 'Choisir Enterprise'
  },
  {
    id: 'premium_plus',
    name: 'Premium+',
    price: null,
    period: 'Sur mesure',
    description: 'Solution personnalisée',
    icon: Sparkles,
    color: 'purple',
    features: [
      'Établissements illimités',
      'Solutions sur mesure',
      'White-label disponible',
      'Intégrations personnalisées',
      'Account manager dédié',
      'SLA garantie',
      'Formation équipe'
    ],
    limitations: [],
    cta: 'Contactez-nous',
    custom: true
  }
];

const PricingPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    if (!session) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    if (planId === 'freemium') {
      return; // Déjà gratuit
    }

    if (planId === 'premium_plus') {
      // Rediriger vers contact
      window.location.href = 'mailto:contact@epytogo.com?subject=Demande Premium+ - Solution sur mesure';
      return;
    }

    // Rediriger vers la simulation de paiement
    router.push(`/payment/simulate?plan=${planId}`);
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' | 'button') => {
    const colors = {
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return colors[color]?.[variant] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-amber-900 dark:text-amber-100 mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-amber-700 dark:text-amber-300 max-w-3xl mx-auto">
            Des solutions adaptées à tous vos besoins, de la découverte à la gestion multi-établissements
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? 'border-amber-400 dark:border-amber-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Badge Popular */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-2xl ${getColorClasses(plan.color, 'bg')} mb-4`}>
                      <IconComponent className={`h-8 w-8 ${getColorClasses(plan.color, 'text')}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    {plan.price !== null ? (
                      <>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                          {plan.price}€
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {plan.period}
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.period}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}

                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <X className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 dark:text-gray-500 text-sm">
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={plan.current}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                      plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : `${getColorClasses(plan.color, 'button')} text-white hover:shadow-lg`
                    }`}
                  >
                    {plan.current ? 'Plan actuel' : plan.cta}
                    {!plan.current && !plan.custom && <ChevronRight className="inline h-4 w-4 ml-1" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-amber-900 dark:text-amber-100 mb-12">
            Questions fréquentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont appliqués immédiatement.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Y a-t-il un engagement ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucun engagement requis. Vous pouvez annuler votre abonnement à tout moment.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Comment fonctionne la facturation ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La facturation est mensuelle et automatique. Toutes les transactions sont sécurisées par Stripe.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Que comprend le support ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Support par email pour tous, chat en direct pour Enterprise+, et account manager dédié pour Premium+.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Besoin d'aide pour choisir ?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Notre équipe est là pour vous aider à trouver la solution parfaite pour vos besoins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@epytogo.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Mail className="h-5 w-5 mr-2" />
                Nous contacter
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;