"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Shield
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/admin/users',
      label: 'Gestion des utilisateurs',
      icon: Users,
      description: 'Gérer les comptes utilisateurs'
    }
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center p-3 rounded-lg transition-all duration-200 group
              ${active
                ? 'bg-amber-200 dark:bg-amber-700/40 text-amber-900 dark:text-amber-100 shadow-md border-l-4 border-amber-600'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 hover:text-amber-900 dark:hover:text-amber-100'
              }
            `}
          >
            <Icon className={`h-5 w-5 mr-3 ${active ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} />
            <div className="flex-1">
              <div className={`font-medium ${active ? 'text-amber-900 dark:text-amber-100' : ''}`}>
                {item.label}
              </div>
              <div className={`text-xs ${active ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`}>
                {item.description}
              </div>
            </div>
            {active && (
              <div className="h-2 w-2 bg-amber-600 dark:bg-amber-400 rounded-full"></div>
            )}
          </Link>
        );
      })}

      {/* Indicateur de statut admin */}
      <div className="mt-8 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-800/20 dark:to-yellow-800/20 rounded-lg border border-amber-300 dark:border-amber-600">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-amber-700 dark:text-amber-300 mr-2" />
          <div>
            <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Mode Administration
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              Accès privilégié
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;