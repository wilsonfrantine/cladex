import type { TaxonCard } from './types'

export const structural: TaxonCard[] = [
  {
    taxon: 'LUCA',
    module: 'metazoa',
    rarity: 'fossil',
    emblematicAnimal: {
      commonName: 'Ancestral Universal',
      scientificName: 'Last Universal Common Ancestor',
      phylopicQuery: 'LUCA',
    },
    synapomorphies: [
      'Código genético universal baseado em DNA e RNA',
      'Uso de ATP como moeda energética celular',
      'Membrana plasmática de bicamada lipídica',
    ],
    bioFeatures: [
      'Não é o primeiro ser vivo, mas o último ancestral comum de toda a vida atual',
      'Provavelmente habitava fontes hidrotermais no fundo dos oceanos primitivos',
      'Possuía cerca de 355 genes que são compartilhados por todos os seres vivos hoje',
    ],
    funFact: 'Todos os seres vivos da Terra — de uma bactéria a você — descendem desta única população de células que viveu há cerca de 4 bilhões de anos.',
  },
  {
    taxon: 'Eukarya',
    module: 'metazoa',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Célula Eucariótica',
      scientificName: 'Eukaryota',
      phylopicQuery: 'Amoeba',
    },
    synapomorphies: [
      'Núcleo delimitado por membrana protegendo o material genético',
      'Organelas membranosas complexas (mitocôndrias, complexo de Golgi)',
      'Citoesqueleto dinâmico para suporte e movimento celular',
    ],
    bioFeatures: [
      'Surgiram através da endossimbiose: uma célula "engoliu" uma bactéria que virou a mitocôndria',
      'Permitiu o surgimento da multicelularidade e de organismos grandes',
      'Inclui todos os animais, plantas, fungos e protozoários',
    ],
    funFact: 'As mitocôndrias dentro de você têm seu próprio DNA, um lembrete de que um dia elas foram bactérias independentes que decidiram morar dentro de outra célula.',
  },
  {
    taxon: 'Animalia',
    module: 'metazoa',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Metazoários',
      scientificName: 'Metazoa',
      phylopicQuery: 'Animalia',
    },
    synapomorphies: [
      'Multicelularidade com especialização de tecidos (na maioria)',
      'Nutrição heterotrófica por ingestão',
      'Desenvolvimento embrionário com estágio de blástula',
    ],
    bioFeatures: [
      'Células unidas por colágeno e junções intercelulares complexas',
      'Capacidade de movimento e resposta rápida a estímulos externos',
      'Ciclo de vida diploide (adultos possuem dois conjuntos de cromossomos)',
    ],
    funFact: 'Diferente das plantas, que "comem" luz, e dos fungos, que absorvem nutrientes, os animais precisam "colocar comida para dentro" para sobreviver.',
  },
  {
    taxon: 'Bilateria',
    module: 'metazoa',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Animal Bilateral',
      scientificName: 'Bilateria',
      phylopicQuery: 'Bilateria',
    },
    synapomorphies: [
      'Simetria bilateral (lados direito e esquerdo espelhados)',
      'Cefalização: concentração de órgãos sensoriais em uma "cabeça"',
      'Triploblastia: três camadas de tecidos embrionários',
    ],
    bioFeatures: [
      'Permitiu o movimento direcional eficiente (frente/trás)',
      'Desenvolvimento de um sistema nervoso centralizado',
      'A maioria possui um tubo digestivo completo com boca e ânus',
    ],
    funFact: 'A invenção da "cabeça" foi uma revolução: permitiu que os animais encontrassem comida e perigo de frente, em vez de esperar que eles esbarrassem neles.',
  },
  {
    taxon: 'Nephrozoa',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Nefrózoos',
      scientificName: 'Nephrozoa',
      phylopicQuery: 'Nephrozoa',
    },
    synapomorphies: [
      'Presença de sistema excretor especializado (nefrídios ou rins)',
      'Sistema circulatório (mesmo que rudimentar)',
    ],
    bioFeatures: [
      'Clado que inclui quase todos os animais bilaterais (exceto Xenacoelomorpha)',
      'Invenção do "filtro de sangue": permite manter o equilíbrio químico interno',
      'Permitiu que os animais crescessem e vivessem em ambientes variados',
    ],
    funFact: 'Se você tem rins ou algo que filtre suas impurezas, você deve isso ao ancestral dos Nephrozoa.',
  },
  {
    taxon: 'Protostomia',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Protostômios',
      scientificName: 'Protostomia',
      phylopicQuery: 'Protostomia',
    },
    synapomorphies: [
      'O blastóporo (primeiro poro do embrião) torna-se a boca',
      'Sistema nervoso ventral (corre pela barriga)',
    ],
    bioFeatures: [
      'Inclui a vasta maioria dos animais: artrópodes, moluscos e vermes',
      'Diversidade colossal de formas corporais e estratégias de vida',
      'Clivagem espiral do embrião em muitos grupos',
    ],
    funFact: 'Nos protostômios, a boca vem primeiro. Em nós (deuterostômios), o primeiro poro que se forma no embrião vira o ânus. Evolutivamente, começamos por pontas diferentes.',
  },
  {
    taxon: 'Spiralia',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Espiralados',
      scientificName: 'Spiralia',
      phylopicQuery: 'Mollusca',
    },
    synapomorphies: [
      'Clivagem espiral do embrião: células giram em torno do eixo',
      'Trochophore: presença de um estágio larval ciliado em muitos membros',
    ],
    bioFeatures: [
      'Incluem moluscos, anelídeos e platelmintos',
      'Extrema diversidade morfológica: de lesmas marinhas a polvos inteligentes',
      'Alguns dos animais mais coloridos do planeta (nudibrânquios)',
    ],
    funFact: 'O nome vem da forma como as células se dividem no embrião — elas "rodam" como uma escada em espiral.',
  },
  {
    taxon: 'Ecdysozoa',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Ecdisozórios',
      scientificName: 'Ecdysozoa',
      phylopicQuery: 'Arthropoda',
    },
    synapomorphies: [
      'Ecdise (muda): capacidade de trocar o exoesqueleto para crescer',
      'Presença de uma cutícula quitinosa ou proteica rígida',
    ],
    bioFeatures: [
      'Contém o grupo mais bem-sucedido da Terra: os Artrópodes',
      'Inclui também Nematódeos e os indestrutíveis Tardígrados',
      'Corpo protegido por uma "armadura" que exige ser trocada periodicamente',
    ],
    funFact: 'Para crescer, esses animais precisam literalmente "sair de si mesmos", abandonando sua pele antiga e esperando a nova endurecer.',
  },
  {
    taxon: 'Deuterostomia',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Deuterostômios',
      scientificName: 'Deuterostomia',
      phylopicQuery: 'Chordata',
    },
    synapomorphies: [
      'Blastóporo (primeiro poro embrionário) torna-se o ânus',
      'Sistema nervoso dorsal (corre pelas costas)',
    ],
    bioFeatures: [
      'Inclui Equinodermos (estrelas-do-mar) e todos os Cordados (incluindo você)',
      'O esqueleto interno (endoesqueleto) é mais comum neste grupo',
      'Formação do celoma (cavidade interna) de forma distinta',
    ],
    funFact: 'Nosso desenvolvimento embrionário é o inverso dos insetos e moluscos — nós priorizamos o fim do sistema digestivo antes do início.',
  },
  {
    taxon: 'Chordata',
    module: 'chordata-basal',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Cordados',
      scientificName: 'Chordata',
      phylopicQuery: 'Chordata',
    },
    synapomorphies: [
      'Notocorda: haste de suporte flexível ao longo do dorso',
      'Cordão nervoso dorsal oco',
      'Fendas faríngeas (pelo menos na fase embrionária)',
      'Cauda pós-anal muscular',
    ],
    bioFeatures: [
      'De minúsculas ascídias marinhas até as baleias-azuis',
      'Presença de uma estrutura de suporte que permitiu o nado eficiente',
      'Sistema circulatório ventral (coração na frente do corpo)',
    ],
    funFact: 'Você ainda tem vestígios das fendas branquiais e da cauda enquanto se desenvolve no útero da sua mãe!',
  },
  {
    taxon: 'Vertebrata',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Vertebrados',
      scientificName: 'Vertebrata',
      phylopicQuery: 'Vertebrata',
    },
    synapomorphies: [
      'Coluna vertebral (ossos ou cartilagem protegendo a medula)',
      'Crânio protegendo um cérebro tripartido complexo',
      'Células da crista neural (fundamentais para a cabeça complexa)',
    ],
    bioFeatures: [
      'Endoesqueleto ósseo ou cartilaginoso cresce com o animal',
      'Sistema nervoso e sensorial altamente desenvolvido',
      'Permitiu que os animais atingissem grandes tamanhos e alta inteligência',
    ],
    funFact: 'A coluna vertebral é o "trilho" que permitiu a evolução de animais poderosos, capazes de correr, voar e nadar com força extrema.',
  },
  {
    taxon: 'Gnathostomata',
    module: 'chordata-basal',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Gnatostomados',
      scientificName: 'Gnathostomata',
      phylopicQuery: 'Shark',
    },
    synapomorphies: [
      'Mandíbulas: arcos branquiais modificados que permitem morder',
      'Nadadeiras pareadas (peitorais e pélvicas) — precursoras dos membros',
      'Dentes verdadeiros com dentina e esmalte',
    ],
    bioFeatures: [
      'Revolucionou a alimentação: animais deixaram de ser apenas filtradores para serem predadores',
      'A nadadeira pélvica é a origem evolutiva de nossas pernas',
      'Evolução de um sistema imunológico adaptativo mais sofisticado',
    ],
    funFact: 'Suas mandíbulas, que você usa para falar e comer, já foram as brânquias de um peixe ancestral!',
  },
  {
    taxon: 'Tetrapoda',
    module: 'chordata-basal',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Tetrápodes',
      scientificName: 'Tetrapoda',
      phylopicQuery: 'Tetrapoda',
    },
    synapomorphies: [
      'Quatro membros com dígitos em vez de nadadeiras',
      'Cintura pélvica fundida à coluna vertebral para suporte de peso',
      'Ausência de guelras funcionais nos adultos (na maioria)',
    ],
    bioFeatures: [
      'A grande conquista do ambiente terrestre',
      'Pescoço diferenciado, permitindo mover a cabeça independentemente do corpo',
      'Respiração predominantemente pulmonar',
    ],
    funFact: 'Seus braços e pernas são homólogos às nadadeiras dos peixes sarcopterígios. Nossos dedos são a evolução das pontas daquelas nadadeiras!',
  },
  {
    taxon: 'Amniota',
    module: 'amniota',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Amniotas',
      scientificName: 'Amniota',
      phylopicQuery: 'Amniota',
    },
    synapomorphies: [
      'Ovo amniótico (com casca e membranas protetoras como âmnio e cório)',
      'Pele impermeável rica em queratina para evitar dessecação',
      'Ventilação pulmonar por pressão negativa (usando a caixa torácica)',
    ],
    bioFeatures: [
      'Permitiu que os animais vivessem e se reproduzissem longe da água',
      'Invenção do "tanque de vida" portátil: o ovo',
      'Fertilização interna obrigatória',
    ],
    funFact: 'Graças ao ovo amniótico, os vertebrados puderam finalmente abandonar as lagoas e conquistar os desertos e florestas mais secas.',
  },
  {
    taxon: 'Synapsida',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Sinapsídeos',
      scientificName: 'Synapsida',
      phylopicQuery: 'Dimetrodon',
    },
    synapomorphies: [
      'Uma única abertura temporal no crânio (atrás da órbita ocular)',
      'Início da diferenciação dos dentes (heterodontia)',
    ],
    bioFeatures: [
      'Linhagem que deu origem aos mamíferos',
      'Originalmente tinham aparência de répteis, mas com metabolismo em transição',
      'Dominaram as paisagens terrestres antes da era dos dinossauros',
    ],
    funFact: 'Apesar de muitos sinapsídeos antigos parecerem répteis, eles são, na verdade, nossos parentes muito mais próximos do que um lagarto ou uma cobra.',
  },
  {
    taxon: 'Sauropsida',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Sauropsídeos',
      scientificName: 'Sauropsida',
      phylopicQuery: 'Iguana',
    },
    synapomorphies: [
      'Escamas dérmicas ricas em queratina beta',
      'Crânio anápsida ou diápsida',
      'Excreção de resíduos nitrogenados na forma de ácido úrico (pasta branca)',
    ],
    bioFeatures: [
      'Linhagem que inclui répteis e aves',
      'Fisiologia adaptada para conservação extrema de água',
      'Diversidade colossal: de cobras sem patas a águias voadoras',
    ],
    funFact: 'Ao contrário de nós, que produzimos uréia líquida, os sauropsídeos economizam água excretando uma pasta sólida, o que permitiu que muitos habitassem os lugares mais áridos da Terra.',
  },
  {
    taxon: 'Theria',
    module: 'amniota',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Mamíferos Térios',
      scientificName: 'Theria',
      phylopicQuery: 'Kangaroo',
    },
    synapomorphies: [
      'Viviparidade: dão à luz a filhotes vivos em vez de ovos',
      'Mamilos funcionais para amamentação direta',
      'Presença de orelhas externas (pinas)',
    ],
    bioFeatures: [
      'Inclui marsupiais e placentários (quase todos os mamíferos atuais)',
      'Perda da cloaca (aberturas separadas para excreção e reprodução)',
      'Cérebro mais complexo e desenvolvido',
    ],
    funFact: 'Todos os mamíferos térios pararam de pôr ovos — exceto os monotremados (ornitorrinco), que mantiveram o hábito ancestral.',
  },
  {
    taxon: 'Archosauria',
    module: 'amniota',
    rarity: 'epic',
    emblematicAnimal: {
      commonName: 'Arcossauros',
      scientificName: 'Archosauria',
      phylopicQuery: 'Dinosaur',
    },
    synapomorphies: [
      'Abertura antorbital no crânio (na frente dos olhos)',
      'Dentes inseridos em alvéolos profundos (tecodontia)',
      'Coração com quatro câmaras (em crocodilos e aves)',
    ],
    bioFeatures: [
      'A linhagem dos "Senhores da Terra" e "Senhores do Céu"',
      'Inclui crocodilos, pterossauros e dinossauros (incluindo aves)',
      'Tendência ao bipedalismo e metabolismo elevado',
    ],
    funFact: 'Arcossauro significa "Répteis Governantes". Eles dominaram o planeta por mais de 150 milhões de anos e suas aves ainda dominam os céus.',
  },
  {
    taxon: 'Neoaves',
    module: 'amniota',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Aves Modernas',
      scientificName: 'Neoaves',
      phylopicQuery: 'Bird',
    },
    synapomorphies: [
      'Radiação explosiva de formas após a extinção dos dinossauros não-avianos',
      'Diversificação extrema de bicos e estilos de voo',
    ],
    bioFeatures: [
      'Representam 95% de todas as espécies de aves vivas',
      'Incluem desde beija-flores até pinguins e corujas',
      'Inteligência social e vocalizações complexas altamente desenvolvidas',
    ],
    funFact: 'Quase todas as aves que você vê na sua janela pertencem ao grupo Neoaves, que se espalhou pelo mundo em um piscar de olhos evolutivo após a queda do asteroide.',
  },
  {
    taxon: 'Bacteria',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Bactérias',
      scientificName: 'Bacteria',
      phylopicQuery: 'Escherichia coli',
    },
    synapomorphies: [
      'Parede celular composta por peptideoglicano',
      'Membrana plasmática com ligações éster e ácidos graxos não ramificados',
      'Presença de sequências únicas de RNA ribossomal (16S rRNA)',
    ],
    bioFeatures: [
      'Os organismos mais abundantes e diversos do planeta',
      'Essenciais para a ciclagem de nutrientes (como nitrogênio e oxigênio)',
      'Capazes de sobreviver em quase todos os ambientes da Terra',
    ],
    funFact: 'Existem mais bactérias no seu corpo do que células humanas. Você é, tecnicamente, um ecossistema caminhante para trilhões de micróbios.',
  },
  {
    taxon: 'Archaea',
    module: 'metazoa',
    rarity: 'rare',
    emblematicAnimal: {
      commonName: 'Arqueas',
      scientificName: 'Archaea',
      phylopicQuery: 'Archaea',
    },
    synapomorphies: [
      'Lípides de membrana com ligações éter e cadeias ramificadas (isoprenoides)',
      'Ausência de peptideoglicano na parede celular',
      'Maquinário de replicação e transcrição de DNA mais similar ao dos Eukarya do que ao das Bacteria',
    ],
    bioFeatures: [
      'Famosas por incluírem "extremófilos": vivem em águas ferventes, lagos de sal ou ambientes ácidos',
      'Não se conhece nenhuma espécie de Arquea que cause doenças em humanos',
      'Grupo fundamental para entender a origem das células complexas (Eukarya)',
    ],
    funFact: 'As arqueas que vivem em fontes termais produzem enzimas tão resistentes ao calor que são usadas hoje para replicar DNA em testes de PCR e investigações criminais.',
  },
  {
    taxon: 'Fungi',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Fungos',
      scientificName: 'Fungi',
      phylopicQuery: 'Mushroom',
    },
    synapomorphies: [
      'Parede celular composta predominantemente por quitina',
      'Nutrição heterotrófica por absorção (digestão externa)',
      'Corpo geralmente formado por filamentos chamados hifas',
    ],
    bioFeatures: [
      'Principais decompositores da biosfera, reciclando matéria orgânica morta',
      'Muitos formam associações vitais com raízes de plantas (micorrizas)',
      'Incluem desde leveduras microscópicas até cogumelos gigantes e bolores',
    ],
    funFact: 'O maior organismo vivo da Terra não é uma baleia, mas um fungo (Armillaria) no Oregon, que se estende por quase 10 km² debaixo da terra e tem mais de 2.000 anos.',
  },
  {
    taxon: 'Plantae',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Plantas',
      scientificName: 'Plantae',
      phylopicQuery: 'Tree',
    },
    synapomorphies: [
      'Presença de cloroplastos derivados de endossimbiose primária',
      'Parede celular rica em celulose',
      'Ciclo de vida com alternância de gerações (esporófito e gametófito)',
    ],
    bioFeatures: [
      'Produtores primários que convertem luz solar em energia química (fotossíntese)',
      'Responsáveis por manter os níveis de oxigênio na atmosfera terrestre',
      'Base de quase todas as cadeias alimentares terrestres',
    ],
    funFact: 'As plantas "inventaram" o mundo moderno: sem a evolução das florestas, o clima da Terra seria drásticamente diferente e a maioria dos animais nunca teria evoluído.',
  },
  {
    taxon: 'Protozoa',
    module: 'metazoa',
    rarity: 'common',
    emblematicAnimal: {
      commonName: 'Protozoários',
      scientificName: 'Protozoa',
      phylopicQuery: 'Paramecium',
    },
    synapomorphies: [
      'Grupo Parafilético: não definido por sinapomorfias exclusivas, mas pela ausência de características de plantas, animais ou fungos verdadeiros',
      'Eucariotos predominantemente unicelulares',
    ],
    bioFeatures: [
      'Representam a "fronteira da vida complexa": muitos são parentes próximos de animais (Choanoflagelados) ou plantas (Algas verdes)',
      'Enorme variedade de locomoção: cílios, flagelos ou pseudópodes (amibas)',
      'Alguns são predadores vorazes de bactérias, outros são parasitas importantes',
    ],
    funFact: 'O grupo "Protozoa" é como uma gaveta de ferramentas: contém de tudo um pouco. É nele que encontramos as pistas de como os ancestrais de todos os animais aprenderam a nadar e caçar.',
  },
]
