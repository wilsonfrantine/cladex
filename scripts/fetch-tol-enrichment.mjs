#!/usr/bin/env node
// Gera public/data/tol-enrichment.json com silhuetas PhyloPic e fotos iNaturalist
// para todos os nós da Árvore da Vida (treeoflife.ts).
//
// Uso: node scripts/fetch-tol-enrichment.mjs
//      npm run fetch-enrichment
//
// Saída: public/data/tol-enrichment.json  (~25 KB)
// O arquivo gerado é commitado — sem chamadas de API em runtime.

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT   = resolve(__dir, '..')
const PHYLO  = 'https://api.phylopic.org'
const INAT   = 'https://api.inaturalist.org/v1'

// ── Delay para respeitar rate limits ────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Parse treeoflife.ts via regex ────────────────────────────────────────────
function extractNodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/treeoflife.ts'), 'utf8')

  // Extrai linhas com objetos de nó (filtra linhas de comentário e geradas)
  const nodes = []

  // Captura todos os objetos do TOL_DATA (entre os colchetes de TOL_DATA)
  const arrayMatch = src.match(/const TOL_DATA[^=]*=\s*\[([\s\S]*?)\];/)
  if (!arrayMatch) {
    console.error('Não encontrou TOL_DATA em treeoflife.ts')
    process.exit(1)
  }
  const arrayBody = arrayMatch[1]

  // Cada linha de nó começa com '{ id:'
  const lineRe = /\{\s*id:\s*'([^']+)'[^}]+\}/g
  let m
  while ((m = lineRe.exec(arrayBody)) !== null) {
    const block = m[0]

    const get = (key) => {
      const r = new RegExp(`${key}:\\s*'([^']*)'`)
      const res = r.exec(block)
      return res ? res[1] : null
    }

    const id   = get('id')
    const name = get('name')
    const type = get('type')
    const cardTaxon     = get('cardTaxon')
    const phylopicQuery = get('phylopicQuery')
    const rank = get('rank')

    if (id && name && type) {
      nodes.push({ id, name, type, cardTaxon, phylopicQuery, rank })
    }
  }
  return nodes
}

// ── Parse taxa-cards.ts: mapeia taxon → { phylopicQuery, scientificName } ───
function extractCardQueries() {
  const src = readFileSync(resolve(ROOT, 'src/data/taxa-cards.ts'), 'utf8')
  const map = {}

  const taxonRe     = /taxon:\s*'([^']+)'/g
  const pQueryRe    = /phylopicQuery:\s*'([^']+)'/g
  const sciNameRe   = /scientificName:\s*'([^']+)'/g

  const taxons   = [...src.matchAll(taxonRe)].map(m => m[1])
  const queries  = [...src.matchAll(pQueryRe)].map(m => m[1])
  const sciNames = [...src.matchAll(sciNameRe)].map(m => m[1])

  for (let i = 0; i < taxons.length; i++) {
    map[taxons[i]] = {
      phylopicQuery: queries[i] ?? null,
      scientificName: sciNames[i] ?? null,
    }
  }
  return map
}

