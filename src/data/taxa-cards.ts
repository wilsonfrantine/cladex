// ─── Taxa Cards — fonte única para cards de colecionáveis e curadoria PhyloPic ──
//
// Cada entrada define:
//   • O animal emblemático do grupo (usado para buscar silhueta no PhyloPic)
//   • Sinapomorfias do clado (conteúdo educacional do card)
//   • Características biológicas notáveis do grupo
//   • Fun fact memorável
//
// Para regenerar phylopic-cache.ts:  npm run curate-phylopic
// Documentação do sistema: docs/COLLECTIBLES.md

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'fossil'

export interface EmblematicAnimal {
  /** Nome popular do animal representativo — usado para busca no PhyloPic */
  commonName: string
  /** Nome científico do representante */
  scientificName: string
  /** Query de busca para PhyloPic (pode ser mais genérico que o nome científico) */
  phylopicQuery: string
}

export interface TaxonCard {
  /** Nome do táxon — deve corresponder ao nome de folha nas árvores Newick */
  taxon: string
  /** Módulo de treino ao qual pertence */
  module: string
  rarity: Rarity
  emblematicAnimal: EmblematicAnimal
  /** 2–3 sinapomorfias que definem o clado (em português, acessíveis) */
  synapomorphies: string[]
  /** 3–4 características biológicas notáveis do grupo */
  bioFeatures: string[]
  /** Um fato surpreendente ou memorável */
  funFact: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANNELIDA
// ─────────────────────────────────────────────────────────────────────────────

const annelida: TaxonCard[] = [
  {
    taxon: 'Chaetopteridae',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Parchment tube worm',
      scientificName: 'Chaetopterus variopedatus',
      phylopicQuery: 'Chaetopteridae',
    },
    synapomorphies: [
      'Corpo altamente modificado em regiões com parapódios especializados',
      'Secretam muco bioluminescente azul-esverdeado',
    ],
    bioFeatures: [
      'Vivem em tubos de pergaminho em forma de U enterrados no sedimento',
      'Criam uma corrente de água com parapódios em forma de leque para filtrar alimento',
      'Podem se regenerar a partir de fragmentos do corpo',
      'Bioluminescência intensa — visível a olho nu no escuro',
    ],
    funFact: 'Chaetopterus produz muco bioluminescente tão brilhante que pescadores da Califórnia o usavam como isca luminosa à noite.',
  },
  {
    taxon: 'Nereidae',
    module: 'annelida',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Ragworm',
      scientificName: 'Alitta virens',
      phylopicQuery: 'Nereidae',
    },
    synapomorphies: [
      'Prostômio com 4 pares de tentáculos e olhos compostos',
      'Faringe eversível com mandíbulas esclerotizadas (jaws)',
      'Parapódios biremes bem desenvolvidos',
    ],
    bioFeatures: [
      'Predadores ativos — capturam presas com a faringe eversível',
      'Alguns membros são epítoco: durante reprodução, a região posterior se transforma em indivíduo nadador (epitoca)',
      'Palolo worm (Eunice viridis) emerge sincronizado com a lua cheia — tradição alimentar na Polinésia',
    ],
    funFact: 'O "worm epitoca" de Palolo é tão previsível que populações polinésias calculam datas de festas pela sua emergência lunar — uma das primeiras formas humanas de astronomia aplicada.',
  },
  {
    taxon: 'Glyceridae',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Bloodworm',
      scientificName: 'Glycera dibranchiata',
      phylopicQuery: 'Glyceridae',
    },
    synapomorphies: [
      'Faringe eversível com 4 mandíbulas conectadas a glândulas de veneno',
      'Corpo cilíndrico com prostômio cônico e pontudo',
    ],
    bioFeatures: [
      'Únicas anelídeos com mandíbulas contendo cobre (atacagine) — metal raro em estruturas biológicas',
      'Hemoglobina extracelular confere coloração vermelha intensa ao sangue',
      'Vivem em galerias no sedimento, emergindo para predar',
      'Mandíbulas tão duras quanto os dentes humanos apesar de serem proteínas',
    ],
    funFact: 'As mandíbulas de Glycera são feitas de uma proteína-cobre chamada atacagine — o único material biológico tão duro quanto minerais. Pesquisadores estudam para criar materiais sintéticos.',
  },
  {
    taxon: 'Siboglinidae',
    module: 'annelida',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Giant tube worm',
      scientificName: 'Riftia pachyptila',
      phylopicQuery: 'Riftia pachyptila',
    },
    synapomorphies: [
      'Ausência completa de trato digestivo (boca, intestino e ânus) no adulto',
      'Trofossoma: órgão repleto de bactérias quimiossintetizantes endossimbiontes',
      'Plumas branquiais vermelhas com hemoglobina transportadora de H₂S e O₂',
    ],
    bioFeatures: [
      'Vivem exclusivamente em fontes hidrotermais do fundo oceânico (>2.500 m)',
      'Sobrevivem inteiramente da quimiossiombionse — sem fotossíntese, sem digestão',
      'Podem crescer mais de 1,5 m — os maiores anelídeos conhecidos',
      'Descobertos apenas em 1977, revolucionaram a biologia de ecossistemas',
    ],
    funFact: 'Riftia pachyptila é o ser vivo que cresce mais rápido para seu tamanho — pode aumentar 85 cm em um ano, provando que vida complexa pode existir sem luz solar.',
  },
  {
    taxon: 'Sabellidae',
    module: 'annelida',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Feather duster worm',
      scientificName: 'Spirobranchus giganteus',
      phylopicQuery: 'Sabellida',
    },
    synapomorphies: [
      'Coroa de radiolas (tentáculos branquiais) em espiral para filtração e respiração',
      'Tubo secretado pelo próprio animal (quitina, carbonato de cálcio ou muco)',
    ],
    bioFeatures: [
      'Filtram partículas em suspensão com cílios nas radiolas',
      'Retração instantânea do tubo diante de predadores ou sombras',
      'Algumas espécies vivem encrustadas em corais (Spirobranchus)',
      'Reprodução por fragmentação ou gametas liberados no plâncton',
    ],
    funFact: 'O verme-árvore-de-natal (Spirobranchus giganteus) cresce diretamente dentro de corais vivos — o coral cresce em volta do tubo do verme, criando uma parceria acidental de décadas.',
  },
  {
    taxon: 'Echiuridae',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Spoon worm',
      scientificName: 'Bonellia viridis',
      phylopicQuery: 'Bonellia',
    },
    synapomorphies: [
      'Probóscide extensível em forma de colher (até 1 m) não retrátil para a cavidade do corpo',
      'Dimorfismo sexual extremo — machos microscópicos vivem dentro da fêmea',
    ],
    bioFeatures: [
      'O determinismo do sexo é ambiental: larvas que pousam sobre a fêmea tornam-se machos',
      'A probóscide de Bonellia é verde por bonelina — pigmento tóxico para outros organismos',
      'Fêmeas podem alcançar 15 cm; machos apenas 1–3 mm',
      'A bonelina tem propriedades antiparasitárias e está sendo estudada para farmácia',
    ],
    funFact: 'Em Bonellia viridis, o sexo do indivíduo não está definido no genoma — larvas neutras que encontram uma fêmea são "convertidas" em machos por hormônios dela. Sexo como epigenética extrema.',
  },
  {
    taxon: 'Naididae',
    module: 'annelida',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Tubifex worm',
      scientificName: 'Tubifex tubifex',
      phylopicQuery: 'Naididae',
    },
    synapomorphies: [
      'Cerdas capilares dorsais longas (em Naididae basais)',
      'Reprodução assexuada por fissão ou brotamento (paratomia) frequente',
    ],
    bioFeatures: [
      'Bioindicadores de poluição — tolerantes a baixo oxigênio e matéria orgânica em excesso',
      'Agitam a extremidade posterior para aumentar troca gasosa em ambientes hipóxicos',
      'Amplamente usados como alimento vivo em aquarismo',
      'Podem formar grumos pulsantes de milhares de indivíduos',
    ],
    funFact: 'Tubifex tubifex é usado por biólogos como "termômetro biológico" de rios — sua presença em alta densidade indica poluição orgânica severa. Quando desaparecem de um rio poluído em recuperação, é notícia positiva.',
  },
  {
    taxon: 'Aeolosomatidae',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Aeolosoma worm',
      scientificName: 'Aeolosoma hemprichi',
      phylopicQuery: 'Aeolosomatidae',
    },
    synapomorphies: [
      'Células epidérmicas com vacúolos de pigmento colorido (vermelho, laranja, verde)',
      'Cílios na região anterior (prostômio) — incomum em Annelida',
    ],
    bioFeatures: [
      'Minúsculos (<1 mm) — vivem em biofilmes de algas e bactérias',
      'Reproduzem-se quase exclusivamente por fissão transversal (paratomia)',
      'Sua posição filogenética debatida: Annelida basais ou grupo irmão dos demais',
      'Movem-se com cílios epidérmicos — locomoção ciliada rara em anelídeos',
    ],
    funFact: 'Aeolosoma é tão pequeno e transparente que os pesquisadores do século XIX pensavam que as gotículas coloridas no corpo eram olhos — eram vacúolos de pigmento, não fotorreceptores.',
  },
  {
    taxon: 'Lumbricidae',
    module: 'annelida',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Common earthworm',
      scientificName: 'Lumbricus terrestris',
      phylopicQuery: 'Lumbricidae',
    },
    synapomorphies: [
      'Clitelo: região glandular de espessamento cuticular para formação do casulo',
      'Hermafroditas com espermatecas para armazenar esperma de outro indivíduo',
      'Cerdas (setae) em número reduzido — 8 por segmento (oligoqueta = poucas cerdas)',
    ],
    bioFeatures: [
      'Ingerem terra e decompõem matéria orgânica, aerando e fertilizando o solo',
      'Charles Darwin dedicou 40 anos ao estudo de minhocas — seu último livro é sobre elas',
      'Respiram pela pele — devem manter a superfície corporal úmida',
      'Um único campo agrícola pode conter mais de 1 milhão de minhocas por hectare',
    ],
    funFact: 'Darwin calculou que minhocas movem 10 toneladas de solo por hectare por ano — um trabalho geológico. Ele chamou isso de "a mais poderosa força na história da agricultura".',
  },
  {
    taxon: 'Acanthobdellida',
    module: 'annelida',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Salmon leech',
      scientificName: 'Acanthobdella peledina',
      phylopicQuery: 'Acanthobdella',
    },
    synapomorphies: [
      'Cerdas nos primeiros 5 segmentos — único Hirudinomorpha com cerdas',
      'Somente ventosa posterior — sem ventosa anterior',
      'Coeloma reduzido mas ainda parcialmente presente (intermediário entre Oligochaeta e Hirudinea)',
    ],
    bioFeatures: [
      'Parasita exclusivo de salmonídeos de água fria (salmões, trutas)',
      'Grupo-irmão de todos os hirudíneos — posição filogenética crucial',
      'Extremamente raros — poucos espécimes coletados na história',
      'Evidência viva da transição de oligoquetas para sanguessugas',
    ],
    funFact: 'Acanthobdella peledina é chamada de "fóssil vivo dos anelídeos" — retém cerdas que os ancestrais de todas as sanguessugas tinham antes de perdê-las. É o elo perdido entre minhocas e sanguessugas.',
  },
  {
    taxon: 'Branchiobdellida',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Crayfish worm',
      scientificName: 'Branchiobdella parasita',
      phylopicQuery: 'Branchiobdella',
    },
    synapomorphies: [
      'Exatamente 14–15 segmentos em todos os membros (número fixo)',
      'Aparato bucal com mandíbulas quitinosas modificadas',
      'Commensais obrigatórios de crustáceos de água doce',
    ],
    bioFeatures: [
      'Vivem exclusivamente no corpo de lagostins de água doce',
      'A relação pode ser comensal, mutualista ou parasítica dependendo da densidade',
      'Removem fungos e detritos das brânquias — possivelmente benéficos em baixas densidades',
      'Altamente especializados: sem os lagostins não sobrevivem',
    ],
    funFact: 'Branchiobdellida têm o número de segmentos mais fixo do reino animal — sempre 14-15, independente da espécie. Isso é uma sinapomorfia tão rígida que é usada para identificá-los mesmo sem microscópio.',
  },
  {
    taxon: 'Hirudinea',
    module: 'annelida',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Medical leech',
      scientificName: 'Hirudo medicinalis',
      phylopicQuery: 'Hirudo medicinalis',
    },
    synapomorphies: [
      'Ventosas anterior e posterior bem desenvolvidas',
      'Coeloma completamente reduzido — substituído por tecido parenquimatoso',
      'Número fixo de 34 segmentos',
      'Ausência total de cerdas (perda secundária)',
    ],
    bioFeatures: [
      'Produzem hirudina — anticoagulante mais potente conhecido, usado em cirurgia vascular',
      'Cada sanguesuga pode ingerir até 5x seu peso em sangue em uma única refeição',
      'Usadas em microcirurgia moderna para prevenir trombose após reimplante de dedos',
      'Podem sobreviver até 1 ano sem se alimentar',
    ],
    funFact: 'Hirudo medicinalis é um dos poucos animais aprovados como "dispositivo médico" pela FDA dos EUA. Hoje são criadas em fazendas especializadas para uso em hospitais de cirurgia plástica e reconstrutiva.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  CHORDATA BASAL
// ─────────────────────────────────────────────────────────────────────────────

const chordataBasal: TaxonCard[] = [
  {
    taxon: 'Hemichordata',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Acorn worm',
      scientificName: 'Balanoglossus clavigerus',
      phylopicQuery: 'Hemichordata',
    },
    synapomorphies: [
      'Probóscide, colar e tronco (organização tripartite)',
      'Fendas faríngeas (homólogas às dos cordados)',
      'Estomocorda — divertículo da faringe anterior (debatido como precursor da notocorda)',
    ],
    bioFeatures: [
      'Grupo-irmão dos Echinodermata — juntos formam Ambulacraria, grupo-irmão dos Chordata',
      'Enteropneusta vivem em tubos ou galerias no sedimento',
      'Pterobranchos são coloniais e secretam tubos de quitina',
      'Larvae tornaria morfologicamente idêntica à larva Auricularia de equinodermos',
    ],
    funFact: 'A larva tornaria de hemicordados e a larva auricularia de ouriços-do-mar são tão similares que por décadas os zoólogos não sabiam se eram o mesmo animal. É a evidência mais visual da unidade Ambulacraria.',
  },
  {
    taxon: 'Echinodermata',
    module: 'chordata-basal',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Ochre sea star',
      scientificName: 'Pisaster ochraceus',
      phylopicQuery: 'Asteroidea',
    },
    synapomorphies: [
      'Simetria radial pentâmera no adulto (bilateral na larva)',
      'Sistema vascular aquífero (canais hidráulicos internos)',
      'Endoesqueleto de ossículos calcários com espinhos (dermato-esqueleto)',
      'Células musculares mesodérmicas de tecido "mutable connective tissue"',
    ],
    bioFeatures: [
      'Eversão do estômago para fora do corpo para digerir presas maiores que a boca',
      'Pés ambulacrais (podias) movidos por pressão hidráulica',
      'Regeneração notável — estrelas podem regerar braços inteiros, ou um braço pode regerar um corpo',
      'Ouriços-do-mar têm lanterna de Aristóteles — aparato mastigador único',
    ],
    funFact: 'Pisaster ochraceus foi o animal em que o conceito de "espécie-chave" foi descoberto (Robert Paine, 1966). Quando removido experimentalmente de um costão, a biodiversidade colapsou — provou que uma única espécie pode estruturar todo um ecossistema.',
  },
  {
    taxon: 'Cephalochordata',
    module: 'chordata-basal',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Lancelet',
      scientificName: 'Branchiostoma lanceolatum',
      phylopicQuery: 'Cephalochordata',
    },
    synapomorphies: [
      'Notocorda persistente ao longo de toda a vida (não substituída por vértebras)',
      'Cordão nervoso dorsal com vesícula pigmentada anterior (fotorreceptor primitivo)',
      'Fendas faríngeas numerosas para filtração (>100 pares)',
    ],
    bioFeatures: [
      'Grupo-irmão dos Vertebrata + Urochordata — preservam a morfologia ancestral dos cordados',
      'Não têm crânio, cérebro verdadeiro, ou coração — mas têm todos os caracteres diagnósticos de Chordata',
      'Enterram-se na areia com apenas a extremidade anterior exposta para filtrar',
      'O genoma de Branchiostoma é considerado o mais conservado entre os deuterostômios',
    ],
    funFact: 'Anfioxo (Branchiostoma) é o animal mais estudado para entender como os vertebrados evoluíram. Seu genoma contém os mesmos genes Hox dos vertebrados, mas sem as duplicações que criaram a complexidade das vértebras.',
  },
  {
    taxon: 'Urochordata',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Sea squirt',
      scientificName: 'Ciona intestinalis',
      phylopicQuery: 'Urochordata',
    },
    synapomorphies: [
      'Túnica: cobertura externa de tunicina (polissacarídeo similar à celulose)',
      'Larva com notocorda, cordão nervoso dorsal e cauda — adulto séssil e regressivo',
      'Coração com reversão periódica de fluxo sanguíneo',
    ],
    bioFeatures: [
      'Grupo-irmão dos Vertebrata (não Cephalochordata) — surpreendeu filogenias moleculares',
      'Larva é um mini-cordado em forma de girino; metamorfose reabsorve notocorda e cerebro',
      'Vanadócitos: células que concentram vanádio do mar (função desconhecida)',
      'Algumas espécies são coloniais e produzem toxinas alcalóides com potencial antitumoral',
    ],
    funFact: 'A metamorfose de Ciona intestinalis é uma regressão: a larva tem notocorda e cérebro; o adulto não. Dawkins chamou isso de "suicídio cerebral adaptativo" — o animal "consome" seu próprio sistema nervoso ao se fixar.',
  },
  {
    taxon: 'Myxini',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Atlantic hagfish',
      scientificName: 'Myxine glutinosa',
      phylopicQuery: 'hagfish',
    },
    synapomorphies: [
      'Ausência de vértebras (apenas notocorda persistente)',
      'Crânio cartilaginoso sem mandíbulas (Agnatha)',
      'Dentes queratinosos em placas linguais (não homólogos aos dentes de gnatostomados)',
      'Glândulas produtoras de muco altamente desenvolvidas',
    ],
    bioFeatures: [
      'Produzem litros de muco em segundos — mecanismo de defesa anti-predador único',
      'Únicas vertebrados com fluidos corporais isosmóticos ao mar',
      'Alimentam-se de carniça penetrando o corpo da presa por qualquer abertura',
      'Nó gordiano: enroscam o próprio corpo em nó para se soltar de superfícies e raspar comida',
    ],
    funFact: 'O muco de Myxine é composto de filamentos de proteína 10.000 vezes mais finos que um cabelo humano — os mais resistentes por espessura conhecidos na natureza. Startups estão desenvolvendo alternativas ao nylon e kevlar baseadas nesse muco.',
  },
  {
    taxon: 'Petromyzontida',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Sea lamprey',
      scientificName: 'Petromyzon marinus',
      phylopicQuery: 'Petromyzontida',
    },
    synapomorphies: [
      'Disco oral com dentículos queratinosos para hematofagia',
      '7 pares de aberturas branquiais externas (sem opérculo)',
      'Larva ammocete: filtrador cego, sem olhos funcionais, morfologia completamente diferente do adulto',
    ],
    bioFeatures: [
      'Parasitas hematófagos de peixes — boca sugadora com dentes para raspar escamas',
      'A larva ammocete vive enterrada no sedimento por 3–7 anos antes da metamorfose',
      'Migração reprodutiva fluvial idêntica à de salmões — convergência evolutiva',
      'Introduzidos acidentalmente nos Grandes Lagos no séc. XX, colapsaram pescarias de US$7 bilhões',
    ],
    funFact: 'A larva de lampreia e o adulto são tão diferentes que por 150 anos foram classificados como espécies distintas. Johann Müller só descobriu em 1856 que "Ammocoetes branchialis" era a larva de Petromyzon — uma das maiores confusões da zoologia.',
  },
  {
    taxon: 'Chondrichthyes',
    module: 'chordata-basal',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Great white shark',
      scientificName: 'Carcharodon carcharias',
      phylopicQuery: 'Carcharodon carcharias',
    },
    synapomorphies: [
      'Endoesqueleto inteiramente cartilaginoso (não ossificado)',
      'Escamas placóides (denticles dérmicos) homólogas aos dentes',
      'Fertilização interna com claspers (pterigopodia) nos machos',
      'Ausência de vesica natatoria — planam por meio de fígado rico em esqualeno',
    ],
    bioFeatures: [
      'Tubarões têm electroreceptores (ampolas de Lorenzini) que detectam campos elétricos de 0,005 μV',
      'Dentes em fileiras — substituídos continuamente ao longo da vida (polifilodontia)',
      'Coelacanth e tubarões compartilham o sistema de uréia para osmorregulação',
      'Algumas espécies de tubarões têm partenogênese — fêmeas geram filhotes sem macho',
    ],
    funFact: 'Os tubarões detectam o campo elétrico gerado pelo coração de uma presa enterrada no areia a vários metros de distância. As ampolas de Lorenzini são tão sensíveis que tubarões às vezes mordem cabos de alta tensão submarinos confundindo com presas.',
  },
  {
    taxon: 'Actinopterygii',
    module: 'chordata-basal',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Atlantic salmon',
      scientificName: 'Salmo salar',
      phylopicQuery: 'Actinopterygii',
    },
    synapomorphies: [
      'Nadadeiras suportadas por raios de osso (actinopterígio = nadadeira de raio)',
      'Vesica natatoria (bexiga natatória) para controle de flutuabilidade',
      'Opérculo ósseo cobrindo as câmaras branquiais',
    ],
    bioFeatures: [
      'Grupo mais especioso de vertebrados — >30.000 espécies, mais que todos os outros vertebrados juntos',
      'Peixe elétrico (Electrophorus): gera até 860V — mais alto voltagem de qualquer animal',
      'Peixe-bola (Tetraodontidae): tetrodotoxina mais potente que cianeto, sem antídoto',
      'Piranha: dentes serrilhados substituídos em sincronia para manter capacidade de corte constante',
    ],
    funFact: 'O peixe-lua (Mola mola) é o animal mais fértil do mundo: produz até 300 milhões de ovos por desova. Mesmo assim, quase todos os filhotes morrem — apenas 2 sobrevivem em média para compensar. É a aposta de um casino num só animal.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  AMNIOTA
// ─────────────────────────────────────────────────────────────────────────────

const amniota: TaxonCard[] = [
  {
    taxon: 'Amphibia',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Poison dart frog',
      scientificName: 'Dendrobates tinctorius',
      phylopicQuery: 'Anura',
    },
    synapomorphies: [
      'Pele permeável e glandular (sem escamas) — respiração cutânea',
      'Ovo sem âmnio (ovipositam em água ou ambientes úmidos)',
      'Metamorfose com larva aquática (girino) e adulto terrestre',
    ],
    bioFeatures: [
      'Algumas peles contêm batracotoxinas — mais potentes que qualquer veneno de cobra',
      'Pernas posteriores elongadas — saltação como locomoção primária',
      'Detectam presas com visão binocular e língua adesiva de alta velocidade',
      'Rãs de árvore possuem almofadas adesivas com microestruturas que criam adesão por capilaridade',
    ],
    funFact: 'Dendrobates tinctorius em cativeiro perde sua toxicidade — porque a fonte das batracotoxinas são as formigas e besouros que comem na natureza. A rã não fabrica o veneno: ela acumula e "recicla" venenos de sua dieta.',
  },
  {
    taxon: 'Mammalia',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'African lion',
      scientificName: 'Panthera leo',
      phylopicQuery: 'lion',
    },
    synapomorphies: [
      'Pelos (pili) — exclusivos de Mammalia, derivados de folículos epidérmicos',
      'Glândulas mamárias para lactação dos filhotes',
      'Mandíbula inferior de um único osso (dentário) — em répteis são vários ossos',
      'Três ossículos do ouvido médio (martelo, bigorna, estribo)',
    ],
    bioFeatures: [
      'Endotermia (sangue quente) — temperatura corporal regulada metabolicamente',
      'Diafragma muscular separa cavidades torácica e abdominal',
      'Dentição heterodonte e tecodonte (dentes em alvéolos)',
      'Córtex cerebral neocórtex relativamente expandido',
    ],
    funFact: 'O rugido de um leão pode ser ouvido a 8 km de distância. A estrutura especial da laringe — com pregas vocais quadradas em vez de triangulares — é uma sinapomorfia dos quatro "grandes felinos" (Panthera) que convergiram independentemente na capacidade de rugir.',
  },
  {
    taxon: 'Squamata',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Komodo dragon',
      scientificName: 'Varanus komodoensis',
      phylopicQuery: 'Squamata',
    },
    synapomorphies: [
      'Língua bífida com órgão de Jacobson para quimiorrecepção aérea',
      'Hemipênis: dois órgãos copulatórios (estruturais, não funcionais simultaneamente)',
      'Quadrado kinético — mobilidade adicional do crânio para engolir presas grandes',
    ],
    bioFeatures: [
      'Grupo mais diverso de répteis: >10.000 espécies de lagartos e cobras',
      'Cobras: perda de pernas (vestigial em boas e pítons — esporões pélvicos)',
      'Dragão de Komodo: saliva contém anticoagulantes e veneno de baixa pressão sanguínea',
      'Gekkonidae: lamelas com 100.000 setas de queratina por cm² — adesão molecular (van der Waals)',
    ],
    funFact: 'Varanus komodoensis pode se reproduzir partenogeneticamente — fêmeas isoladas geram filhotes machos a partir de ovos não fertilizados. Em 2006, uma dragona em zoo produziu filhotes sem qualquer contato com machos, confirmando partenogênese por primeira vez na espécie.',
  },
  {
    taxon: 'Testudines',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Leatherback sea turtle',
      scientificName: 'Dermochelys coriacea',
      phylopicQuery: 'Testudines',
    },
    synapomorphies: [
      'Carapaça: fusão das costelas e vértebras dorsais com derme endurecida',
      'Plastron: série de ossos ventrais homólogos à cintura peitoral e clavículas modificadas',
      'Bico córneo sem dentes (edêntula)',
    ],
    bioFeatures: [
      'Único réptil com termogênese — Dermochelys mantém temperatura corporal >18°C acima da água',
      'Navegação por campo magnético terrestre — tartarugas retornam à praia natal décadas depois',
      'Carapaça de Dermochelys é de cartilagem, não osso — única tartaruga sem placas ósseas',
      'Podem mergulhar a >1.000 m e conter a respiração por >85 minutos',
    ],
    funFact: 'A temperatura de incubação dos ovos determina o sexo das tartarugas marinhas. Com o aquecimento global, praias mais quentes estão produzindo populações com >90% de fêmeas — uma ameaça existencial que não tem precedente evolutivo.',
  },
  {
    taxon: 'Crocodilia',
    module: 'amniota',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Nile crocodile',
      scientificName: 'Crocodylus niloticus',
      phylopicQuery: 'Crocodilia',
    },
    synapomorphies: [
      'Palato secundário ósseo completo — permite respirar com a boca cheia de água/presa',
      'Coração com 4 câmaras (convergência com aves e mamíferos)',
      'Alvéolos uniloculares e sistema de respiração unidirecional (como aves)',
    ],
    bioFeatures: [
      'Grupo-irmão das Aves — os "jacarés" são mais próximos dos pássaros que das outras lagartas',
      'Cuidado parental elaborado: transportam filhotes na boca, protegem ninhos',
      'Integumentos sensoriais (ISOs): detectam vibração e campo elétrico na água',
      'A mordida de crocodiliano é a mais forte já medida em animal vivo: >3.000 kg',
    ],
    funFact: 'Crocodilos têm respiração de fluxo unidirecional como aves — o ar passa pelo pulmão em uma única direção sem reversão, maximizando a extração de O₂. Isso foi descoberto em 2010 e foi um choque: ninguém esperava isso em um "réptil".',
  },
  {
    taxon: 'Aves',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Golden eagle',
      scientificName: 'Aquila chrysaetos',
      phylopicQuery: 'Aquila',
    },
    synapomorphies: [
      'Penas: estruturas de queratina beta com bárbulas e barbicelas com ganchos',
      'Fúrcula (wishbone): fusão das clavículas — armazena energia elástica no voo',
      'Ossos pneumatizados (ocos) conectados ao sistema de sacos aéreos',
      'Ausência de dentes (Neornithes) — substituídos por bico córneo',
    ],
    bioFeatures: [
      'Sistema respiratório de 9 sacos aéreos: fluxo contínuo unidirecional mais eficiente que qualquer mamífero',
      'Visão tetracromática: veem UV — coberturas de ninho refletem UV para machos avaliarem qualidade',
      'Bússola magnética e mapa solar integrados para navegação migratória',
      'Bico e garras de queratina crescem continuamente como unhas',
    ],
    funFact: 'Aves são dinossauros terópodos que sobreviveram ao K-Pg. Quando você vê um pardal, vê um dinossauro que evoluiu penas, pulmão de sacos aéreos e endotermia há 230 Ma e sobreviveu à extinção de massa que eliminou todos os seus parentes de 65 Ma.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  ARTHROPODA
