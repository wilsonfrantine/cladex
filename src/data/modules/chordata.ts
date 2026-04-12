// Baseado em Delsuc et al. 2006 (Nature) e Hickman et al. 2022, Cap. 23–24.
// Urochordata (Tunicata) como grupo-irmão de Vertebrata — posição molecular.
// Cephalochordata basal em relação a Olfactores (Urochordata + Vertebrata).
// Hemichordata como outgroup de Chordata.

import type { CuratedTree } from '../types';

const CHORDATA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Cephalochordata: { abbr: 'Protoc.', color: '#60a5fa' },
  Urochordata:     { abbr: 'Protoc.', color: '#60a5fa' },
  Myxini:          { abbr: 'Agnat.',  color: '#4ade80' },
  Petromyzontida:  { abbr: 'Agnat.',  color: '#4ade80' },
};

export const chordataTrees: CuratedTree[] = [
  {
    id: 'chordata-basal-geral',
    label: 'Chordata Basal — relações gerais',
    moduleId: 'chordata-basal',
    newick:
      '((Hemichordata,Echinodermata)Ambulacraria,(Cephalochordata,(Urochordata,(Myxini,(Petromyzontida,(Chondrichthyes,Actinopterygii)Gnathostomata)Vertebrata)))Chordata);',
    source: 'Delsuc et al. 2006; Hickman et al. 2022',
    taxonAnnotations: CHORDATA_TRADITIONAL,
    clades: [
      {
        id: 'protochordata-para',
        taxaInGroup: ['Cephalochordata', 'Urochordata'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Protochordata',
        explanation:
          '**Protochordata** (Cephalochordata + Urochordata) é um grupo **parafilético**: o ancestral comum desses dois grupos é também o ancestral de todos os Vertebrata, que foram excluídos. "Protochordata" é um agrupamento de conveniência didática para descrever cordados sem crânio ou coluna vertebral.',
        characters: [
          {
            character: 'Ausência de crânio e coluna vertebral — notocorda persiste como único eixo de suporte',
            taxaWithCharacter: ['Cephalochordata', 'Urochordata'],
            originNode: 'Chordata',
            type: 'simplesiomorfia',
            explanation: 'A ausência de crânio e vértebras em Cephalochordata e Urochordata é uma **simplesiomorfia de Chordata**: o estado ancestral do filo antes da inovação do crânio e das vértebras em Vertebrata. Não é uma sinapomorfia exclusiva de "Protochordata" — apenas retêm a condição primitiva.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Urochordata',
            hints: [
              'Adultos sésseis com aspecto de "saco" — a notocorda existe apenas na larva nadadora',
              'Cobre-se de uma túnica de tunicina (celulose animal) — único caso nos Deuterostomia',
              'Filogenia molecular: grupo-irmão dos Vertebrata (Olfactores), apesar da aparência de "invertebrado"',
            ],
            cardLabel: 'Tunicados (Urochordata)',
            dragDrop: true,
          },
        ],
      },
      {
        id: 'chordata-mono',
        taxaInGroup: ['Cephalochordata', 'Urochordata', 'Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
        type: 'monophyletic',
        explanation:
          '**Chordata** é um clado monofilético. Suas sinapomorfias exclusivas (ao menos na fase larval) são: **notocorda**, **cordão nervoso dorsal oco**, **fendas faringeanas**, **endóstilo** (ou glândula tireoide) e **cauda pós-anal muscular**.',
        characters: [
          {
            character: 'Notocorda — eixo de sustentação dorsal flexível (ao menos na fase larval)',
            taxaWithCharacter: ['Cephalochordata', 'Urochordata', 'Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
            originNode: 'Chordata',
            type: 'sinapomorfia',
            explanation: 'A notocorda é a **sinapomorfia fundacional de Chordata**: todos os membros do clado possuem a notocorda ao menos durante a fase embrionária. Em vertebrados adultos é substituída pelas vértebras, mas persiste como núcleo pulposo dos discos intervertebrais.',
          },
          {
            character: 'Fendas faringeanas — aberturas laterais na faringe presentes ao menos no embrião',
            taxaWithCharacter: ['Cephalochordata', 'Urochordata', 'Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
            originNode: 'Chordata',
            type: 'sinapomorfia',
            explanation: 'As fendas faringeanas são uma **sinapomorfia de Chordata**: em Cephalochordata e Urochordata adultos funcionam para filtrar alimento; em vertebrados aquáticos tornam-se fendas branquiais; em vertebrados terrestres se transformam em estruturas como ossos do ouvido médio e tubas de Eustáquio durante o desenvolvimento embrionário.',
          },
        ],
      },
      {
        id: 'agnatha-para',
        taxaInGroup: ['Myxini', 'Petromyzontida'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Agnatha',
        proximityQuestions: [
          {
            targetTaxon: 'Petromyzontida',
            closer: 'Chondrichthyes',
            farther: 'Myxini',
            explanation: '**Chondrichthyes** é mais próximo de **Petromyzontida**: lampreias e tubarões compartilham o clado Vertebrata sem Myxini. **Myxini** é o grupo mais basal de Vertebrata — o MRCA de Petromyzontida + Myxini é a raiz de Vertebrata, enquanto o MRCA de Petromyzontida + Chondrichthyes é apenas a raiz do clado Petromyzontida + Gnathostomata.',
          },
          {
            targetTaxon: 'Actinopterygii',
            closer: 'Chondrichthyes',
            farther: 'Petromyzontida',
            explanation: '**Chondrichthyes** é mais próximo de **Actinopterygii**: ambos são **Gnathostomata** (vertebrados com mandíbula), formando um clado exclusivo. O MRCA de Actinopterygii + Chondrichthyes é a raiz de Gnathostomata; o MRCA com Petromyzontida é a raiz de todo Vertebrata excluindo Myxini — um nó mais antigo.',
          },
        ],
        explanation:
          '**Agnatha** (vertebrados sem mandíbula) é um grupo **parafilético**: nesta hipótese clássica, Petromyzontida (lampreias) compartilha um ancestral mais recente com Gnathostomata do que com Myxini (feiticeiras). O agrupamento exclui os mandibulados, sendo definido pela ausência de mandíbulas (plesiomorfia), não por sinapomorfias exclusivas.',
        sisterGroupQuestions: [
          {
            targetTaxon: 'Petromyzontida',
            correctSister: 'Gnathostomata',
            explanation: '**Gnathostomata** é o grupo-irmão de **Petromyzontida**: juntos formam o clado de vertebrados com crânio excluindo Myxini, dentro de Vertebrata. Petromyzontida (lampreias) está mais próxima dos tubarões e peixes teleósteos do que das feiticeiras — resultado surpreendente dado seu aspecto primitivo.',
          },
          {
            targetTaxon: 'Urochordata',
            correctSister: 'Vertebrata',
            explanation: '**Vertebrata** é o grupo-irmão de **Urochordata**: juntos formam **Olfactores**. Esta é uma das descobertas mais contraintuitivas da filogenia molecular: os tunicados sésseis são mais próximos dos vertebrados do que os cefalocordados (anfioxos), que morfologicamente parecem mais "vertebradoides".',
          },
        ],
        characters: [
          {
            character: 'Ausência de mandíbulas — boca circular com estruturas córneas ou sugadoras',
            taxaWithCharacter: ['Myxini', 'Petromyzontida'],
            originNode: 'Vertebrata',
            type: 'simplesiomorfia',
            explanation: 'A ausência de mandíbulas em Myxini e Petromyzontida é uma **simplesiomorfia de Vertebrata**: representa o estado ancestral dos vertebrados antes da inovação das mandíbulas em Gnathostomata. Não é sinapomorfia exclusiva de "Agnatha" — esses grupos simplesmente não derivaram esse caráter.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Petromyzontida',
            hints: [
              'Boca circular com ventosa e fileiras de dentes córneos — se fixa a peixes para raspar tecidos',
              'Larva amocete: anos enterrada no sedimento filtrando matéria orgânica, sem olhos funcionais',
              'Migra do rio ao oceano e de volta para reprodução — adulto não come após entrar no rio',
            ],
            cardLabel: 'Lampreias (Petromyzontida)',
          },
        ],
      },
      {
        id: 'vertebrata-mono',
        taxaInGroup: ['Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
        type: 'monophyletic',
        explanation:
          '**Vertebrata** é um clado monofilético que inclui todos os vertebrados, com ou sem mandíbula. As sinapomorfias incluem **crânio** (cartilaginoso ou ósseo) e elementos esqueléticos que protegem o cordão nervoso.',
        characters: [
          {
            character: 'Crânio que encapsula e protege o encéfalo',
            taxaWithCharacter: ['Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
            originNode: 'Vertebrata',
            type: 'sinapomorfia',
            explanation: 'O crânio (caixa craniana) é a **sinapomorfia de Vertebrata**: cartilaginoso em Myxini e Chondrichthyes, ósseo nos demais. Os não-vertebrados (Cephalochordata, Urochordata) possuem notocorda mas não crânio.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Myxini',
            hints: [
              'Sem mandíbulas, sem escamas, sem vértebras verdadeiras',
              'Produz muco em quantidade extraordinária como defesa — pode sufocar predadores',
              'Único vertebrado com crânio mas sem coluna vertebral funcional',
            ],
            cardLabel: 'Feiticeiras (Myxini)',
          },
          {
            hiddenLeaf: 'Actinopterygii',
            hints: [
              'Nadadeiras suportadas por raios ósseos finos e flexíveis — sem membros lobados carnosos',
              'Bexiga natatória: câmara de gás derivada dos pulmões ancestrais, usada para controle de flutuação',
              '~33.000 espécies — mais da metade de todos os vertebrados vivos, do abisso marinho a rios de altitude',
            ],
            cardLabel: 'Peixes de nadadeiras raiadas (Actinopterygii)',
          },
        ],
      },
      {
        id: 'ambulacraria-mono',
        taxaInGroup: ['Hemichordata', 'Echinodermata'],
        type: 'monophyletic',
        proximityQuestions: [
          {
            targetTaxon: 'Hemichordata',
            closer: 'Echinodermata',
            farther: 'Cephalochordata',
            explanation: '**Echinodermata** é mais próximo de **Hemichordata**: juntos formam **Ambulacraria**, sustentada pela quase-identidade das larvas (tornaria ≈ bipinaria). Cephalochordata está em Chordata — o MRCA de Hemichordata + Cephalochordata é a raiz de Deuterostomia, muito mais antigo.',
          },
          {
            targetTaxon: 'Urochordata',
            closer: 'Myxini',
            farther: 'Cephalochordata',
            explanation: '**Myxini** é mais próximo de **Urochordata** do que **Cephalochordata**: Urochordata + Vertebrata (incluindo Myxini) formam **Olfactores**. Cephalochordata é o grupo-irmão de todo Olfactores — paradoxalmente, qualquer vertebrado está mais próximo dos tunicados do que os anfioxos estão.',
          },
        ],
        explanation:
          '**Ambulacraria** (Hemichordata + Echinodermata) é um clado monofilético sustentado por dados moleculares e semelhanças nas larvas (dipleurula). Embora Hemichordata tenha fendas faringeanas como os cordados, ele é mais próximo dos equinodermos.',
        sisterGroupQuestions: [
          {
            targetTaxon: 'Hemichordata',
            correctSister: 'Echinodermata',
            explanation: '**Echinodermata** é o grupo-irmão de **Hemichordata**: juntos formam **Ambulacraria**. Embora Hemichordata possua fendas faringeanas (como cordados), a filogenia molecular e a semelhança das larvas (tornaria ≈ bipinaria) confirmam parentesco com estrelas-do-mar e ouriços — não com Chordata.',
          },
          {
            targetTaxon: 'Ambulacraria',
            correctSister: 'Chordata',
            explanation: '**Chordata** é o grupo-irmão de **Ambulacraria**: juntos formam **Deuterostomia**. O ancestral comum de equinodermos, hemicordados e cordados compartilhou o destino embrionário do blastóporo (→ ânus) — sinapomorfia de Deuterostomia.',
          },
        ],
        characters: [
          {
            character: 'Larva dipleurula — larva cilíada com bandas de cílios específicas e celoma tripartido',
            taxaWithCharacter: ['Hemichordata', 'Echinodermata'],
            originNode: 'Ambulacraria',
            type: 'sinapomorfia',
            explanation: 'A larva dipleurula é a **sinapomorfia de Ambulacraria**: em Echinodermata é representada pela bipinaria (estrelas) ou auricularia (holotúrias); em Hemichordata pela larva tornaria. A quase identidade morfológica dessas larvas foi o primeiro indício do parentesco entre os dois filos.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Hemichordata',
            hints: [
              'Probóscide anterior musculosa para escavar sedimentos; corpo dividido em probóscide, colar e tronco',
              'Possui fendas faringeanas homólogas às dos cordados — mas é deuterostômio não-cordado',
              'Larva tornaria morfologicamente idêntica à larva bipinaria dos equinodermos',
            ],
            cardLabel: 'Hemicordados (Hemichordata)',
          },
        ],
      },
    ],
  },
];
