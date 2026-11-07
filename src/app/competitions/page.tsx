import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
type Event = { id: string; title: string; status: string; questionCount: number; durationSeconds: number; scheduledAt: string | null; facilitator: { fullName: string; username: string }; topic: { name: string; subject: { name: string } }; _count: { participants: number } };
export default async function Competitions() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const organizer = user.role === 'FACILITATOR' || user.role === 'ADMIN';
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let events: Event[] = [];
  let error: string | null = null;
  try {
    const response = await fetch(`${apiBaseUrl()}/competitions`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) error = 'Unable to load competitions.';
    else events = await response.json() as Event[];
  } catch { error = 'Competition service unavailable.'; }
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">← Dashboard</Link>
    <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-indigo-700">Hosted events</p>
    <h1 className="mt-3 text-4xl font-bold">Competitions</h1>
    <p className="mt-3 text-neutral-600">Discover hosted quizzes, join an open event and see the final rankings.</p>
    {organizer && <Link href="/competitions/new" className="mt-6 inline-block rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">Host a competition</Link>}
    {error ? <p role="alert" className="mt-10 rounded-xl bg-red-50 p-4 text-red-700">{error}</p> :
      events.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2">{events.map(event =>
        <Link key={event.id} href={`/competitions/${event.id}`} className="rounded-2xl border bg-white p-6 transition hover:border-indigo-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">{event.topic.subject.name} · {event.topic.name}</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{event.status}</span></div>
          <h2 className="mt-4 text-xl font-bold">{event.title}</h2>
          <p className="mt-2 text-sm text-neutral-500">Hosted by {event.facilitator.fullName}</p>
          <p className="mt-4 text-sm text-neutral-600">{event.questionCount} questions · {Math.round(event.durationSeconds / 60)} min · {event._count.participants} registered</p>
          {event.scheduledAt && <p className="mt-2 text-xs text-neutral-500">Scheduled: {new Date(event.scheduledAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</p>}
        </Link>)}</div> :
        <div className="mt-10 rounded-2xl border bg-white p-8"><h2 className="text-xl font-bold">No competitions available yet</h2><p className="mt-2 text-neutral-600">When facilitators open registration, their events will appear here.</p></div>}
  </main>;
}
