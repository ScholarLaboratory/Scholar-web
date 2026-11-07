import { AuthForm } from '@/components/auth-form';
export default function Register() { return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5"><div><h1 className="text-3xl font-bold">Join Scholar</h1><p className="mt-2 text-neutral-600">Create your student account to start learning.</p></div><AuthForm mode="register" /></main>; }
