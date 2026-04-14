import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Home, Maximize2 } from 'lucide-react';
import type { TolNode } from '../data/treeoflife';
import { useCladexStore } from '../store';
import { loadEnrichment, type EnrichmentData } from '../services/enrichment';

interface TolViewerProps {
  data: TolNode;
  onNodeClick: (node: TolNode) => void;
  theme?: 'dark' | 'light';
  /** IDs de nós bloqueados (calculado em TreeOfLife.tsx via computeLockedIds) */
  lockedIds: Set<string>;
  /** Largura atual do painel (desktop) ou altura (mobile), em px. 0 = fechado. */
  panelW?: number;
  panelH?: number;
}

// ─── Constante de limiar para silhuetas ──────────────────────────────────────
const SILHOUETTE_MIN_PX = 20; // screenRadius mínimo para exibir imagem no nó

// ─── Constantes de label ──────────────────────────────────────────────────────
const LABEL_FONT_SIZE_PX = 16;
const LABEL_AVG_CHAR_W   = 8.5;
const LABEL_PADDING_H    = 8;
const LABEL_PADDING_V    = 6;
const LABEL_GAP          = 4;
const VIEWPORT_MARGIN    = 200;
const MIN_SCREEN_RADIUS  = 5; // px — círculo menor que isso não recebe label

// ─── Raio do nó ──────────────────────────────────────────────────────────────
function getNodeRadius(node: TolNode): number {
  if (node.type === 'others') return 6;
  const isMajor = node.rank === 'phylum' || node.rank === 'kingdom' || node.id === 'luca';
  const base = isMajor ? 15 : 10;
  return Math.max(base, Math.log10((node.speciesCount ?? 100) + 1) * 8);
}

// ─── Score de prioridade de label ────────────────────────────────────────────
const RANK_BONUS: Record<string, number> = {
  luca: 500, domain: 300, kingdom: 200,
  phylum: 120, subphylum: 80, superclass: 80,
  class: 50, subclass: 50, order: 20, family: 10, genus: 5,
};

function computeLabelPriority(data: TolNode, depth: number, leafCount: number): number {
  if (data.type === 'others') return -300;
  const rankBonus = data.rank !== undefined ? (RANK_BONUS[data.rank] ?? 0) : 0;
  return Math.log10(leafCount + 1) * 100 + rankBonus - depth * 2;
}

// ─── Fade baseado em screen-radius ───────────────────────────────────────────
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

// ─── Anti-colisão greedy ──────────────────────────────────────────────────────
interface EnrichedNode {
  d3node: d3.HierarchyPointNode<TolNode>;
  leafCount: number;
  priority: number;
  nodeRadius: number;
  worldX: number;
  worldY: number;
}

