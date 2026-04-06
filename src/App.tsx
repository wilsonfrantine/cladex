import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Tutorial from './pages/Tutorial'
import Training from './pages/Training'

type Page = 'home' | 'tutorial' | 'training'

function App() {
  const [page, setPage]     = useState<Page>('home')
  const [module, setModule] = useState<string>('')

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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
          />
        )}
        {page === 'tutorial' && (
          <Tutorial
            onBack={() => setPage('home')}
            onStartTraining={startTraining}
          />
        )}
        {page === 'training' && (
          <Training
            module={module}
            onBack={() => setPage('home')}
          />
        )}
      </main>
    </div>
  )
}

export default App
