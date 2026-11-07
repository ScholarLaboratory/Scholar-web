import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { CompetitionActions } from '@/components/competition-actions';
import { CompetitionCountdown } from '@/components/competition-countdown';
import { CompetitionLiveRefresh } from '@/components/competition-live-refresh';

type Competition = { id: string; title: string; status: string; facilitatorId: string; questionCount: number; durationSeconds: number; scheduledAt: string | null; startsAt: string | null; endsAt: string | null; participants: { userId: string }[] };
type Ranking = { rank: number; user: { id: string; username: string; fullName: string }; score: number; total: number };
type Leaderboard = { status: string; rankings: Ranking[]; winnerIds?: string[] };
export default async function CompetitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const headers = { Authorization: `Bearer ${token}` };
  let competition: Competition;
  let leaderboard: Leaderboard | null = null;
  let quizId: string | null = null;
  try {
    const response = await fetch(`${apiBaseUrl()}/competitions/${id}`, { headers, cache: 'no-store' });
    if (response.status === 403 || response.status === 404) notFound();
    if (!response.ok) throw new Error('Unable to load competition.');
    competition = await response.json() as Competition;
    const [rankResponse, quizResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/competitions/${id}/leaderboard`, { headers, cache: 'no-store' }),
      fetch(`${apiBaseUrl()}/competitions/${id}/my-quiz`, { headers, cache: 'no-store' }),
    ]);
    if (rankResponse.ok) leaderboard = await rankResponse.json() as Leaderboard;
    if (quizResponse.ok) { const q = await quizResponse.json() as { quizSessionId: string | null }; quizId = q.quizSessionId; }
  } catch { return <main className="mx-auto max-w-3xl p-8"><p role="alert">Competition service unavailable. Please try again.</p></main>; }
  const organizer = competition.facilitatorId === user.id;
  const joined = competition.participants.some(p => p.userId === user.id);
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <CompetitionLiveRefresh active={leaderboard?.status !== 'COMPLETED'} />
    <Link href="/competitions" className="text-sm font-semibold text-indigo-700">← Competitions</Link>
    <div className="mt-10 rounded-3xl border bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">Hosted competition · {competition.status}</p>
      <h1 className="mt-3 text-3xl font-bold">{competition.title}</h1>
      <p className="mt-3 text-neutral-600">{competition.questionCount} questions · {Math.round(competition.durationSeconds / 60)} minute timer · {competition.participants.length} registered</p>
      {competition.scheduledAt && <p className="mt-2 text-sm text-neutral-500">Scheduled: {new Date(competition.scheduledAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</p>}
      {joined && <p className="mt-4 font-semibold text-indigo-700">You are registered.</p>}
      <CompetitionActions id={id} status={competition.status} organizer={organizer} joined={joined}/>
      {competition.endsAt && leaderboard?.status === 'IN_PROGRESS' && <CompetitionCountdown endsAt={competition.endsAt} />}
      {quizId && competition.startsAt && leaderboard?.status !== 'COMPLETED' && <Link href={`/quizzes/${quizId}`} className="mt-6 inline-block rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white">Enter competition quiz</Link>}
      {competition.status === 'CLOSED' && !competition.startsAt && <p className="mt-5 text-sm text-neutral-600">Registration is closed. Waiting for the facilitator to start.</p>}
    </div>
    <section className="mt-8 rounded-3xl border bg-white p-8">
      <h2 className="text-2xl font-bold">Leaderboard</h2>
      {leaderboard?.status === 'COMPLETED' && leaderboard.rankings.length ? <ol className="mt-6 divide-y">{leaderboard.rankings.map(entry => <li key={entry.user.id} className="flex items-center justify-between gap-4 py-4"><div><span className="font-bold">#{entry.rank} {entry.user.fullName}</span><p className="text-sm text-neutral-500">@{entry.user.username}</p></div><span className="font-semibold">{entry.score}/{entry.total}</span></li>)}</ol> : <p className="mt-4 text-neutral-600">Rankings will appear once all participants finish or the shared timer expires.</p>}
    </section>
  </main>;
}
