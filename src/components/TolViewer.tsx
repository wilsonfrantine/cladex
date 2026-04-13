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
        bg: '#f8fafc'
      }
    : {
        branch: '#334155',
        nodeInternal: '#64748b',
        nodeUnlocked: '#10b981',
        nodeLocked: '#475569',
        nodeCollapsed: '#94a3b8',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        bg: '#020617'
      };

  const layout = useMemo(() => {
    const root = d3.hierarchy(data) as d3.HierarchyPointNode<TolNode>;
    const leafCount = root.leaves().length;
    const depth = root.height;
    
    let width = 0;
    let height = 0;

    if (layoutMode === 'horizontal') {
      width = depth * 300;
      height = leafCount * 50;
      d3.cluster<TolNode>().size([height, width])(root);
    } else if (layoutMode === 'vertical') {
      // Bottom-up: width é o espalhamento das folhas, height é a profundidade
      width = leafCount * 80;
      height = depth * 250;
      d3.cluster<TolNode>().size([width, height])(root);
    } else if (layoutMode === 'circular') {
      const radius = Math.max(600, leafCount * 15);
      width = radius * 2;
      height = radius * 2;
      d3.cluster<TolNode>().size([360, radius])(root);
    }

    return {
      nodes: root.descendants(),
      links: root.links(),
      width,
      height
    };
  }, [data, layoutMode]);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 60])
      .on('zoom', (event) => {
        setZoomState(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    d3.select(svgRef.current).call(zoom);
    
    // Centraliza inicial (LUCA na base para vertical)
    if (layoutMode === 'vertical') {
      const initialK = 0.4;
      const initialX = window.innerWidth / 2 - (layout.width * initialK) / 2;
      const initialY = window.innerHeight - 150;
      d3.select(svgRef.current).call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialK));
    }
  }, [layoutMode, layout.width]);

  const isUnlocked = (node: TolNode) => {
    if (node.id === 'luca' || node.type === 'internal') return true;
    if (!node.unlockModule) return true;
    return unlockedCards.includes(node.id);
  };

  const getCoords = (node: d3.HierarchyPointNode<TolNode>) => {
    const nx = node.x ?? 0;
    const ny = node.y ?? 0;
    if (layoutMode === 'horizontal') return { x: ny, y: nx };
    if (layoutMode === 'vertical') return { x: nx, y: -ny }; // Negativo para crescer para cima
    if (layoutMode === 'circular') {
      const angle = (nx - 90) * Math.PI / 180;
      const radius = ny;
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    }
    return { x: 0, y: 0 };
  };

  const drawLink = (link: d3.HierarchyPointLink<TolNode>) => {
    const s = getCoords(link.source);
    const t = getCoords(link.target);

    if (layoutMode === 'horizontal') {
      return `M${s.x},${s.y} C${(s.x + t.x) / 2},${s.y} ${(s.x + t.x) / 2},${t.y} ${t.x},${t.y}`;
    }
    if (layoutMode === 'vertical') {
      return `M${s.x},${s.y} C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`;
    }
    if (layoutMode === 'circular') {
      return `M${s.x},${s.y} C${(s.x + t.x) / 2},${(s.y + t.y) / 2} ${(s.x + t.x) / 2},${(s.y + t.y) / 2} ${t.x},${t.y}`;
    }
    return '';
  };

  // Cálculo proporcional do raio (Raiz quadrada para área proporcional)
  const getNodeRadius = (node: TolNode) => {
    const base = node.type === 'internal' || node.id === 'luca' ? 8 : 12;
    const count = node.speciesCount ?? 100;
    const scale = Math.sqrt(count) / 40;
    return Math.max(base, scale);
  };

  const handleNodeInternalClick = (event: React.MouseEvent, node: d3.HierarchyPointNode<TolNode>) => {
    event.stopPropagation();
    onNodeClick(node.data);

    // Focal Zoom: centraliza o nó clicado
    if (svgRef.current && zoomBehaviorRef.current) {
      const { x, y } = getCoords(node);
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const nextK = Math.min(2, 0.8 / (getNodeRadius(node.data) / 400));
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(nextK)
        .translate(-x, -y);

      svg.transition().duration(1000).call(zoomBehaviorRef.current.transform, transform);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <g transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}>
          {/* Links */}
          {layout.links.map((link) => (
            <path
              key={`link-${link.source.data.id}-${link.target.data.id}`}
              d={drawLink(link)}
              fill="none"
              stroke={C.branch}
              strokeWidth={3 / Math.sqrt(zoomState.k)}
              opacity={0.4}
            />
          ))}

          {/* Nós */}
          {layout.nodes.map((node) => {
            const unlocked = isUnlocked(node.data);
            const isLeaf = !node.children;
            const { x, y } = getCoords(node);
            const nx = node.x ?? 0;
            const radius = getNodeRadius(node.data);

            let nodeColor = C.nodeInternal;
            if (node.data.type === 'card' || node.data.type === 'placeholder') {
              nodeColor = unlocked ? C.nodeUnlocked : C.nodeLocked;
            } else if (node.data.type === 'collapsed') {
              nodeColor = C.nodeCollapsed;
            }

            const textRotate = layoutMode === 'circular' 
              ? (nx < 180 ? nx - 90 : nx + 90) 
              : 0;

            // Zoom Semântico: esconde elementos muito pequenos
            const isVisible = radius * zoomState.k > 2;
            const showLabel = radius * zoomState.k > 8 || isLeaf;

            if (!isVisible) return null;

            return (
              <g 
                key={`node-${node.data.id}`}
                transform={`translate(${x},${y})`}
                className="transition-opacity duration-500"
                onClick={(e) => handleNodeInternalClick(e, node)}
                style={{ cursor: 'pointer' }}
              >
                {unlocked && node.data.type === 'card' && (
                  <circle r={radius + 10 / Math.sqrt(zoomState.k)} fill={C.nodeUnlocked} opacity={0.15} className="animate-soft-pulse" />
                )}

                <circle
                  r={radius}
                  fill={nodeColor}
                  stroke={theme === 'dark' ? '#020617' : '#fff'}
                  strokeWidth={2 / Math.sqrt(zoomState.k)}
                />

                {showLabel && (
                  <g transform={`rotate(${textRotate})`}>
                    <text
                      x={layoutMode === 'circular' ? (nx < 180 ? radius + 10 : -radius - 10) : (isLeaf ? radius + 10 : -radius - 10)}
                      y={layoutMode === 'vertical' ? (isLeaf ? radius + 20 : -radius - 10) : 4}
                      textAnchor={layoutMode === 'vertical' ? 'middle' : (layoutMode === 'circular' ? (nx < 180 ? 'start' : 'end') : (isLeaf ? 'start' : 'end'))}
                      fontSize={Math.max(10 / zoomState.k, 14)}
                      fontWeight={node.data.type === 'internal' || node.id === 'luca' ? 900 : 500}
                      fill={unlocked ? C.text : C.textMuted}
                      className="select-none pointer-events-none"
                      style={{ 
                        fontStyle: node.data.latinName ? 'italic' : 'normal',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                      }}
                    >
                      {node.data.name}
                    </text>
                  </g>
                )}

                {node.data.type === 'collapsed' && zoomState.k > 1 && (
                  <text
                    x={0}
                    y={radius + 15}
                    fontSize={11}
                    textAnchor="middle"
                    fill={C.textMuted}
                    className="select-none pointer-events-none opacity-60"
                  >
                    {node.data.collapsedLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Info de Zoom */}
      <div className="absolute top-20 right-8 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-mono text-zinc-500 backdrop-blur-sm pointer-events-none uppercase tracking-widest">
        Magnificação: {zoomState.k.toFixed(2)}x
      </div>

      {/* Controles de Zoom */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        <button 
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.scaleBy, 2);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          +
        </button>
        <button 
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.scaleBy, 0.5);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          -
        </button>
        <button 
          onClick={() => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            d3.select(svgRef.current).transition().duration(700).call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(window.innerWidth/2, window.innerHeight-100).scale(0.3));
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
