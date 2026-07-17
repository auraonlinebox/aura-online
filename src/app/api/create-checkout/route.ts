import Stripe from 'stripe';

const prices: Record<string, string> = {
  basico: 'price_basico',
  pro: 'price_pro',
  premium: 'price_premium',
};

export async function POST(req: Request) {
  try {
    const { plan, businessName, email } = await req.json();
    const priceId = prices[plan];
    if (!priceId) {
      return Response.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey === 'sk_test_...') {
      return Response.json({
        error: 'Pago no disponible aún. Te contactaremos para activar tu plan.',
        needSetup: true,
      });
    }

    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${req.headers.get('origin') || 'https://aura-online-y1k8.onrender.com'}/demo/corto-y-cambio?success=1`,
      cancel_url: `${req.headers.get('origin') || 'https://aura-online-y1k8.onrender.com'}/demo/corto-y-cambio?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}
