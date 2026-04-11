import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DraggableTaxonCardProps {
  label: string;
  hints: string[];
  silhouetteUrl?: string;
  onDrop: (leafName: string) => void;
  onHoverChange: (leaf: string | null) => void;
  disabled?: boolean;
}

export default function DraggableTaxonCard({
  label,
  hints,
  silhouetteUrl,
  onDrop,
  onHoverChange,
  disabled = false,
}: DraggableTaxonCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  function hitTest(clientX: number, clientY: number): string | null {
    // Esconder o ghost momentaneamente para não bloquear o hit-test
    if (ghostRef.current) ghostRef.current.style.pointerEvents = 'none';
    const el = document.elementFromPoint(clientX, clientY);
    if (ghostRef.current) ghostRef.current.style.pointerEvents = '';

    const target = el?.closest('[data-leaf-name]');
    return target?.getAttribute('data-leaf-name') ?? null;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setGhostPos({ x: e.clientX, y: e.clientY });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setGhostPos({ x: e.clientX, y: e.clientY });
    const leaf = hitTest(e.clientX, e.clientY);
    onHoverChange(leaf);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const leaf = hitTest(e.clientX, e.clientY);
    cleanup();
    if (leaf) onDrop(leaf);
  }

  function handlePointerCancel() {
    cleanup();
  }

  function cleanup() {
    setIsDragging(false);
    setGhostPos(null);
    onHoverChange(null);
  }

  const ICON_SIZE = 40;

  return (
    <>
      {/* Card estático */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={[
          'select-none touch-none rounded-xl border px-3 py-2.5 transition-all duration-150',
          disabled
            ? 'cursor-default opacity-40 border-zinc-700 bg-zinc-900'
            : isDragging
              ? 'cursor-grabbing opacity-40 border-emerald-600 bg-zinc-800 shadow-lg'
              : 'cursor-grab border-emerald-700/60 bg-zinc-800/80 hover:border-emerald-500 hover:bg-zinc-800 active:scale-95',
        ].join(' ')}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        <div className="flex items-center gap-3">
          {/* Silhueta PhyloPic ou placeholder */}
          <div className="shrink-0 flex items-center justify-center" style={{ width: ICON_SIZE, height: ICON_SIZE }}>
            {silhouetteUrl ? (
              <img
                src={silhouetteUrl}
                alt=""
                width={ICON_SIZE}
                height={ICON_SIZE}
                style={{ filter: 'invert(1)', opacity: 0.75 }}
                draggable={false}
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center">
                <span className="text-zinc-500 text-xs font-bold">?</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-100 leading-tight truncate">{label}</p>
            {hints.length > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug line-clamp-2">{hints[0]}</p>
            )}
          </div>

          <div className="shrink-0 text-zinc-600" title="Arraste para a posição correta na árvore">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="5" r="1" fill="currentColor" />
              <circle cx="9" cy="12" r="1" fill="currentColor" />
              <circle cx="9" cy="19" r="1" fill="currentColor" />
              <circle cx="15" cy="5" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
              <circle cx="15" cy="19" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* Ghost seguindo o ponteiro — via portal para escapar de overflow-hidden */}
      {isDragging && ghostPos && createPortal(
        <div
          ref={ghostRef}
          style={{
            position: 'fixed',
            left: ghostPos.x - 80,
            top: ghostPos.y - 28,
            zIndex: 9999,
            pointerEvents: 'none',
            minWidth: 160,
          }}
          className="rounded-xl border-2 border-emerald-500 bg-zinc-800 px-3 py-2 shadow-2xl opacity-90"
        >
          <div className="flex items-center gap-2">
            {silhouetteUrl && (
              <img
                src={silhouetteUrl}
                alt=""
                width={24}
                height={24}
                style={{ filter: 'invert(1)', opacity: 0.8 }}
                draggable={false}
              />
            )}
            <span className="text-sm font-bold text-white truncate">{label}</span>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
