import { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TolNode } from '../data/treeoflife';
import { useCladexStore } from '../store';

export type LayoutMode = 'horizontal' | 'vertical' | 'circular';

interface TolViewerProps {
  data: TolNode;
  onNodeClick: (node: TolNode) => void;
  layoutMode: LayoutMode;
  theme?: 'dark' | 'light';
}

// ─── Constantes de label ──────────────────────────────────────────────────────
const LABEL_FONT_SIZE_PX = 16;   // tamanho fixo na tela (screen-space)
const LABEL_AVG_CHAR_W   = 8.5;  // largura média por caractere em px
const LABEL_PADDING_H    = 8;    // padding horizontal total (ambos os lados)
const LABEL_PADDING_V    = 6;    // padding vertical total
const LABEL_GAP          = 4;    // margem mínima entre bboxes de labels
const VIEWPORT_MARGIN    = 200;  // px além da borda do viewport ainda considerado

// Um label só entra na fila quando o círculo do nó atingir este tamanho em tela.
// Isso substitui os thresholds absolutos de zoom: o critério passa a ser
// "este nó é grande o suficiente para ser rotulado?" — exatamente como o OneZoom.
const MIN_SCREEN_RADIUS = 5; // px

// ─── Raio do nó (puro, fora do componente para uso nas funções de visibilidade) ──
function getNodeRadius(node: TolNode): number {
  const isMajor = node.rank === 'phylum' || node.rank === 'kingdom' || node.id === 'luca';
  const base = isMajor ? 15 : 10;
  return Math.max(base, Math.log10((node.speciesCount ?? 100) + 1) * 8);
}

// ─── Score de prioridade ──────────────────────────────────────────────────────
// Híbrido: tamanho do subclado (universal, funciona para nós sem rank) +
// bônus taxonômico (desempate semântico entre nós de tamanho similar).
const RANK_BONUS: Record<string, number> = {
  luca: 500, domain: 300, kingdom: 200,
  phylum: 120, subphylum: 80, superclass: 80,
  class: 50, subclass: 50, order: 20, family: 10, genus: 5,
};

function computeLabelPriority(data: TolNode, depth: number, leafCount: number): number {
  const rankBonus = data.rank !== undefined ? (RANK_BONUS[data.rank] ?? 0) : 0;
  return Math.log10(leafCount + 1) * 100 + rankBonus - depth * 2;
}

// ─── Fade baseado em screen-radius ───────────────────────────────────────────
// Opacidade vai de 0→1 enquanto o círculo cresce de MIN até MIN×2.
// Substitui lodOpacity — o fade é local ao nó, não depende de rank.
function screenRadiusFade(screenRadius: number): number {
  const lo = MIN_SCREEN_RADIUS;
  const hi = MIN_SCREEN_RADIUS * 2;
  if (screenRadius >= hi) return 1;
  if (screenRadius < lo)  return 0;
  return (screenRadius - lo) / (hi - lo);
}

// ─── Bounding box em screen-space ────────────────────────────────────────────
interface Rect { x: number; y: number; w: number; h: number }

