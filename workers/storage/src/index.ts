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
  readAt?: number;
}

export default {
  async fetch(req: Request, env: { aura_prospects: KVNamespace }): Promise<Response> {
    const url = new URL(req.url);
    const cors = {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, ...cors });

    if (req.method === 'POST' && url.pathname === '/prospect') {
      const data: ProspectData = await req.json();
      const slug = crypto.randomUUID().slice(0, 8);
      await env.aura_prospects.put(slug, JSON.stringify({ ...data, readAt: 0 }));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if ((req.method === 'PUT' || req.method === 'POST') && url.pathname.match(/^\/prospect\/[^\/]+\/read$/)) {
      const slug = url.pathname.split('/')[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data: ProspectData = JSON.parse(raw);
      data.readAt = data.readAt || Date.now();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ read: true, readAt: data.readAt }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if ((req.method === 'PUT' || req.method === 'POST') && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.split('/')[2];
      const data = await req.json();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.split('/')[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data: ProspectData = JSON.parse(raw);
      return new Response(JSON.stringify(data), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  },
};
