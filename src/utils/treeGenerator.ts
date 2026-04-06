import { getModuleData, type Taxon, type Character } from '../data/taxa';

export type CladeType = 'monophyletic' | 'paraphyletic' | 'polyphyletic';

export interface CladeMetadata {
  /** IDs dos táxons que compõem o clado destacado no exercício */
  members: string[];
  type: CladeType;
  /** Explicação pedagógica para o feedback */
  explanation: string;
}

export interface GeneratedTree {
  newick: string;
  /** Táxons incluídos nesta árvore, em ordem de folha */
  taxa: Taxon[];
  /** Metadados do clado que será o foco do exercício de classificação */
  exerciseClade: CladeMetadata;
  /** Caracteres disponíveis para exercício de sinapomorfia */
  availableCharacters: Character[];
  /** Par de táxons para exercício de MRCA */
  mrcaPair: [string, string];
}

// ─── Utilitários ────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Geração de Newick a partir de uma árvore binária ────────────────────────

interface TreeNode {
  taxon?: string; // folha
  left?: TreeNode;
  right?: TreeNode;
  branchLength: number;
}

/** Constrói uma árvore binária aleatória com os táxons dados */
function buildRandomTree(taxonIds: string[]): TreeNode {
  if (taxonIds.length === 1) {
    return { taxon: taxonIds[0], branchLength: parseFloat((Math.random() * 0.3 + 0.05).toFixed(2)) };
  }

  const splitAt = randomBetween(1, taxonIds.length - 1);
  const leftIds = taxonIds.slice(0, splitAt);
  const rightIds = taxonIds.slice(splitAt);

  return {
    left: buildRandomTree(leftIds),
    right: buildRandomTree(rightIds),
    branchLength: parseFloat((Math.random() * 0.3 + 0.05).toFixed(2)),
  };
}

function treeToNewick(node: TreeNode): string {
  if (node.taxon) {
    return `${node.taxon}:${node.branchLength}`;
  }
  return `(${treeToNewick(node.left!)}${node.right ? ',' + treeToNewick(node.right!) : ''}):${node.branchLength}`;
}

/** Coleta todos os táxons-folha de uma subárvore */
function collectLeaves(node: TreeNode): string[] {
  if (node.taxon) return [node.taxon];
  return [...collectLeaves(node.left!), ...(node.right ? collectLeaves(node.right!) : [])];
}

/** Retorna todos os nós internos (não-folha) com seus descendentes */
function getInternalNodes(node: TreeNode): Array<{ leaves: string[] }> {
  if (node.taxon) return [];
  const leaves = collectLeaves(node);
  const children: Array<{ leaves: string[] }> = [{ leaves }];
  children.push(...getInternalNodes(node.left!));
  if (node.right) children.push(...getInternalNodes(node.right!));
  return children;
}

// ─── Determinação do tipo de clado ──────────────────────────────────────────

/**
 * Para fins pedagógicos, um clado gerado randomicamente é sempre monofilético
 * (inclui ancestral + todos descendentes). Para gerar para e polifiléticos,
 * usamos grupos "artificiais" retirados de diferentes partes da árvore.
 */
function buildParaphyleticGroup(
  tree: TreeNode,
  _allLeaves: string[],
): CladeMetadata | null {
  const internals = getInternalNodes(tree).filter((n) => n.leaves.length >= 3);
  if (internals.length === 0) return null;

  const clade = internals[Math.floor(Math.random() * internals.length)];
  // remove 1 táxon interno para criar grupo parafilético
  const excluded = clade.leaves[Math.floor(Math.random() * clade.leaves.length)];
  const members = clade.leaves.filter((l) => l !== excluded);

  return {
    members,
    type: 'paraphyletic',
    explanation: `Este grupo é **parafilético**: inclui o ancestral comum de ${members.join(', ')}, mas exclui ${excluded}, que também descende desse ancestral. Grupos parafiléticos não refletem a totalidade da linhagem.`,
  };
}

function buildPolyphyleticGroup(allLeaves: string[]): CladeMetadata | null {
  if (allLeaves.length < 4) return null;
  const shuffled = shuffle(allLeaves);
  // pega táxons das "pontas" opostas da lista embaralhada
  const members = [shuffled[0], shuffled[shuffled.length - 1]];
  return {
    members,
    type: 'polyphyletic',
    explanation: `Este grupo é **polifilético**: ${members.join(' e ')} foram reunidos por convergência (caráter análogo), mas não compartilham um ancestral exclusivo entre si. O ancestral comum mais recente deles inclui muitos outros táxons.`,
  };
}

function buildMonophyleticGroup(tree: TreeNode): CladeMetadata | null {
  const internals = getInternalNodes(tree).filter(
    (n) => n.leaves.length >= 2 && n.leaves.length <= 5,
  );
  if (internals.length === 0) return null;

  const clade = internals[Math.floor(Math.random() * internals.length)];
  return {
    members: clade.leaves,
    type: 'monophyletic',
    explanation: `Este grupo é **monofilético** (clado): inclui um ancestral comum e **todos** os seus descendentes. Esse é o tipo de agrupamento válido em sistemática filogenética.`,
  };
}

// ─── MRCA pair ───────────────────────────────────────────────────────────────

function pickMrcaPair(leaves: string[]): [string, string] {
  const shuffled = shuffle(leaves);
  return [shuffled[0], shuffled[1]];
}

// ─── Gerador principal ───────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SIZE: Record<Difficulty, [number, number]> = {
  easy: [5, 7],
  medium: [8, 11],
  hard: [12, 16],
};

export function generateTree(moduleId: string, difficulty: Difficulty = 'easy'): GeneratedTree | null {
  const moduleData = getModuleData(moduleId);
  if (!moduleData) return null;

  const [minSize, maxSize] = DIFFICULTY_SIZE[difficulty];
  const size = randomBetween(minSize, Math.min(maxSize, moduleData.taxa.length));

  const selectedTaxa = pick(moduleData.taxa, size);
  const taxonIds = shuffle(selectedTaxa.map((t) => t.id));

  const tree = buildRandomTree(taxonIds);
  const allLeaves = collectLeaves(tree);

  // Escolhe aleatoriamente qual tipo de clado vai ser o exercício desta rodada
  // Distribuição: 40% mono, 40% para, 20% poli
  const roll = Math.random();
  let exerciseClade: CladeMetadata | null = null;

  if (roll < 0.4) {
    exerciseClade = buildMonophyleticGroup(tree);
  } else if (roll < 0.8) {
    exerciseClade = buildParaphyleticGroup(tree, allLeaves);
  } else {
    exerciseClade = buildPolyphyleticGroup(allLeaves);
  }

  // Fallback para monofilético se não foi possível construir o tipo sorteado
  if (!exerciseClade) {
    exerciseClade = buildMonophyleticGroup(tree);
  }
  if (!exerciseClade) {
    // árvore muito pequena, cria um clado mínimo
    exerciseClade = {
      members: allLeaves.slice(0, 2),
      type: 'monophyletic',
      explanation: 'Este grupo é monofilético: inclui um ancestral comum e todos os seus descendentes.',
    };
  }

  const availableCharacters = moduleData.characters.filter((c) =>
    c.presentIn.some((id) => taxonIds.includes(id)),
  );

  const newick = `${treeToNewick(tree)};`;

  return {
    newick,
    taxa: selectedTaxa,
    exerciseClade,
    availableCharacters,
    mrcaPair: pickMrcaPair(allLeaves),
  };
}
