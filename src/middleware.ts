import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminPrefixes = ['/tracking', '/prospect/new', '/scrape', '/instagram-posts', '/social-card'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = adminPrefixes.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isAdmin) return NextResponse.next();

  const auth = request.cookies.get('admin_auth')?.value;
  const valid = process.env.ADMIN_PASSWORD;
  if (auth === valid) return NextResponse.next();

  const login = new URL('/admin', request.url);
  login.searchParams.set('redirect', pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/tracking/:path*', '/tracking', '/prospect/new', '/scrape', '/scrape/:path*', '/instagram-posts', '/social-card'] };
