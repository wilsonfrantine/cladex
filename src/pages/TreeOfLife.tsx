import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TolViewer from '../components/TolViewer';
import TolCardPanel from '../components/TolCardPanel';
import { TREE_OF_LIFE, computeLockedIds, type TolNode } from '../data/treeoflife';
import { TAXA_CARDS_BY_TAXON } from '../data/cards';
import { useCladexStore } from '../store';
import { fxManager } from '../audio/fx';

interface TreeOfLifeProps {
  onBack: () => void;
}

// Tamanhos padrão do painel de acordo com o conteúdo disponível
function getDefaultPanelSize(node: TolNode, isLocked: boolean): { w: number; h: number } {
  const hasCard = !!(
    TAXA_CARDS_BY_TAXON[node.cardTaxon ?? ''] ||
    TAXA_CARDS_BY_TAXON[node.name]
  );
  if (!hasCard && !isLocked) {
    // Painel compacto sem conteúdo — auto no mobile, estreito no desktop
    return { w: 260, h: 120 };
  }
  if (isLocked) {
    return { w: 320, h: 360 };
  }
  // Card completo
  return { w: 400, h: Math.round(window.innerHeight * 0.70) };
}

export default function TreeOfLife({ onBack }: TreeOfLifeProps) {
  const [selectedNode, setSelectedNode] = useState<TolNode | null>(null);
  const theme         = useCladexStore((s) => s.theme);
  const unlockedCards = useCladexStore((s) => s.unlockedCards);
  const devUnlockAll  = useCladexStore((s) => s.devUnlockAll);

  const lockedIds = useMemo(
    () => computeLockedIds(TREE_OF_LIFE, unlockedCards, devUnlockAll),
    [unlockedCards, devUnlockAll],
  );

  // Tamanho do painel (controlado aqui e passado para TolViewer + TolCardPanel)
  const [panelW, setPanelW] = useState(400);
  const [panelH, setPanelH] = useState(Math.round(window.innerHeight * 0.70));

  // Reinicia o tamanho quando o nó selecionado muda
  useEffect(() => {
    if (!selectedNode) return;
    const defaults = getDefaultPanelSize(selectedNode, lockedIds.has(selectedNode.id));
    setPanelW(defaults.w);
    setPanelH(defaults.h);
  }, [selectedNode?.id, lockedIds]);

  const panelOpen = selectedNode !== null;

  const handleNodeClick = (node: TolNode) => {
    fxManager.click();
    setSelectedNode(node);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { fxManager.back(); onBack(); }}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col -space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Exploração</span>
            <h1 className="text-lg font-black tracking-tight">Árvore da Vida</h1>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
          {unlockedCards.length} Desbloqueados
        </div>
      </header>

      {/* Main Viewer Area */}
      <main className="flex-1 relative overflow-hidden">
        <TolViewer
          data={TREE_OF_LIFE}
          onNodeClick={handleNodeClick}
          theme={theme}
          lockedIds={lockedIds}
          panelW={panelOpen ? panelW : 0}
          panelH={panelOpen ? panelH : 0}
        />

        {/* Selected Node Panel */}
        {selectedNode && (
          <TolCardPanel
            node={selectedNode}
            isLocked={lockedIds.has(selectedNode.id)}
            onClose={() => setSelectedNode(null)}
            panelW={panelW}
            panelH={panelH}
            onPanelWChange={setPanelW}
            onPanelHChange={setPanelH}
          />
        )}
      </main>
    </div>
  );
}
