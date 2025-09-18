import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID requis' }, { status: 400 });
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Clé API Google Places manquante' }, { status: 500 });
    }

    // Récupérer les détails de l'établissement depuis Google Places API
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,formatted_phone_number,international_phone_number,website,formatted_address,geometry,types',
      key: process.env.GOOGLE_PLACES_API_KEY
    });

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      console.error('Erreur API Google Places Details:', data);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des détails' },
        { status: 400 }
      );
    }

    const place = data.result;

    return NextResponse.json({
      placeId: placeId,
      name: place.name,
      phone: place.formatted_phone_number || place.international_phone_number || null,
      website: place.website || null,
      address: place.formatted_address || null,
      location: place.geometry?.location || null,
      types: place.types || []
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}