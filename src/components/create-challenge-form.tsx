'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Subject } from '@/lib/learning-types';

export function CreateChallengeForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [topicId, setTopicId] = useState(subjects[0]?.topics[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [students, setStudents] = useState<{ id: string; fullName: string; username: string; school?: string | null }[]>([]);
  const [searchError, setSearchError] = useState('');
  useEffect(() => {
    if (search.trim().length < 2 || opponentId) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/students/search?q=' + encodeURIComponent(search.trim()), { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? 'Search failed.');
        setStudents(Array.isArray(data) ? data : []);
        setSearchError('');
      } catch (e) {
        if (!controller.signal.aborted) setSearchError(e instanceof Error ? e.message : 'Search failed.');
      }
    }, 350);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [search, opponentId]);
  const topics = subjects.find(s => s.id === subjectId)?.topics ?? [];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        opponentId,
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
    <label className="block text-sm font-semibold">Find a classmate<input value={search} onChange={e => { setSearch(e.target.value); setOpponentId(''); setSelectedName(''); setStudents([]); }} placeholder="Search name or username" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    {selectedName && <p className="text-sm font-semibold text-indigo-700">Selected: {selectedName}</p>}
    {!opponentId && students.length > 0 && <ul className="divide-y rounded-xl border">{students.map(student => <li key={student.id}><button type="button" onClick={() => { setOpponentId(student.id); setSelectedName(student.fullName + ' (@' + student.username + ')'); setStudents([]); }} className="w-full px-4 py-3 text-left text-sm hover:bg-indigo-50"><span className="font-semibold">{student.fullName}</span> <span className="text-neutral-500">@{student.username}{student.school ? ' · ' + student.school : ''}</span></button></li>)}</ul>}
    {searchError && <p role="alert" className="text-sm text-red-700">{searchError}</p>}
    <p className="text-xs text-neutral-500">Search by name or username and select a student to invite.</p>
    <label className="block text-sm font-semibold">Subject<select value={subjectId} onChange={e => { const id = e.target.value; setSubjectId(id); setTopicId(subjects.find(s => s.id === id)?.topics[0]?.id ?? ''); }} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label className="block text-sm font-semibold">Topic<select value={topicId} onChange={e => setTopicId(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold">Questions<input name="questionCount" type="number" min={1} max={20} defaultValue={10} required className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
      <label className="block text-sm font-semibold">Timer (seconds)<input name="durationSeconds" type="number" min={30} max={7200} defaultValue={300} required className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy || !topicId || !opponentId} className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending invitation…' : 'Send challenge invitation'}</button>
    {!topicId && <p className="text-sm text-neutral-500">A published subject with a topic is required to create a challenge.</p>}
  </form>;
}
