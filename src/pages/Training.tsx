import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { getLevelIndex, getLevel, type LevelInfo } from '../utils/levels';
import TreeViewer from '../components/TreeViewer';
import { useCladexStore } from '../store';
import { getTreesByModule, getModuleLabel, type CuratedTree, type ExerciseClade } from '../data/index';
import { cladeToExercise, homologyToExercise, characterPlacementToExercise, leafPlacementToExercise, checkAnswer } from '../utils/exercises';
import { validateNewick, parseNewick, collectLeafNames } from '../utils/newick';
import { PHYLOPIC_STATIC } from '../data/phylopic-cache';
import { fetchSilhouetteBatch } from '../utils/phylopic';
import type { Exercise, Feedback } from '../store';

// ─── Props e tipos ────────────────────────────────────────────────────────────

interface TrainingProps { module: string; onBack: () => void; onViewResults: () => void }


interface Round {
  tree: CuratedTree | null;
  clade: ExerciseClade | null;
  exercise: Exercise | null;
  treeStyle: 'elbow' | 'diagonal';
  /** Folhas ocultas para leaf-placement: alvo + 2 decoys */
  hiddenLeaves?: string[];
  /** Chave única para rastrear exercícios já usados */
  key: string;
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

/** Conta o total de exercícios únicos disponíveis para um módulo */
function countPoolSize(mod: string): number {
  let n = 0;
  for (const tree of getTreesByModule(mod)) {
    for (const clade of tree.clades) {
      n++; // clade-classification
      if (clade.characters?.length) n += clade.characters.length * 2; // homology-type + character-placement por caráter
      if (clade.leafHints?.length) n++;     // leaf-placement
    }
  }
  return n;
}

/** Gera a próxima rodada evitando repetir exercícios já vistos.
 *  Retorna `key === '__reset__'` quando o pool foi esgotado (o caller deve limpar usedKeys). */
function makeRound(mod: string, totalAttempts: number, usedKeys: Set<string>): Round {
  if (mod === 'custom') return { tree: null, clade: null, exercise: null, treeStyle: 'elbow', key: '' };

  const trees = getTreesByModule(mod);
  if (!trees.length) return { tree: null, clade: null, exercise: null, treeStyle: 'elbow', key: '' };

  // Constrói lista de todas as combinações (tree × clade × type) ainda não usadas
  type Candidate = { tree: CuratedTree; clade: ExerciseClade; exercise: Exercise; key: string };
  const available: Candidate[] = [];

  for (const tree of trees) {
    for (const clade of tree.clades) {
      const cladeKey = `${tree.id}-${clade.id}-clade-classification`;
      if (!usedKeys.has(cladeKey))
        available.push({ tree, clade, exercise: cladeToExercise(clade), key: cladeKey });

      if (clade.characters?.length) {
        clade.characters.forEach((char, i) => {
          const homoKey = `${tree.id}-${clade.id}-homology-type-${i}`;
          const charKey  = `${tree.id}-${clade.id}-character-placement-${i}`;
          if (!usedKeys.has(homoKey)) available.push({ tree, clade, exercise: homologyToExercise(char), key: homoKey });
          if (!usedKeys.has(charKey))  available.push({ tree, clade, exercise: characterPlacementToExercise(char), key: charKey });
        });
      }

      if (clade.leafHints?.length) {
        const hint = clade.leafHints[Math.floor(Math.random() * clade.leafHints.length)];
        const leafKey = `${tree.id}-${clade.id}-leaf-placement`;
        if (!usedKeys.has(leafKey)) available.push({ tree, clade, exercise: leafPlacementToExercise(hint), key: leafKey });
      }
    }
  }

  // Pool esgotado — sinaliza para o caller reiniciar
  if (!available.length)
    return { tree: null, clade: null, exercise: null, treeStyle: 'elbow', key: '__reset__' };

  const { tree, clade, exercise, key } = available[Math.floor(Math.random() * available.length)];

  // Para leaf-placement: ocultar o alvo + 2 decoys aleatórios da mesma árvore
  let hiddenLeaves: string[] | undefined;
  if (exercise.type === 'leaf-placement' && exercise.meta?.hiddenLeaf) {
    const target = exercise.meta.hiddenLeaf;
    const pool = collectLeafNames(parseNewick(tree.newick)).filter(l => l !== target);
    const decoys: string[] = [];
    for (let i = 0; i < 2 && pool.length > 0; i++)
      decoys.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    hiddenLeaves = [target, ...decoys];
  }

  return { tree, clade, exercise, treeStyle: pickTreeStyle(totalAttempts), hiddenLeaves, key };
}

type EnvState = 'neutral' | 'correct' | 'incorrect';

const CLADE_OPTIONS = [
  { value: 'monophyletic', label: 'Monofilético', desc: 'Ancestral + todos os descendentes', key: '1', cls: 'bg-emerald-900/50 hover:bg-emerald-800/70 border-emerald-700/50' },
  { value: 'paraphyletic', label: 'Parafilético',  desc: 'Ancestral + alguns descendentes',  key: '2', cls: 'bg-amber-900/50  hover:bg-amber-800/70  border-amber-700/50'  },
  { value: 'polyphyletic', label: 'Polifilético',  desc: 'Sem ancestral exclusivo',           key: '3', cls: 'bg-rose-900/50   hover:bg-rose-800/70   border-rose-700/50'   },
];

const HOMOLOGY_OPTIONS = [
  { value: 'sinapomorfia',    label: 'Sinapomorfia',    desc: 'Caráter derivado compartilhado por um clado', key: '1', cls: 'bg-emerald-900/50 hover:bg-emerald-800/70 border-emerald-700/50' },
  { value: 'autapomorfia',    label: 'Autapomorfia',    desc: 'Caráter derivado exclusivo de um táxon',      key: '2', cls: 'bg-sky-900/50     hover:bg-sky-800/70     border-sky-700/50'     },
  { value: 'plesiomorfia',    label: 'Plesiomorfia',    desc: 'Caráter ancestral herdado do grupo externo',  key: '3', cls: 'bg-amber-900/50  hover:bg-amber-800/70  border-amber-700/50'  },
  { value: 'simplesiomorfia', label: 'Simplesiomorfia', desc: 'Plesiomorfia compartilhada por vários táxons', key: '4', cls: 'bg-zinc-800/60   hover:bg-zinc-700/60   border-zinc-600/50'   },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Training({ module, onBack, onViewResults }: TrainingProps) {
  const { sessionStats, allTimeStats, recordAnswer, theme } = useCladexStore();

  const [usedKeys, setUsedKeys] = useState<Set<string>>(() => new Set());
  const [poolCycle, setPoolCycle] = useState(0); // incrementa a cada reset do pool
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [round, setRound] = useState<Round>(() =>
    makeRound(module, useCladexStore.getState().allTimeStats.treesAttempted, new Set()),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [envState, setEnvState] = useState<EnvState>('neutral');
  const [rippleKey, setRippleKey] = useState(0);
  const [levelUpData, setLevelUpData] = useState<LevelInfo | null>(null);
  const prevLevelIdx = useRef(getLevelIndex(allTimeStats.correct));

  // Silhuetas PhyloPic — inicia com o cache estático dos 33 táxons curados
  const [silhouetteUrls, setSilhouetteUrls] = useState<Record<string, string>>(PHYLOPIC_STATIC);

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

  // ── Detecção de promoção de nível ────────────────────────────────────────────
  useEffect(() => {
    const idx = getLevelIndex(allTimeStats.correct);
    if (idx > prevLevelIdx.current) {
      setLevelUpData(getLevel(allTimeStats.correct));
    }
    prevLevelIdx.current = idx;
  }, [allTimeStats.correct]);

  // ── Zoom + Pan na árvore ─────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  // Wheel: zoom em direção ao cursor
  useEffect(() => {
    const el = treeContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      const rect = el.getBoundingClientRect();
      // posição do cursor relativa ao centro do container
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      setZoom(z => {
        const newZoom = Math.max(0.4, Math.min(6, z * factor));
        const ratio = newZoom / z;
        // ajusta pan para que o ponto sob o cursor permaneça fixo
        setPan(p => ({ x: cx - ratio * (cx - p.x), y: cy - ratio * (cy - p.y) }));
        return newZoom;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer: pan via drag — capture só começa após threshold para não bloquear cliques filhos
  const DRAG_THRESHOLD = 5;
  const hasDragged = useRef(false);
  const startPos   = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startPos.current   = { x: e.clientX, y: e.clientY };
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.buttons) return;
    if (!isDragging.current) {
      const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
      if (dist < DRAG_THRESHOLD) return;
      isDragging.current = true;
      hasDragged.current = true;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    }
    const dx = e.clientX - lastPanPos.current.x;
    const dy = e.clientY - lastPanPos.current.y;
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onPointerUp = () => { isDragging.current = false; };
  // Impede cliques fantasma após um arraste (o evento click ainda dispara pós-pointerup)
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) { e.stopPropagation(); hasDragged.current = false; }
  };

  // Touch: pinch-to-zoom em direção ao ponto médio dos dedos
  const lastPinchMid = useRef({ x: 0, y: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const el = treeContainerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        lastPinchMid.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - rect.width / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - rect.height / 2,
        };
      }
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
    const el = treeContainerRef.current;
    const mid = el ? (() => {
      const rect = el.getBoundingClientRect();
      return {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - rect.width / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - rect.height / 2,
      };
    })() : lastPinchMid.current;

    setZoom(z => {
      const newZoom = Math.max(0.4, Math.min(6, z * ratio));
      const zRatio = newZoom / z;
      const cx = mid.x, cy = mid.y;
      setPan(p => ({ x: cx - zRatio * (cx - p.x), y: cy - zRatio * (cy - p.y) }));
      return newZoom;
    });
    lastPinchDist.current = dist;
    lastPinchMid.current = mid;
  };

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Rodadas ──────────────────────────────────────────────────────────────────
  const nextRound = useCallback(() => {
    const total = allTimeStats.treesAttempted + sessionStats.correct + sessionStats.incorrect;

    // Marca o exercício atual como usado
    const nextUsed = new Set(usedKeys);
    if (round.key && round.key !== '__reset__') nextUsed.add(round.key);

    let next = makeRound(module, total, nextUsed);

    // Pool esgotado → exibir tela de conclusão
    if (next.key === '__reset__') {
      setUsedKeys(nextUsed);
      setFeedback(null);
      setEnvState('neutral');
      setShowEndScreen(true);
      return;
    }

    setUsedKeys(nextUsed);
    setRound(next);
    setFeedback(null);
    setEnvState('neutral');
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [module, allTimeStats.treesAttempted, sessionStats.correct, sessionStats.incorrect, usedKeys, round.key]);

  const handleContinueAfterEnd = useCallback(() => {
    const total = allTimeStats.treesAttempted + sessionStats.correct + sessionStats.incorrect;
    const freshSet = new Set<string>();
    const next = makeRound(module, total, freshSet);
    setUsedKeys(freshSet);
    setPoolCycle(c => c + 1);
    setRound(next);
    setFeedback(null);
    setEnvState('neutral');
    setShowEndScreen(false);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [module, allTimeStats.treesAttempted, sessionStats.correct, sessionStats.incorrect]);

  // ── Resposta ─────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!round.exercise || feedback) return;
      const correct = checkAnswer(round.exercise, answer);
      recordAnswer(
        round.exercise.type, correct,
        round.tree?.moduleId ?? module,
        round.exercise.question,
      );
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
      if (round.exercise?.type === 'clade-classification') {
        if (e.key === '1') handleAnswer('monophyletic');
        if (e.key === '2') handleAnswer('paraphyletic');
        if (e.key === '3') handleAnswer('polyphyletic');
      } else if (round.exercise?.type === 'homology-type') {
        if (e.key === '1') handleAnswer('sinapomorfia');
        if (e.key === '2') handleAnswer('autapomorfia');
        if (e.key === '3') handleAnswer('plesiomorfia');
        if (e.key === '4') handleAnswer('simplesiomorfia');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedback, round.exercise, handleAnswer, nextRound]);

  // ── Custom Newick ────────────────────────────────────────────────────────────
  const handleLoadCustom = () => {
    const result = validateNewick(customNewick);
    if (!result.valid) { setCustomError(result.error ?? 'Newick inválido.'); return; }
    setCustomError('');
    setCustomTree(customNewick);
    setFeedback(null); setEnvState('neutral');
    setPan({ x: 0, y: 0 }); setZoom(1);
  };

  // ── Classes de ambiente ──────────────────────────────────────────────────────
  const envBorder = envState === 'correct' ? 'border-emerald-900/50' : envState === 'incorrect' ? 'border-rose-900/50' : 'border-zinc-800/60';
  const treeGlowClass = envState === 'correct' ? 'tree-glow-correct' : envState === 'incorrect' ? 'tree-glow-incorrect' : '';

  const displayNewick = module === 'custom' ? customTree : (round.tree?.newick ?? null);

  // Taxa a destacar: suprimir highlight antes do feedback em exercícios que entregam a resposta
  const highlightTaxa = (!feedback && (
    round.exercise?.type === 'character-placement' ||
    round.exercise?.type === 'leaf-placement'
  ))
    ? []
    : (round.exercise?.meta?.highlightTaxa ?? (round.clade?.taxaInGroup ?? []));

  // Handlers para exercícios de clique na árvore
  const handleCharacterAnswer = useCallback((nodeName: string) => {
    handleAnswer(nodeName);
  }, [handleAnswer]);

  const handleLeafAnswer = useCallback((leafName: string) => {
    handleAnswer(leafName);
  }, [handleAnswer]);

  // Busca silhuetas de táxons de custom Newick não cobertos pelo cache estático
  useEffect(() => {
    if (module !== 'custom' || !displayNewick) return;
    const unknown = collectLeafNames(parseNewick(displayNewick))
      .filter(n => !PHYLOPIC_STATIC[n]);
    if (!unknown.length) return;
    fetchSilhouetteBatch(unknown).then(extra =>
      setSilhouetteUrls(prev => ({ ...prev, ...extra })),
    );
  }, [module, displayNewick]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-950 relative">

      {/* ── Level-up overlay ── */}
      {levelUpData && (
        <LevelUpOverlay lv={levelUpData} onDone={() => setLevelUpData(null)} />
      )}

      {/* ── Barra de navegação ── */}
      <div className={`shrink-0 flex items-center gap-3 px-5 py-3 border-b transition-all duration-700 ${theme === 'light' ? 'bg-zinc-900/5 border-zinc-800/20' : 'bg-zinc-950/50 border-zinc-800/40'} backdrop-blur-md relative z-10`}>

        {/* Logo — link para home */}
        <button onClick={onBack} className="flex flex-col -space-y-1 select-none hover:opacity-70 transition-opacity">
          <span className="text-base font-black tracking-tighter text-zinc-100">Clade<span className="text-emerald-500">X</span></span>
        </button>

        <div className="w-px h-6 bg-zinc-800/50 mx-1" />

        <button
          onClick={onBack}
          className="btn-juicy p-1.5 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-200 transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="text-base font-black text-zinc-100 truncate flex-1 tracking-tight">
          {getModuleLabel(module)}
        </span>

        {/* Progresso do pool */}
        {module !== 'custom' && (() => {
          const poolSize = countPoolSize(module);
          const done = Math.min(usedKeys.size + 1, poolSize);
          return (
            <div className="hidden sm:flex flex-col items-end -space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-mono tabular-nums">
                {done}/{poolSize}
              </span>
              {poolCycle > 0 && (
                <span className="text-[9px] text-indigo-500 font-semibold">ciclo {poolCycle + 1}</span>
              )}
            </div>
          );
        })()}

        {/* Nível */}
        {module !== 'custom' && (() => {
          const lv = getLevel(allTimeStats.correct);
          return (
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${lv.style}`}>
              <lv.Icon size={11} strokeWidth={2.5} />
              {lv.label}
            </span>
          );
        })()}

        {/* Donut de acerto + XP acumulado */}
        {module !== 'custom' && (() => {
          const xp = allTimeStats.correct * 10 + allTimeStats.incorrect * 2;
          return (
            <DonutScore
              correct={sessionStats.correct}
              total={sessionStats.correct + sessionStats.incorrect}
              xp={xp}
            />
          );
        })()}
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
        className={`flex-1 min-h-0 relative overflow-hidden border-y ${envBorder} cursor-grab active:cursor-grabbing ${treeGlowClass} select-none`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
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
              cladeType={round.exercise?.type === 'clade-classification' ? round.exercise.correctAnswer : undefined}
              theme={theme}
              silhouetteUrls={silhouetteUrls}
              // Exercícios interativos de clique na árvore
              onInternalNodeClick={
                round.exercise?.type === 'character-placement' && !feedback
                  ? handleCharacterAnswer
                  : undefined
              }
              onLeafClick={
                round.exercise?.type === 'leaf-placement' && !feedback
                  ? handleLeafAnswer
                  : undefined
              }
              hiddenLeaves={
                round.exercise?.type === 'leaf-placement' && !feedback
                  ? (round.hiddenLeaves ?? [])
                  : []
              }
              nodeClickMode={
                round.exercise?.type === 'character-placement' ? 'character-placement' :
                round.exercise?.type === 'leaf-placement'      ? 'leaf-placement' : false
              }
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600 text-base relative z-10">
            {module === 'custom' ? 'Cole um Newick acima e clique em Carregar' : 'Carregando…'}
          </div>
        )}

        {/* Overlay de impacto ✓ / ✗ */}
        {envState !== 'neutral' && (
          <div
            key={`impact-${rippleKey}`}
            className="absolute inset-0 z-20 flex items-center justify-center impact-overlay"
          >
            {envState === 'correct'
              ? <CheckCircle size={120} strokeWidth={1.5} className={`drop-shadow-2xl ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`} />
              : <XCircle    size={120} strokeWidth={1.5} className={`drop-shadow-2xl ${theme === 'light' ? 'text-rose-700'    : 'text-rose-400'}`} />
            }
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

      {/* ── Zona inferior: pergunta + respostas / feedback / conclusão ── */}
      <div
        key={`panel-${rippleKey}`}
        className={`shrink-0 relative z-10 border-t ${envBorder}${envState === 'incorrect' ? ' shake-once' : ''}`}
      >
        {showEndScreen ? (
          <div className="flex flex-col items-center justify-center gap-4 py-6 px-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-bold text-zinc-100">Módulo concluído!</p>
              <p className="text-xs text-zinc-500 mt-1">
                Você respondeu todas as questões disponíveis.
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={handleContinueAfterEnd}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-200 transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={onViewResults}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold text-white transition-colors"
              >
                Ver Resultados
              </button>
            </div>
          </div>
        ) : !feedback ? (
          <>
            {/* Pergunta — imediatamente acima dos botões */}
            {round.exercise && (
              <div
                key={`q-${round.tree?.id}-${round.clade?.id}`}
                className="px-5 pt-3 pb-1 question-enter"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  {round.exercise.type === 'clade-classification'  && 'Classificação de clado'}
                  {round.exercise.type === 'homology-type'         && 'Tipo de homologia'}
                  {round.exercise.type === 'character-placement'   && 'Posicionamento de caráter'}
                  {round.exercise.type === 'leaf-placement'        && 'Identificação de táxon'}
                </p>
                <p className="text-base sm:text-lg text-zinc-100 leading-snug font-medium whitespace-pre-line">
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
    return <HintableOptions onAnswer={onAnswer} />;
  }

  if (exercise.type === 'homology-type') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {HOMOLOGY_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => onAnswer(opt.value)}
            className={`border rounded-xl px-3 py-2.5 text-left transition-colors ${opt.cls}`}>
            <div className="flex items-start justify-between gap-1">
              <span className="font-semibold text-white text-sm leading-tight">{opt.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0 mt-0.5">[{opt.key}]</span>
            </div>
            <span className="block text-xs text-zinc-400 mt-0.5 leading-tight">{opt.desc}</span>
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === 'character-placement') {
    return (
      <p className="text-zinc-400 text-sm text-center py-1 italic">
        Clique no nó interno correto da árvore acima ↑
      </p>
    );
  }

  if (exercise.type === 'leaf-placement') {
    return (
      <p className="text-zinc-400 text-sm text-center py-1 italic">
        Clique na folha "?" correta na árvore acima ↑
      </p>
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

function DonutScore({ correct, total, xp }: { correct: number; total: number; xp: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? correct / total : 0;
  const arc = pct * circ;
  const color = pct >= 0.7 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : total === 0 ? '#52525b' : '#f43f5e';
  const xpStr = xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : String(xp);

  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded-full border border-zinc-800/50 shadow-inner">
      <div className="relative flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" className="transform -rotate-90 drop-shadow-md">
          <circle cx="16" cy="16" r={r} fill="none" stroke="currentColor" className="text-zinc-800/80" strokeWidth="4" />
          {total > 0 && (
            <circle
              cx="16" cy="16" r={r} fill="none"
              stroke={color} strokeWidth="4"
              strokeDasharray={`${arc} ${circ}`}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
            />
          )}
        </svg>
      </div>
      <div className="flex flex-col -space-y-1 mr-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">XP</span>
        <span className="text-xs font-black text-zinc-100">{xpStr}</span>
      </div>
    </div>
  );
}

// ─── Level-up overlay ─────────────────────────────────────────────────────────

const N_PARTICLES = 14;

function LevelUpOverlay({ lv, onDone }: { lv: LevelInfo; onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      style={{ background: 'rgba(5,5,7,0.90)', backdropFilter: 'blur(6px)',
               animation: 'lvlup-overlay-in 0.3s ease both' }}
      onClick={onDone}
    >
      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-4 px-12 py-9 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-xs mx-6"
        style={{
          boxShadow: `0 0 0 1px ${lv.glow}, 0 0 60px ${lv.glow}`,
          animation: 'lvlup-card-in 0.65s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Partículas radiais */}
        {Array.from({ length: N_PARTICLES }, (_, i) => {
          const angle = (i / N_PARTICLES) * Math.PI * 2;
          const dist  = 75 + (i % 3) * 22;
          return (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${lv.particle}`}
              style={{
                top: '50%', left: '50%',
                '--tx': `${Math.cos(angle) * dist}px`,
                '--ty': `${Math.sin(angle) * dist}px`,
                animation: `lvlup-particle 1s ease-out ${i * 0.035}s both`,
              } as React.CSSProperties}
            />
          );
        })}

        {/* Ícone com glow */}
        <div className={lv.style} style={{ filter: `drop-shadow(0 0 18px ${lv.glow})` }}>
          <lv.Icon size={58} strokeWidth={1.4} />
        </div>

        {/* Textos */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[10px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
            Nível alcançado
          </span>
          <span className={`text-3xl font-black tracking-tight ${lv.style}`}>
            {lv.label}
          </span>
          {lv.message && (
            <p className="text-sm text-zinc-400 leading-snug mt-1 max-w-[220px]">
              {lv.message}
            </p>
          )}
        </div>

        <span className="text-[10px] text-zinc-600 mt-2">toque para continuar</span>
      </div>
    </div>
  );
}
