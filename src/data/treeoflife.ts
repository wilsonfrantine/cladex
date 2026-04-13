export type TolNodeType = 'internal' | 'card' | 'collapsed' | 'placeholder';

export type TolRank =
  | 'luca'
  | 'domain'
  | 'kingdom'
  | 'supergroup'
  | 'phylum'
  | 'subphylum'
  | 'superclass'
  | 'class'
  | 'subclass'
  | 'superorder'
  | 'order'
  | 'family';

export interface TolNode {
  id: string;
  name: string;
  latinName?: string;
  rank?: TolRank;
  type: TolNodeType;
  children?: TolNode[];
  cardTaxon?: string;
  collapsedLabel?: string;
  collapsedIcon?: string;
  unlockModule?: string;
  unlockMinCorrect?: number;
  speciesCount?: number;
}

interface TolNodeFlat extends Omit<TolNode, 'children'> {
  parentId: string | null;
}

function buildTree(nodes: TolNodeFlat[]): TolNode {
  const map: Record<string, TolNode & { parentId: string | null }> = {};
  for (const n of nodes) map[n.id] = { ...n, children: [] };
  let root!: TolNode;
  for (const node of Object.values(map)) {
    if (node.parentId === null) {
      root = node;
    } else {
      map[node.parentId]?.children!.push(node);
    }
  }
  return root;
}

