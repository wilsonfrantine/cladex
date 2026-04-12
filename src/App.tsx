import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Tutorial from './pages/Tutorial'
import Training from './pages/Training'
import Results from './pages/Results'
import TreeOfLife from './pages/TreeOfLife'
import SplashScreen from './components/SplashScreen'
import { useCladexStore } from './store'
import { audioManager } from './audio/manager'
import { fxManager } from './audio/fx'

type Page = 'home' | 'tutorial' | 'training' | 'results' | 'tree-of-life'

function App() {
  const [page, setPage]     = useState<Page>('home')
  const [module, setModule] = useState<string>('')
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashFading, setSplashFading]   = useState(false)
  const theme = useCladexStore((s) => s.theme)

  const dismissSplash = (withSound: boolean) => {
    if (withSound) {
      audioManager.play();          // gesto do usuário — libera autoplay
      fxManager.touch();            // inicializa AudioContext de FX no mesmo gesto
      const s = useCladexStore.getState();
      if (s.audioMuted) s.toggleAudioMuted();
      if (s.fxMuted)    s.toggleFxMuted();
      fxManager.intro();            // Zustand é síncrono — fxMuted já é false aqui
    }
    setSplashFading(true);
    setTimeout(() => setSplashVisible(false), 700);
  }

  // Hover global — registra uma vez, cobre todos os botões/links da app
  useEffect(() => { fxManager.hookGlobalHover(); }, [])

  // Troca a faixa conforme a página — sem iniciar áudio (gesto do usuário é obrigatório)
  useEffect(() => {
    audioManager.setTrack(page === 'training' ? 'training' : 'home');
  }, [page])

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.remove('dark')
      html.classList.add('theme-light')
    } else {
      html.classList.add('dark')
      html.classList.remove('theme-light')
    }
  }, [theme])

  const startTraining = (mod: string) => {
    setModule(mod)
    setPage('training')
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">
        {page === 'home' && (
          <Home
            onStartTraining={startTraining}
            onOpenTutorial={() => setPage('tutorial')}
            onOpenResults={() => setPage('results')}
            onOpenTree={() => setPage('tree-of-life')}
          />
        )}
        {page === 'tutorial' && (
          <Tutorial
            onBack={() => setPage('home')}
          />
        )}
        {page === 'training' && (
          <Training
            module={module}
            onBack={() => setPage('home')}
            onViewResults={() => setPage('results')}
          />
        )}
        {page === 'results' && (
          <Results onBack={() => setPage('home')} />
        )}
        {page === 'tree-of-life' && (
          <TreeOfLife onBack={() => setPage('home')} />
        )}
      </main>

      {/* Splash — cobre o conteúdo até o usuário interagir */}
      {splashVisible && (
        <SplashScreen
          theme={theme}
          fading={splashFading}
          onStart={() => dismissSplash(true)}
          onSkip={() => dismissSplash(false)}
        />
      )}
    </div>
  )
}

export default App
