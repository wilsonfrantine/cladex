import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise, Feedback } from '../store';

interface QuestionPanelProps {
  exercise: Exercise | null;
  feedback: Feedback | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

const CLADE_OPTIONS = [
  {
    value: 'monophyletic',
    label: 'Monofilético',
    description: 'Ancestral + todos os descendentes',
    colors: 'bg-emerald-800/60 hover:bg-emerald-700/80 border-emerald-600/50',
  },
  {
    value: 'paraphyletic',
    label: 'Parafilético',
    description: 'Ancestral + alguns descendentes',
    colors: 'bg-amber-800/60 hover:bg-amber-700/80 border-amber-600/50',
  },
  {
    value: 'polyphyletic',
    label: 'Polifilético',
    description: 'Sem ancestral exclusivo',
    colors: 'bg-rose-800/60 hover:bg-rose-700/80 border-rose-600/50',
  },
];

const ROTATION_OPTIONS = [
  { value: 'no', label: 'Não mudou', colors: 'bg-emerald-800/60 hover:bg-emerald-700/80 border-emerald-600/50' },
  { value: 'yes', label: 'Mudou', colors: 'bg-rose-800/60 hover:bg-rose-700/80 border-rose-600/50' },
];

export default function QuestionPanel({ exercise, feedback, onAnswer, onNext }: QuestionPanelProps) {
  if (!exercise) {
    return (
      <div className="px-4 py-4 text-center text-zinc-600 text-sm">
        Clique em <strong className="text-zinc-400">Nova Árvore</strong> para começar.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-2.5">

      {/* Pergunta */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {labelForType(exercise.type)}
        </span>
        <p className="text-sm text-zinc-100 leading-snug mt-0.5">{exercise.question}</p>
      </div>

      {/* Opções */}
      {!feedback && <AnswerOptions exercise={exercise} onAnswer={onAnswer} />}

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl border px-3 py-2.5 space-y-1.5 ${
            feedback.correct
              ? 'bg-emerald-950/80 border-emerald-700/60'
              : 'bg-rose-950/80 border-rose-700/60'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.correct
              ? <CheckCircle className="text-emerald-400 shrink-0" size={16} />
              : <XCircle className="text-rose-400 shrink-0" size={16} />}
            <span className={`font-semibold text-sm ${feedback.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
              {feedback.message}
            </span>
            <button
              onClick={onNext}
              className="ml-auto px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors shrink-0"
            >
              Próxima →
            </button>
          </div>
          <p
            className="text-xs text-zinc-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderBold(feedback.explanation) }}
          />
        </div>
      )}

    </div>
  );
}

// ─── Sub-componente de opções ─────────────────────────────────────────────────

function AnswerOptions({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (a: string) => void }) {
  if (exercise.type === 'clade-classification') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {CLADE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={`border rounded-xl px-2 py-2.5 text-left transition-colors ${opt.colors}`}
          >
            <span className="block font-semibold text-white text-sm">{opt.label}</span>
            <span className="text-[11px] text-zinc-300 mt-0.5 block leading-tight">{opt.description}</span>
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === 'rotation') {
    return (
      <div className="grid grid-cols-2 gap-2 max-w-xs">
        {ROTATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={`border rounded-xl px-4 py-2.5 font-semibold text-sm text-white transition-colors ${opt.colors}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === 'mrca') {
    return (
      <p className="text-zinc-400 text-xs">
        Clique no nó da árvore que representa o ancestral comum mais recente dos táxons destacados.
      </p>
    );
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function labelForType(type: Exercise['type']): string {
  const labels: Record<Exercise['type'], string> = {
    'clade-classification': 'Classificação de clado',
    mrca: 'Ancestral comum (MRCA)',
    rotation: 'Rotação de ramos',
    synapomorphy: 'Sinapomorfia',
  };
  return labels[type];
}

function renderBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
