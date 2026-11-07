import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Scholar — Learn, compete, grow', description: 'Learn with quizzes, challenge friends, and grow your knowledge.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className="min-h-screen antialiased">{children}</body></html>; }
