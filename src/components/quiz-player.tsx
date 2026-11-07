'use client';
import { useEffect, useState } from 'react';
import { CompetitionCountdown } from '@/components/competition-countdown';
import { useRouter } from 'next/navigation';
type Question = { id: string; questionText: string; position: number; difficulty: string; selectedOptionId: string | null; options: { id: string; optionText: string }[] };
type Session = { id: string; status: string; total: number; answered: number; questions: Question[]; score?: number; xpEarned?: number; endsAt?: string | null };
export function QuizPlayer({ initial }: { initial: Session }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [index, setIndex] = useState(Math.max(0, initial.questions.findIndex(q => !q.selectedOptionId)));
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!session.endsAt || session.status === 'COMPLETED') return;
    const check = () => setExpired(Date.now() >= new Date(session.endsAt!).getTime());
    check();
    const timer = window.setInterval(check, 1000);
    return () => window.clearInterval(timer);
  }, [session.endsAt, session.status]);
  const [result, setResult] = useState<{ score: number; total: number; xpEarned: number } | null>(null);
  const question = session.questions[index];
  const answered = session.questions.filter(q => q.selectedOptionId).length;
  async function send(action: 'answers' | 'complete', payload?: unknown) {
    const response = await fetch(`/api/quizzes/${session.id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload ? JSON.stringify(payload) : undefined });
    const data = await response.json();
    if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Request failed.');
    return data;
  }
  async function submit() {
    if (!selected || !question || busy || expired) return;
    setBusy(true); setError('');
    try {
      await send('answers', { questionId: question.id, selectedOptionId: selected });
      const updated = session.questions.map(q => q.id === question.id ? { ...q, selectedOptionId: selected } : q);
      setSession({ ...session, questions: updated, answered: answered + 1 });
      const next = updated.findIndex(q => !q.selectedOptionId);
      if (next !== -1) setIndex(next);
      setSelected('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit answer.'); }
    finally { setBusy(false); }
  }
  async function finish() {
    if (busy || expired || answered !== session.total) return;
    setBusy(true); setError('');
    try { const data = await send('complete'); setResult(data); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to finish quiz.'); }
    finally { setBusy(false); }
  }
  if (result || session.status === 'COMPLETED') {
    const score = result?.score ?? session.score ?? 0;
    const total = result?.total ?? session.total;
    const xp = result?.xpEarned ?? session.xpEarned ?? 0;
    return <section className="rounded-3xl border bg-white p-8 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">Quiz complete</p><h2 className="mt-4 text-5xl font-black">{score}/{total}</h2><p className="mt-3 text-xl text-neutral-600">You earned <strong className="text-indigo-700">{xp} XP</strong></p><button onClick={() => router.push('/dashboard')} className="mt-8 rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white">Back to dashboard</button></section>;
  }
  if (!question) return <p>No questions in this quiz.</p>;
  return <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-9">
    {session.endsAt && <CompetitionCountdown endsAt={session.endsAt} />}
    {expired && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">The shared timer has expired. Further answers are disabled. Return to your challenge or competition to see the settled results.</p>}
    <div className="flex justify-between text-sm font-semibold text-neutral-500"><span>Question {index + 1} of {session.total}</span><span>{answered}/{session.total} answered</span></div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${answered / session.total * 100}%` }}/></div>
    <h2 className="mt-9 text-2xl font-bold">{question.questionText}</h2>
    <div className="mt-7 space-y-3">{question.options.map((option, i) =>
      <button key={option.id} disabled={!!question.selectedOptionId || busy || expired} onClick={() => setSelected(option.id)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${(question.selectedOptionId ?? selected) === option.id ? 'border-indigo-600 bg-indigo-50' : 'border-neutral-200 hover:border-indigo-300'}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold">{String.fromCharCode(65 + i)}</span>{option.optionText}</button>)}</div>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2"><button onClick={() => { setIndex(Math.max(0, index - 1)); setSelected(''); }} disabled={index === 0 || busy} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button><button onClick={() => { setIndex(Math.min(session.questions.length - 1, index + 1)); setSelected(''); }} disabled={index === session.questions.length - 1 || busy} className="rounded-lg border px-4 py-2 disabled:opacity-40">Next</button></div>
      {answered === session.total ? <button disabled={busy || expired} onClick={finish} className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Finishing…' : 'Finish quiz'}</button> : <button disabled={busy || expired || !selected || !!question.selectedOptionId} onClick={submit} className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit answer'}</button>}
    </div>
  </section>;
}
