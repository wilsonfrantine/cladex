export type TolNodeType = 'internal' | 'card' | 'collapsed' | 'placeholder';

export type TolRank =
  | 'life'
  | 'domain'
  | 'kingdom'
  | 'supergroup'
  | 'phylum'
  | 'subphylum'
  | 'class'
  | 'subclass'
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
}

export const TREE_OF_LIFE: TolNode = {
  id: 'life',
  name: 'Vida',
  rank: 'life',
  type: 'internal',
  children: [
    { id: 'bacteria', name: 'Bacteria', type: 'collapsed', collapsedLabel: '~10³⁰ procariotos' },
    { id: 'archaea', name: 'Archaea', type: 'collapsed', collapsedLabel: '~10.000 spp conhecidas' },
    {
      id: 'eukarya',
      name: 'Eukarya',
      rank: 'domain',
      type: 'internal',
      children: [
        { id: 'fungi', name: 'Fungi', type: 'collapsed', collapsedLabel: 'Cogumelos e leveduras' },
        { id: 'plantae', name: 'Plantae', type: 'collapsed', collapsedLabel: 'Plantas terrestres e algas' },
        { id: 'protozoa', name: 'Protozoa', type: 'collapsed', collapsedLabel: 'Linhagens unicelulares' },
        {
          id: 'animalia',
          name: 'Animalia',
          rank: 'kingdom',
          type: 'internal',
          children: [
            { id: 'porifera', name: 'Porifera', type: 'card', cardTaxon: 'porifera', unlockModule: 'metazoa', unlockMinCorrect: 5 },
            { id: 'cnidaria', name: 'Cnidaria', type: 'card', cardTaxon: 'cnidaria', unlockModule: 'metazoa', unlockMinCorrect: 5 },
            {
              id: 'bilateria',
              name: 'Bilateria',
              type: 'internal',
              children: [
                {
                  id: 'nephrozoa',
                  name: 'Nephrozoa',
                  type: 'internal',
                  children: [
                    {
                      id: 'protostomia',
                      name: 'Protostomia',
                      type: 'internal',
                      children: [
                        {
                          id: 'spiralia',
                          name: 'Spiralia',
                          type: 'internal',
                          children: [
                            {
                              id: 'platyhelminthes',
                              name: 'Platyhelminthes',
                              rank: 'phylum',
                              type: 'card',
                              cardTaxon: 'platyhelminthes',
                              unlockModule: 'metazoa',
                              unlockMinCorrect: 5,
                              children: [
                                { id: 'turbellaria', name: 'Turbellaria', type: 'placeholder', cardTaxon: 'planaria' },
                                { id: 'cestoda', name: 'Cestoda', type: 'placeholder', cardTaxon: 'taenia' },
                              ],
                            },
                            {
                              id: 'lophotrochozoa',
                              name: 'Lophotrochozoa',
                              type: 'internal',
                              children: [
                                {
                                  id: 'mollusca',
                                  name: 'Mollusca',
                                  rank: 'phylum',
                                  type: 'card',
                                  cardTaxon: 'mollusca',
                                  unlockModule: 'metazoa',
                                  unlockMinCorrect: 5
                                },
                                {
                                  id: 'annelida',
                                  name: 'Annelida',
                                  rank: 'phylum',
                                  type: 'card',
                                  cardTaxon: 'annelida',
                                  unlockModule: 'annelida',
                                  unlockMinCorrect: 5,
                                  children: [
                                    {
                                      id: 'clitellata',
                                      name: 'Clitellata',
                                      type: 'internal',
                                      children: [
                                        { id: 'oligochaeta', name: 'Oligochaeta', type: 'card', cardTaxon: 'oligochaeta', unlockModule: 'annelida', unlockMinCorrect: 5 },
                                        { id: 'hirudinida', name: 'Hirudinida', type: 'card', cardTaxon: 'hirudinida', unlockModule: 'annelida', unlockMinCorrect: 5 },
                                      ],
                                    },
                                    { id: 'errantia', name: 'Errantia', type: 'card', cardTaxon: 'nereidae', unlockModule: 'annelida', unlockMinCorrect: 5 },
                                  ],
                                },
                                { id: 'brachiopoda', name: 'Brachiopoda', type: 'collapsed', collapsedLabel: 'Lampshells' },
                                { id: 'bryozoa', name: 'Bryozoa', type: 'collapsed', collapsedLabel: 'Moss animals' },
                              ]
                            }
                          ]
                        },
                        {
                          id: 'ecdysozoa',
                          name: 'Ecdysozoa',
                          type: 'internal',
                          children: [
                            { id: 'nematoda', name: 'Nematoda', rank: 'phylum', type: 'card', cardTaxon: 'nematoda', unlockModule: 'metazoa', unlockMinCorrect: 5 },
                            { id: 'tardigrada', name: 'Tardigrada', type: 'collapsed', collapsedLabel: 'Water bears' },
                            {
                              id: 'arthropoda',
                              name: 'Arthropoda',
                              rank: 'phylum',
                              type: 'card',
                              cardTaxon: 'arthropoda',
                              unlockModule: 'arthropoda',
                              unlockMinCorrect: 5,
                              children: [
                                { id: 'insecta', name: 'Insecta', type: 'card', cardTaxon: 'insecta', unlockModule: 'arthropoda', unlockMinCorrect: 5 },
                                { id: 'arachnida', name: 'Arachnida', type: 'card', cardTaxon: 'arachnida', unlockModule: 'arthropoda', unlockMinCorrect: 5 },
                                { id: 'crustacea', name: 'Crustacea', type: 'card', cardTaxon: 'crustacea', unlockModule: 'arthropoda', unlockMinCorrect: 5 },
                                { id: 'myriapoda', name: 'Myriapoda', type: 'card', cardTaxon: 'myriapoda', unlockModule: 'arthropoda', unlockMinCorrect: 5 },
                              ],
                            },
                          ]
                        }
                      ]
                    },
                    {
                      id: 'deuterostomia',
                      name: 'Deuterostomia',
                      type: 'internal',
                      children: [
                        { id: 'echinodermata', name: 'Echinodermata', rank: 'phylum', type: 'card', cardTaxon: 'echinodermata', unlockModule: 'metazoa', unlockMinCorrect: 5 },
                        { id: 'hemichordata', name: 'Hemichordata', rank: 'phylum', type: 'card', cardTaxon: 'hemichordata', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                        {
                          id: 'chordata',
                          name: 'Chordata',
                          rank: 'phylum',
                          type: 'card',
                          cardTaxon: 'chordata',
                          unlockModule: 'chordata-basal',
                          unlockMinCorrect: 5,
                          children: [
                            { id: 'cephalochordata', name: 'Cephalochordata', type: 'card', cardTaxon: 'cephalochordata', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                            { id: 'urochordata', name: 'Urochordata', type: 'card', cardTaxon: 'urochordata', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                            {
                              id: 'vertebrata',
                              name: 'Vertebrata',
                              type: 'internal',
                              children: [
                                { id: 'myxini', name: 'Myxini', type: 'card', cardTaxon: 'myxini', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                                { id: 'gnathostomata', name: 'Gnathostomata', type: 'internal', children: [
                                  { id: 'chondrichthyes', name: 'Chondrichthyes', type: 'card', cardTaxon: 'chondrichthyes', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                                  { id: 'actinopterygii', name: 'Actinopterygii', type: 'card', cardTaxon: 'actinopterygii', unlockModule: 'chordata-basal', unlockMinCorrect: 5 },
                                  { id: 'tetrapoda', name: 'Tetrapoda', type: 'internal', children: [
                                    { id: 'amphibia', name: 'Amphibia', type: 'card', cardTaxon: 'amphibia', unlockModule: 'amniota', unlockMinCorrect: 5 },
                                    { id: 'amniota', name: 'Amniota', type: 'card', cardTaxon: 'mammalia', unlockModule: 'amniota', unlockMinCorrect: 5 }
                                  ]}
                                ]}
                              ]
                            }
                          ],
                        },
                      ]
                    }
                  ]
                }
              ]
            }
          ],
        },
      ],
    },
  ],
};
