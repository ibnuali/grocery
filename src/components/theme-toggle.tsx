import React from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from '../hooks/use-theme'
import { Sun, Moon, Monitor } from 'lucide-react'

const labels: Record<string, string> = {
  light: 'Terang',
  dark: 'Gelap',
  system: 'Otomatis',
}

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]

    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(next)
      return
    }

    document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
  }

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      title={`Tema: ${labels[theme]} (klik untuk ganti)`}
      aria-label={`Tema: ${labels[theme]}`}
    >
      <Icon aria-hidden="true" />
      <span className="theme-toggle__label">{labels[theme]}</span>
    </button>
  )
}
