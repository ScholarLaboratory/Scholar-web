import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { BookOpen, Swords, Trophy, Sparkles, ArrowUpRight } from 'lucide-react';
import { apiBaseUrl, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';

type QuizResult = { id: string; score: number; total: number; xpEarned: number; completedAt: string | null };

async function loadResults(): Promise<QuizResult[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return [];
  try {
    const response = await fetch(`${apiBaseUrl()}/quizzes/results/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? data as QuizResult[] : [];
  } catch { return []; }
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const results = await loadResults();
  const totalXp = results.reduce((sum, result) => sum + result.xpEarned, 0);
  const correctAnswers = results.reduce((sum, result) => sum + result.score, 0);
  return <main className="min-h-screen bg-neutral-50">
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-black tracking-tight text-indigo-700">scholar<span className="text-indigo-400">.</span></Link>
        <div className="flex items-center gap-5">
          <span className="hidden text-sm text-neutral-600 sm:block">@{user.username}</span>
          <form action="/api/auth/logout" method="post"><button className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Sign out</button></form>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-700 to-violet-700 p-8 text-white sm:p-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm"><Sparkles size={15} /> Your learning space</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {user.fullName || user.username}!</h1>
        <p className="mt-3 max-w-xl text-indigo-100">Every question is a chance to grow. Practice what you know, challenge a friend, and climb the leaderboard.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[{ label: 'Total XP', value: totalXp.toLocaleString(), suffix: 'XP' }, { label: 'Quizzes completed', value: results.length.toString(), suffix: 'quizzes' }, { label: 'Correct answers', value: correctAnswers.toString(), suffix: 'answers' }].map((stat) =>
          <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-6"><p className="text-sm text-neutral-500">{stat.label}</p><p className="mt-3 text-3xl font-bold">{stat.value} <span className="text-sm font-normal text-neutral-400">{stat.suffix}</span></p></div>)}
      </section>
      <section>
        <h2 className="mb-5 text-2xl font-bold">Explore Scholar</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[{ icon: BookOpen, title: 'Practice quizzes', description: 'Study topics and test your knowledge.', href: '/subjects' }, { icon: Swords, title: '1v1 challenges', description: 'Compete head-to-head with classmates.', href: '/challenges' }, { icon: Trophy, title: 'Competitions', description: 'Join events and climb the rankings.', href: '/competitions' }].map((item) =>
            <Link href={item.href} key={item.title} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md"><item.icon className="mb-6 text-indigo-700" size={28}/><h3 className="flex items-center justify-between text-lg font-bold">{item.title}<ArrowUpRight className="text-neutral-400 group-hover:text-indigo-700" size={20}/></h3><p className="mt-2 text-sm text-neutral-500">{item.description}</p></Link>)}
        </div>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-xl font-bold">Recent quiz results</h2>
        {results.length === 0 ? <p className="mt-4 text-sm text-neutral-500">No completed quizzes yet. Your results will appear here after your first quiz.</p> :
          <ul className="mt-4 divide-y divide-neutral-100">{results.slice(0, 5).map((result) =>
            <li key={result.id} className="flex items-center justify-between py-4 text-sm"><span>Quiz · {result.score}/{result.total} correct</span><span className="font-semibold text-indigo-700">+{result.xpEarned} XP</span></li>)}</ul>}
      </section>
    </div>
  </main>;
}
