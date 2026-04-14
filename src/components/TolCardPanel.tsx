import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Award, Zap, Beaker, Info, Lock } from 'lucide-react';
import type { TolNode } from '../data/treeoflife';
import { TAXA_CARDS_BY_TAXON, type Rarity } from '../data/taxa-cards';
import { useCladexStore } from '../store';
import { loadEnrichment, type PhotoEntry } from '../services/enrichment';

export interface TolCardPanelProps {
  node: TolNode;
  isLocked: boolean;
  onClose: () => void;
  panelW: number;
  panelH: number;
  onPanelWChange: (w: number) => void;
  onPanelHChange: (h: number) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common:    'text-zinc-400 bg-zinc-400/10',
  rare:      'text-emerald-400 bg-emerald-400/10',
  epic:      'text-purple-400 bg-purple-400/10',
  legendary: 'text-amber-400 bg-amber-400/10',
  fossil:    'text-orange-400 bg-orange-400/10',
};

function lockTeaser(node: TolNode): string {
  const sp = node.speciesCount
    ? `~${node.speciesCount.toLocaleString('pt-BR')} espécies`
    : 'diversidade surpreendente';
  switch (node.rank) {
    case 'domain':    return `Um dos três grandes domínios da vida — ${sp} aguardam.`;
    case 'kingdom':   return `Um reino inteiro com ${sp} para explorar.`;
    case 'phylum':    return `Um filo definido por sinapomorfias únicas — ${sp}.`;
    case 'subphylum': return `Um subgrupo morfologicamente distinto — ${sp}.`;
    case 'superclass':
    case 'class':     return `Uma classe com padrão corporal característico — ${sp}.`;
    case 'subclass':  return `Uma radiação evolutiva notável — ${sp}.`;
    case 'order':     return `Uma ordem com ${sp} e adaptações fascinantes.`;
    case 'family':    return `Uma família de ${sp} com biologia singular.`;
    default:          return `Este clado reúne ${sp} com história evolutiva única.`;
  }
}

// ── Limites ───────────────────────────────────────────────────────────────────
const MAX_W_FRAC   = 0.5;
const MAX_H_FRAC   = 0.9;
const MIN_W        = 200;
const MIN_H        = 72;
// Abaixo destes valores ao soltar → fecha o painel
const CLOSE_W      = 140;
const CLOSE_H      = 80;

