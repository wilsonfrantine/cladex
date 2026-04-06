export type CladeType = 'monophyletic' | 'paraphyletic' | 'polyphyletic';

export interface ExerciseClade {
  id: string;
  taxaInGroup: string[]; // leaf names (must match Newick exactly)
  type: CladeType;
  explanation: string;
  /** Quando presente, o exercício contextualiza o grupo tradicional (ex: 'Polychaeta') */
  traditionalGroupContext?: string;
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
      },
      {
        id: 'clitellata-mono',
        taxaInGroup: ['Naididae', 'Aeolosomatidae', 'Lumbricidae', 'Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
        type: 'monophyletic',
        explanation:
          '**Clitellata** é **monofilético**: inclui todos os anelídeos com clitelo — oligoquetos e sanguessugas. Sinapomorfias: clitelo, hermafroditismo, desenvolvimento direto, sistema reprodutivo distinto (fixo) e perda de parapódios.',
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

const chordataTrees: CuratedTree[] = [
  {
    id: 'chordata-basal-geral',
    label: 'Chordata Basal — relações gerais',
    moduleId: 'chordata-basal',
    newick:
      '(Hemichordata,(Cephalochordata,(Urochordata,(Myxini,(Petromyzontida,(Chondrichthyes,Actinopterygii)Gnathostomata)Vertebrata)Olfactores)));',
    source: 'Delsuc et al. 2006; Hickman et al. 2022',
    clades: [
      {
        id: 'gnathostomata-mono',
        taxaInGroup: ['Chondrichthyes', 'Actinopterygii'],
        type: 'monophyletic',
        explanation:
          '**Gnathostomata** (vertebrados com mandíbula) é um clado monofilético. A sinapomorfia é a **mandíbula articulada**, derivada de arcos branquiais anteriores. Chondrichthyes (tubarões e raias) e Actinopterygii (peixes ósseos de nadadeiras raiadas) são representantes dos dois grandes grupos de gnatostomados aquáticos.',
      },
      {
        id: 'agnatha-para',
        taxaInGroup: ['Myxini', 'Petromyzontida'],
        type: 'paraphyletic',
        explanation:
          '**Agnatha** (vertebrados sem mandíbula) é um grupo **parafilético**: Myxini e Petromyzontida compartilham o ancestral com Gnathostomata, que foi excluída do agrupamento. A **ausência de mandíbula** é uma plesiomorfia — caráter primitivo retido, não uma sinapomorfia que os una exclusivamente.',
      },
      {
        id: 'vertebrata-mono',
        taxaInGroup: ['Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
        type: 'monophyletic',
        explanation:
          '**Vertebrata** é um clado monofilético que inclui todos os vertebrados, com ou sem mandíbula. As sinapomorfias incluem **crânio** (cartilaginoso ou ósseo) e **coluna vertebral** (ou notocorda persistente em Myxini).',
      },
      {
        id: 'olfactores-mono',
        taxaInGroup: ['Urochordata', 'Myxini', 'Petromyzontida', 'Chondrichthyes', 'Actinopterygii'],
        type: 'monophyletic',
        explanation:
          '**Olfactores** (Urochordata + Vertebrata) é um resultado surpreendente da filogenia molecular (Delsuc et al. 2006): os tunicados são os parentes vivos **mais próximos dos vertebrados**, não o anfioxo. O nome vem de estruturas olfativas compartilhadas. Este grupo é monofilético.',
      },
      {
        id: 'hemichordata-cephalochordata-poli',
        taxaInGroup: ['Hemichordata', 'Cephalochordata'],
        type: 'polyphyletic',
        explanation:
          'Hemichordata e Cephalochordata são um grupo **polifilético** nesta hipótese: estão em ramos muito distantes. O ancestral comum mais recente deles inclui também Urochordata e todos os Vertebrata. Morfologicamente ambos têm fendas faringeanas, mas isso é plesiomorfia, não sinapomorfia exclusiva.',
      },
      {
        id: 'hemichordata-urochordata-para',
        taxaInGroup: ['Hemichordata', 'Cephalochordata', 'Urochordata'],
        type: 'paraphyletic',
        explanation:
          'Este grupo de "protocordados" é **parafilético**: o ancestral comum de Hemichordata, Cephalochordata e Urochordata é também ancestral de todos os Vertebrata, que foram excluídos. "Protochordata" é um agrupamento de conveniência didática, não um clado natural.',
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
      },
      {
        id: 'amniota-mono',
        taxaInGroup: ['Mammalia', 'Squamata', 'Testudines', 'Crocodilia', 'Aves'],
        type: 'monophyletic',
        explanation:
          '**Amniota** é **monofilético**: todos os tetrápodos que produzem ovos amnióticos (ou retêm o âmnio internamente). A sinapomorfia é o **âmnio**, membrana extra-embrionária que envolve o embrião em líquido. Inclui répteis, aves e mamíferos.',
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
      },
      {
        id: 'mandibulata-mono',
        taxaInGroup: ['Myriapoda', 'Crustacea', 'Insecta'],
        type: 'monophyletic',
        explanation:
          '**Mandibulata** (Myriapoda + Pancrustacea) é **monofilético**: definido pela presença de **mandíbulas** verdadeiras e antenas. Evidências moleculares e morfológicas unem esses três grupos em oposição a Chelicerata, que tem quelíceras em lugar de mandíbulas.',
      },
      {
        id: 'pancrustacea-mono',
        taxaInGroup: ['Crustacea', 'Insecta'],
        type: 'monophyletic',
        explanation:
          '**Pancrustacea** (Crustacea + Insecta) é **monofilético** e um dos resultados mais surpreendentes da filogenia molecular de artrópodos. Os insetos estão mais proximamente relacionados aos crustáceos do que às centopeias. Sinapomorfias incluem olhos compostos com estrutura específica e neuromorfologia do protocerebro.',
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
    id: 'invertebrados-geral',
    label: 'Invertebrados — árvore dos grandes filos',
    moduleId: 'invertebrados-gerais',
    newick:
      '(Porifera,(Cnidaria,(((Platyhelminthes,(Mollusca,Annelida))Lophotrochozoa,(Nematoda,Arthropoda)Ecdysozoa)Protostomia,Echinodermata)Bilateria));',
    source: 'Hickman et al. 2022; Halanych 2004; Dunn et al. 2008',
    clades: [
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
      },
      {
        id: 'ecdysozoa-mono',
        taxaInGroup: ['Nematoda', 'Arthropoda'],
        type: 'monophyletic',
        explanation:
          '**Ecdysozoa** é um clado monofilético de Protostomia definido pela sinapomorfia da **ecdise** (muda cuticular). Nematoda e Arthropoda, apesar de morfologias muito distintas, compartilham essa característica molecular e ultraestrutural.',
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
