import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');
    const minRating = parseFloat(req.nextUrl.searchParams.get('min_rating') || '0');
    const minReviews = parseInt(req.nextUrl.searchParams.get('min_reviews') || '0');
    const maxResults = parseInt(req.nextUrl.searchParams.get('max') || '60');

    if (!query) {
      return NextResponse.json({ error: 'Falta parámetro q (búsqueda)' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY no configurada' }, { status: 500 });
    }

    const places: any[] = [];
    let nextPageToken: string | null = null;

    do {
      const body: any = {
        textQuery: query,
        languageCode: 'es',
        regionCode: 'es',
      };
      if (nextPageToken) {
        body.pageToken = nextPageToken;
      }

      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.id,nextPageToken',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        return NextResponse.json({ error: data.error.message || JSON.stringify(data.error), status: data.error.code }, { status: 400 });
      }

      for (const place of data.places || []) {
        const rating = place.rating || 0;
        const reviews = place.userRatingCount || 0;
        if (rating >= minRating && reviews >= minReviews) {
          places.push({
            name: place.displayName?.text || '',
            address: place.formattedAddress || '',
            rating,
            reviews,
            place_id: place.id,
            types: (place.types || []).filter((t: string) => !t.startsWith('_')).slice(0, 3).join(', '),
          });
        }
      }

      nextPageToken = data.nextPageToken || null;
      if (nextPageToken) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } while (nextPageToken && places.length < maxResults);

    return NextResponse.json({ results: places.slice(0, maxResults), total: places.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
