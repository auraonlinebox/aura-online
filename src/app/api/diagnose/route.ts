import { NextResponse } from 'next/server';

export async function GET() {
  const resendKey = process.env.RESEND_API_KEY;
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  const result: any = {
    RESEND_API_KEY: resendKey ? `OK (${resendKey.slice(0, 6)}...${resendKey.slice(-4)})` : 'NOT SET',
    GOOGLE_AI_API_KEY: googleKey ? `OK (${googleKey.slice(0, 4)}...${googleKey.slice(-4)})` : 'NOT SET',
    resend_test: null,
  };

  if (resendKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ana de AURA <hello@aura-online.es>',
          to: ['auraonlinebox@gmail.com'],
          subject: 'Test diagnóstico AURA',
          html: '<p>test</p>',
          text: 'test',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      result.resend_test = { status: res.status, data };
    } catch (err: any) {
      result.resend_test = { error: err.message, name: err.name };
    }
  }

  return NextResponse.json(result);
}
