import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
export default async function Subjects() { if (!await getCurrentUser()) redirect('/login'); return <main className="mx-auto max-w-4xl px-6 py-12"><Link href="/dashboard" className="text-sm text-indigo-700">← Dashboard</Link><h1 className="mt-8 text-4xl font-bold">Practice quizzes</h1><p className="mt-4 text-neutral-600">Subject and topic browsing is the next feature to connect.</p></main>; }
