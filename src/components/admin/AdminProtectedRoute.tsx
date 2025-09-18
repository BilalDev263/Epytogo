"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN';
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredRole = 'ADMIN'
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Vérifier les permissions
    checkPermissions();
  }, [session, status, requiredRole]);

  const checkPermissions = async () => {
    try {
      const response = await fetch('/api/admin/users?page=1&limit=1');

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (response.status === 403) {
        setIsAuthorized(false);
        return;
      }

      if (response.ok) {
        setIsAuthorized(true);
        return;
      }

      // Autres erreurs
      setIsAuthorized(false);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      setIsAuthorized(false);
    }
  };

  // Loading state
  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Seuls les administrateurs peuvent accéder à cette section.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Authorized state
  return <>{children}</>;
};

export default AdminProtectedRoute;