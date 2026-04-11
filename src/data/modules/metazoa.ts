// Baseado em Halanych 2004; Dunn et al. 2008; Hickman et al. 2022, Cap. 9–10.
// Ecdysozoa e Lophotrochozoa como clados de Protostomia.
// Porifera basal; Cnidaria sister de Bilateria.

import type { CuratedTree } from '../types';

export const metazoaTrees: CuratedTree[] = [
  {
    id: 'metazoa-geral',
    label: 'Metazoa — principais grupos',
    moduleId: 'metazoa',
    newick:
      '(Porifera,(Cnidaria,(((Platyhelminthes,(Mollusca,Annelida))Lophotrochozoa,(Nematoda,Arthropoda)Ecdysozoa)Protostomia,(Echinodermata,Chordata)Deuterostomia)Bilateria));',
    source: 'Hickman et al. 2022; Halanych 2004; Dunn et al. 2008',
    clades: [
      {
        id: 'deuterostomia-mono',
        taxaInGroup: ['Echinodermata', 'Chordata'],
        type: 'monophyletic',
        explanation:
          '**Deuterostomia** (Echinodermata + Chordata) é um clado monofilético definido pelo desenvolvimento embrionário: o blastóporo dá origem ao ânus (o que dá nome ao grupo) e a clivagem é radial e indeterminada.',
        characters: [
          {
            character: 'Blastóporo origina o ânus; boca é formada secundariamente',
            taxaWithCharacter: ['Echinodermata', 'Chordata'],
            originNode: 'Deuterostomia',
            type: 'sinapomorfia',
            explanation: 'O destino do blastóporo é a **sinapomorfia de Deuterostomia**: o primeiro poro do embrião torna-se o ânus, e a boca se forma depois. Em Protostomia ocorre o contrário. Este critério embriológico unificou Echinodermata e Chordata num clado antes de dados moleculares confirmarem.',
          },
        ],
      },
      {
        id: 'protostomia-para-incompleto',
        taxaInGroup: ['Platyhelminthes', 'Mollusca', 'Annelida', 'Nematoda', 'Arthropoda'],
        type: 'monophyletic',
        explanation:
          '**Protostomia** (Lophotrochozoa + Ecdysozoa) é um clado monofilético. Sinapomorfias incluem o destino do blastóporo (geralmente formando a boca) e o sistema nervoso ventral. É o grupo-irmão de Deuterostomia dentro de Bilateria.',
      },
      {
        id: 'mollusca-annelida-mono',
        taxaInGroup: ['Mollusca', 'Annelida'],
        type: 'monophyletic',
        explanation:
          'Mollusca e Annelida formam um clado monofilético dentro de Lophotrochozoa. A sinapomorfia histórica é a **larva trocófora**, tipo larval compartilhado. Ambos pertencem a Trochozoa, grupo-irmão de Platyhelminthes dentro de Lophotrochozoa.',
      },
      {
        id: 'lophotrochozoa-mono',
        taxaInGroup: ['Platyhelminthes', 'Mollusca', 'Annelida'],
        type: 'monophyletic',
        explanation:
          '**Lophotrochozoa** é um clado monofilético de Protostomia. O nome une dois tipos larvais ancestrais: **lofóforo** (estrutura filtradora de tentáculos) e **larva trocófora**. Evidências moleculares uniram estes grupos que morfologicamente pareciam muito distintos.',
        characters: [
          {
            character: 'Larva trocófora — larva ciliada de vida livre com banda pré-oral de cílios',
            taxaWithCharacter: ['Platyhelminthes', 'Mollusca', 'Annelida'],
            originNode: 'Lophotrochozoa',
            type: 'sinapomorfia',
            explanation: 'A larva trocófora é evidência ancestral de **Lophotrochozoa**: presente (ou derivada dela) em Mollusca e Annelida. Sugere que estes grupos, morfologicamente muito distintos, compartilham um ancestral marinho pelágico.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Mollusca',
            hints: [
              'Corpo mole com pé muscular, manto secretor e rádula para raspar alimento',
              'Grupo com maior diversidade de formas entre os invertebrados: caramujos, polvos, lulas, ostras',
              'Cefalópodos do grupo têm olhos com resolução comparável ao olho humano — evolução convergente',
            ],
            cardLabel: 'Moluscos (Mollusca)',
          },
        ],
      },
      {
        id: 'ecdysozoa-mono',
        taxaInGroup: ['Nematoda', 'Arthropoda'],
        type: 'monophyletic',
        explanation:
          '**Ecdysozoa** é um clado monofilético de Protostomia definido pela sinapomorfia da **ecdise** (muda cuticular). Nematoda e Arthropoda, apesar de morfologias muito distintas, compartilham essa característica molecular e ultraestrutural.',
        characters: [
          {
            character: 'Ecdise — muda periódica da cutícula controlada pelo hormônio ecdisona',
            taxaWithCharacter: ['Nematoda', 'Arthropoda'],
            originNode: 'Ecdysozoa',
            type: 'sinapomorfia',
            explanation: 'A ecdise é a **sinapomorfia molecular de Ecdysozoa**: o gene receptor de ecdisona é compartilhado por Nematoda e Arthropoda. A muda permite crescimento em animais com cutícula rígida. A descoberta deste clado (Aguinaldo et al. 1997) derrubou a "Articulata" de Cuvier.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Nematoda',
            hints: [
              'Corpo cilíndrico com cutícula de colágeno trilaminar — trocada 4 vezes durante o desenvolvimento',
              'C. elegans: único animal com mapa completo de conexões neurais (302 neurônios, 7.000 sinapses)',
              'Até 4,4 milhões de indivíduos por m² de solo — o grupo animal multicelular mais abundante',
            ],
            cardLabel: 'Nematódeos (Nematoda)',
          },
        ],
      },
      {
        id: 'articulata-poli',
        taxaInGroup: ['Annelida', 'Arthropoda'],
        type: 'polyphyletic',
        explanation:
          'Este é um caso histórico clássico: a **"Articulata" de Cuvier** reunia anelídeos e artrópodos pela segmentação do corpo. Hoje sabemos que a segmentação é uma **analogia** (convergência), não homologia. Annelida está em Lophotrochozoa e Arthropoda em Ecdysozoa — a "Articulata" é polifilética.',
      },
      {
        id: 'cnidaria-porifera-poli',
        taxaInGroup: ['Cnidaria', 'Porifera'],
        type: 'polyphyletic',
        explanation:
          'Porifera e Cnidaria são um grupo **polifilético**: Porifera é grupo-irmão de todos os Eumetazoa (animais com tecidos verdadeiros), enquanto Cnidaria é grupo-irmão de Bilateria. Seu ancestral comum mais recente inclui todos os animais.',
      },
      {
        id: 'nematoda-platyhelminthes-para',
        taxaInGroup: ['Nematoda', 'Platyhelminthes'],
        type: 'paraphyletic',
        explanation:
          'Nematoda e Platyhelminthes formam um grupo **parafilético**: seu ancestral comum (Protostomia) também é ancestral de Mollusca, Annelida e Arthropoda, que foram excluídos. Historicamente agrupados como "vermes", esses filos pertencem a superfilos distintos (Ecdysozoa e Lophotrochozoa).',
      },
    ],
  },
];
