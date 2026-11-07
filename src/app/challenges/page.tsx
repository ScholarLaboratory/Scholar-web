import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { ChallengeActions } from '@/components/challenge-actions';

type Challenge = { id: string; challengerId: string; opponentId: string; status: string; questionCount: number; durationSeconds: number; createdAt: string };
export default async function ChallengesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let challenges: Challenge[] = [];
  let error: string | null = null;
  try {
    const response = await fetch(`${apiBaseUrl()}/challenges/mine`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) error = 'Unable to load your challenges.';
    else challenges = await response.json() as Challenge[];
  } catch { error = 'Challenge service unavailable.'; }
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">← Dashboard</Link>
    <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-indigo-700">Compete together</p>
    <h1 className="mt-3 text-4xl font-bold">Your 1v1 challenges</h1>
    <p className="mt-3 text-neutral-600">Accept invitations, get ready and play against classmates.</p><Link href="/challenges/new" className="mt-6 inline-block rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">Create a challenge</Link>
    {error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p> :
      challenges.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2">{challenges.map(challenge =>
        <article key={challenge.id} className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{challenge.challengerId === user.id ? 'Challenge sent' : 'Challenge received'}</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{challenge.status}</span></div>
          <p className="mt-3 text-sm text-neutral-600">{challenge.questionCount} questions · {Math.round(challenge.durationSeconds / 60)} minute timer</p>
          <ChallengeActions id={challenge.id} status={challenge.status} isOpponent={challenge.opponentId === user.id} isParticipant={challenge.challengerId === user.id || challenge.opponentId === user.id}/>
        </article>)}</div> :
      <div className="mt-10 rounded-2xl border bg-white p-8"><h2 className="font-bold">No challenges yet</h2><p className="mt-2 text-neutral-600">Invitations you send or receive will appear here.</p></div>}
  </main>;
}
