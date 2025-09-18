import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, types, language, componentRestrictions } = body;

    console.log('Autocomplete request:', { input, types, language, componentRestrictions });

    if (!input || input.length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    // Construction de l'URL avec paramètres pour l'API Places Autocomplete
    const params = new URLSearchParams({
      input: input,
      types: (types || ['establishment']).join('|'),
      language: language || 'fr',
      key: process.env.GOOGLE_PLACES_API_KEY!,
      components: `country:${componentRestrictions?.country || 'eg'}`
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      console.error('Request URL:', `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API status error:', data.status, data.error_message);
      return NextResponse.json(
        { error: `API Error: ${data.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur dans l\'API autocomplete:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}