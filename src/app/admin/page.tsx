"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminHomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers la gestion des utilisateurs
    router.replace('/admin/users');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirection vers la gestion des utilisateurs...</p>
      </div>
    </div>
  );
};

export default AdminHomePage;