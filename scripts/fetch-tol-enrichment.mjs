#!/usr/bin/env node
// Gera public/data/tol-enrichment.json com silhuetas PhyloPic, fotos iNaturalist
// e resumos do Wikipédia para todos os nós da Árvore da Vida.
//
// Uso: node scripts/fetch-tol-enrichment.mjs
//      npm run fetch-enrichment

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT   = resolve(__dir, '..')
const PHYLO  = 'https://api.phylopic.org'
const INAT   = 'https://api.inaturalist.org/v1'
const WIKI   = 'https://pt.wikipedia.org/api/rest_v1/page/summary'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Extração de dados ────────────────────────────────────────────────────────
function extractNodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/treeoflife.ts'), 'utf8')
  const arrayMatch = src.match(/const TOL_DATA[^=]*=\s*\[([\s\S]*?)\];/)
  if (!arrayMatch) return []
  
  const nodes = []
  const lineRe = /\{\s*id:\s*'([^']+)'[^}]+\}/g
  let m
  while ((m = lineRe.exec(arrayMatch[1])) !== null) {
    const block = m[0]
    const get = (key) => {
      const res = new RegExp(`${key}:\\s*'([^']*)'`).exec(block)
      return res ? res[1] : null
    }
    const id   = get('id')
    const name = get('name')
    const type = get('type')
    if (id && name && type) {
      nodes.push({
        id,
        name,
        latinName: get('latinName'),
        rank: get('rank'),
        type,
        cardTaxon: get('cardTaxon'),
        phylopicQuery: get('phylopicQuery')
      })
    }
  }
  return nodes
}

function extractCardMap() {
  const cardsDir = resolve(ROOT, 'src/data/cards')
  const files = readdirSync(cardsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')
  const map = {}
  for (const file of files) {
    const src = readFileSync(resolve(cardsDir, file), 'utf8')
    const taxonRe = /taxon:\s*['"]([^'"]+)['"]/g
    const queryRe = /phylopicQuery:\s*['"]([^'"]+)['"]/g
    const sciRe   = /scientificName:\s*['"]([^'"]+)['"]/g
    
    const taxons = [...src.matchAll(taxonRe)].map(m => m[1])
    const queries = [...src.matchAll(queryRe)].map(m => m[1])
    const scis = [...src.matchAll(sciRe)].map(m => m[1])

    taxons.forEach((t, i) => {
      map[t.toLowerCase()] = { phylopicQuery: queries[i], scientificName: scis[i] }
    })
  }
  return map
}

// ── APIs ─────────────────────────────────────────────────────────────────────
async function fetchPhyloPicBuild() {
  const r = await fetch(PHYLO, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
  return (await r.json()).build
}

async function fetchPhyloPicUrl(query, build) {
  if (!query) return null
  try {
    const url = `${PHYLO}/nodes?build=${build}&filter_name=${encodeURIComponent(query.toLowerCase())}&embed_items=true&page=0`
    const r1 = await fetch(url, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
    const d1 = await r1.json()
    const nodeHref = d1._embedded?.items?.[0]?._links?.self?.href
    if (!nodeHref) return null
    const nodeId = nodeHref.split('/')[2].split('?')[0]
    const r2 = await fetch(`${PHYLO}/nodes/${nodeId}?build=${build}&embed_primaryImage=true`, { headers: { Accept: 'application/vnd.phylopic.v2+json' } })
    const d2 = await r2.json()
    const img = d2._embedded?.primaryImage
    return img?._links?.vectorFile?.href ?? img?._links?.rasterFiles?.[0]?.href ?? null
  } catch (e) { return null }
}

async function fetchInatPhoto(scientificName, rank) {
  if (!scientificName) return null
  try {
    const rankParam = rank ? `&rank=${rank}` : ''
    const url = `${INAT}/taxa?q=${encodeURIComponent(scientificName)}&per_page=5&order_by=observations_count${rankParam}`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Cladex/1.0 (educational app)' }
    })
    const d = await r.json()

    // Busca correspondência exata por nome para evitar fotos do táxon errado
    const queryNorm = scientificName.toLowerCase().trim()
    const match = d.results?.find(t => t.name?.toLowerCase().trim() === queryNorm)
    if (!match) return null

    const photo = match.default_photo
    if (!photo?.medium_url) return null

    return {
      url: photo.medium_url,
      credit: photo.attribution ?? '© iNaturalist contributor',
      license: photo.license_code ?? '',
    }
  } catch (e) { return null }
}

async function fetchWikiSummary(taxon) {
  try {
    const r = await fetch(`${WIKI}/${encodeURIComponent(taxon)}`)
    if (!r.ok) return null
    const d = await r.json()
    return d.extract || null
  } catch (e) { return null }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== fetch-tol-enrichment ===\n')

  const nodes = extractNodes()
  const cardMap = extractCardMap()
  
  const build = await fetchPhyloPicBuild()
  const silhouettes = {}
  const photos = {}

  // 1. Silhuetas (PhyloPic)
  console.log('── Silhuetas (PhyloPic) ───────────────────────────────────')
  for (const node of nodes) {
    // Ignora 'others' para silhuetas
    if (node.type === 'others') continue

    process.stdout.write(`  [${node.id.padEnd(28)}] `)
    
    let pQuery = node.phylopicQuery 
      || cardMap[node.cardTaxon?.toLowerCase()]?.phylopicQuery 
      || cardMap[node.name.toLowerCase()]?.phylopicQuery
      || node.name

    const url = await fetchPhyloPicUrl(pQuery, build)
    silhouettes[node.id] = url ?? null
    
    console.log(url ? '✓' : '–')
    await sleep(100)
  }

  // 2. Fotos & Resumos (Wiki + iNat)
  console.log('\n── Fotos & Resumos (Wiki + iNat) ──────────────────────────')
  for (const node of nodes) {
    process.stdout.write(`  [${node.id.padEnd(28)}] `)
    
    // Wikipedia: Busca prioritária por Latin Name > Name
    const summary = await fetchWikiSummary(node.latinName || node.name)
    
    // iNaturalist: Busca por Scientific Name do Card > Latin Name do Nó > Name do Nó
    const card = node.cardTaxon ? cardMap[node.cardTaxon.toLowerCase()] : cardMap[node.name.toLowerCase()]
    const iQuery = card?.scientificName || node.latinName || node.name
    
    const photo = await fetchInatPhoto(iQuery, node.rank)

    if (summary || photo) {
      photos[node.id] = {
        ...(photo || {}),
        summary: summary || undefined
      }
      console.log(`✓${summary ? ' [W]' : ''}${photo ? ' [I]' : ''}`)
    } else {
      console.log('–')
    }
    await sleep(120)
  }

  const output = {
    generated: new Date().toISOString().slice(0, 10),
    phylopicBuild: build,
    silhouettes,
    photos,
  }

  const outPath = resolve(ROOT, 'public/data/tol-enrichment.json')
  mkdirSync(resolve(ROOT, 'public/data'), { recursive: true })
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  
  console.log(`\n✓ Finalizado: ${Object.keys(silhouettes).length} silhuetas, ${Object.keys(photos).length} informativos.`)
}

main()
