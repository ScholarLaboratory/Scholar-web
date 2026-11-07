import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser, apiBaseUrl } from '@/lib/auth';

type Question = { id: string; questionText: string; difficulty: string; options: { id: string; optionText: string }[] };
export default async function TopicQuestionsPage({ params }: { params: Promise<{ topicId: string }> }) {
  if (!await getCurrentUser()) redirect('/login');
  const { topicId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(topicId)) notFound();
  let questions: Question[] = [];
  let error: string | null = null;
  try {
    const response = await fetch(`${apiBaseUrl()}/topics/${encodeURIComponent(topicId)}/questions`, { cache: 'no-store' });
    if (!response.ok) error = 'Questions are currently unavailable.';
    else questions = await response.json() as Question[];
  } catch { error = 'Cannot connect to the Scholar learning service.'; }
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <Link href="/subjects" className="text-sm font-semibold text-indigo-700">← Browse subjects</Link>
    <h1 className="mt-10 text-4xl font-bold">Practice questions</h1>
    <p className="mt-3 text-neutral-600">Preview published questions. Scored quizzes with answer submission are coming next.</p>
    {error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p> :
      questions.length ? <div className="mt-10 space-y-5">{questions.map((question, index) =>
        <article key={question.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Question {index + 1} · {question.difficulty}</p>
          <h2 className="mt-3 text-lg font-semibold">{question.questionText}</h2>
          <ul className="mt-5 grid gap-2">{question.options.map(option => <li key={option.id} className="rounded-xl border border-neutral-200 px-4 py-3 text-sm">{option.optionText}</li>)}</ul>
        </article>)}</div> :
      <p className="mt-10 rounded-xl border bg-white p-8 text-neutral-600">No published questions in this topic yet.</p>}
  </main>;
}
