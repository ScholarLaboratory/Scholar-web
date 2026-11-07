'use client';
import { useState } from 'react';
export function CopyStudentId({ id }: { id: string }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(id); setStatus('Copied'); }
    catch { setStatus('Select the ID and copy it manually.'); }
  }
  return <div className="mt-4 flex flex-wrap items-center gap-3"><code className="break-all rounded-lg border bg-white px-3 py-2 text-sm">{id}</code><button type="button" onClick={copy} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">Copy ID</button><span role="status" className="text-sm text-neutral-600">{status}</span></div>;
}