const TOL_DATA: TolNodeFlat[] = [
  // ── Raiz ────────────────────────────────────────────────────────────────────
  { id: 'luca',             parentId: null,           name: 'LUCA',             rank: 'luca',       type: 'internal',  speciesCount: 2300000 },

  // ── Domínios ─────────────────────────────────────────────────────────────────
  { id: 'bacteria',         parentId: 'luca',         name: 'Bacteria',         rank: 'domain',     type: 'collapsed', collapsedLabel: '~1.000.000 spp',         speciesCount: 1000000 },
  { id: 'archaea',          parentId: 'luca',         name: 'Archaea',          rank: 'domain',     type: 'collapsed', collapsedLabel: '~10.000 spp',            speciesCount: 10000 },
  { id: 'eukarya',          parentId: 'luca',         name: 'Eukarya',          rank: 'domain',     type: 'internal',  speciesCount: 1300000 },

  // ── Reinos de Eukarya ────────────────────────────────────────────────────────
  { id: 'fungi',            parentId: 'eukarya',      name: 'Fungi',            rank: 'kingdom',    type: 'collapsed', collapsedLabel: '150.000 spp',            speciesCount: 150000 },
  { id: 'plantae',          parentId: 'eukarya',      name: 'Plantae',          rank: 'kingdom',    type: 'collapsed', collapsedLabel: '400.000 spp',            speciesCount: 400000 },
  { id: 'protozoa',         parentId: 'eukarya',      name: 'Protozoa',         rank: 'kingdom',    type: 'collapsed', collapsedLabel: '50.000 spp',             speciesCount: 50000 },
  { id: 'animalia',         parentId: 'eukarya',      name: 'Animalia',         rank: 'kingdom',    type: 'internal',  speciesCount: 1500000 },

  // ── Animalia: filos basais ───────────────────────────────────────────────────
  { id: 'porifera',         parentId: 'animalia',     name: 'Porifera',         rank: 'phylum',     type: 'card',      cardTaxon: 'porifera',      unlockModule: 'metazoa', unlockMinCorrect: 5,  speciesCount: 8500 },
  { id: 'cnidaria',         parentId: 'animalia',     name: 'Cnidaria',         rank: 'phylum',     type: 'card',      cardTaxon: 'cnidaria',      unlockModule: 'metazoa', unlockMinCorrect: 5,  speciesCount: 11000 },
  { id: 'bilateria',        parentId: 'animalia',     name: 'Bilateria',                            type: 'internal',  speciesCount: 1450000 },

  // ── Bilateria ────────────────────────────────────────────────────────────────
  { id: 'xenacoelomorpha',  parentId: 'bilateria',    name: 'Xenacoelomorpha',  rank: 'phylum',     type: 'card',      cardTaxon: 'xenacoelomorpha', unlockModule: 'metazoa', unlockMinCorrect: 8, speciesCount: 450 },
  { id: 'nephrozoa',        parentId: 'bilateria',    name: 'Nephrozoa',                            type: 'internal',  speciesCount: 1449500 },

  // ── Nephrozoa ────────────────────────────────────────────────────────────────
  { id: 'protostomia',      parentId: 'nephrozoa',    name: 'Protostomia',                          type: 'internal',  speciesCount: 1350000 },
  { id: 'deuterostomia',    parentId: 'nephrozoa',    name: 'Deuterostomia',                        type: 'internal',  speciesCount: 70000 },

  // ── Protostomia ──────────────────────────────────────────────────────────────
  { id: 'spiralia',         parentId: 'protostomia',  name: 'Spiralia',                             type: 'internal',  speciesCount: 150000 },
  { id: 'ecdysozoa',        parentId: 'protostomia',  name: 'Ecdysozoa',                            type: 'internal',  speciesCount: 1200000 },

  // ── Spiralia ─────────────────────────────────────────────────────────────────
  { id: 'platyhelminthes',  parentId: 'spiralia',     name: 'Platyhelminthes',  rank: 'phylum',     type: 'card',      cardTaxon: 'platyhelminthes', unlockModule: 'metazoa', unlockMinCorrect: 5, speciesCount: 25000 },
  { id: 'lophotrochozoa',   parentId: 'spiralia',     name: 'Lophotrochozoa',                       type: 'internal',  speciesCount: 125000 },

  // ── Platyhelminthes ──────────────────────────────────────────────────────────
  { id: 'turbellaria',      parentId: 'platyhelminthes', name: 'Turbellaria',                       type: 'placeholder', cardTaxon: 'planaria',    speciesCount: 4500 },
  { id: 'cestoda',          parentId: 'platyhelminthes', name: 'Cestoda',                           type: 'placeholder', cardTaxon: 'taenia',      speciesCount: 6000 },

  // ── Lophotrochozoa ───────────────────────────────────────────────────────────
  { id: 'mollusca',         parentId: 'lophotrochozoa', name: 'Mollusca',       rank: 'phylum',     type: 'card',      cardTaxon: 'mollusca',      unlockModule: 'metazoa',  unlockMinCorrect: 5,  speciesCount: 85000 },
  { id: 'annelida',         parentId: 'lophotrochozoa', name: 'Annelida',       rank: 'phylum',     type: 'card',      cardTaxon: 'annelida',      unlockModule: 'annelida', unlockMinCorrect: 5,  speciesCount: 22000 },
  { id: 'brachiopoda',      parentId: 'lophotrochozoa', name: 'Brachiopoda',    rank: 'phylum',     type: 'collapsed', collapsedLabel: 'Braquiópodos',           speciesCount: 450 },
  { id: 'bryozoa',          parentId: 'lophotrochozoa', name: 'Bryozoa',        rank: 'phylum',     type: 'collapsed', collapsedLabel: 'Briozoários',             speciesCount: 6000 },

  // ── Mollusca ─────────────────────────────────────────────────────────────────
  { id: 'gastropoda',       parentId: 'mollusca',     name: 'Gastropoda',       rank: 'class',      type: 'card',      cardTaxon: 'gastropoda',    unlockModule: 'metazoa',  unlockMinCorrect: 10, speciesCount: 65000 },
  { id: 'bivalvia',         parentId: 'mollusca',     name: 'Bivalvia',         rank: 'class',      type: 'card',      cardTaxon: 'bivalvia',      unlockModule: 'metazoa',  unlockMinCorrect: 10, speciesCount: 9000 },
  { id: 'cephalopoda',      parentId: 'mollusca',     name: 'Cephalopoda',      rank: 'class',      type: 'card',      cardTaxon: 'cephalopoda',   unlockModule: 'metazoa',  unlockMinCorrect: 10, speciesCount: 800 },

  // ── Annelida ─────────────────────────────────────────────────────────────────
  { id: 'clitellata',       parentId: 'annelida',     name: 'Clitellata',                           type: 'internal',  speciesCount: 10000 },
  { id: 'errantia',         parentId: 'annelida',     name: 'Errantia',         rank: 'class',      type: 'card',      cardTaxon: 'nereidae',      unlockModule: 'annelida', unlockMinCorrect: 5,  speciesCount: 10000 },

  // ── Clitellata ───────────────────────────────────────────────────────────────
  { id: 'oligochaeta',      parentId: 'clitellata',   name: 'Oligochaeta',      rank: 'class',      type: 'card',      cardTaxon: 'oligochaeta',   unlockModule: 'annelida', unlockMinCorrect: 5,  speciesCount: 6000 },
  { id: 'hirudinida',       parentId: 'clitellata',   name: 'Hirudinida',       rank: 'class',      type: 'card',      cardTaxon: 'hirudinida',    unlockModule: 'annelida', unlockMinCorrect: 5,  speciesCount: 700 },

  // ── Ecdysozoa ────────────────────────────────────────────────────────────────
  { id: 'nematoda',         parentId: 'ecdysozoa',    name: 'Nematoda',         rank: 'phylum',     type: 'card',      cardTaxon: 'nematoda',      unlockModule: 'metazoa',  unlockMinCorrect: 5,  speciesCount: 25000 },
  { id: 'tardigrada',       parentId: 'ecdysozoa',    name: 'Tardigrada',       rank: 'phylum',     type: 'collapsed', collapsedLabel: 'Tardígrados',             speciesCount: 1300 },
  { id: 'arthropoda',       parentId: 'ecdysozoa',    name: 'Arthropoda',       rank: 'phylum',     type: 'card',      cardTaxon: 'arthropoda',    unlockModule: 'arthropoda', unlockMinCorrect: 5, speciesCount: 1100000 },

  // ── Arthropoda ───────────────────────────────────────────────────────────────
  { id: 'chelicerata',      parentId: 'arthropoda',   name: 'Chelicerata',      rank: 'subphylum',  type: 'internal',  speciesCount: 115000 },
  { id: 'myriapoda',        parentId: 'arthropoda',   name: 'Myriapoda',        rank: 'subphylum',  type: 'card',      cardTaxon: 'myriapoda',     unlockModule: 'arthropoda', unlockMinCorrect: 5, speciesCount: 16000 },
  { id: 'pancrustacea',     parentId: 'arthropoda',   name: 'Pancrustacea',                         type: 'internal',  speciesCount: 1060000 },

  // ── Chelicerata ──────────────────────────────────────────────────────────────
  { id: 'xiphosura',        parentId: 'chelicerata',  name: 'Xiphosura',        rank: 'order',      type: 'collapsed', collapsedLabel: 'Caranguejos-ferradura',   speciesCount: 4 },
  { id: 'pycnogonida',      parentId: 'chelicerata',  name: 'Pycnogonida',      rank: 'class',      type: 'collapsed', collapsedLabel: 'Aranhas-do-mar',          speciesCount: 1300 },
  { id: 'arachnida',        parentId: 'chelicerata',  name: 'Arachnida',        rank: 'class',      type: 'card',      cardTaxon: 'arachnida',     unlockModule: 'arthropoda', unlockMinCorrect: 5,  speciesCount: 110000 },

  // ── Arachnida ────────────────────────────────────────────────────────────────
  { id: 'araneae',          parentId: 'arachnida',    name: 'Araneae',          rank: 'order',      type: 'card',      cardTaxon: 'arachnida',     unlockModule: 'arthropoda', unlockMinCorrect: 10, speciesCount: 50000 },
  { id: 'scorpiones',       parentId: 'arachnida',    name: 'Scorpiones',       rank: 'order',      type: 'collapsed', collapsedLabel: 'Escorpiões',              speciesCount: 2500 },
  { id: 'acari',            parentId: 'arachnida',    name: 'Acari',            rank: 'subclass',   type: 'collapsed', collapsedLabel: 'Ácaros e Carrapatos',     speciesCount: 50000 },
  { id: 'opiliones',        parentId: 'arachnida',    name: 'Opiliones',        rank: 'order',      type: 'collapsed', collapsedLabel: 'Opiliões',                speciesCount: 6500 },
  { id: 'pseudoscorpiones', parentId: 'arachnida',    name: 'Pseudoscorpiones', rank: 'order',      type: 'collapsed', collapsedLabel: 'Pseudoescorpiões',        speciesCount: 3800 },

  // ── Myriapoda ────────────────────────────────────────────────────────────────
  { id: 'chilopoda',        parentId: 'myriapoda',    name: 'Chilopoda',        rank: 'class',      type: 'collapsed', collapsedLabel: 'Centopeias',             speciesCount: 3000 },
  { id: 'diplopoda',        parentId: 'myriapoda',    name: 'Diplopoda',        rank: 'class',      type: 'collapsed', collapsedLabel: 'Milípedes',               speciesCount: 12000 },

  // ── Pancrustacea ─────────────────────────────────────────────────────────────
  { id: 'crustacea',        parentId: 'pancrustacea', name: 'Crustacea',        rank: 'subphylum',  type: 'card',      cardTaxon: 'crustacea',     unlockModule: 'arthropoda', unlockMinCorrect: 5,  speciesCount: 67000 },
  { id: 'hexapoda',         parentId: 'pancrustacea', name: 'Hexapoda',         rank: 'subphylum',  type: 'internal',  speciesCount: 1000000 },

  // ── Crustacea ────────────────────────────────────────────────────────────────
  { id: 'malacostraca',     parentId: 'crustacea',    name: 'Malacostraca',     rank: 'class',      type: 'collapsed', collapsedLabel: 'Caranguejos, Lagostas, Camarões', speciesCount: 40000 },
  { id: 'branchiopoda',     parentId: 'crustacea',    name: 'Branchiopoda',     rank: 'class',      type: 'collapsed', collapsedLabel: 'Camarões-fada, Cladóceros',      speciesCount: 1000 },
  { id: 'copepoda',         parentId: 'crustacea',    name: 'Copepoda',         rank: 'subclass',   type: 'collapsed', collapsedLabel: 'Copépodos',               speciesCount: 13000 },
  { id: 'thecostraca',      parentId: 'crustacea',    name: 'Thecostraca',      rank: 'class',      type: 'collapsed', collapsedLabel: 'Cracas',                  speciesCount: 1300 },

  // ── Hexapoda ─────────────────────────────────────────────────────────────────
  { id: 'entognatha',       parentId: 'hexapoda',     name: 'Entognatha',       rank: 'class',      type: 'collapsed', collapsedLabel: 'Colêmbolos etc',          speciesCount: 8000 },
  { id: 'insecta',          parentId: 'hexapoda',     name: 'Insecta',          rank: 'class',      type: 'card',      cardTaxon: 'insecta',       unlockModule: 'arthropoda', unlockMinCorrect: 5,  speciesCount: 1000000 },

  // ── Insecta ──────────────────────────────────────────────────────────────────
  { id: 'coleoptera',       parentId: 'insecta',      name: 'Coleoptera',       rank: 'order',      type: 'card',      cardTaxon: 'coleoptera',    unlockModule: 'arthropoda', unlockMinCorrect: 15, speciesCount: 400000 },
  { id: 'lepidoptera',      parentId: 'insecta',      name: 'Lepidoptera',      rank: 'order',      type: 'card',      cardTaxon: 'lepidoptera',   unlockModule: 'arthropoda', unlockMinCorrect: 15, speciesCount: 180000 },
  { id: 'hymenoptera',      parentId: 'insecta',      name: 'Hymenoptera',      rank: 'order',      type: 'card',      cardTaxon: 'hymenoptera',   unlockModule: 'arthropoda', unlockMinCorrect: 15, speciesCount: 150000 },
  { id: 'diptera',          parentId: 'insecta',      name: 'Diptera',          rank: 'order',      type: 'card',      cardTaxon: 'diptera',       unlockModule: 'arthropoda', unlockMinCorrect: 15, speciesCount: 150000 },
  { id: 'hemiptera',        parentId: 'insecta',      name: 'Hemiptera',        rank: 'order',      type: 'collapsed', collapsedLabel: 'Percevejos',              speciesCount: 80000 },
  { id: 'orthoptera',       parentId: 'insecta',      name: 'Orthoptera',       rank: 'order',      type: 'collapsed', collapsedLabel: 'Gafanhotos e Grilos',     speciesCount: 20000 },
  { id: 'odonata',          parentId: 'insecta',      name: 'Odonata',          rank: 'order',      type: 'collapsed', collapsedLabel: 'Libélulas',               speciesCount: 6000 },
  { id: 'blattodea',        parentId: 'insecta',      name: 'Blattodea',        rank: 'order',      type: 'collapsed', collapsedLabel: 'Baratas e Cupins',        speciesCount: 7500 },

  // ── Deuterostomia ────────────────────────────────────────────────────────────
  { id: 'echinodermata',    parentId: 'deuterostomia', name: 'Echinodermata',   rank: 'phylum',     type: 'card',      cardTaxon: 'echinodermata', unlockModule: 'metazoa',       unlockMinCorrect: 5, speciesCount: 7000 },
  { id: 'hemichordata',     parentId: 'deuterostomia', name: 'Hemichordata',    rank: 'phylum',     type: 'card',      cardTaxon: 'hemichordata',  unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 130 },
  { id: 'chordata',         parentId: 'deuterostomia', name: 'Chordata',        rank: 'phylum',     type: 'card',      cardTaxon: 'chordata',      unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 65000 },

  // ── Chordata ─────────────────────────────────────────────────────────────────
  { id: 'cephalochordata',  parentId: 'chordata',     name: 'Cephalochordata',  rank: 'subphylum',  type: 'card',      cardTaxon: 'cephalochordata', unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 30 },
  { id: 'urochordata',      parentId: 'chordata',     name: 'Urochordata',      rank: 'subphylum',  type: 'card',      cardTaxon: 'urochordata',   unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 3000 },
  { id: 'vertebrata',       parentId: 'chordata',     name: 'Vertebrata',       rank: 'subphylum',  type: 'internal',  speciesCount: 62000 },

  // ── Vertebrata ───────────────────────────────────────────────────────────────
  { id: 'myxini',           parentId: 'vertebrata',   name: 'Myxini',           rank: 'class',      type: 'card',      cardTaxon: 'myxini',        unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 80 },
  { id: 'petromyzontida',   parentId: 'vertebrata',   name: 'Petromyzontida',   rank: 'class',      type: 'collapsed', collapsedLabel: 'Lampreias',               speciesCount: 38 },
  { id: 'gnathostomata',    parentId: 'vertebrata',   name: 'Gnathostomata',                        type: 'internal',  speciesCount: 61000 },

  // ── Gnathostomata ────────────────────────────────────────────────────────────
  { id: 'chondrichthyes',   parentId: 'gnathostomata', name: 'Chondrichthyes',  rank: 'class',      type: 'card',      cardTaxon: 'chondrichthyes', unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 1200 },
  { id: 'osteichthyes',     parentId: 'gnathostomata', name: 'Osteichthyes',                        type: 'internal',  speciesCount: 33000 },
  { id: 'tetrapoda',        parentId: 'gnathostomata', name: 'Tetrapoda',       rank: 'superclass', type: 'internal',  speciesCount: 30000 },

  // ── Chondrichthyes ───────────────────────────────────────────────────────────
  { id: 'selachimorpha',    parentId: 'chondrichthyes', name: 'Selachimorpha',  rank: 'superorder', type: 'collapsed', collapsedLabel: 'Tubarões',                speciesCount: 500 },
  { id: 'batoidea',         parentId: 'chondrichthyes', name: 'Batoidea',       rank: 'superorder', type: 'collapsed', collapsedLabel: 'Raias e Cações',          speciesCount: 600 },
  { id: 'holocephali',      parentId: 'chondrichthyes', name: 'Holocephali',    rank: 'subclass',   type: 'collapsed', collapsedLabel: 'Quimeras',                speciesCount: 50 },

  // ── Osteichthyes ─────────────────────────────────────────────────────────────
  { id: 'sarcopterygii',    parentId: 'osteichthyes', name: 'Sarcopterygii',    rank: 'class',      type: 'collapsed', collapsedLabel: 'Peixes de nadadeira lobada', speciesCount: 8 },
  { id: 'actinopterygii',   parentId: 'osteichthyes', name: 'Actinopterygii',   rank: 'class',      type: 'card',      cardTaxon: 'actinopterygii', unlockModule: 'chordata-basal', unlockMinCorrect: 5, speciesCount: 33000 },

  // ── Actinopterygii ───────────────────────────────────────────────────────────
  { id: 'chondrostei',      parentId: 'actinopterygii', name: 'Chondrostei',    rank: 'subclass',   type: 'collapsed', collapsedLabel: 'Esturjões e Colhereiros', speciesCount: 30 },
  { id: 'teleostei',        parentId: 'actinopterygii', name: 'Teleostei',      rank: 'subclass',   type: 'internal',  speciesCount: 32000 },

  // ── Teleostei ────────────────────────────────────────────────────────────────
  { id: 'cypriniformes',    parentId: 'teleostei',    name: 'Cypriniformes',    rank: 'order',      type: 'collapsed', collapsedLabel: 'Carps, Minnows',          speciesCount: 4300 },
  { id: 'siluriformes',     parentId: 'teleostei',    name: 'Siluriformes',     rank: 'order',      type: 'collapsed', collapsedLabel: 'Catfishes',               speciesCount: 3000 },
  { id: 'characiformes',    parentId: 'teleostei',    name: 'Characiformes',    rank: 'order',      type: 'collapsed', collapsedLabel: 'Tetras, Piranhas',        speciesCount: 2200 },
  { id: 'perciformes',      parentId: 'teleostei',    name: 'Perciformes',      rank: 'order',      type: 'collapsed', collapsedLabel: 'Perch-like fishes',       speciesCount: 10000 },

  // ── Tetrapoda ────────────────────────────────────────────────────────────────
  { id: 'amphibia',         parentId: 'tetrapoda',    name: 'Amphibia',         rank: 'class',      type: 'card',      cardTaxon: 'amphibia',      unlockModule: 'amniota', unlockMinCorrect: 5,  speciesCount: 8000 },
  { id: 'amniota',          parentId: 'tetrapoda',    name: 'Amniota',                              type: 'internal',  speciesCount: 22000 },

  // ── Amphibia ─────────────────────────────────────────────────────────────────
  { id: 'anura',            parentId: 'amphibia',     name: 'Anura',            rank: 'order',      type: 'collapsed', collapsedLabel: 'Rãs e Sapos',            speciesCount: 7000 },
  { id: 'caudata',          parentId: 'amphibia',     name: 'Caudata',          rank: 'order',      type: 'collapsed', collapsedLabel: 'Salamandras',             speciesCount: 750 },
  { id: 'gymnophiona',      parentId: 'amphibia',     name: 'Gymnophiona',      rank: 'order',      type: 'collapsed', collapsedLabel: 'Cobras-cegas',            speciesCount: 200 },

  // ── Amniota ──────────────────────────────────────────────────────────────────
  { id: 'synapsida',        parentId: 'amniota',      name: 'Synapsida',                            type: 'internal',  speciesCount: 6500 },
  { id: 'sauropsida',       parentId: 'amniota',      name: 'Sauropsida',       rank: 'class',      type: 'internal',  speciesCount: 20000 },

  // ── Synapsida ────────────────────────────────────────────────────────────────
  { id: 'mammalia',         parentId: 'synapsida',    name: 'Mammalia',         rank: 'class',      type: 'card',      cardTaxon: 'mammalia',      unlockModule: 'amniota', unlockMinCorrect: 5,  speciesCount: 6500 },

  // ── Mammalia ─────────────────────────────────────────────────────────────────
  { id: 'monotremata',      parentId: 'mammalia',     name: 'Monotremata',      rank: 'order',      type: 'card',      cardTaxon: 'platypus',      unlockModule: 'amniota', unlockMinCorrect: 12, speciesCount: 5 },
  { id: 'theria',           parentId: 'mammalia',     name: 'Theria',           rank: 'subclass',   type: 'internal',  speciesCount: 6495 },

  // ── Theria ───────────────────────────────────────────────────────────────────
  { id: 'marsupialia',      parentId: 'theria',       name: 'Marsupialia',                          type: 'card',      cardTaxon: 'opossum',       unlockModule: 'amniota', unlockMinCorrect: 12, speciesCount: 330 },
  { id: 'placentalia',      parentId: 'theria',       name: 'Placentalia',                          type: 'card',      cardTaxon: 'human',         unlockModule: 'amniota', unlockMinCorrect: 12, speciesCount: 6000 },

  // ── Placentalia ──────────────────────────────────────────────────────────────
  { id: 'rodentia',         parentId: 'placentalia',  name: 'Rodentia',         rank: 'order',      type: 'collapsed', collapsedLabel: 'Roedores',                speciesCount: 2200 },
  { id: 'chiroptera',       parentId: 'placentalia',  name: 'Chiroptera',       rank: 'order',      type: 'collapsed', collapsedLabel: 'Morcegos',                speciesCount: 1400 },
  { id: 'eulipotyphla',     parentId: 'placentalia',  name: 'Eulipotyphla',     rank: 'order',      type: 'collapsed', collapsedLabel: 'Musaranhos e Toupeiras', speciesCount: 500 },
  { id: 'primates',         parentId: 'placentalia',  name: 'Primates',         rank: 'order',      type: 'collapsed', collapsedLabel: 'Macacos e Símios',        speciesCount: 500 },
  { id: 'carnivora',        parentId: 'placentalia',  name: 'Carnivora',        rank: 'order',      type: 'collapsed', collapsedLabel: 'Carnívoros',              speciesCount: 300 },
  { id: 'artiodactyla',     parentId: 'placentalia',  name: 'Artiodactyla',     rank: 'order',      type: 'collapsed', collapsedLabel: 'Ungulados de dedos pares', speciesCount: 250 },
  { id: 'cetacea',          parentId: 'placentalia',  name: 'Cetacea',          rank: 'order',      type: 'collapsed', collapsedLabel: 'Baleias e Golfinhos',     speciesCount: 90 },

  // ── Sauropsida ───────────────────────────────────────────────────────────────
  { id: 'lepidosauria',     parentId: 'sauropsida',   name: 'Lepidosauria',     rank: 'subclass',   type: 'internal',  speciesCount: 11000 },
  { id: 'archelosauria',    parentId: 'sauropsida',   name: 'Archelosauria',                        type: 'internal',  speciesCount: 10500 },

  // ── Lepidosauria ─────────────────────────────────────────────────────────────
  { id: 'squamata',         parentId: 'lepidosauria', name: 'Squamata',         rank: 'order',      type: 'collapsed', collapsedLabel: 'Lagartos e Serpentes',    speciesCount: 11000 },
  { id: 'rhynchocephalia',  parentId: 'lepidosauria', name: 'Rhynchocephalia',  rank: 'order',      type: 'collapsed', collapsedLabel: 'Tuatara',                 speciesCount: 1 },

  // ── Archelosauria ────────────────────────────────────────────────────────────
  { id: 'testudines',       parentId: 'archelosauria', name: 'Testudines',      rank: 'order',      type: 'collapsed', collapsedLabel: 'Tartarugas e Jabutis',   speciesCount: 350 },
  { id: 'archosauria',      parentId: 'archelosauria', name: 'Archosauria',                         type: 'internal',  speciesCount: 10000 },

  // ── Archosauria ──────────────────────────────────────────────────────────────
  { id: 'crocodilia',       parentId: 'archosauria',  name: 'Crocodilia',       rank: 'order',      type: 'collapsed', collapsedLabel: 'Crocodilos e Jacarés',   speciesCount: 27 },
  { id: 'aves',             parentId: 'archosauria',  name: 'Aves',             rank: 'class',      type: 'collapsed',                                            speciesCount: 10000 },

  // ── Aves ─────────────────────────────────────────────────────────────────────
  { id: 'palaeognathae',    parentId: 'aves',         name: 'Palaeognathae',                        type: 'collapsed', collapsedLabel: 'Avestruzes e Kiwis',     speciesCount: 60 },
  { id: 'neognathae',       parentId: 'aves',         name: 'Neognathae',                           type: 'internal',  speciesCount: 9900 },

  // ── Neognathae ───────────────────────────────────────────────────────────────
  { id: 'galloanserae',     parentId: 'neognathae',   name: 'Galloanserae',                         type: 'collapsed', collapsedLabel: 'Galináceos e Patos',     speciesCount: 450 },
  { id: 'neoaves',          parentId: 'neognathae',   name: 'Neoaves',                              type: 'collapsed', collapsedLabel: 'Aves modernas',           speciesCount: 9500 },
];

export const TREE_OF_LIFE: TolNode = buildTree(TOL_DATA);
