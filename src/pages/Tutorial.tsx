import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

interface TutorialProps {
  onBack: () => void
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
function StateMarker({ p, derived, color }: { p: Pt; derived: boolean; color: string }) {
  const [x, y] = p
  return derived
    ? <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={color} opacity={0.9} />
    : <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} fill="none"
        stroke={color} strokeWidth={1.8} opacity={0.75} />
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

// ── Diagramas — Clados ────────────────────────────────────────────────────────

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
      <line x1={187} y1={147} x2={201} y2={161} stroke={rose} strokeWidth={2} />
      <line x1={187} y1={161} x2={201} y2={147} stroke={rose} strokeWidth={2} />
    </DiagSVG>
  )
}

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
      <line x1={188} y1={14} x2={188} y2={106}
        stroke={rose} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7} />
    </DiagSVG>
  )
}

// ── Diagramas — Sinapomorfias ─────────────────────────────────────────────────

function DiagSina1() {
  const blue = '#3b82f6'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color="#4b5563" sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#4b5563" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color="#4b5563" sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#4b5563" sw={1.7} />
      <Node p={P.root} color="#6b7280" r={4} />
      <Node p={P.nAB}  color="#6b7280" />
      <Node p={P.nCD}  color="#6b7280" />
      <StateMarker p={[200, 14]}  derived={true}  color={blue} />
      <StateMarker p={[200, 60]}  derived={true}  color={blue} />
      <StateMarker p={[200, 106]} derived={false} color="#6b7280" />
      <StateMarker p={[200, 154]} derived={false} color="#6b7280" />
      <text x={186} y={2} fill={blue} fontSize={8} fontFamily="system-ui" textAnchor="middle">caráter X</text>
      <Lbl p={[195, 14]}  text="A" color="#d1d5db" />
      <Lbl p={[195, 60]}  text="B" color="#d1d5db" />
      <Lbl p={[195, 106]} text="C" color="#6b7280"  />
      <Lbl p={[195, 154]} text="D" color="#6b7280"  />
    </DiagSVG>
  )
}

function DiagSina2() {
  const blue = '#3b82f6'
  const gray = '#6b7280'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color="#4b5563" sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#4b5563" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color="#4b5563" sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#4b5563" sw={1.7} />
      <Node p={P.root} color="#6b7280" r={4} />
      <Node p={P.nAB}  color="#6b7280" />
      <Node p={P.nCD}  color="#6b7280" />
      {/* A, B, C: estado ancestral (aberto, cinza) */}
      <StateMarker p={[200, 14]}  derived={false} color={gray} />
      <StateMarker p={[200, 60]}  derived={false} color={gray} />
      <StateMarker p={[200, 106]} derived={false} color={gray} />
      {/* D: estado derivado (preenchido, azul) */}
      <StateMarker p={[200, 154]} derived={true}  color={blue} />
      <text x={-4} y={88} fill={gray} fontSize={8} fontFamily="system-ui" textAnchor="middle">outgroup</text>
      <Lbl p={[195, 14]}  text="A" color="#d1d5db" />
      <Lbl p={[195, 60]}  text="B" color="#d1d5db" />
      <Lbl p={[195, 106]} text="C" color="#d1d5db" />
      <Lbl p={[195, 154]} text="D" color={blue}    />
    </DiagSVG>
  )
}

function DiagSina3() {
  const em = '#10b981'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color={em}      sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#374151" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color={em}      sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color={em}      sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#374151" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#374151" sw={1.7} />
      <Node p={P.root} color="#4b5563" r={3.5} />
      <Node p={P.nCD}  color="#4b5563" r={3.5} />
      {/* Anel de origem no nó nAB */}
      <circle cx={P.nAB[0]} cy={P.nAB[1]} r={7} fill="none" stroke={em} strokeWidth={2} />
      <circle cx={P.nAB[0]} cy={P.nAB[1]} r={3} fill={em} />
      <text x={P.nAB[0] + 12} y={P.nAB[1] - 6} fill={em} fontSize={8} fontFamily="system-ui">origem</text>
      <StateMarker p={[200, 14]}  derived={true}  color={em} />
      <StateMarker p={[200, 60]}  derived={true}  color={em} />
      <StateMarker p={[200, 106]} derived={false} color="#6b7280" />
      <StateMarker p={[200, 154]} derived={false} color="#6b7280" />
      <Lbl p={[195, 14]}  text="A" color={em}      />
      <Lbl p={[195, 60]}  text="B" color={em}      />
      <Lbl p={[195, 106]} text="C" color="#4b5563" />
      <Lbl p={[195, 154]} text="D" color="#4b5563" />
    </DiagSVG>
  )
}

