
export interface PhotoEntry {
  url?: string;
  credit?: string;
  license?: string;
  summary?: string;
}

export interface EnrichmentData {
  generated: string;
  phylopicBuild: number;
  silhouettes: Record<string, string | null>;
  photos: Record<string, PhotoEntry | null>;
}

// ── Singleton ────────────────────────────────────────────────────────────────
let _data: EnrichmentData | null = null;
let _promise: Promise<EnrichmentData> | null = null;

export async function loadEnrichment(): Promise<EnrichmentData> {
  if (_data) return _data;
  if (_promise) return _promise;

  _promise = fetch(`${import.meta.env.BASE_URL}data/tol-enrichment.json`)
    .then(r => {
      if (!r.ok) throw new Error(`tol-enrichment.json: ${r.status}`);
      return r.json() as Promise<EnrichmentData>;
    })
    .then(data => {
      _data = data;
      return data;
    })
    .catch(err => {
      console.warn('[enrichment] Falha ao carregar tol-enrichment.json:', err);
      _data = { generated: '', phylopicBuild: 0, silhouettes: {}, photos: {} };
      return _data;
    });

  return _promise;
}
