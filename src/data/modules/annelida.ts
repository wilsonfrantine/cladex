// Baseado em Struck et al. 2011 (Hickman et al., Princípios Integrados de Zoologia, Fig. 17.1)
// Sipuncula grupo-irmão de Annelida (ambos em Lophotrochozoa).
// Annelida = Chaetopteridae + Pleistoannelida; Pleistoannelida = Errantia + Sedentaria.
// Sedentaria contém Clitellata; Clitellata contém Hirudinida.
// Polychaeta e Oligochaeta são PARAFILÉTICOS nesta filogenia molecular.

import type { CuratedTree } from '../types';

const ANNELIDA_TRADITIONAL: Record<string, { abbr: string; color: string }> = {
  Chaetopteridae:   { abbr: 'Pol', color: '#60a5fa' },
  Nereidae:         { abbr: 'Pol', color: '#60a5fa' },
  Glyceridae:       { abbr: 'Pol', color: '#60a5fa' },
  Siboglinidae:     { abbr: 'Pol', color: '#60a5fa' },
  Sabellidae:       { abbr: 'Pol', color: '#60a5fa' },
  Echiuridae:       { abbr: 'Pol', color: '#60a5fa' },
  Naididae:         { abbr: 'Oli', color: '#4ade80' },
  Aeolosomatidae:   { abbr: 'Oli', color: '#4ade80' },
  Lumbricidae:      { abbr: 'Oli', color: '#4ade80' },
  Acanthobdellida:  { abbr: 'Hir', color: '#f87171' },
  Branchiobdellida: { abbr: 'Hir', color: '#f87171' },
  Hirudinea:        { abbr: 'Hir', color: '#f87171' },
};

// Topologia:
// Annelida = (Chaetopteridae, Pleistoannelida)
// Pleistoannelida = (Errantia, Sedentaria)
// Sedentaria = ((Siboglinidae,Sabellidae),(Echiuridae,Clitellata))
//   → Echiuridae é grupo-irmão de Clitellata; juntos são irmãos de (Siboglinidae+Sabellidae)
const ANNELIDA_NEWICK =
  '(Chaetopteridae,((Nereidae,Glyceridae)Errantia,((Siboglinidae,Sabellidae),(Echiuridae,(Naididae,(Aeolosomatidae,(Lumbricidae,(Acanthobdellida,(Branchiobdellida,Hirudinea))Hirudinida)))Clitellata))Sedentaria)Pleistoannelida);';

