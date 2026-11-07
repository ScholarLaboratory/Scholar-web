import { AuthForm } from '@/components/auth-form';
export default function Login() { return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5"><div><h1 className="text-3xl font-bold">Welcome back</h1><p className="mt-2 text-neutral-600">Sign in to your Scholar account.</p></div><AuthForm mode="login" /></main>; }
