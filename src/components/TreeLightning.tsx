// Cladograma decorativo animado — ramos acendem sequencialmente como relâmpago

interface Segment { d: string; depth: number }

const SEGMENTS: Segment[] = [
  // tronco
  { d: 'M365,940 L365,690', depth: 0 },
  // level 1
  { d: 'M365,690 L185,500', depth: 1 },
  { d: 'M365,690 L545,500', depth: 1 },
  // level 2
  { d: 'M185,500 L95,300',  depth: 2 },
  { d: 'M185,500 L275,300', depth: 2 },
  { d: 'M545,500 L455,300', depth: 2 },
  { d: 'M545,500 L635,300', depth: 2 },
  // level 3 — pontas
  { d: 'M95,300 L50,80',    depth: 3 },
  { d: 'M95,300 L140,80',   depth: 3 },
  { d: 'M275,300 L230,80',  depth: 3 },
  { d: 'M275,300 L320,80',  depth: 3 },
  { d: 'M455,300 L410,80',  depth: 3 },
  { d: 'M455,300 L500,80',  depth: 3 },
  { d: 'M635,300 L590,80',  depth: 3 },
  { d: 'M635,300 L680,80',  depth: 3 },
]

// Atraso por nível (s) — relâmpago se propaga da raiz para as folhas
const DEPTH_DELAY = [0, 0.28, 0.62, 1.0]
const CYCLE = 5.5 // s — pausa entre ciclos

const STROKE_W = [2.4, 2.0, 1.6, 1.2] // mais grosso na base

export default function TreeLightning() {
  return (
    <svg
      viewBox="0 0 730 960"
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      {SEGMENTS.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill="none"
          stroke="#10b981"
          strokeWidth={STROKE_W[seg.depth]}
          strokeLinecap="round"
          className="lightning-branch"
          style={{ animationDelay: `${DEPTH_DELAY[seg.depth]}s`, animationDuration: `${CYCLE}s` }}
        />
      ))}
    </svg>
  )
}
