"use client";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState } from "react";
import { PlaceResult } from "@/services/ServiceInterface";

type GoogleMap = any;
type GoogleMaps = any;

const EGYPT_CENTER = {
  lat: 26.8206,
  lng: 30.8025
};

interface GoogleMapProps {
  places: PlaceResult[];
  onMarkerClick?: (place: PlaceResult) => void;
  className?: string;
}

interface MapComponentProps extends GoogleMapProps {
  map: GoogleMap;
  maps: GoogleMaps;
}

function MapComponent({ map, maps, places, onMarkerClick }: MapComponentProps) {
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      if (place.location) {
        const marker = new maps.Marker({
          position: {
            lat: place.location.latitude,
            lng: place.location.longitude
          },
          map,
          title: place.displayName?.text || "Lieu"});

        const infoWindow = new maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-bold text-lg mb-2">${place.displayName?.text || "Lieu"}</h3>
              <p class="text-sm text-gray-600 mb-2">${place.formattedAddress || "Adresse non disponible"}</p>
              ${place.rating ? `<p class="text-sm"><strong>Note:</strong> ${place.rating}/5</p>` : ""}
              <button 
                onclick="window.viewPlaceDetails('${place.id}')"
                class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Voir les détails
              </button>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
          if (onMarkerClick) {
            onMarkerClick(place);
          }
        });

        markersRef.current.push(marker);
      }
    });

    if (places.length > 0 && markersRef.current.length > 0) {
      const bounds = new maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);
      
      const listener = maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        maps.event.removeListener(listener);
      });
    }
  }, [places, map, maps, onMarkerClick]);

  return null;
}

function useMap(ref: React.RefObject<HTMLDivElement>) {
  const [map, setMap] = useState<GoogleMap>();

  useEffect(() => {
    if (ref.current && !map && (window as any).google) {
      const google = (window as any).google;
      const newMap = new google.maps.Map(ref.current, {
        center: EGYPT_CENTER,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      setMap(newMap);
    }
  }, [ref, map]);

  return map;
}

function Map({ places, onMarkerClick, className }: GoogleMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useMap(ref);

  return (
    <div className={className}>
      <div ref={ref} className="w-full h-full rounded-lg shadow-lg" />
      {map && (window as any).google && (
        <MapComponent 
          map={map} 
          maps={(window as any).google.maps} 
          places={places} 
          onMarkerClick={onMarkerClick} 
        />
      )}
    </div>
  );
}

if (typeof window !== "undefined") {
  (window as any).viewPlaceDetails = (placeId: string) => {
    window.open(`/places/${placeId}`, '_blank');
  };
}

function GoogleMapRender(props: GoogleMapProps) {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className={`${props.className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className={`${props.className} flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800`}>
            <div className="text-center p-4">
              <p className="text-red-600 dark:text-red-400 mb-2">Erreur lors du chargement de la carte</p>
              <p className="text-sm text-red-500 dark:text-red-400">Vérifiez votre clé API Google Maps</p>
            </div>
          </div>
        );
      default:
        return <Map {...props} />;
    }
  };

  return (
    <Wrapper 
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} 
      render={render}
      libraries={["marker"]}
    />
  );
}

export default GoogleMapRender;