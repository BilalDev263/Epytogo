"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Badge, Trash2, Edit3 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useShowToast from '@/hooks/useShowToast';

interface Reservation {
  id: string;
  placeId: string;
  placeName: string;
  placeType: 'HOTEL' | 'RESTAURANT' | 'ATTRACTION';
  reservationDate: string;
  timeSlot?: string;
  roomNumber?: string;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests?: string;
  totalPrice?: number;
  createdAt: string;
  user: {
    id: string;
    firstname: string;
    lastname?: string;
    email: string;
  };
}

const MyReservations: React.FC = () => {
  const { data: session } = useSession();
  const { showToast } = useShowToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMyReservations();
    }
  }, [session]);

  async function fetchMyReservations() {
    try {
      const response = await fetch('/api/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        showToast({
          description: "Erreur lors du chargement des réservations",
          variant: "destructive",
        });
      }
    } catch (error) {
      showToast({
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function cancelReservation(reservationId: string) {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        showToast({
          description: "Réservation annulée avec succès",
          variant: "default",
        });
        fetchMyReservations();
      } else {
        showToast({
          description: "Erreur lors de l'annulation",
          variant: "destructive",
        });
      }
    } catch (error) {
      showToast({
        description: "Erreur de connexion",
        variant: "destructive",
      });
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'COMPLETED': return 'Terminée';
      default: return status;
    }
  }

  function getPlaceTypeLabel(type: string): string {
    switch (type) {
      case 'HOTEL': return 'Hôtel';
      case 'RESTAURANT': return 'Restaurant';
      case 'ATTRACTION': return 'Attraction';
      default: return type;
    }
  }

  if (!session) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Connectez-vous pour voir vos réservations
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Mes réservations
        </h3>
      </div>

      {reservations.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
          Vous n&apos;avez aucune réservation pour le moment
        </p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {reservation.placeName}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                      {getPlaceTypeLabel(reservation.placeType)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(reservation.reservationDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    {reservation.timeSlot && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {reservation.timeSlot}
                      </div>
                    )}

                    {reservation.roomNumber && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {reservation.roomNumber}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {reservation.numberOfGuests} personne{reservation.numberOfGuests > 1 ? 's' : ''}
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Demandes spéciales:</strong> {reservation.specialRequests}
                    </div>
                  )}

                  {reservation.totalPrice && (
                    <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Prix total: {reservation.totalPrice}€
                    </div>
                  )}
                </div>

                {reservation.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => cancelReservation(reservation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Annuler la réservation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                Réservée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')} à {new Date(reservation.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservations;