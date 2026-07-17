interface Review {
  author: string;
  text: string;
  rating: number;
  response?: string;
}

interface ProspectData {
  businessName: string;
  reviews: Review[];
  createdAt: number;
}

const store = new Map<string, ProspectData>();

export function saveProspect(data: ProspectData): string {
  const slug = crypto.randomUUID().slice(0, 8);
  store.set(slug, data);
  return slug;
}

export function getProspect(slug: string): ProspectData | undefined {
  return store.get(slug);
}