// ── PhyloPic API v2 ──────────────────────────────────────────────────────────
async function fetchPhyloPicBuild() {
  const r = await fetch(PHYLO, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
  const d = await r.json()
  return d.build
}

async function fetchPhyloPicUrl(query, build) {
  if (!query) return null
  try {
    const url1 = `${PHYLO}/nodes?build=${build}&filter_name=${encodeURIComponent(query.toLowerCase())}&embed_items=true&page=0`
    const r1   = await fetch(url1, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
    const d1   = await r1.json()
    const nodeHref = d1._embedded?.items?.[0]?._links?.self?.href
    if (!nodeHref) return null

    const nodeId = nodeHref.split('/')[2].split('?')[0]
    const url2   = `${PHYLO}/nodes/${nodeId}?build=${build}&embed_primaryImage=true`
    const r2     = await fetch(url2, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
    const d2     = await r2.json()
    const img    = d2._embedded?.primaryImage
    return img?._links?.vectorFile?.href ?? img?._links?.rasterFiles?.[0]?.href ?? null
  } catch (e) {
    return null
  }
}

// ── iNaturalist API ──────────────────────────────────────────────────────────
async function fetchInatPhoto(scientificName, rank) {
  if (!scientificName) return null
  try {
    const rankParam = rank ? `&rank=${rank}` : ''
    const url = `${INAT}/taxa?q=${encodeURIComponent(scientificName)}&per_page=5&order_by=observations_count${rankParam}`
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Cladex/1.0 (educational app; contact: wilson@cladex.app)',
      }
    })
    const d = await r.json()

    // Procura o primeiro resultado cujo nome bate exatamente com o nome buscado.
    // Isso evita que uma busca por "Salmo salar" retorne uma foto de "Salmo trutta"
    // ou outro táxon homônimo/irmão com mais observações no banco.
    const queryNorm = scientificName.toLowerCase().trim()
    const taxon = d.results?.find(t =>
      t.name?.toLowerCase().trim() === queryNorm
    )
    if (!taxon) return null

    const photo = taxon.default_photo
    if (!photo?.medium_url) return null

    return {
      url: photo.medium_url,
      credit: photo.attribution ?? '© iNaturalist contributor',
      license: photo.license_code ?? '',
    }
  } catch (e) {
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('=== fetch-tol-enrichment ===\n')

const nodes    = extractNodes()
const cardMap  = extractCardQueries()

console.log(`Nós extraídos de treeoflife.ts: ${nodes.length}`)
console.log(`Cards em taxa-cards.ts: ${Object.keys(cardMap).length}\n`)

// Filtrar nós que fazem sentido ter silhueta (excluir others e placeholders gerados)
const silhouetteNodes = nodes.filter(n => n.type !== 'others' && n.type !== 'placeholder')
const cardNodes       = nodes.filter(n => n.type === 'card' || (n.type === 'placeholder' && n.cardTaxon))

console.log(`Nós para PhyloPic: ${silhouetteNodes.length}`)
console.log(`Nós para iNaturalist: ${cardNodes.length}\n`)

// ── PhyloPic build ───────────────────────────────────────────────────────────
console.log('Buscando build atual do PhyloPic...')
const build = await fetchPhyloPicBuild()
console.log(`Build: ${build}\n`)

// ── Silhuetas ────────────────────────────────────────────────────────────────
console.log('── PhyloPic silhuetas ─────────────────────────────────────')
const silhouettes = {}
let silHit = 0, silMiss = 0

for (const node of silhouetteNodes) {
  // Determina query: node.phylopicQuery > cardTaxon.phylopicQuery > node.name
  let query = node.phylopicQuery
  if (!query && node.cardTaxon && cardMap[node.cardTaxon]) {
    query = cardMap[node.cardTaxon].phylopicQuery
  }
  if (!query) query = node.name

  process.stdout.write(`  [${node.id.padEnd(28)}] query="${query}" → `)

  const url = await fetchPhyloPicUrl(query, build)
  silhouettes[node.id] = url ?? null

  if (url) {
    silHit++
    console.log('✓')
  } else {
    silMiss++
    console.log('–')
  }

  await sleep(150) // PhyloPic não tem rate limit documentado mas é respeitoso
}

console.log(`\n  PhyloPic: ${silHit} encontrados / ${silMiss} sem silhueta\n`)

// ── Fotos iNaturalist ────────────────────────────────────────────────────────
console.log('── iNaturalist fotos ──────────────────────────────────────')
const photos = {}
let inatHit = 0, inatMiss = 0

for (const node of cardNodes) {
  // Para iNaturalist usamos o nome do táxon do nó como query de grupo.
  // Se houver um animal emblemático mapeado via cardTaxon, preferimos o nome científico dele
  // (ex: "Amphimedon queenslandica" → foto mais icônica que "Porifera" genérico).
  // Fallback: node.name (ex: 'Porifera', 'Mammalia') — funciona muito bem no iNat.
  const card = node.cardTaxon ? cardMap[node.cardTaxon] : cardMap[node.name]
  const sciName = card?.scientificName ?? node.name

  process.stdout.write(`  [${node.id.padEnd(28)}] q="${sciName}" → `)

  const photo = await fetchInatPhoto(sciName, node.rank ?? null)
  photos[node.id] = photo ?? null

  if (photo) {
    inatHit++
    console.log(`✓  ${photo.url.slice(0, 60)}...`)
  } else {
    inatMiss++
    console.log('–')
  }

  await sleep(120) // iNaturalist: ≤60 req/min target
}

console.log(`\n  iNaturalist: ${inatHit} encontradas / ${inatMiss} sem foto\n`)

// ── Escrever JSON ────────────────────────────────────────────────────────────
const output = {
  generated: new Date().toISOString().slice(0, 10),
  phylopicBuild: build,
  silhouettes,
  photos,
}

const outDir  = resolve(ROOT, 'public/data')
const outPath = resolve(outDir, 'tol-enrichment.json')
mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, JSON.stringify(output, null, 2))

const size = (JSON.stringify(output).length / 1024).toFixed(1)
console.log(`✓ Escrito em public/data/tol-enrichment.json  (${size} KB)`)
console.log(`  silhuetas: ${Object.keys(silhouettes).length}  |  fotos: ${Object.keys(photos).length}`)
