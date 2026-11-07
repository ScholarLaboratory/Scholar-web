import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { QuizPlayer } from '@/components/quiz-player';

export default async function QuizPage({ params }: { params: Promise<{ sessionId: string }> }) {
  if (!await getCurrentUser()) redirect('/login');
  const { sessionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) notFound();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect('/login');
  let response: Response;
  try { response = await fetch(`${apiBaseUrl()}/quizzes/${sessionId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }); }
  catch { return <main className="mx-auto max-w-3xl p-8"><p>Quiz service unavailable. Please try again.</p></main>; }
  if (response.status === 404 || response.status === 403) notFound();
  if (!response.ok) return <main className="mx-auto max-w-3xl p-8"><p>Unable to load this quiz. It may have expired.</p></main>;
  const session = await response.json();
  return <main className="mx-auto max-w-3xl px-6 py-12"><Link href="/subjects" className="text-sm font-semibold text-indigo-700">← Learning library</Link><h1 className="mb-8 mt-8 text-3xl font-bold">Your quiz</h1><QuizPlayer initial={session}/></main>;
}
