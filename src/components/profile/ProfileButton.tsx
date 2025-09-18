"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

const ProfileButton: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // N'afficher le bouton que si l'utilisateur est connecté
  if (status === 'loading' || !session) {
    return null;
  }

  const handleClick = () => {
    router.push('/profile');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
      title="Mon profil"
    >
      <User className="h-4 w-4" />
      <span className="hidden lg:inline">Profil</span>
    </button>
  );
};

export default ProfileButton;