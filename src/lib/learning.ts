import 'server-only';
import { apiBaseUrl } from '@/lib/auth';

export type Topic = { id: string; name: string; slug: string; subjectId: string };
export type Subject = { id: string; name: string; slug: string; topics: Topic[] };
export type LearningResult<T> = { data: T | null; error: string | null };

async function getPublic<T>(path: string): Promise<LearningResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, { cache: 'no-store' });
    if (!response.ok) return { data: null, error: 'Learning content is currently unavailable.' };
    return { data: await response.json() as T, error: null };
  } catch {
    return { data: null, error: 'Cannot connect to the Scholar learning service.' };
  }
}

export function getSubjects() { return getPublic<Subject[]>('/subjects'); }
export function getTopics(subjectId: string) {
  return getPublic<Topic[]>(`/subjects/${encodeURIComponent(subjectId)}/topics`);
}
