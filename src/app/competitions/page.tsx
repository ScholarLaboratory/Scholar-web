import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
export default async function Competitions() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const organizer = user.role === 'FACILITATOR' || user.role === 'ADMIN';
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">← Dashboard</Link>
    <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-indigo-700">Hosted events</p>
    <h1 className="mt-3 text-4xl font-bold">Competitions</h1>
    <p className="mt-3 text-neutral-600">Join a hosted quiz, compete with classmates and see the final rankings.</p>
    {organizer && <Link href="/competitions/new" className="mt-6 inline-block rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">Host a competition</Link>}
    <div className="mt-10 rounded-2xl border bg-white p-8">
      <h2 className="text-xl font-bold">Have a competition invitation?</h2>
      <p className="mt-2 text-neutral-600">Ask your facilitator for the competition link and open it to register. Public event discovery will be added next.</p>
      <p className="mt-4 text-sm text-neutral-500">Competition links follow the format /competitions/[competition-id].</p>
    </div>
  </main>;
}
