// Utilitário de fetch + cache localStorage para silhuetas PhyloPic.
// Usado apenas para custom Newick — os táxons dos módulos fixos usam
// PHYLOPIC_STATIC em src/data/phylopic-cache.ts (zero latência de API).

const API = 'https://api.phylopic.org'
const LS_KEY = 'phylopic-cache-v2'

interface PhylopicCache {
  build: number
  urls: Record<string, string>
}

function loadCache(): PhylopicCache {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') ?? { build: 0, urls: {} }
  } catch {
    return { build: 0, urls: {} }
  }
}

function saveCache(c: PhylopicCache) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(c)) } catch {}
}

async function fetchBuild(): Promise<number> {
  const r = await fetch(API, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
  return (await r.json()).build
}

export async function fetchSilhouetteUrl(taxonName: string): Promise<string | null> {
  const cache = loadCache()
  if (cache.urls[taxonName]) return cache.urls[taxonName]

  const build = cache.build || await fetchBuild()

  // PhyloPic exige nome em minúsculas no filter_name
  const r1 = await fetch(
    `${API}/nodes?build=${build}&filter_name=${encodeURIComponent(taxonName.toLowerCase())}&embed_items=true&page=0`,
    { headers: { Accept: 'application/vnd.phylopic.v2+json' } },
  )
  const d1 = await r1.json()
  const nodeHref: string | undefined = d1._embedded?.items?.[0]?._links?.self?.href
  if (!nodeHref) return null

  // href: '/nodes/{uuid}?build=...'
  const nodeId = nodeHref.split('/')[2].split('?')[0]
  const r2 = await fetch(
    `${API}/nodes/${nodeId}?build=${build}&embed_primaryImage=true`,
    { headers: { Accept: 'application/vnd.phylopic.v2+json' } },
  )
  const d2 = await r2.json()
  const img = d2._embedded?.primaryImage
  // URL vem diretamente de images.phylopic.org (não precisa prefixar com API)
  const url: string | undefined =
    img?._links?.vectorFile?.href ?? img?._links?.rasterFiles?.[0]?.href

  if (url) {
    cache.build = build
    cache.urls[taxonName] = url
    saveCache(cache)
  }
  return url ?? null
}

export async function fetchSilhouetteBatch(names: string[]): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    names.map(n => fetchSilhouetteUrl(n).then(url => ({ name: n, url }))),
  )
  const out: Record<string, string> = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.url) out[r.value.name] = r.value.url
  }
  return out
}
