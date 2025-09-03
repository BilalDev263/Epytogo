"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useShowToast from '@/hooks/useShowToast';

interface Place {
  place_id: string;
  name: string;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      close: { day: number; time: string };
      open: { day: number; time: string };
    }>;
  };
}

interface ReservationData {
  placeId: string;
  placeName: string;
  placeType: 'HOTEL' | 'RESTAURANT' | 'ATTRACTION';
  reservationDate: string;
  timeSlot?: string;
  roomNumber?: string;
  numberOfGuests: number;
  specialRequests?: string;
  totalPrice?: number;
}

interface ReservationCalendarProps {
  place: Place;
  onReservationSuccess?: () => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ 
  place, 
  onReservationSuccess 
}) => {
  const { data: session } = useSession();
  const { showToast } = useShowToast();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingReservations, setExistingReservations] = useState<any[]>([]);

  const placeType = getPlaceType(place.types);
  const timeSlots = generateTimeSlots(place.opening_hours);
  const rooms = generateRooms(placeType);

  useEffect(() => {
    if (place.place_id) {
      fetchExistingReservations();
    }
  }, [place.place_id]);

  function getPlaceType(types: string[]): 'HOTEL' | 'RESTAURANT' | 'ATTRACTION' {
    if (types.includes('lodging') || types.includes('hotel')) return 'HOTEL';
    if (types.includes('restaurant') || types.includes('food')) return 'RESTAURANT';
    return 'ATTRACTION';
  }

  function generateTimeSlots(opening_hours?: any): string[] {
    if (!opening_hours?.periods) {
      return ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
    }

    const slots: string[] = [];
    const today = new Date().getDay();
    const todayHours = opening_hours.periods.find((p: any) => p.open.day === today);
    
    if (todayHours) {
      const openTime = parseInt(todayHours.open.time);
      const closeTime = parseInt(todayHours.close.time);
      
      for (let hour = openTime; hour < closeTime; hour += 200) {
        const start = `${Math.floor(hour / 100).toString().padStart(2, '0')}:${(hour % 100).toString().padStart(2, '0')}`;
        const end = `${Math.floor((hour + 200) / 100).toString().padStart(2, '0')}:${((hour + 200) % 100).toString().padStart(2, '0')}`;
        slots.push(`${start}-${end}`);
      }
    }
    
    return slots.length > 0 ? slots : ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00'];
  }

  function generateRooms(type: string): string[] {
    if (type !== 'HOTEL') return [];
    return [
      'Chambre Standard 101',
      'Chambre Standard 102', 
      'Chambre Deluxe 201',
      'Chambre Deluxe 202',
      'Suite Junior 301',
      'Suite Royale 401'
    ];
  }

  async function fetchExistingReservations() {
    try {
      const response = await fetch(`/api/reservations?placeId=${place.place_id}`);
      if (response.ok) {
        const data = await response.json();
        setExistingReservations(data);
      }
    } catch (error) {
      console.error('Erreur récupération réservations:', error);
    }
  }

  function isSlotAvailable(date: string, timeSlot: string, room?: string): boolean {
    return !existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservationDate).toDateString();
      const selectedDateObj = new Date(date).toDateString();
      
      if (reservationDate !== selectedDateObj) return false;
      if (reservation.status === 'CANCELLED') return false;
      
      if (placeType === 'HOTEL') {
        return reservation.roomNumber === room;
      } else {
        return reservation.timeSlot === timeSlot;
      }
    });
  }

  const handleReservation = async () => {
    if (!session) {
      showToast({
        description: "Veuillez vous connecter pour faire une réservation",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      showToast({
        description: "Veuillez sélectionner une date",
        variant: "destructive",
      });
      return;
    }

    if (placeType !== 'HOTEL' && !selectedTime) {
      showToast({
        description: "Veuillez sélectionner un créneau horaire",
        variant: "destructive",
      });
      return;
    }

    if (placeType === 'HOTEL' && !selectedRoom) {
      showToast({
        description: "Veuillez sélectionner une chambre",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const reservationData: ReservationData = {
      placeId: place.place_id,
      placeName: place.name,
      placeType,
      reservationDate: selectedDate,
      numberOfGuests,
      specialRequests: specialRequests || undefined,
    };

    if (placeType === 'HOTEL') {
      reservationData.roomNumber = selectedRoom;
    } else {
      reservationData.timeSlot = selectedTime;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        showToast({
          description: "Réservation créée avec succès !",
          variant: "default",
        });
        
        setSelectedDate('');
        setSelectedTime('');
        setSelectedRoom('');
        setNumberOfGuests(1);
        setSpecialRequests('');
        
        fetchExistingReservations();
        onReservationSuccess?.();
      } else {
        const error = await response.json();
        showToast({
          description: error.error || "Erreur lors de la réservation",
          variant: "destructive",
        });
      }
    } catch (error) {
      showToast({
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Faire une réservation
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date de réservation
          </label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>

        {placeType === 'HOTEL' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chambre
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="">Sélectionner une chambre</option>
              {rooms.map((room) => {
                const available = !selectedDate || isSlotAvailable(selectedDate, '', room);
                return (
                  <option key={room} value={room} disabled={!available}>
                    {room} {!available && '(Occupée)'}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Créneau horaire
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => {
                const available = !selectedDate || isSlotAvailable(selectedDate, slot);
                return (
                  <button
                    key={slot}
                    onClick={() => available && setSelectedTime(slot)}
                    disabled={!available}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot
                        ? 'bg-yellow-600 text-white'
                        : available
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-yellow-100 dark:hover:bg-yellow-900'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="h-4 w-4 inline mr-1" />
                    {slot}
                    {!available && (
                      <XCircle className="h-4 w-4 inline ml-1 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de personnes
          </label>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <input
              type="number"
              min="1"
              max="20"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Demandes spéciales (optionnel)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Allergies, préférences, besoins spéciaux..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          />
        </div>

        <button
          onClick={handleReservation}
          disabled={isLoading || !selectedDate || (placeType !== 'HOTEL' && !selectedTime) || (placeType === 'HOTEL' && !selectedRoom)}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Réservation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Confirmer la réservation
            </>
          )}
        </button>

        {!session && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Connectez-vous pour faire une réservation</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCalendar;