'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function StartQuizButton({ topicId, available }: { topicId: string; available: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function start() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicId, questionCount: Math.min(10, available) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Could not start quiz.');
      router.push(`/quizzes/${data.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start quiz.'); setBusy(false); }
  }
  return <div className="mt-7"><button disabled={busy || available < 1} onClick={start} className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Starting…' : `Start scored quiz (${Math.min(10, available)} questions)`}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
