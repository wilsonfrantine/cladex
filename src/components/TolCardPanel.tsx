import { X, StickyNote, Award, Zap, Beaker, Info } from 'lucide-react';
import type { TolNode } from '../data/treeoflife';
import { TAXA_CARDS_BY_TAXON, type Rarity } from '../data/taxa-cards';
import { useCladexStore } from '../store';

interface TolCardPanelProps {
  node: TolNode;
  onClose: () => void;
  onAddNote: (nodeId: string) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'text-zinc-400 bg-zinc-400/10',
  rare: 'text-emerald-400 bg-emerald-400/10',
  epic: 'text-purple-400 bg-purple-400/10',
  legendary: 'text-amber-400 bg-amber-400/10',
  fossil: 'text-orange-400 bg-orange-400/10',
};

export default function TolCardPanel({ node, onClose, onAddNote }: TolCardPanelProps) {
  const card = node.cardTaxon ? TAXA_CARDS_BY_TAXON[node.cardTaxon] || TAXA_CARDS_BY_TAXON[node.name] : TAXA_CARDS_BY_TAXON[node.name];
  const unlockedCards = useCladexStore((s) => s.unlockedCards);
  const isUnlocked = !node.unlockModule || unlockedCards.includes(node.id);

  if (!isUnlocked) {
    return (
      <div className="absolute top-0 right-0 w-80 h-full bg-zinc-950/95 border-l border-zinc-800 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center justify-center text-center gap-4 animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
          <Zap size={32} />
        </div>
        <h2 className="text-xl font-bold text-zinc-100">Táxon Bloqueado</h2>
        <p className="text-sm text-zinc-500">
          Continue praticando no módulo <span className="text-emerald-500 font-bold uppercase">{node.unlockModule}</span> para desbloquear as informações de <span className="italic">{node.name}</span>.
        </p>
        <div className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          Requisito: {node.unlockMinCorrect} acertos
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-zinc-950/95 border-l border-zinc-800 backdrop-blur-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">
              {node.rank || 'Clado'}
            </span>
            {card && (
              <span className={`text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${RARITY_COLORS[card.rarity]}`}>
                {card.rarity}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            {node.name}
          </h2>
          {node.latinName && (
            <p className="text-sm italic text-zinc-500">{node.latinName}</p>
          )}
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {card ? (
          <>
            {/* Emblematic Animal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info size={14} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Representante</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-lg font-bold text-zinc-100">{card.emblematicAnimal.commonName}</p>
                <p className="text-xs italic text-zinc-500">{card.emblematicAnimal.scientificName}</p>
              </div>
            </div>

            {/* Sinapomorfias */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Zap size={14} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Sinapomorfias</span>
              </div>
              <ul className="space-y-2">
                {card.synapomorphies.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Características */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Beaker size={14} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Biologia</span>
              </div>
              <ul className="space-y-2">
                {card.bioFeatures.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fun Fact */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={48} className="text-emerald-500" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Você sabia?</h4>
              <p className="text-sm text-emerald-100/80 leading-relaxed relative z-10">
                {card.funFact}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-600 text-center">
            <p className="text-sm italic">Informações detalhadas não disponíveis para este nível hierárquico.</p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
        <button
          onClick={() => onAddNote(node.id)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-sm transition-all"
        >
          <StickyNote size={16} />
          Adicionar Nota Adesiva
        </button>
      </div>
    </div>
  );
}
