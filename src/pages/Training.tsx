import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { ArrowLeft, BookMarked, Download, Check, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import TreeViewer from '../components/TreeViewer';
import { useCladexStore } from '../store';
import { getRandomTree, getRandomClade, type CuratedTree, type ExerciseClade } from '../data/trees';
import { cladeToExercise, checkAnswer } from '../utils/exercises';
import { validateNewick } from '../utils/newick';
import type { Exercise, Feedback } from '../store';

// ─── Props e tipos ────────────────────────────────────────────────────────────

interface TrainingProps { module: string; onBack: () => void }

const MODULE_LABELS: Record<string, string> = {
  'annelida': 'Annelida',
  'chordata-basal': 'Chordata Basal',
  'invertebrados-gerais': 'Invertebrados Gerais',
  'custom': 'Newick Customizado',
};

interface Round {
  tree: CuratedTree | null;
  clade: ExerciseClade | null;
  exercise: Exercise | null;
  treeStyle: 'elbow' | 'diagonal';
}

/**
 * Progressão de estilo:
 * < 10 tentativas totais  → sempre elbow (cotovelo reto, mais legível)
 * 10–24                   → 75% elbow, 25% diagonal
 * ≥ 25                    → 50/50
 */
function pickTreeStyle(totalAttempts: number): 'elbow' | 'diagonal' {
  if (totalAttempts < 10) return 'elbow';
  const diagProb = totalAttempts < 25 ? 0.25 : 0.5;
  return Math.random() < diagProb ? 'diagonal' : 'elbow';
}

function makeRound(mod: string, totalAttempts: number): Round {
  if (mod === 'custom') return { tree: null, clade: null, exercise: null, treeStyle: 'elbow' };
  const tree = getRandomTree(mod);
  const clade = tree ? getRandomClade(tree) : null;
  const exercise = clade ? cladeToExercise(clade) : null;
  return { tree, clade, exercise, treeStyle: pickTreeStyle(totalAttempts) };
}

type EnvState = 'neutral' | 'correct' | 'incorrect';

const CLADE_OPTIONS = [
  { value: 'monophyletic', label: 'Monofilético', desc: 'Ancestral + todos os descendentes', cls: 'bg-emerald-900/50 hover:bg-emerald-800/70 border-emerald-700/50' },
  { value: 'paraphyletic', label: 'Parafilético',  desc: 'Ancestral + alguns descendentes',  cls: 'bg-amber-900/50  hover:bg-amber-800/70  border-amber-700/50'  },
  { value: 'polyphyletic', label: 'Polifilético',  desc: 'Sem ancestral exclusivo',           cls: 'bg-rose-900/50   hover:bg-rose-800/70   border-rose-700/50'   },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Training({ module, onBack }: TrainingProps) {
  const { sessionStats, allTimeStats, recordAnswer, saveTree } = useCladexStore();

  const [round, setRound] = useState<Round>(() =>
    makeRound(module, useCladexStore.getState().allTimeStats.treesAttempted),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [envState, setEnvState] = useState<EnvState>('neutral');
  const [rippleKey, setRippleKey] = useState(0);
  const [treeSaved, setTreeSaved] = useState(false);

  // Custom Newick
  const [customNewick, setCustomNewick] = useState('');
  const [customError, setCustomError] = useState('');
  const [customTree, setCustomTree] = useState<string | null>(null);

  // Dimensões reais do container da árvore (lidas uma vez no mount)
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [containerDims, setContainerDims] = useState({ w: 700, h: 400 });
  useLayoutEffect(() => {
    if (treeContainerRef.current) {
      setContainerDims({
        w: treeContainerRef.current.clientWidth,
        h: treeContainerRef.current.clientHeight,
      });
    }
  }, []);

  // ── Zoom + Pan na árvore ─────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  // Wheel: zoom (não propaga para o resto da página)
  useEffect(() => {
    const el = treeContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      setZoom(z => Math.max(0.4, Math.min(6, z * factor)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer: pan via drag
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging.current = true;
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPanPos.current.x;
    const dy = e.clientY - lastPanPos.current.y;
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onPointerUp = () => { isDragging.current = false; };

  // Touch: pinch-to-zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    const ratio = dist / lastPinchDist.current;
    setZoom(z => Math.max(0.4, Math.min(6, z * ratio)));
    lastPinchDist.current = dist;
  };

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Rodadas ──────────────────────────────────────────────────────────────────
  const nextRound = useCallback(() => {
    const total = allTimeStats.treesAttempted + sessionStats.correct + sessionStats.incorrect;
    setRound(makeRound(module, total));
    setFeedback(null);
    setEnvState('neutral');
    setTreeSaved(false);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [module]);

  // ── Resposta ─────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!round.exercise || feedback) return;
      const correct = checkAnswer(round.exercise, answer);
      recordAnswer(round.exercise.type, correct);
      setFeedback({
        correct,
        message: correct ? 'Correto!' : 'Incorreto.',
        explanation: round.exercise.explanation,
      });
      setEnvState(correct ? 'correct' : 'incorrect');
      setRippleKey(k => k + 1);
    },
    [round.exercise, feedback, recordAnswer],
  );

  // ── Salvar / Baixar ──────────────────────────────────────────────────────────
  const newickAtual = customTree ?? round.tree?.newick ?? '';

  const handleSave = () => {
    if (!newickAtual) return;
    saveTree(newickAtual, module, `${MODULE_LABELS[module] ?? module} — ${new Date().toLocaleDateString('pt-BR')}`);
    setTreeSaved(true);
  };
  const handleDownload = () => {
    if (!newickAtual) return;
    const blob = new Blob([newickAtual], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cladex_${module}_${Date.now()}.newick`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Custom Newick ────────────────────────────────────────────────────────────
  const handleLoadCustom = () => {
    const result = validateNewick(customNewick);
    if (!result.valid) { setCustomError(result.error ?? 'Newick inválido.'); return; }
    setCustomError('');
    setCustomTree(customNewick);
    setFeedback(null); setEnvState('neutral'); setTreeSaved(false);
    setPan({ x: 0, y: 0 }); setZoom(1);
  };

  // ── Classes de ambiente ──────────────────────────────────────────────────────
  const envBg = envState === 'correct' ? 'bg-emerald-950' : envState === 'incorrect' ? 'bg-rose-950' : 'bg-zinc-950';
  const envBorder = envState === 'correct' ? 'border-emerald-900/50' : envState === 'incorrect' ? 'border-rose-900/50' : 'border-zinc-800/60';

  const displayNewick = newickAtual;
  const highlightTaxa = round.clade?.taxaInGroup ?? [];

  return (
    <div className={`flex flex-col flex-1 overflow-hidden transition-colors duration-700 ${envBg} relative`}>

      {/* ── Flash de resposta — overlay instantâneo ── */}
      {envState !== 'neutral' && (
        <div
          key={rippleKey}
          className={`answer-flash ${envState === 'correct' ? 'answer-flash-correct' : 'answer-flash-incorrect'}`}
        />
      )}

      {/* ── Barra de navegação mínima ── */}
      <div className={`shrink-0 flex items-center gap-3 px-4 py-2.5 border-b transition-colors duration-700 ${envBorder} relative z-10`}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="text-sm hidden sm:inline">Voltar</span>
        </button>

        <span className="text-sm font-medium text-zinc-400 truncate flex-1">{MODULE_LABELS[module] ?? module}</span>

        {/* Placar */}
        <span className="text-sm tabular-nums">
          <span className="text-emerald-400 font-bold">{sessionStats.correct}</span>
          <span className="text-zinc-700 mx-1">·</span>
          <span className="text-rose-400 font-bold">{sessionStats.incorrect}</span>
        </span>

        {newickAtual && (
          <>
            <button onClick={handleSave} disabled={treeSaved} title={treeSaved ? 'Salva' : 'Salvar'}
              className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-zinc-300 disabled:opacity-30">
              {treeSaved ? <Check size={14} /> : <BookMarked size={14} />}
            </button>
            <button onClick={handleDownload} title="Baixar Newick"
              className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-zinc-300">
              <Download size={14} />
            </button>
          </>
        )}
      </div>

      {/* ── Custom Newick ── */}
      {module === 'custom' && (
        <div className={`shrink-0 px-4 py-3 border-b transition-colors duration-700 ${envBorder} relative z-10`}>
          <textarea
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 font-mono text-sm text-zinc-100 resize-none h-16 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="((Polychaeta,(Oligochaeta,Hirudinea)Clitellata),Sipuncula);"
            value={customNewick}
            onChange={e => setCustomNewick(e.target.value)}
          />
          <div className="flex items-center gap-2 mt-2">
            {customError && <p className="text-rose-400 text-sm flex-1">{customError}</p>}
            <button onClick={handleLoadCustom}
              className="ml-auto bg-emerald-700 hover:bg-emerald-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Carregar
            </button>
          </div>
        </div>
      )}

      {/* ── Pergunta ── */}
      {round.exercise && (
        <div className="shrink-0 px-5 pt-4 pb-2 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
            Classificação de clado
          </p>
          <p className="text-lg sm:text-xl text-zinc-100 leading-snug font-medium">
            {round.exercise.question}
          </p>
        </div>
      )}

      {/* ── Área da árvore — flex-1, zoom+pan isolados ── */}
      <div
        ref={treeContainerRef}
        className={`flex-1 min-h-0 relative overflow-hidden transition-all duration-700 border-y ${envBorder} cursor-grab active:cursor-grabbing`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ touchAction: 'none' }}
        onDoubleClick={resetZoom}
        title="Scroll para zoom · Arraste para mover · Duplo clique para resetar"
      >

        {/* Parallax: CladeX em background, move a 25% da velocidade do pan */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <span
            className="font-black text-zinc-100/[0.045] tracking-tighter whitespace-nowrap"
            style={{
              fontSize: 'clamp(64px, 14vw, 160px)',
              transform: `translate(${pan.x * 0.25}px, ${pan.y * 0.25}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.35s ease',
            }}
          >
            CladeX
          </span>
        </div>

        {displayNewick ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging.current ? 'none' : 'transform 0.12s ease',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <TreeViewer
              newick={displayNewick}
              highlightTaxa={highlightTaxa}
              containerWidth={containerDims.w}
              containerHeight={containerDims.h}
              treeStyle={round.treeStyle}
              taxonAnnotations={round.tree?.taxonAnnotations}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600 text-base relative z-10">
            {module === 'custom' ? 'Cole um Newick acima e clique em Carregar' : 'Carregando…'}
          </div>
        )}

        {/* Fonte da árvore + hint de zoom */}
        <div className="absolute bottom-2 right-3 flex items-center gap-3 z-10 pointer-events-none">
          {round.tree && (
            <p className="text-xs text-zinc-700 italic">{round.tree.source}</p>
          )}
          {zoom !== 1 && (
            <span className="text-[10px] text-zinc-700">{Math.round(zoom * 100)}%</span>
          )}
        </div>
      </div>

      {/* ── Respostas / Feedback ── */}
      <div
        key={`panel-${rippleKey}`}
        className={`shrink-0 px-4 py-3 relative z-10 transition-colors duration-700 border-t ${envBorder}${envState === 'incorrect' ? ' shake-once' : ''}`}
      >
        {!feedback
          ? <AnswerButtons module={module} exercise={round.exercise} onAnswer={handleAnswer} />
          : <FeedbackPanel feedback={feedback} onNext={nextRound} />
        }
      </div>

    </div>
  );
}

// ─── Botões de resposta ───────────────────────────────────────────────────────

function AnswerButtons({ module, exercise, onAnswer }: {
  module: string; exercise: Exercise | null; onAnswer: (a: string) => void
}) {
  if (module === 'custom' || !exercise) {
    return (
      <p className="text-zinc-600 text-sm text-center py-1">
        {module === 'custom' ? 'Nenhum exercício para árvore customizada.' : 'Carregando…'}
      </p>
    );
  }

  if (exercise.type === 'clade-classification') {
    return (
      <HintableOptions onAnswer={onAnswer} />
    );
  }

  return null;
}

// ─── Opções com botão de dica ─────────────────────────────────────────────────

function HintableOptions({ onAnswer }: { onAnswer: (a: string) => void }) {
  const [hint, setHint] = useState(false);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {CLADE_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => onAnswer(opt.value)}
            className={`border rounded-xl px-3 py-3 text-left transition-colors ${opt.cls}`}>
            <span className="block font-semibold text-white text-base leading-tight">{opt.label}</span>
            {hint && (
              <span className="block text-xs text-zinc-300 mt-1 leading-tight">{opt.desc}</span>
            )}
          </button>
        ))}
      </div>
      {!hint && (
        <button
          onClick={() => setHint(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-1"
        >
          <HelpCircle size={12} />
          dica — ver definições
        </button>
      )}
    </div>
  );
}

// ─── Feedback ────────────────────────────────────────────────────────────────

function FeedbackPanel({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {feedback.correct
          ? <CheckCircle className="text-emerald-400 shrink-0" size={18} />
          : <XCircle className="text-rose-400 shrink-0" size={18} />}
        <span className={`font-semibold text-base ${feedback.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
          {feedback.message}
        </span>
        <button onClick={onNext}
          className="ml-auto bg-zinc-700 hover:bg-zinc-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0">
          Próxima →
        </button>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderBold(feedback.explanation) }} />
    </div>
  );
}

function renderBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
