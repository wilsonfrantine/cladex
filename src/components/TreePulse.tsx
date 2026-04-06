// Árvore decorativa de fundo — 67 segmentos, assimétrica, 6 níveis de profundidade
// Estilo cotovelo (elbow): cada ramo desce/sobe em L (horizontal → vertical).
//
// Otimização de performance: o blur (glow) é aplicado ao <g> pai dos pulsos,
// não a cada path individualmente. Isso reduz para 1 operação de blur/frame
// independente de quantos paths estão animando simultaneamente.

interface TreePulseProps { theme?: 'dark' | 'light' }
interface Seg { d: string; depth: number }

const SEGS: Seg[] = [
  // ── tronco ────────────────────────────────────────────────────────────
  { d: 'M360,940 L360,810', depth: 0 },

  // ── bifurcação raiz: linhagem divergente precoce (esq) + clado principal ──
  { d: 'M360,810 L110,810 L110,660', depth: 1 },
  { d: 'M360,810 L415,810 L415,770', depth: 1 },

  // ── linhagem divergente precoce ── profundidade 2 ─────────────────────
  { d: 'M110,660 L50,660 L50,500',  depth: 2 },
  { d: 'M110,660 L160,660 L160,490', depth: 2 },

  // ── profundidade 3 ────────────────────────────────────────────────────
  { d: 'M50,500 L20,500 L20,340',   depth: 3 },
  { d: 'M50,500 L65,500 L65,355',   depth: 3 },
  { d: 'M160,490 L120,490 L120,340', depth: 3 },
  { d: 'M160,490 L185,490 L185,350', depth: 3 },

  // ── profundidade 4 ────────────────────────────────────────────────────
  { d: 'M20,340 L8,340 L8,185',    depth: 4 },
  { d: 'M20,340 L32,340 L32,192',   depth: 4 },
  { d: 'M65,355 L52,355 L52,192',   depth: 4 },
  { d: 'M65,355 L78,355 L78,185',   depth: 4 },

  // ── profundidade 5 (extensão da linhagem precoce) ─────────────────────
  { d: 'M8,185 L4,185 L4,90',     depth: 5 },
  { d: 'M8,185 L16,185 L16,90',    depth: 5 },
  { d: 'M32,192 L26,192 L26,90',   depth: 5 },
  { d: 'M32,192 L40,192 L40,90',   depth: 5 },
  { d: 'M52,192 L46,192 L46,90',   depth: 5 },
  { d: 'M52,192 L59,192 L59,90',   depth: 5 },
  { d: 'M78,185 L72,185 L72,90',   depth: 5 },
  { d: 'M78,185 L84,185 L84,90',   depth: 5 },

  // ── extensão do tronco principal ──────────────────────────────────────
  { d: 'M415,770 L415,640', depth: 2 },

  // ── politomia: 3 clados ───────────────────────────────────────────────
  { d: 'M415,640 L250,640 L250,470', depth: 3 },
  { d: 'M415,640 L435,640 L435,480', depth: 3 },
  { d: 'M415,640 L620,640 L620,460', depth: 3 },

  // ── sub-clados ── profundidade 4 ──────────────────────────────────────
  { d: 'M250,470 L175,470 L175,310', depth: 4 },
  { d: 'M250,470 L305,470 L305,300', depth: 4 },
  { d: 'M435,480 L385,480 L385,300', depth: 4 },
  { d: 'M435,480 L470,480 L470,290', depth: 4 },
  { d: 'M620,460 L555,460 L555,280', depth: 4 },
  { d: 'M620,460 L678,460 L678,260', depth: 4 },

  // ── profundidade 5 ────────────────────────────────────────────────────
  { d: 'M175,310 L130,310 L130,155', depth: 5 },
  { d: 'M175,310 L192,310 L192,145', depth: 5 },
  { d: 'M305,300 L260,300 L260,150', depth: 5 },
  { d: 'M305,300 L330,300 L330,145', depth: 5 },
  { d: 'M385,300 L345,300 L345,148', depth: 5 },
  { d: 'M385,300 L402,300 L402,140', depth: 5 },
  { d: 'M470,290 L445,290 L445,145', depth: 5 },
  { d: 'M470,290 L496,290 L496,136', depth: 5 },
  { d: 'M555,280 L510,280 L510,145', depth: 5 },
  { d: 'M555,280 L568,280 L568,132', depth: 5 },
  { d: 'M678,260 L638,260 L638,138', depth: 5 },
  { d: 'M678,260 L706,260 L706,128', depth: 5 },

  // ── profundidade 6 — pontas terminais ─────────────────────────────────
  { d: 'M130,155 L122,155 L122,65',  depth: 6 },
  { d: 'M130,155 L138,155 L138,65',  depth: 6 },
  { d: 'M192,145 L184,145 L184,65',  depth: 6 },
  { d: 'M192,145 L200,145 L200,65',  depth: 6 },
  { d: 'M260,150 L252,150 L252,65',  depth: 6 },
  { d: 'M260,150 L268,150 L268,65',  depth: 6 },
  { d: 'M330,145 L322,145 L322,65',  depth: 6 },
  { d: 'M330,145 L338,145 L338,65',  depth: 6 },
  { d: 'M345,148 L337,148 L337,65',  depth: 6 },
  { d: 'M345,148 L353,148 L353,65',  depth: 6 },
  { d: 'M402,140 L394,140 L394,65',  depth: 6 },
  { d: 'M402,140 L410,140 L410,65',  depth: 6 },
  { d: 'M445,145 L437,145 L437,65',  depth: 6 },
  { d: 'M445,145 L453,145 L453,65',  depth: 6 },
  { d: 'M496,136 L488,136 L488,65',  depth: 6 },
  { d: 'M496,136 L504,136 L504,65',  depth: 6 },
  { d: 'M510,145 L502,145 L502,65',  depth: 6 },
  { d: 'M510,145 L518,145 L518,65',  depth: 6 },
  { d: 'M568,132 L560,132 L560,65',  depth: 6 },
  { d: 'M568,132 L576,132 L576,65',  depth: 6 },
  { d: 'M638,138 L630,138 L630,65',  depth: 6 },
  { d: 'M638,138 L646,138 L646,65',  depth: 6 },
  { d: 'M706,128 L698,128 L698,65',  depth: 6 },
  { d: 'M706,128 L712,128 L712,65',  depth: 6 },
]

