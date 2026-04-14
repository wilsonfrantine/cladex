// Serviço de enriquecimento visual da Árvore da Vida.
//
// Carrega public/data/tol-enrichment.json uma única vez (singleton por módulo)
// e fornece silhuetas PhyloPic e fotos iNaturalist por node ID.

export interface PhotoEntry {
  url: string;
  credit: string;
  license?: string;
}

export interface EnrichmentData {
  generated: string;
  phylopicBuild: number;
  silhouettes: Record<string, string | null>;
  photos: Record<string, PhotoEntry | null>;
}

export interface NodeEnrichment {
  silhouette: string | null;
  photo: PhotoEntry | null;
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
      // Retorna dados vazios para não quebrar a UI
      _data = { generated: '', phylopicBuild: 0, silhouettes: {}, photos: {} };
      return _data;
    });

  return _promise;
}

export function getEnrichment(nodeId: string): NodeEnrichment {
  if (!_data) return { silhouette: null, photo: null };
  return {
    silhouette: _data.silhouettes[nodeId] ?? null,
    photo: _data.photos[nodeId] ?? null,
  };
}
