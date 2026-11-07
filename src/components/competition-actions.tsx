'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export function CompetitionActions({ id, status, organizer, joined }: { id: string; status: string; organizer: boolean; joined: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function perform(action: 'open' | 'join' | 'close' | 'start') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/competitions/${id}/${action}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Unable to update competition.');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  const actions: { key: 'open' | 'join' | 'close' | 'start'; label: string }[] = [];
  if (organizer && status === 'DRAFT') actions.push({ key: 'open', label: 'Open registration' });
  if (!joined && status === 'OPEN') actions.push({ key: 'join', label: 'Join competition' });
  if (organizer && status === 'OPEN') actions.push({ key: 'close', label: 'Close registration' });
  if (organizer && status === 'CLOSED') actions.push({ key: 'start', label: 'Start competition' });
  return <div className="mt-6"><div className="flex flex-wrap gap-3">{actions.map(action => <button key={action.key} type="button" disabled={busy} onClick={() => perform(action.key)} className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Please wait…' : action.label}</button>)}</div>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
