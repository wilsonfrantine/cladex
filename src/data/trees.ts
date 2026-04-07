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

// ─── Annelida ────────────────────────────────────────────────────────────────
// Baseado em Struck et al. 2011 (Hickman et al., Princípios Integrados de Zoologia, Fig. 17.1)
// Sipuncula grupo-irmão de Annelida (ambos em Lophotrochozoa).
// Annelida = Chaetopteridae + Pleistoannelida; Pleistoannelida = Errantia + Sedentaria.
// Sedentaria contém Clitellata; Clitellata contém Hirudinida.
// Polychaeta e Oligochaeta são POLIFILÉTICOS nesta filogenia molecular.

const ANNELIDA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Chaetopteridae:  { abbr: 'Pol', color: '#60a5fa' },
  Nereidae:        { abbr: 'Pol', color: '#60a5fa' },
  Glyceridae:      { abbr: 'Pol', color: '#60a5fa' },
  Siboglinidae:    { abbr: 'Pol', color: '#60a5fa' },
  Sabellidae:      { abbr: 'Pol', color: '#60a5fa' },
  Echiuridae:      { abbr: 'Pol', color: '#60a5fa' },
  Naididae:        { abbr: 'Oli', color: '#4ade80' },
  Aeolosomatidae:  { abbr: 'Oli', color: '#4ade80' },
  Lumbricidae:     { abbr: 'Oli', color: '#4ade80' },
  Acanthobdellida: { abbr: 'Hir', color: '#f87171' },
  Branchiobdellida:{ abbr: 'Hir', color: '#f87171' },
  Hirudinea:       { abbr: 'Hir', color: '#f87171' },
};

// Topologia corrigida:
// Annelida = (Chaetopteridae, Pleistoannelida)
// Pleistoannelida = (Errantia, Sedentaria)
// Sedentaria = ((Siboglinidae,Sabellidae),(Echiuridae,Clitellata))
//   → Echiuridae é grupo-irmão de Clitellata; juntos são irmãos de (Siboglinidae+Sabellidae)
const ANNELIDA_NEWICK =
  '(Chaetopteridae,((Nereidae,Glyceridae)Errantia,((Siboglinidae,Sabellidae),(Echiuridae,(Naididae,(Aeolosomatidae,(Lumbricidae,(Acanthobdellida,(Branchiobdellida,Hirudinea))Hirudinida)))Clitellata))Sedentaria)Pleistoannelida);';

