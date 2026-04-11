// Baseado em Regier et al. 2010 (Nature); Giribet & Edgecombe 2012.
// Mandibulata = Myriapoda + Pancrustacea; Pancrustacea = Crustacea + Hexapoda.
// "Crustacea" tradicional (sem Insecta) é PARAFILÉTICO — Insecta é grupo-irmão
// de Malacostraca (Regier et al. 2010), portanto aninhado dentro de Crustacea.

import type { CuratedTree } from '../types';

const ARTHROPODA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Crustacea: { abbr: 'Cru', color: '#fb923c' },
  Insecta:   { abbr: 'Cru', color: '#fb923c' },
};

export const arthropodaTrees: CuratedTree[] = [
  {
    id: 'arthropoda-geral',
    label: 'Arthropoda — filogenia dos grandes grupos',
    moduleId: 'arthropoda',
    newick:
      '(Onychophora,(Chelicerata,(Myriapoda,(Crustacea,Insecta)Pancrustacea)Mandibulata));',
    source: 'Regier et al. 2010; Giribet & Edgecombe 2012; Hickman et al. 2022',
    taxonAnnotations: ARTHROPODA_TRADITIONAL,
    clades: [
      {
        id: 'arthropoda-mono',
        taxaInGroup: ['Chelicerata', 'Myriapoda', 'Crustacea', 'Insecta'],
        type: 'monophyletic',
        explanation:
          '**Arthropoda** (excluindo o outgroup Onychophora) é **monofilético**: o clado inclui todos os animais com exoesqueleto articulado quitinoso. Sinapomorfias: apêndices articulados, exoesqueleto quitinoso com ecdise e sistema nervoso ganglionar.',
        leafHints: [
          {
            hiddenLeaf: 'Chelicerata',
            hints: [
              'Apêndices anteriores em forma de pinça (quelíceras) — sem mandíbulas e sem antenas',
              'Corpo dividido em prosossoma e opistossoma (não em cabeça–tórax–abdômen)',
              'Inclui aranhas, escorpiões, ácaros e o caranguejo-ferradura (fóssil vivo)',
            ],
            cardLabel: 'Quelicerados (Chelicerata)',
          },
        ],
      },
      {
        id: 'mandibulata-mono',
        taxaInGroup: ['Myriapoda', 'Crustacea', 'Insecta'],
        type: 'monophyletic',
        explanation:
          '**Mandibulata** (Myriapoda + Pancrustacea) é **monofilético**: definido pela presença de **mandíbulas** verdadeiras e antenas. Evidências moleculares e morfológicas unem esses três grupos em oposição a Chelicerata, que tem quelíceras em lugar de mandíbulas.',
        characters: [
          {
            character: 'Mandíbulas verdadeiras e antenas sensoriais',
            taxaWithCharacter: ['Myriapoda', 'Crustacea', 'Insecta'],
            originNode: 'Mandibulata',
            type: 'sinapomorfia',
            explanation: 'Mandíbulas e antenas são **sinapomorfias de Mandibulata**: ausentes em Chelicerata (que têm quelíceras) e em Onychophora (que têm lobopódios não articulados). As antenas funcionam como órgãos multimodais: olfato, tato, vibração.',
          },
        ],
      },
      {
        id: 'pancrustacea-mono',
        taxaInGroup: ['Crustacea', 'Insecta'],
        type: 'monophyletic',
        explanation:
          '**Pancrustacea** (Crustacea + Insecta) é **monofilético** e um dos resultados mais surpreendentes da filogenia molecular de artrópodos. Os insetos estão mais proximamente relacionados aos crustáceos do que às centopeias. Sinapomorfias incluem olhos compostos com estrutura específica e neuromorfologia do protocerebro.',
        characters: [
          {
            character: 'Protocerebro com neuropila olfativa fusionada (neuromorfologia exclusiva)',
            taxaWithCharacter: ['Crustacea', 'Insecta'],
            originNode: 'Pancrustacea',
            type: 'sinapomorfia',
            explanation: 'A organização específica do protocerebro (lóbulos ópticos, cogumelos de corpos pedunculados) é uma **sinapomorfia neuronal de Pancrustacea**. Myriapoda tem arranjo diferente, o que corrobora que insetos e crustáceos compartilham um ancestral exclusivo.',
          },
        ],
      },
      {
        id: 'crustacea-trad-para',
        taxaInGroup: ['Crustacea'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Crustacea',
        explanation:
          '**Crustacea** tradicional (sem Insecta) é **parafilético**: os insetos estão aninhados dentro de Pancrustacea como grupo-irmão de Malacostraca. Portanto, o ancestral comum de todos os crustáceos é também ancestral dos insetos. A "crustacea" clássica é um grupo de caráter (10 patas, brânquias), não um clado.',
      },
      {
        id: 'chelicerata-crustacea-poli',
        taxaInGroup: ['Chelicerata', 'Crustacea'],
        type: 'polyphyletic',
        explanation:
          'Chelicerata e Crustacea como "artrópodos aquáticos" formam um grupo **polifilético**: Chelicerata está na base de Arthropoda, enquanto Crustacea está em Pancrustacea dentro de Mandibulata. O hábito aquático é uma plesiomorfia e convergência, não sinapomorfia.',
      },
      {
        id: 'hexapoda-myriapoda-poli',
        taxaInGroup: ['Insecta', 'Myriapoda'],
        type: 'polyphyletic',
        explanation:
          '"Traquados" (Insecta + Myriapoda) é um grupo **polifilético**: embora ambos tenham sistema traqueal para respiração aérea, a evidência molecular mostra que a traqueia surgiu **convergentemente**. Insecta está em Pancrustacea (com Crustacea) e Myriapoda é grupo-irmão de Pancrustacea.',
      },
    ],
  },
];
