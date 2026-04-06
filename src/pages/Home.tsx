import { Play, Zap, BookOpen, ChevronRight, Sun, Moon } from 'lucide-react'
import { useMemo, useState } from 'react'
import TreePulse from '../components/TreePulse'
import { useCladexStore } from '../store'

interface HomeProps {
  onStartTraining: (module: string) => void
  onOpenTutorial: () => void
}

// ── Módulos — ícone emoji como placeholder (equivalente web do rphylopic/PhyloPic)
// Para silhuetas científicas, integrar a API PhyloPic: https://api.phylopic.org
const modules = [
  {
    id: 'amniota',
    name: 'Amniota',
    sub: 'Mammalia · Reptilia · Aves · Amphibia',
    icon: '🦎',
  },
  {
    id: 'arthropoda',
    name: 'Arthropoda',
    sub: 'Chelicerata · Myriapoda · Crustacea · Insecta',
    icon: '🦋',
  },
  {
    id: 'annelida',
    name: 'Annelida',
    sub: 'Polychaeta · Oligochaeta · Hirudinea',
    icon: '🪱',
  },
  {
    id: 'chordata-basal',
    name: 'Chordata Basal',
    sub: 'Urochordata · Cephalochordata · Agnatha',
    icon: '🐟',
  },
  {
    id: 'metazoa',
    name: 'Metazoa',
    sub: 'Principais grupos',
    icon: '🌳',
  },
]

export default function Home({ onStartTraining, onOpenTutorial }: HomeProps) {
  const dailyMod = useMemo(() => modules.find(m => m.id === 'metazoa')!, [])
  const [modulesOpen, setModulesOpen] = useState(false)
  const { theme, toggleTheme } = useCladexStore()

  // Módulos do Treino Livre — Annelida e Chordata Basal
  const freeTrainingModules = useMemo(() => 
    modules.filter(m => ['annelida', 'chordata-basal'].includes(m.id)), []
  )

  return (
    <div className="relative h-dvh overflow-hidden flex flex-col">

      {/* ── Fundo animado ─────────────────────────────────────────────────── */}
      <div aria-hidden className="fixed inset-0 pointer-events-none select-none">
        <TreePulse theme={theme} />
      </div>

      {/* ── Botão de tema ─────────────────────────────────────────────────── */}
      <button
        onClick={toggleTheme}
        className="fixed top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 transition-colors backdrop-blur-sm"
        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
      </button>

      {/* ── Área de conteúdo (scroll interno sem barra visível) ──────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none flex flex-col">

        {/* Wordmark */}
        <div className="pt-10 pb-4 px-6 text-center select-none">
          <h1 className="text-[clamp(3.5rem,18vw,10rem)] font-black tracking-tighter leading-none text-zinc-100">
            CladeX
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600 mt-2">
            Filogenia · Biodiversidade
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-5 gap-3">

          {/* Tutorial — secundário, 25% mais alto */}
          <button
            onClick={onOpenTutorial}
            className="group w-full rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60 backdrop-blur-sm transition-colors duration-150 px-4 py-[0.85rem] text-left flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                Tutorial — conceitos básicos
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
          </button>

          {/* Escolher Grupo — primário, destaque esmeralda */}
          <button
            onClick={() => setModulesOpen(o => !o)}
            className="group w-full rounded-2xl bg-emerald-950/80 border border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-900/70 backdrop-blur-sm transition-colors duration-200 p-5 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1.5">
                  Escolher Grupo
                </span>
                <p className="text-xl font-bold text-zinc-100 leading-tight">
                  Treino livre
                </p>
                <p className="text-xs text-zinc-400 mt-1 truncate">
                  {freeTrainingModules.map(m => m.name).join(' · ')}
                </p>
              </div>
              <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors mt-0.5">
                <ChevronRight className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${modulesOpen ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          {/* Lista de módulos — expande abaixo de Escolher Grupo */}
          {modulesOpen && (
            <div className="flex flex-col gap-2 -mt-1">
              {freeTrainingModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => onStartTraining(mod.id)}
                  className="group w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-700/50 hover:bg-zinc-800/70 backdrop-blur-sm transition-colors duration-150 px-4 py-3.5 text-left flex items-center gap-3"
                >
                  <span className="text-xl leading-none shrink-0" role="img" aria-label={mod.name}>
                    {mod.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
                      {mod.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{mod.sub}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Desafio do Dia — primário, destaque índigo */}
          <button
            onClick={() => onStartTraining(dailyMod.id)}
            className="group w-full rounded-2xl bg-indigo-950/80 border border-indigo-700/50 hover:border-indigo-500 hover:bg-indigo-900/70 backdrop-blur-sm transition-colors duration-200 p-5 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    Desafio do Dia
                  </span>
                </div>
                <p className="text-xl font-bold text-zinc-100 leading-tight italic truncate">
                  {dailyMod.name}
                </p>
                <p className="text-xs text-zinc-400 mt-1 truncate">{dailyMod.sub}</p>
              </div>
              <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors mt-0.5">
                <Play className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Rodapé */}
        <div className="text-center py-4 px-4 mt-2">
          <p className="text-[10px] text-zinc-700 tracking-wide">
            CladeX · Laboratório de Zoologia
          </p>
        </div>
      </div>
    </div>
  )
}
