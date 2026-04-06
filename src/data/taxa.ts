export interface Taxon {
  id: string;
  name: string; // nome científico
  commonName?: string;
  /** Grupo da classificação tradicional (ex: 'Polychaeta', 'Oligochaeta') */
  traditionalGroup?: string;
  /** Abreviação para exibição na árvore (ex: 'Pol', 'Oli', 'Hir') */
  traditionalGroupAbbr?: string;
}

export interface ModuleData {
  id: string;
  label: string;
  taxa: Taxon[];
  /** Caracteres morfológicos reais associados a clados, usados nos exercícios de sinapomorfia */
  characters: Character[];
}

export interface Character {
  id: string;
  description: string;
  /** IDs dos táxons que possuem este caráter */
  presentIn: string[];
  /** Tipo padrão deste caráter no contexto da árvore gerada (pode mudar conforme topologia) */
  type: 'synapomorphy' | 'plesiomorphy' | 'autapomorphy';
}

export const modules: ModuleData[] = [
  {
    id: 'annelida',
    label: 'Annelida',
    // Táxons baseados em Struck et al. 2011 (Hickman Fig. 17.1)
    // traditionalGroup reflete a classificação pré-molecular (Polychaeta, Oligochaeta, Hirudinida)
    taxa: [
      { id: 'chaetopteridae', name: 'Chaetopteridae', commonName: 'vermes-pergaminho',             traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'nereidae',       name: 'Nereidae',       commonName: 'nereideos',                    traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'glyceridae',     name: 'Glyceridae',     commonName: 'glicerídeos',                  traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'siboglinidae',   name: 'Siboglinidae',   commonName: 'siboglinídeos (pogonóforos)',  traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'sabellidae',     name: 'Sabellidae',     commonName: 'vermes-plumeiro',              traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'echiuridae',     name: 'Echiuridae',     commonName: 'equiúros',                     traditionalGroup: 'Polychaeta', traditionalGroupAbbr: 'Pol' },
      { id: 'naididae',       name: 'Naididae',       commonName: 'naidídeos',                    traditionalGroup: 'Oligochaeta', traditionalGroupAbbr: 'Oli' },
      { id: 'aeolosomatidae', name: 'Aeolosomatidae', commonName: 'eolosomatídeos',               traditionalGroup: 'Oligochaeta', traditionalGroupAbbr: 'Oli' },
      { id: 'lumbricidae',    name: 'Lumbricidae',    commonName: 'minhocas',                     traditionalGroup: 'Oligochaeta', traditionalGroupAbbr: 'Oli' },
      { id: 'acanthobdellida',name: 'Acanthobdellida',commonName: 'acantobdelídeos (27 seg.)',    traditionalGroup: 'Hirudinida',  traditionalGroupAbbr: 'Hir' },
      { id: 'branchiobdellida',name:'Branchiobdellida',commonName:'branchiobdelídeos (15 seg.)',  traditionalGroup: 'Hirudinida',  traditionalGroupAbbr: 'Hir' },
      { id: 'hirudinea',      name: 'Hirudinea',      commonName: 'sanguessugas (34 seg.)',       traditionalGroup: 'Hirudinida',  traditionalGroupAbbr: 'Hir' },
    ],
    characters: [
      {
        id: 'palpos_solidos',
        description: 'Palpos sólidos',
        presentIn: ['nereidae', 'glyceridae'],
        type: 'synapomorphy', // Errantia
      },
      {
        id: 'olhos_multicelulares',
        description: '2 pares de olhos multicelulares',
        presentIn: ['nereidae', 'glyceridae'],
        type: 'synapomorphy', // Errantia
      },
      {
        id: 'parapodio_reduzido',
        description: 'Parapódio reduzido',
        presentIn: ['siboglinidae', 'sabellidae', 'echiuridae', 'naididae', 'aeolosomatidae', 'lumbricidae', 'acanthobdellida', 'branchiobdellida', 'hirudinea'],
        type: 'synapomorphy', // Sedentaria
      },
      {
        id: 'clitelo',
        description: 'Clitelo reprodutivo',
        presentIn: ['naididae', 'aeolosomatidae', 'lumbricidae', 'acanthobdellida', 'branchiobdellida', 'hirudinea'],
        type: 'synapomorphy', // Clitellata
      },
      {
        id: 'ventosa_posterior',
        description: 'Ventosa posterior',
        presentIn: ['acanthobdellida', 'branchiobdellida', 'hirudinea'],
        type: 'synapomorphy', // Hirudinida
      },
      {
        id: 'ventosa_anterior',
        description: 'Ventosa anterior',
        presentIn: ['branchiobdellida', 'hirudinea'],
        type: 'synapomorphy', // Branchiobdellida + Hirudinea
      },
    ],
  },
  {
    id: 'chordata-basal',
    label: 'Chordata Basal',
    taxa: [
      { id: 'hemichordata', name: 'Hemichordata', commonName: 'hemicordados' },
      { id: 'urochordata', name: 'Urochordata', commonName: 'urocordados / tunicados' },
      { id: 'cephalochordata', name: 'Cephalochordata', commonName: 'cefalocordados / anfioxos' },
      { id: 'myxini', name: 'Myxini', commonName: 'mixinas' },
      { id: 'petromyzontida', name: 'Petromyzontida', commonName: 'lampreias' },
      { id: 'chondrichthyes', name: 'Chondrichthyes', commonName: 'tubarões e raias' },
      { id: 'actinopterygii', name: 'Actinopterygii', commonName: 'peixes teleósteos' },
    ],
    characters: [
      {
        id: 'notocorda',
        description: 'Notocorda em alguma fase do desenvolvimento',
        presentIn: ['urochordata', 'cephalochordata', 'myxini', 'petromyzontida', 'chondrichthyes', 'actinopterygii'],
        type: 'synapomorphy',
      },
      {
        id: 'tubo_neural',
        description: 'Tubo neural dorsal',
        presentIn: ['urochordata', 'cephalochordata', 'myxini', 'petromyzontida', 'chondrichthyes', 'actinopterygii'],
        type: 'synapomorphy',
      },
      {
        id: 'mandibulas',
        description: 'Mandíbulas articuladas',
        presentIn: ['chondrichthyes', 'actinopterygii'],
        type: 'synapomorphy',
      },
      {
        id: 'cranio',
        description: 'Crânio cartilaginoso ou ósseo',
        presentIn: ['myxini', 'petromyzontida', 'chondrichthyes', 'actinopterygii'],
        type: 'synapomorphy',
      },
      {
        id: 'fendas_faringe',
        description: 'Fendas faringeanas',
        presentIn: ['hemichordata', 'urochordata', 'cephalochordata', 'myxini', 'petromyzontida'],
        type: 'plesiomorphy',
      },
      {
        id: 'nadadeiras_pares',
        description: 'Nadadeiras pares',
        presentIn: ['chondrichthyes', 'actinopterygii'],
        type: 'synapomorphy',
      },
    ],
  },
  {
    id: 'amniota',
    label: 'Amniota',
    taxa: [
      { id: 'amphibia',   name: 'Amphibia',   commonName: 'anfíbios' },
      { id: 'mammalia',   name: 'Mammalia',   commonName: 'mamíferos' },
      { id: 'squamata',   name: 'Squamata',   commonName: 'lagartos e serpentes' },
      { id: 'testudines', name: 'Testudines', commonName: 'tartarugas e quelônios' },
      { id: 'crocodilia', name: 'Crocodilia', commonName: 'crocodilos e jacarés' },
      { id: 'aves',       name: 'Aves',       commonName: 'pássaros' },
    ],
    characters: [
      {
        id: 'amnio',
        description: 'Âmnio (membrana extra-embrionária)',
        presentIn: ['mammalia', 'squamata', 'testudines', 'crocodilia', 'aves'],
        type: 'synapomorphy',
      },
      {
        id: 'penas',
        description: 'Penas',
        presentIn: ['aves'],
        type: 'autapomorphy',
      },
      {
        id: 'pelos',
        description: 'Pelos e glândulas mamárias',
        presentIn: ['mammalia'],
        type: 'autapomorphy',
      },
      {
        id: 'janelas_temporais',
        description: 'Fenestras temporais',
        presentIn: ['squamata', 'crocodilia', 'aves', 'mammalia'],
        type: 'synapomorphy',
      },
      {
        id: 'endotermia',
        description: 'Endotermia (regulação interna da temperatura)',
        presentIn: ['crocodilia', 'aves', 'mammalia'],
        type: 'synapomorphy',
      },
    ],
  },
  {
    id: 'arthropoda',
    label: 'Arthropoda',
    taxa: [
      { id: 'onychophora', name: 'Onychophora', commonName: 'perípatos' },
      { id: 'chelicerata', name: 'Chelicerata', commonName: 'aranhas e escorpiões' },
      { id: 'myriapoda',   name: 'Myriapoda',   commonName: 'centopeias e milípedes' },
      { id: 'crustacea',   name: 'Crustacea',   commonName: 'caranguejos e camarões', traditionalGroup: 'Crustacea', traditionalGroupAbbr: 'Cru' },
      { id: 'insecta',     name: 'Insecta',     commonName: 'insetos',                traditionalGroup: 'Crustacea', traditionalGroupAbbr: 'Cru' },
    ],
    characters: [
      {
        id: 'exoesqueleto_articulado',
        description: 'Exoesqueleto articulado com apêndices',
        presentIn: ['chelicerata', 'myriapoda', 'crustacea', 'insecta'],
        type: 'synapomorphy',
      },
      {
        id: 'mandibulas_arthro',
        description: 'Mandíbulas (apêndices bucais modificados)',
        presentIn: ['myriapoda', 'crustacea', 'insecta'],
        type: 'synapomorphy',
      },
      {
        id: 'antenas',
        description: 'Antenas (1 par)',
        presentIn: ['myriapoda', 'crustacea', 'insecta'],
        type: 'synapomorphy',
      },
      {
        id: 'traqueias',
        description: 'Sistema traqueal aéreo',
        presentIn: ['myriapoda', 'insecta'],
        type: 'synapomorphy',
      },
      {
        id: 'seis_patas',
        description: 'Seis patas locomotoras e tórax tripartido',
        presentIn: ['insecta'],
        type: 'autapomorphy',
      },
    ],
  },
  {
    id: 'invertebrados-gerais',
    label: 'Invertebrados Gerais',
    taxa: [
      { id: 'porifera', name: 'Porifera', commonName: 'esponjas' },
      { id: 'cnidaria', name: 'Cnidaria', commonName: 'cnidários' },
      { id: 'platyhelminthes', name: 'Platyhelminthes', commonName: 'platelmintos' },
      { id: 'nematoda', name: 'Nematoda', commonName: 'nematoides' },
      { id: 'mollusca', name: 'Mollusca', commonName: 'moluscos' },
      { id: 'annelida', name: 'Annelida', commonName: 'anelídeos' },
      { id: 'arthropoda', name: 'Arthropoda', commonName: 'artrópodos' },
      { id: 'echinodermata', name: 'Echinodermata', commonName: 'equinodermos' },
    ],
    characters: [
      {
        id: 'celoma',
        description: 'Celoma verdadeiro',
        presentIn: ['mollusca', 'annelida', 'arthropoda', 'echinodermata'],
        type: 'synapomorphy',
      },
      {
        id: 'simetria_bilateral',
        description: 'Simetria bilateral',
        presentIn: ['platyhelminthes', 'nematoda', 'mollusca', 'annelida', 'arthropoda'],
        type: 'synapomorphy',
      },
      {
        id: 'exoesqueleto_quitinoso',
        description: 'Exoesqueleto quitinoso com ecdise',
        presentIn: ['nematoda', 'arthropoda'],
        type: 'synapomorphy',
      },
      {
        id: 'cnidocitos',
        description: 'Cnidócitos (células urticantes)',
        presentIn: ['cnidaria'],
        type: 'autapomorphy',
      },
      {
        id: 'deuterostomia',
        description: 'Deuterostomia (blastóporo = ânus)',
        presentIn: ['echinodermata'],
        type: 'autapomorphy',
      },
      {
        id: 'apendices_articulados',
        description: 'Apêndices articulados',
        presentIn: ['arthropoda'],
        type: 'autapomorphy',
      },
    ],
  },
];

export function getModuleData(moduleId: string): ModuleData | undefined {
  return modules.find((m) => m.id === moduleId);
}