const SW    = [3.0, 2.4, 1.9, 1.5, 1.2, 0.9, 0.7]
const DELAY = [0, 0.4, 0.85, 1.35, 1.85, 2.4, 3.0]
const CYCLE = 9

export default function TreePulse({ theme = 'dark' }: TreePulseProps) {
  const baseStroke  = theme === 'light' ? '#5a4e3c' : '#065f46'
  const baseOpacity = theme === 'light' ? 0.14       : 0.18
  const pulseStroke = theme === 'light' ? '#1b5e35'  : '#a7f3d0'
  return (
    <svg
      viewBox="0 0 720 960"
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/*
          Blur aplicado ao grupo inteiro dos pulsos — 1 operação/frame
          independente de quantos paths estão animando.
        */}
        <filter id="glow-pulse" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Camada base — todos os ramos sempre visíveis (baixa opacidade, sem animação) */}
      {SEGS.map((seg, i) => (
        <path
          key={`b${i}`}
          d={seg.d}
          fill="none"
          stroke={baseStroke}
          strokeWidth={SW[seg.depth]}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={baseOpacity}
        />
      ))}

      {/* Camada de pulso — blur aplicado ao grupo (custo fixo, não por path) */}
      <g filter="url(#glow-pulse)">
        {SEGS.map((seg, i) => (
          <path
            key={`p${i}`}
            d={seg.d}
            fill="none"
            stroke={pulseStroke}
            strokeWidth={SW[seg.depth] * 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="pulse-dash"
            style={{
              animationDelay: `${DELAY[seg.depth]}s`,
              animationDuration: `${CYCLE}s`,
            }}
          />
        ))}
      </g>
    </svg>
  )
}
