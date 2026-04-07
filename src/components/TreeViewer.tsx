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
  /** Tipo do clado sendo analisado (para feedback visual) */
  cladeType?: string;
  /** Tema visual */
  theme?: 'dark' | 'light';
  /** Silhuetas PhyloPic por nome de táxon (nome → URL SVG/PNG) */
  silhouetteUrls?: Record<string, string>;
  /** Folhas com label ocultado — exibidas como "?" (leaf-placement) */
  hiddenLeaves?: string[];
  /** Callback quando o usuário clica em uma folha (leaf-placement) */
  onLeafClick?: (name: string) => void;
  /** Modo de interação — habilita cursor pointer e hover em folhas ou nós */
  nodeClickMode?: 'character-placement' | 'leaf-placement' | false;
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
 */
function isLinkHighlighted(
  lk: d3.HierarchyLink<D3Data>,
  highlightSet: Set<string>
): boolean {
  if (!highlightSet.size) return false;
  const targetLeaves = getAllLeafNames(lk.target.data);
  const targetIsPart = targetLeaves.length > 0 && targetLeaves.every(l => highlightSet.has(l));
  if (!targetIsPart) return false;
  const sourceLeaves = getAllLeafNames(lk.source.data);
  return sourceLeaves.every(l => highlightSet.has(l));
}

/**
 * Para polifiléticos: destaca apenas o link terminal direto de cada folha
 * destacada (o ramo que vai do nó-pai imediato à folha). Isso evidencia
 * que as folhas estão em regiões distintas da árvore sem iluminar toda
 * a estrutura acima delas.
 */
function isPolyphyleticLink(
  lk: d3.HierarchyLink<D3Data>,
  highlightSet: Set<string>
): boolean {
  if (!highlightSet.size) return false;
  const targetLeaves = getAllLeafNames(lk.target.data);
  // Só o link direto para a própria folha destacada (subtree com 1 folha = folha)
  return targetLeaves.length === 1 && highlightSet.has(targetLeaves[0]);
}

/**
 * Uma folha é "faltante" (parafilético) se for descendente do MRCA do grupo
 * destacado mas não estiver no grupo. Nós internos não são marcados — eles
 * representam ancestrais inferidos, não táxons excluídos.
 */
function isMissingDescendant(
  node: d3.HierarchyNode<D3Data>,
  highlightSet: Set<string>,
  mrcaNode: d3.HierarchyNode<D3Data> | null
): boolean {
  if (!mrcaNode || highlightSet.has(node.data.name)) return false;
  if (node.children) return false; // só folhas representam táxons reais excluídos
  let curr: d3.HierarchyNode<D3Data> | null = node;
  while (curr) {
    if (curr === mrcaNode) return true;
    curr = curr.parent;
  }
  return false;
}

/**
 * Para polifiléticos: identifica nós internos onde pelo menos dois ramos filhos
 * distintos contêm táxons destacados — esses são os pontos de divergência
 * que demonstram que as linhagens se separaram antes de convergir novamente.
 * O próprio MRCA global é excluído (já recebe o anel de `isMrcaInternalNode`).
 */
function isInterveningNode(
  node: d3.HierarchyNode<D3Data>,
  highlightSet: Set<string>,
  mrcaNode: d3.HierarchyNode<D3Data> | null
): boolean {
  if (!node.children || !mrcaNode || node === mrcaNode) return false;
  const childrenWithHighlights = node.children.filter(child =>
    getAllLeafNames(child.data).some(l => highlightSet.has(l)),
  );
  // Ponto de divergência: 2+ ramos filhos contêm táxons destacados
  return childrenWithHighlights.length >= 2;
}

/**
 * Encontra o MRCA (Ancestral Comum Mais Recente) do conjunto de táxons.
 */
function findMrca(nodes: d3.HierarchyNode<D3Data>[], highlightSet: Set<string>): d3.HierarchyNode<D3Data> | null {
  if (highlightSet.size === 0) return null;
  const highlightedNodes = nodes.filter(n => !n.children && highlightSet.has(n.data.name));
  if (highlightedNodes.length === 0) return null;
  
  let common = highlightedNodes[0];
  for (let i = 1; i < highlightedNodes.length; i++) {
    common = getCommonAncestor(common, highlightedNodes[i]);
  }
  return common;
}

function getCommonAncestor(a: d3.HierarchyNode<D3Data>, b: d3.HierarchyNode<D3Data>): d3.HierarchyNode<D3Data> {
  const pathA = a.ancestors();
  const pathB = b.ancestors();
  let lastCommon = pathA[pathA.length - 1];
  for (let i = 1; i <= Math.min(pathA.length, pathB.length); i++) {
    const nodeA = pathA[pathA.length - i];
    const nodeB = pathB[pathB.length - i];
    if (nodeA === nodeB) lastCommon = nodeA;
    else break;
  }
  return lastCommon;
}

