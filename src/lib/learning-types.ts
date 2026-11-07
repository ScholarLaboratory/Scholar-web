export type Topic = { id: string; name: string; slug: string; subjectId: string };
export type Subject = { id: string; name: string; slug: string; topics: Topic[] };
