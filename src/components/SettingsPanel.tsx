import { useRef, useEffect, useState } from 'react';
import { Settings, Volume2, VolumeX, Music, Sun, Moon, Share2, BarChart2 } from 'lucide-react';
import { useCladexStore } from '../store';
import { audioManager } from '../audio/manager';

interface SettingsPanelProps {
  showShare?: boolean;
  onShare?: () => void;
  showResults?: boolean;
  onResults?: () => void;
}

export default function SettingsPanel({
  showShare = false,
  onShare,
  showResults = false,
  onResults,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    audioMuted, toggleAudioMuted,
    fxMuted, toggleFxMuted,
    theme, toggleTheme,
  } = useCladexStore();

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // audioManager.play() deve ser chamado dentro do event handler (política de autoplay)
  const handleAudioToggle = () => {
    if (audioMuted) {
      audioManager.play();
    } else {
      audioManager.pause();
    }
    toggleAudioMuted();
  };

  const row = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium text-left';

  return (
    <div ref={panelRef} className="relative">
      {/* Ícone de engrenagem */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 transition-colors backdrop-blur-sm"
        aria-label="Configurações"
        aria-expanded={open}
      >
        <Settings size={13} />
      </button>

      {/* Painel flutuante */}
      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-md p-1.5 flex flex-col gap-0.5">

          {/* Música */}
          <button onClick={handleAudioToggle} className={row}>
            {audioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>Música</span>
            <span className="ml-auto text-[10px] text-zinc-600">{audioMuted ? 'off' : 'on'}</span>
          </button>

          {/* FX */}
          <button onClick={toggleFxMuted} className={row}>
            <Music size={15} />
            <span>FX</span>
            <span className="ml-auto text-[10px] text-zinc-600">{fxMuted ? 'off' : 'on'}</span>
          </button>

          {/* Tema */}
          <button onClick={toggleTheme} className={row}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>

          {/* Compartilhar / Resultados */}
          {(showShare || showResults) && (
            <div className="my-1 h-px bg-zinc-800" />
          )}

          {showShare && onShare && (
            <button onClick={() => { onShare(); setOpen(false); }} className={row}>
              <Share2 size={15} />
              <span>Compartilhar</span>
            </button>
          )}

          {showResults && onResults && (
            <button onClick={() => { onResults(); setOpen(false); }} className={row}>
              <BarChart2 size={15} />
              <span>Resultados</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