const annelidaTrees: CuratedTree[] = [
  {
    id: 'annelida-struck-2011',
    label: 'Annelida — Struck et al. 2011',
    moduleId: 'annelida',
    newick: ANNELIDA_NEWICK,
    source: 'Struck et al. 2011; Hickman et al., Fig. 17.1',
    taxonAnnotations: ANNELIDA_TRADITIONAL,
    clades: [
      {
        id: 'polychaeta-poli',
        taxaInGroup: ['Nereidae', 'Glyceridae', 'Siboglinidae', 'Sabellidae', 'Echiuridae'],
        type: 'polyphyletic',
        traditionalGroupContext: 'Polychaeta',
        explanation:
          '**Polychaeta** é **polifilético**: Nereidae e Glyceridae pertencem a Errantia, enquanto Siboglinidae, Sabellidae e Echiuridae estão em Sedentaria. O ancestral comum mais recente de todos eles engloba também os oligoquetos e as sanguessugas. Os poliquetos são definidos por caracteres plesiomórficos (parapódios birramosos, cerdas), não por sinapomorfias exclusivas.',
      },
      {
        id: 'oligochaeta-para',
        taxaInGroup: ['Naididae', 'Aeolosomatidae', 'Lumbricidae'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Oligochaeta',
        explanation:
          '**Oligochaeta** é **parafilético**: Naididae, Aeolosomatidae e Lumbricidae compartilham o ancestral comum de Clitellata com Hirudinida (sanguessugas), que foi excluída do agrupamento. A ausência de parapódios é uma plesiomorfia de Clitellata, não uma sinapomorfia exclusiva dos oligoquetos.',
      },
      {
        id: 'hirudinida-mono',
        taxaInGroup: ['Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
        type: 'monophyletic',
        traditionalGroupContext: 'Hirudinida',
        explanation:
          '**Hirudinida** é **monofilético**: Acanthobdellida, Branchiobdellida e Hirudinea compartilham um ancestral exclusivo. Sinapomorfias do clado: ânulos superficiais, ventosa posterior, paredes septais reduzidas e número reduzido de cerdas. Branchiobdellida e Hirudinea compartilham ainda perda de cerdas e ventosa anterior.',
        characters: [
          {
            character: 'Ventosa posterior muscular',
            taxaWithCharacter: ['Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
            originNode: 'Hirudinida',
            type: 'sinapomorfia',
            explanation: 'A ventosa posterior é uma **sinapomorfia de Hirudinida**: presente em Acanthobdellida, Branchiobdellida e Hirudinea, ausente nos demais anelídeos. Função: fixação ao substrato ou ao hospedeiro durante a alimentação.',
          },
        ],
        leafHints: [
          {
            hiddenLeaf: 'Hirudinea',
            hints: [
              'Coeloma completamente reduzido — substituído por tecido parenquimatoso',
              'Exatamente 34 segmentos em todos os membros do grupo',
              'Produz hirudina, o anticoagulante natural mais potente conhecido, usado em microcirurgia',
            ],
            cardLabel: 'Sanguessugas (Hirudinea)',
          },
        ],
      },
      {
        id: 'clitellata-mono',
        taxaInGroup: ['Naididae', 'Aeolosomatidae', 'Lumbricidae', 'Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
        type: 'monophyletic',
        explanation:
          '**Clitellata** é **monofilético**: inclui todos os anelídeos com clitelo — oligoquetos e sanguessugas. Sinapomorfias: clitelo, hermafroditismo, desenvolvimento direto, sistema reprodutivo distinto (fixo) e perda de parapódios.',
        characters: [
          {
            character: 'Clitelo — região glandular espessada para formação do casulo',
            taxaWithCharacter: ['Naididae', 'Aeolosomatidae', 'Lumbricidae', 'Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
            originNode: 'Clitellata',
            type: 'sinapomorfia',
            explanation: 'O clitelo é a **sinapomorfia diagnóstica de Clitellata**: presente em todos os membros do clado (minhocas, Tubifex, sanguessugas). É a estrutura glandular que produz o casulo para proteção dos ovos fertilizados. Ausente nos poliquetos basais.',
          },
        ],
      },
      {
        id: 'errantia-mono',
        taxaInGroup: ['Nereidae', 'Glyceridae'],
        type: 'monophyletic',
        explanation:
          '**Errantia** é **monofilético**: Nereidae e Glyceridae são unidos por 2 pares de olhos multicelulares, antena lateral e palpos sólidos. São os poliquetos de vida livre, errantes — daí o nome.',
      },
      {
        id: 'sedentaria-sem-clitellata-para',
        taxaInGroup: ['Siboglinidae', 'Sabellidae', 'Echiuridae'],
        type: 'paraphyletic',
        explanation:
          'Siboglinidae, Sabellidae e Echiuridae são **parafiléticos**: (Siboglinidae+Sabellidae) é grupo-irmão de (Echiuridae+Clitellata), ou seja, o ancestral comum desses três poliquetas é também ancestral de toda Clitellata (oligoquetos + sanguessugas), que foi excluída. Echiuridae está mais proximamente relacionado às minhocas e sanguessugas do que aos demais poliquetas.',
      },
      {
        id: 'chaetopteridae-annelida-para',
        taxaInGroup: ['Chaetopteridae', 'Siboglinidae', 'Sabellidae', 'Echiuridae', 'Nereidae', 'Glyceridae'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Polychaeta',
        explanation:
          '**Polychaeta** incluindo Chaetopteridae é **polifilético**: Chaetopteridae é outgroup de todo Pleistoannelida (Errantia + Sedentaria), Nereidae e Glyceridae estão em Errantia, e Siboglinidae, Sabellidae, Echiuridae estão em Sedentaria. Os poliquetos aparecem em três posições independentes na árvore — não há ancestral exclusivo que os una.',
      },
    ],
  },
];

// ─── Chordata Basal ───────────────────────────────────────────────────────────
// Baseado em Delsuc et al. 2006 (Nature) e Hickman et al. 2022, Cap. 23–24.
// Urochordata (Tunicata) como grupo-irmão de Vertebrata — posição molecular.
// Cephalochordata basal em relação a Olfactores (Urochordata + Vertebrata).
// Hemichordata como outgroup de Chordata.

const CHORDATA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Cephalochordata: { abbr: 'Protoc.', color: '#60a5fa' },
  Urochordata:     { abbr: 'Protoc.', color: '#60a5fa' },
  Myxini:          { abbr: 'Agnat.',  color: '#4ade80' },
  Petromyzontida:  { abbr: 'Agnat.',  color: '#4ade80' },
};

const chordataTrees: CuratedTree[] = [
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
        explanation:
          '**Agnatha** (vertebrados sem mandíbula) é um grupo **parafilético**: nesta hipótese clássica, Petromyzontida (lampreias) compartilha um ancestral mais recente com Gnathostomata do que com Myxini (feiticeiras). O agrupamento exclui os mandibulados, sendo definido pela ausência de mandíbulas (plesiomorfia), não por sinapomorfias exclusivas.',
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
        explanation:
          '**Ambulacraria** (Hemichordata + Echinodermata) é um clado monofilético sustentado por dados moleculares e semelhanças nas larvas (dipleurula). Embora Hemichordata tenha fendas faringeanas como os cordados, ele é mais próximo dos equinodermos.',
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

// ─── Amniota ──────────────────────────────────────────────────────────────────
// Baseado em Gauthier et al. 1988; Lee 2013; Hickman et al. 2022, Cap. 25–28.
// Sauropsida = Lepidosauria (Squamata) + Archelosauria (Testudines + Archosauria).
// Archosauria = Crocodilia + Aves. Mammalia é grupo-irmão de Sauropsida.
// "Reptilia" tradicional (excluindo Aves) é PARAFILÉTICO.

const AMNIOTA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Squamata:   { abbr: 'Rep', color: '#a3e635' },
  Testudines: { abbr: 'Rep', color: '#a3e635' },
  Crocodilia: { abbr: 'Rep', color: '#a3e635' },
};

const amniota_newick =
  '(Amphibia,(Mammalia,(Squamata,(Testudines,(Crocodilia,Aves)Archosauria)Archelosauria)Sauropsida)Amniota);';

const amniota_trees: CuratedTree[] = [
  {
    id: 'amniota-geral',
    label: 'Amniota — relações dos tetrápodos',
    moduleId: 'amniota',
    newick: amniota_newick,
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

// ─── Arthropoda ───────────────────────────────────────────────────────────────
// Baseado em Regier et al. 2010 (Nature); Giribet & Edgecombe 2012.
// Mandibulata = Myriapoda + Pancrustacea; Pancrustacea = Crustacea + Hexapoda.
// "Crustacea" tradicional (sem Insecta) é PARAFILÉTICO — Insecta é grupo-irmão
// de Malacostraca (Regier et al. 2010), portanto aninhado dentro de Crustacea.

const ARTHROPODA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Crustacea: { abbr: 'Cru', color: '#fb923c' },
  Insecta:   { abbr: 'Cru', color: '#fb923c' },
};

const arthropoda_trees: CuratedTree[] = [
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

// ─── Invertebrados Gerais ─────────────────────────────────────────────────────
// Baseado em Halanych 2004; Dunn et al. 2008; Hickman et al. 2022, Cap. 9–10.
// Ecdysozoa e Lophotrochozoa como clados de Protostomia.
// Porifera basal; Cnidaria sister de Bilateria.
const invertebradosTrees: CuratedTree[] = [
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

// ─── Índice geral ─────────────────────────────────────────────────────────────

export const allTrees: CuratedTree[] = [
  ...annelidaTrees,
  ...chordataTrees,
  ...amniota_trees,
  ...arthropoda_trees,
  ...invertebradosTrees,
];

export function getTreesByModule(moduleId: string): CuratedTree[] {
  return allTrees.filter((t) => t.moduleId === moduleId);
}

export function getRandomTree(moduleId: string): CuratedTree | null {
  const trees = getTreesByModule(moduleId);
  if (!trees.length) return null;
  return trees[Math.floor(Math.random() * trees.length)];
}

export function getRandomClade(tree: CuratedTree): ExerciseClade | null {
  if (!tree.clades.length) return null;
  return tree.clades[Math.floor(Math.random() * tree.clades.length)];
}
