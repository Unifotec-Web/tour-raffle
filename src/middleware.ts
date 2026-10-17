import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const admin = path.startsWith('/admin');
  if (path === '/admin/login') return NextResponse.next();
  const endpoint = admin ? '/api/v1/admin/me' : '/api/v1/users/me';
  try {
    const response = await fetch(`${process.env.API_INTERNAL_URL ?? 'http://localhost:8000'}${endpoint}`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });
    if (response.ok) return NextResponse.next();
  } catch {
    // A missing backend fails closed for private pages.
  }
  const signIn = request.nextUrl.clone();
  signIn.pathname = '/sign-in';
  signIn.search = '';
  return NextResponse.redirect(signIn);
}

export const config = { matcher: ['/dashboard/:path*', '/account/:path*', '/admin/:path*'] };
