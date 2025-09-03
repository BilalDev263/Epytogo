"use client";
import { useEffect, useState } from "react";

export default function Reviews({ placeId }: { placeId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/google/reviews?placeId=${placeId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));
  }, [placeId]);

  if (!reviews.length) return <p>Aucun avis Google à afficher.</p>;

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.author_name + r.time} className="rounded-lg p-4 shadow">
          <div className="font-semibold">{r.author_name}</div>
          <div className="text-sm text-gray-500">
            {new Date(r.time * 1000).toLocaleDateString()}
          </div>
          <div className="mt-2">{r.text}</div>
        </li>
      ))}
    </ul>
  );
}
