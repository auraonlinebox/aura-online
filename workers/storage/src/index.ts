interface Review {
  author: string;
  text: string;
  rating: number;
  response?: string;
}

interface ProspectData {
  businessName: string;
  reviews: Review[];
  createdAt: number;
}

export default {
  async fetch(req: Request, env: { aura_prospects: KVNamespace }): Promise<Response> {
    const url = new URL(req.url);
    const cors = {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, ...cors });

    if (req.method === 'POST' && url.pathname === '/prospect') {
      const data: ProspectData = await req.json();
      const slug = crypto.randomUUID().slice(0, 8);
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ slug: `https://aura-online.es/prospect/${slug}`, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.replace('/prospect/', '');
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data: ProspectData = JSON.parse(raw);
      return new Response(JSON.stringify(data), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  },
};
