export async function POST(req: Request) {
  try {
    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return Response.json({ error: 'Falta endpoint' }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Suscripción inválida' }, { status: 400 });
  }
}
