# CladeX Collectibles — Tree of Life Album

> Documento de visão e especificação de feature · Fase 2 do CladeX

---

## Conceito

O sistema de colecionáveis transforma o aprendizado de sistemática filogenética em uma experiência de colecionador. O usuário acumula XP nos exercícios de classificação e "desbloqueia" **cards de organismos reais** — análogos a cards de Pokémon, mas com conteúdo científico rigoroso.

Cada card representa um grupo taxonômico com:
- Um animal emblemático como representante visual
- As **sinapomorfias** que definem o clado (o que o torna um grupo natural)
- Características biológicas notáveis do grupo
- Silhueta SVG do PhyloPic

Progressivamente, o usuário preenche uma **Árvore da Vida interativa**, posicionando os cards desbloqueados nos terminais corretos — construindo intuição filogenética através da coleção.

---

## Tiers de Raridade

### 🟤 Common
Grupos presentes nos módulos de treino atuais. Desbloqueados facilmente por acertos sequenciais.
- Mammalia, Aves, Insecta, Actinopterygii, Amphibia...

### 🔵 Rare
Grupos menos conhecidos do público geral, mas biologicamente fascinantes.
- Myxini, Petromyzontida, Onychophora, Hirudinea, Urochordata...

### 🟣 Epic
Grupos com características extremas, história evolutiva singular ou importância filogenética chave.
- Cephalochordata (parente mais próximo dos vertebrados sem ser vertebrado)
- Siboglinidae (sem intestino, sobrevive de bactérias quimiossintetizantes)
- Chelicerata (livro de deutérostomos? Não — protostomata com quelíceras)

### 🟡 Legendary
Espécies ícone, evolutionarily distinct, ou representantes de eventos evolutivos transformadores.
- _Limulus polyphemus_ (Horseshoe crab — "fóssil vivo", ~450 Ma)
- _Latimeria chalumnae_ (Celacanto — reaparecimento científico em 1938)
- _Nautilus pompilius_ (câmaras de gás, olho sem cristalino)
- _Peripatus_ (Onychophora — elo vivo entre anelídeos e artrópodes)

### 💀 Fossil (especial)
Extintos de relevância filogenética — desbloqueados por marcos de XP especiais.
- _Archaeopteryx lithographica_ — transição répteis → aves
- _Tiktaalik roseae_ — transição água → terra
- _Pikaia gracilens_ — cambriano, possível ancestral dos cordados
- Trilobita — artrópodes extintos, >500 Ma
- _Hallucigenia sparsa_ — Cambriano, morfologia bizarra, hoje Onychophora

---

## Mecânicas de Desbloqueio (esboço)

| Evento | XP |
|---|---|
| Resposta correta (monofil.) | +10 |
| Resposta correta (parafil./polifil.) | +15 |
| Streak de 5 acertos | +25 bônus |
| Módulo completado (>80% acerto) | +100 |
| Identificar sinapomorfia específica | +20 |

| Card | XP necessário |
|---|---|
| Common | 50 XP |
| Rare | 200 XP |
| Epic | 600 XP |
| Legendary | 1500 XP |
| Fossil | Marco específico (ex: 10 módulos completados) |

> Os valores são rascunhos — ajustar após testes com alunos.

---

## A Árvore da Vida como Álbum

Quando o usuário desbloqueia um card, ele pode **posicioná-lo na Árvore da Vida** — uma árvore filogenética interativa da vida (escala de domínios → filos → classes) onde cada terminal pode receber um card.

- Cards mal posicionados → feedback visual de erro (a árvore "rejeita")
- Cards corretamente posicionados → o terminal acende + animação
- Ramos com todos os terminais preenchidos → o clado "vira ouro"
- A árvore completa é um artefato visual desbloqueável (poster exportável?)

Isso cria um loop de aprendizado:
> **Exercício → XP → Card → Posicionamento na Árvore → Revisão de sinapomorfias**

---

## Conteúdo de Cada Card

```
┌─────────────────────────────────────┐
│  [Silhueta PhyloPic]    [Rarity ★]  │
│                                     │
│  MAMMALIA                           │
│  Panthera leo · Leão                │
│                                     │
│  ── Sinapomorfias do clado ──       │
│  • Pelos (pili)                     │
│  • Glândulas mamárias               │
│  • 3 ossículos do ouvido médio      │
│                                     │
│  ── Características notáveis ──     │
│  • Endotérmicos (sangue quente)     │
│  • Diafragma musculado              │
│  • Dentição heterodonte             │
│                                     │
│  💡 Leões são os únicos felinos     │
│     sociais — vivem em alcateias    │
│     com divisão de trabalho.        │
└─────────────────────────────────────┘
```

---

## Integração com PhyloPic

Os cards são a **fonte única de verdade** para curadoria de silhuetas:
- `emblematicAnimal.phylopicQuery` = nome popular do animal representativo
- `scripts/curate-phylopic.mjs` lê `src/data/taxa-cards.ts` e busca por esse nome
- Resultado → `src/data/phylopic-cache.ts`

Isso resolve o problema de cobertura do PhyloPic: buscar "earthworm" em vez de "Lumbricidae" retorna resultados.

---

## Roadmap de Implementação

### Fase 2A — Fundação (agora)
- [x] `src/data/taxa-cards.ts` — estrutura de dados + conteúdo dos grupos atuais
- [x] `scripts/curate-phylopic.mjs` — cura silhuetas usando taxa-cards como fonte
- [ ] Atualizar `phylopic-cache.ts` com silhuetas dos animais emblemáticos

### Fase 2B — Cards na UI
- [ ] Componente `<TaxonCard>` visual (estilo Pokémon, conteúdo científico)
- [ ] Sistema de XP no Zustand store (persistido)
- [ ] Tela de coleção / álbum
- [ ] Animação de desbloqueio de card

### Fase 2C — Árvore da Vida
- [ ] Árvore interativa de alta escala (domínios → filos)
- [ ] Sistema de posicionamento de cards nos terminais
- [ ] Feedback de acerto/erro filogenético

### Fase 2D — Fósseis e Lendários
- [ ] Cards especiais com timeline geológica
- [ ] Integração com dados de Paleobiology Database
- [ ] Missões especiais para desbloquear Fossils

---

## Notas do Professor

> *Esta seção é para anotações pedagógicas sobre o design dos cards*

- As sinapomorfias nos cards devem ser **morfológicas e verificáveis** — evitar "mais derivados" ou linguagem vaga
- Preferir sinapomorfias que o aluno pode **observar no laboratório ou campo**
- O "fun fact" deve ser algo que o aluno vai contar para alguém — deve ser surpreendente
- Cards de Fossil devem incluir a datação geológica e o contexto da descoberta
