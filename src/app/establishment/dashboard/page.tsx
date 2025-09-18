"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Globe,
  MapPin,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight
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
  _count: {
    reservations: number;
    staff: number;
  };
}

interface Reservation {
  id: string;
  userId: string;
  user: {
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
  reservationDate: string;
  timeSlot: string | null;
  roomNumber: string | null;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests: string | null;
  totalPrice: number | null;
  createdAt: string;
}

const EstablishmentDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'staff' | 'settings'>('overview');
  const [updatingReservation, setUpdatingReservation] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarReservations, setCalendarReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchEstablishments();
  }, [session, status]);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('/api/establishments/request');
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data.ownedEstablishments || []);
        if (data.ownedEstablishments?.length > 0) {
          setSelectedEstablishment(data.ownedEstablishments[0]);
          fetchReservations(data.ownedEstablishments[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (establishmentId: string) => {
    try {
      const response = await fetch(`/api/establishments/${establishmentId}/reservations?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
        setCalendarReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    if (!selectedEstablishment) return;

    try {
      setUpdatingReservation(reservationId);
      const response = await fetch(`/api/establishments/${selectedEstablishment.id}/reservations`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          status: newStatus
        }),
      });

      if (response.ok) {
        // Recharger les réservations
        await fetchReservations(selectedEstablishment.id);
      } else {
        console.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUpdatingReservation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = "px-2 py-1 rounded-full text-xs font-medium";
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT': return '🍽️';
      case 'HOTEL': return '🏨';
      case 'ATTRACTION': return '🎯';
      default: return '🏢';
    }
  };

  // Fonctions pour le calendrier
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getReservationsForDate = (date: Date) => {
    return calendarReservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate);
      return reservationDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Jours de la semaine
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    // En-tête du calendrier
    const calendarHeader = (
      <div key="header" className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-amber-600" />
        </button>
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 capitalize">
          {getMonthName(currentDate)}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-amber-600" />
        </button>
      </div>
    );

    // Noms des jours
    const dayNamesRow = (
      <div key="day-names" className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-amber-700 dark:text-amber-300 py-2">
            {day}
          </div>
        ))}
      </div>
    );

    // Espaces vides pour aligner le premier jour
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      );
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayReservations = getReservationsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`aspect-square border border-amber-200 dark:border-amber-700/50 rounded-lg p-1 ${
            isToday ? 'bg-amber-100 dark:bg-amber-800/30' : 'bg-white dark:bg-amber-900/10'
          }`}
        >
          <div className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
            {day}
          </div>
          <div className="space-y-1">
            {dayReservations.slice(0, 2).map((reservation, index) => (
              <div
                key={index}
                className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${
                  reservation.status === 'CONFIRMED' ? 'bg-green-500' :
                  reservation.status === 'PENDING' ? 'bg-yellow-500' :
                  reservation.status === 'CANCELLED' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
                title={`${reservation.user.firstname || ''} ${reservation.user.lastname || ''} - ${reservation.status}`}
              >
                {reservation.user.firstname?.[0] || reservation.user.email[0]}
                {reservation.timeSlot && ` ${reservation.timeSlot.split('-')[0]}`}
              </div>
            ))}
            {dayReservations.length > 2 && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400">
                +{dayReservations.length - 2}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        {calendarHeader}
        {dayNamesRow}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (establishments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Building2 className="h-24 w-24 text-amber-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-4">
              Aucun établissement trouvé
            </h1>
            <p className="text-lg text-amber-700 dark:text-amber-300 mb-8">
              Vous n'avez pas encore d'établissement enregistré ou en attente de validation.
            </p>
            <button
              onClick={() => router.push('/establishment/request')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Enregistrer mon établissement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-3">
            <Building2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            Tableau de bord - Établissement
          </h1>

          {selectedEstablishment && (
            <div className="bg-white dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getTypeIcon(selectedEstablishment.type)}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                    {selectedEstablishment.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEstablishment.isVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {selectedEstablishment.isVerified ? 'Vérifié' : 'En attente de vérification'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEstablishment.isActive
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {selectedEstablishment.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedEstablishment && !selectedEstablishment.isVerified && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Votre établissement est en attente de vérification par nos équipes.
                Vous recevrez une notification dès que votre établissement sera validé.
              </p>
            </div>
          </div>
        )}

        {selectedEstablishment?.isVerified && (
          <>
            <div className="flex space-x-1 mb-6">
              {(['overview', 'reservations', 'staff', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30'
                  }`}
                >
                  {tab === 'overview' && 'Vue d\'ensemble'}
                  {tab === 'reservations' && 'Réservations'}
                  {tab === 'staff' && 'Personnel'}
                  {tab === 'settings' && 'Paramètres'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Réservations totales</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {selectedEstablishment._count.reservations}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-amber-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Personnel</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {selectedEstablishment._count.staff}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-amber-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">En attente</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {reservations.filter(r => r.status === 'PENDING').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Confirmées</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {reservations.filter(r => r.status === 'CONFIRMED').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Calendrier des réservations */}
              <div className="mt-8">
                <div className="bg-white dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      Calendrier des réservations
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">En attente</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Confirmée</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Terminée</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Annulée</span>
                      </div>
                    </div>
                  </div>
                  {renderCalendar()}
                </div>
              </div>
              </>
            )}

            {activeTab === 'reservations' && (
              <div className="bg-white dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
                <div className="p-6 border-b border-amber-200 dark:border-amber-700/50">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    Réservations récentes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50 dark:bg-amber-800/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Date/Heure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Invités
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200 dark:divide-amber-700/50">
                      {reservations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Aucune réservation trouvée
                          </td>
                        </tr>
                      ) : (
                        reservations.map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-amber-50/60 dark:hover:bg-amber-800/20">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {reservation.user.firstname || reservation.user.lastname
                                    ? `${reservation.user.firstname || ''} ${reservation.user.lastname || ''}`.trim()
                                    : 'Client'
                                  }
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {reservation.user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}
                              </div>
                              {reservation.timeSlot && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {reservation.timeSlot}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {reservation.numberOfGuests} personne(s)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(reservation.status)}>
                                {reservation.status === 'PENDING' && 'En attente'}
                                {reservation.status === 'CONFIRMED' && 'Confirmée'}
                                {reservation.status === 'CANCELLED' && 'Annulée'}
                                {reservation.status === 'COMPLETED' && 'Terminée'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {reservation.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                                      disabled={updatingReservation === reservation.id}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                      title="Confirmer"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
                                      disabled={updatingReservation === reservation.id}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                      title="Annuler"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {reservation.status === 'CONFIRMED' && (
                                  <>
                                    <button
                                      onClick={() => updateReservationStatus(reservation.id, 'COMPLETED')}
                                      disabled={updatingReservation === reservation.id}
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                                      title="Marquer comme terminée"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
                                      disabled={updatingReservation === reservation.id}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                      title="Annuler"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
                  Gestion du personnel
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            )}

            {activeTab === 'settings' && selectedEstablishment && (
              <div className="bg-white dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700/50">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-6">
                  Informations de l'établissement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                      Nom de l'établissement
                    </label>
                    <input
                      type="text"
                      value={selectedEstablishment.name}
                      disabled
                      className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      value={selectedEstablishment.type}
                      disabled
                      className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                    />
                  </div>
                  {selectedEstablishment.phone && (
                    <div>
                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={selectedEstablishment.phone}
                        disabled
                        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                      />
                    </div>
                  )}
                  {selectedEstablishment.email && (
                    <div>
                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={selectedEstablishment.email}
                        disabled
                        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                      />
                    </div>
                  )}
                  {selectedEstablishment.website && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={selectedEstablishment.website}
                        disabled
                        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                      />
                    </div>
                  )}
                  {selectedEstablishment.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={selectedEstablishment.description}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-50 dark:bg-amber-900/30 text-gray-500 dark:text-amber-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EstablishmentDashboard;