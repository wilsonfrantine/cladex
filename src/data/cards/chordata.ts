import type { TaxonCard } from './types'

export const chordata: TaxonCard[] = [
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
    funFact: 'Pisaster ochraceus foi o animal em que o concept de "espécie-chave" foi descoberto (Robert Paine, 1966). Quando removido experimentalmente de um costão, a biodiversidade colapsou — provou que uma única espécie pode estruturar todo um ecossistema.',
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
      'Fertilização interna with claspers (pterigopodia) nos machos',
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
