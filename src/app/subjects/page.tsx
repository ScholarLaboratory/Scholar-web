import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getSubjects } from '@/lib/learning';

export default async function SubjectsPage() {
  if (!await getCurrentUser()) redirect('/login');
  const { data: subjects, error } = await getSubjects();
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">← Back to dashboard</Link>
    <div className="mt-10"><p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">Learning library</p><h1 className="mt-3 text-4xl font-bold">Choose a subject</h1><p className="mt-3 text-neutral-600">Explore topics and prepare for your next quiz.</p></div>
    {error ? <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> :
      subjects?.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2">{subjects.map(subject =>
        <Link key={subject.id} href={`/subjects/${subject.id}`} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md">
          <BookOpen className="mb-5 text-indigo-700" size={30} /><h2 className="flex items-center justify-between text-xl font-bold">{subject.name}<ArrowRight className="text-neutral-400 group-hover:text-indigo-700" size={20}/></h2><p className="mt-2 text-sm text-neutral-500">{subject.topics?.length ?? 0} topics</p>
        </Link>)}</div> :
        <p className="mt-10 rounded-xl border border-neutral-200 bg-white p-8 text-neutral-600">No subjects have been published yet. Check back soon.</p>}
  </main>;
}
