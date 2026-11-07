import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSubjects } from '@/lib/learning';
import { CreateChallengeForm } from '@/components/create-challenge-form';

export default async function NewChallengePage() {
  if (!await getCurrentUser()) redirect('/login');
  const { data, error } = await getSubjects();
  return <main className="mx-auto max-w-3xl px-6 py-12">
    <Link href="/challenges" className="text-sm font-semibold text-indigo-700">← Your challenges</Link>
    <h1 className="mt-10 text-4xl font-bold">Challenge a classmate</h1>
    <p className="mt-3 text-neutral-600">Choose a topic and set your own question count and timer. Both students receive the same question set.</p>
    {error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : <CreateChallengeForm subjects={data ?? []}/>}
  </main>;
}