function computeVisibleLabels(
  nodes: EnrichedNode[],
  k: number, tx: number, ty: number, vpW: number, vpH: number,
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

// ─── Poda da árvore para expand/collapse ─────────────────────────────────────
function pruneTree(node: TolNode, expandedIds: Set<string>): TolNode {
  if (!node.children?.length || !expandedIds.has(node.id)) {
    return { ...node, children: undefined };
  }
  return {
    ...node,
    children: node.children.map(c => pruneTree(c, expandedIds)),
  };
}

// ─── Coleta todos os IDs com filhos na árvore completa ───────────────────────
function collectAllExpandableIds(node: TolNode): Set<string> {
  const ids = new Set<string>();
  function walk(n: TolNode) {
    if (n.children?.length) {
      ids.add(n.id);
      n.children.forEach(walk);
    }
  }
  walk(node);
  return ids;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TolViewer({ data, onNodeClick, theme = 'dark', lockedIds, panelW = 0, panelH = 0 }: TolViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const pendingZoomRef = useRef<string | null>(null);
  const homeClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [zoomState, setZoomState]     = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(['luca']));
  const [enrichment, setEnrichment]   = useState<EnrichmentData | null>(null);

  // Camera state: true = zoomed to root/initial, false = showing fit-all
  const [cameraAtRoot, setCameraAtRoot] = useState(false);
  // Saved tree state before expand-all — non-null = currently in "expanded all" mode
  const [savedExpandedIds, setSavedExpandedIds] = useState<Set<string> | null>(null);

  // Tooltip hint — fades after 6s
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const [tooltipOpacity, setTooltipOpacity] = useState(1);

  const devUnlockAll     = useCladexStore((s) => s.devUnlockAll);
  const toggleDevUnlock  = useCladexStore((s) => s.toggleDevUnlockAll);

  // Dot-grid colors — mantidos sutis para não competir com os nós
  const dotColor = theme === 'dark' ? 'rgba(63,63,70,0.35)' : 'rgba(161,161,170,0.35)';
  const bgColor  = theme === 'dark' ? '#09090b' : '#fafafa';

  const C = theme === 'light'
    ? { branch: '#2d4531', nodeInternal: '#2d4531', nodeUnlocked: '#10b981',
        nodeLocked: '#94a3b8', nodeCollapsed: '#64748b', text: '#1e293b', textMuted: '#64748b' }
    : { branch: '#334155', nodeInternal: '#64748b', nodeUnlocked: '#10b981',
        nodeLocked: '#475569', nodeCollapsed: '#94a3b8', text: '#f1f5f9', textMuted: '#94a3b8' };

  // Mapa de ID → nó na árvore COMPLETA
  const fullNodeMap = useMemo(() => {
    const map = new Map<string, TolNode>();
    function collect(n: TolNode) { map.set(n.id, n); n.children?.forEach(collect); }
    collect(data);
    return map;
  }, [data]);

  // Árvore podada
  const prunedData = useMemo(
    () => pruneTree(data, expandedIds),
    [data, expandedIds]
  );

  // Layout D3 vertical
  const layout = useMemo(() => {
    const root = d3.hierarchy(prunedData) as d3.HierarchyPointNode<TolNode>;
    const totalLeaves = root.leaves().length;
    const depth = root.height;
    const nodeWidth = 180;
    const levelHeight = 350;

    d3.tree<TolNode>()
      .nodeSize([nodeWidth, levelHeight])
      .separation((a, b) => {
        const sA = Math.log10((a.data.speciesCount ?? 1) + 1);
        const sB = Math.log10((b.data.speciesCount ?? 1) + 1);
        const base = a.parent === b.parent ? 1 : 2;
        return base * Math.max(1, (sA + sB) / 4);
      })
      (root);

    return {
      nodes: root.descendants(),
      links: root.links(),
      width: totalLeaves * nodeWidth,
      height: depth * levelHeight,
    };
  }, [prunedData]);

  // Carregar dados de enriquecimento
  useEffect(() => {
    loadEnrichment().then(setEnrichment);
  }, []);

  // Inicializar zoom D3 (uma vez)
  useEffect(() => {
    if (!svgRef.current) return;
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.001, 150])
      .on('zoom', (event) => setZoomState(event.transform));
    zoomBehaviorRef.current = zoom;
    d3.select(svgRef.current).call(zoom);
    d3.select(svgRef.current).call(
      zoom.transform,
      d3.zoomIdentity.translate(window.innerWidth / 3, window.innerHeight / 2).scale(1.0)
    );
  }, []);

  // Tooltip: fade-out after 4.5s, hide after 6s
  useEffect(() => {
    const fadeTimer = setTimeout(() => setTooltipOpacity(0), 4500);
    const hideTimer = setTimeout(() => setTooltipVisible(false), 6000);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  const k = zoomState.k;

  const isUnlocked = (node: TolNode) => !lockedIds.has(node.id);

  const getCoords = (node: d3.HierarchyPointNode<TolNode>) =>
    ({ x: node.x ?? 0, y: -(node.y ?? 0) });

  // Zoom para um bounding box de pontos no espaço mundo.
  // Considera o painel aberto para centralizar o conteúdo na área visível disponível:
  //   desktop (≥640px): painel à direita ocupa panelW px → área livre = viewport − panelW
  //   mobile (<640px) : painel na base ocupa panelH px → área livre = viewport − panelH
  const zoomToBBox = useCallback((
    xs: number[], ys: number[],
    maxK = 8, duration = 900
  ) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const isWide = window.innerWidth >= 640;
    const availW = isWide  ? window.innerWidth  - panelW : window.innerWidth;
    const availH = !isWide ? window.innerHeight - panelH : window.innerHeight;
    // Centro da área disponível em coordenadas de tela
    const screenCX = availW / 2;
    const screenCY = availH / 2;

    const pad = 120;
    const kX = availW / (Math.max(maxX - minX, 1) + 2 * pad);
    const kY = availH / (Math.max(maxY - minY, 1) + 2 * pad);
    const nextK = Math.min(kX, kY, maxK);
    const transform = d3.zoomIdentity
      .translate(screenCX, screenCY)
      .scale(nextK)
      .translate(-cx, -cy);
    d3.select(svgRef.current)
      .transition().duration(duration).ease(d3.easePolyInOut)
      .call(zoomBehaviorRef.current.transform, transform);
  }, [panelW, panelH]);

  // Após expand: zoom mostrando o nó clicado + seus filhos revelados
  useEffect(() => {
    const nodeId = pendingZoomRef.current;
    if (!nodeId || !svgRef.current || !zoomBehaviorRef.current) return;
    pendingZoomRef.current = null;

    if (nodeId === '__fit_all__') {
      const xs = layout.nodes.map(n => getCoords(n).x);
      const ys = layout.nodes.map(n => getCoords(n).y);
      zoomToBBox(xs, ys, 1.5, 1500);
      setCameraAtRoot(false);
      return;
    }

    const parentD3 = layout.nodes.find(n => n.data.id === nodeId);
    if (!parentD3?.children?.length) return;

    const pCoords = getCoords(parentD3);
    const xs = [pCoords.x, ...parentD3.children.map(c => getCoords(c).x)];
    const ys = [pCoords.y, ...parentD3.children.map(c => getCoords(c).y)];
    zoomToBBox(xs, ys, 8);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Keyboard zoom: Ctrl+/- / Ctrl+0
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !svgRef.current || !zoomBehaviorRef.current) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        d3.select(svgRef.current).transition().duration(200)
          .call(zoomBehaviorRef.current.scaleBy, 1.5);
      } else if (e.key === '-') {
        e.preventDefault();
        d3.select(svgRef.current).transition().duration(200)
          .call(zoomBehaviorRef.current.scaleBy, 1 / 1.5);
      } else if (e.key === '0') {
        e.preventDefault();
        const xs = layout.nodes.map(n => getCoords(n).x);
        const ys = layout.nodes.map(n => getCoords(n).y);
        zoomToBBox(xs, ys, 1.5, 600);
        setCameraAtRoot(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, zoomToBBox]);

  // Nós enriquecidos para anti-colisão
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
    [layout]
  );

  const visibleLabels = useMemo(() =>
    computeVisibleLabels(enrichedNodes, zoomState.k, zoomState.x, zoomState.y,
      window.innerWidth, window.innerHeight),
    [enrichedNodes, zoomState]
  );

  const drawLink = (link: d3.HierarchyPointLink<TolNode>) => {
    const s = getCoords(link.source);
    const t = getCoords(link.target);
    return `M${s.x},${s.y} C${s.x},${(s.y+t.y)/2} ${t.x},${(s.y+t.y)/2} ${t.x},${t.y}`;
  };

  const getBranchWidth = (node: TolNode) =>
    Math.max(4, Math.min(Math.sqrt(node.speciesCount ?? 100) / 15, 100));

  // ─── Home button: single = camera toggle, double = expand all / restore ────
  const handleHomeClick = useCallback(() => {
    if (homeClickTimerRef.current) {
      // Second click within 280ms → double click
      clearTimeout(homeClickTimerRef.current);
      homeClickTimerRef.current = null;

      if (savedExpandedIds !== null) {
        // Restore saved state
        const restored = savedExpandedIds;
        setSavedExpandedIds(null);
        pendingZoomRef.current = '__fit_all__';
        setExpandedIds(restored);
      } else {
        // Save current and expand all
        setSavedExpandedIds(expandedIds);
        pendingZoomRef.current = '__fit_all__';
        setExpandedIds(collectAllExpandableIds(data));
      }
      return;
    }

    homeClickTimerRef.current = setTimeout(() => {
      homeClickTimerRef.current = null;

      // Single click: toggle camera between fit-all and zoom-to-root
      if (!svgRef.current || !zoomBehaviorRef.current) return;

      if (cameraAtRoot) {
        // Currently at root → fit all visible nodes
        const xs = layout.nodes.map(n => getCoords(n).x);
        const ys = layout.nodes.map(n => getCoords(n).y);
        zoomToBBox(xs, ys, 1.5, 900);
        setCameraAtRoot(false);
      } else {
        // Currently showing all → zoom to root (LUCA + direct children)
        const rootNode = layout.nodes[0];
        if (!rootNode) return;
        const xs = [getCoords(rootNode).x];
        const ys = [getCoords(rootNode).y];
        rootNode.children?.forEach(c => {
          xs.push(getCoords(c).x);
          ys.push(getCoords(c).y);
        });
        zoomToBBox(xs, ys, 4, 900);
        setCameraAtRoot(true);
      }
    }, 280);
  }, [cameraAtRoot, savedExpandedIds, expandedIds, data, layout, zoomToBBox]);

  // Click em nó
  const handleNodeClick = (event: React.MouseEvent, d3node: d3.HierarchyPointNode<TolNode>) => {
    event.stopPropagation();
    onNodeClick(d3node.data);

    const fullNode = fullNodeMap.get(d3node.data.id);
    const hasRealChildren = (fullNode?.children?.length ?? 0) > 0;

    if (hasRealChildren) {
      const isCurrentlyExpanded = expandedIds.has(d3node.data.id);

      if (isCurrentlyExpanded) {
        const parentD3 = d3node.parent;
        if (parentD3?.children) {
          const pCoords = getCoords(parentD3);
          const siblingCoords = parentD3.children.map(c => getCoords(c));
          const xs = [pCoords.x, ...siblingCoords.map(c => c.x)];
          const ys = [pCoords.y, ...siblingCoords.map(c => c.y)];
          zoomToBBox(xs, ys, 6, 1000);
        } else {
          const nc = getCoords(d3node);
          zoomToBBox([nc.x], [nc.y], 4, 800);
        }
        setExpandedIds(prev => {
          const next = new Set(prev);
          next.delete(d3node.data.id);
          function removeDesc(node: TolNode) {
            next.delete(node.id);
            node.children?.forEach(removeDesc);
          }
          fullNode?.children?.forEach(removeDesc);
          return next;
        });
      } else {
        pendingZoomRef.current = d3node.data.id;
        setExpandedIds(prev => new Set([...prev, d3node.data.id]));
      }
    } else {
      const nc = getCoords(d3node);
      zoomToBBox([nc.x], [nc.y], 6, 1000);
    }
  };

  const fontSize    = Math.min(16 / k, 120);
  const fontSizeSub = Math.min(13 / k, 90);

  const isExpandedAll = savedExpandedIds !== null;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
        {/* Clip paths para silhuetas circulares */}
        <defs>
          {enrichedNodes.map(en => (
            <clipPath key={`clip-${en.d3node.data.id}`} id={`clip-${en.d3node.data.id}`}>
              <circle r={en.nodeRadius} />
            </clipPath>
          ))}
        </defs>

        <g transform={`translate(${zoomState.x},${zoomState.y}) scale(${k})`}>

          {/* Links */}
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

          {/* Nós */}
          {enrichedNodes.map((en) => {
            const node = en.d3node;
            const screenRadius = en.nodeRadius * k;
            const labelOp = visibleLabels.has(node.data.id)
              ? screenRadiusFade(screenRadius)
              : 0;

            const unlocked = isUnlocked(node.data);
            const isLeaf = !node.children;
            const radius = en.nodeRadius;

            const isOthers   = node.data.type === 'others';
            const fullNode   = fullNodeMap.get(node.data.id);
            const hasChildren = (fullNode?.children?.length ?? 0) > 0;
            const isExpanded  = expandedIds.has(node.data.id);

            let nodeColor = C.nodeInternal;
            if (isOthers) {
              nodeColor = theme === 'dark' ? '#374151' : '#d1d5db';
            } else if (node.data.type === 'card' || node.data.type === 'placeholder') {
              nodeColor = unlocked ? C.nodeUnlocked : C.nodeLocked;
            } else if (node.data.type === 'collapsed') {
              nodeColor = C.nodeCollapsed;
            }

            const labelY    = isLeaf ? -radius - 25 : radius + fontSize * 1.1;
            const subLabelY = isLeaf ? radius + fontSizeSub * 1.1 : labelY + fontSizeSub * 1.3;

            return (
              <g
                key={`node-${node.data.id}`}
                transform={`translate(${en.worldX},${en.worldY})`}
                onClick={(e) => handleNodeClick(e, node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow de nó desbloqueado */}
                {unlocked && node.data.type === 'card' && (
                  <circle
                    r={radius + 5 / Math.sqrt(k)}
                    fill={C.nodeUnlocked}
                    opacity={0.1}
                    className="animate-soft-pulse"
                  />
                )}

                {/* Círculo principal */}
                <circle
                  r={radius}
                  fill={nodeColor}
                  stroke={theme === 'dark' ? '#020617' : '#fff'}
                  strokeWidth={1 / Math.sqrt(k)}
                  strokeDasharray={isOthers ? `${3 / Math.sqrt(k)} ${2 / Math.sqrt(k)}` : undefined}
                  opacity={isOthers ? 0.55 : 1}
                  className="transition-colors duration-300"
                />

                {/* Silhueta PhyloPic */}
                {(() => {
                  if (isOthers) return null;
                  const silUrl = enrichment?.silhouettes[node.data.id];
                  if (!silUrl || screenRadius < SILHOUETTE_MIN_PX) return null;
                  const silFilter = theme === 'dark'
                    ? 'brightness(0) invert(1)'
                    : 'brightness(0)';
                  return (
                    <image
                      href={silUrl}
                      x={-radius * 0.82}
                      y={-radius * 0.82}
                      width={radius * 1.64}
                      height={radius * 1.64}
                      clipPath={`url(#clip-${node.data.id})`}
                      preserveAspectRatio="xMidYMid meet"
                      opacity={0.75}
                      style={{ filter: silFilter }}
                      className="pointer-events-none"
                    />
                  );
                })()}

                {/* Indicador de expand/collapse */}
                {hasChildren && screenRadius >= 8 && (
                  <text
                    x={radius + 5}
                    y={3 / k}
                    fontSize={14 / k}
                    fill={isExpanded ? '#10b981' : '#6b7280'}
                    className="select-none pointer-events-none"
                  >
                    {isExpanded ? '▾' : '▸'}
                  </text>
                )}

                {/* Nome */}
                {labelOp > 0.01 && (
                  <text
                    x={0}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={isOthers ? fontSize * 0.85 : fontSize}
                    fontWeight={
                      isOthers ? 400
                      : node.data.rank === 'phylum' || node.data.rank === 'kingdom' || node.data.id === 'luca'
                        ? 900 : 600
                    }
                    fill={isOthers ? C.textMuted : (unlocked ? C.text : C.textMuted)}
                    opacity={labelOp * (isOthers ? 0.7 : 1)}
                    className="select-none pointer-events-none"
                    style={{
                      fontStyle: (isOthers || node.data.latinName) ? 'italic' : 'normal',
                      textShadow: '0 2px 8px rgba(0,0,0,1)',
                    }}
                  >
                    {node.data.name}
                  </text>
                )}

                {/* Subtítulo */}
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

      {/* ── Dica de gestos — aparece por 5s e desaparece suavemente ─────────── */}
      {tooltipVisible && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ transition: 'opacity 1.2s ease', opacity: tooltipOpacity }}
        >
          <div className={`
            px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border text-xs text-center space-y-1
            ${theme === 'dark'
              ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
              : 'bg-white/90 border-zinc-200 text-zinc-600'}
          `}>
            <div className="font-bold text-[10px] uppercase tracking-widest mb-2 text-emerald-500">Navegação</div>
            <div><span className="font-semibold">Scroll</span> ou <span className="font-semibold">pinça</span> — zoom</div>
            <div><span className="font-semibold">Ctrl +/-</span> — zoom com teclado · <span className="font-semibold">Ctrl 0</span> — ver tudo</div>
            <div><span className="font-semibold">Clique no nó</span> — expandir ou ver detalhes</div>
            <div><span className="font-semibold">⌂ clique</span> — alternar câmera · <span className="font-semibold">duplo clique</span> — expandir árvore</div>
          </div>
        </div>
      )}

      {/* ── Botão Home (câmera) + Dev — canto superior esquerdo ──────────────── */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">

        {/* Home button */}
        <button
          onClick={handleHomeClick}
          title={
            isExpandedAll
              ? 'Clique: alternar câmera | Duplo clique: restaurar árvore anterior'
              : cameraAtRoot
                ? 'Clique: ver toda a árvore | Duplo clique: expandir tudo'
                : 'Clique: ir para a raiz | Duplo clique: expandir tudo'
          }
          className={`
            w-11 h-11 rounded-2xl border flex items-center justify-center
            backdrop-blur-xl shadow-lg transition-all duration-200 relative
            ${isExpandedAll
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
              : cameraAtRoot
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                : theme === 'dark'
                  ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                  : 'bg-white/80 border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400'}
          `}
        >
          {cameraAtRoot
            ? <Maximize2 size={18} />
            : <Home size={18} />}
          {/* Dot indicator when in "expanded all" mode */}
          {isExpandedAll && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Dev button — only in DEV mode (dead code eliminated in production) */}
        {import.meta.env.DEV && (
          <button
            onClick={toggleDevUnlock}
            title={devUnlockAll ? 'Dev: todos desbloqueados (clique para reverter)' : 'Dev: desbloquear tudo'}
            className={`
              h-8 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-all
              ${devUnlockAll
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-zinc-900/60 border-zinc-700 text-zinc-600 hover:text-zinc-400'}
            `}
          >
            {devUnlockAll ? '🔓' : '🔒'}
          </button>
        )}
      </div>
    </div>
  );
}
