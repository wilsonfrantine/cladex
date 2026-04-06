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
  /** Quando true (pós-resposta): ativa pulse nos ramos e marca nós MRCA */
  showAnswerFeedback?: boolean;
  /** Tema visual */
  theme?: 'dark' | 'light';
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

/**
 * Um link deve pulsar (pós-resposta) se estiver estritamente DENTRO do clado.
 * O link que chega ao MRCA do grupo não deve ser destacado, pois representa
 * a linhagem ancestral comum.
 */
function isLinkHighlighted(
  lk: d3.HierarchyLink<D3Data>,
  highlightSet: Set<string>,
  allNodes: d3.HierarchyNode<D3Data>[]
): boolean {
  if (!highlightSet.size) return false;

  // 1. O nó de destino (target) deve conter apenas folhas destacadas (ser parte do clado)
  const targetLeaves = getAllLeafNames(lk.target.data);
  const targetIsPart = targetLeaves.length > 0 && targetLeaves.every(l => highlightSet.has(l));
  if (!targetIsPart) return false;

  // 2. O nó de origem (source) também deve conter apenas folhas destacadas.
  // Se o source contiver folhas NÃO destacadas, significa que o link lk é o
  // "link de entrada" no clado (conecta o MRCA ao resto da árvore).
  const sourceLeaves = getAllLeafNames(lk.source.data);
  const sourceIsPart = sourceLeaves.every(l => highlightSet.has(l));

  return sourceIsPart;
}

/**
 * Marca os nós onde pelo menos dois ramos filhos distintos contêm táxons
 * destacados — esses são os pontos de divergência reais do clado (MRCA).
 */
function isMrcaNode(node: d3.HierarchyNode<D3Data>, highlightSet: Set<string>): boolean {
  if (!node.children || highlightSet.size < 2) return false;
  const childrenWithHighlights = node.children.filter(child =>
    getAllLeafNames(child.data).some(l => highlightSet.has(l)),
  );
  return childrenWithHighlights.length >= 2;
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
  showAnswerFeedback = false,
  theme = 'dark',
}: TreeViewerProps) {

  // Paleta de cores conforme o tema
  const C = theme === 'light'
    ? {
        branch:        '#6b5843',
        leafNode:      '#9b8770',
        internalNode:  '#7a6854',
        leafLabel:     '#5a4e3c',
        internalLabel: '#3c3020',
        labelBg:       'rgba(245,240,228,0.88)',
      }
    : {
        branch:        '#3f3f46',
        leafNode:      '#71717a',
        internalNode:  '#52525b',
        leafLabel:     '#a1a1aa',
        internalLabel: '#71717a',
        labelBg:       '#09090b',
      };

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
          const lit = showAnswerFeedback && isLinkHighlighted(lk, highlightSet, nodes);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={lit ? highlightColor : C.branch}
              strokeWidth={lit ? 3 : 1.8}
              strokeLinejoin="round"
              className={lit ? 'branch-highlight' : undefined}
            />
          );
        })}

        {/* ── Nós ── */}
        {nodes.map((node, i) => {
          const isLeaf = !node.children;
          const nx = node.y as number;
          const ny = node.x as number;
          const hi = isLeaf && highlightSet.has(node.data.name);
          const isMrca = showAnswerFeedback && isMrcaNode(node, highlightSet);

          // Raio do nó: folha destacada 10% maior; MRCA pós-resposta também maior
          const baseR = isLeaf ? 4 : 3;
          const nodeR = hi ? baseR * 1.1 : baseR;

          // Fonte dos labels internos: 15% maior que antes (era 0.72)
          const labelFontSize = Math.max(7, fontSize * 0.83);

          return (
            <g
              key={i}
              transform={`translate(${nx},${ny})`}
              onClick={!isLeaf && onInternalNodeClick
                ? () => onInternalNodeClick(node.data.name, node.depth)
                : undefined}
              style={{ cursor: !isLeaf && onInternalNodeClick ? 'pointer' : 'default' }}
            >
              {/* Anel de MRCA pós-resposta */}
              {isMrca && (
                <circle
                  r={nodeR + 5}
                  fill="none"
                  stroke={highlightColor}
                  strokeWidth={1.5}
                  opacity={0.5}
                  strokeDasharray="3 2"
                />
              )}

              <circle
                r={nodeR}
                fill={hi ? highlightColor : isMrca ? highlightColor : isLeaf ? C.leafNode : C.internalNode}
                opacity={isMrca ? 0.85 : 1}
              />

              {/* Halo da folha destacada */}
              {hi && (
                <circle r={nodeR + 4} fill="none" stroke={highlightColor} strokeWidth={1.5} opacity={0.3} />
              )}

              {/* Label folha */}
              {isLeaf && (
                <text
                  x={11}
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontStyle="italic"
                  fill={hi ? highlightColor : C.leafLabel}
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

              {/* Label nó interno nomeado — fundo para evitar sobreposição */}
              {!isLeaf && node.data.name && (() => {
                const lw = Math.ceil(node.data.name.length * labelFontSize * 0.55);
                const lh = labelFontSize * 1.3;
                const lx = 4;
                const ly = -labelFontSize - 3;
                return (
                  <g>
                    <rect
                      x={lx - 2} y={ly}
                      width={lw + 4} height={lh}
                      rx={2}
                      fill={C.labelBg}
                      opacity={0.75}
                    />
                    <text
                      x={lx}
                      y={ly + lh * 0.78}
                      fontSize={labelFontSize}
                      fill={isMrca ? highlightColor : C.internalLabel}
                      fontStyle="italic"
                      fontWeight={isMrca ? 700 : 400}
                    >
                      {node.data.name}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
