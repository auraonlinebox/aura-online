var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
async function sendReadNotification(slug, data, env) {
  try {
    if (!env.RESEND_API_KEY) return;
    const readDate = new Date(data.readAt).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });
    const url = `https://aura-online.es/prospect/${slug}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1f2937;">\u2705 Prospecto le\xEDdo</h2>
        <p style="color:#6b7280;font-size:15px;"><strong>${data.businessName}</strong> ha abierto el enlace de AURA.</p>
        <p style="color:#6b7280;font-size:14px;">\u{1F4C5} ${readDate}</p>
        <p style="color:#6b7280;font-size:14px;">\u{1F517} <a href="${url}" style="color:#f97316;">${url}?status=1</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:13px;">AURA - Reputaci\xF3n Digital</p>
      </div>`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Ana de AURA <hello@aura-online.es>",
        to: ["auraonlinebox@gmail.com"],
        subject: `\u{1F440} ${data.businessName} ha visto su prospecto de AURA`,
        html
      })
    });
  } catch (e) {
    console.error("sendReadNotification error", e);
  }
}
__name(sendReadNotification, "sendReadNotification");
var index_default = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const cors = {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }
    };
    if (req.method === "OPTIONS") return new Response(null, { status: 204, ...cors });
    if (req.method === "POST" && url.pathname === "/prospect") {
      const data = await req.json();
      const slug = crypto.randomUUID().slice(0, 8);
      await env.aura_prospects.put(slug, JSON.stringify({ ...data, readAt: 0 }));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    if ((req.method === "PUT" || req.method === "POST") && url.pathname.match(/^\/prospect\/[^\/]+\/read$/)) {
      const slug = url.pathname.split("/")[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
      const data = JSON.parse(raw);
      const wasRead = data.readAt && data.readAt > 0;
      data.readAt = data.readAt || Date.now();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      if (!wasRead) ctx.waitUntil(sendReadNotification(slug, data, env));
      return new Response(JSON.stringify({ read: true, readAt: data.readAt }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    if ((req.method === "PUT" || req.method === "POST") && url.pathname.startsWith("/prospect/")) {
      const slug = url.pathname.split("/")[2];
      const data = await req.json();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    if (req.method === "GET" && url.pathname.startsWith("/prospect/")) {
      const slug = url.pathname.split("/")[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
      const data = JSON.parse(raw);
      return new Response(JSON.stringify(data), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    if (req.method === "POST" && url.pathname === "/email-event") {
      const event = await req.json();
      const eventId = event?.data?.email_id || crypto.randomUUID().slice(0, 8);
      const key = `email-event-${eventId}`;
      const existing = await env.aura_prospects.get(key).catch(() => null);
      const events = existing ? JSON.parse(existing) : [];
      events.push({ ...event, receivedAt: Date.now() });
      await env.aura_prospects.put(key, JSON.stringify(events));
      return new Response(JSON.stringify({ ok: true }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    if (req.method === "GET" && url.pathname === "/email-events") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const keys = await env.aura_prospects.list({ prefix: "email-event-" });
      const all = [];
      for (const key of keys.keys.slice(-20)) {
        const raw = await env.aura_prospects.get(key.name);
        if (raw) all.push(...JSON.parse(raw));
      }
      all.sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0));
      return new Response(JSON.stringify({ events: all.slice(0, limit) }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ status: "ok" }), { status: 200, ...cors, headers: { ...cors.headers, "Content-Type": "application/json" } });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
