import { NextResponse } from 'next/server';

export async function GET() {
  const resendKey = process.env.RESEND_API_KEY;
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const result: any = {
    RESEND_API_KEY: resendKey ? `OK (${resendKey.slice(0, 6)}...${resendKey.slice(-4)})` : 'NOT SET',
    GOOGLE_AI_API_KEY: googleKey ? `OK (${googleKey.slice(0, 4)}...${googleKey.slice(-4)})` : 'NOT SET',
    GMAIL_USER: gmailUser ? gmailUser : 'NOT SET',
    GMAIL_APP_PASSWORD: gmailPass ? `OK (${gmailPass.length} chars)` : 'NOT SET',
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

  if (gmailUser && gmailPass) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: gmailUser.trim(), pass: gmailPass.trim().replace(/ /g, '') },
        connectionTimeout: 10000,
        family: 4,
      });
      await transporter.verify();
      result.gmail_smtp = 'OK (connection verified)';
    } catch (err: any) {
      result.gmail_smtp = { error: err.message, code: err.code };
    }
  }

  return NextResponse.json(result);
}
