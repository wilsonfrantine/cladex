
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'fossil'

export interface EmblematicAnimal {
  /** Nome popular do animal representativo — usado para busca no PhyloPic */
  commonName: string
  /** Nome científico do representante */
  scientificName: string
  /** Query de busca para PhyloPic (pode ser mais genérico que o nome científico) */
  phylopicQuery: string
}

export interface TaxonCard {
  /** Nome do táxon — deve corresponder ao nome de folha nas árvores Newick (case-insensitive) */
  taxon: string
  /** Módulo de treino ao qual pertence */
  module: string
  rarity: Rarity
  emblematicAnimal: EmblematicAnimal
  /** 2–3 sinapomorfias que definem o clado (em português, acessíveis) */
  synapomorphies: string[]
  /** 3–4 características biológicas notáveis do grupo */
  bioFeatures: string[]
  /** Um fato surpreendente ou memorável */
  funFact: string
}
