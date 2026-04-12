import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Tutorial from './pages/Tutorial'
import Training from './pages/Training'
import Results from './pages/Results'
import { useCladexStore } from './store'
import { audioManager } from './audio/manager'

type Page = 'home' | 'tutorial' | 'training' | 'results'

function App() {
  const [page, setPage]     = useState<Page>('home')
  const [module, setModule] = useState<string>('')
  const theme      = useCladexStore((s) => s.theme)
  const audioMuted = useCladexStore((s) => s.audioMuted)

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
      </main>
    </div>
  )
}

export default App
