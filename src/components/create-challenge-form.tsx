'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Subject } from '@/lib/learning-types';

export function CreateChallengeForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [topicId, setTopicId] = useState(subjects[0]?.topics[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const topics = subjects.find(s => s.id === subjectId)?.topics ?? [];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        opponentId: String(form.get('opponentId')).trim(),
        topicId,
        questionCount: Number(form.get('questionCount')),
        durationSeconds: Number(form.get('durationSeconds')),
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Unable to create challenge.');
      router.push(`/challenges/${data.id}`);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create challenge.'); setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border bg-white p-6">
    <label className="block text-sm font-semibold">Opponent’s student ID<input name="opponentId" required placeholder="Student UUID" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" pattern="[0-9a-fA-F-]{36}" /></label>
    <p className="text-xs text-neutral-500">For now, paste the student ID of the person you want to challenge. Student search will replace this field.</p>
    <label className="block text-sm font-semibold">Subject<select value={subjectId} onChange={e => { const id = e.target.value; setSubjectId(id); setTopicId(subjects.find(s => s.id === id)?.topics[0]?.id ?? ''); }} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label className="block text-sm font-semibold">Topic<select value={topicId} onChange={e => setTopicId(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold">Questions<input name="questionCount" type="number" min={1} max={20} defaultValue={10} required className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
      <label className="block text-sm font-semibold">Timer (seconds)<input name="durationSeconds" type="number" min={30} max={7200} defaultValue={300} required className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy || !topicId} className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending invitation…' : 'Send challenge invitation'}</button>
    {!topicId && <p className="text-sm text-neutral-500">A published subject with a topic is required to create a challenge.</p>}
  </form>;
}
