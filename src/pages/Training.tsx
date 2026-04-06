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
  'amniota': 'Amniota',
  'arthropoda': 'Arthropoda',
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
  { value: 'monophyletic', label: 'Monofilético', desc: 'Ancestral + todos os descendentes', key: '1', cls: 'bg-emerald-900/50 hover:bg-emerald-800/70 border-emerald-700/50' },
  { value: 'paraphyletic', label: 'Parafilético',  desc: 'Ancestral + alguns descendentes',  key: '2', cls: 'bg-amber-900/50  hover:bg-amber-800/70  border-amber-700/50'  },
  { value: 'polyphyletic', label: 'Polifilético',  desc: 'Sem ancestral exclusivo',           key: '3', cls: 'bg-rose-900/50   hover:bg-rose-800/70   border-rose-700/50'   },
];

function getLevel(total: number): { label: string; style: string } {
  if (total < 10) return { label: 'Nível 1 · Cotovelo', style: 'text-zinc-600' };
  if (total < 25) return { label: 'Nível 2 · Diagonal', style: 'text-indigo-500' };
  return { label: 'Nível 3 · Livre', style: 'text-emerald-600' };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Training({ module, onBack }: TrainingProps) {
  const { sessionStats, allTimeStats, recordAnswer, saveTree, theme } = useCladexStore();

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

  // ── Atalhos de teclado ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (feedback) {
        if (e.key === 'Enter') nextRound();
        return;
      }
      if (round.exercise?.type !== 'clade-classification') return;
      if (e.key === '1') handleAnswer('monophyletic');
      if (e.key === '2') handleAnswer('paraphyletic');
      if (e.key === '3') handleAnswer('polyphyletic');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedback, round.exercise, handleAnswer, nextRound]);

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
  const envBorder = envState === 'correct' ? 'border-emerald-900/50' : envState === 'incorrect' ? 'border-rose-900/50' : 'border-zinc-800/60';
  const treeGlowClass = envState === 'correct' ? 'tree-glow-correct' : envState === 'incorrect' ? 'tree-glow-incorrect' : '';

  const displayNewick = newickAtual;
  const highlightTaxa = round.clade?.taxaInGroup ?? [];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-950 relative">

      {/* ── Barra de navegação ── */}
      <div className={`shrink-0 flex items-center gap-3 px-4 py-2.5 border-b transition-colors duration-700 ${envBorder} relative z-10`}>

        {/* Logo */}
        <span className="text-xs font-black tracking-tighter text-zinc-600 select-none">CladeX</span>

        <button
          onClick={onBack}
          className="flex items-center text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={15} />
        </button>

        <span className="text-sm font-medium text-zinc-400 truncate flex-1">{MODULE_LABELS[module] ?? module}</span>

        {/* Nível */}
        {module !== 'custom' && (() => {
          const total = allTimeStats.treesAttempted + sessionStats.correct + sessionStats.incorrect;
          const lv = getLevel(total);
          return <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline ${lv.style}`}>{lv.label}</span>;
        })()}

        {/* Donut de acerto */}
        {module !== 'custom' && (
          <DonutScore correct={sessionStats.correct} total={sessionStats.correct + sessionStats.incorrect} />
        )}

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


      {/* ── Área da árvore — flex-1, zoom+pan isolados ── */}
      <div
        key={`tree-${rippleKey}`}
        ref={treeContainerRef}
        className={`flex-1 min-h-0 relative overflow-hidden border-y ${envBorder} cursor-grab active:cursor-grabbing ${treeGlowClass}`}
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
              showAnswerFeedback={!!feedback}
              theme={theme}
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

      {/* ── Zona inferior: pergunta + respostas / feedback ── */}
      <div
        key={`panel-${rippleKey}`}
        className={`shrink-0 relative z-10 border-t ${envBorder}${envState === 'incorrect' ? ' shake-once' : ''}`}
      >
        {!feedback ? (
          <>
            {/* Pergunta — imediatamente acima dos botões */}
            {round.exercise && (
              <div
                key={`q-${round.tree?.id}-${round.clade?.id}`}
                className="px-5 pt-3 pb-1 question-enter"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  Classificação de clado
                </p>
                <p className="text-base sm:text-lg text-zinc-100 leading-snug font-medium">
                  {round.exercise.question}
                </p>
              </div>
            )}
            <div className="px-4 pb-3 pt-2">
              <AnswerButtons module={module} exercise={round.exercise} onAnswer={handleAnswer} />
            </div>
          </>
        ) : (
          <div className="px-4 py-3">
            <FeedbackPanel feedback={feedback} onNext={nextRound} />
          </div>
        )}
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
            <div className="flex items-start justify-between gap-1">
              <span className="font-semibold text-white text-base leading-tight">{opt.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0 mt-0.5">[{opt.key}]</span>
            </div>
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
    <div className="slide-up">
      {/* Ícone + resultado + botão na mesma linha */}
      <div className="flex items-center gap-3 mb-2">
        {feedback.correct
          ? <CheckCircle className="text-emerald-400 shrink-0" size={28} />
          : <XCircle className="text-rose-400 shrink-0" size={28} />}
        <span className={`font-bold text-lg flex-1 ${feedback.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
          {feedback.message}
        </span>
        {/* Botão ghost — subordinado ao conteúdo didático */}
        <button
          onClick={onNext}
          className="pulse-next shrink-0 px-4 py-1.5 rounded-lg border border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
        >
          Próxima <span className="text-xs text-zinc-600 ml-0.5">↵</span>
        </button>
      </div>

      {/* Explicação — protagonista do feedback */}
      <p className="text-base md:text-lg text-zinc-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderBold(feedback.explanation) }} />
    </div>
  );
}

function renderBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// ─── Donut de acerto ─────────────────────────────────────────────────────────

function DonutScore({ correct, total }: { correct: number; total: number }) {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? correct / total : 0;
  const arc = pct * circ;
  const color = pct >= 0.7 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : total === 0 ? '#3f3f46' : '#f87171';
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-label={total > 0 ? `${correct}/${total} corretas` : 'Sem respostas'}>
      {/* Trilha */}
      <circle cx="15" cy="15" r={r} fill="none" stroke="#27272a" strokeWidth="3.5" />
      {/* Arco de acerto */}
      {total > 0 && (
        <circle
          cx="15" cy="15" r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={`${arc} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
      )}
      {/* Número total no centro */}
      <text x="15" y="19" textAnchor="middle" fontSize="8" fill="#a1a1aa" fontWeight="700">
        {total > 0 ? total : '—'}
      </text>
    </svg>
  );
}
