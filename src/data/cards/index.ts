import type { TaxonCard, Rarity } from './types'
import { annelida } from './annelida'
import { chordata } from './chordata'
import { amniota } from './amniota'
import { arthropoda } from './arthropoda'
import { metazoa } from './metazoa'
import { structural } from './structural'

export type { TaxonCard, Rarity };

export const ALL_TAXA_CARDS: TaxonCard[] = [
  ...annelida,
  ...chordata,
  ...amniota,
  ...arthropoda,
  ...metazoa,
  ...structural,
]

/** Lookup rápido: taxon name → card (case-insensitive) */
export const TAXA_CARDS_BY_TAXON: Record<string, TaxonCard> =
  Object.fromEntries(ALL_TAXA_CARDS.map(c => [c.taxon.toLowerCase(), c]))