function toLabelBBox(screenX: number, screenY: number, name: string): Rect {
  const w = name.length * LABEL_AVG_CHAR_W + LABEL_PADDING_H + LABEL_GAP * 2;
  const h = LABEL_FONT_SIZE_PX + LABEL_PADDING_V + LABEL_GAP * 2;
  return { x: screenX - w / 2, y: screenY - h / 2, w, h };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─── Candidato enriquecido ────────────────────────────────────────────────────
interface EnrichedNode {
  d3node: d3.HierarchyPointNode<TolNode>;
  leafCount: number;
  priority: number;
  nodeRadius: number;  // raio mundo — multiplicar por k para obter screen radius
  worldX: number;
  worldY: number;
}

// ─── Anti-colisão greedy com screen-radius LOD ───────────────────────────────
// Critério de entrada: círculo do nó >= MIN_SCREEN_RADIUS em tela.
// Isso garante que o conjunto de candidatos é sempre proporcional ao zoom
// atual e à região visível — não a thresholds absolutos de zoom.
//
// Algoritmo:
//   1. Filtrar: no viewport E screenRadius >= MIN_SCREEN_RADIUS
//   2. Ordenar por priority DESC
//   3. Aceitar greedy: label entra se seu bbox não colide com nenhum aceito
function computeVisibleLabels(
  nodes: EnrichedNode[],
  k: number,
  tx: number,
  ty: number,
  vpW: number,
  vpH: number,
): Set<string> {
  const accepted: Rect[] = [];
  const visible = new Set<string>();

  const toScreen = (wx: number, wy: number) => ({ sx: wx * k + tx, sy: wy * k + ty });

  const inViewport = (sx: number, sy: number) =>
    sx >= -VIEWPORT_MARGIN && sx <= vpW + VIEWPORT_MARGIN &&
    sy >= -VIEWPORT_MARGIN && sy <= vpH + VIEWPORT_MARGIN;

  const candidates = nodes
    .filter(n => {
      const { sx, sy } = toScreen(n.worldX, n.worldY);
      return inViewport(sx, sy) && n.nodeRadius * k >= MIN_SCREEN_RADIUS;
    })
    .sort((a, b) => b.priority - a.priority);

  for (const n of candidates) {
    const { sx, sy } = toScreen(n.worldX, n.worldY);
    const bbox = toLabelBBox(sx, sy, n.d3node.data.name);
    if (!accepted.some(r => rectsOverlap(bbox, r))) {
      accepted.push(bbox);
      visible.add(n.d3node.data.id);
    }
  }

  return visible;
}

export default function TolViewer({ data, onNodeClick, layoutMode, theme = 'dark' }: TolViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomState, setZoomState] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  const unlockedCards = useCladexStore((s) => s.unlockedCards);

  const C = theme === 'light'
    ? {
        branch: '#2d4531',
        nodeInternal: '#2d4531',
        nodeUnlocked: '#10b981',
        nodeLocked: '#94a3b8',
        nodeCollapsed: '#64748b',
        text: '#1e293b',
        textMuted: '#64748b',
      }
    : {
        branch: '#334155',
        nodeInternal: '#64748b',
        nodeUnlocked: '#10b981',
        nodeLocked: '#475569',
        nodeCollapsed: '#94a3b8',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
      };

  // Layout sempre usa a árvore completa — posições estáveis, sem jumps
  const layout = useMemo(() => {
    const root = d3.hierarchy(data) as d3.HierarchyPointNode<TolNode>;
    const totalLeaves = root.leaves().length;
    const depth = root.height;

    const nodeWidth = 180;
    const levelHeight = 350;

    if (layoutMode === 'horizontal' || layoutMode === 'vertical') {
      d3.tree<TolNode>().nodeSize([nodeWidth, levelHeight])(root);
    } else {
      d3.tree<TolNode>().size([360, depth * levelHeight])(root);
    }

    return {
      nodes: root.descendants(),
      links: root.links(),
      width: totalLeaves * nodeWidth,
      height: depth * levelHeight,
    };
  }, [data, layoutMode]);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.001, 150])
      .on('zoom', (event) => setZoomState(event.transform));

    zoomBehaviorRef.current = zoom;
    d3.select(svgRef.current).call(zoom);

    d3.select(svgRef.current).call(
      zoom.transform,
      d3.zoomIdentity.translate(window.innerWidth / 2, window.innerHeight - 100).scale(0.15)
    );
  }, [layoutMode]);

  const isUnlocked = (node: TolNode) => {
    if (node.id === 'luca' || node.type === 'internal') return true;
    if (!node.unlockModule) return true;
    return unlockedCards.includes(node.id);
  };

  const getCoords = (node: d3.HierarchyPointNode<TolNode>) => {
    const nx = node.x ?? 0;
    const ny = node.y ?? 0;
    if (layoutMode === 'horizontal') return { x: ny, y: nx };
    if (layoutMode === 'vertical')   return { x: nx, y: -ny };
    if (layoutMode === 'circular') {
      const angle = (nx - 90) * Math.PI / 180;
      return { x: ny * Math.cos(angle), y: ny * Math.sin(angle) };
    }
    return { x: 0, y: 0 };
  };

  // Nós enriquecidos com priority, nodeRadius e worldX/worldY — recalculados só quando o layout muda
  const enrichedNodes = useMemo<EnrichedNode[]>(() =>
    layout.nodes.map(node => {
      const lc = node.leaves().length;
      const { x, y } = getCoords(node);
      return {
        d3node: node,
        leafCount: lc,
        priority: computeLabelPriority(node.data, node.depth, lc),
        nodeRadius: getNodeRadius(node.data),
        worldX: x,
        worldY: y,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, layoutMode]
  );

  // Labels visíveis: greedy anti-colisão em screen-space, recalculado a cada zoom
  const visibleLabels = useMemo(() =>
    computeVisibleLabels(
      enrichedNodes,
      zoomState.k,
      zoomState.x,
      zoomState.y,
      window.innerWidth,
      window.innerHeight,
    ),
    [enrichedNodes, zoomState]
  );

  const drawLink = (link: d3.HierarchyPointLink<TolNode>) => {
    const s = getCoords(link.source);
    const t = getCoords(link.target);
    if (layoutMode === 'horizontal') {
      return `M${s.x},${s.y} C${(s.x+t.x)/2},${s.y} ${(s.x+t.x)/2},${t.y} ${t.x},${t.y}`;
    }
    if (layoutMode === 'vertical') {
      return `M${s.x},${s.y} C${s.x},${(s.y+t.y)/2} ${t.x},${(s.y+t.y)/2} ${t.x},${t.y}`;
    }
    if (layoutMode === 'circular') {
      return `M${s.x},${s.y} C${(s.x+t.x)/2},${(s.y+t.y)/2} ${(s.x+t.x)/2},${(s.y+t.y)/2} ${t.x},${t.y}`;
    }
    return '';
  };

  const getBranchWidth = (node: TolNode) =>
    Math.max(4, Math.min(Math.sqrt(node.speciesCount ?? 100) / 15, 100));

  const handleNodeClick = (event: React.MouseEvent, node: d3.HierarchyPointNode<TolNode>) => {
    event.stopPropagation();
    onNodeClick(node.data);

    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const { x, y } = getCoords(node);
    const radius = getNodeRadius(node.data);
    const nextK = Math.min(25, 600 / radius);
    const transform = d3.zoomIdentity
      .translate(window.innerWidth / 2, window.innerHeight / 2)
      .scale(nextK)
      .translate(-x, -y);

    d3.select(svgRef.current)
      .transition().duration(1200).ease(d3.easePolyInOut)
      .call(zoomBehaviorRef.current.transform, transform);
  };

  const k = zoomState.k;

  // Tamanho de fonte: ~16px na tela em qualquer zoom.
  // Math.min evita texto absurdamente grande em zoom muito baixo.
  const fontSize = Math.min(16 / k, 120);
  const fontSizeSub = Math.min(13 / k, 90);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
        <g transform={`translate(${zoomState.x},${zoomState.y}) scale(${k})`}>

          {/* Links — estrutura sempre a 100%, sem variação de opacidade */}
          {layout.links.map((link) => (
            <path
              key={`link-${link.source.data.id}-${link.target.data.id}`}
              d={drawLink(link)}
              fill="none"
              stroke={C.branch}
              strokeWidth={getBranchWidth(link.target.data) / Math.sqrt(k)}
              strokeLinecap="round"
            />
          ))}

          {/* Nós — círculos sempre a 100%; labels controlados por anti-colisão + fade screen-radius */}
          {layout.nodes.map((node) => {
            // visibleLabels decide SE o label aparece (anti-colisão greedy);
            // screenRadiusFade controla o fade-in — suave conforme o círculo cresce na tela.
            const screenRadius = getNodeRadius(node.data) * k;
            const labelOp = visibleLabels.has(node.data.id)
              ? screenRadiusFade(screenRadius)
              : 0;

            const unlocked = isUnlocked(node.data);
            const isLeaf = !node.children;
            const { x, y } = getCoords(node);
            const radius = getNodeRadius(node.data);

            let nodeColor = C.nodeInternal;
            if (node.data.type === 'card' || node.data.type === 'placeholder') {
              nodeColor = unlocked ? C.nodeUnlocked : C.nodeLocked;
            } else if (node.data.type === 'collapsed') {
              nodeColor = C.nodeCollapsed;
            }

            const labelY = layoutMode === 'vertical'
              ? (isLeaf ? -radius - 25 : radius + fontSize * 1.1)
              : fontSize * 0.35;

            const subLabelY = layoutMode === 'vertical' && !isLeaf
              ? labelY + fontSizeSub * 1.3
              : radius + fontSizeSub * 1.1;

            return (
              <g
                key={`node-${node.data.id}`}
                transform={`translate(${x},${y})`}
                onClick={(e) => handleNodeClick(e, node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow de nó desbloqueado — estrutural, não varia com zoom */}
                {unlocked && node.data.type === 'card' && (
                  <circle
                    r={radius + 5 / Math.sqrt(k)}
                    fill={C.nodeUnlocked}
                    opacity={0.1}
                    className="animate-soft-pulse"
                  />
                )}

                {/* Círculo do nó — sempre a 100% */}
                <circle
                  r={radius}
                  fill={nodeColor}
                  stroke={theme === 'dark' ? '#020617' : '#fff'}
                  strokeWidth={1 / Math.sqrt(k)}
                  className="transition-colors duration-300"
                />

                {/* Nome — aparece primeiro para nós de maior nível hierárquico */}
                {labelOp > 0.01 && (
                  <text
                    x={0}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight={
                      node.data.rank === 'phylum' || node.data.rank === 'kingdom' || node.id === 'luca'
                        ? 900 : 600
                    }
                    fill={unlocked ? C.text : C.textMuted}
                    opacity={labelOp}
                    className="select-none pointer-events-none"
                    style={{
                      fontStyle: node.data.latinName ? 'italic' : 'normal',
                      textShadow: '0 2px 8px rgba(0,0,0,1)',
                    }}
                  >
                    {node.data.name}
                  </text>
                )}

                {/* Subtítulo — só aparece quando o nome principal já está bem visível */}
                {node.data.collapsedLabel && labelOp > 0.5 && (
                  <text
                    x={0}
                    y={subLabelY}
                    fontSize={fontSizeSub}
                    textAnchor="middle"
                    fill={C.textMuted}
                    opacity={(labelOp - 0.5) * 2 * 0.6}
                    className="select-none pointer-events-none"
                    style={{ fontStyle: 'italic' }}
                  >
                    {node.data.collapsedLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute top-20 right-8 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-mono text-zinc-500 backdrop-blur-sm pointer-events-none uppercase tracking-widest">
        Magnificação: {(k * 100).toFixed(1)}%
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        <button
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(400)
              .call(zoomBehaviorRef.current.scaleBy, 2);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >+</button>
        <button
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(400)
              .call(zoomBehaviorRef.current.scaleBy, 0.5);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >-</button>
        <button
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(800).call(
              zoomBehaviorRef.current.transform,
              d3.zoomIdentity.translate(window.innerWidth / 2, window.innerHeight - 100).scale(0.15)
            );
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >⟲</button>
      </div>
    </div>
  );
}
