"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-80 bg-amber-50 dark:bg-amber-900/20 shadow-lg border-r border-amber-200 dark:border-amber-800 min-h-screen">
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                  Administration
                </h1>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Gestion de la plateforme Epytogo
                </p>
              </div>

              {/* Bouton retour au site */}
              <div className="mb-6">
                <Link
                  href="/"
                  className="flex items-center p-3 bg-amber-100 dark:bg-amber-800/30 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700/30 transition-all duration-200 border border-amber-300 dark:border-amber-600"
                >
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Retour au site</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">Interface client</div>
                  </div>
                </Link>
              </div>

              {/* Navigation admin */}
              <AdminNavigation />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}