export const annelidaTrees: CuratedTree[] = [
  {
    id: 'annelida-struck-2011',
    label: 'Annelida — Struck et al. 2011',
    moduleId: 'annelida',
    newick: ANNELIDA_NEWICK,
    source: 'Struck et al. 2011; Hickman et al., Fig. 17.1',
    taxonAnnotations: ANNELIDA_TRADITIONAL,
    clades: [
      {
        id: 'polychaeta-para',
        taxaInGroup: ['Nereidae', 'Glyceridae', 'Siboglinidae', 'Sabellidae', 'Echiuridae'],
        type: 'paraphyletic',
        traditionalGroupContext: 'Polychaeta',
        explanation:
          '**Polychaeta** (sem Chaetopteridae) é **parafilético**: o ancestral comum mais recente de todos os poliquetos destacados é Pleistoannelida, que inclui também toda a Clitellata (oligoquetos e sanguessugas) — excluída do agrupamento. Os poliquetos são definidos por caracteres plesiomórficos (parapódios birramosos, cerdas), não por sinapomorfias exclusivas.',
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
        proximityQuestions: [
          {
            targetTaxon: 'Hirudinea',
            closer: 'Branchiobdellida',
            farther: 'Acanthobdellida',
            explanation: '**Branchiobdellida** é mais próximo de **Hirudinea**: juntos formam `(Branchiobdellida, Hirudinea)` dentro de Hirudinida, unidos pela perda de cerdas e pela ventosa anterior. **Acanthobdellida** é grupo-irmão desse par — está um nó mais distante de Hirudinea.',
          },
          {
            targetTaxon: 'Hirudinea',
            closer: 'Lumbricidae',
            farther: 'Nereidae',
            explanation: '**Lumbricidae** é mais próximo de **Hirudinea** do que **Nereidae**: minhocas e sanguessugas pertencem a **Clitellata**, enquanto Nereidae está em Errantia (Pleistoannelida). O MRCA de Hirudinea + Lumbricidae é a raiz de Clitellata; o MRCA com Nereidae é a raiz de Pleistoannelida — muito mais antigo.',
          },
        ],
        explanation:
          '**Hirudinida** é **monofilético**: Acanthobdellida, Branchiobdellida e Hirudinea compartilham um ancestral exclusivo. Sinapomorfias do clado: ânulos superficiais, ventosa posterior, paredes septais reduzidas e número reduzido de cerdas. Branchiobdellida e Hirudinea compartilham ainda perda de cerdas e ventosa anterior.',
        sisterGroupQuestions: [
          {
            targetTaxon: 'Hirudinea',
            correctSister: 'Branchiobdellida',
            explanation: '**Branchiobdellida** é o grupo-irmão direto de **Hirudinea**: juntos formam o clado `(Branchiobdellida, Hirudinea)` dentro de Hirudinida, unidos por perda de cerdas e presença de ventosa anterior. Acanthobdellida é grupo-irmão do conjunto (Branchiobdellida + Hirudinea), não de Hirudinea isoladamente.',
          },
          {
            targetTaxon: 'Hirudinida',
            correctSister: 'Lumbricidae',
            explanation: '**Lumbricidae** é o grupo-irmão direto de **Hirudinida** na topologia de Clitellata: `(Lumbricidae,(Acanthobdellida,(Branchiobdellida,Hirudinea))Hirudinida)`. As minhocas da família Lumbricidae estão mais próximas das sanguessugas do que Aeolosomatidae ou Naididae.',
          },
        ],
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
            dragDrop: true,
          },
        ],
      },
      {
        id: 'clitellata-mono',
        taxaInGroup: ['Naididae', 'Aeolosomatidae', 'Lumbricidae', 'Acanthobdellida', 'Branchiobdellida', 'Hirudinea'],
        type: 'monophyletic',
        proximityQuestions: [
          {
            targetTaxon: 'Echiuridae',
            closer: 'Naididae',
            farther: 'Siboglinidae',
            explanation: '**Naididae** é mais próximo de **Echiuridae**: na topologia de Sedentaria, Echiuridae é grupo-irmão de toda Clitellata — o MRCA de Echiuridae + Naididae é a raiz de `(Echiuridae, Clitellata)`. Siboglinidae está no ramo irmão dessa unidade, separado por um nó a mais.',
          },
        ],
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
        proximityQuestions: [
          {
            targetTaxon: 'Nereidae',
            closer: 'Glyceridae',
            farther: 'Sabellidae',
            explanation: '**Glyceridae** é mais próximo de **Nereidae**: juntos formam **Errantia**, os poliquetos errantes. Sabellidae está em Sedentaria — o MRCA de Nereidae + Sabellidae é a raiz de Pleistoannelida, enquanto o MRCA de Nereidae + Glyceridae é apenas Errantia.',
          },
        ],
        explanation:
          '**Errantia** é **monofilético**: Nereidae e Glyceridae são unidos por 2 pares de olhos multicelulares, antena lateral e palpos sólidos. São os poliquetos de vida livre, errantes — daí o nome.',
        sisterGroupQuestions: [
          {
            targetTaxon: 'Errantia',
            correctSister: 'Sedentaria',
            explanation: '**Sedentaria** é o grupo-irmão de **Errantia**: juntos formam **Pleistoannelida**, o clado que reúne todos os anelídeos exceto Chaetopteridae. Errantia inclui os poliquetos errantes (Nereidae, Glyceridae) e Sedentaria inclui os sésseis e a Clitellata.',
          },
          {
            targetTaxon: 'Nereidae',
            correctSister: 'Glyceridae',
            explanation: '**Glyceridae** é o grupo-irmão direto de **Nereidae**: juntos formam **Errantia**, os poliquetos errantes. Ambas as famílias compartilham 2 pares de olhos multicelulares, palpos sólidos e vida livre predatória.',
          },
        ],
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
          '**Polychaeta** incluindo Chaetopteridae é **parafilético**: o ancestral comum de todos os poliquetos é a raiz de Annelida, que inclui também a Clitellata (excluída do agrupamento). Chaetopteridae é grupo-irmão de todo Pleistoannelida (Errantia + Sedentaria), enquanto Nereidae e Glyceridae estão em Errantia e Siboglinidae, Sabellidae, Echiuridae estão em Sedentaria. Os poliquetos não formam um clado exclusivo — Clitellata evoluiu de dentro do grupo.',
      },
    ],
  },
];
