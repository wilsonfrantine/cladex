import type { ExerciseClade } from '../data/trees';
import type { Exercise, ExerciseType } from '../store';

const CLADE_QUESTIONS = [
  'Os táxons destacados em verde formam que tipo de grupo?',
  'Como classificamos o agrupamento marcado em verde na árvore?',
  'O conjunto de táxons em destaque corresponde a um grupo:',
];

const TRADITIONAL_GROUP_QUESTIONS: Array<(g: string) => string> = [
  (g) => `Na classificação tradicional, os táxons em verde formam "${g}". Como você classificaria esse agrupamento?`,
  (g) => `Os táxons destacados foram historicamente reunidos como "${g}". Esse agrupamento é:`,
  (g) => `"${g}" é um grupo da classificação clássica. Observando a árvore, como você o classificaria?`,
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

export function checkAnswer(exercise: Exercise, answer: string): boolean {
  return answer === exercise.correctAnswer;
}
