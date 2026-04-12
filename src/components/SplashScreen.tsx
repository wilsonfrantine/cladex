import { Play, VolumeX } from 'lucide-react';
import TreePulse from './TreePulse';

interface SplashScreenProps {
  theme: 'dark' | 'light';
  fading: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export default function SplashScreen({ theme, fading, onStart, onSkip }: SplashScreenProps) {
  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center',
        'bg-zinc-950 transition-opacity duration-700',
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      {/* Fundo animado — mesmo da Home */}
      <div aria-hidden className="fixed inset-0 pointer-events-none select-none">
        <TreePulse theme={theme} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-8 select-none">
        <h1 className="text-[clamp(4rem,22vw,10rem)] font-black tracking-tighter leading-none text-zinc-100">
          Clade<span className="text-emerald-500">X</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-zinc-500">
          Filogenia · Biodiversidade
        </p>

        <button
          onClick={onStart}
          className="mt-6 btn-juicy flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base tracking-wide transition-all shadow-lg shadow-emerald-950/60"
        >
          <Play className="w-5 h-5 fill-white" strokeWidth={0} />
          Iniciar
        </button>

        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
        >
          <VolumeX size={11} />
          Entrar sem som
        </button>
      </div>
    </div>
  );
}