// ── Componente ────────────────────────────────────────────────────────────────
export default function TolCardPanel({
  node, isLocked, onClose,
  panelW, panelH, onPanelWChange, onPanelHChange,
}: TolCardPanelProps) {
  const card = node.cardTaxon
    ? TAXA_CARDS_BY_TAXON[node.cardTaxon] || TAXA_CARDS_BY_TAXON[node.name]
    : TAXA_CARDS_BY_TAXON[node.name];

  const allTimeStats = useCladexStore((s) => s.allTimeStats);

  const [photo, setPhoto] = useState<PhotoEntry | null>(null);
  useEffect(() => {
    if (isLocked) return;
    loadEnrichment().then(data => setPhoto(data.photos[node.id] ?? null));
  }, [node.id, isLocked]);

  // Detecta se é tela larga (desktop) ou estreita (mobile)
  const [isWide, setIsWide] = useState(() => window.innerWidth >= 640);
  useEffect(() => {
    const h = () => setIsWide(window.innerWidth >= 640);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);

  // ── Tamanho local durante drag ────────────────────────────────────────────
  // Desacoplado do pai para evitar re-render do TolViewer em cada pixel.
  // Sincroniza com o pai apenas ao soltar (drag end).
  const [localW, setLocalW] = useState(panelW);
  const [localH, setLocalH] = useState(panelH);
  const [isDragging, setIsDragging] = useState(false);

  // Sync quando o pai muda (troca de nó) mas não durante drag
  useEffect(() => { if (!isDragging) setLocalW(panelW); }, [panelW]); // eslint-disable-line
  useEffect(() => { if (!isDragging) setLocalH(panelH); }, [panelH]); // eslint-disable-line

  // "Near close" — indicador visual quando o painel está prestes a fechar
  const nearClose = isWide ? localW < CLOSE_W + 80 : localH < CLOSE_H + 60;

  // ── Resize desktop (borda esquerda) ──────────────────────────────────────
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = localW; // captura no início — sem closure stale

    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      // 1:1 com o cursor, sem clamping em relação ao mínimo para permitir "deslizar para fechar"
      const raw = startW + (startX - ev.clientX);
      setLocalW(Math.max(40, Math.min(window.innerWidth * MAX_W_FRAC, raw)));
    };

    const onUp = (ev: MouseEvent) => {
      const raw = startW + (startX - ev.clientX);
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      if (raw < CLOSE_W) {
        onClose(); // fechou arrastando
      } else {
        const clamped = Math.max(MIN_W, Math.min(window.innerWidth * MAX_W_FRAC, raw));
        setLocalW(clamped);
        onPanelWChange(clamped); // sincroniza com pai apenas aqui
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [localW, onClose, onPanelWChange]); // localW capturado no início; ok

  // ── Resize mobile (borda superior) ────────────────────────────────────────
  const handleResizeTouchStart = useCallback((e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    const startH = localH;

    setIsDragging(true);

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const raw = startH + (startY - ev.touches[0].clientY);
      setLocalH(Math.max(40, Math.min(window.innerHeight * MAX_H_FRAC, raw)));
    };

    const onEnd = (ev: TouchEvent) => {
      const raw = startH + (startY - (ev.changedTouches[0]?.clientY ?? startY));
      setIsDragging(false);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      if (raw < CLOSE_H) {
        onClose();
      } else {
        const clamped = Math.max(MIN_H, Math.min(window.innerHeight * MAX_H_FRAC, raw));
        setLocalH(clamped);
        onPanelHChange(clamped);
      }
    };

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [localH, onClose, onPanelHChange]);

  // ── Estilos ───────────────────────────────────────────────────────────────
  // Sem transição durante drag (1:1 com cursor) → transição suave ao soltar
  const panelStyle: React.CSSProperties = isWide
    ? {
        width: localW,
        maxWidth: `${MAX_W_FRAC * 100}vw`,
        minWidth: 40,
        transition: isDragging ? 'none' : 'width 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
        overflow: 'hidden',
      }
    : {
        height: localH,
        maxHeight: `${MAX_H_FRAC * 100}vh`,
        minHeight: 40,
        transition: isDragging ? 'none' : 'height 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
        overflow: 'hidden',
      };

  const slideClass = isWide
    ? 'animate-in slide-in-from-right duration-300'
    : 'animate-in slide-in-from-bottom duration-300';

  // Posicionamento base (a dimensão vem do panelStyle inline)
  const base = [
    'absolute z-10 flex flex-col',
    'bottom-0 left-0 right-0 border-t border-zinc-800',
    'sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:border-t-0 sm:border-l',
    'bg-zinc-950/97 backdrop-blur-xl shadow-2xl',
  ].join(' ');

  // ── Handle de resize desktop (borda esquerda) ─────────────────────────────
  const handleColor = nearClose ? '#f97316' : isDragging ? '#6b7280' : '#3f3f46';
  const DesktopResizeHandle = () => (
    <div
      onMouseDown={handleResizeMouseDown}
      className="hidden sm:flex absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize
                 items-center justify-center z-20 select-none"
      title="Arrastar para redimensionar · Soltar à esquerda para fechar"
    >
      {/* Fundo hover */}
      <div className="absolute inset-0 rounded-l-sm hover:bg-white/5 transition-colors" />
      {/* Traço visual */}
      <div
        className="w-0.5 h-12 rounded-full transition-colors duration-150"
        style={{ backgroundColor: handleColor }}
      />
    </div>
  );

  // ── Handle de drag/resize mobile (topo) ───────────────────────────────────
  const MobileDragHandle = () => (
    <div
      onTouchStart={handleResizeTouchStart}
      className="flex sm:hidden justify-center py-3.5 shrink-0 cursor-ns-resize touch-none select-none"
      title="Arrastar para redimensionar · Soltar embaixo para fechar"
    >
      <div
        className="w-12 h-1.5 rounded-full transition-colors duration-150"
        style={{ backgroundColor: nearClose ? '#f97316' : isDragging ? '#71717a' : '#3f3f46' }}
      />
    </div>
  );

  // ── PAINEL SEM CONTEÚDO (nó estrutural) ───────────────────────────────────
  if (!card && !isLocked) {
    return (
      <div
        className={`${base} ${slideClass}`}
        style={isWide
          ? { width: 'fit-content', maxWidth: `${MAX_W_FRAC * 100}vw`, minWidth: MIN_W }
          : {}}
      >
        <MobileDragHandle />
        <div className="relative flex items-center gap-3 px-5 py-4">
          <DesktopResizeHandle />
          <div className="flex-1 min-w-0 sm:pl-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
              {node.rank || 'Clado'}
            </span>
            <h2 className="text-base font-black text-white truncate">{node.name}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <p className="hidden sm:block px-5 pb-4 text-xs italic text-zinc-600 leading-relaxed sm:pl-8">
          Nó estrutural — sem dados específicos para este nível hierárquico.
        </p>
      </div>
    );
  }

  // ── PAINEL BLOQUEADO ───────────────────────────────────────────────────────
  if (isLocked) {
    const moduleCorrect = node.unlockModule
      ? (allTimeStats.byModule[node.unlockModule]?.correct ?? 0)
      : 0;
    const required = node.unlockMinCorrect ?? 0;
    const progress = required > 0 ? Math.min(1, moduleCorrect / required) : 0;

    return (
      <div className={`${base} ${slideClass}`} style={panelStyle}>
        <MobileDragHandle />
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <DesktopResizeHandle />

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex items-start justify-between shrink-0 sm:pl-9">
            <div className="min-w-0 flex-1 pr-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                {node.rank || 'Clado'}
              </span>
              <h2 className="text-xl font-black text-white leading-tight truncate">{node.name}</h2>
              {node.speciesCount && (
                <p className="text-xs text-zinc-600 mt-0.5 tabular-nums">
                  ~{node.speciesCount.toLocaleString('pt-BR')} espécies
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors shrink-0 mt-0.5">
              <X size={18} />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar sm:pl-9">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Lock size={24} className="text-zinc-600" />
              </div>
              <p className="text-sm font-bold text-zinc-400">Conteúdo bloqueado</p>
            </div>

            {node.unlockModule && required > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">Progresso</span>
                  <span className="font-mono text-zinc-400">
                    {moduleCorrect}<span className="text-zinc-700">/{required}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Pratique mais em{' '}
                  <span className="text-emerald-600 font-bold uppercase">{node.unlockModule}</span>{' '}
                  para revelar este clado.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-sm text-zinc-400 leading-relaxed italic">{lockTeaser(node)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PAINEL COM CARD (desbloqueado) ─────────────────────────────────────────
  return (
    <div className={`${base} ${slideClass}`} style={panelStyle}>
      <MobileDragHandle />
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <DesktopResizeHandle />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex items-start justify-between shrink-0 sm:pl-9">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">
                {node.rank || 'Clado'}
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${RARITY_COLORS[card.rarity]}`}>
                {card.rarity}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">{node.name}</h2>
            {node.latinName && (
              <p className="text-sm italic text-zinc-500">{node.latinName}</p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar sm:pl-9">

          {photo && (
            <div className="relative w-full h-44 overflow-hidden rounded-2xl bg-zinc-900 -mt-2">
              <img src={photo.url} alt={node.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-[8px] text-zinc-400 truncate">
                {photo.credit}
              </div>
            </div>
          )}

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

          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award size={48} className="text-emerald-500" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Você sabia?</h4>
            <p className="text-sm text-emerald-100/80 leading-relaxed relative z-10">{card.funFact}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