/**
 * Marca os nós onde pelo menos dois ramos filhos distintos contêm táxons
 * destacados — esses são os pontos de divergência reais do clado (MRCA).
 */
function isMrcaInternalNode(node: d3.HierarchyNode<D3Data>, highlightSet: Set<string>): boolean {
  if (!node.children || highlightSet.size < 2) return false;
  const childrenWithHighlights = node.children.filter(child =>
    getAllLeafNames(child.data).some(l => highlightSet.has(l)),
  );
  return childrenWithHighlights.length >= 2;
}

/** SVG units reservados para a silhueta PhyloPic à esquerda de cada label */
const ICON_W = 22

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
  cladeType,
  theme = 'dark',
  silhouetteUrls,
  hiddenLeaves,
  onLeafClick,
  nodeClickMode = false,
}: TreeViewerProps) {

  // Paleta de cores conforme o tema — Refinada para "Cyber" vs "Naturalist"
  // Adicionado ~10% a mais de contraste nas cores base em relação ao fundo
  const C = theme === 'light'
    ? {
        branch:        '#2d4531', /* Verde Naturalista mais escuro */
        leafNode:      '#456944',
        internalNode:  '#2d4531',
        leafLabel:     '#2d261e', /* Nanquim */
        internalLabel: '#54483a',
        labelBg:       'rgba(247, 243, 235, 0.9)',
        highlight:     '#1b3a4b', /* Azul Prussiano para destaque no papel */
      }
    : {
        branch:        '#334155', /* Slate com maior contraste */
        leafNode:      '#475569',
        internalNode:  '#64748b',
        leafLabel:     '#94a3b8',
        internalLabel: '#64748b',
        labelBg:       'rgba(5, 5, 7, 0.85)',
        highlight:     '#10b981', /* Esmeralda Neon */
      };

  const activeHighlightColor = theme === 'light' ? C.highlight : highlightColor;

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
      // Reserva espaço para: ícone + label + badge (coluna de anotações)
      const maxBadgeW = taxonAnnotations
        ? Math.max(0, ...Object.values(taxonAnnotations).map(a =>
            Math.ceil(a.abbr.length * fontSize * 0.75) + 16,
          ))
        : 0;
      const MR = Math.max(100, maxLabelW + ICON_W + 4 + maxBadgeW);

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
        svgW, svgH, fontSize, ml: ML, offsetY, maxLabelW,
      };
    } catch (e) {
      console.error('TreeViewer parse error:', e);
      return { nodes: [], links: [], svgW: 400, svgH: 200, fontSize: 12, ml: 24, offsetY: 20, maxLabelW: 100 };
    }
  }, [newick, containerWidth, containerHeight, taxonAnnotations]);

  const { nodes, links, svgW, svgH, fontSize, ml, offsetY, maxLabelW } = layout;
  const highlightSet = useMemo(() => new Set(highlightTaxa), [highlightTaxa]);
  const mrcaNode = useMemo(() => findMrca(nodes, highlightSet), [nodes, highlightSet]);

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
      <defs>
        {/* Inverte silhuetas pretas → brancas no dark mode */}
        <filter id="tv-silhouette-invert">
          <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" />
        </filter>
      </defs>

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
          
          const isMonoHighlight = showAnswerFeedback && isLinkHighlighted(lk, highlightSet);
          const isPolyHighlight = showAnswerFeedback && cladeType === 'polyphyletic' && isPolyphyleticLink(lk, highlightSet);
          const isParaHighlight = showAnswerFeedback && cladeType === 'paraphyletic' && isLinkHighlighted(lk, highlightSet);
          
          const lit = isMonoHighlight || isPolyHighlight || isParaHighlight;
          const isDashed = (cladeType === 'polyphyletic' && isPolyHighlight) || (cladeType === 'paraphyletic' && isParaHighlight);
          
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={lit ? activeHighlightColor : C.branch}
              strokeWidth={lit ? 3.5 : 2}
              strokeDasharray={isDashed ? '6 4' : 'none'}
              strokeLinejoin="round"
              className={lit ? (isDashed ? 'branch-highlight-dashed opacity-80' : 'branch-highlight') : undefined}
            />
          );
        })}

        {/* ── Nós ── */}
        {nodes.map((node, i) => {
          const isLeaf = !node.children;
          const nx = node.y as number;
          const ny = node.x as number;
          // Para polifilético: suprimir highlight nas folhas; focar nos ancestrais excluídos
          const hi = isLeaf && highlightSet.has(node.data.name) &&
            !(showAnswerFeedback && cladeType === 'polyphyletic');
          // Para polifilético: apenas o nó MRCA real recebe o anel (não todos os convergentes)
          const isMrca = showAnswerFeedback && (
            cladeType === 'polyphyletic'
              ? (node === mrcaNode && !!mrcaNode)
              : isMrcaInternalNode(node, highlightSet)
          );
          
          // Feedback didático avançado
          const isMissingPara = showAnswerFeedback && cladeType === 'paraphyletic' && isMissingDescendant(node, highlightSet, mrcaNode);
          const isInterveningPoly = showAnswerFeedback && cladeType === 'polyphyletic' && isInterveningNode(node, highlightSet, mrcaNode);

          // Raio do nó: folha destacada 10% maior; nós internos maiores no character-placement
          const baseR = isLeaf ? 4.5 : (nodeClickMode === 'character-placement' ? 7 : 3.5);
          const nodeR = hi ? baseR * 1.2 : baseR;

          // Fonte dos labels internos
          const labelFontSize = Math.max(7, fontSize * 0.83);

          const isHidden = isLeaf && (hiddenLeaves?.includes(node.data.name) ?? false);
          const isLeafClickable = isLeaf && !!onLeafClick && nodeClickMode === 'leaf-placement' && isHidden;
          const isNodeClickable = !isLeaf && (
            (onInternalNodeClick != null) ||
            nodeClickMode === 'character-placement'
          );

          return (
            <g
              key={i}
              transform={`translate(${nx},${ny})`}
              onClick={
                isLeafClickable
                  ? () => onLeafClick!(node.data.name)
                  : (isNodeClickable && onInternalNodeClick)
                    ? () => onInternalNodeClick(node.data.name, node.depth)
                    : undefined
              }
              style={{ cursor: (isLeafClickable || isNodeClickable) ? 'pointer' : 'default' }}
            >
              {/* Halo pulsante em nós internos clicáveis (character-placement) */}
              {isNodeClickable && !showAnswerFeedback && (
                <circle
                  r={nodeR + 6}
                  fill="none"
                  stroke={C.internalNode}
                  strokeWidth={1.5}
                  opacity={0.35}
                  className="animate-soft-pulse"
                />
              )}

              {/* Anel de MRCA pós-resposta */}
              {isMrca && (
                <>
                  <circle
                    r={nodeR + 6}
                    fill="none"
                    stroke={cladeType === 'polyphyletic' ? (theme === 'light' ? '#8b5cf6' : '#a78bfa') : activeHighlightColor}
                    strokeWidth={2}
                    opacity={0.7}
                    strokeDasharray="4 2"
                    className="animate-spin-slow"
                  />
                  {cladeType === 'polyphyletic' && (
                    <text
                      x={8} y={-nodeR - 10}
                      fontSize={fontSize * 0.82}
                      fill={theme === 'light' ? '#8b5cf6' : '#a78bfa'}
                      fontWeight={700}
                      fontStyle="normal"
                      opacity={0.9}
                    >
                      MRCA excluído
                    </text>
                  )}
                </>
              )}

              {/* Destaque de elemento FALTANTE (Parafilético) */}
              {isMissingPara && (
                <g>
                  {/* Halo externo pulsante — mesmo padrão das folhas destacadas */}
                  <circle
                    r={nodeR + 9}
                    fill="none"
                    stroke={theme === 'light' ? '#f43f5e' : '#fb7185'}
                    strokeWidth={2}
                    opacity={0.45}
                    className="animate-soft-pulse"
                  />
                  {/* Anel interno tracejado */}
                  <circle
                    r={nodeR + 5}
                    fill="none"
                    stroke={theme === 'light' ? '#f43f5e' : '#fb7185'}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                  {isLeaf && (
                    <text x={14} y={fontSize + 6} fontSize={fontSize * 0.8} fill={theme === 'light' ? '#f43f5e' : '#fb7185'} fontWeight={600} fontStyle="normal">
                      [excluído]
                    </text>
                  )}
                </g>
              )}

              {/* Destaque de nó INTERVENIENTE (Polifilético) — ancestral compartilhado excluído */}
              {isInterveningPoly && !isMrca && (
                <g>
                  {/* Halo externo pulsante */}
                  <circle
                    r={nodeR + 8}
                    fill="none"
                    stroke={theme === 'light' ? '#8b5cf6' : '#a78bfa'}
                    strokeWidth={2}
                    opacity={0.5}
                    className="animate-soft-pulse"
                  />
                  {/* Anel interno fixo */}
                  <circle
                    r={nodeR + 4}
                    fill="none"
                    stroke={theme === 'light' ? '#8b5cf6' : '#a78bfa'}
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                  />
                  <text
                    x={8} y={-nodeR - 10}
                    fontSize={fontSize * 0.78}
                    fill={theme === 'light' ? '#8b5cf6' : '#a78bfa'}
                    fontWeight={600}
                    fontStyle="normal"
                    opacity={0.85}
                  >
                    anc. excluído
                  </text>
                </g>
              )}

              <circle
                r={nodeR}
                fill={
                  hi ? activeHighlightColor : 
                  isMrca ? activeHighlightColor : 
                  isMissingPara ? (theme === 'light' ? '#f43f5e' : '#fb7185') : 
                  isInterveningPoly ? (theme === 'light' ? '#8b5cf6' : '#a78bfa') : 
                  isLeaf ? C.leafNode : C.internalNode
                }
                opacity={isMrca ? 0.9 : (isMissingPara || isInterveningPoly) ? 0.6 : 1}
                className="transition-all duration-300"
              />

              {/* Halo da folha destacada - Soft Pulse mais lento */}
              {hi && (
                <circle 
                  r={nodeR + 5} 
                  fill="none" 
                  stroke={activeHighlightColor} 
                  strokeWidth={2} 
                  opacity={showAnswerFeedback ? 0.3 : 0.6} 
                  className={!showAnswerFeedback ? "animate-soft-pulse" : ""} 
                />
              )}

              {/* Halo interativo para folhas clicáveis (leaf-placement) */}
              {isLeafClickable && (
                <circle
                  r={nodeR + 7}
                  fill="none"
                  stroke={C.leafNode}
                  strokeWidth={1.5}
                  opacity={0.4}
                  className="animate-soft-pulse"
                />
              )}

              {/* Silhueta PhyloPic — entre o nó-círculo e o label */}
              {isLeaf && !isHidden && silhouetteUrls?.[node.data.name] && (
                <image
                  href={silhouetteUrls[node.data.name]}
                  x={14}
                  y={-ICON_W / 2}
                  width={ICON_W}
                  height={ICON_W}
                  preserveAspectRatio="xMidYMid meet"
                  filter={theme === 'dark' ? 'url(#tv-silhouette-invert)' : undefined}
                  opacity={0.72}
                />
              )}

              {/* Label folha */}
              {isLeaf && (() => {
                const hasIcon = !isHidden && !!silhouetteUrls?.[node.data.name];
                const labelX = hasIcon ? 14 + ICON_W + 4 : 14;
                if (isHidden) {
                  return (
                    <text
                      x={14}
                      dominantBaseline="middle"
                      fontSize={fontSize * 1.55}
                      fontStyle="normal"
                      fontWeight={800}
                      fill={theme === 'dark' ? '#e2e8f0' : '#1e293b'}
                      opacity={0.9}
                    >
                      ?
                    </text>
                  );
                }
                return (
                  <text
                    x={labelX}
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontStyle="italic"
                    fill={
                      hi ? activeHighlightColor :
                      isMissingPara ? (theme === 'light' ? '#f43f5e' : '#fb7185') :
                      isInterveningPoly ? (theme === 'light' ? '#8b5cf6' : '#a78bfa') :
                      C.leafLabel
                    }
                    fontWeight={hi ? 700 : 500}
                    opacity={isMissingPara || isInterveningPoly ? 0.7 : 1}
                  >
                    {node.data.name}
                  </text>
                );
              })()}

              {/* Badge de classificação tradicional alinhado pela maior largura */}
              {isLeaf && taxonAnnotations?.[node.data.name] && (() => {
                const ann = taxonAnnotations[node.data.name];
                // Badge sempre na mesma coluna: após ícone (se houver) + label mais longo.
                // maxLabelW já inclui +14 (gap nó→label), então a coluna é ICON_W+4 + maxLabelW.
                const bx = ICON_W + 4 + maxLabelW;
                const bh = Math.max(12, fontSize * 1.2);
                const bw = Math.ceil(ann.abbr.length * fontSize * 0.75) + 8;
                return (
                  <g>
                    <rect x={bx} y={-bh / 2} width={bw} height={bh} rx={3} fill={ann.color} opacity={theme === 'light' ? 0.25 : 0.35} />
                    <text
                      x={bx + bw / 2}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize={Math.max(8, fontSize * 0.75)}
                      fill={ann.color}
                      fontWeight={800}
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
                const lh = labelFontSize * 1.4;
                const lx = 6;
                const ly = -labelFontSize - 4;
                return (
                  <g>
                    <rect
                      x={lx - 4} y={ly}
                      width={lw + 8} height={lh}
                      rx={3}
                      fill={C.labelBg}
                      opacity={0.8}
                    />
                    <text
                      x={lx}
                      y={ly + lh * 0.75}
                      fontSize={labelFontSize}
                      fill={isMrca ? activeHighlightColor : (isMissingPara || isInterveningPoly) ? (theme === 'light' ? '#8b5cf6' : '#a78bfa') : C.internalLabel}
                      fontStyle="italic"
                      fontWeight={isMrca ? 800 : 500}
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
