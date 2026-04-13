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
    
    // Dimensões generosas para evitar sobreposição lateral
    const nodeWidth = 180;
    const levelHeight = 350;

    // Layout d3.tree vanilla (orgânico)
    if (layoutMode === 'horizontal' || layoutMode === 'vertical') {
      d3.tree<TolNode>().nodeSize([nodeWidth, levelHeight])(root);
    } else {
      d3.tree<TolNode>().size([360, depth * levelHeight])(root);
    }

    return {
      nodes: root.descendants(),
      links: root.links(),
      width: leafCount * nodeWidth,
      height: depth * levelHeight
    };
  }, [data, layoutMode]);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.001, 150])
      .on('zoom', (event) => {
        setZoomState(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    d3.select(svgRef.current).call(zoom);
    
    // Centraliza no LUCA inicial
    const initialK = 0.15;
    d3.select(svgRef.current).call(
      zoom.transform, 
      d3.zoomIdentity.translate(window.innerWidth/2, window.innerHeight - 100).scale(initialK)
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
    if (layoutMode === 'vertical') return { x: nx, y: -ny }; 
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

  const getNodeRadius = (node: TolNode) => {
    const isMajor = node.rank === 'phylum' || node.rank === 'kingdom' || node.id === 'luca';
    const base = isMajor ? 15 : 10;
    const count = node.speciesCount ?? 100;
    const scale = (Math.log10(count + 1) * 8);
    return Math.max(base, scale);
  };

  const getBranchWidth = (node: TolNode) => {
    const count = node.speciesCount ?? 100;
    const baseWidth = Math.sqrt(count) / 15;
    return Math.max(4, Math.min(baseWidth, 100));
  };

  const handleNodeInternalClick = (event: React.MouseEvent, node: d3.HierarchyPointNode<TolNode>) => {
    event.stopPropagation();
    onNodeClick(node.data);

    if (svgRef.current && zoomBehaviorRef.current) {
      const { x, y } = getCoords(node);
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const radius = getNodeRadius(node.data);
      const nextK = Math.min(25, 600 / radius);
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(nextK)
        .translate(-x, -y);

      svg.transition().duration(1200).ease(d3.easePolyInOut).call(zoomBehaviorRef.current.transform, transform);
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
          {layout.links.map((link) => {
            const targetWidth = getBranchWidth(link.target.data);
            return (
              <path
                key={`link-${link.source.data.id}-${link.target.data.id}`}
                d={drawLink(link)}
                fill="none"
                stroke={C.branch}
                strokeWidth={targetWidth / Math.sqrt(zoomState.k)}
                opacity={0.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nós */}
          {layout.nodes.map((node) => {
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

            const isVisible = radius * zoomState.k > 0.5;
            const showLabel = radius * zoomState.k > 3 || isLeaf;

            if (!isVisible) return null;

            return (
              <g 
                key={`node-${node.data.id}`}
                transform={`translate(${x},${y})`}
                onClick={(e) => handleNodeInternalClick(e, node)}
                style={{ cursor: 'pointer' }}
              >
                {unlocked && node.data.type === 'card' && (
                  <circle r={radius + 5 / Math.sqrt(zoomState.k)} fill={C.nodeUnlocked} opacity={0.1} className="animate-soft-pulse" />
                )}

                <circle
                  r={radius}
                  fill={nodeColor}
                  stroke={theme === 'dark' ? '#020617' : '#fff'}
                  strokeWidth={1 / Math.sqrt(zoomState.k)}
                  className="transition-colors duration-300"
                />

                {showLabel && (
                  <text
                    x={0}
                    y={layoutMode === 'vertical' ? (isLeaf ? -radius - 25 : radius + 30) : 4}
                    textAnchor="middle"
                    fontSize={Math.max(4 / zoomState.k, 16)}
                    fontWeight={node.data.rank === 'phylum' || node.data.rank === 'kingdom' || node.id === 'luca' ? 900 : 600}
                    fill={unlocked ? C.text : C.textMuted}
                    className="select-none pointer-events-none"
                    style={{ 
                      fontStyle: node.data.latinName ? 'italic' : 'normal',
                      textShadow: '0 2px 8px rgba(0,0,0,1)',
                      opacity: Math.min(1, (radius * zoomState.k) / 2)
                    }}
                  >
                    {node.data.name}
                  </text>
                )}

                {node.data.collapsedLabel && node.data.type === 'collapsed' && zoomState.k > 0.2 && (
                  <text
                    x={0}
                    y={layoutMode === 'vertical' && !isLeaf ? radius + 55 : radius + 25}
                    fontSize={Math.max(3 / zoomState.k, 13)}
                    textAnchor="middle"
                    fill={C.textMuted}
                    className="select-none pointer-events-none opacity-40 italic"
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
        Magnificação: {(zoomState.k * 100).toFixed(1)}%
      </div>

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
            const initialK = 0.1;
            d3.select(svgRef.current).transition().duration(800).call(
              zoomBehaviorRef.current.transform, 
              d3.zoomIdentity.translate(window.innerWidth/2, window.innerHeight-100).scale(initialK)
            );
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
