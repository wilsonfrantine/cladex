import { Play, Zap, BookOpen, ChevronRight } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import TreePulse from '../components/TreePulse'
import { useCladexStore } from '../store'
import SettingsPanel from '../components/SettingsPanel'
import { fxManager } from '../audio/fx'

const APP_URL = 'https://wilsonfrantine.github.io/cladex/'
const AUTHOR_URL = 'https://wilsonfrantine.github.io/'

async function shareApp() {
  const shareData = {
    title: 'CladeX',
    text: 'Treine Sistemática Filogenética com CladeX — clados, sinapomorfias e muito mais!',
    url: APP_URL,
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(APP_URL)
      alert('Link copiado para a área de transferência!')
    }
  } catch {
    // usuário cancelou
  }
}

interface HomeProps {
  onStartTraining: (module: string) => void
  onOpenTutorial: () => void
  onOpenResults: () => void
}

// ── Módulos — ícone emoji como placeholder (equivalente web do rphylopic/PhyloPic)
// Para silhuetas científicas, integrar a API PhyloPic: https://api.phylopic.org
const modules = [
  {
    id: 'amniota',
    name: 'Clado Amniota',
    sub: 'Mammalia · Reptilia · Aves · Amphibia',
    icon: '🦎',
  },
  {
    id: 'arthropoda',
    name: 'Filo Arthropoda',
    sub: 'Chelicerata · Myriapoda · Crustacea · Insecta',
    icon: '🦋',
  },
  {
    id: 'annelida',
    name: 'Filo Annelida',
    sub: 'Polychaeta · Oligochaeta · Hirudinea',
    icon: '🪱',
  },
  {
    id: 'chordata-basal',
    name: 'Filo Chordata Basal',
    sub: 'Urochordata · Cephalochordata · Agnatha',
    icon: '🐟',
  },
  {
    id: 'metazoa',
    name: 'Reino Metazoa',
    sub: 'Principais grupos',
    icon: '🌳',
  },
]

export default function Home({ onStartTraining, onOpenTutorial, onOpenResults }: HomeProps) {
  const dailyMod = useMemo(() => modules.find(m => m.id === 'metazoa')!, [])
  const [modulesOpen, setModulesOpen] = useState(false)
  const { theme } = useCladexStore()
  const [showStorageNotice, setShowStorageNotice] = useState(
    () => localStorage.getItem('seenStorageNotice') !== 'true'
  )

  // Som de abertura — sincroniza com a animação inicial da página
  useEffect(() => {
    const id = setTimeout(() => fxManager.intro(), 300)
    return () => clearTimeout(id)
  }, [])

  const dismissStorageNotice = () => {
    localStorage.setItem('seenStorageNotice', 'true')
    setShowStorageNotice(false)
  }

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

      {/* ── Configurações (canto superior direito) ────────────────────────── */}
      <div className="fixed top-3 right-3 z-20">
        <SettingsPanel showShare onShare={shareApp} showResults onResults={onOpenResults} />
      </div>

      {/* ── Área de conteúdo (scroll interno sem barra visível) ──────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none flex flex-col">

        {/* Wordmark */}
        <div className="pt-10 pb-6 px-6 text-center select-none">
          <h1 className={`text-[clamp(3.5rem,18vw,8rem)] font-black tracking-tighter leading-none ${theme === 'light' ? 'text-zinc-200' : 'text-zinc-100'}`}>
            Clade<span className="text-emerald-500">X</span>
          </h1>
          <p className={`text-xs uppercase tracking-[0.25em] mt-3 font-semibold ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-500'}`}>
            Filogenia · Biodiversidade
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-5 gap-4">

          {/* Tutorial — Estilo Glassmorphism secundário */}
          <button
            onClick={onOpenTutorial}
            onMouseEnter={() => fxManager.hover()}
            className="btn-juicy group w-full rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/40 backdrop-blur-md transition-all duration-300 px-4 py-4 text-left flex items-center gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                Tutorial de Conceitos
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Fundamentos da Sistemática</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Escolher Grupo — Estilo Cyber-Emerald */}
          <button
            onClick={() => setModulesOpen(o => !o)}
            onMouseEnter={() => fxManager.hover()}
            className="btn-juicy group w-full rounded-3xl bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-900/40 backdrop-blur-xl transition-all duration-500 p-6 text-left relative overflow-hidden"
          >
            {/* Efeito de luz interna */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                    Módulos Ativos
                  </span>
                </div>
                <p className="text-2xl font-black text-zinc-100 tracking-tight leading-none">
                  Treino Livre
                </p>
                <p className="text-xs text-emerald-400/60 mt-2 font-medium">
                  {freeTrainingModules.length} Categorias Disponíveis
                </p>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all group-hover:rotate-6">
                <ChevronRight className={`w-5 h-5 text-emerald-400 transition-transform duration-500 ${modulesOpen ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          {/* Lista de módulos — Expansão com staggered animation feel */}
          {modulesOpen && (
            <div className="flex flex-col gap-2.5 -mt-1 px-1">
              {freeTrainingModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => { fxManager.click(); onStartTraining(mod.id); }}
                  onMouseEnter={() => fxManager.hover()}
                  className="btn-juicy group w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-emerald-950/20 backdrop-blur-md transition-all duration-200 px-5 py-4 text-left flex items-center gap-4"
                >
                  <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-125" role="img" aria-label={mod.name}>
                    {mod.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      {mod.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-mono opacity-80">{mod.sub}</p>
                  </div>
                  <Play className="w-4 h-4 text-zinc-700 group-hover:text-emerald-400 group-hover:fill-emerald-400/20 shrink-0 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* Desafio do Dia — Estilo Neon-Indigo */}
          <button
            onClick={() => { fxManager.click(); onStartTraining(dailyMod.id); }}
            onMouseEnter={() => fxManager.hover()}
            className="btn-juicy group w-full rounded-3xl bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-900/40 backdrop-blur-xl transition-all duration-500 p-6 text-left relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">
                    Daily Challenge
                  </span>
                </div>
                <p className="text-2xl font-black text-zinc-100 tracking-tight italic leading-none">
                  {dailyMod.name}
                </p>
                <p className="text-xs text-indigo-400/60 mt-2 font-medium">Reset em 14h 22m</p>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all group-hover:scale-110">
                <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/10 ml-0.5" />
              </div>
            </div>
          </button>
        </div>

        {showStorageNotice && (
          <div className="mx-5 mb-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 flex items-start gap-3">
            <p className="flex-1 text-xs text-zinc-400 leading-relaxed">
              Seu progresso fica salvo apenas neste navegador. Limpar os dados do navegador, usar outro dispositivo ou trocar de navegador apagará seu histórico.
            </p>
            <button
              onClick={dismissStorageNotice}
              className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
              aria-label="Dispensar aviso"
            >
              ✕
            </button>
          </div>
        )}

        <div className="text-center py-4 px-4 mt-2">
          <p className="text-[10px] text-zinc-700 tracking-wide">
            CladeX · Laboratório de Zoologia
          </p>
          <p className="text-[10px] text-zinc-700 tracking-wide mt-0.5">
            developed by{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors">
              @wfrantine
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
