import { Volume2, VolumeX } from 'lucide-react';
import { useCladexStore } from '../store';
import { audioManager } from '../audio/manager';

interface AudioToggleProps {
  /** Classe extra para ajustar posicionamento conforme o contexto */
  className?: string;
}

export default function AudioToggle({ className = '' }: AudioToggleProps) {
  const { audioMuted, toggleAudioMuted } = useCladexStore();

  const handleClick = () => {
    if (audioMuted) {
      // play() chamado AQUI — dentro do event handler (gesto do usuário).
      // Isso é necessário para contornar o bloqueio de autoplay dos navegadores.
      audioManager.play();
    } else {
      audioManager.pause();
    }
    toggleAudioMuted();
  };

  return (
    <button
      onClick={handleClick}
      className={[
        'w-7 h-7 flex items-center justify-center rounded-full',
        'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600',
        'text-zinc-500 hover:text-zinc-300 transition-colors backdrop-blur-sm',
        className,
      ].join(' ')}
      aria-label={audioMuted ? 'Ativar música' : 'Silenciar música'}
      title={audioMuted ? 'Ativar música' : 'Silenciar música'}
    >
      {audioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
    </button>
  );
}
