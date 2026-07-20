const STORAGE_URL = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';

export async function saveProspect(data: { businessName: string; businessEmail?: string; reviews: { author: string; text: string; rating: number; response?: string }[]; keywords?: any }): Promise<string> {
  const res = await fetch(`${STORAGE_URL}/prospect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, createdAt: Date.now() }),
  });
  const json = await res.json();
  return json.slug || '';
}

export async function getProspect(slug: string): Promise<{ businessName: string; businessEmail?: string; reviews: { author: string; text: string; rating: number; response?: string }[]; keywords?: any; createdAt: number; readAt?: number } | null> {
  const res = await fetch(`${STORAGE_URL}/prospect/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProspect(slug: string, data: { businessName: string; businessEmail?: string; reviews: { author: string; text: string; rating: number; response?: string }[]; keywords?: any }): Promise<boolean> {
  const res = await fetch(`${STORAGE_URL}/prospect/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, readAt: 0 }),
  });
  return res.ok;
}