function DiagSina4() {
  const sky  = '#0ea5e9'
  const gray = '#6b7280'
  return (
    <DiagSVG>
      <Br a={P.root} b={P.nAB} color="#4b5563" sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#4b5563" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color="#4b5563" sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#4b5563" sw={1.7} />
      <Node p={P.root} color="#6b7280" r={4} />
      <Node p={P.nAB}  color="#6b7280" />
      <Node p={P.nCD}  color="#6b7280" />
      <StateMarker p={[200, 14]}  derived={true}  color={sky}  />
      <StateMarker p={[200, 60]}  derived={false} color={gray} />
      <StateMarker p={[200, 106]} derived={false} color={gray} />
      <StateMarker p={[200, 154]} derived={false} color={gray} />
      <Lbl p={[195, 14]}  text="A" color={sky}      />
      <Lbl p={[195, 60]}  text="B" color="#d1d5db"  />
      <Lbl p={[195, 106]} text="C" color="#d1d5db"  />
      <Lbl p={[195, 154]} text="D" color="#d1d5db"  />
    </DiagSVG>
  )
}

function DiagSina5() {
  const am   = '#f59e0b'
  const slate = '#64748b'
  return (
    <DiagSVG>
      <GroupBox y1={14} y2={106} color={am} />
      <Br a={P.root} b={P.nAB} color="#4b5563" sw={2.2} />
      <Br a={P.root} b={P.nCD} color="#4b5563" sw={2.2} />
      <Br a={P.nAB}  b={P.A}   color="#4b5563" sw={1.7} />
      <Br a={P.nAB}  b={P.B}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.C}   color="#4b5563" sw={1.7} />
      <Br a={P.nCD}  b={P.D}   color="#4b5563" sw={1.7} />
      <Node p={P.root} color="#6b7280" r={4} />
      <Node p={P.nAB}  color="#6b7280" />
      <Node p={P.nCD}  color="#6b7280" />
      <StateMarker p={[200, 14]}  derived={false} color={am}    />
      <StateMarker p={[200, 60]}  derived={false} color={am}    />
      <StateMarker p={[200, 106]} derived={false} color={am}    />
      <StateMarker p={[200, 154]} derived={true}  color={slate} />
      <text x={185} y={68} fill={am} fontSize={7.5} fontFamily="system-ui" textAnchor="middle">
        simplesiomorfia?
      </text>
      <Lbl p={[195, 14]}  text="A" color={am}      />
      <Lbl p={[195, 60]}  text="B" color={am}      />
      <Lbl p={[195, 106]} text="C" color={am}      />
      <Lbl p={[195, 154]} text="D" color="#9ca3af" />
    </DiagSVG>
  )
}

// ── Slides ─────────────────────────────────────────────────────────────────────
interface Slide { title: string; tag: string; body: string; diagram: React.ReactNode }

