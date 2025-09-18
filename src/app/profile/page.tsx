"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Eye,
  X,
  Filter,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Reservation {
  id: string;
  establishmentId: string;
  establishment: {
    id: string;
    name: string;
    type: 'RESTAURANT' | 'HOTEL' | 'ATTRACTION';
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  reservationDate: string;
  timeSlot: string | null;
  roomNumber: string | null;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests: string | null;
  totalPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login?redirect=/profile');
      return;
    }

    fetchReservations();
  }, [session, status, filterStatus]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/user/reservations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      setCancellingReservation(reservationId);
      const response = await fetch('/api/user/reservations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          action: 'cancel'
        }),
      });

      if (response.ok) {
        await fetchReservations(); // Recharger les données
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'annulation de la réservation');
    } finally {
      setCancellingReservation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'CONFIRMED':
        return `${classes} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'PENDING':
        return `${classes} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'CANCELLED':
        return `${classes} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'COMPLETED':
        return `${classes} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${classes} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'COMPLETED': return 'Terminée';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT': return '🍽️';
      case 'HOTEL': return '🏨';
      case 'ATTRACTION': return '🎯';
      default: return '🏢';
    }
  };

  const canCancelReservation = (reservation: Reservation) => {
    if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
      return false;
    }
    const reservationDate = new Date(reservation.reservationDate);
    const now = new Date();
    return reservationDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-4">
                <User className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mon Profil
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {session.user?.name || 'Utilisateur'} • {session.user?.email}
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{stats.pending}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">En attente</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.confirmed}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Confirmées</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.completed}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Terminées</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.cancelled}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Annulées</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mes Réservations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Calendar className="h-6 w-6 text-amber-600" />
                Mes Réservations
              </h2>

              {/* Filtres */}
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                >
                  <option value="all">Toutes</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des réservations */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reservations.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune réservation trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filterStatus === 'all'
                    ? "Vous n'avez pas encore effectué de réservation."
                    : `Aucune réservation avec le statut "${getStatusText(filterStatus)}".`
                  }
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Découvrir les établissements
                </Link>
              </div>
            ) : (
              reservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{getTypeIcon(reservation.establishment.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {reservation.establishment.name}
                          </h3>
                          <span className={getStatusBadge(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(reservation.reservationDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>

                          {reservation.timeSlot && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{reservation.timeSlot}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{reservation.numberOfGuests} personne(s)</span>
                          </div>

                          {reservation.roomNumber && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>Chambre {reservation.roomNumber}</span>
                            </div>
                          )}
                        </div>

                        {reservation.specialRequests && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Demandes spéciales :</strong> {reservation.specialRequests}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Réservé le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canCancelReservation(reservation) && (
                        <button
                          onClick={() => cancelReservation(reservation.id)}
                          disabled={cancellingReservation === reservation.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Annuler la réservation"
                        >
                          {cancellingReservation === reservation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de détails */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Détails de la réservation
                  </h3>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{getTypeIcon(selectedReservation.establishment.type)}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedReservation.establishment.name}
                    </h4>
                    <span className={getStatusBadge(selectedReservation.status)}>
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de réservation
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedReservation.reservationDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {selectedReservation.timeSlot && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Heure
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedReservation.timeSlot}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre d'invités
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedReservation.numberOfGuests} personne(s)</p>
                  </div>

                  {selectedReservation.roomNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numéro de chambre
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedReservation.roomNumber}</p>
                    </div>
                  )}
                </div>

                {selectedReservation.specialRequests && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Demandes spéciales
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-white">{selectedReservation.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Informations de contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact établissement
                  </label>
                  <div className="space-y-2">
                    {selectedReservation.establishment.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${selectedReservation.establishment.phone}`}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          {selectedReservation.establishment.phone}
                        </a>
                      </div>
                    )}
                    {selectedReservation.establishment.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${selectedReservation.establishment.email}`}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          {selectedReservation.establishment.email}
                        </a>
                      </div>
                    )}
                    {selectedReservation.establishment.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={selectedReservation.establishment.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {canCancelReservation(selectedReservation) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        cancelReservation(selectedReservation.id);
                        setSelectedReservation(null);
                      }}
                      disabled={cancellingReservation === selectedReservation.id}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {cancellingReservation === selectedReservation.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Annulation en cours...
                        </>
                      ) : (
                        'Annuler cette réservation'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;