// Dev HUD — only rendered in development builds (import.meta.env.DEV).
// Toggle: press D while on the Training screen.
// Shows the current exercise's internals and allows force-picking a specific type.

import type { ExerciseType } from '../store';

interface DevHudProps {
  visible: boolean;
  treeId: string | null;
  cladeId: string | null;
  exerciseType: ExerciseType | null;
  correctAnswer: string | null;
  question: string | null;
  poolUsed: number;
  poolTotal: number;
  forceType: ExerciseType | null;
  onForceType: (t: ExerciseType | null) => void;
  onClose: () => void;
}

const ALL_TYPES: { value: ExerciseType; short: string }[] = [
  { value: 'clade-classification', short: 'clado' },
  { value: 'homology-type',        short: 'homol.' },
  { value: 'character-placement',  short: 'char.' },
  { value: 'leaf-placement',       short: 'folha' },
  { value: 'sister-group',         short: 'irmão' },
  { value: 'taxon-drag',           short: 'drag' },
];

export default function DevHud({
  visible,
  treeId,
  cladeId,
  exerciseType,
  correctAnswer,
  question,
  poolUsed,
  poolTotal,
  forceType,
  onForceType,
  onClose,
}: DevHudProps) {
  if (!visible) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed bottom-4 right-4 w-80 rounded-2xl border border-yellow-500/40 bg-zinc-950/95 shadow-2xl backdrop-blur-sm font-mono text-xs text-yellow-300 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-yellow-500/20">
        <span className="font-bold text-yellow-400 tracking-widest uppercase text-[10px]">
          ⚙ Dev HUD
        </span>
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-[9px]">pool {poolUsed}/{poolTotal}</span>
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-300 transition-colors text-sm leading-none"
            title="Fechar (D)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Current exercise info */}
      <div className="px-3 py-2 space-y-1 border-b border-yellow-500/10">
        <Row label="type" value={exerciseType ?? '—'} highlight />
        <Row label="tree" value={treeId ?? '—'} />
        <Row label="clade" value={cladeId ?? '—'} />
        <Row label="answer" value={correctAnswer ?? '—'} highlight />
        {question && (
          <div className="mt-1">
            <span className="text-yellow-700">q: </span>
            <span className="text-yellow-500 break-words leading-snug">{question}</span>
          </div>
        )}
      </div>

      {/* Force-type buttons */}
      <div className="px-3 py-2">
        <p className="text-yellow-700 text-[9px] uppercase tracking-widest mb-1.5">
          forçar tipo (próximo round)
        </p>
        <div className="grid grid-cols-3 gap-1">
          {ALL_TYPES.map(({ value, short }) => (
            <button
              key={value}
              onClick={() => onForceType(forceType === value ? null : value)}
              className={[
                'rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors border',
                forceType === value
                  ? 'bg-yellow-500/30 border-yellow-400/60 text-yellow-200'
                  : 'bg-zinc-900/50 border-zinc-700/40 text-zinc-400 hover:text-yellow-300 hover:border-yellow-600/40',
              ].join(' ')}
              title={value}
            >
              {short}
            </button>
          ))}
        </div>
        {forceType && (
          <p className="text-yellow-500/70 text-[9px] mt-1.5">
            Forçando <strong className="text-yellow-400">{forceType}</strong> — clique novamente para cancelar
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-yellow-700 shrink-0 w-14">{label}:</span>
      <span className={highlight ? 'text-yellow-200 font-bold' : 'text-zinc-400 break-all'}>{value}</span>
    </div>
  );
}
