import { useState } from 'react';
import { ArrowLeft, Layout, Columns, Circle } from 'lucide-react';
import TolViewer from '../components/TolViewer';
import type { LayoutMode } from '../components/TolViewer';
import TolCardPanel from '../components/TolCardPanel';
import { TREE_OF_LIFE, type TolNode } from '../data/treeoflife';
import { useCladexStore } from '../store';
import { fxManager } from '../audio/fx';

interface TreeOfLifeProps {
  onBack: () => void;
}

export default function TreeOfLife({ onBack }: TreeOfLifeProps) {
  const [selectedNode, setSelectedNode] = useState<TolNode | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('circular');
  
  const theme = useCladexStore((s) => s.theme);
  const unlockedCards = useCladexStore((s) => s.unlockedCards);

  const handleNodeClick = (node: TolNode) => {
    fxManager.click();
    setSelectedNode(node);
  };

  const cycleLayout = () => {
    fxManager.click();
    const modes: LayoutMode[] = ['circular', 'horizontal', 'vertical'];
    const next = modes[(modes.indexOf(layoutMode) + 1) % modes.length];
    setLayoutMode(next);
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

        <div className="flex items-center gap-3">
          <button
            onClick={cycleLayout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
          >
            {layoutMode === 'circular' && <Circle size={16} />}
            {layoutMode === 'horizontal' && <Layout size={16} />}
            {layoutMode === 'vertical' && <Columns size={16} className="rotate-90" />}
            <span className="text-xs font-bold uppercase tracking-widest">Layout</span>
          </button>
          
          <div className="h-8 w-px bg-zinc-800 mx-1" />
          
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            {unlockedCards.length} Desbloqueados
          </div>
        </div>
      </header>

      {/* Main Viewer Area */}
      <main className="flex-1 relative">
        <TolViewer 
          data={TREE_OF_LIFE} 
          onNodeClick={handleNodeClick}
          layoutMode={layoutMode}
          theme={theme}
        />

        {/* Selected Node Panel */}
        {selectedNode && (
          <TolCardPanel 
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onAddNote={() => {}} 
          />
        )}
      </main>
    </div>
  );
}
