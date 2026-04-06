import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface TutorialProps {
  onBack: () => void
  onStartTraining: (module: string) => void
}

// ── Coordenadas da árvore balanceada ((A,B),(C,D)) ────────────────────────────
// viewBox base: 0 0 215 168 — expandido com margem de 18px em cada lado no SVG

const P = {
  root: [14, 84],
  nAB:  [90, 40],
  nCD:  [90, 128],
  A:    [188, 14],
  B:    [188, 60],
  C:    [188, 106],
  D:    [188, 154],
} as const

type Pt = readonly [number, number]

function Br({ a, b, color, sw = 1.8 }: { a: Pt; b: Pt; color: string; sw?: number }) {
  return (
    <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
      stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
  )
}
function Node({ p, color, r = 3.5 }: { p: Pt; color: string; r?: number }) {
  return <circle cx={p[0]} cy={p[1]} r={r} fill={color} />
}
function Lbl({ p, text, color = '#d1d5db' }: { p: Pt; text: string; color?: string }) {
  return (
    <text x={p[0]} y={p[1] + 4.5}
      fill={color} fontSize={14} fontFamily="system-ui, sans-serif" fontWeight={600}>
      {text}
    </text>
  )
}
function GroupBox({ y1, y2, color }: { y1: number; y2: number; color: string }) {
  return (
    <rect x={174} y={y1 - 8} width={46} height={y2 - y1 + 16} rx={5}
      fill={color} fillOpacity={0.13} stroke={color} strokeOpacity={0.45} strokeWidth={1.5} />
  )
}

// viewBox com 18px de margem em todos os lados para evitar cortes
const VB = '-18 -14 251 196'

function DiagSVG({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={VB} className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {children}
    </svg>
  )
}

// ── Diagrama 1: estrutura básica ───────────────────────────────────────────────
function Diag1() {
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color="#4b5563" sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#4b5563" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color="#4b5563" sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#4b5563" sw={1.7} />
      <Node p={P.root} color="#10b981" r={5} />
      <Node p={P.nAB}  color="#6b7280" />
      <Node p={P.nCD}  color="#6b7280" />
      <text x={2}  y={76} fill="#10b981" fontSize={9} fontFamily="system-ui">raiz</text>
      <text x={74} y={32} fill="#9ca3af" fontSize={9} fontFamily="system-ui" textAnchor="end">ancestral</text>
      <text x={74} y={136} fill="#9ca3af" fontSize={9} fontFamily="system-ui" textAnchor="end">ancestral</text>
      <Lbl p={[195, 14]}  text="A" />
      <Lbl p={[195, 60]}  text="B" />
      <Lbl p={[195, 106]} text="C" />
      <Lbl p={[195, 154]} text="D" />
    </DiagSVG>
  )
}

// ── Diagrama 2: ancestral exclusivo ──────────────────────────────────────────
function Diag2() {
  const em = '#10b981'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color={em}      sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#374151" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color={em}      sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color={em}      sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#374151" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#374151" sw={1.7} />
      <Node p={P.root} color={em}      r={5} />
      <Node p={P.nAB}  color={em}      r={5} />
      <Node p={P.nCD}  color="#4b5563"         />
      <text x={90} y={26} fill={em} fontSize={9} fontFamily="system-ui" textAnchor="middle">
        ancestral exclusivo de A + B
      </text>
      <Lbl p={[195, 14]}  text="A" color={em}      />
      <Lbl p={[195, 60]}  text="B" color={em}      />
      <Lbl p={[195, 106]} text="C" color="#4b5563" />
      <Lbl p={[195, 154]} text="D" color="#4b5563" />
    </DiagSVG>
  )
}