const CLADOS_SLIDES: Slide[] = [
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
    body: 'Um grupo é monofilético quando inclui um ancestral e TODOS os seus descendentes. O grupo A+B é monofilético: compartilham um ancestral exclusivo e nenhum descendente foi omitido.',
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

const SINAPOMORFIAS_SLIDES: Slide[] = [
  {
    title: 'Caracteres na Filogenia',
    tag: 'Fundamentos',
    body: 'Caracteres são atributos que variam entre os táxons — morfológicos, moleculares ou comportamentais. Comparamos os estados de cada caráter para inferir qual táxon compartilha qual história evolutiva. Aqui, A e B apresentam o estado derivado do caráter X (quadrado preenchido); C e D não.',
    diagram: <DiagSina1 />,
  },
  {
    title: 'Estado Ancestral e Derivado',
    tag: 'Plesiomorfia',
    body: 'O ponto de partida é o grupo externo (outgroup). O estado presente no outgroup é considerado ancestral — chamado plesiomórfico. Qualquer mudança a partir desse estado é uma apomorfia (estado derivado). Aqui A, B e C têm o estado ancestral; D possui uma apomorfia.',
    diagram: <DiagSina2 />,
  },
  {
    title: 'Sinapomorfia',
    tag: 'Sinapomorfia',
    body: 'Uma sinapomorfia é um estado derivado compartilhado por dois ou mais táxons. Ela surgiu em um nó ancestral interno (marcado com anel) e foi herdada por todos os descendentes desse nó. Sinapomorfias são a principal evidência para reconhecer clados monofiléticos.',
    diagram: <DiagSina3 />,
  },
  {
    title: 'Autapomorfia',
    tag: 'Autapomorfia',
    body: 'Uma autapomorfia é um estado derivado exclusivo de um único táxon — surgiu naquele terminal e não foi herdado por outros. Autapomorfias identificam e caracterizam o grupo, mas não revelam parentesco com outros táxons.',
    diagram: <DiagSina4 />,
  },
  {
    title: 'Simplesiomorfia',
    tag: 'Simplesiomorfia',
    body: 'Uma simplesiomorfia é um estado ancestral compartilhado por vários táxons. A, B e C têm o mesmo estado — mas herdado da raiz, antes de qualquer divergência. Compartilhar uma condição primitiva não é evidência de clado: é apenas herança do ancestral comum mais remoto.',
    diagram: <DiagSina5 />,
  },
]

const TAG_CLS: Record<string, string> = {
  Estrutura:      'text-zinc-400 border-zinc-700',
  Parentesco:     'text-blue-400 border-blue-800',
  Monofilético:   'text-emerald-400 border-emerald-800',
  Parafilético:   'text-amber-400 border-amber-800',
  Polifilético:   'text-rose-400 border-rose-800',
  Fundamentos:    'text-zinc-400 border-zinc-700',
  Plesiomorfia:   'text-sky-400 border-sky-800',
  Sinapomorfia:   'text-emerald-400 border-emerald-800',
  Autapomorfia:   'text-sky-400 border-sky-800',
  Simplesiomorfia:'text-amber-400 border-amber-800',
}

// ── Catálogo ───────────────────────────────────────────────────────────────────
type TutorialId = 'clados' | 'sinapomorfias'

interface CatalogEntry {
  title: string
  subtitle: string
  icon: string
  slides: Slide[]
  accentCls: string
}

const CATALOG: Record<TutorialId, CatalogEntry> = {
  clados: {
    title: 'Clados',
    subtitle: 'Mono, para e polifilético',
    icon: '🌿',
    slides: CLADOS_SLIDES,
    accentCls: 'border-emerald-700/60 hover:border-emerald-500/80',
  },
  sinapomorfias: {
    title: 'Sinapomorfias',
    subtitle: 'Caracteres e tipos de homologia',
    icon: '✦',
    slides: SINAPOMORFIAS_SLIDES,
    accentCls: 'border-sky-700/60 hover:border-sky-500/80',
  },
}

// ── Componente ─────────────────────────────────────────────────────────────────
export default function Tutorial({ onBack }: TutorialProps) {
  const [selectedId, setSelectedId] = useState<TutorialId | null>(null)
  const [idx, setIdx] = useState(0)

  const goHub = () => { setSelectedId(null); setIdx(0) }

  // ── Hub ──────────────────────────────────────────────────────────────────────
  if (selectedId === null) {
    return (
      <div className="relative h-dvh overflow-hidden flex flex-col bg-zinc-950">
        <div className="shrink-0 relative flex items-center px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-md">
          <button
            onClick={onBack}
            className="btn-juicy p-1.5 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-200 transition-all z-10"
          >
            <ArrowLeft size={18} />
          </button>
          <button onClick={onBack} className="absolute inset-0 flex items-center justify-center select-none hover:opacity-70 transition-opacity">
            <span className="text-base font-black tracking-tighter text-zinc-100">Clade<span className="text-emerald-500">X</span></span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center">
            <BookOpen className="mx-auto mb-3 text-zinc-500" size={28} />
            <h2 className="text-2xl font-bold text-zinc-100 mb-1">Tutoriais</h2>
            <p className="text-sm text-zinc-500">Escolha um tema para começar</p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-4">
            {(Object.entries(CATALOG) as [TutorialId, CatalogEntry][]).map(([id, entry]) => (
              <button
                key={id}
                onClick={() => { setSelectedId(id); setIdx(0) }}
                className={`w-full text-left p-5 rounded-2xl bg-zinc-900 border transition-all ${entry.accentCls}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{entry.icon}</span>
                  <div>
                    <div className="text-base font-bold text-zinc-100">{entry.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{entry.subtitle}</div>
                    <div className="text-xs text-zinc-600 mt-1">{entry.slides.length} slides</div>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={onBack}
              className="btn-juicy w-full text-center text-sm text-zinc-600 hover:text-zinc-300 py-3 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <ArrowLeft size={14} />
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Slides ───────────────────────────────────────────────────────────────────
  const entry  = CATALOG[selectedId]
  const slides = entry.slides
  const done   = idx >= slides.length
  const slide  = done ? null : slides[idx]

  const next = () => setIdx(i => i + 1)
  const prev = () => setIdx(i => Math.max(0, i - 1))

  return (
    <div className="relative h-dvh overflow-hidden flex flex-col bg-zinc-950">

      {/* ── Cabeçalho ───────────────────────────────────────────────── */}
      <div className="shrink-0 relative flex items-center px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-md">
        <button
          onClick={goHub}
          className="btn-juicy p-1.5 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-200 transition-all z-10"
        >
          <ArrowLeft size={18} />
        </button>

        <button onClick={onBack} className="absolute inset-0 flex items-center justify-center select-none hover:opacity-70 transition-opacity">
          <span className="text-base font-black tracking-tighter text-zinc-100">Clade<span className="text-emerald-500">X</span></span>
        </button>

        {/* Dots à direita */}
        <div className="ml-auto flex items-center gap-1.5 z-10">
          {slides.map((_, i) => (
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
        /* ── Tela de conclusão ──────────────────────────────────────── */
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-3xl">{entry.icon}</span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
              {entry.title} concluído!
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-sm">
              Você terminou todos os slides deste tutorial. Volte ao menu para explorar outros temas ou retorne ao início.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <button
              onClick={goHub}
              className="w-full bg-emerald-700 hover:bg-emerald-600 px-8 py-3 rounded-2xl text-base font-semibold transition-colors"
            >
              Ver outros tutoriais
            </button>
            <button onClick={onBack} className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
              Ir para o início
            </button>
          </div>
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
              <span className="text-xs text-zinc-600 tabular-nums">{idx + 1} / {slides.length}</span>
              <button onClick={next}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                {idx === slides.length - 1 ? 'Concluir' : 'Próximo'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
