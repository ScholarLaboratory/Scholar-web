'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch('/api/auth/' + mode, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) { setError(Array.isArray(result.message) ? result.message.join(', ') : result.message ?? 'Something went wrong.'); return; }
      router.push(register ? '/login?registered=1' : '/dashboard');
      router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
    {register && <><Field label="Full name" name="fullName" autoComplete="name" minLength={2} /><Field label="Username" name="username" autoComplete="username" minLength={3} pattern="[A-Za-z0-9_]+" /></>}
    <Field label="Email" name="email" type="email" autoComplete="email" />
    <Field label="Password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={8} />
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    <p className="text-center text-sm text-neutral-600">{register ? 'Already registered?' : 'New to Scholar?'} <Link className="font-semibold text-indigo-700" href={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
  </form>;
}
function Field({ label, name, type = 'text', ...props }: { label: string; name: string; type?: string; autoComplete?: string; minLength?: number; pattern?: string }) {
  return <label className="block text-sm font-medium">{label}<input required name={name} type={type} {...props} className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label>;
}