// ── Diagrama 3: monofilético ──────────────────────────────────────────────────
function Diag3() {
  const em = '#10b981'
  return (
    <DiagSVG>
      <GroupBox y1={14} y2={60} color={em} />
      <Br a={P.root} b={P.nAB} color={em}      sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#374151" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color={em}      sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color={em}      sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#374151" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#374151" sw={1.7} />
      <Node p={P.root} color="#4b5563"         />
      <Node p={P.nAB}  color={em}      r={5}   />
      <Node p={P.nCD}  color="#4b5563"         />
      <Lbl p={[195, 14]}  text="A" color={em}      />
      <Lbl p={[195, 60]}  text="B" color={em}      />
      <Lbl p={[195, 106]} text="C" />
      <Lbl p={[195, 154]} text="D" />
    </DiagSVG>
  )
}

// ── Diagrama 4: parafilético ──────────────────────────────────────────────────
function Diag4() {
  const am   = '#f59e0b'
  const rose = '#f43f5e'
  return (
    <DiagSVG>
      <GroupBox y1={14} y2={106} color={am} />
      <Br a={P.root} b={P.nAB} color={am}   sw={2.2} />
      <Br a={P.root} b={P.nCD} color={am}   sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color={am}   sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color={am}   sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color={am}   sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color={rose} sw={1.7} />
      <Node p={P.root} color={am}   r={5} />
      <Node p={P.nAB}  color={am}         />
      <Node p={P.nCD}  color={am}         />
      <Lbl p={[195, 14]}  text="A" color={am}   />
      <Lbl p={[195, 60]}  text="B" color={am}   />
      <Lbl p={[195, 106]} text="C" color={am}   />
      <Lbl p={[195, 154]} text="D" color={rose} />
      {/* X sobre D */}
      <line x1={187} y1={147} x2={201} y2={161} stroke={rose} strokeWidth={2} />
      <line x1={187} y1={161} x2={201} y2={147} stroke={rose} strokeWidth={2} />
    </DiagSVG>
  )
}

// ── Diagrama 5: polifilético ──────────────────────────────────────────────────
function Diag5() {
  const rose = '#f43f5e'
  const gray = '#374151'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color={gray} sw={2.2} />
      <Br a={P.root} b={P.nCD} color={gray} sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color={rose} sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color={gray} sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color={rose} sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color={gray} sw={1.7} />
      <Node p={P.root} color="#4b5563"         />
      <Node p={P.nAB}  color="#4b5563"         />
      <Node p={P.nCD}  color="#4b5563"         />
      <Lbl p={[195, 14]}  text="A" color={rose} />
      <Lbl p={[195, 60]}  text="B"              />
      <Lbl p={[195, 106]} text="C" color={rose} />
      <Lbl p={[195, 154]} text="D"              />
      {/* Linha pontilhada mostrando que A e C estão em lados opostos */}
      <line x1={188} y1={14} x2={188} y2={106}
        stroke={rose} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7} />
    </DiagSVG>
  )
}

// ── Slides ─────────────────────────────────────────────────────────────────────
interface Slide { title: string; tag: string; body: string; diagram: React.ReactNode }

const SLIDES: Slide[] = [
  {
    title: 'Lendo uma Árvore',
    tag: 'Estrutura',
    body: 'Cada ramo representa uma linhagem evolutiva. As pontas (A, B, C, D) são os táxons. A raiz é o ancestral comum de todos. Quanto mais próximos dois táxons, mais recente seu ancestral compartilhado.',
    diagram: <Diag1 />,
  },
  {
    title: 'Ancestral Comum',
    tag: 'Parentesco',
    body: 'A e B compartilham um nó (ancestral exclusivo) que não inclui C ou D. Por isso A e B são mais próximos entre si do que de qualquer outro grupo. Esse nó é o critério para definir clados.',
    diagram: <Diag2 />,
  },
  {
    title: 'Clado Monofilético',
    tag: 'Monofilético',
    body: 'Um grupo é monofilético quando inclui um ancestral e TODOS os seus descendentes. O grupo A+B é monofilético: compartilham o nó verde e nenhum descendente desse nó foi excluído.',
    diagram: <Diag3 />,
  },
  {
    title: 'Clado Parafilético',
    tag: 'Parafilético',
    body: 'Um grupo é parafilético quando inclui o ancestral mas EXCLUI alguns descendentes. O grupo {A, B, C} tem a raiz como ancestral, mas exclui D — que também descende da mesma raiz.',
    diagram: <Diag4 />,
  },
  {
    title: 'Clado Polifilético',
    tag: 'Polifilético',
    body: 'Um grupo é polifilético quando seus membros não compartilham um ancestral exclusivo. A e C estão em lados opostos da árvore: qualquer ancestral comum a eles também inclui B e D.',
    diagram: <Diag5 />,
  },
]

