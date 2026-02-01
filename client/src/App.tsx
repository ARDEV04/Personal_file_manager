import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { FileExplorer } from './components/file-explorer/FileExplorer'
import { useFileStore } from './stores/fileStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  const { theme } = useFileStore()
  
  useKeyboardShortcuts()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <FileExplorer />
        </main>
      </div>
    </div>
  )
}

export default App
