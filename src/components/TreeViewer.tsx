import { useMemo } from 'react';
import * as d3 from 'd3';
import { parseNewick, type NewickNode } from '../utils/newick';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface D3Data { name: string; children?: D3Data[] }

export interface TreeViewerProps {
  newick: string;
  highlightTaxa?: string[];
  highlightColor?: string;
  /** Dimensões reais do container — lidas uma vez no mount pelo pai */
  containerWidth?: number;
  containerHeight?: number;
  onInternalNodeClick?: (name: string, depth: number) => void;
  /** Estilo de renderização dos ramos: cotovelo reto ou diagonal direto */
  treeStyle?: 'elbow' | 'diagonal';
  /** Anotações de classificação tradicional por nome de folha */
  taxonAnnotations?: Record<string, { abbr: string; color: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rawToD3(node: NewickNode): D3Data {
  return {
    name: node.name ?? '',
    ...(node.branchset?.length ? { children: node.branchset.map(rawToD3) } : {}),
  };
}

function countLeaves(node: D3Data): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

function getAllLeafNames(node: D3Data): string[] {
  if (!node.children?.length) return [node.name];
  return node.children.flatMap(getAllLeafNames);
}

// Estimativa de largura de texto em SVG (fonte itálica sistema)
// ~0.58 × fontSize por caractere é uma boa heurística para fontes do sistema
function estimateTextWidth(label: string, fontSize: number): number {
  return Math.ceil(label.length * fontSize * 0.58) + 14; // +14 = gap após o nó
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TreeViewer({
  newick,
  highlightTaxa = [],
  highlightColor = '#10b981',
  containerWidth,
  containerHeight,
  onInternalNodeClick,
  treeStyle = 'elbow',
  taxonAnnotations,
}: TreeViewerProps) {

  const layout = useMemo(() => {
    try {
      const raw = parseNewick(newick);
      const data = rawToD3(raw);
      const leafCount = countLeaves(data);

      const cw = containerWidth  ?? 700;
      const ch = containerHeight ?? 400;

      const ML = 24;
      const MT = 16;
      const MB = 16;

      // Altura por folha preenche o container
      const leafH = Math.max(28, Math.floor((ch - MT - MB) / leafCount));

      // Tamanho de fonte proporcional (−30% do original)
      const fontSize = Math.max(9, leafH * 0.29);

      // Margem direita calculada pelo label mais longo — garante que nunca fica clipado
      const leaves = getAllLeafNames(data);
      const maxLabelW = Math.max(...leaves.map(l => estimateTextWidth(l, fontSize)));
      const MR = Math.max(100, maxLabelW);

      const INNER_W = Math.max(80, cw - ML - MR);

      const innerH = leafCount * leafH;
      const svgH = ch;
      const svgW = cw;

      // Centraliza verticalmente
      const offsetY = Math.max(MT, (svgH - innerH) / 2);

      const root = d3.hierarchy(data);
      d3.cluster<D3Data>().size([innerH, INNER_W])(root);

      return {
        nodes: root.descendants(),
        links: root.links(),
        svgW, svgH, fontSize, ml: ML, offsetY,
      };
    } catch (e) {
      console.error('TreeViewer parse error:', e);
      return { nodes: [], links: [], svgW: 400, svgH: 200, fontSize: 12, ml: 24, offsetY: 20 };
    }
  }, [newick, containerWidth, containerHeight]);

  const highlightSet = useMemo(() => new Set(highlightTaxa), [highlightTaxa]);

  const { nodes, links, svgW, svgH, fontSize, ml, offsetY } = layout;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-base">
        Newick inválido ou vazio.
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"   /* labels nunca são clipados pelo SVG */
      aria-label="Árvore filogenética"
    >
      <g transform={`translate(${ml},${offsetY})`}>

        {/* ── Links ── */}
        {links.map((lk, i) => {
          const sx = lk.source.y as number;
          const sy = lk.source.x as number;
          const tx = lk.target.y as number;
          const ty = lk.target.x as number;
          const d = treeStyle === 'diagonal'
            ? `M${sx},${sy} L${tx},${ty}`
            : `M${sx},${sy} L${sx},${ty} L${tx},${ty}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          );
        })}

        {/* ── Nós ── */}
        {nodes.map((node, i) => {
          const isLeaf = !node.children;
          const nx = node.y as number;
          const ny = node.x as number;
          const hi = isLeaf && highlightSet.has(node.data.name);

          return (
            <g
              key={i}
              transform={`translate(${nx},${ny})`}
              onClick={!isLeaf && onInternalNodeClick
                ? () => onInternalNodeClick(node.data.name, node.depth)
                : undefined}
              style={{ cursor: !isLeaf && onInternalNodeClick ? 'pointer' : 'default' }}
            >
              <circle
                r={isLeaf ? 4 : 3}
                fill={hi ? highlightColor : isLeaf ? '#71717a' : '#52525b'}
              />

              {hi && (
                <circle r={7} fill="none" stroke={highlightColor} strokeWidth={1.5} opacity={0.35} />
              )}

              {/* Label folha */}
              {isLeaf && (
                <text
                  x={11}
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontStyle="italic"
                  fill={hi ? highlightColor : '#a1a1aa'}
                  fontWeight={hi ? 600 : 400}
                >
                  {node.data.name}
                </text>
              )}

              {/* Badge de classificação tradicional */}
              {isLeaf && taxonAnnotations?.[node.data.name] && (() => {
                const ann = taxonAnnotations[node.data.name];
                const labelW = Math.ceil(node.data.name.length * fontSize * 0.58);
                const bx = 11 + labelW + 8;
                const bh = Math.max(10, fontSize * 1.1);
                const bw = Math.ceil(ann.abbr.length * fontSize * 0.65) + 6;
                return (
                  <g>
                    <rect x={bx} y={-bh / 2} width={bw} height={bh} rx={2} fill={ann.color} opacity={0.2} />
                    <text
                      x={bx + bw / 2}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize={Math.max(7, fontSize * 0.72)}
                      fill={ann.color}
                      fontWeight={700}
                      fontStyle="normal"
                    >
                      {ann.abbr}
                    </text>
                  </g>
                );
              })()}

              {/* Label nó interno nomeado */}
              {!isLeaf && node.data.name && (
                <text
                  x={4}
                  y={-7}
                  fontSize={Math.max(7, fontSize * 0.72)}
                  fill="#52525b"
                  fontStyle="italic"
                >
                  {node.data.name}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
