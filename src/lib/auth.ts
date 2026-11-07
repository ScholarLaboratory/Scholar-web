import 'server-only';
import { cookies } from 'next/headers';
export const SESSION_COOKIE = 'scholar_session';
export type ScholarUser = { id: string; fullName: string; username: string; email: string; role?: string };
export function apiBaseUrl() { return process.env.SCHOLAR_API_URL ?? 'http://localhost:3001/api/v1'; }
export async function getCurrentUser(): Promise<ScholarUser | null> { const token = (await cookies()).get(SESSION_COOKIE)?.value; if (!token) return null; try { const response = await fetch(`${apiBaseUrl()}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }); if (!response.ok) return null; const body = await response.json() as { data?: { id?: string; userId?: string; email?: string; username?: string; fullName?: string; role?: string } }; const u = body.data; if (!u) return null; return { id: u.id ?? u.userId ?? '', email: u.email ?? '', username: u.username ?? '', fullName: u.fullName ?? u.username ?? 'Student', role: u.role }; } catch { return null; } }
