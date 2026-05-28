import { useEffect } from 'react'
import { useStore } from '../stores/validationStore'
import { Catalog } from '../features/catalog/Catalog'
import { ValidationView } from '../features/validation/ValidationView'

function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
    }
  }, [setTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}

export function App() {
  const view = useStore((s) => s.view)

  return (
    <div className="app">
      <ThemeToggle />
      {view === 'catalog' ? <Catalog /> : <ValidationView />}
    </div>
  )
}
