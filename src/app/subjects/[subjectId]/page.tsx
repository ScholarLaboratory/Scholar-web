import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowRight, Layers } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getSubjects, getTopics } from '@/lib/learning';

export default async function SubjectTopicsPage({ params }: { params: Promise<{ subjectId: string }> }) {
  if (!await getCurrentUser()) redirect('/login');
  const { subjectId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(subjectId)) notFound();
  const [subjectResult, topicResult] = await Promise.all([getSubjects(), getTopics(subjectId)]);
  const subject = subjectResult.data?.find(item => item.id === subjectId);
  if (!subject && !subjectResult.error) notFound();
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/subjects" className="text-sm font-semibold text-indigo-700">← All subjects</Link>
    <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-indigo-700">Topics</p>
    <h1 className="mt-3 text-4xl font-bold">{subject?.name ?? 'Subject topics'}</h1>
    <p className="mt-3 text-neutral-600">Choose a topic to explore its objective questions.</p>
    {(subjectResult.error || topicResult.error) ? <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{topicResult.error ?? subjectResult.error}</p> :
      topicResult.data?.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2">{topicResult.data.map(topic =>
        <Link key={topic.id} href={`/topics/${topic.id}`} className="group rounded-2xl border border-neutral-200 bg-white p-6 hover:border-indigo-300 hover:shadow-md"><Layers size={26} className="mb-5 text-indigo-700"/><h2 className="flex items-center justify-between text-lg font-bold">{topic.name}<ArrowRight size={20} className="text-neutral-400 group-hover:text-indigo-700"/></h2></Link>)}</div> :
      <p className="mt-10 rounded-xl border border-neutral-200 bg-white p-8 text-neutral-600">No topics available for this subject yet.</p>}
  </main>;
}
