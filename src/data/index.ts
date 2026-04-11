export type * from './types';

import { annelidaTrees }  from './modules/annelida';
import { chordataTrees }  from './modules/chordata';
import { amniota_trees }  from './modules/amniota';
import { arthropodaTrees } from './modules/arthropoda';
import { metazoaTrees }   from './modules/metazoa';
import { modules as taxaModules } from './taxa';
import type { CuratedTree } from './types';

export const allTrees: CuratedTree[] = [
  ...annelidaTrees,
  ...chordataTrees,
  ...amniota_trees,
  ...arthropodaTrees,
  ...metazoaTrees,
];

export function getTreesByModule(moduleId: string): CuratedTree[] {
  return allTrees.filter((t) => t.moduleId === moduleId);
}

export function getRandomTree(moduleId: string): CuratedTree | null {
  const trees = getTreesByModule(moduleId);
  if (!trees.length) return null;
  return trees[Math.floor(Math.random() * trees.length)];
}

export function getRandomClade(tree: CuratedTree) {
  if (!tree.clades.length) return null;
  return tree.clades[Math.floor(Math.random() * tree.clades.length)];
}

// ─── Labels de módulo ─────────────────────────────────────────────────────────
// Fonte primária: taxa.ts (ModuleData.label).
// Exceções mapeadas aqui: IDs que divergem entre os dois arquivos, ou que
// precisam de prefixo de rank taxonômico ('Filo', 'Reino'), ou módulos especiais.
const MODULE_LABEL_OVERRIDES: Record<string, string> = {
  'annelida':      'Filo Annelida',
  'chordata-basal':'Filo Chordata Basal',
  'amniota':       'Amniota — Tetrápodos',
  'arthropoda':    'Filo Arthropoda',
  // 'metazoa' em trees.ts corresponde a 'invertebrados-gerais' em taxa.ts
  'metazoa':       'Reino Metazoa',
  'custom':        'Newick Customizado',
};

export function getModuleLabel(moduleId: string): string {
  if (MODULE_LABEL_OVERRIDES[moduleId]) return MODULE_LABEL_OVERRIDES[moduleId];
  const taxaMod = taxaModules.find((m) => m.id === moduleId);
  return taxaMod?.label ?? moduleId;
}
