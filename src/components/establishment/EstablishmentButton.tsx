"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

const EstablishmentButton: React.FC = () => {
  const { data: session } = useSession();

  // Afficher le bouton seulement pour les propriétaires d'établissements
  if (!session?.user || !session.user.role ||
      !['RESTAURANT_OWNER', 'HOTEL_OWNER', 'ATTRACTION_OWNER'].includes(session.user.role)) {
    return null;
  }

  return (
    <Link
      href="/establishment/dashboard"
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
    >
      <Building2 className="h-4 w-4" />
      <span className="hidden lg:inline">Mon établissement</span>
    </Link>
  );
};

export default EstablishmentButton;