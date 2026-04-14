
# Curadoria de Dados Taxonômicos

Este documento descreve como manter a integridade dos dados da Árvore da Vida (ToL) e dos cards informativos no Cladex.

## Estrutura de Dados

O sistema de dados é composto por três partes principais:

1.  **`src/data/treeoflife.ts`**: Define a estrutura da árvore (IDs, nomes, relações, ranks e tipos).
2.  **`src/data/taxa-cards.ts`**: Contém o conteúdo educacional (sinapomorfias, características biológicas, curiosidades).
3.  **`public/data/tol-enrichment.json`**: Cache de imagens (fotos e silhuetas) gerado automaticamente.

## Fluxo de Trabalho de Manutenção

### 1. Verificar Integridade
Sempre que adicionar novos nós à `TREE_OF_LIFE`, verifique se eles possuem conteúdo correspondente:

```bash
npm run check-cards
```

Este comando listará todos os nós do tipo `card` ou `placeholder` que não possuem uma entrada em `taxa-cards.ts`.

### 2. Adicionar Conteúdo
Se houver lacunas, adicione o objeto `TaxonCard` no arquivo `src/data/taxa-cards.ts`. O campo `taxon` deve ser o mesmo nome ou ID definido na árvore (a busca é *case-insensitive*).

### 3. Enriquecer Imagens
Após garantir que todos os nós têm cards, rode o script de enriquecimento para buscar fotos reais e silhuetas:

```bash
npm run fetch-enrichment
```

### 4. Curar Silhuetas (Opcional)
Se uma silhueta do PhyloPic não for adequada, você pode ajustar as queries em `taxa-cards.ts` e rodar:

```bash
npm run curate-phylopic
```

## Regras de Associação de Cards

- **Busca**: O sistema busca primeiro pelo `cardTaxon` (se definido no nó) e depois pelo `name` do nó.
- **Lowercase**: Todas as chaves são normalizadas para minúsculas para evitar erros de digitação.
- **Fallbacks**: Para nós de nível de espécie que compartilham dados do grupo, use o campo `cardTaxon` na `TREE_OF_LIFE` apontando para o grupo (ex: `cardTaxon: 'nematoda'`).