// ─────────────────────────────────────────────────────────────────────────────

const arthropoda: TaxonCard[] = [
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

// ─────────────────────────────────────────────────────────────────────────────
//  METAZOA
// ─────────────────────────────────────────────────────────────────────────────

const metazoa: TaxonCard[] = [
  {
    taxon: 'Porifera',
    module: 'metazoa',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Giant barrel sponge',
      scientificName: 'Xestospongia muta',
      phylopicQuery: 'Porifera',
    },
    synapomorphies: [
      'Sem simetria, sem tecidos verdadeiros (Parazoa)',
      'Coanócitos: células flageladas para criar corrente d\'água e filtrar',
      'Espículas de SiO₂, CaCO₃ ou espongina para suporte estrutural',
    ],
    bioFeatures: [
      'Grupo-irmão de todos os outros metazoários — biologicamente mais antigo',
      'Filtram até 20.000 vezes seu volume em água por dia',
      'Produzem mais compostos bioativos por grama que qualquer outro filo — farmácia do oceano',
      'Xestospongia muta pode viver mais de 2.300 anos — um dos animais mais longevos',
    ],
    funFact: 'Esponjas não têm neurônios, mas coordenam o fechamento de poros em resposta a estímulos — usando difusão de Ca²⁺ entre células. É como se cada célula tomasse uma decisão coletiva sem cérebro. Isso levou biólogos a repensar o que significa "comportamento" em animais.',
  },
  {
    taxon: 'Cnidaria',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Lion\'s mane jellyfish',
      scientificName: 'Cyanea capillata',
      phylopicQuery: 'Medusozoa',
    },
    synapomorphies: [
      'Cnidócitos: células urticantes com nematocisto — estrutura única no reino animal',
      'Simetria radial e duas camadas germinativas (diblásticos)',
      'Ciclo de vida com alternância medusoide-polipoide em muitas espécies',
    ],
    bioFeatures: [
      'Corais: holobiontes — animal + alga (zooxantela) em simbiose que constrói recifes',
      'Turritopsis dohrnii é biologicamente imortal — regride ao estado larval após reprodução',
      'Hydra: sem senescência detectável — "não envelhecem" em condições laboratoriais',
      'Siphonophorae (ex: caravela-portuguesa): colonial — é uma colônia de indivíduos especializados, não um animal único',
    ],
    funFact: 'Turritopsis dohrnii é chamada de "medusa imortal" — após reprodução, reverte para pólipo jovem e recomeça o ciclo indefinidamente. Biologicamente é imortal; ecologicamente morre de predação e doença. Pesquisadores estudam seus genes de rejuvenescimento para medicina.',
  },
  {
    taxon: 'Platyhelminthes',
    module: 'metazoa',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Planarian flatworm',
      scientificName: 'Dugesia tigrina',
      phylopicQuery: 'Platyhelminthes',
    },
    synapomorphies: [
      'Corpo achatado dorso-ventralmente (sem coeloma)',
      'Sistema nervoso com gangânglios cerebrais e cordões nervosos longitudinais',
      'Protonefridios com células-chama para excreção',
    ],
    bioFeatures: [
      'Regeneração extrema: cortados em 200 pedaços, cada fragmento regenera um indivíduo completo',
      'Tênia (Cestoda): sem trato digestivo — absorvem nutrientes diretamente pela pele',
      'Dugesia: caça com faringe eversível muscular extensível',
      'Polycladida: planárias marinhas com cores aposemáticas neon',
    ],
    funFact: 'Planárias podem ser "ensinadas" a navegar num labirinto. Quando cortadas ao meio e a cabeça é regenerada, o novo animal "lembra" o labirinto mesmo com um cérebro completamente novo. A memória pode estar armazenada fora do cérebro — hipótese que chocou neurocientistas em 2013.',
  },
  {
    taxon: 'Mollusca',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Giant Pacific octopus',
      scientificName: 'Enteroctopus dofleini',
      phylopicQuery: 'octopus',
    },
    synapomorphies: [
      'Manto: cobertura muscular que delimita a cavidade do manto',
      'Rádula: órgão raspador com denticles quitinosos (ausente em bivalves)',
      'Pé muscular ventral modificado conforme o grupo (pé, tentáculos, velum)',
    ],
    bioFeatures: [
      'Polvos: 3 corações, sangue azul, inteligência comparável a vertebrados',
      'Lulas: tinta de defesa, cromatóforos para comunicação e camuflagem',
      'Nautilus: concha espiral com câmaras de gás — sobreviveu 500 Ma sem mudanças',
      'Cefalópodes: 2/3 dos neurônios estão nos braços — inteligência distribuída',
    ],
    funFact: 'Polvos podem "ver" cores apesar de serem daltônicos — sua pupila em forma de W permite detectar polarização da luz, que varia com a cor mesmo em animais sem fotorreceptores de cores. É visão de cores sem cones de cor.',
  },
  {
    taxon: 'Annelida',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Common earthworm',
      scientificName: 'Lumbricus terrestris',
      phylopicQuery: 'Annelida',
    },
    synapomorphies: [
      'Metamerismo verdadeiro: repetição de órgãos em segmentos (inclusive nervoso, excretor e reprodutivo)',
      'Setas (cerdas) de quitina para locomoção',
      'Celoma verdadeiro dividido por septos intersegmentais',
    ],
    bioFeatures: [
      'Grupo com maior diversidade de estratégias de vida: poliquetas marinhos, minhocas, sanguessugas',
      'Siboglinidae (pogonóforos): sem intestino, vivem de quimiosimbiose',
      'Hirudinea: anticoagulantes de interesse farmacêutico',
      'Poliquetas: cabeça com olhos, tentáculos e mandíbulas — neurologia sofisticada para "vermes"',
    ],
    funFact: 'Darwin dedicou os últimos anos de sua vida a estudar minhocas, publicando em 1881 "The Formation of Vegetable Mould Through the Action of Worms". Ele calculou que minhocas enterram estruturas rochosas romanas em 50 anos — a primeira geologia biológica.',
  },
  {
    taxon: 'Nematoda',
    module: 'metazoa',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'C. elegans',
      scientificName: 'Caenorhabditis elegans',
      phylopicQuery: 'Nematoda',
    },
    synapomorphies: [
      'Cutícula de colágeno trilaminar com fibras em hélice — trocada 4x durante desenvolvimento',
      'Faringe muscular bilobada em forma de tubo',
      'Sistema excretor com tubo único (não protonefridios)',
    ],
    bioFeatures: [
      'C. elegans: primeiro animal com mapa completo de neurônios (connectome) — 302 neurônios, 7.000 sinapses',
      'Número de células somáticas completamente fixo: 959 em fêmeas, 1.031 em machos',
      'Parasitoide de quase todos os animais — possivelmente mais de 50% dos animais têm nematódeos parasitas',
      'Nematodes de solo: até 4.4 milhões por m² — o grupo mais abundante de animais multicelulares',
    ],
    funFact: 'C. elegans foi o primeiro animal a ter seu genoma completamente sequenciado (1998) e o único com mapa completo de conexões neurais. Quando Sydney Brenner escolheu este verme de 1mm como modelo em 1965, foi considerado excêntrico. Ele ganhou o Nobel em 2002.',
  },
  {
    taxon: 'Arthropoda',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Blue morpho butterfly',
      scientificName: 'Morpho menelaus',
      phylopicQuery: 'Arthropoda',
    },
    synapomorphies: [
      'Exoesqueleto de quitina com articulações — "arthro-poda" = patas articuladas',
      'Apêndices articulados com musculatura intrínseca',
      'Crescimento por ecdise (muda) — controlado por ecdisona (hormônio)',
    ],
    bioFeatures: [
      'Grupo mais diverso de animais: >1.2 milhões de espécies descritas',
      'Olhos compostos: centenas de omatídeos — excelente detecção de movimento',
      'Hemocele: cavidade corporal com hemolinfa (não sangue circundando em vasos fechados)',
      'Antenas como órgãos multimodais: olfato, vibração, propriocepção',
    ],
    funFact: 'A cor azul do Morpho não vem de pigmento — é estrutural. Nanoestruturas de quitina nas asas interferem com o comprimento de onda azul, refletindo-o enquanto absorvem outros. A cor muda dependendo do ângulo — o que inspira tecidos e telas que não desbotam.',
  },
  {
    taxon: 'Echinodermata',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Crown-of-thorns starfish',
      scientificName: 'Acanthaster planci',
      phylopicQuery: 'Asteroidea',
    },
    synapomorphies: [
      'Simetria pentarradial no adulto',
      'Sistema vascular aquífero com podias (pés ambulacrais hidráulicos)',
      'Endoesqueleto mesodérmico de ossículos calcários',
    ],
    bioFeatures: [
      'Grupo-irmão dos cordados — Deuterostomia: blastóporo vira ânus, boca é secundária',
      'Pepino-do-mar: expele órgãos viscerais (evisceration) como defesa e os regenera',
      'Ouriço-do-mar: sistema imune é mais de 10x mais complexo que o humano em número de genes',
      'Estrelas-do-mar: digerem mexilhões inserindo o estômago pela fenda entre as valvas',
    ],
    funFact: 'Ouriços-do-mar têm >23.000 genes imunes — mais que humanos (20.000-25.000 total). Isso parece paradoxal até entender que sem sistema adaptativo, cada patógeno precisa de um receptor específico no sistema inato — mais patógenos, mais genes.',
  },
  {
    taxon: 'Chordata',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Blue whale',
      scientificName: 'Balaenoptera musculus',
      phylopicQuery: 'Chordata',
    },
    synapomorphies: [
      'Notocorda: estrutura de suporte axial (substituída por vértebras nos vertebrados adultos)',
      'Cordão nervoso dorsal oco (vs. cadeia nervosa ventral dos invertebrados)',
      'Fendas faríngeas (branquiais) pelo menos na ontogenia',
      'Cauda pós-anal muscular',
    ],
    bioFeatures: [
      'Maior animal já vivo: 30 m, 170 toneladas — coração do tamanho de um carro pequeno',
      'Canto de baleia-jubarte: composições com estrutura rítmica que mudam ao longo de anos',
      'Anfioxo e tunicados preservam os quatro caracteres diagnósticos sem vértebras',
      'Cefalocordados têm >100 pares de fendas faríngeas — mais que qualquer vertebrado',
    ],
    funFact: 'A baleia azul tem um coração que bate 2 vezes por minuto em mergulho profundo — e 30 vezes em superfície. Ao parar para fazer uma foto de close-up, pesquisadores mediram o sinal elétrico do ECG a 2 metros de distância sem contato — através da água.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Export unificado
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_TAXA_CARDS: TaxonCard[] = [
  ...annelida,
  ...chordataBasal,
  ...amniota,
  ...arthropoda,
  ...metazoa,
]

/** Lookup rápido: taxon name → card */
export const TAXA_CARDS_BY_TAXON: Record<string, TaxonCard> =
  Object.fromEntries(ALL_TAXA_CARDS.map(c => [c.taxon, c]))
