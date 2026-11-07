import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { ChallengeActions } from '@/components/challenge-actions';

type Challenge = { id: string; status: string; challengerId: string; opponentId: string; myQuizId: string | null; startsAt: string | null; endsAt: string | null; questionCount: number; challengerScore?: number; opponentScore?: number; winnerId?: string | null };
export default async function ChallengeDetail({ params }: { params: Promise<{ challengeId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { challengeId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(challengeId)) notFound();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let challenge: Challenge;
  try {
    const response = await fetch(`${apiBaseUrl()}/challenges/${challengeId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (response.status === 403 || response.status === 404) notFound();
    if (!response.ok) throw new Error('Challenge unavailable');
    challenge = await response.json() as Challenge;
  } catch { return <main className="mx-auto max-w-3xl p-8">Unable to load this challenge. Please try again.</main>; }
  const started = Boolean(challenge.startsAt);
  const expired = challenge.status === 'COMPLETED';
  return <main className="mx-auto max-w-3xl px-6 py-12">
    <Link href="/challenges" className="text-sm font-semibold text-indigo-700">← All challenges</Link>
    <div className="mt-10 rounded-3xl border bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">1v1 challenge</p>
      <h1 className="mt-3 text-3xl font-bold">{challenge.status === 'COMPLETED' ? 'Challenge completed' : challenge.status === 'PENDING' ? 'Waiting for acceptance' : 'Challenge lobby'}</h1>
      <p className="mt-3 text-neutral-600">{challenge.questionCount} questions · Status: {challenge.status}</p>
      {challenge.status === 'COMPLETED' && <p className="mt-5 text-lg font-semibold">{challenge.winnerId === null ? 'Draw' : challenge.winnerId === user.id ? 'You won!' : 'Your opponent won.'} {challenge.challengerScore != null && challenge.opponentScore != null ? `(${challenge.challengerScore}–${challenge.opponentScore})` : ''}</p>}
      {challenge.status === 'ACTIVE' && started && !expired && challenge.myQuizId && <Link className="mt-6 inline-block rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white" href={`/quizzes/${challenge.myQuizId}`}>Enter challenge quiz</Link>}
      {challenge.status === 'ACTIVE' && !started && <p className="mt-5 text-sm text-neutral-600">Both players must select “I'm ready” before the shared timer starts. Refresh this page to check for the start.</p>}
      {challenge.status === 'ACTIVE' && expired && <p className="mt-5 text-sm text-neutral-600">Time has expired. Refresh to see the settled result.</p>}
      <ChallengeActions id={challenge.id} status={challenge.status} isOpponent={challenge.opponentId === user.id} isParticipant={true}/>
    </div>
  </main>;
}
