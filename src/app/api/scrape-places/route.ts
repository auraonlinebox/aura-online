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
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      if (!nextPageToken) {
        url.searchParams.set('query', query);
        url.searchParams.set('language', 'es');
        url.searchParams.set('region', 'es');
      } else {
        url.searchParams.set('pagetoken', nextPageToken);
      }
      url.searchParams.set('key', apiKey);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.error_message) {
        return NextResponse.json({ error: data.error_message, status: data.status }, { status: 400 });
      }

      for (const place of data.results || []) {
        const rating = place.rating || 0;
        const reviews = place.user_ratings_total || 0;
        if (rating >= minRating && reviews >= minReviews) {
          places.push({
            name: place.name,
            address: place.formatted_address,
            rating,
            reviews,
            place_id: place.place_id,
            types: (place.types || []).filter((t: string) => !t.startsWith('_')).slice(0, 3).join(', '),
          });
        }
      }

      nextPageToken = data.next_page_token || null;
      if (nextPageToken) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } while (nextPageToken && places.length < maxResults);

    return NextResponse.json({ results: places.slice(0, maxResults), total: places.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
