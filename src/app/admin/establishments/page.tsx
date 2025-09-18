"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Eye,
  Check,
  X,
  MoreVertical,
  Shield,
  Crown,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

interface Establishment {
  id: string;
  placeId: string;
  name: string;
  type: 'RESTAURANT' | 'HOTEL' | 'ATTRACTION';
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
    role: string;
  };
  _count: {
    reservations: number;
    staff: number;
  };
}

interface EstablishmentsResponse {
  establishments: Establishment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const EstablishmentsManagementPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEstablishments, setTotalEstablishments] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchEstablishments();
  }, [session, status, currentPage, searchTerm, selectedType, selectedStatus]);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/establishments?${params}`);

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Erreur lors du chargement des établissements');
      }

      const data: EstablishmentsResponse = await response.json();
      setEstablishments(data.establishments);
      setTotalPages(data.pagination.totalPages);
      setTotalEstablishments(data.pagination.total);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEstablishment = async (id: string, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/establishments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await fetchEstablishments();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT':
        return '🍽️';
      case 'HOTEL':
        return '🏨';
      case 'ATTRACTION':
        return '🎯';
      default:
        return '🏢';
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (type) {
      case 'RESTAURANT':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'HOTEL':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'ATTRACTION':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  if (loading && establishments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des établissements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-3">
            <Building2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            Gestion des établissements
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-300">
            ({totalEstablishments} établissements)
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-xl shadow-xl border border-amber-200 dark:border-amber-700/50">
          <div className="p-6 border-b border-amber-200 dark:border-amber-700/50 bg-gradient-to-r from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, propriétaire ou email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-white/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 placeholder-amber-600 dark:placeholder-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-8 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-white/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                  >
                    <option value="">Tous les types</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="HOTEL">Hôtel</option>
                    <option value="ATTRACTION">Attraction</option>
                  </select>
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-white/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                >
                  <option value="">Tous les statuts</option>
                  <option value="verified">Vérifiés</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-800/30 dark:to-orange-800/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 dark:bg-amber-900/20 divide-y divide-amber-200 dark:divide-amber-700/50">
                {establishments.map((establishment) => (
                  <tr key={establishment.id} className="hover:bg-amber-50/60 dark:hover:bg-amber-800/20 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getTypeIcon(establishment.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {establishment.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={getTypeBadge(establishment.type)}>
                              {establishment.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {establishment.owner.firstname || establishment.owner.lastname ?
                          `${establishment.owner.firstname || ''} ${establishment.owner.lastname || ''}`.trim() :
                          'Nom non défini'
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {establishment.owner.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {establishment.phone && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="h-3 w-3 mr-1" />
                            {establishment.phone}
                          </div>
                        )}
                        {establishment.email && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="h-3 w-3 mr-1" />
                            {establishment.email}
                          </div>
                        )}
                        {establishment.website && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Globe className="h-3 w-3 mr-1" />
                            <a href={establishment.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Site web
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          establishment.isVerified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {establishment.isVerified ? 'Vérifié' : 'En attente'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          establishment.isActive
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {establishment.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>{establishment._count.reservations} réservations</div>
                        <div>{establishment._count.staff} membre(s)</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!establishment.isVerified && (
                          <button
                            onClick={() => handleVerifyEstablishment(establishment.id, true)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Vérifier"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {establishment.isVerified && (
                          <button
                            onClick={() => handleVerifyEstablishment(establishment.id, false)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Annuler la vérification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstablishmentsManagementPage;