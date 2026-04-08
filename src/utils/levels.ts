import {
  Search, BookOpen, FlaskConical, Leaf, Microscope,
  Award, GraduationCap, ScrollText, Atom, GitBranch, Crown,
  type LucideIcon,
} from 'lucide-react';

export type LevelInfo = {
  threshold: number;
  label:     string;
  style:     string;
  Icon:      LucideIcon;
  glow:      string;
  particle:  string;
  message:   string;
};

export const LEVELS: LevelInfo[] = [
  {
    threshold: 0,
    label: 'Curioso', style: 'text-zinc-400', Icon: Search,
    glow: 'rgba(161,161,170,0.55)', particle: 'bg-zinc-400',
    message: '',
  },
  {
    threshold: 5,
    label: 'Estudante', style: 'text-zinc-300', Icon: BookOpen,
    glow: 'rgba(212,212,216,0.55)', particle: 'bg-zinc-300',
    message: 'Do caderno para a prática. Você tem as ferramentas — use-as.',
  },
  {
    threshold: 15,
    label: 'Estagiário', style: 'text-blue-500', Icon: FlaskConical,
    glow: 'rgba(59,130,246,0.55)', particle: 'bg-blue-500',
    message: 'Bem-vindo ao laboratório. A ciência se aprende fazendo.',
  },
  {
    threshold: 30,
    label: 'Naturalista', style: 'text-blue-400', Icon: Leaf,
    glow: 'rgba(96,165,250,0.55)', particle: 'bg-blue-400',
    message: 'Você está começando a enxergar padrões onde outros veem caos.',
  },
  {
    threshold: 55,
    label: 'Pesquisador', style: 'text-indigo-400', Icon: Microscope,
    glow: 'rgba(129,140,248,0.55)', particle: 'bg-indigo-400',
    message: 'Do campo para a ciência. Você faz perguntas que importam.',
  },
  {
    threshold: 90,
    label: 'Especialista', style: 'text-indigo-500', Icon: Award,
    glow: 'rgba(99,102,241,0.55)', particle: 'bg-indigo-500',
    message: 'Domínio em formação. Você conhece cada ramo da árvore.',
  },
  {
    threshold: 140,
    label: 'Mestre', style: 'text-violet-500', Icon: GraduationCap,
    glow: 'rgba(139,92,246,0.55)', particle: 'bg-violet-500',
    message: 'Você não apenas classifica — você compreende.',
  },
  {
    threshold: 200,
    label: 'Doutor', style: 'text-purple-500', Icon: ScrollText,
    glow: 'rgba(168,85,247,0.55)', particle: 'bg-purple-500',
    message: 'A árvore da vida revela sua lógica para você.',
  },
  {
    threshold: 280,
    label: 'Pós-Doc', style: 'text-emerald-500', Icon: Atom,
    glow: 'rgba(16,185,129,0.55)', particle: 'bg-emerald-500',
    message: 'Monofilia, sinapomorfia, parcimônia — esse é seu idioma.',
  },
  {
    threshold: 380,
    label: 'Cladista', style: 'text-emerald-400', Icon: GitBranch,
    glow: 'rgba(52,211,153,0.55)', particle: 'bg-emerald-400',
    message: 'Você pensa em cladogramas. É um modo de ver o mundo.',
  },
  {
    threshold: 500,
    label: 'Cladista Hennig', style: 'text-amber-400', Icon: Crown,
    glow: 'rgba(251,191,36,0.65)', particle: 'bg-amber-400',
    message: 'Willi Hennig ficaria orgulhoso.',
  },
];

export function getLevelIndex(correct: number): number {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (correct >= LEVELS[i].threshold) idx = i;
  }
  return idx;
}

export function getLevel(correct: number): LevelInfo {
  return LEVELS[getLevelIndex(correct)];
}
