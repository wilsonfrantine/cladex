export type CladeType = 'monophyletic' | 'paraphyletic' | 'polyphyletic';
export type HomologyType = 'sinapomorfia' | 'autapomorfia' | 'plesiomorfia' | 'simplesiomorfia';

export interface CharacterItem {
  /** Descrição do caráter (ex: "Presença de clitelo") */
  character: string;
  /** Folhas que possuem o caráter — devem coincidir com nomes no Newick */
  taxaWithCharacter: string[];
  /** Nome do nó interno onde o caráter surgiu — deve constar no Newick */
  originNode: string;
  type: HomologyType;
  explanation: string;
}

export interface LeafHint {
  /** Folha a ser ocultada (substituída por "?") */
  hiddenLeaf: string;
  /** 2–3 dicas para o aluno identificar o táxon */
  hints: string[];
  /** Nome do grupo a exibir no card de dicas */
  cardLabel?: string;
  /** Quando presente, ativa modo drag-and-drop em vez de clique */
  dragDrop?: true;
}

export interface SisterGroupQuestion {
  /** Folha ou nó destacado — o aluno busca o grupo-irmão DESTE táxon */
  targetTaxon: string;
  /** Nome exato no Newick (folha OU nó interno nomeado) */
  correctSister: string;
  explanation: string;
}

export interface ProximityQuestion {
  /** Táxon de referência — destacado na árvore */
  targetTaxon: string;
  /** Táxon mais próximo do alvo — resposta correta */
  closer: string;
  /** Táxon mais distante do alvo — distrator */
  farther: string;
  explanation: string;
}

export interface ExerciseClade {
  id: string;
  taxaInGroup: string[]; // leaf names (must match Newick exactly)
  type: CladeType;
  explanation: string;
  /** Quando presente, o exercício contextualiza o grupo tradicional (ex: 'Polychaeta') */
  traditionalGroupContext?: string;
  /** Caracteres para exercícios de tipo-de-homologia e posicionamento de caráter */
  characters?: CharacterItem[];
  /** Dicas para exercícios de posicionamento de folha */
  leafHints?: LeafHint[];
  /** Questões de grupo-irmão — aluno clica no grupo-irmão direto do targetTaxon */
  sisterGroupQuestions?: SisterGroupQuestion[];
  /** Questões de proximidade relativa — aluno decide qual de dois táxons é mais próximo do alvo */
  proximityQuestions?: ProximityQuestion[];
}

export interface CuratedTree {
  id: string;
  label: string;
  moduleId: string;
  /** Topology only — sem branch lengths */
  newick: string;
  source: string;
  clades: ExerciseClade[];
  /** Anotações de classificação tradicional por nome de folha, para exibição na árvore */
  taxonAnnotations?: Record<string, { abbr: string; color: string }>;
}
