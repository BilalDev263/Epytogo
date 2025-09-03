"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Visit {
  id: string;
  placeId: string;
  placeName: string;
  visitedAt: string;
}

export function VisitHistory() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const fetchVisits = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/visits');
      const data = await response.json();
      setVisits(data.visits || []);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [session]);


  if (!session?.user || loading) {
    return null;
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🕐 Vos dernières visites
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Aucune visite récente. Cliquez sur un lieu pour commencer !
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🕐 Vos dernières visites ({visits.length})
        </h3>
      </div>
      <div className="space-y-2">
        {visits.map((visit) => (
          <div
            key={visit.id}
            onClick={() => router.push(`/places/${visit.placeId}`)}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {visit.placeName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(visit.visitedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}