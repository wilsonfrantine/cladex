
import { TREE_OF_LIFE } from '../src/data/treeoflife.ts';
import { TAXA_CARDS_BY_TAXON } from '../src/data/cards/index.ts';

/**
 * Script de integridade de dados do Cladex.
 * Verifica se todos os nós que deveriam ter conteúdo (cards) possuem
 * uma entrada correspondente em taxa-cards.ts.
 */

const missingRequired = [];
const missingStructural = [];
let totalNodes = 0;

function walk(node) {
  totalNodes++;
  const isRequired = node.type === 'card' || node.type === 'placeholder';
  const isStructural = node.type === 'internal' || node.id === 'luca';
  
  const card = node.cardTaxon 
    ? TAXA_CARDS_BY_TAXON[node.cardTaxon.toLowerCase()] || TAXA_CARDS_BY_TAXON[node.name.toLowerCase()]
    : TAXA_CARDS_BY_TAXON[node.name.toLowerCase()];

  if (!card) {
    const info = { id: node.id, name: node.name, rank: node.rank };
    if (isRequired) missingRequired.push(info);
    else if (isStructural) missingStructural.push(info);
  }
  node.children?.forEach(walk);
}

console.log('=== Relatório de Cobertura de Dados ===');
walk(TREE_OF_LIFE);

console.log(`\n\x1b[34m[Estatísticas]\x1b[00m`);
console.log(`Total de nós analisados: ${totalNodes}`);
console.log(`Cards obrigatórios faltando: ${missingRequired.length}`);
console.log(`Nós estruturais sem conteúdo: ${missingStructural.length}`);

if (missingRequired.length > 0) {
  console.log(`\n\x1b[31m✗ Cards OBRIGATÓRIOS Faltando (Quebram a lógica de jogo):\x1b[00m`);
  console.table(missingRequired);
}

if (missingStructural.length > 0) {
  console.log(`\n\x1b[33m⚠ Nós Estruturais sem Card (Exibem "Nó estrutural — sem dados"): \x1b[00m`);
  console.table(missingStructural);
  console.log('\x1b[33mDica: Para eliminar a mensagem, adicione um card para esses táxons em taxa-cards.ts\x1b[00m');
}

if (missingRequired.length === 0 && missingStructural.length === 0) {
  console.log(`\n\x1b[32m✓ Cobertura total! Nenhum nó exibirá mensagem de "sem dados".\x1b[00m`);
}
