import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 0,
  });
  return response;
}
