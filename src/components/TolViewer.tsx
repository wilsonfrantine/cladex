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
      width = depth * 250;
      height = leafCount * 45;
      d3.cluster<TolNode>().size([height, width])(root);
    } else if (layoutMode === 'vertical') {
      width = leafCount * 60;
      height = depth * 200;
      d3.cluster<TolNode>().size([width, height])(root);
    } else if (layoutMode === 'circular') {
      const radius = Math.max(500, leafCount * 12);
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
      .scaleExtent([0.05, 40])
      .on('zoom', (event) => {
        setZoomState(event.transform);
      });

    d3.select(svgRef.current).call(zoom);
  }, [layoutMode]);

  const isUnlocked = (node: TolNode) => {
    if (node.type === 'internal') return true;
    if (!node.unlockModule) return true;
    return unlockedCards.includes(node.id);
  };

  const getCoords = (node: d3.HierarchyPointNode<TolNode>) => {
    const nx = node.x ?? 0;
    const ny = node.y ?? 0;
    if (layoutMode === 'horizontal') return { x: ny, y: nx };
    if (layoutMode === 'vertical') return { x: nx, y: ny };
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

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={layoutMode === 'circular' 
          ? `${-layout.width/2 - 200} ${-layout.height/2 - 200} ${layout.width + 400} ${layout.height + 400}`
          : `-100 -100 ${layout.width + 400} ${layout.height + 400}`}
      >
        <g 
          transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}
        >
          {/* Links */}
          {layout.links.map((link) => (
            <path
              key={`link-${link.source.data.id}-${link.target.data.id}`}
              d={drawLink(link)}
              fill="none"
              stroke={C.branch}
              strokeWidth={2 / Math.sqrt(zoomState.k)}
              opacity={0.6}
            />
          ))}

          {/* Nós */}
          {layout.nodes.map((node) => {
            const unlocked = isUnlocked(node.data);
            const isLeaf = !node.children;
            const { x, y } = getCoords(node);
            const nx = node.x ?? 0;

            let nodeColor = C.nodeInternal;
            if (node.data.type === 'card' || node.data.type === 'placeholder') {
              nodeColor = unlocked ? C.nodeUnlocked : C.nodeLocked;
            } else if (node.data.type === 'collapsed') {
              nodeColor = C.nodeCollapsed;
            }

            const textRotate = layoutMode === 'circular' 
              ? (nx < 180 ? nx - 90 : nx + 90) 
              : 0;

            return (
              <g 
                key={`node-${node.data.id}`}
                transform={`translate(${x},${y})`}
                className="transition-opacity duration-500"
                onClick={() => onNodeClick(node.data)}
                style={{ cursor: 'pointer' }}
              >
                {unlocked && node.data.type === 'card' && (
                  <circle r={10 / Math.sqrt(zoomState.k)} fill={C.nodeUnlocked} opacity={0.2} className="animate-soft-pulse" />
                )}

                <circle
                  r={(node.data.type === 'internal' ? 4 : 6) / Math.sqrt(zoomState.k)}
                  fill={nodeColor}
                  stroke={theme === 'dark' ? '#020617' : '#fff'}
                  strokeWidth={1.5 / Math.sqrt(zoomState.k)}
                />

                <g transform={`rotate(${textRotate})`}>
                  <text
                    x={layoutMode === 'circular' ? (nx < 180 ? 12 : -12) : (isLeaf ? 12 : -12)}
                    y={layoutMode === 'vertical' ? (isLeaf ? 24 : -12) : 4}
                    textAnchor={layoutMode === 'vertical' ? 'middle' : (layoutMode === 'circular' ? (nx < 180 ? 'start' : 'end') : (isLeaf ? 'start' : 'end'))}
                    fontSize={Math.max(4, (node.data.type === 'internal' ? 14 : 16) / Math.sqrt(zoomState.k))}
                    fontWeight={node.data.type === 'internal' ? 700 : 500}
                    fill={unlocked ? C.text : C.textMuted}
                    className="select-none pointer-events-none"
                    style={{ 
                      fontStyle: node.data.latinName ? 'italic' : 'normal',
                      textShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
                    }}
                  >
                    {node.data.name}
                  </text>
                </g>

                {node.data.type === 'collapsed' && zoomState.k > 1 && (
                  <text
                    x={0}
                    y={20 / zoomState.k}
                    fontSize={10 / zoomState.k}
                    textAnchor="middle"
                    fill={C.textMuted}
                    className="select-none pointer-events-none"
                  >
                    {node.data.collapsedLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controles de Zoom */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        <button 
          onClick={() => {
            if (!svgRef.current) return;
            const svg = d3.select(svgRef.current);
            svg.transition().duration(400).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 2);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          +
        </button>
        <button 
          onClick={() => {
            if (!svgRef.current) return;
            const svg = d3.select(svgRef.current);
            svg.transition().duration(400).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.5);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          -
        </button>
        <button 
          onClick={() => {
            if (!svgRef.current) return;
            const svg = d3.select(svgRef.current);
            svg.transition().duration(700).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
