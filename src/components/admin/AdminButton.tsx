"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Shield, Settings } from 'lucide-react';

const AdminButton: React.FC = () => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    checkAdminStatus();
  }, [session, status]);

  const checkAdminStatus = async () => {
    try {
      // Utiliser l'API admin pour vérifier les permissions
      const response = await fetch('/api/admin/users?page=1&limit=1');

      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher si en cours de chargement, pas connecté, ou pas admin
  if (loading || !session || !isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-200 border border-amber-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600"
      title="Accéder à l'interface d'administration"
    >
      <Shield className="h-4 w-4" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
};

export default AdminButton;