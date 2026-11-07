import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSubjects } from '@/lib/learning';
import { CreateCompetitionForm } from '@/components/create-competition-form';
export default async function NewCompetition() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'FACILITATOR' && user.role !== 'ADMIN') redirect('/competitions');
  const { data, error } = await getSubjects();
  return <main className="mx-auto max-w-3xl px-6 py-12"><Link href="/competitions" className="text-sm font-semibold text-indigo-700">← Competitions</Link><h1 className="mt-10 text-4xl font-bold">Host a competition</h1><p className="mt-3 text-neutral-600">Create a draft, open registration, close entries and start a synchronized quiz for all registered students.</p>{error ? <p role="alert" className="mt-8 text-red-700">{error}</p> : <CreateCompetitionForm subjects={data ?? []}/>}</main>;
}
