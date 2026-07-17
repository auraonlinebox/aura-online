const ORIGIN = 'https://aura-online-y1k8.onrender.com';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const originUrl = ORIGIN + url.pathname + url.search;

    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', new URL(ORIGIN).host);
    reqHeaders.set('X-Forwarded-Host', url.host);
    reqHeaders.set('X-Forwarded-Proto', 'https');

    const response = await fetch(originUrl, {
      method: request.method,
      headers: reqHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.set('Cache-Control', 'no-store, must-revalidate');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  },
};
