import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from '@/lib/auth';
export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string; action: string }> }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  const { sessionId, action } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId) || !['answers', 'complete'].includes(action)) return NextResponse.json({ message: 'Invalid quiz action.' }, { status: 400 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in.' }, { status: 401 });
  let payload: unknown = undefined;
  if (action === 'answers') { try { payload = await request.json(); } catch { return NextResponse.json({ message: 'Invalid answer.' }, { status: 400 }); } }
  try {
    const upstream = await fetch(`${apiBaseUrl()}/quizzes/${sessionId}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: action === 'answers' ? JSON.stringify(payload) : undefined, cache: 'no-store' });
    const result = await upstream.json();
    return NextResponse.json(result, { status: upstream.status });
  } catch { return NextResponse.json({ message: 'Quiz service unavailable.' }, { status: 502 }); }
}