const TAG_CLS: Record<string, string> = {
  Estrutura:    'text-zinc-400 border-zinc-700',
  Parentesco:   'text-blue-400 border-blue-800',
  Monofilético: 'text-emerald-400 border-emerald-800',
  Parafilético: 'text-amber-400 border-amber-800',
  Polifilético: 'text-rose-400 border-rose-800',
}

// ── Componente ─────────────────────────────────────────────────────────────────
export default function Tutorial({ onBack, onStartTraining }: TutorialProps) {
  const [idx, setIdx] = useState(0)
  const done  = idx >= SLIDES.length
  const slide = done ? null : SLIDES[idx]

  const next = () => setIdx(i => i + 1)
  const prev = () => setIdx(i => Math.max(0, i - 1))

  return (
    <div className="relative h-dvh overflow-hidden flex flex-col bg-zinc-950">

      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div className="shrink-0 relative flex items-center px-4 py-2.5 border-b border-zinc-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 transition-colors z-10"
        >
          <ArrowLeft size={15} />
          <span className="text-sm hidden sm:inline">Voltar</span>
        </button>

        {/* Logo centrado absolutamente */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-lg font-black tracking-tighter text-zinc-200">CladeX</span>
        </div>

        {/* Dots à direita */}
        <div className="ml-auto flex items-center gap-1.5 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx ? 'bg-emerald-400 scale-125' : i < idx ? 'bg-emerald-800' : 'bg-zinc-700'
              }`}
            />
          ))}
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${done ? 'bg-emerald-400 scale-125' : 'bg-zinc-700'}`} />
        </div>
      </div>

      {done ? (
        /* ── Tela final ─────────────────────────────────────────────── */
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Play className="w-7 h-7 text-emerald-400 ml-0.5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">Pronto para Praticar!</h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-sm">
              Você conhece os conceitos. Escolha um grupo taxonômico e comece a identificar clados na árvore.
            </p>
          </div>
          <button
            onClick={() => onStartTraining('invertebrados-gerais')}
            className="bg-emerald-700 hover:bg-emerald-600 px-8 py-3 rounded-2xl text-base sm:text-lg font-semibold transition-colors"
          >
            Começar agora
          </button>
          <button onClick={onBack} className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            Voltar ao início
          </button>
        </div>
      ) : (
        /* ── Slide de conteúdo ──────────────────────────────────────── */
        <div className="flex-1 flex flex-col tutorial-slide overflow-hidden">

          {/* Diagrama */}
          <div className="tutorial-diagram-area flex-1 min-h-0 flex items-center justify-center p-6">
            {slide!.diagram}
          </div>

          {/* Texto + navegação */}
          <div className="tutorial-text-area shrink-0 flex flex-col border-t border-zinc-800/60">
            <div className="px-6 pt-4 pb-2">
              <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest border px-2 py-0.5 rounded-full mb-2 ${TAG_CLS[slide!.tag] ?? TAG_CLS.Estrutura}`}>
                {slide!.tag}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 mb-2">{slide!.title}</h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{slide!.body}</p>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between px-6 py-3">
              <button onClick={prev} disabled={idx === 0}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-xs text-zinc-600 tabular-nums">{idx + 1} / {SLIDES.length}</span>
              <button onClick={next}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                {idx === SLIDES.length - 1 ? 'Concluir' : 'Próximo'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
