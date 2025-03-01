"use client";

import { Button } from "@/components/ui/button";
import { Service } from "@/services/Service";
import { PlaceResult } from "@/services/ServiceInterface";
import { useStore } from "@/store/useStore";
import { Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function Page({ params }: { params: { placeId: string } }) {
  const { placeId } = params;

  const [placeDetails, setPlaceDetails] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { currentUser, setCurrentUser } = useStore();

  const service = useMemo(
    () => new Service("https://places.googleapis.com", "POST"),
    []
  );

  const fetchPlaceDetails = async () => {
    if (!placeId) return;

    setLoading(true);
    setError(null);

    try {
      const results = await service.searchById({
        placeId: String(placeId),
      });

      if (results) {
        setPlaceDetails(results);
      } else {
        setError("Aucun détail trouvé pour cet endroit.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${placeId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des avis :", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user);
      fetchPlaceDetails();
      fetchReviews();
    }
  }, [session]);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/reviews/${placeId}`, {
      method: editingReviewId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser?.id,
        rating,
        comment,
      }),
    });

    if (response.ok) {
      setRating(0);
      setComment("");
      setEditingReviewId(null);
      fetchReviews();
    } else {
      console.error("Erreur lors de la soumission du commentaire :", response);
    }
  };

  const handleEditReview = (review: any) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditingReviewId(review.id);
  };

  useEffect(() => {
    fetchPlaceDetails();
    fetchReviews();
  }, [placeId]);

  const formatTime = (hour: number, minute: number) => {
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${hour}:${formattedMinute}`;
  };

  const renderOpeningHours = (openingHours: any) => {
    if (!openingHours) return <span className="text-gray-600 dark:text-gray-400">Horaires d'ouverture non disponibles.</span>;

    return (
      <div className="text-base space-y-2 text-gray-700 dark:text-gray-300">
        <p className="font-semibold">
          <strong className="text-gray-900 dark:text-white">Ouvert maintenant :</strong>{" "}
          <span className={`font-semibold ${openingHours.openNow ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {openingHours.openNow ? "Oui" : "Non"}
          </span>
        </p>
        <ul className="list-disc ml-6 space-y-1">
          {openingHours.periods.map((period: any, index: number) => (
            <li key={index}>
              <strong className="text-gray-900 dark:text-white">Jour {period.open.day} :</strong>{" "}
              {formatTime(period.open.hour, period.open.minute)} -{" "}
              {formatTime(period.close.hour, period.close.minute)}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          <strong className="text-gray-900 dark:text-white">Description des jours de la semaine :</strong>{" "}
          {openingHours.weekdayDescriptions.join(", ")}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Chargement des détails...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-red-500 dark:text-red-400 text-lg font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  if (!placeDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl text-gray-700 dark:text-gray-300">
            Aucun détail trouvé pour cet endroit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex flex-col items-center pt-12 pb-8 space-y-6 px-4">
        {/* Détails du lieu */}
        <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            {placeDetails.displayName.text}
          </h2>
          <div className="rounded-lg overflow-hidden mb-6 shadow-md">
            <Image
              src={
                placeDetails.photos && placeDetails.photos.length > 0
                  ? `https://places.googleapis.com/v1/${placeDetails.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxWidthPx=1000&maxHeightPx=750`
                  : "/placeholder-image.jpg"
              }
              alt={placeDetails.displayName.text}
              className="w-full object-cover"
              width={1000}
              height={750}
            />
          </div>
          <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
            <p>
              <strong className="text-gray-900 dark:text-white">Adresse :</strong> {placeDetails.formattedAddress}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Évaluation :</strong>{" "}
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                {placeDetails.rating || "Non disponible"} / 5
              </span>
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Numéro de téléphone :</strong>{" "}
              {placeDetails.internationalPhoneNumber || "Non disponible"}
            </p>

            <div>
              <strong className="text-gray-900 dark:text-white">Horaires d&apos;ouverture :</strong>{" "}
              <div className="mt-2">
                {renderOpeningHours(placeDetails.currentOpeningHours)}
              </div>
            </div>
          </div>
        </div>

        {/* Section des avis */}
        <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Avis</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Aucun avis pour cet endroit.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review, index) => (
                <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 flex items-start gap-4">
                  {review.user.image && (
                    <Image
                      src={review.user.image}
                      alt={`${review.user.firstname} ${review.user.lastname}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      width={48}
                      height={48}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {review.user.firstname} {review.user.lastname}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Note :</strong>{" "}
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        {review.rating} / 5
                      </span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>

                    {currentUser?.id === review.userId && (
                      <Button
                        onClick={() => handleEditReview(review)}
                        className="flex items-center mt-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        size="sm"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulaire d'ajout d'avis */}
        <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingReviewId ? "Modifier votre avis" : "Ajouter un avis"}
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block font-semibold mb-2 text-gray-900 dark:text-white">
                Note (1 à 5) :
              </label>
              <input
                type="number"
                id="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min="1"
                max="5"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="comment" className="block font-semibold mb-2 text-gray-900 dark:text-white">
                Commentaire :
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                rows={4}
                placeholder="Partagez votre expérience..."
                required
              ></textarea>
            </div>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-6 py-2"
            >
              {editingReviewId ? "Modifier l'avis" : "Envoyer l'avis"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}