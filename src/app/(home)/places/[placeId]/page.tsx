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
    if (!openingHours) return "Horaires d'ouverture non disponibles.";

    return (
      <div className="text-base space-y-2">
        <p className="font-semibold">
          <strong>Ouvert maintenant :</strong>{" "}
          {openingHours.openNow ? "Oui" : "Non"}
        </p>
        <ul className="list-disc ml-6 space-y-1">
          {openingHours.periods.map((period: any, index: number) => (
            <li key={index}>
              <strong>Jour {period.open.day} :</strong>{" "}
              {formatTime(period.open.hour, period.open.minute)} -{" "}
              {formatTime(period.close.hour, period.close.minute)}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          <strong>Description des jours de la semaine :</strong>{" "}
          {openingHours.weekdayDescriptions.join(", ")}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center text-xl font-semibold">
        Chargement des détails...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  }

  if (!placeDetails) {
    return (
      <div className="text-center text-xl">
        Aucun détail trouvé pour cet endroit.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-12 space-y-6">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {placeDetails.displayName.text}
        </h2>
        <div className="rounded-lg overflow-hidden mb-6">
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
        <div className="space-y-4 text-lg">
          <p>
            <strong>Adresse :</strong> {placeDetails.formattedAddress}
          </p>
          <p>
            <strong>Évaluation :</strong>{" "}
            {placeDetails.rating || "Non disponible"} / 5
          </p>
          <p>
            <strong>Numéro de téléphone :</strong>{" "}
            {placeDetails.internationalPhoneNumber || "Non disponible"}
          </p>

          <div>
            <strong>Horaires d&apos;ouverture :</strong>{" "}
            {renderOpeningHours(placeDetails.currentOpeningHours)}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Avis</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Aucun avis pour cet endroit.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review, index) => (
              <li key={index} className="border-b pb-4 flex items-start gap-4">
                {review.user.image && (
                  <Image
                    src={review.user.image}
                    alt={`${review.user.firstname} ${review.user.lastname}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold">
                    {review.user.firstname} {review.user.lastname}
                  </p>
                  <p>
                    <strong>Note :</strong> {review.rating} / 5
                  </p>
                  <p>{review.comment}</p>

                  {currentUser?.id === review.userId && (
                    <Button
                      onClick={() => handleEditReview(review)}
                      className="flex items-center"
                    >
                      <Edit className="mr-2" /> Modifier
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold mb-4">
          {editingReviewId ? "Modifier votre avis" : "Ajouter un avis"}
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label htmlFor="rating" className="block font-semibold mb-2">
              Note (1 à 5) :
            </label>
            <input
              type="number"
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min="1"
              max="5"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="comment" className="block font-semibold mb-2">
              Commentaire :
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              required
            ></textarea>
          </div>
          <Button type="submit">Envoyer</Button>
        </form>
      </div>
    </div>
  );
}
