import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from '@/lib/auth';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in.' }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }); }
  try {
    const upstream = await fetch(`${apiBaseUrl()}/competitions`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), cache: 'no-store' });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch { return NextResponse.json({ message: 'Competition service unavailable.' }, { status: 502 }); }
}
