import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
  subscription: string;
  subscriptionStatus: string | null;
  hasAdsAccess: boolean;
  loading: boolean;
}

export const useSubscription = (): SubscriptionInfo => {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<string>('FREEMIUM');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchSubscription = async () => {
      if (!session?.user?.email) {
        setSubscription('FREEMIUM');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription || 'FREEMIUM');
          setSubscriptionStatus(data.subscriptionStatus);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        setSubscription('FREEMIUM');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session, status]);

  // Détermine si l'utilisateur doit voir les publicités
  const hasAdsAccess = subscription === 'FREEMIUM';

  return {
    subscription,
    subscriptionStatus,
    hasAdsAccess,
    loading
  };
};