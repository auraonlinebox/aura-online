import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminPrefixes = ['/tracking', '/prospect/new', '/scrape', '/instagram-posts', '/social-card'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProspectPage = pathname.startsWith('/prospect/') && pathname !== '/prospect/new';

  if (isProspectPage) {
    const auth = request.cookies.get('admin_auth')?.value;
    const valid = process.env.ADMIN_PASSWORD;
    if (valid && auth === valid) return NextResponse.next();

    const slug = pathname.replace('/prospect/', '').split('/')[0].split('?')[0];
    if (slug && /^[a-z0-9-]+$/i.test(slug)) {
      const storageUrl = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';
      fetch(`${storageUrl}/prospect/${slug}/read`, { method: 'POST' }).catch(() => {});
    }

    return NextResponse.next();
  }

  const isAdmin = adminPrefixes.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isAdmin) return NextResponse.next();

  const auth = request.cookies.get('admin_auth')?.value;
  const valid = process.env.ADMIN_PASSWORD;
  if (valid && auth === valid) return NextResponse.next();

  const login = new URL('/admin', request.url);
  login.searchParams.set('redirect', pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/tracking/:path*', '/tracking', '/prospect/new', '/scrape', '/scrape/:path*', '/instagram-posts', '/social-card', '/prospect/:path*'] };
