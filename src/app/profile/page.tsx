import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { CopyStudentId } from '@/components/copy-student-id';

type Profile = { id: string; fullName: string; username: string; email: string; bio?: string | null; school?: string | null; level?: string | null };
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let profile: Profile | null = null;
  let error: string | null = null;
  try {
    const response = await fetch(`${apiBaseUrl()}/users/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) error = 'Unable to load your full profile.';
    else {
      const body = await response.json() as { data?: Profile };
      profile = body.data ?? null;
    }
  } catch { error = 'Profile service unavailable.'; }
  const p = profile ?? user;
  return <main className="mx-auto max-w-3xl px-6 py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">← Dashboard</Link>
    <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">{p.fullName.charAt(0).toUpperCase()}</div>
      <h1 className="mt-5 text-3xl font-bold">{p.fullName}</h1>
      <p className="mt-1 text-neutral-500">@{p.username}</p>
      <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
        <div><dt className="text-neutral-500">Email</dt><dd className="mt-1 font-semibold">{p.email}</dd></div>
        {'school' in p && p.school && <div><dt className="text-neutral-500">School</dt><dd className="mt-1 font-semibold">{p.school}</dd></div>}
        {'level' in p && p.level && <div><dt className="text-neutral-500">Level</dt><dd className="mt-1 font-semibold">{p.level}</dd></div>}
        {'bio' in p && p.bio && <div className="sm:col-span-2"><dt className="text-neutral-500">About</dt><dd className="mt-1">{p.bio}</dd></div>}
      </dl>
      <div className="mt-8 rounded-xl bg-neutral-50 p-5"><h2 className="font-bold">Your challenge invitation ID</h2><p className="mt-2 text-sm text-neutral-600">Share this ID only with someone you want to challenge. They can paste it into the challenge invitation form.</p><CopyStudentId id={p.id}/></div>
      {error && <p role="status" className="mt-4 text-sm text-amber-700">{error} Showing your basic account information.</p>}
    </div>
  </main>;
}
