#!/usr/bin/env node
// Gera src/data/phylopic-cache.ts usando taxa-cards.ts como fonte.
//
// Para cada TaxonCard, busca o PhyloPic pelo emblematicAnimal.phylopicQuery
// (nome popular em inglês, ex: "earthworm", "lion") — nomes mais comuns que os
// científicos e com melhor cobertura no PhyloPic.
//
// Uso: node scripts/curate-phylopic.mjs
//      npm run curate-phylopic

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '..')
const API = 'https://api.phylopic.org'

// ── Extrair phylopicQuery de cada entrada em taxa-cards.ts ──────────────────
// Parse simples via regex — evita transpile de TS em runtime
function extractQueries() {
  const src = readFileSync(resolve(ROOT, 'src/data/taxa-cards.ts'), 'utf8')

  // Captura pares taxon + phylopicQuery de cada objeto TaxonCard
  const entries = []

  // Match cada bloco de card (taxon até o próximo '},' de nível raiz)
  const taxonRe = /taxon:\s*['"]([^'"]+)['"]/g
  const queryRe = /phylopicQuery:\s*['"]([^'"]+)['"]/g

  const taxons = [...src.matchAll(taxonRe)].map(m => m[1])
  const queries = [...src.matchAll(queryRe)].map(m => m[1])

  if (taxons.length !== queries.length) {
    console.error(`Mismatch: ${taxons.length} taxons vs ${queries.length} queries`)
    process.exit(1)
  }

  for (let i = 0; i < taxons.length; i++) {
    entries.push({ taxon: taxons[i], query: queries[i] })
  }
  return entries
}

// ── PhyloPic API v2 ─────────────────────────────────────────────────────────
async function fetchBuild() {
  const r = await fetch(API, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
  return (await r.json()).build
}

async function fetchUrl(query, build) {
  const url = `${API}/nodes?build=${build}&filter_name=${encodeURIComponent(query.toLowerCase())}&embed_items=true&page=0`
  const r1 = await fetch(url, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
  const d1 = await r1.json()
  const nodeHref = d1._embedded?.items?.[0]?._links?.self?.href
  if (!nodeHref) return null

  const nodeId = nodeHref.split('/')[2].split('?')[0]
  const r2 = await fetch(
    `${API}/nodes/${nodeId}?build=${build}&embed_primaryImage=true`,
    { headers: { Accept: 'application/vnd.phylopic.v2+json' } },
  )
  const d2 = await r2.json()
  const img = d2._embedded?.primaryImage
  return img?._links?.vectorFile?.href ?? img?._links?.rasterFiles?.[0]?.href ?? null
}

// ── Main ────────────────────────────────────────────────────────────────────
const entries = extractQueries()
console.log(`Encontrados ${entries.length} táxons em taxa-cards.ts`)

console.log('Buscando build atual do PhyloPic...')
const build = await fetchBuild()
console.log(`Build: ${build}`)

const results = {}
const missing = []

const seen = new Set()
for (const { taxon, query } of entries) {
  if (seen.has(taxon)) {
    console.log(`  ${taxon.padEnd(20)} (query: "${query}") → duplicado, ignorado`)
    continue
  }
  seen.add(taxon)
  process.stdout.write(`  ${taxon.padEnd(20)} (query: "${query}") → `)
  try {
    const url = await fetchUrl(query, build)
    if (url) {
      results[taxon] = url
      console.log('OK')
    } else {
      missing.push({ taxon, query })
      console.log('sem resultado')
    }
  } catch (e) {
    missing.push({ taxon, query })
    console.log(`erro: ${e.message}`)
  }
}

// ── Gerar arquivo TS ─────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10)
const lines = [
  `// Cache estático de silhuetas PhyloPic para os táxons curados do Cladex.`,
  `// Gerado em ${today} — PhyloPic build ${build}`,
  `// Fonte: src/data/taxa-cards.ts (emblematicAnimal.phylopicQuery)`,
  `// Táxons sem silhueta no PhyloPic são omitidos — TreeViewer exibe apenas label.`,
  `// Licenças: CC BY, CC BY-SA e domínio público (ver https://www.phylopic.org)`,
  `//`,
  `// Para regenerar: npm run curate-phylopic`,
  ``,
  `export const PHYLOPIC_STATIC: Record<string, string> = {`,
]

// Ordem de aparição em taxa-cards.ts (sem duplicatas)
const maxLen = Math.max(...Object.keys(results).map(t => t.length))
const seenTaxons = new Set()
for (const { taxon } of entries) {
  if (seenTaxons.has(taxon) || !results[taxon]) continue
  seenTaxons.add(taxon)
  lines.push(`  '${taxon}':${' '.repeat(maxLen - taxon.length + 1)} '${results[taxon]}',`)
}
lines.push('')

lines.push('}')
lines.push('')

const output = lines.join('\n')
const outPath = resolve(ROOT, 'src/data/phylopic-cache.ts')
writeFileSync(outPath, output)

console.log(`\n✓ Escrito em src/data/phylopic-cache.ts`)
console.log(`  ${Object.keys(results).length} táxons com silhueta`)

if (missing.length) {
  console.log(`\n⚠ Sem silhueta (${missing.length}):`)
  for (const { taxon, query } of missing) {
    console.log(`  ${taxon} (query: "${query}")`)
  }
  console.log('\nDica: tente um query mais genérico em emblematicAnimal.phylopicQuery')
}
