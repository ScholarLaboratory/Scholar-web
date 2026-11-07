import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from '@/lib/auth';
export async function GET(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in.' }, { status: 401 });
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (query.length < 2 || query.length > 60) return NextResponse.json({ message: 'Enter 2–60 characters.' }, { status: 400 });
  try {
    const upstream = await fetch(`${apiBaseUrl()}/users/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const result = await upstream.json();
    return NextResponse.json(result, { status: upstream.status });
  } catch { return NextResponse.json({ message: 'Student search unavailable.' }, { status: 502 }); }
}
