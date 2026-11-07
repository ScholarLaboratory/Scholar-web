import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ challengeId: string; action: string }> }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  const { challengeId, action } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(challengeId) || !['accept', 'decline', 'ready', 'finalize'].includes(action)) return NextResponse.json({ message: 'Invalid challenge action.' }, { status: 400 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in.' }, { status: 401 });
  try {
    const upstream = await fetch(`${apiBaseUrl()}/challenges/${challengeId}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch { return NextResponse.json({ message: 'Challenge service unavailable.' }, { status: 502 }); }
}
