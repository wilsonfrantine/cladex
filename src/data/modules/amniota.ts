// Baseado em Gauthier et al. 1988; Lee 2013; Hickman et al. 2022, Cap. 25–28.
// Sauropsida = Lepidosauria (Squamata) + Archelosauria (Testudines + Archosauria).
// Archosauria = Crocodilia + Aves. Mammalia é grupo-irmão de Sauropsida.
// "Reptilia" tradicional (excluindo Aves) é PARAFILÉTICO.

import type { CuratedTree } from '../types';

const AMNIOTA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Squamata:   { abbr: 'Rep', color: '#a3e635' },
  Testudines: { abbr: 'Rep', color: '#a3e635' },
  Crocodilia: { abbr: 'Rep', color: '#a3e635' },
};

export const amniota_trees: CuratedTree[] = [
  {
    id: 'amniota-geral',
    label: 'Amniota — relações dos tetrápodos',
    moduleId: 'amniota',
    newick: '(Amphibia,(Mammalia,(Squamata,(Testudines,(Crocodilia,Aves)Archosauria)Archelosauria)Sauropsida)Amniota);',
    source: 'Gauthier et al. 1988; Lee 2013; Hickman et al. 2022',
    taxonAnnotations: AMNIOTA_TRADITIONAL,
    clades: [
      {
        id: 'reptilia-trad-para',
        taxaInGroup: ['Squamata', 'Testudines', 'Crocodilia'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Reptilia',
        explanation:
          '**Reptilia** tradicional (Squamata + Testudines + Crocodilia) é **parafilético**: o ancestral comum desse agrupamento é também ancestral das Aves, que foram excluídas. Crocodilia é grupo-irmão de Aves em Archosauria, não de Squamata ou Testudines. A "reptilidade" é definida por plesiomorfias (ectotermia, escamas), não sinapomorfias exclusivas.',
      },
      {
        id: 'sauropsida-mono',
        taxaInGroup: ['Squamata', 'Testudines', 'Crocodilia', 'Aves'],
        type: 'monophyletic',
        explanation:
          '**Sauropsida** (Squamata + Testudines + Crocodilia + Aves) é **monofilético**: inclui todos os répteis senso lato mais as aves. A sinapomorfia do clado é a fenestra antorbital e detalhes do crânio. Quando Aves é incluída, o grupo torna-se um clado natural.',
      },
      {
        id: 'archosauria-mono',
        taxaInGroup: ['Crocodilia', 'Aves'],
        type: 'monophyletic',
        explanation:
          '**Archosauria** (Crocodilia + Aves) é **monofilético**: crocodilos e pássaros são parentes mais próximos entre si do que com quaisquer outros répteis. Sinapomorfias incluem fenestra antorbital, dentes tecodontes (nos ancestrais) e cuidado parental elaborado. Este é um resultado contraintuitivo mas bem corroborado.',
        characters: [
          {
            character: 'Cuidado parental elaborado com comunicação vocal entre pais e filhotes',
            taxaWithCharacter: ['Crocodilia', 'Aves'],
            originNode: 'Archosauria',
            type: 'sinapomorfia',
            explanation: 'O cuidado parental intenso com comunicação vocal é uma **sinapomorfia comportamental de Archosauria**: crocodilos e aves monitoram os ninhos, respondem a chamados dos filhotes e os transportam. Squamata e Testudines raramente exibem esse comportamento.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Crocodilia',
            hints: [
              'Grupo-irmão das aves — parente vivo mais próximo das aves entre os "répteis"',
              'Coração com 4 câmaras completamente separadas (único entre os répteis)',
              'Cuidado parental ativo: transportam filhotes na boca até a água',
            ],
            cardLabel: 'Crocodilos e jacarés (Crocodilia)',
          },
        ],
      },
      {
        id: 'amniota-mono',
        taxaInGroup: ['Mammalia', 'Squamata', 'Testudines', 'Crocodilia', 'Aves'],
        type: 'monophyletic',
        explanation:
          '**Amniota** é **monofilético**: todos os tetrápodos que produzem ovos amnióticos (ou retêm o âmnio internamente). A sinapomorfia é o **âmnio**, membrana extra-embrionária que envolve o embrião em líquido. Inclui répteis, aves e mamíferos.',
        characters: [
          {
            character: 'Âmnio — membrana extra-embrionária que envolve o embrião em líquido',
            taxaWithCharacter: ['Mammalia', 'Squamata', 'Testudines', 'Crocodilia', 'Aves'],
            originNode: 'Amniota',
            type: 'sinapomorfia',
            explanation: 'O âmnio é a **sinapomorfia de Amniota**: surgiu uma única vez, permitindo reprodução em ambiente terrestre sem dependência de água para o desenvolvimento embrionário. Anfíbios (outgroup) não possuem âmnio — devem retornar à água para reprodução.',
          },
        ],
      },
      {
        id: 'archelosauria-mono',
        taxaInGroup: ['Testudines', 'Crocodilia', 'Aves'],
        type: 'monophyletic',
        explanation:
          '**Archelosauria** (Testudines + Archosauria) é **monofilético**: tartarugas são grupo-irmão de Archosauria, não de Lepidosauria. Dado molecular surpreendente — morfologicamente tartarugas pareciam basais, mas filogenia molecular as posiciona como parentes de crocodilos e pássaros.',
      },
      {
        id: 'ectotherms-poli',
        taxaInGroup: ['Amphibia', 'Squamata', 'Testudines'],
        type: 'polyphyletic',
        explanation:
          'Anfíbios, lagartos/serpentes e quelônios agrupados como "ectotérmicos" formam um grupo **polifilético**: Amphibia é outgroup de Amniota, Squamata está em Lepidosauria, e Testudines está em Archelosauria (mais próxima de Crocodilia e Aves). A ectotermia é um caráter primitivo retido (plesiomorfia), não sinapomorfia.',
      },
    ],
  },
];
