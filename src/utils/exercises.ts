import type { CharacterItem, ExerciseClade, LeafHint } from '../data/trees';
import type { Exercise, ExerciseType } from '../store';

// ─── clade-classification ─────────────────────────────────────────────────────

const CLADE_QUESTIONS = [
  'Os táxons destacados na árvore formam que tipo de grupo?',
  'Como classificamos o agrupamento destacado na árvore?',
  'O conjunto de táxons em destaque corresponde a um grupo:',
];

const TRADITIONAL_GROUP_QUESTIONS: Array<(g: string) => string> = [
  (g) => `Na classificação tradicional, os táxons destacados formam "${g}". Como você classificaria esse agrupamento?`,
  (g) => `Os táxons destacados foram historicamente reunidos como "${g}". Esse agrupamento é:`,
  (g) => `"${g}" é um grupo da classificação clássica. Observando a árvore acima, como você classificaria esse agrupamento?`,
];

export function cladeToExercise(clade: ExerciseClade): Exercise {
  let question: string;
  if (clade.traditionalGroupContext) {
    const tmpl = TRADITIONAL_GROUP_QUESTIONS[Math.floor(Math.random() * TRADITIONAL_GROUP_QUESTIONS.length)];
    question = tmpl(clade.traditionalGroupContext);
  } else {
    question = CLADE_QUESTIONS[Math.floor(Math.random() * CLADE_QUESTIONS.length)];
  }
  return {
    type: 'clade-classification' as ExerciseType,
    question,
    correctAnswer: clade.type,
    explanation: clade.explanation,
  };
}

// ─── homology-type ────────────────────────────────────────────────────────────

const HOMOLOGY_QUESTIONS: Array<(c: string) => string> = [
  (c) => `O caráter "${c}" compartilhado pelos táxons destacados é:`,
  (c) => `Na árvore acima, "${c}" representa:`,
  (c) => `Como classificamos "${c}" em relação aos táxons destacados?`,
];

export function homologyToExercise(char: CharacterItem): Exercise {
  const q = HOMOLOGY_QUESTIONS[Math.floor(Math.random() * HOMOLOGY_QUESTIONS.length)];
  return {
    type: 'homology-type',
    question: q(char.character),
    correctAnswer: char.type,
    explanation: char.explanation,
    meta: { highlightTaxa: char.taxaWithCharacter },
  };
}

// ─── character-placement ──────────────────────────────────────────────────────

const PLACEMENT_QUESTIONS: Array<(c: string) => string> = [
  (c) => `Clique no nó da árvore onde surgiu "${c}".`,
  (c) => `Em qual ancestral se originou "${c}"? Clique no nó correto.`,
  (c) => `"${c}" surgiu em qual ponto da árvore? Indique clicando no nó ancestral.`,
];

export function characterPlacementToExercise(char: CharacterItem): Exercise {
  const q = PLACEMENT_QUESTIONS[Math.floor(Math.random() * PLACEMENT_QUESTIONS.length)];
  return {
    type: 'character-placement',
    question: q(char.character),
    correctAnswer: char.originNode,
    explanation: char.explanation,
    meta: { highlightTaxa: char.taxaWithCharacter },
  };
}

// ─── leaf-placement ───────────────────────────────────────────────────────────

export function leafPlacementToExercise(hint: LeafHint): Exercise {
  const hintList = hint.hints.map((h, i) => `${i + 1}. ${h}`).join('\n');
  const label = hint.cardLabel ?? hint.hiddenLeaf;
  return {
    type: 'leaf-placement',
    question: `Um táxon está oculto na árvore (marcado como "?"). Usando as pistas abaixo, clique na folha correta:\n${hintList}`,
    correctAnswer: hint.hiddenLeaf,
    explanation: `O táxon correto era **${label}**. ${hint.hints[0]}.`,
    meta: {
      hiddenLeaf: hint.hiddenLeaf,
      cardLabel: label,
    },
  };
}

// ─── checkAnswer ──────────────────────────────────────────────────────────────

export function checkAnswer(exercise: Exercise, answer: string): boolean {
  return answer === exercise.correctAnswer;
}
