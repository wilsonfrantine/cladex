import type { TaxonCard } from './types'

export const arthropoda: TaxonCard[] = [
  {
    taxon: 'Onychophora',
    module: 'arthropoda',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Velvet worm',
      scientificName: 'Peripatoides novaezealandiae',
      phylopicQuery: 'Onychophora',
    },
    synapomorphies: [
      'Lobópodos: apêndices não-segmentados, cilíndricos, não articulados (contraste com artópodos)',
      'Glândulas de muco oral para captura de presas — ejetam filamentos adesivos a >30 cm',
      'Cutícula fina e permeável com papilas — não quitinosa como artrópodos',
    ],
    bioFeatures: [
      'Grupo-irmão dos Arthropoda — preservam morfologia do ancestral comum com artrópodes',
      'Vivem em florestas tropicais úmidas sob troncos apodrecidos',
      'Pulmões traqueais convergentes com insetos — evolução independente',
      'Cooperação social em algumas espécies: fêmea maior partilha presa capturada com grupo',
    ],
    funFact: 'O muco adesivo de Peripatoides é disparado por duas "bocas" laterais a 30 cm com precisão cirúrgica. O filamento endurece ao contato com o ar em milissegundos — é tão eficaz que pesquisadores estudam para desenvolver adesivos cirúrgicos biomiméticos.',
  },
  {
    taxon: 'Arachnida',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Emperor scorpion',
      scientificName: 'Pandinus imperator',
      phylopicQuery: 'Scorpiones',
    },
    synapomorphies: [
      'Cefalotórax e abdômen (tagmose característica)',
      'Quatro pares de patas locomotoras no prosoma',
      'Respiração por pulmões foliáceos ou traqueias',
    ],
    bioFeatures: [
      'Incluem aranhas, escorpiões, ácaros e opiliões',
      'Predadores terrestres que utilizam digestão extracorpórea',
      'Produzem seda (aranhas) ou venenos complexos para captura de presas',
      'Ácaros habitam quase todos os nichos, de desertos a folículos humanos',
    ],
    funFact: 'Escorpiões brilham com uma cor azul-esverdeada fluorescente sob luz ultravioleta. O motivo biológico ainda é mistério — pode ser para detecção de luz solar ou sinalização entre indivíduos.',
  },
  {
    taxon: 'Araneae',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Black widow',
      scientificName: 'Latrodectus mactans',
      phylopicQuery: 'Araneae',
    },
    synapomorphies: [
      'Fiandeiras abdominais para produção de seda de teia',
      'Cintura estreita (pedicelo) conectando cefalotórax ao abdômen',
      'Quelíceras modificadas em presas com glândulas de veneno',
    ],
    bioFeatures: [
      'Engenheiras estruturais: criam teias complexas com diferentes tipos de seda',
      'Sentidos baseados em vibração — detectam presas pelo "toque" na teia',
      'Realizam cuidado parental em algumas espécies (ex: aranhas-lobo)',
      'A seda de aranha é um dos materiais mais resistentes da natureza',
    ],
    funFact: 'Algumas aranhas, como a aranha-pavão, realizam danças de acasalamento complexas com cores vibrantes que lembram rituais de pássaros, demonstrando coordenação motora surpreendente.',
  },
  {
    taxon: 'Coleoptera',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Hercules beetle',
      scientificName: 'Dynastes hercules',
      phylopicQuery: 'Coleoptera',
    },
    synapomorphies: [
      'Élitros: primeiro par de asas modificado em capas rígidas protetoras',
      'Mandíbulas mastigadoras fortes e adaptadas a diversas dietas',
    ],
    bioFeatures: [
      'O grupo de animais mais diverso da Terra (1 em cada 4 animais é um besouro)',
      'Habitam quase todos os ambientes, incluindo desertos e água doce',
      'Besouros-bombardeiros ejetam sprays químicos quentes como defesa',
      'Larvas e adultos frequentemente possuem nichos alimentares distintos',
    ],
    funFact: 'Se todas as espécies conhecidas fossem colocadas em uma fila, a cada quatro animais, um seria um besouro. O biólogo J.B.S. Haldane disse que Deus deve ter "uma paixão excessiva por besouros".',
  },
  {
    taxon: 'Lepidoptera',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Monarch butterfly',
      scientificName: 'Danaus plexippus',
      phylopicQuery: 'Lepidoptera',
    },
    synapomorphies: [
      'Asas cobertas por escamas coloridas de quitina (Lepidoptera = asas de escama)',
      'Espiritromba: aparelho bucal sugador em forma de tromba enrolada',
    ],
    bioFeatures: [
      'Borboletas (diurnas) e mariposas (noturnas ou crepusculares)',
      'Ciclo de vida com metamorfose completa: ovo, lagarta, pupa e adulto',
      'Polinizadores cruciais para a reprodução de milhares de plantas',
      'Muitos realizam migrações continentais épicas (ex: borboleta monarca)',
    ],
    funFact: 'As cores das borboletas Morpho são "cores físicas" (estruturais). Elas não têm pigmento azul; as escamas têm nanoestruturas que refletem apenas a luz azul, criando um brilho metálico permanente.',
  },
  {
    taxon: 'Hymenoptera',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Honey bee',
      scientificName: 'Apis mellifera',
      phylopicQuery: 'Apis mellifera',
    },
    synapomorphies: [
      'Hâmulos: ganchos que prendem as asas anteriores às posteriores no voo',
      'Ovipositor modificado em ferrão (em muitas vespas, abelhas e formigas)',
    ],
    bioFeatures: [
      'Incluem abelhas, vespas e formigas',
      'Eussocialidade extrema: colônias complexas com divisão de trabalho',
      'Sistema de determinação do sexo haplodiploide (fêmeas 2n, machos n)',
      'Os principais polinizadores mundiais, garantindo a produção de alimentos',
    ],
    funFact: 'As formigas são "pastoras". Algumas espécies criam pulgões (áfidos) como gado, protegendo-os de predadores para "ordenhar" o líquido doce que eles secretam.',
  },
  {
    taxon: 'Diptera',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'House fly',
      scientificName: 'Musca domestica',
      phylopicQuery: 'Diptera',
    },
    synapomorphies: [
      'Haltérios (balancins): segundo par de asas modificado em órgãos de equilíbrio',
      'Apenas um par de asas funcionais (Diptera = duas asas)',
    ],
    bioFeatures: [
      'Incluem moscas, mosquitos e mutucas',
      'Aparelho bucal variado: lambedor, sugador ou picador-sugador',
      'Os voadores mais ágeis do mundo, capazes de manobras instantâneas',
      'Larvas (larvas de mosca) são essenciais para a decomposição orgânica',
    ],
    funFact: 'Os haltérios das moscas funcionam como giroscópios biológicos vibrando em alta frequência. Eles permitem que a mosca sinta rotações do corpo e corrija o voo em milissegundos, tornando-as quase impossíveis de pegar.',
  },
  {
    taxon: 'Chelicerata',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Black widow spider',
      scientificName: 'Latrodectus mactans',
      phylopicQuery: 'Araneae',
    },
    synapomorphies: [
      'Quelíceras: primeiro par de apêndices modificados em garra ou fang (não mandíbulas)',
      'Pedipalpos: segundo par de apêndices sensoriais e/ou reprodutivos',
      'Ausência de antenas — diagnóstico dos Chelicerata',
    ],
    bioFeatures: [
      'Aranhas: seda de proteína produzida em até 7 tipos de glândulas diferentes',
      'Caranguejo-ferradura (Limulus): sangue azul (hemocianina com cobre) — usado para testar endotoxinas',
      'Escorpiões: fluorescentes sob UV — a função do brilho ainda é debatida',
      'Ácaros (Acari): grupo mais diverso de quelicerados, incluindo vetores de doenças',
    ],
    funFact: 'A seda de aranha é 5 vezes mais resistente que aço de mesma espessura e pode se esticar 40% antes de romper. Nenhum material sintético consegue combinar resistência e elasticidade de forma similar — por isso empresas investem milhões tentando sintetizá-la artificialmente.',
  },
  {
    taxon: 'Myriapoda',
    module: 'arthropoda',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Giant centipede',
      scientificName: 'Scolopendra gigantea',
      phylopicQuery: 'Myriapoda',
    },
    synapomorphies: [
      'Forcípulas: primeiro par de patas modificado em órgão de veneno (em Chilopoda)',
      'Tronco homônomo: todos os segmentos com apêndices (exceto últimos)',
      'Olhos simples (oceli) — sem olhos compostos em Chilopoda',
    ],
    bioFeatures: [
      'Scolopendra gigantea caça vertebrados — incluindo morcegos capturados em voo',
      'Diplópodos (piolhos-de-cobra) secretam ácido cianídrico ou quinonas como defesa',
      'Sinfilos: miriápodos com >100 patas, mas só 12 segmentos funcionais — desconcertante',
      'Geophilomorpha: centopeias com até 177 pares de patas (o máximo em qualquer animal)',
    ],
    funFact: 'Nenhuma centopeia tem exatamente 100 patas. O número é sempre ímpar (cada segmento tem 2 patas, mais o segmento genitorial), então pode ser 42, 44, ..., 354 — mas nunca 100. "Centopeia" é o nome biologicamente mais errado da zoologia.',
  },
  {
    taxon: 'Crustacea',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Mantis shrimp',
      scientificName: 'Odontodactylus scyllarus',
      phylopicQuery: 'Brachyura',
    },
    synapomorphies: [
      'Nauplii: larva com 3 pares de apêndices (diagnóstico de Crustacea)',
      'Dois pares de antenas (antênulas + antenas)',
      'Glândulas maxilares ou antenais para excreção',
    ],
    bioFeatures: [
      'Crustacea são parafiléticos em relação a Insecta — insetos são crustáceos terrestres',
      'Caranguejo-ferradura-da-praia (Stomatopoda) tem 16 tipos de fotorreceptores (humanos têm 3)',
      'Soco de camarão-mantis: acelera a garra a 23 m/s, criando cavitação que mata presas mesmo sem contato',
      'Percevejo-do-mar (Isopoda) — parasitas que substituem a língua de peixes',
    ],
    funFact: 'O caranguejo-violinista (Uca) tem uma garra 6x maior que o corpo — e a usa para tocar "músicas" na areia para atrair fêmeas. O ritmo e amplitude do balançar é avaliado pelas fêmeas com critérios tão precisos quanto os de um concurso musical.',
  },
  {
    taxon: 'Insecta',
    module: 'arthropoda',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Honey bee',
      scientificName: 'Apis mellifera',
      phylopicQuery: 'Apis mellifera',
    },
    synapomorphies: [
      'Três pares de patas (hexápoda)',
      'Três tagmas: cabeça, tórax e abdômen',
      'Um par de antenas e olhos compostos',
      'Tráqueas: rede de tubos de quitina para respiração direta às células',
    ],
    bioFeatures: [
      'Grupo mais diverso de animais: ~1.000.000 espécies descritas (estimado: 5,5 milhões)',
      'Metamorfose completa (holometabolia) desacopla nichos ecológicos de larvas e adultos',
      'Abelhas: dança do waggle comunica direção e distância de flores com precisão de ±15°',
      'Formigas: colônias com divisão de trabalho, guerras, agricultura de fungos, escravidão de outras espécies',
    ],
    funFact: 'A dança das abelhas é a única linguagem simbólica não-humana conhecida — a abelha representa no favo a posição do sol, a direção da flor e a distância, tudo em código de ângulo e duração de vibração. Karl von Frisch ganhou o Nobel de 1973 por decodificá-la.',
  },
]
